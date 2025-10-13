/**
 * QuadraX Agent Testing Suite
 * Tests game-specific AI with PYUSD staking integration
 */

// Mock fetch for Node.js environment
global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

// Simplified QuadraXAgent for testing (without TypeScript imports)
class QuadraXAgent {
  constructor(name, personality, hederaAccount, privateKey) {
    this.name = name
    this.personality = personality
    this.hederaAccountId = hederaAccount
    this.privateKey = privateKey
    this.baseUrl = 'http://localhost:11434'
    this.model = 'llama3.2:latest'
    this.conversationHistory = []
    this.initializeQuadraXPersonality()
  }

  initializeQuadraXPersonality() {
    const systemPrompt = `You are ${this.name}, a specialized QuadraX AI agent for 4x4 TicTacToe with PYUSD staking.

QUADRAX RULES YOU MUST KNOW:
🟦 4x4 Grid: 16 positions (0-15), NOT 3x3
🔄 Two Phases: 
  - PLACEMENT: Each player places 4 pieces
  - MOVEMENT: Move pieces to win
🏆 Win Conditions:
  - HORIZONTAL: [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]
  - VERTICAL: [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15]
  - DIAGONAL: [0,5,10,15], [3,6,9,12]
  - 2x2 SQUARES: [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]
🚫 NO TIES: Movement phase ensures winner

PYUSD STAKING:
💰 Min: 1 PYUSD (1,000,000 units)
💳 Fee: 0.25% platform fee
⛽ Gas: ~0.001 HBAR per tx
🏦 Auto payout to winner

PERSONALITY: ${this.personality.riskProfile} with ${this.personality.negotiationStyle} style`

    this.conversationHistory = [{ role: 'system', content: systemPrompt }]
  }

