# QuadraX Project Structure

**Clean, organized architecture for blockchain gaming with AI agents**

Last Updated: October 13, 2025

---

## 📁 Directory Structure

```
QuadraX/
├── 📂 contracts/          # Solidity smart contracts
│   ├── core/             # Core game logic
│   │   ├── TicTacToe.sol       # 4x4 game implementation
│   │   └── PYUSDStaking.sol    # PYUSD staking system
│   ├── interfaces/       # Contract interfaces
│   │   ├── IGame.sol
│   │   └── IStaking.sol
│   ├── libraries/        # Reusable libraries
│   │   └── GameLogic.sol
│   └── test/             # Test contracts
│       └── MockERC20.sol
│
├── 📂 frontend/           # Next.js 14 application
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── providers.tsx     # Web3 providers
│   │   │   ├── game/            # Game page
│   │   │   ├── demo/            # Demo page
│   │   │   └── ollama/          # Ollama test page
│   │   │
│   │   ├── components/   # React components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── OllamaIntegration.tsx
│   │   │   ├── StakeConfirmation.tsx  # Stake confirmation modal
│   │   │   ├── WalletConnectProjectIdNotice.tsx
│   │   │   └── WalletConnectSetupNotice.tsx
│   │   │
│   │   ├── features/     # Feature modules
│   │   │   ├── game/            # Game UI features
│   │   │   │   ├── AIChat.tsx           # AI-powered chat (Ollama)
│   │   │   │   ├── GameBoard.tsx        # 4x4 game board
│   │   │   │   ├── GameControls.tsx     # Game controls
│   │   │   │   └── GameInfo.tsx         # Game information
│   │   │   ├── staking/         # Staking features
│   │   │   │   ├── StakeAmount.tsx
│   │   │   │   └── StakingDashboard.tsx
│   │   │   └── wallet/          # Wallet features
│   │   │       └── WalletButton.tsx
│   │   │
│   │   ├── lib/          # Libraries and utilities
│   │   │   ├── agents/          # AI agent system
│   │   │   │   └── quadraXAgent.ts     # QuadraX AI agents (4 personalities)
│   │   │   ├── constants/       # Constants
│   │   │   │   ├── abi.ts              # Contract ABIs
│   │   │   │   └── contracts.ts        # Contract addresses
│   │   │   ├── hooks/           # React hooks
│   │   │   │   ├── useGameState.ts
│   │   │   │   ├── useStakeNegotiation.ts  # Contract staking hook
│   │   │   │   └── useTicTacToe.ts
│   │   │   ├── types/           # TypeScript types
│   │   │   │   ├── game.ts
│   │   │   │   └── staking.ts
│   │   │   └── utils/           # Utility functions
│   │   │       ├── gameLogic.ts
│   │   │       └── validation.ts
│   │   │
│   │   └── services/     # External services
│   │       ├── ollamaService.ts        # Ollama API integration
│   │       ├── agentManager.ts         # Agent lifecycle management
│   │       ├── conversationHandler.ts  # Conversation context
│   │       └── messageProcessor.ts     # Message processing
│   │
│   ├── public/           # Static assets
│   │   └── (images, fonts, etc.)
│   │
│   ├── next.config.js    # Next.js configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Frontend dependencies
│
├── 📂 scripts/            # Deployment & utility scripts
│   └── deploy.js         # Hardhat deployment script
│
├── 📂 test/               # All test files (consolidated)
│   ├── PYUSDStaking.test.js           # Staking contract tests
│   ├── TicTacToe.test.js              # Game contract tests
│   ├── test-ai-negotiation-bounds.js  # AI boundary tests
│   ├── test-ai-negotiation-flow.mjs   # AI negotiation flow tests
│   ├── test-complete-e2e.js           # End-to-end tests
│   ├── test-ollama-cuda.js            # Ollama/CUDA verification
│   └── test-quadrax-agents.js         # Agent system tests
│
├── 📂 docs/               # Documentation
│   ├── ARCHITECTURE.md    # System architecture
│   ├── OLLAMA_SETUP.md    # Ollama & CUDA setup guide
│   ├── QUICKSTART.md      # Quick start guide
│   ├── BUILD.md           # Build instructions
│   └── TESTING.md         # Testing documentation
│
├── 📂 .github/            # GitHub configuration
│   └── workflows/        # CI/CD workflows
│
├── 📂 artifacts/          # Hardhat build artifacts (generated)
├── 📂 cache/              # Hardhat cache (generated)
├── 📂 config/             # Configuration files
│   └── index.js
│
├── 📄 hardhat.config.js   # Hardhat configuration
├── 📄 package.json        # Root dependencies
├── 📄 README.md           # Main project documentation
├── 📄 TODO.md             # Project roadmap
├── 📄 CLEANUP_PLAN.md     # This cleanup documentation
│
├── 🚀 setup.bat           # Main setup script (Windows)
├── 🚀 start-dev.bat       # Development launcher (Windows)
├── 🚀 test-project.bat    # Test runner (Windows)
└── 🚀 verify-setup.js     # Setup verification script
```

---

## 🎯 Key Directories Explained

### `/contracts` - Smart Contracts
**Purpose**: Solidity contracts for QuadraX game and PYUSD staking

**Key Files**:
- `TicTacToe.sol` - 4x4 game with placement & movement phases
- `PYUSDStaking.sol` - Stake management, fees, payouts
- `GameLogic.sol` - Reusable game logic library
- `MockERC20.sol` - PYUSD mock for testing

