# QuadraX - Agentic 4x4 Tic-Tac-Toe

> A blockchain-powered 4x4 Tic-Tac-Toe game where humans and AI agents stake PYUSD to play and win prizes. Built for ETHOnline 2024.

## 🎯 Overview

QuadraX is not your ordinary Tic-Tac-Toe game. It combines:
- **🎮 Strategic Gameplay**: 4x4 board with enhanced complexity
- **⛓️ Blockchain Integration**: Hedera EVM for fast, low-cost transactions
- **🤖 AI Agents**: Intelligent robots that predict, negotiate, and bet dynamically
- **💸 Real Stakes**: PYUSD stablecoin staking and automatic payouts

### The Agentic Twist

AI robots don't just play the game — they:
- Analyze board states and predict outcomes
- Negotiate bets dynamically ("I'll double the stake if you risk it!")
- Collaborate or compete using multi-agent intelligence
- Execute strategies using ASI's uAgents & MeTTa reasoning

## 🏆 Prize Targets (ETHOnline)

| Prize | Integration | How We Qualify |
|-------|------------|----------------|
| 🪙 **PYUSD** | Staking & Payouts | Players stake test PYUSD; winner takes pot |
| 🧠 **ASI** | AI Reasoning | Robot players predict moves and negotiate bets |
| 🌐 **Hedera** | Fast Blockchain | Contracts on Hedera + Agent Kit for messaging |

## 🧱 Architecture

```
Frontend (Next.js + RainbowKit + Wagmi)
    ↓
Smart Contracts (Solidity on Hedera)
    ↓
PYUSD ERC20 (staking/payout)
    ↓
ASI Agents (uAgents + MeTTa)
    ↓
Hedera Agent Kit (agent messaging)
```

### Technology Stack

- **Frontend**: Next.js 14 (App Router), RainbowKit, Wagmi, Viem, TailwindCSS
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Hedera EVM (Testnet)
- **AI Agents**: ASI uAgents, MeTTa reasoning engine
- **Stablecoin**: PYUSD (PayPal USD)
- **Deployment**: Vercel (optimized for Next.js)

## 📦 Project Structure

```
QuadraX/
├── contracts/              # Solidity smart contracts
│   ├── TicTacToe.sol      # Core game logic
│   └── PYUSDStaking.sol   # Betting & payout logic
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components (Board, GameInfo, StakingPanel, AIChat)
│   │   ├── agents/        # AI agent logic
│   │   ├── contracts/     # ABIs and contract interfaces
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── scripts/               # Hardhat deployment scripts
├── test/                  # Contract tests
├── README.md
└── TODO.md               # Development roadmap
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MetaMask or compatible Web3 wallet
- PYUSD test tokens (from faucet)
- WalletConnect Project ID ([Get it here](https://cloud.walletconnect.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/QuadraX.git
cd QuadraX

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Configuration

```bash
# Root directory - copy .env.example to .env
cp .env.example .env

# Frontend directory - copy .env.local.example to .env.local
cd frontend
cp .env.local.example .env.local

# Edit both .env files with your credentials
```

### Local Development

```bash
# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start Next.js frontend
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
cd frontend
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow the prompts to deploy
# Set environment variables in Vercel dashboard
```

Or connect your GitHub repo to Vercel for automatic deployments.

## 🎮 How to Play

1. **Connect Wallet**: Link your MetaMask wallet
2. **Get PYUSD**: Claim test tokens from faucet
3. **Stake**: Enter your bet amount (minimum 1 PYUSD)
4. **Choose Mode**:
   - Play vs Human
   - Play vs AI Agent
   - Watch AI vs AI
5. **Play**: Make your moves on the 4x4 board
6. **Win**: Winner automatically receives the pot!

### AI Agent Features

- **Strategic Play**: Analyzes all possible moves
- **Dynamic Betting**: Negotiates stakes based on board state
- **Real-time Chat**: Communicates strategy and bluffs
- **Multi-agent Collaboration**: Agents can team up or compete

## 🛠️ Development Phases

### ✅ Phase 1: Core Game (Oct 10–11)
- Setup Hardhat + Next.js
- 4x4 board logic in Solidity
- Next.js UI with move validation
- Local 2-player testing

### ✅ Phase 2: PYUSD Integration (Oct 12–13)
- Staking & payout smart contracts
- PYUSD token integration
- Bet input UI
- Complete bet flow testing

### ✅ Phase 3: AI Agents (Oct 14–16)
- ASI uAgents setup
- Player Agent (move decisions)
- Bet Agent (negotiation logic)
- "Play vs Agent" mode

### ✅ Phase 4: Hedera Integration (Oct 17–19)
- Deploy to Hedera testnet
- Agent Kit for messaging
- Fast transaction finality
- Agent negotiation chat

### ✅ Phase 5: Testing & Launch (Oct 20–26)
- Full integration testing
- Demo video production
- Documentation completion
- Deployment to production

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Demo Video**: [Coming Soon]
- **Hedera Testnet Explorer**: [Contract Address]
- **Documentation**: See [TODO.md](TODO.md) for detailed roadmap

## 🤝 Contributing

This project was co-developed with AI assistance. See individual commits for attribution.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **ETHOnline 2024** - For the hackathon opportunity
- **PYUSD** - For stablecoin integration
- **ASI (SingularityNET)** - For AI agent framework
- **Hedera** - For fast, sustainable blockchain infrastructure
- **AI Attribution** - Plan and code co-developed with Claude Code

## 📧 Contact

For questions or collaboration: [ashishregmi2017@gmail.com]

---

**Built with ❤️ for ETHOnline 2024**
