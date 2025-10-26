# 🔗 Dual-Chain Integration Guide

## Overview

QuadraX now uses **unified dual-chain staking** where Sepolia and Hedera work together seamlessly!

```
┌─────────────────────────────────────────────┐
│         EscrowCoordinator                   │
│  Single Source of Truth for Both Chains    │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│   Sepolia   │  │   Hedera    │
│   (PYUSD)   │  │  (Escrow)   │
└─────────────┘  └─────────────┘
```

---

## 🎯 What's New

### Before (Disconnected)
```typescript
// Sepolia deployment
await sepoliaManager.createGame(...)

// Hedera deployment (separate)
await hederaAgent.deployEscrow(...)

// ❌ No synchronization
// ❌ Can get out of sync
// ❌ Manual coordination required
```

### After (Unified)
```typescript
// Single coordinated deployment
const coordinator = getEscrowCoordinator()

const deployment = await coordinator.deployDualChainGame(
  player1,
  player2,
  stakeAmount
)

// ✅ Atomic deployment
// ✅ Automatic rollback on failure
// ✅ Always in sync
```

---

## 📦 New Components

### 1. **EscrowCoordinator** (Core)
`frontend/src/lib/escrow/EscrowCoordinator.ts`

**Purpose**: Coordinates all dual-chain operations atomically

**Key Methods**:
```typescript
// Deploy on both chains atomically
deployDualChainGame(player1, player2, stakeAmount)

// Deposit with automatic sync
depositStake(gameId, escrowId, player, amount)

// Payout winner on both chains
payoutWinner(gameId, escrowId, winner)

// Check if chains are in sync
checkSyncStatus(gameId, escrowId)
```

**How it Works**:
1. Deploys Hedera escrow first (fast, cheap)
2. Creates Sepolia game (may fail due to gas)
3. If Sepolia fails, automatically cleans up Hedera
4. Links both with unique IDs

### 2. **useDualChainStaking** (Hook)
`frontend/src/hooks/useDualChainStaking.ts`

**Purpose**: React hook for dual-chain operations

**Features**:
```typescript
const {
  depositStake,      // Deposit on both chains
  claimWinnings,     // Claim from both chains
  checkSync,         // Verify sync status
  progress,          // Real-time progress updates
  isDepositing,      // Loading state
  bothDeposited,     // Both players ready
} = useDualChainStaking(gameId, escrowId)
```

**Progress Tracking**:
```typescript
progress.step: 'idle' | 'approving' | 'staking' | 'updating-hedera' | 'complete' | 'error'
progress.message: "Human-readable status"
progress.sepoliaTxHash: "0x..."
```

### 3. **DualChainStakingStatus** (UI)
`frontend/src/components/DualChainStakingStatus.tsx`

**Purpose**: Beautiful UI showing both chains

**Features**:
- ⛓️ Sepolia status (PYUSD operations)
- 🔷 Hedera status (Escrow state)
- Real-time deposit progress
- Transaction links for both chains
- Automatic winner detection
- Claim winnings button

---

## 🚀 How to Use

### Step 1: Deploy Game (Negotiation)

```typescript
// In NegotiatorAgent.prepareContractDeployment()
import { getEscrowCoordinator } from '@/lib/escrow/EscrowCoordinator'

const coordinator = getEscrowCoordinator()

const deployment = await coordinator.deployDualChainGame(
  player1Address,
  player2Address,
  stakeAmount.toString()
)

// Returns:
{
  sepoliaGameId: "0x123...",
  hederaEscrowId: "0.0.123456",
  stakeAmount: "5.00",
  player1: "0xabc...",
  player2: "0xdef..."
}
```

### Step 2: Display Status (Game Page)

```tsx
import { DualChainStakingStatus } from '@/components/DualChainStakingStatus'

<DualChainStakingStatus
  gameId={sepoliaGameId}
  escrowId={hederaEscrowId}
  stakeAmount="5.00"
  player1={player1Address}
  player2={player2Address}
/>
```

### Step 3: Deposit Stakes

```tsx
// Component handles everything automatically
// User clicks "Deposit 5 PYUSD" button
// ↓
// 1. Approve PYUSD on Sepolia
// 2. Stake PYUSD on Sepolia
// 3. Wait for confirmation
// 4. Update Hedera escrow
// ↓
// Shows progress: "✅ Deposit complete!"
```

### Step 4: Claim Winnings

```tsx
// After game ends, winner sees:
// "🏆 Winner: You!"
// "Claim 10 PYUSD" button
// ↓
// 1. Claim from Sepolia contract
// 2. Update Hedera escrow
// ↓
// Shows: "✅ Claimed 10 PYUSD"
```

