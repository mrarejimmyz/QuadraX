# QuadraX Testing Guide

This document provides comprehensive testing instructions for QuadraX.

## 🧪 Smart Contract Tests

### Test Coverage

The test suite covers all critical functionality:

#### TicTacToe Contract
- **Game Creation** (3 tests)
  - ✓ Create new game
  - ✓ Prevent playing against yourself
  - ✓ Prevent multiple active games

- **Making Moves** (5 tests)
  - ✓ Allow valid moves
  - ✓ Enforce turn order
  - ✓ Prevent occupied positions
  - ✓ Validate position range
  - ✓ Alternate turns correctly

- **Win Conditions** (4 tests)
  - ✓ Horizontal wins (all 4 rows)
  - ✓ Vertical wins (all 4 columns)
  - ✓ Diagonal win (top-left to bottom-right)
  - ✓ Diagonal win (top-right to bottom-left)

- **Game Reset** (2 tests)
  - ✓ Allow reset after game ends
  - ✓ Prevent reset during active game

- **Board State** (1 test)
  - ✓ Return correct board state

#### PYUSDStaking Contract
- **Contract Deployment** (4 tests)
  - ✓ Set PYUSD token address
  - ✓ Set platform wallet
  - ✓ Set minimum stake
  - ✓ Set platform fee

- **Game Creation** (4 tests)
  - ✓ Create new game
  - ✓ Increment game counter
  - ✓ Prevent self-play
  - ✓ Emit GameCreated event

- **Staking** (7 tests)
  - ✓ Player1 can stake
  - ✓ Player2 can stake
  - ✓ Start game when both staked
  - ✓ Enforce minimum stake
  - ✓ Prevent double staking
  - ✓ Emit events
  - ✓ Transfer tokens correctly

- **Winner Payout** (5 tests)
  - ✓ Pay winner with fee deduction
  - ✓ Accumulate platform fees
  - ✓ Mark game as ended
  - ✓ Prevent double payout
  - ✓ Emit WinnerPaid event

- **Tie Handling** (3 tests)
  - ✓ Refund both players
  - ✓ Mark game as tie
  - ✓ Emit TieRefunded event

- **Fee Management** (4 tests)
  - ✓ Platform can update fee
  - ✓ Prevent non-platform fee updates
  - ✓ Enforce maximum fee
  - ✓ Withdraw accumulated fees

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/TicTacToe.test.js
npx hardhat test test/PYUSDStaking.test.js

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npx hardhat coverage
```

### Expected Output

```
  TicTacToe
    Game Creation
      ✓ Should create a new game (XXXms)
      ✓ Should not allow creating game against yourself
      ✓ Should not allow creating game when one is active
    Making Moves
      ✓ Should allow player1 to make first move
      ✓ Should not allow playing out of turn
      ✓ Should not allow move on occupied position
      ✓ Should alternate turns
      ✓ Should not allow invalid position
    Win Conditions
      ✓ Should detect horizontal win (row 0)
      ✓ Should detect vertical win (column 0)
      ✓ Should detect diagonal win (top-left to bottom-right)
      ✓ Should detect diagonal win (top-right to bottom-left)
    Game Reset
      ✓ Should allow reset after game ends
      ✓ Should not allow reset during active game
    Board State
      ✓ Should return correct board state

  PYUSDStaking
    Contract Deployment
      ✓ Should set correct PYUSD token address
      ✓ Should set correct platform wallet
      ✓ Should set correct minimum stake
      ✓ Should set initial platform fee
    Game Creation
      ✓ Should create a new game
      ✓ Should increment game counter
      ✓ Should not allow creating game against yourself
      ✓ Should emit GameCreated event
    Staking
      ✓ Should allow player1 to stake
      ✓ Should allow player2 to stake
      ✓ Should start game when both players have staked
      ✓ Should not allow staking below minimum
      ✓ Should not allow staking twice
      ✓ Should emit PlayerStaked and GameStarted events
    Winner Payout
      ✓ Should pay winner correctly with fee deduction
      ✓ Should accumulate platform fees
      ✓ Should mark game as ended
      ✓ Should not allow declaring winner twice
      ✓ Should emit WinnerPaid event
    Tie Handling
      ✓ Should refund both players on tie
      ✓ Should mark game as tie
      ✓ Should emit TieRefunded event
    Fee Management
      ✓ Should allow platform to update fee
      ✓ Should not allow non-platform to update fee
      ✓ Should not allow fee above 5%
      ✓ Should allow platform to withdraw fees

  45 passing (XXXXms)
