# 🚀 QuadraX Quick Deployment Guide

## Current Status: 18/20 Tests Passing ✅

### ✅ What's Working
- Environment configured
- Hedera connected (1000 HBAR)
- Sepolia RPC connected
- All code ready

### ❌ What's Blocking
- Need Sepolia ETH for gas

---

## 📋 Quick Commands

### Check System Status
```bash
npm run test:complete
```

### Test Hedera
```bash
npm run test:hedera:real
```

### Deploy (after getting ETH)
```bash
npm run deploy:sepolia
```

### Test Deployment
```bash
npm run test:staking
```

### Start Frontend
```bash
cd frontend
npm run dev
```

---

## 🎯 Next Steps (In Order)

### 1️⃣ Get Sepolia ETH (REQUIRED)
```
Visit: https://sepoliafaucet.com/
Wallet: 0x224783D70D55F9Ab790Fe27fCFc4629241F45371
```

### 2️⃣ Deploy Contract
```bash
npm run deploy:sepolia
```
Save the deployed contract address!

### 3️⃣ Update Frontend
Edit `frontend/src/lib/escrow/EscrowCoordinator.ts`:
```typescript
// Line 16
const PYUSD_STAKING_ADDRESS = '0xYOUR_ADDRESS_HERE'
```

### 4️⃣ Test & Launch
```bash
npm run test:staking
cd frontend && npm run dev
```

---

## 🔗 Your Accounts

### Sepolia
- Address: `0x224783D70D55F9Ab790Fe27fCFc4629241F45371`
- ETH: 0 (need from faucet)
- Explorer: [View on Etherscan](https://sepolia.etherscan.io/address/0x224783D70D55F9Ab790Fe27fCFc4629241F45371)

### Hedera
- Account: `0.0.7132683`
- Balance: 1000 HBAR ⚡
- Explorer: [View on HashScan](https://hashscan.io/testnet/account/0.0.7132683)

---

## 💰 Get Testnet Funds

### Sepolia ETH (Required)
https://sepoliafaucet.com/

### Sepolia PYUSD (Optional)
https://faucet.circle.com/

### Hedera HBAR (Already have 1000)
https://portal.hedera.com/

---

## 📊 Test Results

```
✅ Environment:  10/10
⚠️  Sepolia:      4/6  (missing ETH & PYUSD)
✅ Hedera:       4/4
━━━━━━━━━━━━━━━━━━━━
   Total:       18/20
```

**Deployment Ready**: ❌ Need Sepolia ETH

---

## 🎮 Features Ready

- ✅ Dual-chain staking (Sepolia + Hedera)
- ✅ 2.5% treasury fee
- ✅ Atomic operations
- ✅ AI agent negotiation
- ✅ Real-time status tracking
- ✅ Winner payout logic

---

## 🆘 Help

### If stuck, run:
```bash
npm run test:complete
```

### Check specific component:
```bash
npm run test:hedera:real    # Hedera
npm run test:staking         # Sepolia (after deploy)
```

### View full status:
```bash
cat DEPLOYMENT_STATUS.md
```

---

**🚀 Once you have Sepolia ETH, you're ready to deploy!**

**💡 Estimated time to deployment: < 5 minutes after getting ETH**
