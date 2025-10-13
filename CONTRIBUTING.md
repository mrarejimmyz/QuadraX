# Contributing to QuadraX

First off, thank you for considering contributing to QuadraX! 🎉

It's people like you that make QuadraX such a great tool. We welcome contributions from everyone, whether it's:

- 🐛 Reporting a bug
- 💬 Discussing the current state of the code
- 📝 Submitting a fix
- 🎨 Proposing new features
- ✨ Becoming a maintainer

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/QuadraX.git
   cd QuadraX
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** on GitHub

## 📋 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Request Process

1. **Update Documentation**: Ensure any new features are documented in the README or relevant docs
2. **Test Your Changes**: 
   - Run contract tests: `npm test`
   - Test frontend locally: `cd frontend && npm run dev`
   - Run E2E test: `node test/test-complete-game.mjs`
3. **Follow Code Style**: Use existing code patterns and maintain consistency
4. **Write Clear Commit Messages**: Follow conventional commit format (see below)
5. **One Feature Per PR**: Keep pull requests focused on a single feature or fix

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(game): add 2x2 square win detection
fix(staking): resolve PYUSD approval issue
docs(readme): update installation instructions
test(contracts): add staking edge case tests
```

## 🐛 Bug Reports

We use GitHub issues to track bugs. Report a bug by [opening a new issue](../../issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows, macOS, Linux]
 - Browser: [e.g. Chrome, Firefox]
 - Node.js version: [e.g. 18.0.0]
 - Ollama version: [e.g. 0.12.5]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We love feature requests! Before submitting:

1. **Check existing issues** to avoid duplicates
2. **Be specific** about the use case
3. **Explain the value** it would bring
4. **Consider implementation** (if you have ideas)

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 🧪 Testing Guidelines

### Smart Contract Tests

```bash
# Run all contract tests
npm test

# Run specific test file
npx hardhat test test/TicTacToe.test.js

# Run with gas reporting
REPORT_GAS=true npm test
```

### Frontend Testing

```bash
cd frontend

# Run development server
npm run dev

# Build for production (catches TypeScript errors)
npm run build

# Run tests (if available)
npm test
```

### E2E Testing

```bash
# Ensure Ollama is running
ollama serve

# Run complete game simulation
node test/test-complete-game.mjs
```

## 📝 Code Style Guidelines

### Solidity

- Use Solidity 0.8.20+
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use meaningful variable names
- Add NatSpec comments for all public functions
- Keep functions small and focused

```solidity
/// @notice Creates a new game with specified stake
/// @param stake Amount of PYUSD to stake
/// @return gameId The ID of the created game
function createGame(uint256 stake) external returns (uint256 gameId) {
    // Implementation
}
```

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep components small and focused

```typescript
/**
 * Hook for managing stake negotiation with smart contracts
 * @param gameId - The ID of the game to stake in
 * @returns Staking functions and state
 */
export function useStakeNegotiation(gameId: number) {
    // Implementation
}
```

### React Components

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

```tsx
interface BoardProps {
    board: (string | null)[];
    onCellClick: (index: number) => void;
    disabled?: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, onCellClick, disabled }) => {
    // Implementation
}
```

## 🔧 Development Setup

### Prerequisites

- Node.js v18+
- npm or yarn
- Git
- Ollama (for AI features)
- MetaMask (for wallet testing)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/QuadraX.git
cd QuadraX

# Install dependencies
npm install
cd frontend
npm install
cd ..

# Copy environment files
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Start Ollama
ollama serve
ollama pull llama3.2:latest

# Run tests
npm test

# Start development
cd frontend
npm run dev
```

## 🌟 Areas for Contribution

We'd especially love contributions in these areas:

### High Priority
- [ ] Hedera testnet integration
- [ ] PYUSD faucet integration
- [ ] Mobile responsive improvements
- [ ] Additional AI models support
- [ ] Gas optimization for contracts

### Medium Priority
- [ ] Multiplayer matchmaking
- [ ] Tournament mode
- [ ] Leaderboard system
- [ ] Game replay functionality
- [ ] Enhanced AI commentary

### Documentation
- [ ] Video tutorials
- [ ] API documentation
- [ ] Architecture diagrams
- [ ] Contract interaction examples
- [ ] Deployment guides

### Testing
- [ ] Additional contract edge cases
- [ ] Frontend component tests
- [ ] Integration tests
- [ ] Performance benchmarks

## 🤔 Questions?

Feel free to:
- Open a [Discussion](../../discussions) for general questions
- Join our [Discord](#) (coming soon)
- Email: ashishregmi2017@gmail.com

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at ashishregmi2017@gmail.com. All complaints will be reviewed and investigated promptly and fairly.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to QuadraX! 🎮✨