```

## 🎨 Frontend Testing

### Manual Testing Checklist

#### Page Load & Navigation
- [ ] Home page loads without errors
- [ ] Game page loads at `/game`
- [ ] All assets load (images, fonts, styles)
- [ ] No console errors (check F12)
- [ ] Responsive design on mobile (< 768px)
- [ ] Responsive design on tablet (768px - 1024px)
- [ ] Responsive design on desktop (> 1024px)

#### Wallet Connection
- [ ] Connect button visible
- [ ] RainbowKit modal opens
- [ ] Can connect with MetaMask
- [ ] Address displays correctly
- [ ] Can disconnect wallet
- [ ] Network switches to Hedera Testnet
- [ ] Wrong network warning shows

#### Game Board
- [ ] 4x4 grid displays correctly
- [ ] All 16 cells are clickable
- [ ] Click on cell shows X or O
- [ ] Cannot click occupied cell
- [ ] Hover effects work
- [ ] Animations are smooth

#### Staking Panel
- [ ] Balance displays correctly
- [ ] Can input stake amount
- [ ] Minimum stake validation works
- [ ] Stake button enables/disables correctly
- [ ] Staked status shows after staking
- [ ] Loading states display

#### AI Chat
- [ ] Chat panel displays
- [ ] Can send messages
- [ ] AI responses appear
- [ ] Messages scroll correctly
- [ ] Timestamps display
- [ ] Offline state shows when disabled

#### Game Flow
- [ ] Can create new game
- [ ] Both players can stake
- [ ] Game starts after both stake
- [ ] Turns alternate correctly
- [ ] Win condition detected
- [ ] Winner announcement shows
- [ ] Can reset after game ends
- [ ] Pot displays correctly

### Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

### Performance Testing

```bash
# Build production version
cd frontend
npm run build

