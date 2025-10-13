# 3-Phase Integration: AI Chat → Staking → Gameplay

**Date:** October 13, 2025  
**Status:** ✅ Complete - Ready for Testing

---

## 🎯 Architecture Overview

The QuadraX game now follows a strict **3-phase sequential flow** where each phase must complete before the next begins:

```
PHASE 1: NEGOTIATION
    ↓
PHASE 2: STAKING
    ↓
PHASE 3: GAMEPLAY
    ↓
  FINISHED
```

---

## 📊 Phase Breakdown

### **Phase 1: Negotiation** 🤖

**Status:** AI Chat Active, Game Board Disabled  
**Goal:** User negotiates with AI to agree on stakes OR chooses demo mode

**User Options:**
1. **Stake Negotiation:**
   - Say: "Let's play for 6 PYUSD"
   - AI responds naturally using Ollama
   - Both parties negotiate until agreement (1-10 PYUSD)
   - AI says `LOCK_STAKE:{amount}` when agreed
   - → Moves to Phase 2 (Staking)

2. **Demo Mode:**
   - Say: "demo", "free play", "practice", or "no stakes"
   - AI confirms demo mode
   - → Skips Phase 2, goes directly to Phase 3 (Gameplay)

**Validation:**
- Stakes strictly enforced: 1-10 PYUSD only
- Out-of-bounds rejected immediately with helpful message
- Demo keywords detected with priority

**Code Location:**
- `frontend/src/features/game/AIChat.tsx` (handleAICommand)
- Lines ~135-185: Demo detection
- Lines ~600-670: LOCK_STAKE detection

---

### **Phase 2: Staking** 💰

**Status:** AI Chat Active (commentary), Game Board Disabled, Staking Panel Visible  
**Goal:** Lock PYUSD in smart contract or skip if demo

**Two Paths:**

**A. Real Stakes Path:**
1. Confirmation panel shows:
   - Agreed stake amount
   - Total pot (stake × 2)
   - Platform fee (0.25%)
   - Winner payout
2. User confirms
3. Triggers blockchain transactions:
   - Approve PYUSD spending
   - Create game (get gameId)
   - Lock stake in PYUSDStaking contract
4. Both players' stakes locked
5. → Moves to Phase 3 (Gameplay)

**B. Demo Path:**
- Phase 2 skipped entirely
- No contracts, no fees, no stakes
- → Directly to Phase 3 (Gameplay)

**Code Location:**
- `frontend/src/app/game/page.tsx` (handleStakeLocked)
- `frontend/src/hooks/useStakeNegotiation.ts` (contract logic)
- Lines ~260-285: Staking confirmation UI

---

### **Phase 3: Gameplay** 🎮

**Status:** AI Chat Active (live commentary), Game Board Active  
**Goal:** Play 4×4 QuadraX until someone wins

**Gameplay:**
1. Board enabled for both players
2. Players take turns placing pieces (X and O)
3. AI provides live analysis and commentary
4. Win detection after each move:
   - Horizontal (4 in a row)
   - Vertical (4 in a column)
   - Diagonal (2 diagonals)
   - **2×2 Squares** (9 positions)
5. Winner declared
6. Payout calculated (if real stakes):
   - Total pot = stake₁ + stake₂
   - Platform fee = 0.25%
   - Winner receives = pot × 0.9975
7. → Moves to Finished state

**AI Commentary:**
- Game position updates sent to AI in real-time
- AI analyzes board state
- Provides strategic insights
- Reacts to moves

**Code Location:**
- `frontend/src/app/game/page.tsx` (handleCellClick, checkWinner)
- Lines ~100-130: Gameplay handlers
- Lines ~300-320: Live AI commentary

---

## 🔄 State Machine

```typescript
type GamePhase = 'negotiation' | 'staking' | 'gameplay' | 'finished'

// State transitions:
negotiation → staking    (when LOCK_STAKE detected)
negotiation → gameplay   (when demo mode selected)
staking → gameplay       (when stake locked in contract)
gameplay → finished      (when winner detected)
finished → negotiation   (when "Play Again" clicked)
```

**State Managed In:**
- `frontend/src/app/game/page.tsx`
- Line ~35: `const [gamePhase, setGamePhase] = useState('negotiation')`

---

## 🎨 UI Components by Phase

