// Conversation Handler Service
// Handles different types of AI conversations with context-aware routing

import { QuadraXAgent, GamePosition as AgentGamePosition, PlayerProfile, PYUSDStakeContext as AgentPYUSDStakeContext } from '../lib/agents/quadraXAgent'
import { ollamaService, OllamaResponse } from './ollamaService'

export interface ConversationContext {
  gamePosition?: {
    board: number[]
    phase: 'placement' | 'movement'
    piecesPlaced: { player1: number, player2: number }
    currentPlayer: number
  }
  stakingContext?: {
    playerBalance: number
    opponentBalance: number
    minStake: number
    maxStake: number
    standardStake: number
    gameId?: string
  }
  userProfile?: {
    experience: string
    riskTolerance: string
    preferredStake: number
  }
}

export interface ConversationResponse {
  text: string
  confidence?: number
  reasoning?: string
  agentName?: string
  type: 'greeting' | 'explanation' | 'analysis' | 'fallback' | 'ai-generated'
}

export class ConversationHandler {
  private agents: QuadraXAgent[] = []

  constructor(agents: QuadraXAgent[] = []) {
    this.agents = agents
  }

  updateAgents(agents: QuadraXAgent[]): void {
    this.agents = agents
  }

  /**
   * Route conversation based on input type and context
   */
  async handleConversation(
    input: string, 
    context: ConversationContext = {}
  ): Promise<ConversationResponse> {
    const lowerInput = input.toLowerCase().trim()

    // Handle greetings
    if (this.isGreeting(lowerInput)) {
      return this.handleGreeting()
    }

    // Handle game explanations
    if (this.isExplanationRequest(lowerInput)) {
      return this.handleExplanation()
    }

    // Handle game analysis requests
    if (this.isAnalysisRequest(lowerInput) && context.gamePosition) {
      return await this.handleGameAnalysis(input, context)
    }

    // Handle staking questions
    if (this.isStakingQuestion(lowerInput)) {
      return await this.handleStakingAdvice(input, context)
    }

    // Handle general AI conversation
    if (this.agents.length > 0) {
      return await this.handleAIConversation(input, context)
    }

    // Fallback response
    return this.handleFallback(input)
  }

  private isGreeting(input: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']
    return greetings.some(greeting => input.includes(greeting))
  }

  private isExplanationRequest(input: string): boolean {
    const explanationTerms = ['what', 'how', 'explain', 'tell me', 'rules', 'game']
    return explanationTerms.some(term => input.includes(term))
  }

  private isAnalysisRequest(input: string): boolean {
    const analysisTerms = ['analyze', 'analysis', 'position', 'move', 'strategy', 'evaluate', 'assess']
    return analysisTerms.some(term => input.includes(term))
  }

  private isStakingQuestion(input: string): boolean {
    const stakingTerms = ['stake', 'bet', 'wager', 'risk', 'money', 'pyusd', 'invest']
    return stakingTerms.some(term => input.includes(term))
  }

  private handleGreeting(): ConversationResponse {
    const agent = this.agents.length > 0 ? this.agents[Math.floor(Math.random() * this.agents.length)] : null

    if (agent) {
      return {
        text: `👋 Hello! I'm ${agent.name}, your ${agent.personality.riskProfile} QuadraX AI specialist.

🎮 **Ready to help with**:
• Strategic analysis & game evaluation  
• PYUSD staking optimization (Kelly Criterion)
• Risk assessment & opponent psychology
• 4x4 QuadraX tactics (placement + movement)

💰 **Quick Info**: Standard stake is 10 PYUSD (negotiable 1-10 range)
🧠 **Powered by**: Llama 3.2 8B via Ollama + CUDA acceleration

What would you like to know about QuadraX strategy?`,
        agentName: agent.name,
        type: 'greeting'
      }
    }

    return {
      text: `👋 Hello! Welcome to QuadraX AI system.
🔄 Loading AI agents... Please wait a moment.
🚀 Ensure Ollama is running: \`ollama serve\``,
      type: 'greeting'
    }
  }

