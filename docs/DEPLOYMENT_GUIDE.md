# 🚀 Contract Deployment & Testing Guide

Complete guide to deploy and test QuadraX contracts on Sepolia + Hedera.

---

## 📋 Prerequisites

### 1. **Environment Setup**

Create `.env` file in the project root:

```bash
# Required for deployment
PRIVATE_KEY=your_metamask_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
INFURA_PROJECT_ID=your_infura_project_id

# Optional for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# PYUSD on Sepolia (already deployed by PayPal)
PYUSD_TOKEN_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9

# Platform wallet (receives fees)
PLATFORM_WALLET=your_wallet_address

# Hedera credentials
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=your_hedera_private_key
```

### 2. **Get Testnet Funds**

#### Sepolia ETH (for gas):
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

#### Sepolia PYUSD:
- https://faucet.circle.com/ (use Sepolia network)
- Or swap Sepolia ETH on Uniswap testnet

#### Hedera HBAR:
- https://portal.hedera.com/ (create account, free testnet HBAR)

### 3. **Install Dependencies**

```bash
# Install Hardhat dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## 🎯 Deployment Steps

### Step 1: Deploy to Sepolia

```bash
# From project root
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

**Expected Output:**
```
🚀 Deploying QuadraX to Ethereum Sepolia...
============================================================
📝 Deploying with account: 0x123...
💰 Account balance: 0.5 ETH

📦 Deploying TicTacToe contract...
✅ TicTacToe deployed to: 0xABC...

📦 Deploying PYUSDStaking contract...
✅ PYUSDStaking deployed to: 0xDEF...

🔍 Verifying contract configuration...
✅ Contract verified on Etherscan!

🎉 Deployment complete!
```

**What Gets Created:**
- `deployments/sepolia-latest.json` - Deployment info
- `frontend/src/lib/contracts/addresses.ts` - Contract addresses
- Verified contract on Etherscan

### Step 2: Update EscrowCoordinator

Open `frontend/src/lib/escrow/EscrowCoordinator.ts` and update:

```typescript
// Line 15-16: Update with your deployed address
const STAKING_CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS' as Address;
```

You can find this in `deployments/sepolia-latest.json`:
```bash
# On Windows PowerShell
cat deployments/sepolia-latest.json
```

### Step 3: Configure Hedera (Frontend)

Create `frontend/.env.local`:

```bash
# Hedera Configuration
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
NEXT_PUBLIC_HEDERA_PRIVATE_KEY=your_hedera_private_key
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

**Get Hedera Credentials:**
1. Go to https://portal.hedera.com/
2. Create account (free testnet)
3. Copy Account ID and Private Key

---

## 🧪 Testing

### Test 1: Contract Functions (Hardhat)

```bash
npx hardhat run scripts/test-staking.js --network sepolia
```

**What It Tests:**
- ✅ PYUSD balance checking
- ✅ Game creation
- ✅ PYUSD approval
- ✅ Staking mechanism
- ✅ Contract fund holding

**Expected Output:**
```
🧪 Testing PYUSDStaking Contract...

📝 Loaded Deployment:
   Network: sepolia
   PYUSD: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
   Staking: 0xDEF...

Test 1: Check PYUSD Balances
────────────────────────────────────────────────────────────
   Player 1 balance: 100 PYUSD
   Player 2 balance: 50 PYUSD

Test 2: Create Game
────────────────────────────────────────────────────────────
   Creating game with 5 PYUSD stake...
   ✅ Game created! Game ID: 1
   Transaction: 0x123...

[... all tests pass ...]

🎉 All Tests Passed!
```

### Test 2: Frontend Integration

Start the development server:

```bash
cd frontend
npm run dev
```

Navigate to http://localhost:3000/negotiate

**Test Flow:**
1. **Connect Wallet**
   - Click "Connect Wallet"
   - Select MetaMask
   - Switch to Sepolia network

2. **Negotiate Stake**
   - Type: "I'll stake 5 PYUSD"
   - AI will respond
   - Click "Proceed to Staking" when agreed

3. **Watch Console**
   ```
   🚀 Starting dual-chain deployment with EscrowCoordinator...
     Stake: 5 PYUSD
     Player 1: 0x123...
     Player 2: 0xAI...
   📝 Deploying Hedera escrow...
   ✅ Hedera escrow deployed: 0.0.123456
   📝 Creating Sepolia game...
   ⏳ Waiting for Sepolia confirmation...
   ✅ Sepolia game created: 0x789...
   ✅ Dual-chain deployment complete!
   ```

4. **Deposit Stakes**
   - Click "Deposit 5 PYUSD"
   - Approve PYUSD in MetaMask
   - Stake PYUSD in MetaMask
   - Watch progress updates

5. **Verify on Etherscan**
   - Click "View Transaction ↗"
   - Should show successful PYUSD transfer

### Test 3: Dual-Chain Sync

```bash
cd frontend
node -e "
const { getEscrowCoordinator } = require('./src/lib/escrow/EscrowCoordinator.ts');
const coordinator = getEscrowCoordinator();
const sync = await coordinator.checkSyncStatus('YOUR_GAME_ID', 'YOUR_ESCROW_ID');
console.log('Synced:', sync.synced);
console.log('Issues:', sync.issues);
"
```

---

## 📊 Verification

### 1. **Verify on Etherscan**

Manual verification if automatic fails:

```bash
npx hardhat verify --network sepolia \
  YOUR_STAKING_ADDRESS \
  0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9 \
  YOUR_PLATFORM_WALLET
