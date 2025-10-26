# 🤖 AI Referee Agent - Trustless Game Validation & Automatic Payouts

## Overview

The **AI Referee Agent** is an autonomous system that validates every move in QuadraX games and automatically triggers payouts to winners. It's the **only entity** authorized to call `declareWinner` on the smart contract, making it impossible to bypass or cheat.

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│   Frontend  │──────>│  AI Referee  │──────>│ Smart Contract  │
│  (Players)  │ Move  │    Agent     │ Winner│  (Staking)      │
└─────────────┘       └──────────────┘       └─────────────────┘
                            │
                            ├─ Validates moves
                            ├─ Detects cheating
                            ├─ Checks win conditions
                            └─ Triggers payout
```

## Security Model

### 🔒 Contract-Level Protection

The smart contract has an `onlyReferee` modifier:

```solidity
modifier onlyReferee() {
    require(msg.sender == gameReferee, "Only AI Referee can call this");
    _;
}

function declareWinner(uint256 gameId, address winnerAddress) 
    external nonReentrant onlyReferee {
    // Only the AI Referee can call this
    // Payout happens automatically
}
```

### ✅ What the Referee Validates

1. **Turn Order** - Ensures correct player makes each move
2. **Move Legality** - Checks if moves follow game rules
3. **Piece Limit** - Each player can only place 4 pieces (placement phase)
4. **Cell Occupancy** - Prevents placing on occupied cells
5. **Piece Ownership** - Ensures players only move their own pieces
6. **Movement Freedom** - Pieces can move to ANY empty cell (no adjacency restriction)
7. **Win Conditions** - Detects 4-in-a-row (horizontal/vertical/diagonal)
8. **Fraud Detection** - Flags suspicious patterns

### 🎮 QuadraX Game Rules

**Placement Phase:**
- Each player places 4 pieces alternately
- Cannot place on occupied cells
- Can win during placement if pieces form a line

**Movement Phase:**
- Players can move ANY of their 4 pieces to ANY empty cell
- No adjacency restriction - pieces can "teleport"
- Strategic repositioning to form winning patterns
- First to get 4-in-a-row wins!

### 🚨 Fraud Prevention

If the referee detects:
- Wrong player making a move
- Invalid cell placement
- Non-adjacent movement
- Moving opponent's piece
- Any rule violation

**Result:** Move is rejected, game continues without processing the invalid move.

## How It Works

### 1. Game Start

```javascript
// Frontend creates game and both players stake
await staking.createGame(player2Address)
await staking.stake(gameId, amount) // Both players
```

### 2. Every Move is Validated

```javascript
// Player makes a move
handleCellClick(5) // Place piece at position 5

// Frontend sends to referee
const result = await submitMoveToReferee(gameId, {
  player: 1,
  type: 'placement',
  to: 5,
  timestamp: Date.now()
}, player1Address, player2Address)
```

### 3. Referee Process

```typescript
// Backend API (/api/referee)
const referee = getGameReferee()

// Validate move
const validation = referee.validateMove(gameId, move)
if (!validation.isValid) {
  return { success: false, fraudDetected: true }
}

// Record move
referee.recordMove(gameId, move)

// Check for winner
const winner = referee.checkWinner(gameId)
if (winner) {
  // Automatically trigger payout!
  const txHash = await referee.triggerPayout(gameId, winnerAddress)
  return { success: true, winner, payoutHash: txHash }
}
```

### 4. Automatic Payout

```typescript
// Referee calls smart contract
await walletClient.writeContract({
  address: STAKING_CONTRACT_ADDRESS,
  functionName: 'declareWinner',
  args: [gameId, winnerAddress]
})

// Contract automatically sends PYUSD to winner
// No user signature required!
```

## Setup

### 1. Generate Referee Wallet

```bash
# Generate a new Ethereum wallet for the referee
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

### 2. Fund Referee Wallet

The referee needs ETH/HBAR for gas to call `declareWinner`:

```bash
# Sepolia Testnet
# Send ~0.1 ETH to referee address for gas
```

### 3. Configure Environment

Add to `.env.local`:

```bash
# AI Referee Agent Configuration
REFEREE_PRIVATE_KEY=0x... # Private key from step 1
REFEREE_WALLET=0x...      # Public address from step 1
```

### 4. Deploy Contract with Referee

```bash
# Deploy staking contract with referee address
REFEREE_WALLET=0x... npm run deploy:sepolia
```

### 5. Start Referee Agent

```bash
# Frontend Next.js server automatically runs referee
npm run dev
```