  private handleExplanation(): ConversationResponse {
    const agent = this.agents.length > 0 ? this.agents[0] : null

    const explanationText = `🎮 ${agent ? agent.name + ' explains' : 'About'} QuadraX:

**🏁 Game Objective**: Get 4 pieces in a row, column, diagonal, or 2x2 square
**📏 Board**: 4x4 grid (16 positions) - bigger than regular TicTacToe!
**🎯 Pieces**: Each player gets exactly 4 pieces
**⚡ Phases**: 1) Placement (put pieces anywhere) → 2) Movement (slide pieces around)
**🏆 Winner**: Always someone wins (no ties possible!)

**💰 PYUSD Staking**:
• Both players bet PYUSD cryptocurrency
• Winner takes ~95% (after 0.25% platform fee)
• Standard: 10 PYUSD, Range: 1-50+ PYUSD

**🤖 AI Features**:
• Real-time position analysis
• Kelly Criterion stake optimization  
• Multi-agent negotiations
• Opponent psychology profiling

Ask me: "How much should I stake?" or "Analyze this position!"`

    return {
      text: explanationText,
      agentName: agent?.name,
      type: 'explanation'
    }
  }

  private async handleGameAnalysis(input: string, context: ConversationContext): Promise<ConversationResponse> {
    if (!context.gamePosition || this.agents.length === 0) {
      return this.handleFallback(input)
    }

    try {
      // Use the most suitable agent for analysis
      const agent = this.agents[0] // Could be enhanced with agent selection logic
      
      // Convert context to agent format
      const agentGamePosition: AgentGamePosition = {
        board: context.gamePosition.board,
        phase: context.gamePosition.phase,
        player1Pieces: context.gamePosition.piecesPlaced.player1,
        player2Pieces: context.gamePosition.piecesPlaced.player2,
        currentPlayer: context.gamePosition.currentPlayer as 1 | 2,
        possibleMoves: [],
        threatLevel: 'medium'
      }
      
      const mockOpponent: PlayerProfile = {
        address: 'opponent-address',
        gamesPlayed: 10,
        winRate: 0.5,
        averageStake: 10,
        preferredStrategy: 'defensive',
        stakingPattern: 'moderate',
        gameHistory: []
      }
      
      const agentPyusdContext: AgentPYUSDStakeContext = {
        minStake: context.stakingContext?.minStake || 1,
        platformFee: 0.25,
        gasEstimate: 0.1,
        playerBalance: context.stakingContext?.playerBalance || 100,
        opponentBalance: context.stakingContext?.opponentBalance || 100,
        marketConditions: 'stable'
      }
      
      const analysisResult = await agent.analyzeQuadraXPosition(
        agentGamePosition,
        mockOpponent,
        agentPyusdContext
      )

      return {
        text: `🔍 **Position Analysis** by ${agent.name}:

${analysisResult.reasoning}

**📊 Evaluation**: ${(analysisResult.confidence * 100).toFixed(1)}% confidence
**🎯 Recommended Strategy**: ${analysisResult.confidence > 0.7 ? 'Aggressive' : analysisResult.confidence > 0.4 ? 'Balanced' : 'Defensive'}
**🎮 Phase**: ${context.gamePosition.phase === 'placement' ? 'Piece Placement' : 'Piece Movement'}

${analysisResult.recommendedMove ? `**💡 Suggested Move**: Position ${analysisResult.recommendedMove}` : ''}`,
        confidence: analysisResult.confidence,
        reasoning: analysisResult.reasoning,
        agentName: agent.name,
        type: 'analysis'
      }
    } catch (error) {
      console.error('Game analysis failed:', error)
      return this.handleFallback(input)
    }
  }