```

### 2. **Check Contract on Etherscan**

Visit: `https://sepolia.etherscan.io/address/YOUR_STAKING_ADDRESS`

**What to Verify:**
- ✅ Contract is verified (green checkmark)
- ✅ Can read contract variables
- ✅ PYUSD address matches: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- ✅ Platform wallet is correct

### 3. **Test PYUSD Interaction**

Visit PYUSD on Sepolia: `https://sepolia.etherscan.io/address/0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`

**Read Contract:**
- Call `balanceOf(your_address)` - should show your PYUSD balance
- Call `allowance(your_address, staking_contract)` - should show approved amount

---

## 🐛 Troubleshooting

### Issue: "insufficient funds"

**Problem:** Not enough ETH for gas or not enough PYUSD

**Solution:**
```bash
# Check ETH balance
# On Sepolia Etherscan, search your address
# Get more from: https://sepoliafaucet.com/

# Check PYUSD balance
# Visit: https://faucet.circle.com/
# Connect wallet, select Sepolia, request PYUSD
```

### Issue: "nonce too high"

**Problem:** Transaction stuck or out of sync

**Solution:**
```bash
# Reset MetaMask nonce
# Settings > Advanced > Reset Account
# (This clears transaction history, safe to do on testnet)
```

### Issue: "contract not deployed"

**Problem:** Wrong network or deployment failed

**Solution:**
```bash
# Check hardhat.config.js network settings
# Verify SEPOLIA_RPC_URL in .env
# Try deploying again:
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

### Issue: "Hedera deployment failed"

**Problem:** Invalid credentials or no testnet HBAR

**Solution:**
```bash
# Verify .env.local in frontend/
# Check HEDERA_ACCOUNT_ID format: 0.0.123456
# Get testnet HBAR: https://portal.hedera.com/
```

### Issue: "Transaction reverted"

**Problem:** Contract rejected transaction

**Solution:**
```bash
# Check console for error message
# Common causes:
# - Insufficient PYUSD allowance (approve first)
# - Stake amount too low (min 1 PYUSD)
# - Game already exists
# - Wrong player address
```

---

## 📈 Monitoring

### Check Deployment Status

```bash
# View latest deployment
cat deployments/sepolia-latest.json

# Expected format:
{
  "network": "sepolia",
  "chainId": "11155111",
  "contracts": {
    "pyusd": "0xCaC...",
    "staking": "0x123..."
  },
  "deployedAt": "2025-10-25T..."
}
```

### Monitor Transactions

```bash
# Sepolia transactions
https://sepolia.etherscan.io/address/YOUR_STAKING_CONTRACT

# Hedera transactions
https://hashscan.io/testnet/account/YOUR_ACCOUNT_ID
```

### Check Logs

```bash
# Frontend console (browser DevTools)
# Should see:
🚀 Starting dual-chain deployment...
✅ Hedera escrow deployed: 0.0.123456
✅ Sepolia game created: 0x789...

# Hardhat console (terminal)
# Should see gas usage, transaction hashes
```

---

## 🎯 Quick Start Checklist

- [ ] ✅ Create `.env` file with private key
- [ ] ✅ Get Sepolia ETH from faucet
- [ ] ✅ Get Sepolia PYUSD from faucet
- [ ] ✅ Deploy contracts: `npx hardhat run scripts/deploy-sepolia.js --network sepolia`
- [ ] ✅ Update `EscrowCoordinator.ts` with deployed address
- [ ] ✅ Create Hedera account at portal.hedera.com
- [ ] ✅ Create `frontend/.env.local` with Hedera credentials
- [ ] ✅ Test contract: `npx hardhat run scripts/test-staking.js --network sepolia`
- [ ] ✅ Start frontend: `cd frontend && npm run dev`
- [ ] ✅ Test negotiation flow at http://localhost:3000/negotiate
- [ ] ✅ Verify deployment on Etherscan

---

## 🚀 Production Deployment

When ready for mainnet:

1. **Update .env**
   ```bash
   MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
   PYUSD_TOKEN_ADDRESS=0x6c3ea9036406852006290770BEdFcAbA0e23A0e8
   ```

2. **Deploy to Mainnet**
   ```bash
   npx hardhat run scripts/deploy-sepolia.js --network mainnet
   ```

3. **Verify Contract**
   ```bash
   npx hardhat verify --network mainnet YOUR_ADDRESS ...args
   ```

---

## 📚 Resources

- **Sepolia Faucet:** https://sepoliafaucet.com/
- **PYUSD Faucet:** https://faucet.circle.com/
- **Hedera Portal:** https://portal.hedera.com/
- **Etherscan (Sepolia):** https://sepolia.etherscan.io/
- **HashScan (Hedera):** https://hashscan.io/testnet/
- **Hardhat Docs:** https://hardhat.org/docs

---

**Ready to deploy? Start with Step 1! 🚀**
