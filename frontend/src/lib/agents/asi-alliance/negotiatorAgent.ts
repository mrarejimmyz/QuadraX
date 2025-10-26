// ASI Alliance Negotiator Agent
// Handles stake negotiations and will coordinate with Hedera agent for contract deployment

export interface NegotiationContext {
  userAddress?: string
  currentStake: number | null
  proposedStake: number | null
  conversationHistory: Array<{ role: string; content: string }>
  userBalance?: number
  gameHistory?: {
    gamesPlayed: number
    winRate: number
    avgStake: number
  }
}

export interface NegotiationResponse {
  message: string
  action: 'accept' | 'counter' | 'reject' | 'request_info' | 'discuss'
  proposedAmount?: number
  confidence: number
  reasoning: string
  hederaReady?: boolean // Flag for when Hedera deployment is needed
}

export class NegotiatorAgent {
  private name = 'ASI Negotiator'
  private personality = 'strategic'
  private minStake = 1
  private maxStake = 100
  private acceptanceThreshold = 0.7 // Higher = more likely to accept

  constructor() {
    console.log('🤖 ASI Alliance Negotiator Agent initialized')
  }

  /**
   * Analyze user's proposal and generate intelligent response
   */
  async negotiate(context: NegotiationContext): Promise<NegotiationResponse> {
    const { proposedStake, conversationHistory, userBalance, gameHistory } = context

    // Analyze conversation sentiment
    const sentiment = this.analyzeSentiment(conversationHistory)
    
    // No stake proposed yet - encourage discussion
    if (proposedStake === null) {
      return this.generateOpeningResponse(gameHistory)
    }

    // Validate stake range
    if (proposedStake < this.minStake) {
      return {
        message: `${proposedStake} PYUSD is below the minimum. Let's keep things interesting - how about starting at ${this.minStake} PYUSD?`,
        action: 'counter',
        proposedAmount: this.minStake,
        confidence: 1.0,
        reasoning: 'Below minimum threshold'
      }
    }

    if (proposedStake > this.maxStake) {
      const counter = Math.min(this.maxStake, proposedStake * 0.5)
      return {
        message: `${proposedStake} PYUSD is quite ambitious! I respect the confidence, but let's be reasonable. How about ${counter.toFixed(2)} PYUSD?`,
        action: 'counter',
        proposedAmount: counter,
        confidence: 0.9,
        reasoning: 'Above maximum threshold, countering at 50%'
      }
    }

    // Strategic decision based on multiple factors
    const decision = this.makeStrategicDecision(proposedStake, sentiment, userBalance, gameHistory)
    
    return decision
  }