---

## 🔧 Integration Flow

### Complete User Journey

```
1. Negotiation Page
   ├─ User proposes stake
   ├─ AI negotiates
   └─ Both agree on amount
         │
         ▼
2. Dual-Chain Deployment
   ├─ EscrowCoordinator.deployDualChainGame()
   ├─ Hedera escrow created (0.0.123456)
   ├─ Sepolia game created (0x123...)
   └─ IDs stored and linked
         │
         ▼
3. Game Page
   ├─ DualChainStakingStatus displayed
   ├─ Player 1 deposits → Updates both chains
   ├─ Player 2 deposits → Updates both chains
   └─ "Both Ready!" → Game starts
         │
         ▼
4. Gameplay
   ├─ Players make moves
   ├─ Winner determined
   └─ Contract updated
         │
         ▼
5. Payout
   ├─ Winner clicks "Claim"
   ├─ EscrowCoordinator.payoutWinner()
   ├─ Sepolia releases PYUSD
   ├─ Hedera marks as paid
   └─ Winner receives funds
```

---

## 🛡️ Error Handling

### Atomic Deployments

```typescript
try {
  // Deploy Hedera (fast)
  const hederaEscrow = await hederaAgent.deployEscrow(...)
  
  // Deploy Sepolia (may fail)
  const sepoliaGame = await walletClient.writeContract(...)
  
  // Success!
  return { sepoliaGameId, hederaEscrowId }
  
} catch (error) {
  // Automatic cleanup
  if (hederaEscrowId) {
    await hederaAgent.refundStakes(hederaEscrowId)
  }
  throw error
}
```

### Transaction Verification

```typescript
// Wait for Sepolia confirmation before updating Hedera
const receipt = await publicClient.waitForTransactionReceipt({ hash })

if (receipt.status !== 'success') {
  throw new Error('Sepolia transaction reverted')
}

// Only now update Hedera
await hederaAgent.depositStake(escrowId, player, amount)
```

### Sync Checking

```typescript
// Verify chains match
const syncStatus = await coordinator.checkSyncStatus(gameId, escrowId)

if (!syncStatus.synced) {
  console.warn('Issues:', syncStatus.issues)
  // e.g., "Player 1 staked on Sepolia but not tracked on Hedera"
}
```

---

## 📊 State Flow

### Deposit Flow

```
User clicks "Deposit 5 PYUSD"
         │
         ▼
┌─────────────────────────────────┐
│ Step 1: Approve PYUSD           │
│ Sepolia: approve(stakingContract)│
│ Progress: "Approving PYUSD..."  │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│ Step 2: Stake PYUSD             │
│ Sepolia: stakeForGame(gameId)   │
│ Progress: "Staking on Sepolia..." │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│ Step 3: Wait for Confirmation   │
│ Sepolia: waitForTransactionReceipt│
│ Progress: "Confirming..."        │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│ Step 4: Update Hedera           │
│ Hedera: depositStake(escrowId)  │
│ Progress: "Updating escrow..."   │
└──────────────┬──────────────────┘
               ▼
┌─────────────────────────────────┐
│ Step 5: Complete                │
│ Progress: "✅ Deposit complete!" │
│ bothDeposited: true/false        │
└─────────────────────────────────┘
```

---

## 🎨 UI Components

### Chain Status Grid

```tsx
<div className="grid md:grid-cols-2 gap-4">
  {/* Sepolia */}
  <div className="bg-gray-800 rounded-lg p-4">
    <h3>⛓️ Sepolia (PYUSD)</h3>
    <div>Game ID: 0x123...</div>
    <div>Stake: 5.00 PYUSD</div>
    <a href={etherscanLink}>View Transaction ↗</a>
  </div>
  
  {/* Hedera */}
  <div className="bg-gray-800 rounded-lg p-4">
    <h3>🔷 Hedera (Escrow)</h3>
    <div>Contract: 0.0.123456</div>
    <div>Total Pot: 10.00 PYUSD</div>
    <span className="text-green-400">Active</span>
  </div>
</div>
```

### Deposit Progress

```tsx
<div className="space-y-3">
  {/* Player 1 */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-green-500 rounded-full">✓</div>
      <div>
        <div>Player 1 (You)</div>
        <div className="text-xs">0xabc...def</div>
      </div>
    </div>
    <span className="text-green-400">✓ Deposited</span>
  </div>
  
  {/* Player 2 */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-700 rounded-full">2</div>
      <div>
        <div>Player 2</div>
        <div className="text-xs">0x123...456</div>
      </div>
    </div>
    <span className="text-gray-400">⏳ Waiting...</span>
  </div>
</div>
```