**Build Output**: `/artifacts` and `/cache` (gitignored)

---

### `/frontend` - Next.js Application
**Purpose**: Web3-enabled React UI with AI agents

**Tech Stack**:
- **Framework**: Next.js 14.2.33 (App Router)
- **Styling**: Tailwind CSS 3.4.1
- **Web3**: Wagmi 2.18.0, Viem 2.38.0
- **AI**: Ollama (llama3.2:latest, CUDA GPU acceleration)
- **TypeScript**: 5.x

**Key Features**:
- `/app` - Page routing (homepage, game, demo, ollama test)
- `/components` - Reusable UI components
- `/features` - Domain-specific feature modules
- `/lib` - Core libraries (agents, hooks, utilities)
- `/services` - External service integrations (Ollama)

---

### `/test` - Test Suite
**Purpose**: All testing files consolidated in one location

**Test Categories**:
1. **Contract Tests** (Hardhat)
   - `PYUSDStaking.test.js` - 39/39 passing
   - `TicTacToe.test.js` - Game logic validation

2. **AI Tests** (Node.js)
   - `test-ai-negotiation-flow.mjs` - Ollama negotiation tests
   - `test-ai-negotiation-bounds.js` - PYUSD bounds validation (1-10)
   - `test-quadrax-agents.js` - Agent personality tests

3. **Integration Tests**
   - `test-complete-e2e.js` - Full system E2E tests
   - `test-ollama-cuda.js` - GPU acceleration verification

**Run Tests**: `npm run test` or `test-project.bat`

---

### `/docs` - Documentation
**Purpose**: Centralized documentation for architecture, setup, and guides

**Documents**:
- `ARCHITECTURE.md` - System design, tech stack, architecture decisions
- `OLLAMA_SETUP.md` - Ollama installation, CUDA setup, GPU verification
- `QUICKSTART.md` - Get started in 5 minutes
- `BUILD.md` - Build process, deployment, troubleshooting
- `TESTING.md` - Testing strategy, running tests, writing tests

---

## 🚀 Quick Commands

### Setup
```bash
setup.bat              # Install all dependencies
verify-setup.js        # Verify installation
```

### Development
```bash
start-dev.bat          # Start frontend dev server
npm run dev            # Alternative: Next.js dev server
ollama serve           # Start Ollama AI server
```

### Testing
```bash
test-project.bat       # Run all tests
npm run test           # Contract tests only
npm run test:e2e       # End-to-end tests
```

### Build
```bash
npm run build          # Build frontend
npx hardhat compile    # Compile contracts
npx hardhat test       # Test contracts
```

### Deployment
```bash
npx hardhat run scripts/deploy.js --network <network>
```

---

## 🧠 AI Agent System

### QuadraX Agents
**Location**: `/frontend/src/lib/agents/quadraXAgent.ts`

**4 Agent Personalities**:
1. **Conservative** - Risk-averse, defensive play, low stakes
2. **Aggressive** - High-risk, offensive strategies, high stakes
3. **Adaptive** - Balanced approach, adjusts to opponent
4. **Balanced** - Mix of all strategies

**Capabilities**:
- Stake calculation (Kelly Criterion)
- Negotiation (accept/counter/reject)
- Position analysis (board evaluation)
- Move selection (strategic planning)

**AI Backend**: Ollama (llama3.2:latest) with CUDA GPU acceleration

---

## 📦 Dependencies

### Root (`/package.json`)
- Hardhat 2.22.16 (Smart contract development)
- Ethers.js 6.x (Blockchain interaction)
- OpenZeppelin Contracts 5.2.0 (Security)

### Frontend (`/frontend/package.json`)
- Next.js 14.2.33 (React framework)
- Wagmi 2.18.0 (Web3 hooks)
- Viem 2.38.0 (Ethereum library)
- Tailwind CSS 3.4.1 (Styling)
- TypeScript 5.x (Type safety)

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `hardhat.config.js` | Hardhat network/compiler settings |
| `next.config.js` | Next.js build configuration |
| `tailwind.config.js` | Tailwind CSS theme |
| `tsconfig.json` | TypeScript compiler options |
| `.env.example` | Environment variables template |
| `.eslintrc.json` | ESLint code quality rules |
| `postcss.config.js` | PostCSS for Tailwind |

---

## 📝 Documentation Priority

**Read First**:
1. `README.md` - Project overview
2. `docs/QUICKSTART.md` - Get started quickly
3. `docs/OLLAMA_SETUP.md` - Setup AI agents

**For Developers**:
4. `docs/ARCHITECTURE.md` - System design
5. `docs/BUILD.md` - Build & deployment
6. `docs/TESTING.md` - Testing guide
7. `TODO.md` - Current roadmap

---

## ✅ Cleanup Results

**Removed**:
- 8 temporary progress markdown files
- 6 redundant PowerShell/batch scripts
- 4 duplicate test files

**Organized**:
- All tests → `/test` directory
- All docs → `/docs` directory
- Clear separation of concerns

**Maintained**:
- All working code
- All essential documentation
- All test coverage
- Git history intact

---

## 🎯 Next Steps

1. **Review** this structure
2. **Update** README.md with consolidated info
3. **Test** everything still works
4. **Deploy** with confidence
5. **Maintain** this organization going forward

---

**Project Health**: ✅ Clean, Organized, Maintainable

**Last Cleanup**: October 13, 2025