### Phase 1: Negotiation
```
┌─────────────────┬─────────────────┬─────────────────┐
│   Game Info     │   Game Board    │    AI Chat      │
│   (waiting)     │   (DISABLED)    │   (ACTIVE)      │
│                 │                  │                 │
│   Player 1      │   [  ][  ][][]  │ 🤖 AI: "Let's   │
│   Player 2      │   [  ][  ][][]  │ negotiate! Want │
│   Pot: 0        │   [  ][  ][][]  │ to play for     │
│                 │   [  ][  ][][]  │ stakes or try   │
│                 │                  │ demo mode?"     │
│                 │   Phase: 1/3     │                 │
│                 │   Negotiation    │ You: "6 PYUSD"  │
└─────────────────┴─────────────────┴─────────────────┘
        Phase Indicator: [●─○─○] Negotiation Active
```

### Phase 2: Staking
```
┌─────────────────┬─────────────────┬─────────────────┐
│  Stake Confirm  │   Game Board    │    AI Chat      │
│                 │   (DISABLED)    │   (ACTIVE)      │
│ 💰 Agreed: 6 PYUSD│                │                 │
│ Total Pot: 12   │   [  ][  ][][]  │ 🤖 AI: "Great!  │
│ Fee: 0.25%      │   [  ][  ][][]  │ Locking your    │
│ Winner: 11.97   │   [  ][  ][][]  │ stake now..."   │
│                 │   [  ][  ][][]  │                 │
│ [Confirm] [Cancel]                │                 │
│                 │   Phase: 2/3     │                 │
│                 │   Staking        │                 │
└─────────────────┴─────────────────┴─────────────────┘
        Phase Indicator: [✓─●─○] Staking Active
```

### Phase 3: Gameplay
```
┌─────────────────┬─────────────────┬─────────────────┐
│   Game Info     │   Game Board    │    AI Chat      │
│   (playing)     │   (ACTIVE)      │   (COMMENTARY)  │
│                 │                  │                 │
│ ▶ Player 1 (X)  │   [X][O][X][O]  │ 🤖 AI: "Nice    │
│   Player 2 (O)  │   [O][X][O][X]  │ diagonal setup! │
│   Pot: 12 PYUSD │   [X][O][X][ ]  │ Watch out for   │
│                 │   [O][X][ ][ ]  │ that 2×2..."    │
│                 │                  │                 │
│                 │   Phase: 3/3     │ You: "analyze"  │
│                 │   Playing!       │                 │
└─────────────────┴─────────────────┴─────────────────┘
        Phase Indicator: [✓─✓─●] Gameplay Active
```

---

## 🔗 Component Integration

### `game/page.tsx` (Orchestrator)
**Responsibilities:**
- Manages game phase state
- Coordinates all 3 components
- Handles phase transitions
- Passes callbacks to children

**Key State:**
```typescript
const [gamePhase, setGamePhase] = useState<'negotiation' | 'staking' | 'gameplay' | 'finished'>('negotiation')
const [isDemoMode, setIsDemoMode] = useState(false)
const [negotiatedStake, setNegotiatedStake] = useState<number | null>(null)
const [gamePosition, setGamePosition] = useState<GamePosition>(...)
```

**Key Handlers:**
```typescript
handleNegotiationComplete(stake, demo) // From AIChat
handleStakeLocked(gameId, stake)       // From AIChat (via contract)
handleCellClick(index)                 // Game board clicks
handleReset()                          // Play again
```

### `features/game/AIChat.tsx` (AI Agent)
**Responsibilities:**
- Phase 1: Negotiate stakes or offer demo
- Phase 2: Commentary during staking
- Phase 3: Live game analysis
- Emit events to parent

**Key Props:**
```typescript
enabled: boolean                       // Always true
gamePosition?: GamePosition            // Live board state
stakingContext?: PYUSDStakeContext     // Min/max stakes
onNegotiationComplete?: (stake, demo)  // Phase 1 → 2 or 3
onStakeLocked?: (gameId, stake)        // Phase 2 → 3
```

**Key Events:**
- `LOCK_STAKE:{amount}` → triggers staking phase
- `START_DEMO_MODE` → skips to gameplay
- Keyword detection: "demo", "free", "practice"

### `features/game/Board.tsx` (Game UI)
**Responsibilities:**
- Render 4×4 grid
- Handle cell clicks
- Visual feedback

