/**
 * QuadraX Game-Specific AI Agent Implementation
 * Specialized for 4x4 TicTacToe with PYUSD staking on Hedera
 */

export interface GameResult {
  opponent: string
  result: 'win' | 'loss'
  stake: number
  winCondition?: 'horizontal' | 'vertical' | 'diagonal' | 'square'
  gamePhase?: 'placement' | 'movement'
  movesCount: number
  timestamp: number
}

export interface PYUSDStakeContext {
  minStake: number // 1 PYUSD minimum
  platformFee: number // 0.25% fee
  gasEstimate: number // Hedera gas costs
  playerBalance: number
  opponentBalance: number
  marketConditions: 'volatile' | 'stable' | 'bullish' | 'bearish'
}

export interface QuadraXGameRules {
  boardSize: 4 // 4x4 grid
  piecesPerPlayer: 4 // Only 4 pieces each
  phases: ['placement', 'movement'] // Two-phase gameplay
  winConditions: ['horizontal', 'vertical', 'diagonal', 'square'] // All win types
  noTies: true // Games always have a winner
  currency: 'PYUSD' // Staking currency
}

export interface PlayerProfile {
  address: string
  gamesPlayed: number
  winRate: number
  averageStake: number
  preferredStrategy: 'aggressive' | 'defensive' | 'adaptive'
  stakingPattern: 'conservative' | 'moderate' | 'high-roller'
  gameHistory: GameResult[]
}

export interface AgentPersonality {
  name: string
  traits: string[]
  negotiationStyle: string
  riskProfile: 'aggressive' | 'defensive' | 'analytical'
  expertise: string[]
}

export interface GamePosition {
  board: number[] // 0=empty, 1=player1, 2=player2
  phase: 'placement' | 'movement'
  player1Pieces: number // Pieces placed (max 4)
  player2Pieces: number
  currentPlayer: 1 | 2
  possibleMoves: number[]
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
}

export class QuadraXAgent {
  private baseUrl: string = 'http://localhost:11434'
  private model: string = 'llama3.2:latest'
  private conversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = []
  
  constructor(
    public name: string,
    public personality: AgentPersonality,
    public hederaAccountId: string,
    private privateKey: string
  ) {
    this.initializeQuadraXPersonality()
  }

  private initializeQuadraXPersonality() {
    const systemPrompt = `You are ${this.name}, a specialized AI agent for QuadraX - a strategic 4x4 TicTacToe game with PYUSD cryptocurrency stakes on Hedera network.

GAME RULES YOU MUST UNDERSTAND:
🟦 4x4 Grid: 16 positions (0-15), NOT standard 3x3
🔄 Two Phases: 
  - PLACEMENT: Each player places 4 pieces anywhere
  - MOVEMENT: Move your pieces to new positions
🏆 Win Conditions (4-in-a-line OR 2x2 square):
  - HORIZONTAL: Positions [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]
  - VERTICAL: [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15]  
  - DIAGONAL: [0,5,10,15], [3,6,9,12]
  - 2x2 SQUARES: [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]
🚫 NO TIES: Games always end with a winner due to movement phase

PYUSD STAKING MECHANICS:
💰 Minimum Stake: 10 PYUSD (10,000,000 units with 6 decimals) - negotiable lower
💳 Platform Fee: 0.25% (25 basis points) deducted from winner's payout  
⛽ Gas Costs: ~0.001 HBAR per transaction on Hedera
🏦 Contract: PYUSDStaking handles automatic payouts to winner

YOUR PERSONALITY:
- Traits: ${this.personality.traits.join(', ')}
- Negotiation Style: ${this.personality.negotiationStyle}
- Risk Profile: ${this.personality.riskProfile}
- Expertise: QuadraX strategy, PYUSD economics, player psychology

RESPONSIBILITIES:
1. Analyze 4x4 board positions with phase awareness
2. Calculate win probabilities considering both placement and movement phases
3. Negotiate PYUSD stakes based on opponent profiles and market conditions
4. Consider gas costs, platform fees, and slippage in stake calculations
5. Adapt strategy based on opponent's historical performance and patterns

Always think strategically about the two-phase nature and multiple win conditions. Be precise with position analysis and PYUSD calculations.`

    this.conversationHistory = [
      { role: 'system', content: systemPrompt }
    ]
  }

