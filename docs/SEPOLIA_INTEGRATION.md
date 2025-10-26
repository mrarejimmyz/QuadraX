# Sepolia Contract Integration Guide

## Overview

QuadraX now supports **on-chain PYUSD staking** on Sepolia testnet! The ASI Alliance Negotiator creates games on-chain and manages stakes through smart contracts.

---

## Architecture

```
User → ASI Negotiator → Agreement → Deploy Game → Stake PYUSD → Play → Winner Gets Payout
```

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   /negotiate Page                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. User proposes stake: "10 PYUSD"                     │ │
│  │ 2. ASI Negotiator analyzes and responds                │ │
│  │ 3. User accepts agreed stake                           │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              SepoliaContractManager                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. createGame(player1, player2)                        │ │
│  │    → Returns gameId                                    │ │
│  │                                                         │ │
│  │ 2. approvePYUSD(amount)                                │ │
│  │    → User approves staking contract                    │ │
│  │                                                         │ │
│  │ 3. stakeForGame(gameId, amount)                        │ │
│  │    → Locks PYUSD in escrow                             │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│             Sepolia Network (Chain ID: 11155111)             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ PYUSDStaking Contract                                  │ │
│  │ ├── games[gameId]                                      │ │
│  │ ├── player1/player2 stakes                             │ │
│  │ ├── totalPot (player1 + player2)                       │ │
│  │ └── winner payout logic                                │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ PYUSD Token (0xCaC524...B3bB9)                         │ │
│  │ ├── balanceOf(user)                                    │ │
│  │ ├── allowance(user, stakingContract)                   │ │
│  │ └── transfer(winner, payout)                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Smart Contracts

### PYUSDStaking Contract

**Purpose**: Manages PYUSD stakes and payouts for QuadraX games

**Key Functions**:

```solidity
// Create a new game
function createGame(address player2) returns (uint256 gameId)

// Stake PYUSD for a game
function stake(uint256 gameId, uint256 amount)

// Declare winner and auto-payout
function declareWinner(uint256 gameId, address winner)

// Handle ties with refunds
function declareTie(uint256 gameId)
```

**Features**:
- ✅ Minimum stake: 1 PYUSD
- ✅ Platform fee: 0.25% (25 basis points)
- ✅ Automatic winner payouts
- ✅ Tie refunds
- ✅ Reentrancy protection
- ✅ Game state validation

---

## Frontend Integration

### 1. Negotiation Phase

**File**: `src/app/negotiate/page.tsx`

When user and AI agree on stake:
```typescript
const deployment = await negotiator.prepareContractDeployment(
  agreedStake,
  userAddress,
  aiAddress
)

// Returns:
{
  ready: true,
  gameId: "123",
  transactionHash: "0x...",
  requiresStaking: true
}
```

### 2. Contract Manager

**File**: `src/lib/contracts/sepoliaManager.ts`

```typescript
import { getContractManager } from '@/lib/contracts/sepoliaManager'

const manager = getContractManager()

// Check if contracts are deployed
if (manager.isContractDeployed()) {
  // Create game
  const game = await manager.createGame(player1, player2)
  
  // Stake PYUSD
  const result = await manager.stakeForGame(gameId, userAddress, amount)
  
  // Declare winner
  await manager.declareWinner(gameId, winnerAddress, callerAddress)
}
```

### 3. PYUSD Approval Flow

```typescript
// 1. Check balance
const balance = await manager.getPYUSDBalance(userAddress)

// 2. Check allowance
const allowance = await manager.getPYUSDAllowance(userAddress)

// 3. If insufficient, request approval
if (allowance < stakeAmount) {
  await manager.approvePYUSD(userAddress, stakeAmount)
}

// 4. Stake
await manager.stakeForGame(gameId, userAddress, stakeAmount)
```

---

## Deployment

### Step 1: Deploy Contract

```bash
# From root directory
cd c:\Users\mrare\OneDrive\Documents\QuadraX

# Deploy to Sepolia
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

### Step 2: Update Frontend Config

Copy the deployed contract address and update:

**File**: `frontend/src/contracts/addresses.ts`

```typescript
export const CONTRACTS = {
  sepolia: {
    PYUSD: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
    PYUSDStaking: '0xYOUR_DEPLOYED_ADDRESS_HERE', // ← Update this
    TicTacToe: '',
  }
}
```

### Step 3: Verify Contract (Optional)

```bash
npx hardhat verify --network sepolia \
  YOUR_CONTRACT_ADDRESS \
  "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9" \
  "YOUR_PLATFORM_WALLET"
```

---

## Testing the Integration

### 1. Get Test PYUSD

**Option A**: Faucet (if available)
```
Visit PYUSD testnet faucet
```

**Option B**: Swap Sepolia ETH
```
Use Uniswap or other DEX on Sepolia
```

### 2. Test Flow

```
1. Connect wallet on /negotiate page
2. Propose stake: "5 PYUSD"
3. Negotiate with ASI agent
4. Accept agreed stake
5. Click "Proceed to Staking"
   → Game created on-chain (check console for gameId)
