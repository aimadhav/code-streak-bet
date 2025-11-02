# Stellar Contract Deployment Guide

## Contract Built Successfully! ✅

Location: `target/wasm32-unknown-unknown/release/leetcode_challenge_contract.wasm`

---

## What This Contract Does

### Simple Flow:
1. **User creates challenge** → Sends XLM to contract
2. **Contract holds XLM** → Until challenge end date
3. **You verify completion** → Call `verify_challenge(id, true/false)`
4. **Contract releases funds** → To user (if won) or platform (if failed)

---

## Deploy to Testnet

### Step 1: Install Contract

```powershell
cd contracts

# Deploy to testnet
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/leetcode_challenge_contract.wasm `
  --source YOUR_SECRET_KEY `
  --network testnet
```

This will output a contract ID like:
```
CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 2: Initialize Contract

```powershell
stellar contract invoke `
  --id CONTRACT_ID_FROM_STEP_1 `
  --source YOUR_SECRET_KEY `
  --network testnet `
  -- initialize `
  --admin YOUR_PUBLIC_KEY `
  --platform_address YOUR_PUBLIC_KEY
```

---

## Usage Flow

### From Frontend (User Creates Challenge):

1. User fills form
2. Frontend calls contract:
```typescript
// In stellar.ts
const result = await contract.create_challenge({
  user: userPublicKey,
  stake_amount: BigInt(10_0000000), // 10 XLM
  end_date: BigInt(Date.now() + 7*24*60*60*1000) // 7 days
});
// Returns: challenge_id (e.g., 1, 2, 3...)
```

3. User signs transaction in Freighter
4. XLM is locked in contract

### From Backend (You Verify):

After challenge ends, check LeetCode API, then:

```typescript
// If user completed challenge
await contract.verify_challenge({
  challenge_id: 1,
  success: true // User wins, gets XLM back
});

// If user failed challenge
await contract.verify_challenge({
  challenge_id: 1,
  success: false // You get the XLM
});
```

### Check Winner:

```typescript
const winner = await contract.get_winner({
  challenge_id: 1
});
// Returns user address or platform address
```

---

## Contract Functions

| Function | Who Can Call | Purpose |
|----------|--------------|---------|
| `initialize` | Anyone (once) | Set admin and platform addresses |
| `create_challenge` | Any user | Lock XLM for challenge |
| `verify_challenge` | Admin only | Mark challenge as success/fail |
| `get_winner` | Anyone | Get who should receive XLM |
| `get_challenge` | Anyone | Get challenge details |
| `get_admin` | Anyone | Get admin address |
| `get_platform` | Anyone | Get platform address |
| `get_counter` | Anyone | Get total challenges |

---

## Quick Test

```powershell
# After deploying and initializing...

# Create a test challenge
stellar contract invoke `
  --id YOUR_CONTRACT_ID `
  --source TEST_USER_SECRET `
  --network testnet `
  -- create_challenge `
  --user TEST_USER_PUBLIC_KEY `
  --stake_amount 10000000 `
  --end_date 9999999999

# Verify it (as admin)
stellar contract invoke `
  --id YOUR_CONTRACT_ID `
  --source YOUR_SECRET_KEY `
  --network testnet `
  -- verify_challenge `
  --challenge_id 1 `
  --success true

# Check winner
stellar contract invoke `
  --id YOUR_CONTRACT_ID `
  --source YOUR_SECRET_KEY `
  --network testnet `
  -- get_winner `
  --challenge_id 1
```

---

## Integration with Frontend

Update `src/lib/stellar.ts`:

```typescript
import * as StellarSDK from 'stellar-sdk';

const CONTRACT_ID = 'CXXXXXXXXX...'; // From deployment

// Create challenge
export async function createChallenge(
  userPublicKey: string,
  stakeAmount: string,
  endDate: Date
) {
  const contract = new StellarSDK.Contract(CONTRACT_ID);
  
  const tx = new StellarSDK.TransactionBuilder(account, {...})
    .addOperation(
      contract.call(
        'create_challenge',
        StellarSDK.Address.fromString(userPublicKey),
        StellarSDK.nativeToScVal(parseFloat(stakeAmount), {type: 'i128'}),
        StellarSDK.nativeToScVal(Math.floor(endDate.getTime() / 1000), {type: 'u64'})
      )
    )
    .build();
    
  // Sign with Freighter
  const signed = await freighterApi.signTransaction(tx.toXDR());
  const result = await server.submitTransaction(signed);
  
  return result;
}
```

---

## Next Steps

1. ✅ Contract built successfully
2. [ ] Deploy to testnet
3. [ ] Initialize with your address
4. [ ] Update frontend with contract ID
5. [ ] Test create challenge
6. [ ] Test verify challenge
7. [ ] Deploy to mainnet (when ready)

---

## Files

- **Contract**: `contracts/src/lib.rs`
- **WASM**: `contracts/target/wasm32-unknown-unknown/release/leetcode_challenge_contract.wasm`
- **Integration**: Update `src/lib/stellar.ts` with contract ID

---

## Support

Contract is simple and focused:
- ✅ Locks XLM
- ✅ Stores challenge data
- ✅ Admin verifies
- ✅ Releases to winner

No complex features = Less gas, less bugs, easier to test!