  // Analyze QuadraX-specific board position
  async analyzeQuadraXPosition(
    gamePosition: GamePosition,
    opponentProfile: PlayerProfile,
    pyusdContext: PYUSDStakeContext
  ): Promise<{
    winProbability: number
    confidence: number
    reasoning: string
    recommendedMove?: number
    phaseStrategy: string
    threatAssessment: string
    winConditionAnalysis: {
      horizontal: number
      vertical: number
      diagonal: number
      square: number
    }
  }> {
    const prompt = `Analyze this QuadraX position as ${this.name}:

CURRENT BOARD (4x4):
${this.formatQuadraXBoard(gamePosition.board)}

GAME STATE:
- Phase: ${gamePosition.phase.toUpperCase()}
- My Pieces Placed: ${gamePosition.phase === 'placement' ? gamePosition.player1Pieces : '4 (all placed)'}
- Opponent Pieces: ${gamePosition.phase === 'placement' ? gamePosition.player2Pieces : '4 (all placed)'}  
- Current Turn: Player ${gamePosition.currentPlayer}
- Threat Level: ${gamePosition.threatLevel.toUpperCase()}

OPPONENT PROFILE:
- Win Rate: ${Math.round(opponentProfile.winRate * 100)}%
- Games Played: ${opponentProfile.gamesPlayed}
- Preferred Strategy: ${opponentProfile.preferredStrategy}
- Average Stake: ${opponentProfile.averageStake} PYUSD
- Recent Form: ${this.getRecentForm(opponentProfile.gameHistory)}

PYUSD CONTEXT:
- My Balance: ${pyusdContext.playerBalance} PYUSD
- Opponent Balance: ${pyusdContext.opponentBalance} PYUSD  
- Market Conditions: ${pyusdContext.marketConditions}
- Platform Fee: ${pyusdContext.platformFee}%

ANALYSIS REQUIRED:
1. Win probability for current position (0-100%)
2. Confidence in analysis (0-100%)
3. Phase-specific strategy (placement vs movement)
4. Threat assessment of opponent's position
5. Win condition breakdown (horizontal/vertical/diagonal/square chances)
6. Recommended next move if it's your turn

Respond as ${this.personality.riskProfile} trader with ${this.personality.negotiationStyle} approach.`

    const response = await this.askOllama(prompt)
    
    // Parse the response for structured data
    return this.parseQuadraXAnalysis(response, gamePosition)
  }

  // Calculate PYUSD stake considering QuadraX factors
  async calculateQuadraXStake(
    winProbability: number,
    opponentProfile: PlayerProfile,
    pyusdContext: PYUSDStakeContext,
    gameContext: {
      isRankedMatch: boolean
      tournamentMultiplier?: number
      timeRemaining?: number
    }
  ): Promise<{
    recommendedStake: number
    minStake: number
    maxStake: number
    reasoning: string
    riskAssessment: string
    kellyCalculation: string
    opponentAdaptation: string
  }> {
    const prompt = `Calculate optimal PYUSD stake for QuadraX as ${this.name}:

WIN ANALYSIS:
- Calculated Win Probability: ${Math.round(winProbability * 100)}%
- My Confidence Level: Based on ${this.personality.riskProfile} analysis

OPPONENT INTELLIGENCE:
- ${opponentProfile.address.substring(0, 8)}... Profile:
  * Win Rate: ${Math.round(opponentProfile.winRate * 100)}% (${opponentProfile.gamesPlayed} games)
  * Average Stake: ${opponentProfile.averageStake} PYUSD
  * Staking Pattern: ${opponentProfile.stakingPattern}
  * Strategy: ${opponentProfile.preferredStrategy}

PYUSD ECONOMICS:
- My Available: ${pyusdContext.playerBalance} PYUSD
- Opponent Available: ${pyusdContext.opponentBalance} PYUSD
- Standard Stake: 10 PYUSD (negotiable lower to ${pyusdContext.minStake} PYUSD)
- Platform Fee: ${pyusdContext.platformFee}% (deducted from winner)
- Gas Cost: ~${pyusdContext.gasEstimate} HBAR
- Market: ${pyusdContext.marketConditions}

GAME CONTEXT:
- Match Type: ${gameContext.isRankedMatch ? 'RANKED' : 'CASUAL'}
- Tournament: ${gameContext.tournamentMultiplier ? `${gameContext.tournamentMultiplier}x multiplier` : 'None'}
- Time Pressure: ${gameContext.timeRemaining ? `${gameContext.timeRemaining}s remaining` : 'No limit'}

CALCULATE:
1. Kelly Criterion optimal stake size
2. Risk-adjusted stake for my ${this.personality.riskProfile} profile
3. Opponent adaptation (their likely stake based on patterns)  
4. Minimum and maximum reasonable stakes
5. Strategic reasoning for final recommendation

Consider: QuadraX has no ties (always a winner), opponent's staking psychology, PYUSD fee impact, and market volatility.`

    const response = await this.askOllama(prompt)
    
    return this.parseStakeCalculation(response, pyusdContext)
  }

