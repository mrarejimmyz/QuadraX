# QuadraX Architecture

**Blockchain-Powered Gaming Platform with AI Agents**

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Game UI    │  │  AI Chat UI  │  │ Staking UI   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         React Components & Feature Modules        │      │
│  └──────────────────────────────────────────────────┘      │
│         │                  │                  │              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Wagmi/Viem   │  │ Ollama AI    │  │  Game Logic  │      │
│  │  (Web3)      │  │  (Llama 3.2) │  │  (Local)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
         │                  │                  
         │                  │                  
         ▼                  ▼                  
┌──────────────────┐  ┌──────────────────┐
│  Blockchain      │  │   Ollama API     │
│  (Ethereum)      │  │   (localhost)    │
│                  │  │                  │
│ ┌──────────────┐ │  │ ┌──────────────┐ │
│ │ TicTacToe.sol│ │  │ │ llama3.2     │ │
│ └──────────────┘ │  │ │ (GPU/CUDA)   │ │
│ ┌──────────────┐ │  │ └──────────────┘ │
│ │PYUSDStaking  │ │  └──────────────────┘
│ │    .sol      │ │
│ └──────────────┘ │
└──────────────────┘
```

---

## 📦 Technology Stack

### Frontend
- **Framework**: Next.js 14.2.33 (React 18, App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.1
- **Web3**: Wagmi 2.18.0, Viem 2.38.0
- **AI Integration**: Ollama API (REST)

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat 2.22.16
- **Libraries**: OpenZeppelin Contracts 5.2.0
- **Testing**: Chai, Ethers.js 6.x

### AI System
- **Model**: Llama 3.2:latest (2GB parameter model)
- **Engine**: Ollama 0.12.5
- **Acceleration**: CUDA 12.4 (RTX 3070 GPU)
- **Performance**: ~103 tokens/s (GPU), ~12 tokens/s (CPU)

### Development
- **Package Manager**: npm
- **Node.js**: v20.10.0+
- **Git**: Version control
- **Environment**: Windows 11 (primary), cross-platform compatible

---

## 🎮 Core Components

### 1. Game Engine (Frontend)
**Location**: `/frontend/src/lib/utils/gameLogic.ts`

**Responsibilities**:
- 4x4 board state management
- Win condition checking (horizontal, vertical, diagonal, 2x2 square)
- Move validation
- Phase management (placement → movement)
- Piece counting and positioning

**Key Features**:
- Max 4 pieces per player
- Placement phase: Place pieces on empty squares
- Movement phase: Move pieces to adjacent squares
- Win detection: 4-in-a-row or 2x2 square

---

### 2. Smart Contracts (Blockchain)

#### TicTacToe.sol
**Location**: `/contracts/core/TicTacToe.sol`

**Purpose**: On-chain game state and validation

**Key Functions**:
```solidity
createGame(address player2) returns (uint256 gameId)
makeMove(uint256 gameId, uint8 position)
declareWinner(uint256 gameId) returns (address winner)
```

**Features**:
- Gas-optimized storage
- Reentrancy protection
- Event emissions for UI updates
- Player turn enforcement

#### PYUSDStaking.sol
**Location**: `/contracts/core/PYUSDStaking.sol`

**Purpose**: PYUSD stake management and payouts

**Key Functions**:
```solidity
stake(uint256 gameId, uint256 amount)
withdraw(uint256 gameId)
distributePayout(uint256 gameId, address winner)
```

**Economics**:
- Platform fee: 0.25% (25 basis points)
- Min stake: 1 PYUSD (1e6 with 6 decimals)
- Max stake: 10 PYUSD (configurable)
- Winner gets: ~99.75% of total pot

**Example**:
```
Player 1: 5 PYUSD
Player 2: 5 PYUSD
Total Pot: 10 PYUSD
Platform Fee: 0.025 PYUSD (0.25%)
Winner Gets: 9.975 PYUSD
```

---

### 3. AI Agent System (QuadraX Agents)

**Location**: `/frontend/src/lib/agents/quadraXAgent.ts`

**Architecture**:
```typescript
class QuadraXAgent {
  // Core properties
  name: string
  personality: AgentPersonality
  llmConnection: OllamaConnection
  
  // Main capabilities
  analyzeQuadraXPosition()     // Board analysis
  calculateQuadraXStake()      // Stake calculation (Kelly Criterion)
  negotiateQuadraXStake()      // Negotiation logic
  selectQuadraXMove()          // Move selection
}
```

**4 Agent Personalities**:

| Agent | Risk Profile | Strategy | Stake Behavior |
|-------|-------------|----------|----------------|
| **Conservative Defender** | Low | Defensive, safe plays | Min stakes, cautious |
| **Aggressive Attacker** | High | Offensive, risky moves | Max stakes, bold |
| **Adaptive Strategist** | Medium | Adjusts to opponent | Variable stakes |
| **Balanced Player** | Medium | Mix of all | Balanced stakes |

**AI Capabilities**:

1. **Position Analysis**
   - Board evaluation
   - Threat assessment
   - Win probability calculation
   - Strategic recommendation

2. **Stake Calculation**
   - Kelly Criterion formula
   - Risk tolerance adjustment
   - Balance consideration
   - Opponent profiling

3. **Negotiation**
   - Accept/Counter/Reject decisions
   - Natural language generation (Ollama)
   - Context-aware responses
   - Dynamic agreement detection

4. **Move Selection**
   - Strategic positioning
   - Threat response
   - Winning move identification
   - Backup move planning

---

### 4. Ollama Integration

**Location**: `/frontend/src/services/ollamaService.ts`

**API Endpoint**: `http://localhost:11434/api/generate`