# Check bundle sizes
# Should see output like:
# Route (app)                Size     First Load JS
# ┌ ○ /                      XXX kB         XXX kB
# └ ○ /game                  XXX kB         XXX kB
```

Target metrics:
- First Load JS: < 200 kB
- Performance score: > 90
- Accessibility score: > 90
- Best Practices score: > 90
- SEO score: > 90

Run Lighthouse audit:
1. Open production site
2. Press F12 → Lighthouse
3. Run audit
4. Review scores

## 🔗 Integration Testing

### Local Network Testing

1. **Start Hardhat Node**
```bash
npx hardhat node
# Leave running in terminal
```

2. **Deploy Contracts**
```bash
# New terminal
npx hardhat run scripts/deploy.js --network localhost
# Copy contract addresses
```

3. **Configure Frontend**
```bash
cd frontend
# Update .env.local with contract addresses
```

4. **Start Frontend**
```bash
npm run dev
```

5. **Test Full Flow**
- Connect wallet (use Hardhat account #0)
- Note: You'll need to add local network to MetaMask
  - Network Name: Hardhat Local
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 1337
  - Currency: ETH

### Hedera Testnet Testing

1. **Get Testnet HBAR**
   - Visit: https://portal.hedera.com/faucet
   - Enter your wallet address
   - Receive test HBAR

2. **Get Test PYUSD**
   - Deploy mock PYUSD or get from faucet
   - Approve spending for staking contract

3. **Deploy Contracts**
```bash
npx hardhat run scripts/deploy.js --network hedera-testnet
```

4. **Configure Frontend**
   - Update .env.local with Hedera contract addresses

5. **Test on Testnet**
   - Connect wallet to Hedera Testnet
   - Complete full game flow
   - Verify transactions on HashScan

### End-to-End Test Scenarios

#### Scenario 1: Human vs Human
1. Player 1 connects wallet
2. Player 1 creates game
3. Player 1 stakes 5 PYUSD
4. Player 2 connects wallet (different browser/account)
5. Player 2 stakes 5 PYUSD
6. Players take turns making moves
7. Player 1 wins
8. Check Player 1 receives ~9.975 PYUSD (10 - 0.25% fee)
9. Verify on blockchain explorer

#### Scenario 2: Human vs AI
1. Player connects wallet
2. Selects "vs AI" mode
3. Stakes 2 PYUSD
4. AI stakes automatically
5. Player makes move
6. AI responds with move
7. AI chat shows strategy
8. Game concludes
9. Winner receives pot

#### Scenario 3: Tie Game
1. Two players create game
2. Both stake equal amounts
3. Play until board full (no winner)
4. Both players receive full refund
5. No fee charged on ties

## 🔐 Security Testing

### Smart Contract Security

- [ ] No reentrancy vulnerabilities (using OpenZeppelin's ReentrancyGuard)
- [ ] Access control enforced (onlyPlayers, platform wallet checks)
- [ ] Integer overflow/underflow protected (Solidity 0.8.20)
- [ ] Gas limits reasonable
- [ ] No unchecked external calls
- [ ] Events emitted for important state changes

### Frontend Security

- [ ] No sensitive data in localStorage
- [ ] Environment variables not exposed
- [ ] HTTPS enforced in production
- [ ] No XSS vulnerabilities
- [ ] Wallet connection secure
- [ ] Transaction signing secure

### Audit Checklist

- [ ] Run Slither static analysis
- [ ] Run Mythril security scanner
- [ ] Manual code review
- [ ] Test with maximum values
- [ ] Test with zero values
- [ ] Test edge cases

## 📊 Test Reports

### Generate Coverage Report

```bash
npx hardhat coverage

# Output will show:
# File                  | % Stmts | % Branch | % Funcs | % Lines |
# ----------------------|---------|----------|---------|---------|
# TicTacToe.sol         |   100   |    95    |   100   |   100   |
# PYUSDStaking.sol      |   100   |    90    |   100   |   100   |
# All files             |   100   |    92    |   100   |   100   |
```

Target: > 90% coverage across all metrics

### Generate Gas Report

```bash
REPORT_GAS=true npx hardhat test

# Output will show gas usage:
# ·-----------------------|--------------|--------------|
# |  Methods              |   min        |   max        |
# ·-----------------------|--------------|--------------|
# |  createGame           |   125,432    |   135,567    |
# |  makeMove             |    75,234    |    85,432    |
# |  stake                |   110,234    |   115,678    |
# |  declareWinner        |    95,432    |   105,234    |
# ·-----------------------|--------------|--------------|
```

## 🐛 Known Issues & Limitations

1. **AI Agent**: Currently simulated responses (Phase 3 implementation pending)
2. **Real-time Updates**: Polling-based, not WebSocket (future enhancement)
3. **Gas Optimization**: Some functions can be further optimized
4. **Mobile Keyboard**: May overlap with game board on small screens

## ✅ Testing Sign-off

Before deploying to production:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing complete
- [ ] Security audit complete
- [ ] Gas optimization reviewed
- [ ] Performance metrics acceptable
- [ ] Cross-browser testing complete
- [ ] Mobile testing complete
- [ ] Documentation reviewed

---

**Last Updated**: [Date]
**Tested By**: [Name]
**Version**: 1.0.0