6. Approve PYUSD (MetaMask popup)
7. Stake PYUSD (MetaMask popup)
8. Game starts when both players stake
9. Play game
10. Winner automatically receives payout
```

### 3. Check Transactions

Monitor on Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

---

## Console Logs

### Successful Flow

```javascript
🤖 ASI Alliance Negotiator initialized
🤖 ASI Negotiation: {
  action: 'accept',
  confidence: 0.85,
  hederaReady: true
}

🚀 Preparing Sepolia contract deployment...
  Stake: 5 PYUSD
  Player 1: 0xb9966f...
  Player 2: 0x000000...

📝 Creating game on-chain...
  Transaction hash: 0xabc123...
✅ Game created with ID: 0

✅ Approving PYUSD...
  Amount: 5000000 (5.0 PYUSD)
✅ PYUSD approved

💰 Staking PYUSD...
  Game ID: 0
  Amount: 5000000 (5.0 PYUSD)
  Transaction hash: 0xdef456...
✅ Stake successful!

📋 Sepolia deployment details: {
  ready: true,
  gameId: "0",
  transactionHash: "0xabc123...",
  requiresStaking: true
}
```

### If Contract Not Deployed

```javascript
⚠️ PYUSDStaking contract not deployed on Sepolia

📋 Sepolia deployment details: {
  ready: false,
  message: "PYUSDStaking contract not yet deployed...",
  requiresStaking: false
}

// Game proceeds without on-chain stakes
```

---

## Troubleshooting

### Contract Not Deployed Error

**Problem**: `PYUSDStaking contract not deployed on Sepolia`

**Solution**:
1. Deploy contract: `npx hardhat run scripts/deploy-sepolia.js --network sepolia`
2. Update `frontend/src/contracts/addresses.ts` with deployed address

### Insufficient Balance

**Problem**: `Transfer failed` or `Insufficient balance`

**Solution**:
- Get Sepolia PYUSD from faucet or DEX
- Check balance: `await manager.getPYUSDBalance(address)`

### Approval Failed

**Problem**: `Approval transaction reverted`

**Solution**:
- Increase gas limit
- Check PYUSD contract is correct: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`

### Game Not Starting

**Problem**: Both players staked but game not starting

**Solution**:
- Check game details: `await manager.getGameDetails(gameId)`
- Verify both `player1Staked` and `player2Staked` are `true`

---

## API Reference

### SepoliaContractManager

```typescript
class SepoliaContractManager {
  // Check if contract is deployed
  isContractDeployed(): boolean
  
  // Create new game
  createGame(player1: Address, player2: Address): Promise<GameDeployment>
  
  // Check PYUSD balance
  getPYUSDBalance(address: Address): Promise<bigint>
  
  // Check allowance
  getPYUSDAllowance(owner: Address): Promise<bigint>
  
  // Approve PYUSD
  approvePYUSD(user: Address, amount: bigint): Promise<Hash>
  
  // Stake for game
  stakeForGame(gameId: bigint, user: Address, amount: bigint): Promise<StakeResult>
  
  // Get game details
  getGameDetails(gameId: bigint): Promise<GameData>
  
  // Declare winner
  declareWinner(gameId: bigint, winner: Address, caller: Address): Promise<Hash>
}
```

### Types

```typescript
interface GameDeployment {
  gameId: bigint
  player1: Address
  player2: Address
  stakeAmount: bigint
  transactionHash: Hash
  ready: boolean
}

interface StakeResult {
  success: boolean
  transactionHash: Hash
  gameStarted: boolean
  error?: string
}
```

---

## Future Enhancements

### Phase 1 (Current) ✅
- [x] ASI Negotiator integration
- [x] Sepolia contract deployment
- [x] PYUSD approval flow
- [x] On-chain game creation
- [x] Stake management

### Phase 2 (Next)
- [ ] AI wallet for automated opponent staking
- [ ] Automatic winner declaration from game logic
- [ ] Multi-game treasury pools
- [ ] Tournament mode with brackets

### Phase 3 (Advanced)
- [ ] Cross-chain support (Hedera, Polygon)
- [ ] NFT rewards for winners
- [ ] Leaderboard with on-chain stats
- [ ] DAO governance for platform fees

---

## Resources

- **PYUSD on Sepolia**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **Sepolia Explorer**: https://sepolia.etherscan.io
- **Sepolia Faucet**: https://sepoliafaucet.com
- **Hardhat Docs**: https://hardhat.org/getting-started
- **Viem Docs**: https://viem.sh

---

## Support

**Issues?** Check:
1. Console logs for detailed error messages
2. Etherscan for transaction status
3. Wallet balance (both ETH and PYUSD)
4. Contract deployment status

**Questions?** Open an issue on GitHub!
