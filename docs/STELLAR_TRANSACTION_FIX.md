# Stellar Transaction Fix

## Issues Fixed

### 1. Invalid Timebounds
**Problem**: Transactions were using `timebounds: { minTime: 0, maxTime: 0 }` which is invalid.

**Solution**: Removed invalid timebounds and used `.setTimeout(180)` instead (3 minutes timeout).

### 2. Amount Format
**Problem**: Was converting XLM to stroops, but Stellar SDK expects string amounts.

**Solution**: Pass `stakeAmount` directly as a string to the Payment operation.

## Changes Made

### `src/lib/stellar.ts`

1. **createChallengeTransaction**:
   ```typescript
   // BEFORE
   timebounds: { minTime: 0, maxTime: 0 },
   .setTimeout(TimeoutInfinite)
   amount: amountInStroops.toString()
   
   // AFTER
   // removed timebounds
   .setTimeout(180) // 3 minutes
   amount: stakeAmount // string amount directly
   ```

2. **completeChallenge**:
   ```typescript
   // BEFORE
   timebounds: { minTime: 0, maxTime: 0 },
   .setTimeout(TimeoutInfinite)
   
   // AFTER
   .setTimeout(180)
   ```

3. **failChallenge**:
   ```typescript
   // BEFORE
   timebounds: { minTime: 0, maxTime: 0 },
   .setTimeout(TimeoutInfinite)
   
   // AFTER
   .setTimeout(180)
   ```

4. **Removed unused import**: `TimeoutInfinite`

## How Transactions Work Now

### Challenge Creation Flow

1. User fills out form with:
   - LeetCode username (verified via API)
   - Stake amount (XLM)
   - Goal type (daily/weekly/custom)
   - Target count

2. Click "Create Challenge"

3. `createChallengeTransaction()` builds transaction:
   ```typescript
   - Memo: "CHALLENGE:{challengeId}"
   - Operation: Payment to contract address
   - Amount: stake amount in XLM (string)
   - Timeout: 180 seconds
   ```

4. Freighter wallet popup opens for signing

5. User approves transaction

6. Transaction submitted to Stellar network

7. Challenge saved to local storage

8. Progress monitoring starts automatically

## Testing

### Verify the Fix

1. **Connect Freighter Wallet**
   - Click "Connect Wallet"
   - Approve in Freighter

2. **Verify LeetCode Username**
   - Enter username
   - Click "Verify"
   - Should show ✓ Verified

3. **Create Challenge**
   - Set stake amount: `10` XLM
   - Choose goal type
   - Click "Create Challenge"
   - **Freighter should now open!**

4. **Approve Transaction**
   - Review in Freighter
   - Click "Approve"
   - Wait for confirmation

### Check Transaction

View on Stellar Explorer:
```
Testnet: https://stellar.expert/explorer/testnet/tx/{hash}
```

## Important Notes

### Contract Address Setup

The contract address needs to be funded on testnet:

```typescript
CHALLENGE_CONTRACT_ADDRESS = 'GCDKZMXVQB7BZS7PZBEGGV3BVVVGLU5UKLVVNFS4KFVD7V3L7YDHNH66'
```

**Fund it at**: https://laboratory.stellar.org/#account-creator?network=test

### Memo Format

Challenges are tracked by memo:
- Create: `CHALLENGE:{id}`
- Complete: `COMPLETE:{id}`
- Fail: `FAIL:{id}`

### Amount Format

Stellar SDK requires string amounts in XLM:
- ✅ Correct: `"10.5"` (10.5 XLM)
- ❌ Wrong: `105000000` (stroops)

## Status

✅ **Transaction timebounds fixed**  
✅ **Amount format corrected**  
✅ **Freighter should now open properly**  
✅ **All transaction builders updated**  

## Next Steps

1. Test challenge creation
2. Verify transaction on Stellar Explorer
3. Ensure contract address is funded
4. Test progress monitoring
