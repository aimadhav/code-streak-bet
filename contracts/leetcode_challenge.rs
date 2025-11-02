// Stellar Soroban Smart Contract for LeetCode Challenge Betting
// 
// This contract manages:
// - User stake deposits in XLM
// - Challenge state (active, completed, failed)
// - Automatic verification and payout based on LeetCode API results
// - Platform fee distribution

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
pub enum ChallengeStatus {
    Active,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Clone)]
#[contracttype]
pub enum GoalType {
    Daily,
    Weekly,
    Custom,
}

#[derive(Clone)]
#[contracttype]
pub struct Challenge {
    pub id: String,
    pub user: Address,
    pub leetcode_username: String,
    pub goal_type: GoalType,
    pub target_count: u32,
    pub daily_questions: u32,
    pub weekly_questions: u32,
    pub weeks: u32,
    pub stake_amount: i128,
    pub start_date: u64,
    pub end_date: u64,
    pub status: ChallengeStatus,
    pub current_progress: u32,
}

#[derive(Clone)]
#[contracttype]
pub struct ContractConfig {
    pub admin: Address,
    pub platform_fee_address: Address,
    pub platform_fee_percent: u32, // Percentage as basis points (e.g., 500 = 5%)
    pub xlm_token: Address,
}

const CHALLENGES: &str = "CHALLENGES";
const CONFIG: &str = "CONFIG";
const CHALLENGE_COUNT: &str = "CHALLENGE_COUNT";

#[contract]
pub struct LeetCodeChallengeContract;

#[contractimpl]
impl LeetCodeChallengeContract {
    /// Initialize the contract with admin and configuration
    pub fn initialize(
        env: Env,
        admin: Address,
        platform_fee_address: Address,
        platform_fee_percent: u32,
        xlm_token: Address,
    ) {
        if env.storage().instance().has(&CONFIG) {
            panic!("Contract already initialized");
        }

        let config = ContractConfig {
            admin: admin.clone(),
            platform_fee_address,
            platform_fee_percent,
            xlm_token,
        };

        env.storage().instance().set(&CONFIG, &config);
        env.storage().instance().set(&CHALLENGE_COUNT, &0u64);
    }

    /// Create a new challenge and stake XLM
    pub fn create_challenge(
        env: Env,
        user: Address,
        leetcode_username: String,
        goal_type: GoalType,
        target_count: u32,
        daily_questions: u32,
        weekly_questions: u32,
        weeks: u32,
        stake_amount: i128,
        start_date: u64,
        end_date: u64,
    ) -> String {
        user.require_auth();

        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        
        // Validate inputs
        if stake_amount <= 0 {
            panic!("Stake amount must be positive");
        }
        if end_date <= start_date {
            panic!("End date must be after start date");
        }
        if target_count == 0 {
            panic!("Target count must be greater than 0");
        }

        // Transfer XLM from user to contract
        let token_client = token::Client::new(&env, &config.xlm_token);
        token_client.transfer(&user, &env.current_contract_address(), &stake_amount);

        // Generate challenge ID
        let mut count: u64 = env.storage().instance().get(&CHALLENGE_COUNT).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&CHALLENGE_COUNT, &count);
        
        let challenge_id = String::from_slice(&env, &format!("challenge_{}", count));

        // Create challenge
        let challenge = Challenge {
            id: challenge_id.clone(),
            user: user.clone(),
            leetcode_username,
            goal_type,
            target_count,
            daily_questions,
            weekly_questions,
            weeks,
            stake_amount,
            start_date,
            end_date,
            status: ChallengeStatus::Active,
            current_progress: 0,
        };

        // Store challenge
        env.storage().instance().set(&challenge_id, &challenge);

