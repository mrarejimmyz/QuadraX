# QuadraX Build & Test Instructions

This guide provides step-by-step instructions for building, testing, and deploying the QuadraX project.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download here](https://git-scm.com/))
- **MetaMask** browser extension ([Install here](https://metamask.io/))

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/QuadraX.git
cd QuadraX
```

### 2. Install Smart Contract Dependencies

```bash
# In the root directory
npm install
```

This will install:
- Hardhat
- OpenZeppelin contracts
- Ethers.js
- Testing libraries (Chai, Mocha)

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install:
- Next.js 14
- React 18
- RainbowKit
- Wagmi & Viem
- TailwindCSS

### 4. Configure Environment Variables

#### Root Directory (.env)

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
# For local testing, you can leave most values as defaults
```

Required for Hedera deployment:
```env
PRIVATE_KEY=your_private_key_here
HEDERA_ACCOUNT_ID=0.0.xxxxx
PYUSD_TOKEN_ADDRESS=0x...
PLATFORM_WALLET=0x...
```

#### Frontend Directory (.env.local)

```bash
cd frontend
cp .env.local.example .env.local

# Edit .env.local
```

Required:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_HEDERA_RPC_URL=https://testnet.hashio.io/api
NEXT_PUBLIC_CHAIN_ID=296
```

Get WalletConnect Project ID: https://cloud.walletconnect.com

## 🧪 Testing Smart Contracts

### Run All Tests

```bash
# From root directory
npm test
```

This runs the complete test suite including:
- TicTacToe contract tests (game logic, win conditions)
- PYUSDStaking contract tests (staking, payouts, fees)

### Run Specific Test File

```bash
npx hardhat test test/TicTacToe.test.js
npx hardhat test test/PYUSDStaking.test.js
```

### Run Tests with Gas Reporting

```bash
REPORT_GAS=true npm test
```

### Run Tests with Coverage

```bash
npx hardhat coverage
```

### Expected Test Results

All tests should pass:
- ✓ TicTacToe: ~20 tests
- ✓ PYUSDStaking: ~25 tests

## 🔨 Compile Smart Contracts

```bash
npx hardhat compile
```

This generates:
- Contract artifacts in `artifacts/`
- TypeChain types in `typechain-types/`

## 🚀 Deploy Smart Contracts

### Local Deployment (for testing)

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

The deployment script will:
1. Deploy TicTacToe contract
2. Deploy Mock PYUSD token (for testing)
3. Deploy PYUSDStaking contract
4. Mint test PYUSD to deployer
5. Save deployment addresses to `deployments/`
6. Display environment variables for frontend

### Hedera Testnet Deployment

```bash
# Make sure .env is configured with:
# - PRIVATE_KEY
# - PYUSD_TOKEN_ADDRESS
# - PLATFORM_WALLET

npx hardhat run scripts/deploy.js --network hedera-testnet
```

The script will also attempt to verify contracts on HashScan.

### After Deployment

1. Copy the contract addresses from the deployment output
2. Update `frontend/.env.local` with the new addresses:

```env
NEXT_PUBLIC_TICTACTOE_CONTRACT=0x...
NEXT_PUBLIC_STAKING_CONTRACT=0x...
NEXT_PUBLIC_PYUSD_TOKEN=0x...
```

## 💻 Run Frontend

### Development Mode

```bash
cd frontend
npm run dev
```

Visit: http://localhost:3000

Hot reloading is enabled - changes auto-refresh.

### Build for Production

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/.next/`

### Test Production Build Locally

```bash
cd frontend
npm run build
npm start
```

Visit: http://localhost:3000

### Lint Frontend Code

```bash
cd frontend
npm run lint
```

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_HEDERA_RPC_URL`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_TICTACTOE_CONTRACT`
   - `NEXT_PUBLIC_STAKING_CONTRACT`
   - `NEXT_PUBLIC_PYUSD_TOKEN`
7. Click "Deploy"

### Vercel Deployment Settings

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

## 🔍 Verify Deployment

### Check Smart Contracts

**Local Network:**
```bash
npx hardhat console --network localhost

# In console:
const TicTacToe = await ethers.getContractFactory("TicTacToe")
const game = await TicTacToe.attach("CONTRACT_ADDRESS")
await game.getGameStatus()
```

**Hedera Testnet:**
- Visit HashScan: https://hashscan.io/testnet
- Search for your contract address
- Verify transactions and contract state

### Check Frontend

1. Visit your deployed URL
2. Click "Connect Wallet"
3. Ensure wallet connects successfully
4. Check console for any errors (F12)
5. Try navigating to `/game` page

## 📊 Performance Testing

### Contract Gas Usage

```bash
REPORT_GAS=true npx hardhat test
```

Expected gas costs (approximate):
- `createGame`: ~150,000 gas
- `makeMove`: ~80,000 gas
- `stake`: ~120,000 gas
- `declareWinner`: ~100,000 gas

### Frontend Performance

```bash
cd frontend
npm run build

# Check build output for bundle sizes
# Look for warnings about large bundles
```

Lighthouse audit:
1. Open deployed site
2. Press F12 → Lighthouse tab
3. Run audit
4. Target scores: Performance >90, Accessibility >90

## 🐛 Troubleshooting

### Common Issues

**Problem: `npm: command not found`**
- Solution: Install Node.js from nodejs.org

**Problem: Contract compilation fails**
- Solution: Delete `artifacts/` and `cache/`, then run `npx hardhat clean && npx hardhat compile`

**Problem: Tests timeout**
- Solution: Increase timeout in `hardhat.config.js`: `timeout: 60000`

**Problem: Frontend won't start**
- Solution: Delete `frontend/.next` and `frontend/node_modules`, then reinstall

**Problem: Wallet won't connect**
- Solution: Check WalletConnect Project ID in `.env.local`

**Problem: Transactions fail on Hedera**
- Solution: Ensure you have enough HBAR for gas (get from faucet: https://portal.hedera.com/faucet)

### Get Help

- Check existing issues: https://github.com/yourusername/QuadraX/issues
- Hardhat docs: https://hardhat.org/docs
- Next.js docs: https://nextjs.org/docs
- Wagmi docs: https://wagmi.sh

## 🔄 Clean & Reset

### Clean Hardhat

```bash
npx hardhat clean
rm -rf artifacts/ cache/ typechain-types/
```

### Clean Frontend

```bash
cd frontend
rm -rf .next/ node_modules/
npm install
```

### Reset Local Hardhat Node

Just restart it - it clears state automatically.

## ✅ Checklist

Before deploying to production:

- [ ] All tests pass
- [ ] Contracts compile without warnings
- [ ] Frontend builds successfully
- [ ] Environment variables configured
- [ ] Wallet connection works
- [ ] Contract interactions work on testnet
- [ ] Frontend loads without errors
- [ ] Mobile responsive design verified
- [ ] Security audit completed (if handling real funds)
- [ ] Documentation updated

## 📝 Next Steps

After successful deployment:

1. Test complete game flow on testnet
2. Record demo video
3. Write deployment post-mortem
4. Submit to ETHOnline
5. Share on social media

---

**Need help?** Check the main [README.md](README.md) or open an issue on GitHub.