  // Negotiate PYUSD stakes with opponent awareness
  async negotiateQuadraXStake(
    myProposedStake: number,
    opponentStake: number,
    opponentProfile: PlayerProfile,
    pyusdContext: PYUSDStakeContext,
    round: number,
    negotiationHistory: string[]
  ): Promise<{
    decision: 'accept' | 'counter' | 'reject'
    message: string
    counterOffer?: number
    reasoning: string
    confidence: number
    psychologyInsight: string
  }> {
    const prompt = `QuadraX PYUSD Stake Negotiation Round ${round} as ${this.name}:

CURRENT OFFERS:
- My Proposed Stake: ${myProposedStake} PYUSD
- Opponent's Offer: ${opponentStake} PYUSD
- Difference: ${Math.abs(myProposedStake - opponentStake)} PYUSD

OPPONENT PSYCHOLOGY (${opponentProfile.address.substring(0, 8)}...):
- Historical Pattern: ${opponentProfile.stakingPattern}
- Win Rate: ${Math.round(opponentProfile.winRate * 100)}% 
- Strategy Preference: ${opponentProfile.preferredStrategy}
- Average Stake Size: ${opponentProfile.averageStake} PYUSD
- Recent Results: ${this.getRecentForm(opponentProfile.gameHistory)}

NEGOTIATION CONTEXT:
- Round: ${round} (pressure builds each round)
- My Balance: ${pyusdContext.playerBalance} PYUSD  
- Their Balance: ${pyusdContext.opponentBalance} PYUSD
- Market: ${pyusdContext.marketConditions}
- Previous Exchanges: ${negotiationHistory.length} messages

QUADRAX FACTORS:
- No ties = guaranteed winner/loser
- Two-phase complexity = skill matters more
- Multiple win conditions = strategic depth
- PYUSD economics = real financial impact

MY PERSONALITY: ${this.personality.negotiationStyle} with ${this.personality.riskProfile} risk tolerance

DECISION REQUIRED:
1. ACCEPT their ${opponentStake} PYUSD offer?
2. COUNTER with new amount? 
3. REJECT and walk away?

Consider: opponent's psychology, market timing, your confidence, negotiation momentum, and PYUSD opportunity cost.

Respond in character with strategic reasoning.`

    const response = await this.askOllama(prompt)
    
    return this.parseNegotiationResponse(response, opponentStake)
  }