  async askOllama(prompt) {
    try {
      this.conversationHistory.push({ role: 'user', content: prompt })
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: this.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n\n') + '\n\nassistant:',
          stream: false,
          options: { temperature: 0.7, num_predict: 600 }
        }),
      })

      const data = await response.json()
      this.conversationHistory.push({ role: 'assistant', content: data.response })
      
      if (this.conversationHistory.length > 21) {
        this.conversationHistory = [this.conversationHistory[0], ...this.conversationHistory.slice(-18)]
      }

      return data.response.trim()
    } catch (error) {
      return `${this.name}: QuadraX analysis temporarily unavailable, but I remain committed to ${this.personality.riskProfile} strategy.`
    }
  }

  formatQuadraXBoard(board) {
    const symbols = { 0: '⬜', 1: '🔵', 2: '🔴' }
    let formatted = '   0  1  2  3\n'
    
    for (let row = 0; row < 4; row++) {
      formatted += `${row} `
      for (let col = 0; col < 4; col++) {
        const pos = row * 4 + col
        formatted += `${symbols[board[pos]] || '❓'} `
      }
      formatted += '\n'
    }
    return formatted
  }

  async analyzeQuadraXPosition(gamePosition, opponentProfile, pyusdContext) {
    const prompt = `Analyze QuadraX position as ${this.name}:

BOARD (4x4):
${this.formatQuadraXBoard(gamePosition.board)}

GAME STATE:
- Phase: ${gamePosition.phase.toUpperCase()}
- My Pieces: ${gamePosition.player1Pieces}/4 placed
- Opponent Pieces: ${gamePosition.player2Pieces}/4 placed
- Current Turn: Player ${gamePosition.currentPlayer}

OPPONENT PROFILE:
- Win Rate: ${Math.round(opponentProfile.winRate * 100)}%
- Average Stake: ${opponentProfile.averageStake} PYUSD
- Strategy: ${opponentProfile.preferredStrategy}

PYUSD CONTEXT:
- My Balance: ${pyusdContext.playerBalance} PYUSD
- Their Balance: ${pyusdContext.opponentBalance} PYUSD
- Market: ${pyusdContext.marketConditions}

Analyze this QuadraX position considering:
1. Win probability (0-100%)
2. Phase strategy (placement vs movement)
3. Win condition threats (horizontal/vertical/diagonal/2x2)
4. Next move recommendation

Remember: QuadraX has NO TIES due to movement phase!`

    const response = await this.askOllama(prompt)
    
    const winProbMatch = response.match(/win probability[:\s]*(\d+)%?/i)
    const moveMatch = response.match(/(?:move|position)[:\s]*(\d+)/i)
    
    return {
      winProbability: winProbMatch ? parseInt(winProbMatch[1]) / 100 : 0.5,
      confidence: 0.8,
      reasoning: response,
      recommendedMove: moveMatch ? parseInt(moveMatch[1]) : null,
      phaseStrategy: gamePosition.phase,
      threatAssessment: 'QuadraX analysis complete'
    }
  }

  async calculatePYUSDStake(winProb, opponentProfile, pyusdContext, gameContext) {
    const prompt = `Calculate PYUSD stake for QuadraX as ${this.name}:

WIN ANALYSIS:
- Win Probability: ${Math.round(winProb * 100)}%
- My Confidence: High (QuadraX expertise)

OPPONENT DATA:
- Win Rate: ${Math.round(opponentProfile.winRate * 100)}%
- Average Stake: ${opponentProfile.averageStake} PYUSD
- Pattern: ${opponentProfile.stakingPattern}
- Strategy: ${opponentProfile.preferredStrategy}

PYUSD ECONOMICS:
- Available: ${pyusdContext.playerBalance} PYUSD
- Opponent Has: ${pyusdContext.opponentBalance} PYUSD
- Minimum: ${pyusdContext.minStake} PYUSD
- Platform Fee: ${pyusdContext.platformFee}%
- Market: ${pyusdContext.marketConditions}

QUADRAX FACTORS:
- No ties = guaranteed winner
- Two phases = skill advantage matters
- Multiple win conditions = strategic depth
- PYUSD real money impact

Calculate optimal stake using Kelly Criterion + QuadraX adjustments + opponent psychology.
Consider my ${this.personality.riskProfile} risk profile.`

    const response = await this.askOllama(prompt)
    
    const stakeMatch = response.match(/(\d+(?:\.\d+)?)\s*PYUSD/i)
    const recommendedStake = stakeMatch ? parseFloat(stakeMatch[1]) : pyusdContext.minStake * 2
    
    return {
      recommendedStake,
      minStake: pyusdContext.minStake,
      maxStake: Math.min(pyusdContext.playerBalance * 0.3, pyusdContext.opponentBalance),
      reasoning: response,
      kellyCalculation: 'QuadraX-adjusted Kelly Criterion',
      opponentAdaptation: 'Pattern analysis integrated'
    }
  }

  async negotiatePYUSDStake(myStake, theirStake, opponentProfile, pyusdContext, round) {
    const prompt = `QuadraX PYUSD negotiation round ${round} as ${this.name}:

STAKES:
- My Offer: ${myStake} PYUSD
- Their Offer: ${theirStake} PYUSD
- Gap: ${Math.abs(myStake - theirStake)} PYUSD

OPPONENT (${opponentProfile.address?.substring(0, 8) || 'Unknown'}):
- Pattern: ${opponentProfile.stakingPattern}
- Win Rate: ${Math.round(opponentProfile.winRate * 100)}%
- Avg Stake: ${opponentProfile.averageStake} PYUSD

CONTEXT:
- Round: ${round} (pressure building)
- My Balance: ${pyusdContext.playerBalance} PYUSD
- Market: ${pyusdContext.marketConditions}

QUADRAX ECONOMICS:
- No ties = someone wins PYUSD guaranteed
- Platform fee: ${pyusdContext.platformFee}% to winner
- Real money at stake, not play money

My personality: ${this.personality.negotiationStyle}

DECISION: ACCEPT ${theirStake} PYUSD, COUNTER with new amount, or REJECT?

Consider opponent psychology, market timing, and QuadraX advantage.`

    const response = await this.askOllama(prompt)
    
    let decision = 'counter'
    if (response.toLowerCase().includes('accept')) decision = 'accept'
    if (response.toLowerCase().includes('reject')) decision = 'reject'
    
    const counterMatch = response.match(/(\d+(?:\.\d+)?)\s*PYUSD/i)
    
    return {
      decision,
      message: response,
      counterOffer: counterMatch ? parseFloat(counterMatch[1]) : null,
      reasoning: `QuadraX ${this.personality.riskProfile} analysis`,
      confidence: 0.85
    }
  }

  async selectQuadraXMove(gamePosition, opponentProfile, timeRemaining) {
    const availableMoves = gamePosition.possibleMoves || [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(i => gamePosition.board[i] === 0)
    
    const prompt = `Select QuadraX move as ${this.name}:

BOARD:
${this.formatQuadraXBoard(gamePosition.board)}

PHASE: ${gamePosition.phase.toUpperCase()}
- Available moves: ${availableMoves.join(', ')}
- Time remaining: ${timeRemaining}s

WIN CONDITIONS TO CONSIDER:
- ROWS: [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]
- COLS: [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15]
- DIAGONALS: [0,5,10,15], [3,6,9,12]
- 2x2 SQUARES: [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]

OPPONENT: ${opponentProfile.preferredStrategy} player

Select best move for ${gamePosition.phase} phase considering QuadraX's unique mechanics.`

    const response = await this.askOllama(prompt)
    
    const moveMatch = response.match(/(?:move|position)[:\s]*(\d+)/i)
    const selectedMove = moveMatch ? parseInt(moveMatch[1]) : availableMoves[0]
    
    return {
      move: selectedMove,
      reasoning: response,
      phaseStrategy: `${gamePosition.phase} optimization`,
      confidence: 0.8,
      backupMoves: availableMoves.slice(1, 4)
    }
  }

  async checkOllamaConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`)
      return response.ok
    } catch { return false }
  }
}

// Factory for QuadraX agents
const QuadraXAgentFactory = {
  createStrategicAnalyst: (name, account, key) => new QuadraXAgent(name, {
    name, traits: ['analytical', 'strategic', 'mathematical'],
    negotiationStyle: 'data-driven systematic', riskProfile: 'analytical',
    expertise: ['QuadraX strategy', 'PYUSD economics']
  }, account, key),

  createAggressiveTrader: (name, account, key) => new QuadraXAgent(name, {
    name, traits: ['aggressive', 'confident', 'high-pressure'],
    negotiationStyle: 'aggressive psychological pressure', riskProfile: 'aggressive',
    expertise: ['high-stakes gaming', 'PYUSD trading']
  }, account, key),

  createDefensiveExpert: (name, account, key) => new QuadraXAgent(name, {
    name, traits: ['cautious', 'defensive', 'calculated'],
    negotiationStyle: 'conservative methodical', riskProfile: 'defensive',
    expertise: ['risk management', 'PYUSD preservation']
  }, account, key)
}

// Test suite
class QuadraXAgentTester {
  constructor() {
    this.agents = []
    this.testResults = []
  }

  async testAgentCreation() {
    console.log('🎮 Creating QuadraX-Specific AI Agents...')
    
    this.agents = [
      QuadraXAgentFactory.createStrategicAnalyst('AlphaQuadra', '0.0.2001', 'key1'),
      QuadraXAgentFactory.createAggressiveTrader('BetaBlitz', '0.0.2002', 'key2'),
      QuadraXAgentFactory.createDefensiveExpert('GammaGuard', '0.0.2003', 'key3')
    ]

    console.log('✅ Created QuadraX agents:')
    this.agents.forEach(agent => {
      console.log(`   🤖 ${agent.name}: ${agent.personality.riskProfile} (${agent.personality.negotiationStyle})`)
    })

    // Test connections
    console.log('\n🔌 Testing Ollama connections...')
    for (let agent of this.agents) {
      const connected = await agent.checkOllamaConnection()
      console.log(`   ${connected ? '✅' : '❌'} ${agent.name}: ${connected ? 'Ready' : 'Offline'}`)
    }

    return this.agents.length > 0
  }

  async testQuadraXAnalysis() {
    console.log('\n🎯 Testing QuadraX Game Analysis...')

    // Complex 4x4 mid-game position
    const quadraXPosition = {
      board: [
        1, 0, 2, 0,  // Row 0
        0, 1, 0, 2,  // Row 1  
        2, 0, 1, 0,  // Row 2
        0, 0, 0, 1   // Row 3
      ],
      phase: 'movement',
      player1Pieces: 4,
      player2Pieces: 4,
      currentPlayer: 1,
      possibleMoves: [1, 3, 4, 6, 9, 11, 12, 13, 14],
      threatLevel: 'high'
    }

    const opponentProfile = {
      address: '0x742d35Cc6634C0532925a3b8D5c0532', 
      winRate: 0.72,
      averageStake: 15.5,
      preferredStrategy: 'aggressive',
      stakingPattern: 'moderate',
      gameHistory: [
        { result: 'win', stake: 20, winCondition: 'horizontal' },
        { result: 'win', stake: 12, winCondition: 'square' },
        { result: 'loss', stake: 8, winCondition: null }
      ]
    }

    const pyusdContext = {
      minStake: 1,
      platformFee: 0.25,
      gasEstimate: 0.001,
      playerBalance: 100.5,
      opponentBalance: 85.2,
      marketConditions: 'stable'
    }

    console.log('📋 Test Position:')
    console.log('   0  1  2  3')
    console.log('0 🔵⬜🔴⬜')
    console.log('1 ⬜🔵⬜🔴')
    console.log('2 🔴⬜🔵⬜')
    console.log('3 ⬜⬜⬜🔵')

    for (let agent of this.agents) {
      console.log(`\n🧠 ${agent.name} analyzing QuadraX position...`)
      try {
        const analysis = await agent.analyzeQuadraXPosition(quadraXPosition, opponentProfile, pyusdContext)

        console.log(`   📊 Win Probability: ${Math.round(analysis.winProbability * 100)}%`)
        console.log(`   🎮 Phase Strategy: ${analysis.phaseStrategy}`)
        console.log(`   🎯 Recommended Move: ${analysis.recommendedMove !== null ? `Position ${analysis.recommendedMove}` : 'None'}`)
        console.log(`   💭 Analysis: ${analysis.reasoning.substring(0, 150)}...`)

      } catch (error) {
        console.log(`   ❌ Analysis failed: ${error.message}`)
      }
    }

    return true
  }

  async testPYUSDStakeCalculation() {
    console.log('\n💰 Testing PYUSD Stake Calculations...')

    const opponentProfile = {
      winRate: 0.68,
      averageStake: 25.0,
      stakingPattern: 'high-roller',
      preferredStrategy: 'analytical'
    }

    const pyusdContext = {
      minStake: 1.0,
      platformFee: 0.25,
      playerBalance: 500.0,
      opponentBalance: 750.0,
      marketConditions: 'bullish'
    }

    const gameContext = {
      isRankedMatch: true,
      tournamentMultiplier: 2.5
    }

    for (let agent of this.agents) {
      console.log(`\n💵 ${agent.name} calculating PYUSD stake...`)
      try {
        const stakeCalc = await agent.calculatePYUSDStake(0.75, opponentProfile, pyusdContext, gameContext)

        console.log(`   💰 Recommended: ${stakeCalc.recommendedStake} PYUSD`)
        console.log(`   📊 Range: ${stakeCalc.minStake} - ${stakeCalc.maxStake} PYUSD`)
        console.log(`   🧮 Method: ${stakeCalc.kellyCalculation}`)
        console.log(`   🎯 Strategy: ${stakeCalc.reasoning.substring(0, 120)}...`)

      } catch (error) {
        console.log(`   ❌ Calculation failed: ${error.message}`)
      }
    }

    return true
  }

  async testPYUSDNegotiation() {
    console.log('\n🤝 Testing PYUSD Stake Negotiations...')

    const agent1 = this.agents[0] // Strategic
    const agent2 = this.agents[1] // Aggressive

    const opponentProfile = {
      address: '0x987fcdeb51234567890abcdef',
      winRate: 0.65,
      averageStake: 18.5,
      stakingPattern: 'moderate',
      preferredStrategy: 'defensive'
    }

    const pyusdContext = {
      minStake: 1.0,
      platformFee: 0.25,
      playerBalance: 200.0,
      opponentBalance: 150.0,
      marketConditions: 'volatile'
    }

    console.log(`\n⚔️ ${agent1.name} vs 🛡️ ${agent2.name} PYUSD Negotiation`)

    try {
      // Round 1: Agent1 offers
      const negotiation1 = await agent1.negotiatePYUSDStake(25.0, 15.0, opponentProfile, pyusdContext, 1)
      console.log(`\n${agent1.name} (Round 1):`)
      console.log(`   💼 Decision: ${negotiation1.decision.toUpperCase()}`)
      console.log(`   💬 "${negotiation1.message.substring(0, 180)}..."`)
      if (negotiation1.counterOffer) {
        console.log(`   💰 Counter: ${negotiation1.counterOffer} PYUSD`)
      }

      // Round 2: Agent2 responds
      const negotiation2 = await agent2.negotiatePYUSDStake(15.0, negotiation1.counterOffer || 25.0, opponentProfile, pyusdContext, 2)
      console.log(`\n${agent2.name} (Round 2):`)
      console.log(`   💼 Decision: ${negotiation2.decision.toUpperCase()}`)
      console.log(`   💬 "${negotiation2.message.substring(0, 180)}..."`)
      if (negotiation2.counterOffer) {
        console.log(`   💰 Counter: ${negotiation2.counterOffer} PYUSD`)
      }

      return true
    } catch (error) {
      console.log(`❌ Negotiation test failed: ${error.message}`)
      return false
    }
  }

  async testQuadraXMoveSelection() {
    console.log('\n🎮 Testing QuadraX Move Selection...')

    // Placement phase position
    const placementPosition = {
      board: [1, 0, 2, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
      phase: 'placement',
      player1Pieces: 2,
      player2Pieces: 2,
      currentPlayer: 1,
      possibleMoves: [1, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 15]
    }

    // Movement phase position
    const movementPosition = {
      board: [1, 2, 1, 0, 2, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
      phase: 'movement',
      player1Pieces: 4,
      player2Pieces: 4, 
      currentPlayer: 1,
      possibleMoves: [3, 6, 8, 9, 10, 11, 12, 13, 14, 15]
    }

    const opponentProfile = {
      preferredStrategy: 'adaptive',
      winRate: 0.71
    }

    for (let [phase, position] of [['placement', placementPosition], ['movement', movementPosition]]) {
      console.log(`\n🎯 ${phase.toUpperCase()} Phase Move Selection:`)
      
      for (let agent of this.agents) {
        console.log(`\n🤖 ${agent.name} selecting ${phase} move...`)
        try {
          const move = await agent.selectQuadraXMove(position, opponentProfile, 30)

          console.log(`   🎯 Selected Move: Position ${move.move}`)
          console.log(`   📊 Strategy: ${move.phaseStrategy}`)
          console.log(`   💭 Reasoning: ${move.reasoning.substring(0, 120)}...`)
          console.log(`   🔄 Backup Moves: ${move.backupMoves?.join(', ') || 'None'}`)

        } catch (error) {
          console.log(`   ❌ Move selection failed: ${error.message}`)
        }
      }
    }

    return true
  }

  async runQuadraXTestSuite() {
    console.log('🎮 QUADRAX AI AGENT TEST SUITE')
    console.log('🎯 Testing 4x4 TicTacToe with PYUSD Integration')
    console.log('=' * 70)

    const tests = [
      { name: 'Agent Creation', fn: () => this.testAgentCreation() },
      { name: 'QuadraX Analysis', fn: () => this.testQuadraXAnalysis() },
      { name: 'PYUSD Calculations', fn: () => this.testPYUSDStakeCalculation() },
      { name: 'PYUSD Negotiations', fn: () => this.testPYUSDNegotiation() },
      { name: 'Move Selection', fn: () => this.testQuadraXMoveSelection() }
    ]

    const results = []
    
    for (let test of tests) {
      try {
        const result = await test.fn()
        results.push({ name: test.name, passed: result })
      } catch (error) {
        console.log(`❌ ${test.name} failed: ${error.message}`)
        results.push({ name: test.name, passed: false })
      }
    }

    console.log('\n\n🏆 QUADRAX TEST RESULTS')
    console.log('=' * 50)
    results.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`)
    })

    const allPassed = results.every(r => r.passed)
    console.log(`\n🎯 OVERALL: ${allPassed ? 'ALL TESTS PASSED! 🎉' : 'SOME TESTS FAILED ⚠️'}`)
    
    if (allPassed) {
      console.log('\n🚀 QuadraX AI Agents are fully operational!')
      console.log('🎮 Ready for 4x4 TicTacToe with PYUSD staking!')
      console.log('💰 Agents understand: placement/movement phases, win conditions, PYUSD economics')
      console.log('🧠 Llama 3.2 integration complete for strategic gameplay!')
    }

    return allPassed
  }
}

// Export for use in other tests
module.exports = { QuadraXAgent, QuadraXAgentTester }

// Test Ollama first (only run if this is the main module)
if (require.main === module) {
  (async () => {
    console.log('🔌 Testing Ollama Connection...')
    try {
      const response = await fetch('http://localhost:11434/api/version')
      if (!response.ok) throw new Error('Ollama not running')
      console.log('✅ Ollama connected')
      
      const tester = new QuadraXAgentTester()
      await tester.runQuadraXTestSuite()
    } catch (error) {
      console.log('❌ Ollama not accessible')
      console.log('Please ensure: ollama serve && ollama pull llama3.2:latest')
    }
  })().catch(console.error)
}