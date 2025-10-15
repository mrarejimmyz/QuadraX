// AI Agent Management Service
// Handles QuadraX agent lifecycle, initialization, and coordination with ASI Alliance

import { QuadraXAgent, QuadraXAgentFactory } from '../lib/agents/quadraXAgent'
import { aiProvider } from './aiProvider'

export interface AgentStatus {
  agent: QuadraXAgent
  connected: boolean
  lastPing: Date
  responseTime: number
  errorCount: number
}

export interface AgentManagerConfig {
  maxAgents: number
  connectionTimeout: number
  pingInterval: number
  maxRetries: number
}

export class AgentManager {
  private agents: Map<string, AgentStatus> = new Map()
  private config: AgentManagerConfig
  private pingIntervalId?: NodeJS.Timeout

  constructor(config: Partial<AgentManagerConfig> = {}) {
    this.config = {
      maxAgents: config.maxAgents || 4,
      connectionTimeout: config.connectionTimeout || 5000,
      pingInterval: config.pingInterval || 30000, // 30 seconds
      maxRetries: config.maxRetries || 3,
      ...config
    }
  }

  /**
   * Initialize default set of QuadraX agents with ASI Alliance
   */
  async initializeAgents(): Promise<QuadraXAgent[]> {
    try {
      // First ensure ASI Alliance is ready
      const asiReady = await aiProvider.checkConnection()
      if (!asiReady) {
        console.warn('ASI Alliance not ready, attempting to initialize...')
        await aiProvider.initialize()
      }

      // Create diverse agent portfolio
      const agentConfigs = [
        {
          factory: QuadraXAgentFactory.createStrategicAnalyst,
          name: 'AlphaStrategist',
          version: '0.0.3001',
          key: 'strategic-key'
        },
        {
          factory: QuadraXAgentFactory.createDefensiveExpert,
          name: 'BetaDefender', 
          version: '0.0.3002',
          key: 'defensive-key'
        },
        {
          factory: QuadraXAgentFactory.createAggressiveTrader,
          name: 'GammaAggressor',
          version: '0.0.3003', 
          key: 'aggressive-key'
        },
        {
          factory: QuadraXAgentFactory.createAdaptivePlayer,
          name: 'DeltaEvolver',
          version: '0.0.3004',
          key: 'adaptive-key'
        }
      ]

      const connectedAgents: QuadraXAgent[] = []

      for (const config of agentConfigs) {
        try {
          const agent = config.factory(config.name, config.version, config.key)
          
          // Test agent connection
          const startTime = Date.now()
          const connected = await this.testAgentConnection(agent)
          const responseTime = Date.now() - startTime

          if (connected) {
            this.agents.set(agent.name, {
              agent,
              connected: true,
              lastPing: new Date(),
              responseTime,
              errorCount: 0
            })
            connectedAgents.push(agent)
            
            console.log(`✅ Agent ${agent.name} (${agent.personality.riskProfile}) initialized - ${responseTime}ms`)
          } else {
            console.warn(`❌ Agent ${agent.name} failed to connect`)
          }
        } catch (error) {
          console.error(`Failed to initialize agent ${config.name}:`, error)
        }
      }

      // Start health monitoring
      this.startHealthMonitoring()

      console.log(`🤖 Initialized ${connectedAgents.length}/${agentConfigs.length} agents`)
      return connectedAgents
    } catch (error) {
      console.error('Agent initialization failed:', error)
      return []
    }
  }

