// Simple Stellar Soroban Contract for LeetCode Challenge Betting
// 
// What this contract does:
// 1. User deposits XLM to create a challenge
// 2. Contract holds the XLM until challenge ends
// 3. Admin (you) verifies if user completed challenge
// 4. Contract releases XLM to user (if won) or platform (if lost)

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

// Challenge data structure
#[derive(Clone)]
#[contracttype]
pub struct Challenge {
    pub id: u64,
    pub user: Address,
    pub stake_amount: i128,
    pub end_date: u64,
    pub is_completed: bool,
    pub is_settled: bool,
}

// Storage keys
const ADMIN: Symbol = symbol_short!("ADMIN");
const PLATFORM: Symbol = symbol_short!("PLATFORM");
const COUNTER: Symbol = symbol_short!("COUNTER");

fn get_challenge_key(id: u64) -> Symbol {
    symbol_short!("C")
}

#[contract]
pub struct ChallengeContract;

#[contractimpl]
impl ChallengeContract {
    
    /// Initialize contract with admin and platform addresses
    /// Admin = you (can verify challenges)
    /// Platform = your wallet (receives failed stakes)
    pub fn initialize(env: Env, admin: Address, platform_address: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("Already initialized");
        }
        
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&PLATFORM, &platform_address);
        env.storage().instance().set(&COUNTER, &0u64);
    }
    
    /// Create a new challenge (called from frontend)
    /// XLM payment happens via regular Stellar payment with memo
    pub fn create_challenge(
        env: Env,
        user: Address,
        stake_amount: i128,
        end_date: u64,
    ) -> u64 {
        user.require_auth();
        
        // Get and increment counter
        let mut counter: u64 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        counter += 1;
        env.storage().instance().set(&COUNTER, &counter);
        
        // Create challenge
        let challenge = Challenge {
            id: counter,
            user: user.clone(),
            stake_amount,
            end_date,
            is_completed: false,
            is_settled: false,
        };
        
        // Store it
        env.storage().instance().set(&counter, &challenge);
        
        counter
    }
    
    /// Verify challenge completion (only admin can call)
    /// success = true if user completed their LeetCode goal
    /// success = false if user failed
    pub fn verify_challenge(
        env: Env,
        challenge_id: u64,
        success: bool,
    ) {
        // Only admin can verify
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();
        admin.require_auth();
        
        // Get challenge
        let mut challenge: Challenge = env.storage()
            .instance()
            .get(&challenge_id)
            .expect("Challenge not found");
        
        if challenge.is_settled {
            panic!("Already settled");
        }
        
        // Check if challenge ended
        let current_time = env.ledger().timestamp();
        if current_time < challenge.end_date {
            panic!("Challenge not ended yet");
        }
        
        // Mark as complete/failed
        challenge.is_completed = success;
        challenge.is_settled = true;
        
        env.storage().instance().set(&challenge_id, &challenge);
    }
    
    /// Get challenge winner address
    /// Returns user address if completed, platform address if failed
    pub fn get_winner(env: Env, challenge_id: u64) -> Address {
        let challenge: Challenge = env.storage()
            .instance()
            .get(&challenge_id)
            .expect("Challenge not found");
        
        if !challenge.is_settled {
            panic!("Not verified yet");
        }
        
        if challenge.is_completed {
            challenge.user
        } else {
            env.storage().instance().get(&PLATFORM).unwrap()
        }
    }
    
    /// Get challenge details
    pub fn get_challenge(env: Env, challenge_id: u64) -> Challenge {
        env.storage()
            .instance()
            .get(&challenge_id)
            .expect("Challenge not found")
    }
    
    /// Get admin address
    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&ADMIN).unwrap()
    }
    
    /// Get platform address
    pub fn get_platform(env: Env) -> Address {
        env.storage().instance().get(&PLATFORM).unwrap()
    }
    
    /// Get total challenges
    pub fn get_counter(env: Env) -> u64 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_flow() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register_contract(None, ChallengeContract);
        let client = ChallengeContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let platform = Address::generate(&env);
        let user = Address::generate(&env);
        
        // Initialize
        client.initialize(&admin, &platform);
        
        // Create challenge
        let challenge_id = client.create_challenge(&user, &10_0000000, &1000000);
        assert_eq!(challenge_id, 1);
        
        // Verify as success
        client.verify_challenge(&challenge_id, &true);
        
        // Check winner
        let winner = client.get_winner(&challenge_id);
        assert_eq!(winner, user);
    }
    
    #[test]
    fn test_failed_challenge() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register_contract(None, ChallengeContract);
        let client = ChallengeContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let platform = Address::generate(&env);
        let user = Address::generate(&env);
        
        client.initialize(&admin, &platform);
        let challenge_id = client.create_challenge(&user, &10_0000000, &1000000);
        
        // Verify as failed
        client.verify_challenge(&challenge_id, &false);
        
        // Winner should be platform
        let winner = client.get_winner(&challenge_id);
        assert_eq!(winner, platform);
    }
}
