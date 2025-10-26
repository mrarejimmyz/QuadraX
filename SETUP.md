# 🚀 Quick Setup Guide

## Step 1: Configure Environment Variables

You need to add these to your `.env` file in the project root:

### Required for Deployment

```bash
# Your MetaMask private key (get from MetaMask > Account Details > Export Private Key)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (get free from Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Or use Alchemy:
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# PYUSD on Sepolia (already deployed by PayPal)
PYUSD_TOKEN_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
```

### Optional (for verification)

```bash
# Etherscan API key (get from https://etherscan.io/myapikey)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Hedera private key (if you have one)
HEDERA_PRIVATE_KEY=your_hedera_private_key
```

---

## Step 2: Get Free RPC URL

### Option A: Infura (Recommended)

1. Go to https://infura.io/
2. Sign up (free)
3. Create new project
4. Copy Project ID
5. Your RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Option B: Alchemy

1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create app (select Sepolia)
4. Copy API Key
5. Your RPC URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

---

## Step 3: Get Test Funds

### 🪙 Sepolia ETH (for gas fees)

You need ~0.1 ETH for deployment and testing.

**Faucets:**
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

**Instructions:**
1. Copy your wallet address from MetaMask
2. Paste into faucet
3. Click "Send me ETH"
4. Wait 1-2 minutes

### 💵 Sepolia PYUSD (for testing)

You need some PYUSD to test staking.

**Faucet:**
- https://faucet.circle.com/

**Instructions:**
1. Connect your MetaMask wallet
2. Select "Sepolia" network
3. Click "Get PYUSD"
4. Wait for transaction

---

## Step 4: Update .env File

Open `.env` in notepad and add your values:

```bash
# Example (replace with YOUR values)
PRIVATE_KEY=0abc123def456...
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456
PYUSD_TOKEN_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9

# Optional
ETHERSCAN_API_KEY=ABC123DEF456
```

**⚠️ IMPORTANT:** Never commit your `.env` file! It's in `.gitignore`.

---

## Step 5: Verify Setup

Run the checklist:

```bash
node scripts/check-deployment.js
```

Should see:
```
✅ .env file exists
   ✅ PRIVATE_KEY is set
   ✅ SEPOLIA_RPC_URL is set
   ✅ PYUSD_TOKEN_ADDRESS is set

🎉 All required checks passed! Ready to deploy.
```

---

## Step 6: Deploy Contract

```bash
npm run deploy:sepolia
```

Expected output:
```
🚀 Deploying QuadraX to Ethereum Sepolia...
📝 Deploying with account: 0x123...
💰 Account balance: 0.5 ETH

📦 Deploying TicTacToe contract...
✅ TicTacToe deployed to: 0xABC...

📦 Deploying PYUSDStaking contract...
✅ PYUSDStaking deployed to: 0xDEF...

🎉 Deployment complete!
```

---

## Step 7: Update Frontend Config

The deployment script automatically creates:
- `deployments/sepolia-latest.json`
- `frontend/src/lib/contracts/addresses.ts`

But you also need to manually update `EscrowCoordinator.ts`:

1. Open `frontend/src/lib/escrow/EscrowCoordinator.ts`
2. Find line ~16: `const STAKING_CONTRACT_ADDRESS = ...`
3. Replace with your deployed address from `deployments/sepolia-latest.json`

```typescript
// Update this line
const STAKING_CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS' as Address;
```

---

## Step 8: Test Deployment

```bash
npm run test:staking
```

Expected output:
```
🧪 Testing PYUSDStaking Contract...

Test 1: Check PYUSD Balances
   Player 1 balance: 100 PYUSD
   ✅

Test 2: Create Game
   ✅ Game created! Game ID: 1

[... more tests ...]

🎉 All Tests Passed!
```

---

## Step 9: Start Frontend

```bash
cd frontend
npm run dev
```

Navigate to: http://localhost:3000/negotiate

---

## 🆘 Troubleshooting

### "Error: insufficient funds"

**Problem:** Not enough Sepolia ETH for gas

**Solution:** Get more from faucets above

### "Error: invalid project id"

**Problem:** Wrong RPC URL in .env

**Solution:** 
1. Check your Infura/Alchemy project ID
2. Make sure URL format is correct
3. No spaces or quotes around the value

### "Error: private key"

**Problem:** Invalid private key format

**Solution:**
1. MetaMask > Account Details > Export Private Key
2. Copy EXACTLY (starts with 0x)
3. Paste into .env with no spaces

### "Error: nonce too high"

**Problem:** Transaction stuck or MetaMask out of sync

**Solution:**
1. MetaMask > Settings > Advanced
2. Click "Reset Account"
3. Try deployment again

---

## ✅ Setup Complete!

Once you see "🎉 All Tests Passed!" you're ready to:

1. **Deploy contracts** ✅
2. **Test staking** ✅
3. **Start frontend** ✅
4. **Test negotiation** ⏭️

Next: Test the full flow in the UI! 🚀
