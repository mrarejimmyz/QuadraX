# ASI Alliance + Hedera Integration Architecture

## Overview
QuadraX uses **ASI Alliance agents** for intelligent gameplay and negotiation, with plans to integrate **Hedera** for decentralized contract deployment and treasury management.

---

## Current Implementation (Phase 1)

### ASI Alliance Negotiator Agent
**Location**: `frontend/src/lib/agents/asi-alliance/negotiatorAgent.ts`

**Features**:
- ✅ Intelligent stake negotiation using strategic AI
- ✅ Multi-factor decision making:
  - Stake amount analysis (prefers mid-range 1-100 PYUSD)
  - Sentiment analysis from conversation history
  - User game history (win rate, average stakes)
  - User wallet balance consideration
- ✅ Dynamic response generation (accept/counter/reject)
- ✅ Confidence scoring for each decision
- ✅ Personality-driven negotiation style

**Usage**:
```typescript
import { NegotiatorAgent } from '@/lib/agents/asi-alliance'

const negotiator = new NegotiatorAgent()

const response = await negotiator.negotiate({
  userAddress: '0x...',
  proposedStake: 10,
  conversationHistory: messages,
  userBalance: 1000,
  gameHistory: { gamesPlayed: 5, winRate: 0.6, avgStake: 15 }
})

// Response includes: message, action, proposedAmount, confidence, reasoning
```

### Integration Points

#### 1. Negotiation Flow
```
Homepage → /negotiate (ASI Negotiator) → Agreement → /game
```

- User proposes stake via chat
- ASI Negotiator analyzes and responds intelligently
- Accepts, counters, or rejects based on strategic factors
- Once agreed, proceeds to game setup

#### 2. Game Intelligence
```
/demo or /game → AlphaStrategist → Minimax Analysis → Optimal Move
```

- AlphaStrategist (4-ply minimax) for strategic gameplay
- BetaDefender, GammaAggressor, DeltaAdaptive for varied AI opponents
- HybridBulletproofValidator for move validation

---

## Planned Implementation (Phase 2)

### Hedera Agent Integration

**Purpose**: Deploy smart contracts for stake escrow and treasury management

#### Workflow:
```
1. User + AI agree on stake → ASI Negotiator signals hederaReady: true
2. NegotiatorAgent.prepareHederaDeployment() called
3. Hedera Agent (to be created):
   - Deploys temporary treasury contract
   - Creates escrow for both player stakes
   - Sets up game outcome resolution logic
   - Returns deployment addresses and transaction hashes
4. Game proceeds with on-chain stake verification
5. Winner automatically receives payout via smart contract
```

#### Hedera Agent (Planned)

**Location**: `frontend/src/lib/agents/hedera/` (to be created)

**Responsibilities**:
- Deploy QuadraX treasury contracts on Hedera
- Manage PYUSD escrow accounts
- Handle stake deposits from both players
- Execute payouts based on game outcomes
- Emit events for transparency and auditing

**Integration Method**:
```typescript
// In negotiatorAgent.ts
async prepareHederaDeployment(stake: number, player1: string, player2: string) {
  // Future: Import and use Hedera agent
  const { HederaAgent } = await import('@/lib/agents/hedera')
  const hedera = new HederaAgent()
  
  // Deploy contracts
  const deployment = await hedera.deployTreasury(stake, player1, player2)
  
  return {
    treasuryAddress: deployment.treasuryAddress,
    escrowAddress: deployment.escrowAddress,
    transactionHash: deployment.txHash,
    ready: true
  }
}
```

#### Smart Contract Flow (Hedera)
```solidity
// PseudoCode for Hedera Contract

contract QuadraXTreasury {
  mapping(address => uint256) public stakes;
  address public player1;
  address public player2;
  address public winner;
  
  function depositStake() external payable {
    require(msg.value == agreedStake, "Incorrect stake amount");
    stakes[msg.sender] = msg.value;
  }
  
  function declareWinner(address _winner) external onlyValidator {
    require(stakes[player1] > 0 && stakes[player2] > 0, "Stakes not deposited");
    winner = _winner;
    payable(_winner).transfer(stakes[player1] + stakes[player2]);
  }
}
```

---

## Benefits of ASI + Hedera Integration

### 1. **Trust & Transparency**
- Smart contracts ensure fair payouts
- No reliance on centralized server for fund management
- Immutable game outcome records on Hedera

### 2. **Intelligent UX**
- ASI negotiator makes staking feel natural and conversational
- Strategic AI provides challenging gameplay
- Automated contract deployment reduces friction

