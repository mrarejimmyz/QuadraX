# 🔑 Get Your Free RPC URL

You need a Sepolia RPC URL to deploy contracts. Here are two free options:

---

## Option 1: Infura (Recommended) ⭐

### Steps:
1. Go to **https://infura.io/**
2. Click **"Sign Up"** (free account)
3. Verify your email
4. Click **"Create New API Key"**
5. Select **"Web3 API"**
6. Name it: "QuadraX"
7. Copy your **Project ID**

### Your RPC URL will be:
```
https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Update .env:
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456...
INFURA_PROJECT_ID=abc123def456...
```

---

## Option 2: Alchemy (Alternative)

### Steps:
1. Go to **https://www.alchemy.com/**
2. Click **"Sign Up"** (free)
3. Click **"Create App"**
4. Select:
   - Chain: **Ethereum**
   - Network: **Sepolia**
   - Name: **QuadraX**
5. Click **"View Key"**
6. Copy the **API KEY**

### Your RPC URL will be:
```
https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### Update .env:
```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/abc123def456...
```

---

## ⚡ Quick Setup (Infura - 2 minutes)

1. Open **https://infura.io/** in your browser
2. Sign up with your email
3. Create new API key
4. Copy the Project ID
5. Open `.env` file
6. Replace `YOUR_INFURA_PROJECT_ID` with your actual ID

---

## ✅ Once You Have It

Run this to verify:
```bash
node scripts/check-deployment.js
```

Should show:
```
✅ SEPOLIA_RPC_URL is set
```

---

## 📍 Your Current Status

✅ **Private Key**: Configured
✅ **Wallet Address**: 0x224783D70D55F9Ab790Fe27fCFc4629241F45371
✅ **PYUSD Token**: Configured (0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9)
✅ **Platform Wallet**: Configured (your address)

⏳ **RPC URL**: Need to get from Infura or Alchemy

---

**Next**: Get your RPC URL, update .env, then run deployment!