**Key Props:**
```typescript
board: number[]          // [0,0,1,2,0,0,...]
disabled: boolean        // True in phases 1 & 2
currentPlayer: number    // 1 or 2
onCellClick: (index)     // Handler
```

---

## 🧪 Testing Scenarios

### Scenario A: Stake Negotiation Path
```
1. User: "Let's play for 6 PYUSD"
   → AI responds, negotiates
   
2. User: "Deal!"
   → AI says "LOCK_STAKE:6"
   → Phase changes: negotiation → staking
   
3. User clicks "Confirm"
   → Wallet prompts for approval
   → Wallet prompts for createGame + stake
   → Phase changes: staking → gameplay
   
4. Players make moves
   → Board active
   → AI comments live
   
5. Someone wins (4-in-a-row or 2×2)
   → Alert shows winner + payout
   → Phase changes: gameplay → finished
   
6. User clicks "Play Again"
   → Phase changes: finished → negotiation
```

### Scenario B: Demo Mode Path
```
1. User: "demo"
   → AI confirms demo mode
   → Phase changes: negotiation → gameplay (skip staking)
   
2. Players make moves
   → Board active
   → AI comments live
   → No stakes, no fees
   
3. Someone wins
   → Alert shows winner (no payout)
   → Phase changes: gameplay → finished
   
4. User clicks "Play Again"
   → Phase changes: finished → negotiation
```

### Scenario C: Invalid Stake Rejection
```
1. User: "Let's play for 15 PYUSD"
   → AI rejects: "Stakes must be 1-10 PYUSD"
   → Still in negotiation phase
   → Suggests demo mode as alternative
   
2. User: "OK, 8 PYUSD then"
   → AI accepts, continues negotiation
```

---

## 🎯 Key Features

### ✅ Strict Phase Gating
- Game board **disabled** until Phase 3
- Staking panel **only visible** in Phase 2
- AI chat **always active** but context-aware

### ✅ Demo Mode Support
- Zero friction: say "demo" → instant gameplay
- No wallet needed
- No contracts
- Full game experience

### ✅ Real-time AI Integration
- Phase 1: Negotiation agent
- Phase 2: Staking commentator
- Phase 3: Live game analyst
- Seamless transitions

### ✅ Visual Phase Indicator
- 3-step progress bar at top
- Shows current phase
- Green checkmarks for completed phases
- Animated during active phase

### ✅ Smart Validation
- Stake bounds: 1-10 PYUSD enforced
- Triple-layer validation (user → AI → contract)
- Clear error messages
- Helpful suggestions

---

## 🚀 How to Test

1. **Start dev server** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Ensure Ollama running** (for AI):
   ```bash
   ollama serve
   ```

3. **Open game page:**
   ```
   http://localhost:3000/game
   ```

4. **Test Negotiation → Staking → Gameplay:**
   - Say: "Let's play for 6 PYUSD"
   - Wait for AI response
   - Say: "Deal!"
   - Click "Confirm" in staking panel
   - Play game until someone wins

5. **Test Demo Mode:**
   - Refresh page
   - Say: "demo"
   - Game starts immediately
   - Play without stakes

---

## 📝 Code Files Modified

1. **`frontend/src/app/game/page.tsx`**
   - Added 3-phase state machine
   - Added phase indicator UI
   - Added handleNegotiationComplete
   - Added handleStakeLocked
   - Updated all UI to respect phases

2. **`frontend/src/features/game/AIChat.tsx`**
   - Added onNegotiationComplete prop
   - Added demo mode detection (keywords)
   - Added START_DEMO_MODE marker
   - Updated welcome message
   - Updated AI prompts

3. **`frontend/src/hooks/useStakeNegotiation.ts`**
   - Already implemented (no changes)
   - Handles contract interactions

---

## 🎉 Summary

**Problem:** AI chat, staking, and game board were disconnected components

**Solution:** 3-phase sequential flow with strict gating:
1. **Negotiation** (AI active) → agree on stakes OR demo
2. **Staking** (contract locking) → lock PYUSD OR skip
3. **Gameplay** (board active) → play until winner

**Result:** 
- ✅ Components tightly integrated
- ✅ Clear user journey
- ✅ Demo mode for quick testing
- ✅ Real stakes for competitive play
- ✅ AI commentary throughout

**Status:** Ready for end-to-end testing! 🚀
