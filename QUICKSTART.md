# Quick Start Guide 🚀

Get your LeetCode Challenge Betting app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Freighter wallet extension
- LeetCode account

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Set Up Environment (30 sec)

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add (for testnet):
# VITE_STELLAR_NETWORK=testnet
# VITE_CHALLENGE_CONTRACT_ADDRESS=<will get after deploying contract>
# VITE_PLATFORM_FEE_ADDRESS=<your wallet address>
```

## Step 3: Start Development Server (30 sec)

```bash
npm run dev
```

Open http://localhost:5173 in your browser!

## Step 4: Set Up Freighter Wallet (2 min)

1. Install Freighter from [freighter.app](https://freighter.app)
2. Create a new wallet
3. **Save your recovery phrase!**
4. Switch to Testnet:
   - Open Freighter
   - Settings → Network → Test Net

## Step 5: Get Testnet XLM (1 min)

1. Copy your wallet address from Freighter
2. Visit https://friendbot.stellar.org/
3. Paste your address and click "Fund Account"
4. You'll get 10,000 testnet XLM!

## Step 6: Connect & Test (1 min)

1. In the app, click "Connect Wallet"
2. Approve in Freighter popup
3. Enter your LeetCode username
4. Click "Verify"
5. Create a test challenge!

---

## 🎉 You're Ready!

Your app is now running with:
- ✅ Freighter wallet connected
- ✅ Testnet XLM in wallet
- ✅ LeetCode API integrated
- ✅ Ready to create challenges

## Next Steps

### For Testing
- Create a small challenge (1 XLM stake)
- Solve some LeetCode problems
- Watch progress update
- Let challenge complete

### For Production

1. **Deploy Smart Contract** (see `contracts/README.md`)
   ```bash
   cd contracts
   cargo build --release
   soroban contract deploy --wasm target/wasm32-unknown-unknown/release/leetcode_challenge.wasm
   ```

2. **Update .env with Contract Address**
   ```env
   VITE_CHALLENGE_CONTRACT_ADDRESS=<deployed_contract_id>
   ```

3. **Switch to Mainnet** (when ready for real money!)
   ```env
   VITE_STELLAR_NETWORK=mainnet
   ```

4. **Deploy Frontend**
   ```bash
   npm run build
   vercel deploy
   # or
   netlify deploy
   ```

## Troubleshooting

### Wallet Won't Connect?
- Refresh page
- Make sure Freighter is unlocked
- Check you're on correct network (testnet)

### LeetCode Username Not Verifying?
- Check spelling
- Make sure profile is public
- Try again in a few seconds

### Transaction Failing?
- Check you have enough XLM balance (need 2+ XLM)
- Verify you're on testnet
- Try refreshing and reconnecting wallet

### App Not Loading?
```bash
# Clear and reinstall
rm -rf node_modules
npm install
npm run dev
```

## Common Issues

**Q: Where's my challenge data?**
A: Currently stored in localStorage. Check browser DevTools → Application → Local Storage

**Q: Can I use real money?**
A: Yes, but ONLY after:
1. Deploying smart contract to mainnet
2. Thoroughly testing on testnet
3. Understanding you can lose your stake!

**Q: How do I track progress?**
A: Progress is tracked via LeetCode API. Just solve problems on LeetCode and check back!

## Need Help?

- 📖 Read full docs: `README.md`
- 🔐 Wallet setup: `docs/FREIGHTER_SETUP.md`
- 💾 Smart contract: `contracts/README.md`
- 📊 Implementation details: `docs/IMPLEMENTATION_SUMMARY.md`

## Test Challenge Ideas

1. **Easy Start**: 1 question/day for 3 days (0.5 XLM)
2. **Weekly Goal**: 5 questions/week for 2 weeks (2 XLM)
3. **Custom**: 10 questions in 7 days (5 XLM)

Start small, test the flow, then scale up!

---

**Happy Coding! 💻✨**

Remember: On testnet, XLM has no real value. Test freely!
