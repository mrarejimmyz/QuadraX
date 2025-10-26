# 🎮 QuadraX E2E Testing Guide

**Ready to test the complete dual-chain staking system!**

---

## ✅ Pre-Flight Check

All systems configured and ready:

- ✅ Contracts deployed to Sepolia
- ✅ Frontend config updated
- ✅ Hedera agent configured
- ✅ 50 PYUSD in wallet
- ✅ 0.3 ETH for gas
- ✅ 1000 HBAR on Hedera

---

## 🚀 Start Testing

### Step 1: Start the Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
✓ Ready in 2s
○ Local:    http://localhost:3000
```

### Step 2: Open in Browser
Navigate to: **http://localhost:3000/negotiate**

---

## 🧪 Test Scenarios

### Test 1: View Contract Info
**Goal**: Verify frontend can read deployed contracts

1. Open browser console (F12)
2. Navigate to /negotiate
3. Check for any errors
4. Verify contract addresses logged

**Expected**:
```javascript
PYUSDStaking: 0x1E7A9732C25DaD9880ac9437d00a071B937c1807
PYUSD Token: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
```

---

### Test 2: Connect Wallet
**Goal**: Connect MetaMask and verify network

1. Click "Connect Wallet"
2. Select MetaMask
3. Approve connection
4. Verify network is Sepolia (Chain ID: 11155111)

**Expected**:
- ✅ Wallet connected
- ✅ Address: 0x224783D70D55F9Ab790Fe27fCFc4629241F45371
- ✅ Network: Sepolia Testnet

**Troubleshooting**:
- If on wrong network: MetaMask → Switch to Sepolia
- If no Sepolia: Add network manually (Chain ID: 11155111)

---

### Test 3: Check PYUSD Balance
**Goal**: Verify PYUSD balance display

**Expected Display**:
```
PYUSD Balance: 50.0 PYUSD
```

**If 0 PYUSD**:
1. Check wallet address is correct
2. Get PYUSD from https://faucet.circle.com/

---

### Test 4: Create a Game
**Goal**: Create new game with AI agent

1. Set stake amount: `5` PYUSD
2. Enter opponent (or leave for AI)
3. Click "Create Game"

**Expected**:
- ✅ Game creation transaction prompt
- ✅ MetaMask popup for signature
- ✅ Transaction submitted
- ✅ Game ID returned

**Contract Called**: `PYUSDStaking.createGame()`

---

### Test 5: Approve PYUSD
**Goal**: Approve staking contract to spend PYUSD

1. After game created, click "Approve PYUSD"
2. Amount: 5 PYUSD (or your stake)
3. Confirm in MetaMask

**Expected**:
- ✅ Approval transaction
- ✅ Success notification
- ✅ Ready to stake

**Contract Called**: `PYUSD.approve(stakingAddress, amount)`

---

### Test 6: Stake Tokens
**Goal**: Lock PYUSD in staking contract

1. Click "Stake" button
2. Confirm transaction in MetaMask
3. Wait for confirmation

**Expected**:
- ✅ Stake transaction sent
- ✅ PYUSD transferred to contract
- ✅ Game status updated
- ✅ Hedera escrow deployed

**Dual-Chain Operations**:
1. Sepolia: PYUSD transferred
2. Hedera: Escrow state created
3. Both: Synced and verified

**Contract Called**: `PYUSDStaking.stake(gameId, amount)`

---

### Test 7: Verify Dual-Chain Status
**Goal**: Check both chains are in sync

**Sepolia Status**:
```
Player 1 Staked: ✅
Amount: 5 PYUSD
Tx: 0x...
```

**Hedera Status**:
```
Escrow ID: 0.0.7132683-escrow-XXX
Player 1 Deposited: ✅
Total Tracked: 5 PYUSD
```

---

### Test 8: View on Explorers
**Goal**: Verify transactions on blockchain

**Sepolia Etherscan**:
1. Copy transaction hash
2. Visit: https://sepolia.etherscan.io/tx/[hash]
3. Verify:
   - ✅ Status: Success
   - ✅ From: Your address
   - ✅ To: PYUSDStaking contract
   - ✅ PYUSD transfer visible

**Hedera HashScan**:
1. Visit: https://hashscan.io/testnet/account/0.0.7132683
2. Verify recent transactions
3. Check escrow deployments

---

## 🎯 Success Criteria

### Minimum Viable Test ✅
- [ ] Frontend starts without errors
- [ ] Can connect wallet
- [ ] PYUSD balance displays
- [ ] Can create game
- [ ] Can approve PYUSD
- [ ] Can stake tokens
- [ ] Transaction confirms on Sepolia

### Complete E2E Test ✅
- [ ] All above +
- [ ] Hedera escrow deploys
- [ ] Both chains show synced state
- [ ] Can track deposits
- [ ] Treasury calculation shown
- [ ] Can view on explorers

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to wallet"
**Fix**:
1. Install MetaMask extension
2. Create/import wallet
3. Refresh page and try again

### Issue: "Wrong network"
**Fix**:
1. MetaMask → Networks → Add Network
2. Network Name: Sepolia
3. RPC URL: https://sepolia.infura.io/v3/...
4. Chain ID: 11155111
5. Currency: ETH

### Issue: "Insufficient balance"
**Fix**:
- ETH: https://sepoliafaucet.com/
- PYUSD: https://faucet.circle.com/

### Issue: "Contract not found"
**Fix**:
1. Check `.env.local` has correct addresses
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Verify on Etherscan contract exists

### Issue: "Transaction failing"
**Fix**:
1. Check ETH balance for gas
2. Increase gas limit in MetaMask
3. Verify PYUSD approval first
4. Check contract on Etherscan

### Issue: "Hedera not syncing"
**Fix**:
1. Check HEDERA_ACCOUNT_ID in .env.local
2. Verify HBAR balance > 0
3. Run: `npm run test:hedera:real`
4. Check browser console for errors

---

## 📊 What to Monitor

### Browser Console
Watch for:
- ✅ Contract addresses logged
- ✅ Transaction hashes
- ✅ Hedera escrow IDs
- ❌ Any errors or warnings

### MetaMask
Watch for:
- Activity log showing transactions
- PYUSD balance decreasing on stake
- ETH balance for gas

### Network Tab (F12 → Network)
- API calls to Sepolia RPC
- Hedera API calls
- No 404 or 500 errors

---

## 📸 Take Screenshots

Document your testing:

1. Wallet connected screen
2. PYUSD balance display
3. Game creation form
4. Approval transaction
5. Stake transaction
6. Success confirmation
7. Etherscan transaction
8. HashScan escrow

---

## 🎉 Test Complete Checklist

After testing, verify:

- [ ] ✅ All transactions successful
- [ ] ✅ No console errors
- [ ] ✅ Sepolia contract working
- [ ] ✅ Hedera escrow working
- [ ] ✅ Dual-chain sync confirmed
- [ ] ✅ Ready for demo/presentation

---

## 🚀 Next Steps After Testing

1. **Document Issues**: Note any bugs or UX improvements
2. **Test Edge Cases**: Try different stake amounts, network switches
3. **Test AI Agent**: Try AI opponent negotiation
4. **Prepare Demo**: Create test scenarios for presentation
5. **Optimize UX**: Based on testing feedback

---

## 📞 Need Help?

### Quick Debug Commands
```bash
# Check environment
cat frontend/.env.local

# Verify contracts
npm run test:deployment

# Test Hedera
npm run test:hedera:real

# Full health check
npm run test:complete
```

### Contract Addresses
- PYUSDStaking: `0x1E7A9732C25DaD9880ac9437d00a071B937c1807`
- TicTacToe: `0xFD7B057CcdD731a446eFfd29ae95D03b0a63a986`
- PYUSD: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`

---

**Ready to test!** 🎮

**Run**: `cd frontend && npm run dev`

**Navigate to**: http://localhost:3000/negotiate
