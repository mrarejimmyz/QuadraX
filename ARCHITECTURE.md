# QuadraX Architecture Guide

## 📐 Project Structure (V2 - Scalable)

```
QuadraX/
├── config/                         # Centralized configuration
│   └── index.js                   # Main config file
│
├── contracts/                      # Smart contracts (modular)
│   ├── core/                      # Core contract implementations
│   │   ├── TicTacToe.sol         # Original implementation
│   │   ├── TicTacToeV2.sol       # Refactored with libraries
│   │   └── PYUSDStaking.sol      # Staking contract
│   ├── interfaces/                # Contract interfaces
│   │   ├── IGame.sol             # Game interface
│   │   └── IStaking.sol          # Staking interface
│   ├── libraries/                 # Reusable libraries
│   │   └── GameLogic.sol         # Game logic utilities
│   ├── governance/                # Future: DAO contracts
│   └── test/                      # Test contracts
│       └── MockERC20.sol         # Mock PYUSD
│
├── frontend/                       # Next.js application
│   ├── public/                    # Static assets
│   └── src/
│       ├── app/                   # Next.js App Router
│       │   ├── layout.tsx        # Root layout
│       │   ├── page.tsx          # Home page
│       │   ├── game/             # Game page
│       │   ├── providers.tsx     # Web3 providers
│       │   └── globals.css       # Global styles
│       ├── features/              # Feature-based modules
│       │   ├── game/             # Game feature
│       │   │   ├── Board.tsx
│       │   │   ├── GameInfo.tsx
│       │   │   ├── AIChat.tsx
│       │   │   └── index.ts
│       │   ├── staking/          # Staking feature
│       │   │   ├── StakingPanel.tsx
│       │   │   └── index.ts
│       │   └── wallet/           # Wallet feature (future)
│       ├── lib/                   # Shared utilities
│       │   ├── constants/        # Constants
│       │   │   └── contracts.ts  # Contract addresses
│       │   ├── hooks/            # Custom hooks
│       │   │   ├── useGameState.ts
│       │   │   └── useContract.ts
│       │   ├── types/            # TypeScript types
│       │   │   └── game.ts
│       │   └── utils/            # Utility functions
│       │       └── gameHelpers.ts
│       └── components/            # Shared components (future)
│
├── scripts/                        # Deployment scripts
│   ├── deploy.js                  # Original deployment
│   └── deployV2.js               # V2 deployment with config
│
├── test/                          # Contract tests
│   ├── TicTacToe.test.js         # Original tests
│   ├── TicTacToeV2.test.js       # V2 tests
│   └── PYUSDStaking.test.js      # Staking tests
│
├── .github/workflows/             # CI/CD
│   └── ci.yml                    # GitHub Actions
│
├── deployments/                   # Deployment artifacts
│   └── [network]-latest.json     # Latest deployment info
│
└── docs/                          # Documentation
    ├── README.md                  # Main readme
    ├── ARCHITECTURE.md           # This file
    ├── BUILD.md                  # Build guide
    ├── TESTING.md                # Testing guide
    └── ...
```

## 🏗️ Architecture Patterns

### 1. Contract Architecture (Modular)

**Separation of Concerns:**
- **Core Contracts**: Business logic implementation
- **Interfaces**: Contract ABIs and specifications
- **Libraries**: Reusable, gas-optimized functions
- **Governance**: Future upgradability and DAO

**Benefits:**
- ✅ Easier testing (library functions are pure)
- ✅ Gas optimization (libraries reduce deployment size)
- ✅ Code reusability across contracts
- ✅ Easier upgrades (replace implementations)

**Example: GameLogic Library**
```solidity
// contracts/libraries/GameLogic.sol
library GameLogic {
    function checkWinner(uint8[16] memory board, uint8 symbol)
        internal pure returns (bool) {
        // Reusable logic
    }
}

// contracts/core/TicTacToeV2.sol
import "../libraries/GameLogic.sol";

contract TicTacToeV2 {
    using GameLogic for uint8[16];

    function makeMove(uint8 position) external {
        if (GameLogic.checkWinner(board, symbol)) {
            // Handle win
        }
    }
}
```

### 2. Frontend Architecture (Feature-Based)

**Feature Modules:**
Each feature is self-contained with its own:
- Components
- Hooks
- Types
- Utils

**Shared Libraries:**
- `/lib/constants`: Configuration and constants
- `/lib/hooks`: Reusable React hooks
- `/lib/types`: Shared TypeScript types
- `/lib/utils`: Pure utility functions

**Benefits:**
- ✅ Better code organization
- ✅ Easier to find related code
- ✅ Scalable for large teams
- ✅ Clear dependencies

**Example: Game Feature**
```
features/game/
├── Board.tsx           # Board component
├── GameInfo.tsx        # Game status component
├── AIChat.tsx          # AI chat component
├── useGameLogic.ts     # Game logic hook (future)
└── index.ts            # Public exports
```

### 3. Configuration Management

**Centralized Config:**
All configuration in one place (`config/index.js`):
- Contract settings
- Network configuration
- Platform parameters
- Testing configuration

