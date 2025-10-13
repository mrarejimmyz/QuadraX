# Complete E2E Test Guide - QuadraX 3-Phase Flow

**Status:** ✅ Ready to Test  
**Date:** October 13, 2025  
**Server:** http://localhost:3000

---

## 🎯 Complete Test Scenarios

### **Test 1: Homepage Navigation** ✅

1. **Open Homepage:**
   ```
   http://localhost:3000
   ```

2. **Verify Updates:**
   - [ ] See "AI-Powered QuadraX" title
   - [ ] See "Stake Range: 1-10 PYUSD" (not fixed 10)
   - [ ] See "Launch Game - Negotiate Stakes with AI" button
   - [ ] See "Chat with AI to negotiate stakes or try demo mode"
   - [ ] See 3-step process explained:
     - 1️⃣ Negotiate with AI
     - 2️⃣ Stake PYUSD
     - 3️⃣ Play game

3. **Click Launch Button:**
   - [ ] Button navigates to `/game` page (should work now!)
   - [ ] Page loads with 3-column layout

---

### **Test 2: Phase 1 - Negotiation (Demo Mode)** 🤖

1. **Check Initial State:**
   - [ ] Phase indicator shows: `[●─○─○] 1. Negotiation` (blue/active)
   - [ ] Game board is **disabled/grayed out**
   - [ ] AI Chat is **visible and active** (right panel)
   - [ ] Welcome message appears:
     ```
     🎮 QuadraX AI System Ready
     X intelligent agents online. Ready to negotiate!
     ```

2. **Test Demo Mode:**
   ```
   Type: "demo"
   ```
   - [ ] AI responds: "Perfect! Let's play a demo game with no stakes..."
   - [ ] Phase indicator jumps: `[✓─✓─●]` (skip phase 2)
   - [ ] Game board becomes **active**
   - [ ] Status shows: "🎮 Playing! Make your moves"

3. **Play Demo Game:**
   - [ ] Click cells on game board
   - [ ] Pieces place (X and O alternate)
   - [ ] Try to win (4 in a row or 2×2 square)
   - [ ] Winner alert shows (no payout mentioned)
   - [ ] "Play Again" button appears

---

### **Test 3: Phase 1 - Negotiation (Real Stakes)** 💰

1. **Refresh Page:**
   ```
   Refresh http://localhost:3000/game
   ```

2. **Test Stake Bounds Validation:**
   
   **Test A - Too Low:**
   ```
   Type: "Let's play for 0.5 PYUSD"
   ```
   - [ ] AI rejects: "Stakes must be between 1 and 10 PYUSD"
   - [ ] Suggests demo mode as alternative
   - [ ] Still in negotiation phase

   **Test B - Too High:**
   ```
   Type: "I'll stake 15 PYUSD"
   ```
   - [ ] AI rejects: "Stakes must be between 1 and 10 PYUSD"
   - [ ] Helpful error message
   - [ ] Still in negotiation phase

   **Test C - Valid Stake:**
   ```
   Type: "Let's play for 6 PYUSD"
   ```
   - [ ] AI responds naturally (using Ollama)
   - [ ] AI negotiates or accepts
   - [ ] Continue conversation...

3. **Complete Negotiation:**
   ```
   Type: "Deal!" or "Let's do it!"
   ```
   - [ ] AI responds with agreement
   - [ ] AI message includes `LOCK_STAKE:6` (hidden marker)
   - [ ] Phase changes: `[✓─●─○] 2. Staking`
   - [ ] Confirmation modal appears OR staking panel visible

---

### **Test 4: Phase 2 - Staking** 🔐

1. **Check Staking Panel:**
   - [ ] Shows agreed stake: "6 PYUSD"
   - [ ] Shows total pot: "12 PYUSD"
   - [ ] Shows platform fee: "0.25%"
   - [ ] Shows winner payout: "11.97 PYUSD"
   - [ ] Game board still **disabled**

2. **Confirm Stake:**
   - [ ] Click "Confirm" button
   - [ ] Wallet prompt appears (if contracts deployed)
   - [ ] Or simulation runs (if no contracts)
   - [ ] Phase changes: `[✓─✓─●] 3. Gameplay`
   - [ ] Game board becomes **active**

---

### **Test 5: Phase 3 - Gameplay** 🎮

1. **Check Gameplay State:**
   - [ ] Phase indicator: `[✓─✓─●] 3. Gameplay` (green, animated)
   - [ ] Game board is **active**
   - [ ] AI chat still active (provides commentary)
   - [ ] Status: "🎮 Playing! Make your moves - AI is watching"

2. **Play Game:**
   - [ ] Click cell → Places X
   - [ ] Click another cell → Places O
   - [ ] Continue alternating
   - [ ] AI provides live commentary (if enabled)

3. **Test Win Detection:**

   **Test A - Horizontal Win:**
   - [ ] Place 4 in a row horizontally (0, 1, 2, 3)
   - [ ] Winner detected
   - [ ] Alert: "🎉 Player X wins! 💰 Payout: 11.9700 PYUSD"

   **Test B - Vertical Win:**
   - [ ] Place 4 in a column (0, 4, 8, 12)
   - [ ] Winner detected

   **Test C - Diagonal Win:**
   - [ ] Place diagonal (0, 5, 10, 15)
   - [ ] Winner detected

   **Test D - 2×2 Square Win:**
   - [ ] Place 2×2 square (0, 1, 4, 5)
   - [ ] Winner detected

