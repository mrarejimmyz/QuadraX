# Contract Integration Fixes - Part 2

## Issues Fixed

### 1. ABI Encoding Length Mismatch (createGame)
**Error**: `ABI encoding params/values length mismatch. Expected length (params): 1, Given length (values): 2`

**Root Cause**: The `createGame` function only accepts 1 parameter (`player2` address), but we were passing 2 parameters (`player2` and `stakeAmount`).

**Fix in EscrowCoordinator.ts (Line ~90)**:
```typescript
// ❌ BEFORE (Wrong - 2 params):
const hash = await this.walletClient.writeContract({
  address: STAKING_CONTRACT_ADDRESS,
  abi: PYUSDStakingABI.abi || PYUSDStakingABI,
  functionName: 'createGame',
  args: [player2, stakeAmountWei],  // ❌ Wrong
  account: player1,
});

// ✅ AFTER (Correct - 1 param):
const hash = await this.walletClient.writeContract({
  address: STAKING_CONTRACT_ADDRESS,
  abi: PYUSDStakingABI.abi || PYUSDStakingABI,
  functionName: 'createGame',
  args: [player2],  // ✅ Correct
  account: player1,
});
```

**Contract Signature**:
```solidity
function createGame(address player2) external returns (uint256)
```

### 2. Wrong Stake Function Name and Parameters
**Error**: Function `stakeForGame` doesn't exist. The contract uses `stake(gameId, amount)`.

**Fix in EscrowCoordinator.ts (Line ~185)**:
```typescript
// ❌ BEFORE (Wrong function name):
const stakeHash = await this.walletClient.writeContract({
  address: STAKING_CONTRACT_ADDRESS,
  abi: PYUSDStakingABI.abi || PYUSDStakingABI,
  functionName: 'stakeForGame',  // ❌ Doesn't exist
  args: [gameId],  // ❌ Missing amount
  account: playerAddress,
});

// ✅ AFTER (Correct function and params):
const stakeHash = await this.walletClient.writeContract({
  address: STAKING_CONTRACT_ADDRESS,
  abi: PYUSDStakingABI.abi || PYUSDStakingABI,
  functionName: 'stake',  // ✅ Correct
  args: [gameId, amountWei],  // ✅ Both params
  account: playerAddress,
});
```

**Contract Signature**:
```solidity
function stake(uint256 gameId, uint256 amount) external nonReentrant onlyPlayers(gameId)
```

### 3. Hedera Parameter Order Mismatch
**Error**: Stake amount showing as wallet address (0xb99...51c instead of 3.48)

**Root Cause**: `deployEscrow` expects `(stakeAmount, player1, player2)` but we were passing `(player1, player2, stakeAmount)`.

**Fix in EscrowCoordinator.ts (Line ~81)**:
```typescript
// ❌ BEFORE (Wrong order):
const hederaResult = await hederaAgent.deployEscrow(
  player1,        // ❌ Wrong position
  player2,        // ❌ Wrong position
  stakeAmount     // ❌ Wrong position
);

// ✅ AFTER (Correct order):
const hederaResult = await hederaAgent.deployEscrow(
  parseFloat(stakeAmount),  // ✅ First param: number
  player1,                  // ✅ Second param: string
  player2                   // ✅ Third param: string
);
```

**Function Signature** (hedera/index.ts):
```typescript
async deployEscrow(
  stakeAmount: number,      // ✅ First
  player1Address: string,   // ✅ Second
  player2Address: string    // ✅ Third
): Promise<HederaEscrowDeployment>
```

## Files Modified

1. **frontend/src/lib/escrow/EscrowCoordinator.ts**
   - Fixed `createGame` to only pass `player2` (removed `stakeAmountWei`)
   - Fixed `stake` function name (was `stakeForGame`) and added `amountWei` parameter
   - Fixed `deployEscrow` parameter order (stakeAmount first)

## Testing Checklist

- [ ] Navigate to http://localhost:3002/negotiate
- [ ] Connect wallet (should show 50 PYUSD balance)
- [ ] Negotiate stake price with AI (e.g., 3.48 PYUSD)
- [ ] Click "Proceed to Staking"
- [ ] Verify Hedera logs show correct values:
  - ✅ Stake Amount: 3.48 PYUSD (not wallet address)
  - ✅ Player 1: 0x224783D70D55F9Ab790Fe27fCFc4629241F45371
  - ✅ Player 2: 0x0000000000000000000000000000000000000001
- [ ] Verify Sepolia game creation (no ABI encoding error)
- [ ] Approve PYUSD spend (50 PYUSD)
- [ ] Stake exact amount (3.48 PYUSD)
- [ ] Verify game starts with both players staked

## Expected Flow

1. **Hedera Escrow** → Deploys first (fast, cheap)
2. **Sepolia Game** → Creates game with player2 only
3. **PYUSD Approval** → Approve staking contract
4. **Stake Transaction** → Call `stake(gameId, amountWei)`
5. **Game Start** → Both players staked, ready to play

## Contract Interaction Summary

### createGame(player2)
- **Parameters**: `player2: address`
- **Returns**: `gameId: uint256`
- **Sets**: `player1 = msg.sender`, `player2 = argument`

### stake(gameId, amount)
- **Parameters**: `gameId: uint256`, `amount: uint256`
- **Requirements**: 
  - Game not started
  - Amount >= MIN_STAKE (1 PYUSD = 1e6)
  - Caller is player1 or player2
- **Sets**: `player1Stake` or `player2Stake`

## Next Steps

1. Test in browser at port 3002
2. Verify contract calls match expected signatures
3. Check Sepolia transactions on Etherscan
4. Confirm both players can stake correct amounts