### 3. **Scalability**
- Hedera's fast finality (<5 seconds)
- Low transaction fees
- PYUSD support for stablecoin stakes

### 4. **Security**
- Funds locked in escrow until game completion
- Bulletproof validation prevents cheating
- ASI agents can detect suspicious patterns

---

## Integration Checklist

### Phase 1 (Current) ✅
- [x] ASI Negotiator Agent created
- [x] Integrated into /negotiate page
- [x] Multi-factor decision logic
- [x] Sentiment analysis
- [x] User balance consideration
- [x] Placeholder for Hedera deployment

### Phase 2 (Next Steps)
- [ ] Create Hedera Agent class
- [ ] Deploy QuadraX treasury contract to Hedera testnet
- [ ] Integrate PYUSD staking with Hedera
- [ ] Connect ASI Negotiator → Hedera Agent
- [ ] Test full flow: Negotiate → Deploy → Play → Payout
- [ ] Add on-chain game result verification
- [ ] Implement dispute resolution mechanism

### Phase 3 (Advanced)
- [ ] Multi-game treasury pools
- [ ] Tournament mode with Hedera escrow
- [ ] ASI agent portfolio management (stake optimization)
- [ ] Cross-chain bridge for other stablecoins
- [ ] DAO governance for contract upgrades

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      QuadraX Frontend                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   /negotiate │────────▶│ ASI Negotiator│                  │
│  │    Page      │         │    Agent      │                  │
│  └──────────────┘         └───────┬───────┘                  │
│                                   │                          │
│                                   ▼                          │
│                          ┌────────────────┐                  │
│                          │ Agreement      │                  │
│                          │ hederaReady=true│                 │
│                          └────────┬───────┘                  │
│                                   │                          │
│                                   ▼                          │
│                          ┌────────────────┐                  │
│                          │ Hedera Agent   │ ◀─── Future      │
│                          │ (Coming Soon)  │                  │
│                          └────────┬───────┘                  │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    │
                                    ▼
                          ┌────────────────┐
                          │ Hedera Network │
                          ├────────────────┤
                          │ Treasury SC    │
                          │ Escrow Account │
                          │ PYUSD Tokens   │
                          └────────────────┘
```

---

## Example Flow

### User Journey
```
1. User: "I want to play QuadraX"
   → Navigate to homepage

2. User: Click "💬 Negotiate & Stake"
   → /negotiate page loads
   → ASI Negotiator greets user

3. User: "I propose 10 PYUSD"
   → ASI analyzes: stake=10, balance=1000, history=beginner
   → ASI decides: Counter higher (12 PYUSD) - confidence 0.65
   → ASI responds: "10 PYUSD is fair, but let's make it 12 PYUSD!"

4. User: "I accept"
   → ASI accepts
   → agreedStake = 12
   → hederaReady = true

5. User: Click "Proceed to Staking"
   → negotiator.prepareHederaDeployment(12, userAddr, aiAddr)
   → (Future) Hedera deploys treasury contract
   → (Future) User deposits 12 PYUSD to escrow
   → Navigate to /game?stake=12

6. Game plays out
   → Winner determined by game logic
   → (Future) Smart contract pays out 24 PYUSD to winner
```

---

## Debugging

### Check ASI Negotiator Logs
```javascript
// Console output during negotiation
🤖 ASI Alliance Negotiator initialized
🤖 ASI Negotiation: {
  action: 'counter',
  confidence: 0.65,
  reasoning: 'Countering higher to increase engagement',
  hederaReady: false
}
```

### Check Hedera Deployment (Future)
```javascript
🚀 Preparing Hedera deployment...
  Stake: 12 PYUSD
  Player 1: 0xb9966f...
  Player 2: AI_OPPONENT
📋 Hedera deployment details: { ready: true, treasuryAddress: null }
```

---

## Resources

- **ASI Alliance Docs**: https://asi.alliance.ai
- **Hedera Docs**: https://docs.hedera.com
- **PYUSD on Hedera**: https://www.paypal.com/pyusd
- **QuadraX Repo**: https://github.com/mrarejimmyz/QuadraX

---

## Contributing

To add Hedera integration:
1. Create `frontend/src/lib/agents/hedera/index.ts`
2. Implement `HederaAgent` class with treasury deployment
3. Update `negotiatorAgent.ts` to import and use Hedera agent
4. Test on Hedera testnet first
5. Deploy PYUSD-compatible contract
6. Submit PR with tests and documentation

**Questions?** Open an issue on GitHub!