  /**
   * Make strategic decision to accept, counter, or negotiate
   */
  private makeStrategicDecision(
    stake: number,
    sentiment: number,
    userBalance?: number,
    gameHistory?: NegotiationContext['gameHistory']
  ): NegotiationResponse {
    // Calculate acceptance probability based on multiple factors
    let acceptanceProbability = 0.5

    // Factor 1: Stake amount (prefer mid-range)
    const midpoint = (this.minStake + this.maxStake) / 2
    const distanceFromMid = Math.abs(stake - midpoint) / midpoint
    acceptanceProbability += (1 - distanceFromMid) * 0.2

    // Factor 2: User sentiment (positive sentiment increases acceptance)
    acceptanceProbability += sentiment * 0.15

    // Factor 3: Game history (experienced players get better terms)
    if (gameHistory && gameHistory.gamesPlayed > 5) {
      acceptanceProbability += 0.1
      if (gameHistory.winRate > 0.6) {
        acceptanceProbability += 0.05 // Reward skilled players
      }
    }

    // Factor 4: User balance consideration
    if (userBalance && stake > userBalance * 0.5) {
      acceptanceProbability -= 0.15 // Lower acceptance if they're risking too much
    }

    // Add some randomness for natural variation
    const randomFactor = Math.random() * 0.2 - 0.1
    acceptanceProbability += randomFactor

    // Decision time!
    if (acceptanceProbability >= this.acceptanceThreshold) {
      return {
        message: `${stake} PYUSD sounds fair! I accept your terms. Let's lock it in and prepare for an epic battle! 🎯`,
        action: 'accept',
        confidence: acceptanceProbability,
        reasoning: 'Strategic analysis favors acceptance',
        hederaReady: true // Signal to deploy contracts
      }
    }

    // Counter with strategic adjustment
    const shouldCounterHigher = Math.random() > 0.5 && stake < midpoint
    const counterMultiplier = shouldCounterHigher 
      ? 1.15 + Math.random() * 0.25  // 15-40% higher
      : 0.75 + Math.random() * 0.15  // 15-25% lower

    const counterAmount = Math.min(
      this.maxStake,
      Math.max(this.minStake, stake * counterMultiplier)
    )

    const rounded = Math.round(counterAmount * 100) / 100

    const messages = shouldCounterHigher ? [
      `${stake} PYUSD is reasonable, but I sense you have more confidence. How about ${rounded} PYUSD to make this truly exciting?`,
      `I like your thinking at ${stake} PYUSD, but let's raise the stakes to ${rounded} PYUSD for a more thrilling match!`,
      `${stake} PYUSD is a good start. Given your potential, I'd suggest ${rounded} PYUSD - are you up for it?`
    ] : [
      `${stake} PYUSD feels a bit steep for our first match. What about ${rounded} PYUSD to start?`,
      `I appreciate the boldness at ${stake} PYUSD, but let's build up to that. How about ${rounded} PYUSD for now?`,
      `${stake} PYUSD is ambitious! Let's begin at ${rounded} PYUSD and increase stakes in future matches if you dominate.`
    ]

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      action: 'counter',
      proposedAmount: rounded,
      confidence: 1 - acceptanceProbability,
      reasoning: shouldCounterHigher ? 'Countering higher to increase engagement' : 'Countering lower for risk management'
    }
  }

  /**
   * Generate opening response to start negotiation
   */
  private generateOpeningResponse(gameHistory?: NegotiationContext['gameHistory']): NegotiationResponse {
    const suggestedStake = gameHistory && gameHistory.avgStake > 0 
      ? Math.min(gameHistory.avgStake * 1.2, this.maxStake)
      : 10

    const messages = [
      `Welcome to QuadraX! Let's discuss the stakes. Based on typical matches, I'd suggest around ${suggestedStake} PYUSD. What feels right to you?`,
      `Ready for an exciting match? I'm thinking ${suggestedStake} PYUSD would make this interesting. What's your take?`,
      `Let's negotiate! Given your profile, I'd propose ${suggestedStake} PYUSD as a starting point. Too high? Too low?`
    ]

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      action: 'discuss',
      proposedAmount: suggestedStake,
      confidence: 0.6,
      reasoning: 'Opening negotiation with contextual suggestion'
    }
  }

  /**
   * Analyze conversation sentiment (-1 to 1)
   */
  private analyzeSentiment(history: Array<{ role: string; content: string }>): number {
    if (history.length === 0) return 0

    const positiveWords = ['great', 'awesome', 'perfect', 'excellent', 'good', 'agree', 'yes', 'deal', 'fair', 'love', 'nice']
    const negativeWords = ['no', 'bad', 'unfair', 'ridiculous', 'too much', 'too low', 'waste', 'boring']

    let score = 0
    const userMessages = history.filter(m => m.role === 'user')

    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase()
      
      positiveWords.forEach(word => {
        if (content.includes(word)) score += 0.1
      })

      negativeWords.forEach(word => {
        if (content.includes(word)) score -= 0.1
      })
    })

    return Math.max(-1, Math.min(1, score))
  }

  /**
   * Prepare for contract deployment on Sepolia + Hedera escrow
   * Creates game on Sepolia and deploys Hedera escrow for stake management
   */
  async prepareContractDeployment(stake: number, player1: string, player2: string) {
    console.log('🚀 Preparing dual-chain deployment (Sepolia + Hedera)...')
    console.log(`  Stake: ${stake} PYUSD`)
    console.log(`  Player 1: ${player1}`)
    console.log(`  Player 2: ${player2}`)

    const results: any = {
      sepolia: null,
      hedera: null,
      ready: false
    }

    try {
      // 1. Deploy Hedera Escrow (primary stake management)
      console.log('\n📋 Step 1: Deploying Hedera escrow...')
      const { getHederaAgent } = await import('@/lib/agents/hedera')
      const hederaAgent = getHederaAgent()
      
      // Initialize Hedera agent
      await hederaAgent.initialize()

      // Deploy escrow contract
      const escrowDeployment = await hederaAgent.deployEscrow(
        stake,
        player1,
        player2
      )

      results.hedera = escrowDeployment

      if (escrowDeployment.success) {
        console.log('✅ Hedera escrow deployed!')
        console.log(`  Contract ID: ${escrowDeployment.contractId}`)
      } else {
        console.warn('⚠️ Hedera escrow deployment failed, continuing without it')
      }

      // 2. Create game on Sepolia (optional, for transparency)
      console.log('\n📋 Step 2: Creating game on Sepolia...')
      const { getContractManager } = await import('@/lib/contracts/sepoliaManager')
      const contractManager = getContractManager()

      if (contractManager.isContractDeployed()) {
        try {
          const sepoliaDeployment = await contractManager.createGame(
            player1 as `0x${string}`,
            player2 as `0x${string}`
          )

          results.sepolia = sepoliaDeployment
          console.log('✅ Game created on Sepolia!')
          console.log(`  Game ID: ${sepoliaDeployment.gameId}`)
        } catch (error: any) {
          console.warn('⚠️ Sepolia game creation failed:', error.message)
          results.sepolia = { error: error.message }
        }
      } else {
        console.log('ℹ️ Sepolia contract not deployed, skipping')
      }

      // Determine overall success
      results.ready = escrowDeployment.success || (results.sepolia && !results.sepolia.error)

      return {
        ready: results.ready,
        message: escrowDeployment.success 
          ? `Hedera escrow deployed! Contract: ${escrowDeployment.contractId}. Ready to stake.`
          : 'Playing without on-chain escrow.',
        escrow: escrowDeployment.success ? {
          contractId: escrowDeployment.contractId,
          transactionId: escrowDeployment.transactionId,
          escrowAddress: escrowDeployment.escrowAddress
        } : null,
        sepolia: results.sepolia ? {
          gameId: results.sepolia.gameId?.toString(),
          transactionHash: results.sepolia.transactionHash
        } : null,
        stakeAmount: stake,
        requiresStaking: escrowDeployment.success
      }

    } catch (error: any) {
      console.error('❌ Contract deployment failed:', error)
      return {
        ready: false,
        message: `Deployment failed: ${error.message}. Playing without on-chain stakes.`,
        escrow: null,
        sepolia: null,
        requiresStaking: false,
        error: error.message
      }
    }
  }
}