  /**
   * Test individual agent connection and response capability
   */
  private async testAgentConnection(agent: QuadraXAgent): Promise<boolean> {
    try {
      // Test basic ASI Alliance connection first
      const asiConnected = await agent.checkASIConnection()
      if (!asiConnected) return false

      // Test agent-specific response capability  
      const testResponse = await Promise.race([
        this.performAgentHealthCheck(agent),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), this.config.connectionTimeout)
        )
      ])

      return testResponse
    } catch (error) {
      console.warn(`Agent ${agent.name} connection test failed:`, error)
      return false
    }
  }

  /**
   * Perform detailed health check on agent
   */
  private async performAgentHealthCheck(agent: QuadraXAgent): Promise<boolean> {
    try {
      // Test agent analysis capability
      const testPosition = {
        board: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Empty 4x4 board
        phase: 'placement' as const,
        player1Pieces: 0,
        player2Pieces: 0,
        currentPlayer: 1 as const,
        possibleMoves: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        threatLevel: 'low' as const
      }
      
      const testOpponent = {
        address: 'test-opponent',
        gamesPlayed: 10,
        winRate: 0.5,
        averageStake: 5,
        preferredStrategy: 'defensive' as const,
        stakingPattern: 'moderate' as const,
        gameHistory: []
      }
      
      const testContext = {
        minStake: 1,
        platformFee: 0.0025,
        gasEstimate: 0.1,
        playerBalance: 100,
        opponentBalance: 100,
        marketConditions: 'stable' as const
      }
      
      const response = await agent.analyzeQuadraXPosition(testPosition, testOpponent, testContext)

      return response !== null && response !== undefined
    } catch (error) {
      return false
    }
  }

  /**
   * Get all connected agents
   */
  getConnectedAgents(): QuadraXAgent[] {
    return Array.from(this.agents.values())
      .filter(status => status.connected)
      .map(status => status.agent)
  }

  /**
   * Get agent by name
   */
  getAgent(name: string): QuadraXAgent | null {
    const status = this.agents.get(name)
    return status?.connected ? status.agent : null
  }

  /**
   * Get agents by risk profile
   */
  getAgentsByProfile(riskProfile: 'aggressive' | 'defensive' | 'analytical'): QuadraXAgent[] {
    return this.getConnectedAgents().filter(
      agent => agent.personality.riskProfile === riskProfile
    )
  }

  /**
   * Get best agent for specific task
   */
  getBestAgentForTask(task: 'analysis' | 'staking' | 'negotiation' | 'general'): QuadraXAgent | null {
    const agents = this.getConnectedAgents()
    if (agents.length === 0) return null

    switch (task) {
      case 'analysis':
        return agents.find(a => a.personality.riskProfile === 'analytical') || agents[0]
      
      case 'staking':
        return agents.find(a => a.personality.riskProfile === 'defensive') || agents[0]
        
      case 'negotiation':
        return agents.find(a => a.personality.riskProfile === 'aggressive') || agents[0]
        
      case 'general':
      default:
        // Return agent with best response time and lowest error count
        return agents.reduce((best, current) => {
          const bestStatus = this.agents.get(best.name)!
          const currentStatus = this.agents.get(current.name)!
          
          if (currentStatus.errorCount < bestStatus.errorCount) return current
          if (currentStatus.errorCount === bestStatus.errorCount && 
              currentStatus.responseTime < bestStatus.responseTime) return current
          
          return best
        })
    }
  }

  /**
   * Get agent statistics and health information
   */
  getAgentStats(): { [agentName: string]: AgentStatus } {
    const stats: { [agentName: string]: AgentStatus } = {}
    
    for (const [name, status] of this.agents.entries()) {
      stats[name] = { ...status }
    }
    
    return stats
  }

  /**
   * Reconnect failed agents
   */
  async reconnectFailedAgents(): Promise<number> {
    let reconnectedCount = 0
    
    for (const name of Array.from(this.agents.keys())) {
      const status = this.agents.get(name)!
      if (!status.connected && status.errorCount < this.config.maxRetries) {
        console.log(`Attempting to reconnect agent ${name}...`)
        
        const startTime = Date.now()
        const connected = await this.testAgentConnection(status.agent)
        const responseTime = Date.now() - startTime
        
        if (connected) {
          status.connected = true
          status.lastPing = new Date()
          status.responseTime = responseTime
          status.errorCount = 0
          reconnectedCount++
          
          console.log(`✅ Agent ${name} reconnected successfully`)
        } else {
          status.errorCount++
          console.warn(`❌ Agent ${name} reconnection failed (${status.errorCount}/${this.config.maxRetries})`)
        }
      }
    }
    
    return reconnectedCount
  }

  /**
   * Start periodic health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId)
    }

    this.pingIntervalId = setInterval(async () => {
      await this.performHealthCheck()
    }, this.config.pingInterval)
    
    console.log(`🔄 Started agent health monitoring (${this.config.pingInterval / 1000}s interval)`)
  }

  /**
   * Perform periodic health check on all agents
   */
  private async performHealthCheck(): Promise<void> {
    for (const name of Array.from(this.agents.keys())) {
      const status = this.agents.get(name)!
      if (!status.connected) continue
      
      try {
        const startTime = Date.now()
        const healthy = await this.performAgentHealthCheck(status.agent)
        const responseTime = Date.now() - startTime
        
        if (healthy) {
          status.lastPing = new Date()
          status.responseTime = responseTime
          status.errorCount = 0
        } else {
          status.connected = false
          status.errorCount++
          console.warn(`⚠️ Agent ${name} health check failed`)
        }
      } catch (error) {
        status.connected = false
        status.errorCount++
        console.error(`Agent ${name} health check error:`, error)
      }
    }
  }

  /**
   * Stop health monitoring and cleanup
   */
  destroy(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId)
      this.pingIntervalId = undefined
    }
    
    this.agents.clear()
    console.log('🛑 Agent manager destroyed')
  }

  /**
   * Get summary of agent system status
   */
  getSystemStatus(): {
    totalAgents: number
    connectedAgents: number
    avgResponseTime: number
    ollamaStatus: boolean
  } {
    const connectedAgents = this.getConnectedAgents()
    const avgResponseTime = connectedAgents.length > 0
      ? Array.from(this.agents.values())
          .filter(s => s.connected)
          .reduce((sum, s) => sum + s.responseTime, 0) / connectedAgents.length
      : 0

    return {
      totalAgents: this.agents.size,
      connectedAgents: connectedAgents.length,
      avgResponseTime,
      ollamaStatus: connectedAgents.length > 0 // Assume Ollama is working if any agents are connected
    }
  }
}

// Singleton instance for global use
export const agentManager = new AgentManager({
  maxAgents: 4,
  connectionTimeout: 10000,
  pingInterval: 60000, // 1 minute
  maxRetries: 3
})