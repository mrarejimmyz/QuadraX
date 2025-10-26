# 🎯 Ready to Deploy!

## What We've Set Up

I've prepared everything you need to deploy and test your dual-chain staking system:

### ✅ Created Files

1. **📜 scripts/test-staking.js** - Automated contract testing
2. **📚 docs/DEPLOYMENT_GUIDE.md** - Complete deployment documentation
3. **🔍 scripts/check-deployment.js** - Pre-deployment checklist
4. **📖 SETUP.md** - Quick setup guide (start here!)

### ✅ Updated Files

1. **package.json** - Added deployment scripts:
   - `npm run deploy:sepolia` - Deploy to Sepolia
   - `npm run test:staking` - Test deployed contract
   - `npm run compile` - Compile contracts

---

## 🚀 Quick Start (3 Steps)

### Step 1: Configure .env ⏱️ 5 mins

You need to add 3 things to your `.env` file:

```bash
PRIVATE_KEY=your_metamask_private_key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PYUSD_TOKEN_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
```

**How to get:**
- **Private Key**: MetaMask > Account Details > Export Private Key
- **RPC URL**: Sign up at https://infura.io/ (free) or https://alchemy.com/
- **PYUSD**: Already provided (PayPal's official Sepolia address)

📖 **Detailed guide**: See `SETUP.md`

### Step 2: Get Test Funds ⏱️ 5 mins

**Sepolia ETH** (for gas):
- https://sepoliafaucet.com/
- Paste your wallet address
- Get 0.5 ETH (free)

**Sepolia PYUSD** (for staking):
- https://faucet.circle.com/
- Connect MetaMask
- Select "Sepolia"
- Get 100 PYUSD (free)

### Step 3: Deploy & Test ⏱️ 2 mins

```bash
# Check everything is ready
node scripts/check-deployment.js

# Deploy to Sepolia
npm run deploy:sepolia

# Test the deployment
npm run test:staking
```

---

## 📊 What Gets Deployed

```
┌─────────────────────────────────────────┐
│         Sepolia Testnet                 │
├─────────────────────────────────────────┤
│                                         │
│  📜 PYUSDStaking Contract               │
│     ├─ Manages game creation           │
│     ├─ Handles PYUSD staking           │
│     ├─ Processes payouts               │
│     └─ Collects platform fees          │
│                                         │
│  💵 PYUSD Token (already deployed)      │
│     └─ 0xCaC524...3bB9                  │
│                                         │
└─────────────────────────────────────────┘

           ▼ Syncs with ▼

┌─────────────────────────────────────────┐
│         Hedera Testnet                  │
├─────────────────────────────────────────┤
│                                         │
│  🔷 Escrow Contract (deployed via UI)   │
│     ├─ Tracks deposit status           │
│     ├─ Monitors game state             │
│     └─ Coordinates with Sepolia        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎮 Testing Flow

### 1. Deploy Contract
```bash
npm run deploy:sepolia
```

**Output:**
```
🚀 Deploying QuadraX to Ethereum Sepolia...
📦 Deploying TicTacToe contract...
✅ TicTacToe deployed to: 0xABC...
📦 Deploying PYUSDStaking contract...
✅ PYUSDStaking deployed to: 0xDEF...
🎉 Deployment complete!
```

**Creates:**
- `deployments/sepolia-latest.json` - Deployment info
- `frontend/src/lib/contracts/addresses.ts` - Contract addresses

### 2. Test Contract
```bash
npm run test:staking
```

**Tests:**
- ✅ PYUSD balance checking
- ✅ Game creation
- ✅ PYUSD approval
- ✅ Staking mechanism
- ✅ Contract fund holding

### 3. Test Frontend
```bash
cd frontend
npm run dev
```

**Navigate to:** http://localhost:3000/negotiate

**Test:**
1. Connect MetaMask (Sepolia)
2. Negotiate stake with AI
3. Watch dual-chain deployment in console
4. Deposit PYUSD
5. See real-time updates

---

## 📋 Deployment Checklist

Run this before deploying:

```bash
node scripts/check-deployment.js
```

**Checks:**
- [x] ✅ .env file exists
- [ ] ⏳ PRIVATE_KEY configured
- [ ] ⏳ SEPOLIA_RPC_URL configured
- [ ] ⏳ PYUSD_TOKEN_ADDRESS configured
- [x] ✅ Dependencies installed
- [x] ✅ Contracts compiled
- [x] ✅ Frontend ready
- [x] ✅ Hardhat configured

**Once all ✅, you're ready to deploy!**

---

## 🔗 Useful Links

### Faucets
- **Sepolia ETH**: https://sepoliafaucet.com/
- **Sepolia PYUSD**: https://faucet.circle.com/

### RPC Providers (Free)
- **Infura**: https://infura.io/
- **Alchemy**: https://alchemy.com/

### Block Explorers
- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Hedera HashScan**: https://hashscan.io/testnet/

### Documentation
- **Setup Guide**: `SETUP.md` (read this first!)
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Integration Guide**: `docs/DUAL_CHAIN_INTEGRATION.md`

---

## 🆘 Quick Help

### Issue: "insufficient funds"
**Fix:** Get Sepolia ETH from faucet

### Issue: "invalid project id"
**Fix:** Check your Infura/Alchemy RPC URL in .env

### Issue: "private key invalid"
**Fix:** Export from MetaMask (Account Details > Export)

### Issue: Checklist fails
**Fix:** Read SETUP.md for detailed instructions

---

## 🎯 Next Steps

1. **Read SETUP.md** for detailed instructions
2. **Configure .env** with your credentials
3. **Get test funds** from faucets
4. **Run checklist** to verify setup
5. **Deploy!** `npm run deploy:sepolia`
6. **Test!** `npm run test:staking`
7. **Launch UI** and test full flow

---

## 🎉 What You'll Have

After deployment:

✅ **PYUSDStaking contract** deployed on Sepolia
✅ **Verified on Etherscan** (if API key provided)
✅ **Working dual-chain system** (Sepolia + Hedera)
✅ **Beautiful UI** for negotiation and staking
✅ **Real-time progress** tracking
✅ **Atomic operations** (both chains sync)
✅ **Automatic error recovery** (rollback on failure)

---

**Ready? Start with `SETUP.md` for step-by-step instructions!** 🚀