The referee agent runs as a Next.js API route at `/api/referee`.

## API Endpoints

### POST /api/referee

Submit a move for validation:

```typescript
POST /api/referee
{
  "gameId": "12",
  "move": {
    "player": 1,
    "type": "placement",
    "to": 5,
    "timestamp": 1234567890
  },
  "player1Address": "0x...",
  "player2Address": "0x..."
}

// Response if move is valid
{
  "success": true,
  "message": "Move validated - game continues"
}

// Response if player won
{
  "success": true,
  "winner": "0x...",
  "payoutHash": "0xabc123...",
  "message": "Winner detected - payout automatically triggered"
}

// Response if fraud detected
{
  "success": false,
  "error": "Invalid move rejected by referee",
  "fraudDetected": true
}
```

### GET /api/referee

Health check:

```typescript
GET /api/referee

{
  "status": "healthy",
  "refereeActive": true,
  "message": "AI Referee Agent is running"
}
```

## Game Flow

### Complete E2E Flow

```
1. Negotiate stake amount
   ↓
2. Create game on contract
   ↓
3. Both players stake PYUSD
   ↓
4. Game starts
   ↓
5. Player makes move
   ├─> Frontend updates UI
   └─> Sends to /api/referee
       ├─> Referee validates move
       ├─> Records move
       └─> Checks for winner
           ├─> If no winner: continue
           └─> If winner:
               ├─> Call contract.declareWinner()
               └─> PYUSD auto-sent to winner! 💰
```

## Benefits

### ✅ Zero User Friction
- Players don't sign payout transactions
- No MetaMask popup after game ends
- Instant payout upon win

### ✅ Impossible to Cheat
- Only referee can declare winners
- All moves validated server-side
- Contract enforces referee-only access

### ✅ Transparent & Trustless
- Referee code is open source
- All moves logged on-chain
- Anyone can audit game history

### ✅ Cost Efficient
- Players only pay gas for: create game + stake
- Referee pays gas for payout (~$0.50)
- Platform can subsidize this cost

## Monitoring

### Referee Logs

```bash
# View referee activity
📨 Referee received move for game 12: { player: 1, type: 'placement', to: 5 }
🔍 Referee validating move...
✅ Move validated
📝 Move recorded. Board: 0:· 1:· 2:· 3:· 4:· 5:X 6:· ...
🏆 REFEREE: Player 1 wins!
💰 REFEREE: Triggering automatic payout...
✅ REFEREE: Payout transaction submitted: 0xabc123...
✅ REFEREE: Payout confirmed!
```

### Contract Events

```solidity
event WinnerPaid(uint256 indexed gameId, address indexed winner, uint256 amount);
```

## Upgrading the Referee

If you need to rotate keys or upgrade the referee:

```solidity
// Only platform wallet can update referee
function updateReferee(address newReferee) external {
    require(msg.sender == platformWallet, "Only platform");
    gameReferee = newReferee;
    emit RefereeUpdated(oldReferee, newReferee);
}
```

```bash
# Deploy new referee
1. Generate new wallet
2. Fund with gas
3. Update .env with new REFEREE_PRIVATE_KEY
4. Call staking.updateReferee(newAddress)
5. Restart Next.js server
```

## Security Considerations

### ✅ Referee Private Key
- Store securely (use AWS Secrets Manager, Azure Key Vault, etc.)
- Never commit to git
- Rotate periodically

### ✅ Gas Management
- Monitor referee wallet balance
- Auto-alert when low on gas
- Keep at least 0.1 ETH for ~200 games

### ✅ Rate Limiting
- Prevent spam moves
- Max 1 move per second per player
- DDoS protection on /api/referee

### ✅ Fallback Mechanism
- If referee goes offline, manual override available
- Platform wallet can update referee
- Emergency pause function (future enhancement)

## Future Enhancements

- [ ] Multi-sig referee (3-of-5 validators)
- [ ] Chainlink oracle integration
- [ ] Move replay verification
- [ ] AI move prediction validation
- [ ] Automated gas top-up
- [ ] Cross-chain referee (Hedera + Sepolia)

## Testing

```bash
# Test referee validation
npm run test:referee

# Test end-to-end with referee
npm run test:e2e
```

## Support

If referee agent issues:
1. Check `/api/referee` health endpoint
2. Verify REFEREE_PRIVATE_KEY in .env
3. Check referee wallet has gas
4. Review server logs for errors

---

**Built for ETHGlobal Bangkok 2024** 🇹🇭
