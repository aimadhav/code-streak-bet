# LeetCode Challenge Betting Smart Contract

This directory contains the Stellar Soroban smart contract for the LeetCode Challenge Betting application.

## Overview

The smart contract manages:
- **Stake Deposits**: Users lock XLM tokens when creating a challenge
- **Challenge State**: Tracks active, completed, failed, and cancelled challenges
- **Automatic Verification**: Integrates with LeetCode API for progress tracking
- **Payouts**: Returns stakes on success, forfeits to platform on failure

## Smart Contract Structure

### Key Data Structures

```rust
pub struct Challenge {
    pub id: String,
    pub user: Address,
    pub leetcode_username: String,
    pub goal_type: GoalType,
    pub target_count: u32,
    pub stake_amount: i128,
    pub start_date: u64,
    pub end_date: u64,
    pub status: ChallengeStatus,
    pub current_progress: u32,
}
```

### Main Functions

1. **initialize()** - Set up contract with admin and fee configuration
2. **create_challenge()** - User creates a new challenge and stakes XLM
3. **update_progress()** - Oracle updates challenge progress from LeetCode API
4. **complete_challenge()** - Verify and distribute funds based on results
5. **cancel_challenge()** - Cancel before start (refunds stake)

## Prerequisites

To deploy and interact with this contract, you need:

1. **Rust and Cargo**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Soroban CLI**
   ```bash
   cargo install --locked soroban-cli
   ```

3. **Stellar Account**
   - Create a Stellar testnet account at [Stellar Laboratory](https://laboratory.stellar.org/)
   - Fund it using the [Friendbot](https://friendbot.stellar.org/)

## Building the Contract

```bash
# Navigate to contracts directory
cd contracts

# Build the contract
soroban contract build

# The compiled WASM will be in target/wasm32-unknown-unknown/release/
```

## Deploying to Stellar Testnet

### 1. Configure Stellar CLI for Testnet

```bash
# Add testnet network
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Create an identity (or import existing)
soroban keys generate --network testnet deployer
```

### 2. Deploy the Contract

```bash
# Deploy the contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/leetcode_challenge.wasm \
  --source deployer \
  --network testnet

# This will return a CONTRACT_ID - save it!
```

### 3. Initialize the Contract

```bash
# Initialize with your admin address and configuration
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN_PUBLIC_KEY> \
  --platform_fee_address <PLATFORM_FEE_PUBLIC_KEY> \
  --platform_fee_percent 500 \
  --xlm_token <XLM_TOKEN_ADDRESS>
```

## Integration with Frontend

Update your `.env` file:

```env
VITE_CHALLENGE_CONTRACT_ADDRESS=<YOUR_CONTRACT_ID>
VITE_PLATFORM_FEE_ADDRESS=<YOUR_FEE_ADDRESS>
VITE_STELLAR_NETWORK=testnet
```

## Testing the Contract

```bash
# Run contract tests
cargo test

# Run specific test
cargo test test_create_challenge
```

## Contract Interactions

### Creating a Challenge

```typescript
// Frontend code example
import { createChallengeTransaction } from '@/lib/stellar';

const xdr = await createChallengeTransaction(
  userPublicKey,
  "10", // 10 XLM stake
  challengeId,
  {
    targetCount: 14,
    endDate: "2025-12-31",
    goalType: "daily",
  }
);

// Sign with Freighter wallet
const txHash = await freighterApi.signTransaction(xdr);
```

### Verifying Challenge Completion

The backend/oracle service should periodically:

1. Fetch active challenges from the contract
2. Query LeetCode API for user progress
3. Call `update_progress()` to update on-chain state
4. Call `complete_challenge()` when challenge period ends

```typescript
import { verifyChallengeCompletion } from '@/lib/leetcode-api';

const result = await verifyChallengeCompletion(
  leetcodeUsername,
  challengeData
);

// Update smart contract
await updateChallengeProgress(challengeId, result.currentProgress);

// Complete challenge if period ended
if (isPastEndDate) {
  await completeChallenge(challengeId, result.completed);
}
```

## Oracle Service

For production, you'll need an oracle service that:

1. Monitors active challenges
2. Fetches LeetCode data via the API
3. Updates contract state
4. Triggers payouts when challenges complete

Example oracle implementation:

```typescript
// oracle/index.ts
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  const activeChallenges = await getActiveChallenges();
  
  for (const challenge of activeChallenges) {
    const progress = await getLeetCodeProgress(challenge.username);
    await updateContractProgress(challenge.id, progress);
    
    if (new Date() > new Date(challenge.endDate)) {
      const verified = await verifyChallengeCompletion(challenge);
      await completeContractChallenge(challenge.id, verified.completed);
    }
  }
});
```

## Security Considerations

1. **Oracle Trust**: The oracle that calls `update_progress()` must be trusted
2. **Admin Key**: Keep admin private key secure - it controls emergency functions
3. **Fee Limits**: Platform fee is capped at 100% (10000 basis points)
4. **Time Validation**: Contract validates start/end dates
5. **Authorization**: All sensitive operations require proper authentication

## Upgrading the Contract

Stellar smart contracts are immutable once deployed. To upgrade:

1. Deploy new contract version
2. Migrate data (if needed)
3. Update frontend to use new contract address
4. Use `emergency_withdraw()` to move funds from old contract

## Monitoring

Monitor your contract:
- View transactions: https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
- Check balances and operations
- Track challenge creation and completion events

## Support

For issues or questions:
- Stellar Discord: https://discord.gg/stellar
- Soroban Docs: https://soroban.stellar.org/docs
- LeetCode API: https://github.com/noworneverev/leetcode-api

## License

MIT License - See LICENSE file for details
