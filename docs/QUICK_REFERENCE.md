# 🚀 QuadraX Quick Reference

**Last Updated**: October 13, 2025

---

## ⚡ Essential Commands

```bash
# Setup (first time only)
setup.bat

# Start Development
start-dev.bat          # Starts Next.js dev server on :3000
ollama serve           # Starts AI server (separate terminal)

# Run Tests
test-project.bat       # All tests
npm test              # Contract tests only

# Build for Production
npm run build         # Build frontend
npx hardhat compile   # Compile contracts
```

---

## 📁 Where to Find Things

| What | Where |
|------|-------|
| **Smart Contracts** | `/contracts/core/*.sol` |
| **Game UI** | `/frontend/src/features/game/*.tsx` |
| **AI Agents** | `/frontend/src/lib/agents/quadraXAgent.ts` |
| **AI Chat** | `/frontend/src/features/game/AIChat.tsx` |
| **Tests** | `/test/*.test.js` |
| **Documentation** | `/docs/*.md` |
| **Setup Scripts** | `setup.bat`, `start-dev.bat` |

---

## 🎮 How to Play

1. **Start Services**
   ```bash
   ollama serve           # Terminal 1
   start-dev.bat          # Terminal 2
   ```

2. **Open Browser**
   ```
   http://localhost:3000
   ```

3. **Connect Wallet**
   - Click "Connect Wallet"
   - Choose MetaMask/WalletConnect

4. **Negotiate Stake**
   - Chat with AI: "Let's play for 5 PYUSD"
   - AI will negotiate
   - Confirm when agreed

5. **Play Game**
   - Place 4 pieces (placement phase)
   - Move pieces (movement phase)
   - Get 4-in-a-row to win!

---

## 🤖 AI Features

### Negotiate Stakes
```
You: "Let's play for 5 PYUSD"
AI:  "I'm thinking 7 PYUSD would be better given the odds"
You: "How about 6?"
AI:  "6 PYUSD works for me! Ready to lock it in?"
```

### Get Strategy Help
```
You: "What move should I make?"
AI:  "Position 5 looks strong - creates a diagonal threat"
```

### Analyze Position
```
You: "Analyze this position"
AI:  "You have a 65% win probability. I recommend defensive play"
```

---

## 🧪 Testing

### Contract Tests
```bash
npm test
# or
npx hardhat test
```

### AI Tests
```bash
cd test
node test-ollama-cuda.js              # Verify CUDA
node test-ai-negotiation-flow.mjs     # Test negotiation
node test-quadrax-agents.js           # Test agents
```

### E2E Tests
```bash
node test/test-complete-e2e.js
```

---

## 📚 Documentation

| Doc | What's Inside |
|-----|--------------|
| `README.md` | Project overview |
| `PROJECT_STRUCTURE.md` | Directory guide (READ THIS FIRST) |
| `docs/QUICKSTART.md` | 5-minute setup guide |
| `docs/ARCHITECTURE.md` | System architecture |
| `docs/OLLAMA_SETUP.md` | AI setup (Ollama + CUDA) |
| `docs/BUILD.md` | Build & deployment |
| `docs/TESTING.md` | Testing guide |
| `TODO.md` | Roadmap & tasks |

---

## 🔧 Configuration

### Environment Variables
```bash
# Copy template
cp .env.example .env

# Edit with your values
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
```

### Contract Addresses
```typescript
// frontend/src/lib/constants/contracts.ts
export const CONTRACTS = {
  TICTACTOE: '0x...',
  PYUSD_STAKING: '0x...',
  PYUSD_TOKEN: '0x...'
}
```

---

## 🐛 Troubleshooting

### Ollama Not Working
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama
ollama serve

# Pull model
ollama pull llama3.2:latest
```

### Frontend Won't Start
```bash
# Clear cache
rm -rf frontend/.next
rm -rf frontend/node_modules

# Reinstall
cd frontend
npm install
npm run dev
```

### Contract Tests Failing
```bash
# Clear cache
npx hardhat clean

# Recompile
npx hardhat compile

# Run tests
npx hardhat test
```

### CUDA Not Detected
```bash
# Check NVIDIA driver
nvidia-smi

# Check CUDA version
nvcc --version

# Restart Ollama with GPU
ollama serve
```

---

## 🎯 Common Tasks

### Add New AI Agent Personality
1. Edit `/frontend/src/lib/agents/quadraXAgent.ts`
2. Add to `QuadraXAgentFactory.createPredefinedAgents()`
3. Update `AgentPersonality` type

### Modify Game Rules
1. Edit `/contracts/core/TicTacToe.sol`
2. Compile: `npx hardhat compile`
3. Test: `npx hardhat test`
4. Deploy: `npx hardhat run scripts/deploy.js`

### Change Stake Bounds
1. Edit `/frontend/src/features/game/AIChat.tsx`
2. Update `ABSOLUTE_MIN_STAKE` and `ABSOLUTE_MAX_STAKE`
3. Update contract if needed: `/contracts/core/PYUSDStaking.sol`

### Add New Feature Page
1. Create `/frontend/src/app/feature-name/page.tsx`
2. Add layout if needed: `layout.tsx`
3. Add to navigation
4. Update documentation

---

## 📊 Project Stats

- **Smart Contracts**: 2 core + 2 interfaces
- **Contract Tests**: 39/39 passing ✅
- **AI Agents**: 4 personalities
- **Frontend Components**: 15+
- **Test Suites**: 7 files
- **Documentation**: 9 files
- **Lines of Code**: ~5,000+

---

## 🚦 Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# Edit files...

# 3. Run tests
test-project.bat

# 4. Commit
git add .
git commit -m "Add: new feature description"

# 5. Push
git push origin feature/new-feature

# 6. Create PR
# Use GitHub interface
```

---

## 🎨 Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint with Next.js rules
- **Naming**: 
  - Components: PascalCase
  - Files: kebab-case or PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

---

## 📦 Key Dependencies

### Root
- Hardhat 2.22.16
- OpenZeppelin 5.2.0
- Ethers.js 6.x

### Frontend
- Next.js 14.2.33
- React 18
- Wagmi 2.18.0
- Viem 2.38.0
- Tailwind CSS 3.4.1

### AI
- Ollama 0.12.5
- Llama 3.2 (2GB model)
- CUDA 12.4

---

## ✅ Checklist for New Developers

- [ ] Read `PROJECT_STRUCTURE.md`
- [ ] Run `setup.bat`
- [ ] Start `ollama serve`
- [ ] Run `start-dev.bat`
- [ ] Browse to `http://localhost:3000`
- [ ] Connect wallet (testnet)
- [ ] Chat with AI
- [ ] Run `test-project.bat`
- [ ] Read `docs/ARCHITECTURE.md`
- [ ] Check `TODO.md` for tasks

---

## 🆘 Getting Help

1. **Check Documentation**: See `/docs` directory
2. **Search Issues**: GitHub issues
3. **Read Code**: Comments in key files
4. **Run Tests**: Understand behavior through tests

---

## 🎉 Quick Wins

Want to contribute? Start with these easy tasks:

1. **Improve README**: Add screenshots
2. **Write Tests**: Increase coverage
3. **Fix Typos**: Check documentation
4. **Add Examples**: More code examples
5. **Update TODO**: Check off completed tasks

---

**🚀 Ready to build!**

Start with: `setup.bat` → `ollama serve` → `start-dev.bat`

---

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Status**: ✅ Clean & Organized
