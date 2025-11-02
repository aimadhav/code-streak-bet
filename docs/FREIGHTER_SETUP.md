# Freighter Wallet Setup Guide

This guide will help you set up Freighter wallet to use with the LeetCode Challenge Betting app.

## What is Freighter?

Freighter is a browser extension wallet for the Stellar blockchain. It allows you to:
- Store and manage XLM (Stellar Lumens)
- Connect to Stellar dApps
- Sign transactions securely
- Switch between testnet and mainnet

## Installation

### 1. Install Browser Extension

**Chrome/Brave/Edge:**
- Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk)
- Click "Add to Chrome/Brave/Edge"

**Firefox:**
- Visit [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/freighter/)
- Click "Add to Firefox"

### 2. Create a New Wallet

1. Click the Freighter icon in your browser toolbar
2. Click "Create a new wallet"
3. **IMPORTANT**: Write down your 12-word recovery phrase
   - Store it in a safe place
   - Never share it with anyone
   - You'll need it to recover your wallet
4. Confirm your recovery phrase
5. Create a password for quick access
6. Your wallet is ready! 🎉

## Get Testnet XLM (For Development)

### Using Friendbot

1. Open Freighter and copy your public key
2. Visit [Stellar Friendbot](https://friendbot.stellar.org/)
3. Paste your public key
4. Click "Fund Account"
5. Wait a few seconds - you'll receive 10,000 XLM (testnet)

### Using Stellar Laboratory

1. Go to [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
2. Paste your public key
3. Click "Get test network lumens"
4. Your account is now funded!

## Switch Networks

Freighter supports both testnet and mainnet:

### For Development (Testnet)
1. Open Freighter
2. Click Settings (gear icon)
3. Select "Network"
4. Choose "Test Net"

### For Production (Mainnet)
1. Open Freighter
2. Click Settings (gear icon)
3. Select "Network"
4. Choose "Mainnet"
5. **WARNING**: This uses real XLM with real value!

## Get Mainnet XLM (Real Money)

⚠️ **Only do this if you want to bet real money!**

### Buy XLM from an Exchange

1. **Create an account** on a cryptocurrency exchange:
   - Coinbase
   - Kraken
   - Binance
   - Others that support XLM

2. **Buy XLM** using:
   - Bank transfer
   - Credit/debit card
   - Other cryptocurrencies

3. **Withdraw to Freighter**:
   - Open Freighter and copy your public key
   - Go to exchange's withdrawal page
   - Paste your Freighter address
   - Enter amount to withdraw
   - Confirm transaction
   - Wait for confirmation (usually 5-10 minutes)

### Minimum Requirements
- Stellar accounts need a minimum balance of 1 XLM
- Keep at least 2-3 XLM for transaction fees
- Stake only what you can afford to lose!

## Connect to the Betting App

1. Open the LeetCode Challenge Betting app
2. Click "Connect Wallet"
3. Freighter popup will appear
4. Click "Connect"
5. Approve the connection
6. Your wallet is now connected! ✅

## Transaction Signing

When you create a challenge:

1. Enter challenge details and stake amount
2. Click "Start My Challenge"
3. Freighter popup appears showing transaction details
4. Review:
   - Destination address (contract address)
   - Amount (your stake)
   - Memo (challenge ID)
5. Click "Approve" to sign transaction
6. Wait for confirmation (5-10 seconds)
7. Your challenge is created! 🎉

## Security Best Practices

### ✅ DO:
- Write down your recovery phrase on paper
- Store it in a secure location (safe, vault)
- Use a strong password
- Double-check transaction details before approving
- Keep your browser and extensions updated
- Test with small amounts first

### ❌ DON'T:
- Share your recovery phrase with anyone
- Store recovery phrase digitally (cloud, email, screenshots)
- Use the same password as other accounts
- Approve transactions without reading them
- Install Freighter from unofficial sources
- Bet more than you can afford to lose

## Troubleshooting

### Freighter Not Showing Up?
- Restart your browser
- Check if extension is enabled
- Try pinning extension to toolbar
- Reinstall Freighter if needed

### Transaction Failed?
- Check you have enough XLM balance
- Ensure you're on the correct network (testnet vs mainnet)
- Try increasing transaction fee
- Wait a few minutes and try again

### Connection Issues?
- Refresh the app page
- Disconnect and reconnect wallet
- Check if Freighter is unlocked
- Clear browser cache and cookies

### Lost Access?
- Use your 12-word recovery phrase
- Click "Import wallet" in Freighter
- Enter your recovery phrase
- Set a new password
- Your wallet is restored!

## Additional Resources

- **Freighter Documentation**: https://docs.freighter.app/
- **Stellar Docs**: https://developers.stellar.org/
- **Get Help**: https://discord.gg/stellar
- **Report Issues**: https://github.com/stellar/freighter/issues

## Network Details

### Testnet
- **Network**: Test SDF Network ; September 2015
- **Horizon**: https://horizon-testnet.stellar.org
- **Explorer**: https://stellar.expert/explorer/testnet
- **Friendbot**: https://friendbot.stellar.org/

### Mainnet
- **Network**: Public Global Stellar Network ; September 2015
- **Horizon**: https://horizon.stellar.org
- **Explorer**: https://stellar.expert/explorer/public
- **Buy XLM**: Various exchanges

## FAQ

**Q: Is Freighter safe?**
A: Yes, Freighter is developed by the Stellar Development Foundation and is open source. However, always verify transaction details before approving.

**Q: Can I use the same wallet on multiple devices?**
A: Yes, import your wallet using the recovery phrase on each device.

**Q: How much does it cost to use Freighter?**
A: Freighter is free. You only pay Stellar network fees (0.00001 XLM per transaction).

**Q: What if I lose my recovery phrase?**
A: Unfortunately, there's no way to recover your wallet without the phrase. Your funds will be permanently lost.

**Q: Can I cancel a transaction after approving?**
A: No, blockchain transactions are irreversible once confirmed.

**Q: How long do transactions take?**
A: Stellar transactions typically confirm in 3-5 seconds.

---

Need more help? Join the [Stellar Discord](https://discord.gg/stellar) or visit the [Freighter documentation](https://docs.freighter.app/).