        challenge_id
    }

    /// Update challenge progress (called by oracle or authorized updater)
    pub fn update_progress(
        env: Env,
        challenge_id: String,
        current_progress: u32,
    ) {
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        config.admin.require_auth();

        let mut challenge: Challenge = env
            .storage()
            .instance()
            .get(&challenge_id)
            .expect("Challenge not found");

        if !matches!(challenge.status, ChallengeStatus::Active) {
            panic!("Challenge is not active");
        }

        challenge.current_progress = current_progress;
        env.storage().instance().set(&challenge_id, &challenge);
    }

    /// Complete a challenge - verify and payout
    pub fn complete_challenge(
        env: Env,
        challenge_id: String,
        verification_success: bool,
    ) {
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        config.admin.require_auth();

        let mut challenge: Challenge = env
            .storage()
            .instance()
            .get(&challenge_id)
            .expect("Challenge not found");

        if !matches!(challenge.status, ChallengeStatus::Active) {
            panic!("Challenge is not active");
        }

        let current_time = env.ledger().timestamp();
        if current_time < challenge.end_date {
            panic!("Challenge period has not ended yet");
        }

        let token_client = token::Client::new(&env, &config.xlm_token);

        if verification_success && challenge.current_progress >= challenge.target_count {
            // User succeeded - return stake
            challenge.status = ChallengeStatus::Completed;
            
            token_client.transfer(
                &env.current_contract_address(),
                &challenge.user,
                &challenge.stake_amount,
            );
        } else {
            // User failed - transfer to platform fee address
            challenge.status = ChallengeStatus::Failed;
            
            token_client.transfer(
                &env.current_contract_address(),
                &config.platform_fee_address,
                &challenge.stake_amount,
            );
        }

        env.storage().instance().set(&challenge_id, &challenge);
    }

    /// Cancel a challenge (only before start date)
    pub fn cancel_challenge(env: Env, challenge_id: String) {
        let mut challenge: Challenge = env
            .storage()
            .instance()
            .get(&challenge_id)
            .expect("Challenge not found");

        challenge.user.require_auth();

        if !matches!(challenge.status, ChallengeStatus::Active) {
            panic!("Challenge is not active");
        }

        let current_time = env.ledger().timestamp();
        if current_time >= challenge.start_date {
            panic!("Cannot cancel after challenge has started");
        }

        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        let token_client = token::Client::new(&env, &config.xlm_token);

        // Return stake to user
        token_client.transfer(
            &env.current_contract_address(),
            &challenge.user,
            &challenge.stake_amount,
        );

        challenge.status = ChallengeStatus::Cancelled;
        env.storage().instance().set(&challenge_id, &challenge);
    }

    /// Get challenge details
    pub fn get_challenge(env: Env, challenge_id: String) -> Challenge {
        env.storage()
            .instance()
            .get(&challenge_id)
            .expect("Challenge not found")
    }

    /// Get contract configuration
    pub fn get_config(env: Env) -> ContractConfig {
        env.storage()
            .instance()
            .get(&CONFIG)
            .expect("Contract not initialized")
    }

    /// Update platform fee (admin only)
    pub fn update_fee(env: Env, new_fee_percent: u32) {
        let mut config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        config.admin.require_auth();

        if new_fee_percent > 10000 {
            panic!("Fee percent cannot exceed 100%");
        }

        config.platform_fee_percent = new_fee_percent;
        env.storage().instance().set(&CONFIG, &config);
    }

    /// Emergency withdraw (admin only, for upgrades or emergencies)
    pub fn emergency_withdraw(env: Env, recipient: Address, amount: i128) {
        let config: ContractConfig = env.storage().instance().get(&CONFIG).unwrap();
        config.admin.require_auth();

        let token_client = token::Client::new(&env, &config.xlm_token);
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_create_challenge() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LeetCodeChallengeContract);
        let client = LeetCodeChallengeContractClient::new(&env, &contract_id);

        let admin = Address::random(&env);
        let platform_fee = Address::random(&env);
        let xlm_token = Address::random(&env);
        let user = Address::random(&env);

        // Initialize contract
        client.initialize(&admin, &platform_fee, &500, &xlm_token);

        // Create challenge
        let challenge_id = client.create_challenge(
            &user,
            &String::from_slice(&env, "test_user"),
            &GoalType::Daily,
            &14,
            &1,
            &0,
            &0,
            &10_0000000, // 10 XLM
            &0,
            &1000000,
        );

        // Verify challenge was created
        let challenge = client.get_challenge(&challenge_id);
        assert_eq!(challenge.target_count, 14);
        assert_eq!(challenge.stake_amount, 10_0000000);
    }
}