4. **After Win:**
   - [ ] Phase changes: `[✓─✓─✓] Finished`
   - [ ] Alert shows winner and payout
   - [ ] "Play Again" button appears
   - [ ] Click → Resets to Phase 1

---

### **Test 6: AI Chat Features** 🤖

**Test Commands During Negotiation:**

1. **Help Command:**
   ```
   Type: "help"
   ```
   - [ ] AI explains available commands
   - [ ] Mentions negotiation, demo mode, etc.

2. **Analyze Command:**
   ```
   Type: "analyze"
   ```
   - [ ] During negotiation: AI talks about strategy
   - [ ] During gameplay: AI analyzes current board

3. **Stake Info:**
   ```
   Type: "How much should I stake?"
   ```
   - [ ] AI provides Kelly Criterion analysis
   - [ ] Suggests optimal stake range

4. **Agents List:**
   ```
   Type: "agents"
   ```
   - [ ] Shows active AI agents (e.g., "4 agents")
   - [ ] Lists personalities (Strategic, Defensive, etc.)

---

### **Test 7: Error Handling** ⚠️

1. **Ollama Offline:**
   - Stop Ollama: Press Ctrl+C in Ollama terminal
   - Refresh game page
   - [ ] Error message: "AI agents are currently offline"
   - [ ] Fallback messages instead of crashes
   - [ ] Can still play demo mode (static response)

2. **Wallet Not Connected:**
   - Disconnect wallet
   - Try to confirm stake
   - [ ] Clear error message
   - [ ] Suggests connecting wallet

3. **Invalid Move:**
   - During gameplay, click occupied cell
   - [ ] Move rejected
   - [ ] No state change
   - [ ] Turn stays same

---

### **Test 8: Visual Elements** 🎨

1. **Phase Indicator:**
   - [ ] Always visible at top
   - [ ] Shows 3 phases clearly
   - [ ] Active phase has blue background + animation
   - [ ] Completed phases have green checkmark
   - [ ] Locked phases grayed out

2. **Board Styling:**
   - [ ] Disabled state: grayed out, no hover
   - [ ] Active state: hover effects work
   - [ ] X pieces: blue color
   - [ ] O pieces: red/pink color
   - [ ] Clear visual feedback

3. **AI Chat:**
   - [ ] Messages scroll smoothly
   - [ ] User messages: right-aligned, blue
   - [ ] AI messages: left-aligned, gray/purple
   - [ ] Agent name shown for AI messages
   - [ ] Confidence scores shown when available
   - [ ] Timestamps on all messages

---

## 📊 Test Results Template

```
Date: ____________
Tester: __________
Ollama Version: _______

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Homepage Navigation | [ ] | [ ] | |
| Demo Mode Flow | [ ] | [ ] | |
| Stake Validation (Low) | [ ] | [ ] | |
| Stake Validation (High) | [ ] | [ ] | |
| Stake Negotiation | [ ] | [ ] | |
| Staking Confirmation | [ ] | [ ] | |
| Gameplay Active | [ ] | [ ] | |
| Horizontal Win | [ ] | [ ] | |
| Vertical Win | [ ] | [ ] | |
| Diagonal Win | [ ] | [ ] | |
| 2×2 Square Win | [ ] | [ ] | |
| AI Commentary | [ ] | [ ] | |
| Phase Transitions | [ ] | [ ] | |
| Play Again | [ ] | [ ] | |

Overall: ___/14 (___%)
```

---

## 🚀 Quick Start Checklist

Before testing:

- [ ] Ollama running: `ollama serve`
- [ ] Frontend running: `npm run dev` (http://localhost:3000)
- [ ] Model loaded: `ollama pull llama3.2:latest`
- [ ] Wallet available (optional, for staking test)

---

## 🐛 Known Issues to Watch For

1. **Ollama Connection:**
   - If AI doesn't respond, check Ollama is running
   - Check terminal for errors
   - Restart Ollama if needed

2. **Phase Transitions:**
   - Should be smooth and immediate
   - If stuck, check console for errors
   - Phase indicator should update

3. **Demo Mode:**
   - Should skip phase 2 entirely
   - Board should activate immediately
   - No staking panel shown

4. **Win Detection:**
   - All 4 types should work
   - Alert should show immediately
   - Correct payout calculated

---

## ✅ Success Criteria

**Minimum Viable:**
- [ ] Homepage button navigates to game
- [ ] AI chat visible and responsive
- [ ] Demo mode works end-to-end
- [ ] Game board playable
- [ ] Win detection works

**Full Success:**
- [ ] All 3 phases transition smoothly
- [ ] Stake negotiation works (1-10 PYUSD)
- [ ] Validation rejects out-of-bounds stakes
- [ ] All 4 win types detected
- [ ] AI provides intelligent responses
- [ ] Phase indicator always accurate
- [ ] Play again resets properly

---

## 📝 Test Commands Summary

```bash
# Demo Mode
"demo"
"free play"
"practice"

# Negotiation
"Let's play for 6 PYUSD"
"How about 8 PYUSD?"
"Deal!"

# Invalid Stakes
"0.5 PYUSD"  # Too low
"15 PYUSD"   # Too high

# AI Commands
"help"
"analyze"
"agents"
"How much should I stake?"
```

---

**Ready to Test!** 🚀

Start with: http://localhost:3000