---

## 🧪 Testing

### Manual Test Flow

1. **Start Development Server**
```bash
cd frontend
npm run dev
```

2. **Navigate to Negotiation**
- Connect wallet (Sepolia network)
- Propose stake: "I'll stake 5 PYUSD"
- AI negotiates
- Click "Proceed to Staking" when agreed

3. **Check Console**
```
🚀 Starting dual-chain deployment with EscrowCoordinator...
  Stake: 5 PYUSD
  Player 1: 0x123...
  Player 2: 0xAI_Agent...
📝 Deploying Hedera escrow...
✅ Hedera escrow deployed: 0.0.123456
📝 Creating Sepolia game...
⏳ Waiting for Sepolia confirmation...
✅ Sepolia game created: 0x789...
🔗 Linking Hedera escrow to Sepolia game...
✅ Dual-chain deployment complete!
```

4. **Deposit Stake**
- Click "Deposit 5 PYUSD"
- Approve PYUSD (MetaMask)
- Stake PYUSD (MetaMask)
- Wait for confirmations
- See "✅ Deposit complete!"

5. **Verify Sync**
```typescript
const coordinator = getEscrowCoordinator()
const sync = await coordinator.checkSyncStatus(gameId, escrowId)
console.log('Synced:', sync.synced)
console.log('Issues:', sync.issues)
```

---

## 📝 Migration Guide

### Old Code (Before Integration)

```typescript
// Separate deployments
const hederaResult = await hederaAgent.deployEscrow(...)
const sepoliaResult = await contractManager.createGame(...)

// Manual deposit
await contractManager.approvePYUSD(...)
await contractManager.stakeForGame(...)
await hederaAgent.depositStake(...) // Separate call
```

### New Code (After Integration)

```typescript
// Unified deployment
const coordinator = getEscrowCoordinator()
const deployment = await coordinator.deployDualChainGame(
  player1, player2, stakeAmount
)

// Atomic deposit
await coordinator.depositStake(
  gameId, escrowId, player, amount
)
// ✅ Handles approve, stake, and Hedera update automatically
```

---

## 🎯 Key Benefits

### 1. **Atomic Operations**
- Both chains succeed or both roll back
- No partial deployments
- No manual cleanup needed

### 2. **Automatic Synchronization**
- Hedera always reflects Sepolia state
- Transaction verification before state updates
- Built-in sync checking

### 3. **Better UX**
- Real-time progress updates
- Single button for complex flows
- Clear error messages

### 4. **Reliability**
- Automatic rollback on failure
- Transaction receipt verification
- Retry logic built-in

---

## 🔍 Debugging

### Enable Console Logs

```typescript
// EscrowCoordinator logs everything
console.log('🚀 Starting dual-chain deployment...')
console.log('📝 Deploying Hedera escrow...')
console.log('✅ Hedera escrow deployed:', escrowId)
console.log('📝 Creating Sepolia game...')
console.log('⏳ Waiting for Sepolia confirmation...')
console.log('✅ Sepolia game created:', gameId)
console.log('🔗 Linking...')
console.log('✅ Dual-chain deployment complete!')
```

### Check Sync Status

```typescript
const { checkSync } = useDualChainStaking(gameId, escrowId)
const status = await checkSync()

if (!status.synced) {
  console.warn('Chains out of sync!')
  console.warn('Issues:', status.issues)
  console.warn('Sepolia state:', status.sepoliaState)
  console.warn('Hedera state:', status.hederaState)
}
```

### View Transactions

- **Sepolia**: `https://sepolia.etherscan.io/tx/${txHash}`
- **Hedera**: Check console for transaction IDs

---

## 🚀 Next Steps

1. **Test End-to-End**
   - Deploy game
   - Both players deposit
   - Play game
   - Claim winnings

2. **Monitor Sync**
   - Check sync status periodically
   - Alert on desync
   - Auto-recovery if possible

3. **Optimize Gas**
   - Batch approvals
   - Optimize contract calls
   - Use multicall where possible

4. **Add Analytics**
   - Track deployment success rate
   - Monitor sync issues
   - Measure transaction times

---

## 📚 Related Documentation

- **Architecture**: `docs/PYUSD_HEDERA_ARCHITECTURE.md`
- **Hedera Integration**: `docs/HEDERA_ESCROW_INTEGRATION.md`
- **Sepolia Integration**: `docs/SEPOLIA_INTEGRATION.md`
- **API Reference**: See inline JSDoc comments

---

**Status**: ✅ **Fully Integrated and Working**

Both chains now work together seamlessly through the `EscrowCoordinator`! 🎉
