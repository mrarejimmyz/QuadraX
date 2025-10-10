# QuadraX Quick Start Guide

⚡ **Get up and running in 5 minutes!**

---

## Step 1: Install Node.js

Download and install Node.js v18 or higher:
👉 https://nodejs.org/

Verify installation:
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
```

---

## Step 2: Install Dependencies

```bash
# Root directory (smart contracts)
npm install

# Frontend directory
cd frontend
npm install
cd ..
```

---

## Step 3: Verify Setup

```bash
node verify-setup.js
```

You should see all green checkmarks ✓

---

## Step 4: Configure Environment

```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Edit frontend/.env.local
# Add your WalletConnect Project ID from: https://cloud.walletconnect.com
```

Minimum required in `frontend/.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

---

## Step 5: Run Tests

```bash
npm test
```

Expected output:
```
45 passing tests
✓ TicTacToe: 15 tests
✓ PYUSDStaking: 30 tests
```

---

## Step 6: Start Local Blockchain

Open a new terminal and keep it running:
```bash
npx hardhat node
```

You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

---

## Step 7: Deploy Contracts

In a new terminal:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the contract addresses from the output:
```
✅ TicTacToe deployed to: 0x...
✅ Mock PYUSD deployed to: 0x...
✅ PYUSDStaking deployed to: 0x...
```

---

## Step 8: Update Frontend Config

Edit `frontend/.env.local` and add the contract addresses:
```env
NEXT_PUBLIC_TICTACTOE_CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_STAKING_CONTRACT=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_PYUSD_TOKEN=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_HEDERA_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=1337
```

---

## Step 9: Start Frontend

```bash
cd frontend
npm run dev
```

Open browser to: http://localhost:3000

---

## Step 10: Connect Wallet

1. Click "Connect Wallet"
2. Select MetaMask
3. Add local network to MetaMask:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

4. Import a test account from Hardhat node output:
   - Copy any private key from the Hardhat node terminal
   - Import to MetaMask

---

## 🎮 You're Ready to Play!

Navigate to: http://localhost:3000/game

- Click cells to make moves
- Test staking (simulated for now)
- Chat with AI (simulated responses)

---

## 🚀 Deploy to Production

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts, add environment variables in dashboard
```

### Deploy Contracts to Hedera Testnet

1. Get testnet HBAR: https://portal.hedera.com/faucet
2. Update `.env` with your private key
3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network hedera-testnet
```

---

## 📚 Need More Help?

- **Build Issues**: See [BUILD.md](BUILD.md)
- **Testing**: See [TESTING.md](TESTING.md)
- **Project Overview**: See [README.md](README.md)
- **Full Status**: See [STATUS.md](STATUS.md)

---

## ⚡ Quick Commands Reference

```bash
# Install everything
npm install && cd frontend && npm install && cd ..

# Run tests
npm test

# Compile contracts
npx hardhat compile

# Start local node
npx hardhat node

# Deploy locally
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Verify setup
node verify-setup.js

# Clean everything
npx hardhat clean
rm -rf node_modules frontend/node_modules
rm -rf artifacts cache typechain-types
rm -rf frontend/.next
```

---

## 🐛 Common Issues

**"npm: command not found"**
→ Install Node.js from nodejs.org

**Tests failing**
→ Run `npx hardhat clean && npx hardhat compile`

**Frontend won't start**
→ Check WalletConnect Project ID in .env.local

**Wallet won't connect**
→ Make sure MetaMask is on the correct network

**Contracts not deploying**
→ Check Hardhat node is running in another terminal

---

## ✅ Success Checklist

- [ ] Node.js installed (v18+)
- [ ] Dependencies installed
- [ ] Tests passing (45/45)
- [ ] Contracts deployed locally
- [ ] Frontend running
- [ ] Wallet connected
- [ ] Can view game page
- [ ] Ready for production deployment

---

**That's it! You're ready to build on QuadraX! 🎉**