**Benefits:**
- ✅ Single source of truth
- ✅ Easy to update settings
- ✅ Environment-specific configs
- ✅ Type-safe (with JSDoc or TS)

**Usage:**
```javascript
const config = require('./config');

// Deploy with config
const staking = await PYUSDStaking.deploy(
    pyusdAddress,
    platformWallet,
    config.platform.feeBasisPoints
);
```

## 🔄 Data Flow

### Game Flow

```
User Action (Frontend)
    ↓
Hook (useGameState)
    ↓
Contract Call (via Wagmi)
    ↓
Smart Contract (TicTacToeV2)
    ↓
Library (GameLogic)
    ↓
Event Emission
    ↓
Frontend Update (via Wagmi)
    ↓
UI Re-render
```

### Staking Flow

```
User Stakes PYUSD
    ↓
Approve PYUSD Spending
    ↓
Call stake() on PYUSDStaking
    ↓
Transfer PYUSD to Contract
    ↓
Update Game State
    ↓
Emit PlayerStaked Event
    ↓
Frontend Updates Balance
```

## 🎨 Design Patterns

### Smart Contracts

1. **Library Pattern**: Reusable logic in libraries
2. **Interface Pattern**: Clear contract interfaces
3. **Modifier Pattern**: Access control and guards
4. **Event Pattern**: Comprehensive event logging
5. **Pull Payment**: Winner pulls payout (security)

### Frontend

1. **Feature-Based Structure**: Group by feature, not type
2. **Custom Hooks**: Encapsulate logic
3. **Composition**: Small, reusable components
4. **Type Safety**: TypeScript throughout
5. **Separation of Concerns**: UI vs Logic vs State

## 🔐 Security Patterns

### Contract Level

- ✅ ReentrancyGuard on financial functions
- ✅ Access control modifiers
- ✅ Input validation in libraries
- ✅ Safe math (Solidity 0.8.20)
- ✅ Events for audit trail

### Frontend Level

- ✅ No sensitive data in client
- ✅ Secure wallet connection
- ✅ Transaction validation
- ✅ Error boundaries
- ✅ Input sanitization

## 📈 Scalability Considerations

### Current Capacity

- **Concurrent Games**: Unlimited (independent contracts)
- **Players per Game**: 2 (can extend to N)
- **Stake Limits**: Configurable per game
- **Transaction Cost**: ~100k-150k gas per move

### Future Enhancements

1. **Multi-Game Support**
   - Factory pattern for game creation
   - Game registry contract
   - Batch operations

2. **Tournament Mode**
   - Bracket management contract
   - Prize pool distribution
   - Leaderboard tracking

3. **DAO Governance**
   - Platform fee voting
   - Feature proposals
   - Treasury management

4. **Layer 2 Integration**
   - Optimistic rollup for cheaper games
   - ZK proofs for privacy
   - Cross-chain bridges

## 🧪 Testing Strategy

### Unit Tests

- **Contract Functions**: Test each function independently
- **Library Functions**: Pure functions, easy to test
- **Edge Cases**: Boundary conditions
- **Gas Optimization**: Track gas usage

### Integration Tests

- **Full Game Flow**: Create → Stake → Play → Payout
- **Multi-Player**: Simulate real gameplay
- **Error Scenarios**: Reverts and failures
- **Event Emissions**: Verify all events

### E2E Tests

- **Frontend + Contract**: Full user journey
- **Wallet Integration**: MetaMask flow
- **Transaction Signing**: Approve, stake, play
- **UI Updates**: State synchronization

## 📊 Performance Optimization

### Contract Optimization

- ✅ Library functions (reduce deployment size)
- ✅ Efficient storage layout
- ✅ Batch operations where possible
- ✅ Minimal state changes
- ✅ Event indexing

### Frontend Optimization

- ✅ Code splitting (Next.js automatic)
- ✅ Lazy loading components
- ✅ Optimistic UI updates
- ✅ Memoization (React.memo, useMemo)
- ✅ Image optimization

## 🔮 Future Architecture

### Microservices

```
Frontend (Vercel)
    ↓
API Gateway (Next.js API Routes)
    ↓
├── Game Service (Game logic)
├── AI Service (Agent reasoning)
├── Notification Service (Real-time updates)
└── Analytics Service (Stats, leaderboards)
    ↓
Blockchain (Hedera)
```

### AI Integration

```
User Move
    ↓
AI Agent Service
    ↓
├── Move Predictor (ASI uAgents)
├── Bet Negotiator (MeTTa reasoning)
└── Strategy Analyzer
    ↓
Hedera Agent Kit (Messaging)
    ↓
Frontend Update
```

## 📚 Key Technologies

### Smart Contracts
- **Solidity 0.8.20**: Latest stable version
- **OpenZeppelin**: Audited contract libraries
- **Hardhat**: Development environment

### Frontend
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Wagmi + Viem**: Web3 interactions
- **RainbowKit**: Wallet connection

### Testing
- **Chai**: Assertion library
- **Hardhat Test**: Contract testing
- **Coverage**: Code coverage tools

### DevOps
- **GitHub Actions**: CI/CD
- **Vercel**: Frontend hosting
- **Hedera**: Blockchain network

---

**Version**: 2.0.0
**Last Updated**: October 10, 2024