**Usage**:
```typescript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2:latest',
    prompt: aiPrompt,
    stream: false,
    options: {
      temperature: 0.85,  // Conversational variety
      top_p: 0.9,         // Nucleus sampling
      num_predict: 150    // Max tokens
    }
  })
})
```

**Features**:
- Natural language understanding
- Conversation context tracking
- Dynamic response generation
- GPU acceleration (CUDA)

---

## 🔄 Data Flow

### Game Creation Flow
```
1. User connects wallet → Wagmi/Viem
2. User negotiates stake → AI Chat (Ollama)
3. User confirms stake → StakeConfirmation modal
4. Approve PYUSD → ERC20.approve()
5. Create game → TicTacToe.createGame()
6. Lock stake → PYUSDStaking.stake()
7. Game starts → Both players staked
```

### Gameplay Flow
```
1. User places piece → Frontend validation
2. Submit move → TicTacToe.makeMove()
3. Contract validates → Event emitted
4. Frontend updates → UI refresh
5. AI suggests → QuadraXAgent.selectMove()
6. Check win → Frontend + Contract
7. Declare winner → TicTacToe.declareWinner()
8. Distribute payout → PYUSDStaking.distributePayout()
```

### AI Negotiation Flow
```
1. User message → AIChat component
2. Build context → Last 5 messages
3. Generate prompt → Agent personality + context
4. Call Ollama → llama3.2:latest (GPU)
5. Parse response → Extract stake, detect agreement
6. Check bounds → 1-10 PYUSD validation
7. Display response → Conversational UI
8. Agreement detected → Show StakeConfirmation modal
```

---

## 🔐 Security Considerations

### Smart Contracts
- ✅ OpenZeppelin security patterns
- ✅ ReentrancyGuard on financial functions
- ✅ Access control (onlyPlayer modifiers)
- ✅ Input validation (bounds checking)
- ✅ Event emissions for transparency
- ⚠️ **TODO**: External security audit before mainnet

### Frontend
- ✅ TypeScript type safety
- ✅ Input sanitization
- ✅ Wallet connection security (Wagmi best practices)
- ✅ Environment variable protection
- ⚠️ **TODO**: CSP headers, rate limiting

### AI System
- ✅ Local Ollama (no data sent to external APIs)
- ✅ Prompt injection prevention
- ✅ Stake bounds enforcement (1-10 PYUSD)
- ⚠️ **TODO**: Advanced prompt filtering

---

## 📊 Performance Metrics

### Smart Contracts
- Gas cost per move: ~50,000-70,000 gas
- Deployment cost: ~1,500,000 gas
- Test coverage: 39/39 tests passing

### Frontend
- Build time: ~30-45 seconds
- Page load: <2 seconds
- Bundle size: ~300KB (optimized)

### AI System
- **GPU Mode**: 103.74 tokens/s (CUDA)
- **CPU Mode**: 12.59 tokens/s (fallback)
- Response time: 1-3 seconds average
- Model size: 2GB (llama3.2:latest)

---

## 🚀 Deployment Architecture

### Development
```
localhost:3000    → Next.js dev server
localhost:8545    → Hardhat local node
localhost:11434   → Ollama API
```

### Production (Planned)
```
Vercel/Netlify    → Frontend hosting
Ethereum Mainnet  → Smart contracts
Self-hosted       → Ollama API (GPU server)
IPFS              → Decentralized storage (future)
```

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `hardhat.config.js` | Solidity 0.8.20, networks, gas settings |
| `next.config.js` | Webpack, ESM support, optimizations |
| `tailwind.config.js` | Dark theme, custom colors |
| `tsconfig.json` | ES2020, strict mode, path aliases |
| `.env.example` | Environment variable template |

---

## 📈 Scalability Considerations

### Current Limits
- Max concurrent games: Limited by blockchain throughput
- AI response time: 1-3 seconds (GPU-dependent)
- Stake range: 1-10 PYUSD (configurable)

### Future Improvements
- Layer 2 scaling (Optimism, Arbitrum)
- AI model optimization (quantization)
- Distributed Ollama instances
- WebSocket for real-time updates
- IPFS for game replays

---

## 🧪 Testing Strategy

### Unit Tests
- Smart contracts: Hardhat + Chai
- React components: Jest + React Testing Library
- Agent logic: Node.js + custom assertions

### Integration Tests
- E2E: Playwright (planned)
- AI flow: test-ai-negotiation-flow.mjs
- Contract interaction: Hardhat network tests

### Manual Tests
- UI/UX testing
- Ollama integration
- Wallet connectivity
- GPU acceleration

---

## 📚 Design Patterns

### Smart Contracts
- Factory pattern (game creation)
- Access control (OpenZeppelin Ownable)
- Reentrancy guard (OpenZeppelin)
- Event-driven architecture

### Frontend
- Component composition (React)
- Custom hooks (useGameState, useTicTacToe)
- Service layer (Ollama, agent manager)
- Feature-based organization

### AI System
- Strategy pattern (agent personalities)
- Observer pattern (conversation tracking)
- Template method (agent base class)

---

## 🎯 Future Architecture

### Phase 2: Multiplayer
- WebRTC for real-time gameplay
- Matchmaking system
- ELO rating system
- Tournament brackets

### Phase 3: Advanced AI
- Fine-tuned QuadraX model
- Multi-agent collaboration
- Reinforcement learning
- On-chain AI verification

### Phase 4: Decentralization
- IPFS game storage
- Decentralized Ollama nodes
- DAO governance
- Cross-chain support

---

**Last Updated**: October 13, 2025  
**Version**: 1.0.0 (Clean Architecture)