  private async handleStakingAdvice(input: string, context: ConversationContext): Promise<ConversationResponse> {
    if (this.agents.length === 0) {
      return this.handleFallback(input)
    }

    try {
      const agent = this.agents.find(a => a.personality.riskProfile === 'defensive') || this.agents[0]
      
      // Use context or defaults for staking calculation
      const playerBalance = context.stakingContext?.playerBalance || 100
      const opponentBalance = context.stakingContext?.opponentBalance || 100
      
      const mockOpponent: PlayerProfile = {
        address: 'opponent-address',
        gamesPlayed: 10,
        winRate: 0.5,
        averageStake: 10,
        preferredStrategy: 'defensive',
        stakingPattern: 'moderate',
        gameHistory: []
      }
      
      const agentPyusdContext: AgentPYUSDStakeContext = {
        minStake: context.stakingContext?.minStake || 1,
        platformFee: 0.25,
        gasEstimate: 0.1,
        playerBalance: playerBalance,
        opponentBalance: opponentBalance,
        marketConditions: 'stable'
      }
      
      const stakeAdvice = await agent.calculateQuadraXStake(
        context.gamePosition ? 0.6 : 0.5, // Win probability estimate
        mockOpponent,
        agentPyusdContext,
        {
          isRankedMatch: false,
          tournamentMultiplier: 1
        }
      )

      return {
        text: `💰 **Staking Advice** from ${agent.name}:

**💡 Recommended Stake**: ${stakeAdvice.recommendedStake} PYUSD
**� Range**: ${stakeAdvice.minStake} - ${stakeAdvice.maxStake} PYUSD
**⚖️ Risk Assessment**: ${stakeAdvice.riskAssessment}

**💭 Reasoning**: ${stakeAdvice.reasoning}

**🧮 Kelly Calculation**: ${stakeAdvice.kellyCalculation}

**🎯 Strategy**: Based on your balance (${playerBalance} PYUSD) and ${agent.personality.riskProfile} approach, this stake optimizes long-term growth while managing risk.

**👥 Opponent Adaptation**: ${stakeAdvice.opponentAdaptation}

**⚠️ Remember**: Never stake more than you can afford to lose!`,
        reasoning: stakeAdvice.reasoning,
        agentName: agent.name,
        type: 'analysis'
      }
    } catch (error) {
      console.error('Staking advice failed:', error)
      return this.handleFallback(input)
    }
  }

  private async handleAIConversation(input: string, context: ConversationContext): Promise<ConversationResponse> {
    try {
      // Select appropriate agent
      const agent = this.agents[Math.floor(Math.random() * this.agents.length)]
      
      // Build context for AI
      const contextString = this.buildContextString(context)
      
      // Generate AI response using Ollama
      const aiResponse = await ollamaService.generateResponse(input, contextString)
      
      if (aiResponse?.response) {
        return {
          text: `🤖 **${agent.name}** (${agent.personality.riskProfile}) responds:

${aiResponse.response}

💡 *This response was generated using Llama 3.2 8B with GPU acceleration*`,
          agentName: agent.name,
          type: 'ai-generated'
        }
      }
      
      // Fallback if AI generation fails
      return this.handleFallback(input)
    } catch (error) {
      console.error('AI conversation failed:', error)
      return this.handleFallback(input)
    }
  }

  private buildContextString(context: ConversationContext): string {
    let contextStr = `You are a QuadraX AI assistant specializing in 4x4 strategic board games with PYUSD cryptocurrency staking.

Game Rules:
- 4x4 grid with placement and movement phases
- 4 pieces per player
- Win by getting 4 in a row/column/diagonal or 2x2 square
- PYUSD staking with Kelly Criterion optimization

`

    if (context.gamePosition) {
      contextStr += `Current Game State:
- Phase: ${context.gamePosition.phase}
- Current Player: ${context.gamePosition.currentPlayer}
- Pieces Placed: Player 1: ${context.gamePosition.piecesPlaced.player1}, Player 2: ${context.gamePosition.piecesPlaced.player2}

`
    }

    if (context.stakingContext) {
      contextStr += `Staking Context:
- Player Balance: ${context.stakingContext.playerBalance} PYUSD
- Opponent Balance: ${context.stakingContext.opponentBalance} PYUSD  
- Standard Stake: ${context.stakingContext.standardStake} PYUSD

`
    }

    contextStr += `Be helpful, strategic, and concise. Focus on QuadraX strategy, staking advice, and game analysis.`

    return contextStr
  }

  private handleFallback(input: string): ConversationResponse {
    return {
      text: `🤔 I'm not sure about "${input.substring(0, 30)}${input.length > 30 ? '...' : ''}"

💡 Try asking:
• "Hello" - Get started with QuadraX AI
• "How much should I stake?" - PYUSD guidance  
• "Analyze this position" - Game analysis
• "Explain the rules" - Game overview
• "What do you think?" - General AI advice

🚀 Real AI responses available when Ollama is running with CUDA acceleration!`,
      type: 'fallback'
    }
  }
}

export const conversationHandler = new ConversationHandler()