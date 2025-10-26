# QuadraX Staking: What Uses What?

## 🎯 Quick Answer

**Q: Are we using Hedera Agent Kit for PYUSD staking on Sepolia?**

**A: NO**

Here's the breakdown:

---

## 📊 Current System Breakdown

```
┌────────────────────────────────────────────────────────────┐
│                 When You Stake PYUSD                        │
└────────────────────────────┬───────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                          ▼
        ┌──────────────┐          ┌──────────────┐
        │   Sepolia    │          │   Hedera     │
        │   (Primary)  │          │  (Tracking)  │
        └──────────────┘          └──────────────┘

```

### **1. PYUSD Token Operations** (Sepolia)

```
Tool: viem + wagmi (Ethereum libraries)
NOT: Hedera Agent Kit

What happens:
├─ User approves PYUSD (ERC20) on Sepolia
├─ PYUSD transferred to staking contract
├─ Smart contract locks PYUSD
└─ Winner receives PYUSD via smart contract
```

**Code**:
```typescript
// This is Ethereum, NOT Hedera
import { createWalletClient } from 'viem'
import { sepolia } from 'viem/chains'

// PYUSD is ERC20 on Sepolia
const PYUSD_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'

await walletClient.writeContract({
  address: PYUSD_ADDRESS,
  functionName: 'approve',
  // Using viem, NOT Hedera Agent Kit
})
```

### **2. Escrow State Tracking** (Hedera)

```
Tool: @hashgraph/sdk (Hedera SDK)
NOT: Hedera Agent Kit (yet - should upgrade!)

What happens:
├─ Creates escrow record on Hedera
├─ Tracks who deposited
├─ Monitors game state
└─ Coordinates with Sepolia for payouts
```

**Code**:
```typescript
// This is Hedera, but NOT Agent Kit
import { Client } from '@hashgraph/sdk'

const client = Client.forTestnet()
// Basic Hedera SDK, not Agent Kit features
```

---

## 🔀 Visual Flow

### **When Stake is Agreed**

```
1. ASI Negotiator
   "Let's stake 5 PYUSD"
           │
           ▼
2. Dual Deployment
   ├─► Sepolia: Create game (viem)
   │   • PYUSDStaking contract
   │   • Real PYUSD token
   │   • Smart contract escrow
   │
   └─► Hedera: Create escrow (@hashgraph/sdk)
       • State tracking
       • Deposit monitoring
       • Metadata storage
```

### **When Player Deposits**

```
Player clicks "Deposit 5 PYUSD"
           │
           ▼
   ┌───────────────┐
   │    Sepolia    │ ← Using viem (NOT Hedera Agent Kit)
   ├───────────────┤
   │ 1. Approve    │
   │    PYUSD      │
   │               │
   │ 2. Transfer   │
   │    to escrow  │
   └───────┬───────┘
           │
           ▼
   ┌───────────────┐
   │    Hedera     │ ← Using @hashgraph/sdk (NOT Agent Kit)
   ├───────────────┤
   │ 1. Update     │
   │    deposit    │
   │    status     │
   │               │
   │ 2. Track      │
   │    progress   │
   └───────────────┘
```

---

## 📦 Package Usage

| Operation | Package Used | Hedera Agent Kit? |
|-----------|-------------|-------------------|
| PYUSD approve | `viem` | ❌ NO |
| PYUSD transfer | `viem` | ❌ NO |
| Staking contract | `viem` | ❌ NO |
| Wallet connection | `wagmi` + `@rainbow-me/rainbowkit` | ❌ NO |
| Hedera escrow | `@hashgraph/sdk` | ⚠️ Basic SDK only |
| AI negotiation | `ASI Alliance` | ✅ YES (custom) |

---

## 🤔 Why Two Systems?

### **Sepolia for PYUSD** (Ethereum)
```
✅ Pros:
- Real PYUSD token available
- Ethereum-native
- Established infrastructure
- Compatible with existing wallets

❌ Cons:
- Slower (12s block time)
- Higher gas fees
- Congestion possible
```

### **Hedera for Escrow** (Hashgraph)
```
✅ Pros:
- Fast finality (<5s)
- Low fees ($0.0001)
- Good for state tracking
- Scalable

❌ Cons:
- PYUSD not natively available
- Requires Hedera account
- Less wallet support
```

---

## 🚀 Should We Use Hedera Agent Kit?

### **Current Reality**
```
PYUSD (Sepolia) ─┐
                 ├─► Game Logic
Hedera (State) ──┘

Tools:
- viem (Sepolia)
- @hashgraph/sdk (Hedera)
- NO Hedera Agent Kit
```

### **Better with Hedera Agent Kit**
```
PYUSD (Sepolia) ─┐
                 ├─► Hedera Agent Kit ─► AI Automated
Hedera (State) ──┘

Tools:
- viem (Sepolia)
- Hedera Agent Kit (Hedera) ← UPGRADE
- AI can manage escrow automatically
```

---

## 💡 Simple Analogy

Think of it like this:

```
┌─────────────────────────────────────┐
│         Bank (Sepolia)              │
│  • Holds actual money (PYUSD)      │
│  • Processes transactions           │
│  • Uses bank tools (viem)           │
│  ❌ NOT using Hedera Agent Kit      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Ledger (Hedera)                │
│  • Records who deposited            │
│  • Tracks game status               │
│  • Uses ledger tools (@hashgraph)   │
│  ⚠️ Could use Agent Kit for AI     │
└─────────────────────────────────────┘
```

---

## ✅ Answer Summary

| Question | Answer |
|----------|--------|
| Do we use Hedera Agent Kit for PYUSD? | ❌ NO |
| What do we use for PYUSD? | ✅ viem + wagmi (Ethereum) |
| Do we use Hedera at all? | ✅ YES (for escrow state) |
| Do we use Hedera Agent Kit for Hedera? | ⚠️ NO (basic SDK only) |
| Should we use Hedera Agent Kit? | ✅ YES (for better AI automation) |

---

## 🎯 The Truth

**PYUSD staking on Sepolia uses Ethereum tools (viem/wagmi), NOT Hedera Agent Kit.**

Hedera is used separately for escrow state tracking with basic Hedera SDK.

We **should** upgrade to Hedera Agent Kit for better AI automation, but that's for the Hedera side, not the PYUSD/Sepolia side.

---

## 📚 Files That Prove This

### **Sepolia PYUSD** (viem)
```
frontend/src/lib/contracts/sepoliaManager.ts
  → Uses: createWalletClient, createPublicClient
  → NOT using Hedera Agent Kit
```

### **Hedera Escrow** (@hashgraph/sdk)
```
frontend/src/lib/agents/hedera/index.ts
  → Uses: Client, AccountId, PrivateKey
  → Basic Hedera SDK, NOT Agent Kit
```

### **ASI Negotiator**
```
frontend/src/lib/agents/asi-alliance/negotiatorAgent.ts
  → Coordinates both chains
  → NOT using Hedera Agent Kit
```

---

**Want me to integrate Hedera Agent Kit for better automation? I can do that!** 🚀