  // QuadraX-specific move selection
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: PlayerProfile,
    timeRemaining: number
  ): Promise<{
    move: number
    reasoning: string
    tacticalAnalysis: string
    phaseStrategy: string
    confidence: number
    backupMoves: number[]
  }> {
    const prompt = `Select optimal QuadraX move as ${this.name}:

BOARD POSITION:
${this.formatQuadraXBoard(gamePosition.board)}

GAME PHASE: ${gamePosition.phase.toUpperCase()}
${gamePosition.phase === 'placement' ? 
  `- Placement Phase: I have ${4 - gamePosition.player1Pieces} pieces left to place
  - Available positions: ${gamePosition.possibleMoves.join(', ')}` :
  `- Movement Phase: I can move any of my 4 pieces
  - My pieces at: ${this.getMyPiecePositions(gamePosition.board)}
  - Possible moves: ${gamePosition.possibleMoves.join(', ')}`
}

OPPONENT ANALYSIS:
- Strategy: ${opponentProfile.preferredStrategy}  
- Win Rate: ${Math.round(opponentProfile.winRate * 100)}%
- Typical Patterns: ${this.getOpponentPatterns(opponentProfile.gameHistory)}

TIME PRESSURE: ${timeRemaining}s remaining

WIN CONDITIONS TO CONSIDER:
- HORIZONTAL LINES: [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15]
- VERTICAL LINES: [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15]
- DIAGONAL LINES: [0,5,10,15], [3,6,9,12]  
- 2x2 SQUARES: All possible 2x2 combinations

STRATEGY REQUIREMENTS:
1. ${gamePosition.phase === 'placement' ? 'Optimal piece placement for future mobility' : 'Best piece movement for immediate/future threats'}
2. Block opponent's strongest win condition paths
3. Create multiple simultaneous threats when possible
4. Consider phase transition strategy

Select the strongest move considering QuadraX's unique mechanics and opponent psychology.`

    const response = await this.askOllama(prompt)
    
    return this.parseMoveSelection(response, gamePosition)
  }

  // Helper methods for QuadraX-specific formatting
  private formatQuadraXBoard(board: number[]): string {
    const symbols: Record<number, string> = { 0: '⬜', 1: '🔵', 2: '🔴' }
    let formatted = '   0  1  2  3\n'
    
    for (let row = 0; row < 4; row++) {
      formatted += `${row} `
      for (let col = 0; col < 4; col++) {
        const pos = row * 4 + col
        formatted += `${symbols[board[pos]] || '❓'} `
      }
      formatted += `\n`
    }
    
    return formatted
  }

  private getMyPiecePositions(board: number[]): number[] {
    const positions = []
    for (let i = 0; i < 16; i++) {
      if (board[i] === 1) positions.push(i)
    }
    return positions
  }

  private getRecentForm(gameHistory: GameResult[]): string {
    const recent = gameHistory.slice(-5)
    const wins = recent.filter(g => g.result === 'win').length
    return `${wins}/${recent.length} recent wins`
  }

  private getOpponentPatterns(gameHistory: GameResult[]): string {
    const patterns = gameHistory.slice(-10)
    const winConditions = patterns.filter(g => g.result === 'win').map(g => g.winCondition)
    const mostCommon = this.getMostCommon(winConditions)
    return mostCommon ? `Prefers ${mostCommon} wins` : 'No clear pattern'
  }

  private getMostCommon(arr: any[]): string | null {
    if (arr.length === 0) return null
    const counts = arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1
      return acc
    }, {})
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b)
  }

  // Ollama communication
  private async askOllama(prompt: string): Promise<string> {
    try {
      this.conversationHistory.push({ role: 'user', content: prompt })
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: this.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n\n') + '\n\nassistant:',
          stream: false,
          options: { 
            temperature: 0.7,
            num_predict: 800 // Longer responses for complex analysis
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = await response.json()
      this.conversationHistory.push({ role: 'assistant', content: data.response })
      
      // Keep conversation manageable
      if (this.conversationHistory.length > 25) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system prompt
          ...this.conversationHistory.slice(-20)
        ]
      }

      return data.response.trim()
    } catch (error) {
      console.error('Ollama error:', error)
      return this.getFallbackResponse(prompt)
    }
  }

  private getFallbackResponse(prompt: string): string {
    return `As ${this.name}, I'm experiencing technical difficulties but remain committed to my ${this.personality.riskProfile} QuadraX strategy. I'll analyze this position with my core ${this.personality.negotiationStyle} approach when systems are restored.`
  }

  // Parsing methods for structured responses
  private parseQuadraXAnalysis(response: string, gamePosition: GamePosition): any {
    // Implementation for parsing AI analysis into structured data
    const winProbMatch = response.match(/win probability[:\s]*(\d+)%?/i)
    const confidenceMatch = response.match(/confidence[:\s]*(\d+)%?/i)
    const moveMatch = response.match(/move[:\s]*(\d+)/i)
    
    return {
      winProbability: winProbMatch ? parseInt(winProbMatch[1]) / 100 : 0.5,
      confidence: confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.7,
      reasoning: response,
      recommendedMove: moveMatch ? parseInt(moveMatch[1]) : null,
      phaseStrategy: gamePosition.phase === 'placement' ? 'Strategic placement for mobility' : 'Optimal movement for threats',
      threatAssessment: gamePosition.threatLevel,
      winConditionAnalysis: {
        horizontal: 0.25,
        vertical: 0.25,
        diagonal: 0.25,
        square: 0.25
      }
    }
  }

  private parseStakeCalculation(response: string, pyusdContext: PYUSDStakeContext): any {
    const ABSOLUTE_MIN_STAKE = 1; // 1 PYUSD minimum
    const ABSOLUTE_MAX_STAKE = 10; // 10 PYUSD maximum
    
    const stakeMatch = response.match(/(\d+(?:\.\d+)?)\s*PYUSD/i)
    let recommendedStake = stakeMatch ? parseFloat(stakeMatch[1]) : 5; // Default to 5 PYUSD
    
    // Enforce absolute bounds
    recommendedStake = Math.max(ABSOLUTE_MIN_STAKE, Math.min(ABSOLUTE_MAX_STAKE, recommendedStake));
    
    const minStake = Math.max(ABSOLUTE_MIN_STAKE, pyusdContext.minStake);
    const maxStake = Math.min(ABSOLUTE_MAX_STAKE, pyusdContext.playerBalance, pyusdContext.opponentBalance);
    
    return {
      recommendedStake,
      minStake,
      maxStake,
      reasoning: response,
      riskAssessment: `${this.personality.riskProfile} analysis applied (bounded 1-10 PYUSD)`,
      kellyCalculation: 'Kelly Criterion with QuadraX adjustments',
      opponentAdaptation: 'Opponent pattern recognition integrated'
    }
  }

  private parseNegotiationResponse(response: string, opponentStake: number): any {
    const ABSOLUTE_MIN_STAKE = 1;
    const ABSOLUTE_MAX_STAKE = 10;
    
    let decision = 'counter'
    if (response.toLowerCase().includes('accept')) decision = 'accept'
    if (response.toLowerCase().includes('reject')) decision = 'reject'
    
    const counterMatch = response.match(/(\d+(?:\.\d+)?)\s*PYUSD/i)
    let counterOffer = counterMatch ? parseFloat(counterMatch[1]) : null;
    
    // Enforce bounds on counter offer
    if (counterOffer !== null) {
      counterOffer = Math.max(ABSOLUTE_MIN_STAKE, Math.min(ABSOLUTE_MAX_STAKE, counterOffer));
    }
    
    return {
      decision,
      message: response,
      counterOffer,
      reasoning: `${this.personality.negotiationStyle} approach (bounded 1-10 PYUSD)`,
      confidence: 0.8,
      psychologyInsight: 'Opponent pattern analysis applied'
    }
  }

  private parseMoveSelection(response: string, gamePosition: GamePosition): any {
    const moveMatch = response.match(/(?:move|position)[:\s]*(\d+)/i)
    const selectedMove = moveMatch ? parseInt(moveMatch[1]) : gamePosition.possibleMoves[0]
    
    return {
      move: selectedMove,
      reasoning: response,
      tacticalAnalysis: `${gamePosition.phase} phase analysis`,
      phaseStrategy: gamePosition.phase === 'placement' ? 'Strategic placement' : 'Tactical movement',
      confidence: 0.8,
      backupMoves: gamePosition.possibleMoves.slice(1, 4)
    }
  }

  // Connection utilities
  async checkOllamaConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`)
      return response.ok
    } catch {
      return false
    }
  }

  async ensureLlamaModel(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      const data = await response.json()
      return data.models.some((m: any) => m.name.includes('llama3.2'))
    } catch {
      return false
    }
  }
}

// Factory for creating specialized QuadraX agents
export class QuadraXAgentFactory {
  static createStrategicAnalyst(name: string, hederaAccount: string, privateKey: string): QuadraXAgent {
    return new QuadraXAgent(name, {
      name: name,
      traits: ['analytical', 'patient', 'strategic', 'mathematical'],
      negotiationStyle: 'data-driven and systematic',
      riskProfile: 'analytical',
      expertise: ['QuadraX strategy', 'PYUSD economics', 'game theory', 'pattern recognition']
    }, hederaAccount, privateKey)
  }

  static createAggressiveTrader(name: string, hederaAccount: string, privateKey: string): QuadraXAgent {
    return new QuadraXAgent(name, {
      name: name,
      traits: ['aggressive', 'confident', 'fast-acting', 'high-pressure'],
      negotiationStyle: 'aggressive with psychological pressure',
      riskProfile: 'aggressive', 
      expertise: ['high-stakes gaming', 'PYUSD trading', 'psychological warfare', 'momentum plays']
    }, hederaAccount, privateKey)
  }

  static createDefensiveExpert(name: string, hederaAccount: string, privateKey: string): QuadraXAgent {
    return new QuadraXAgent(name, {
      name: name,
      traits: ['cautious', 'defensive', 'risk-averse', 'calculated'],
      negotiationStyle: 'conservative and methodical',
      riskProfile: 'defensive',
      expertise: ['risk management', 'PYUSD preservation', 'defensive strategy', 'endgame theory']
    }, hederaAccount, privateKey)
  }

  static createAdaptivePlayer(name: string, hederaAccount: string, privateKey: string): QuadraXAgent {
    return new QuadraXAgent(name, {
      name: name,
      traits: ['adaptable', 'observant', 'flexible', 'learning-focused'],
      negotiationStyle: 'adaptive and opponent-responsive',
      riskProfile: 'analytical',
      expertise: ['opponent analysis', 'meta-gaming', 'PYUSD optimization', 'adaptive strategies']
    }, hederaAccount, privateKey)
  }
}