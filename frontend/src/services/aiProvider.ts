// AI Provider Service - ASI Alliance Integration
// Provides unified interface for AI interactions in QuadraX with complete Chat Protocol support

import { ASIService } from './asiService'

export type AIProvider = 'asi'

export interface AIResponse {
  response: string
  model: string
  created_at: string
  done: boolean
  reasoning?: any
  provider: AIProvider
  sessionId?: string
}

export interface AIConfig {
  provider: AIProvider
  apiKey?: string
  agentverse?: {
    apiToken?: string
    mcpEnabled?: boolean
  }
  metta?: {
    enabled?: boolean
  }
}

export class AIProviderService {
  private config: AIConfig
  private asiService: ASIService
  private isInitialized: boolean = false

  constructor(config: AIConfig = { provider: 'asi' }) {
    this.config = config
    
    // Initialize ASI service with complete configuration
    this.asiService = new ASIService({
      apiKey: config.apiKey || process.env.NEXT_PUBLIC_ASI_API_KEY || process.env.ASI_API_KEY || '',
      agentverse: {
        apiToken: config.agentverse?.apiToken || process.env.NEXT_PUBLIC_AGENTVERSE_TOKEN,
        mcpEnabled: config.agentverse?.mcpEnabled ?? true,
      },
      metta: {
        enabled: config.metta?.enabled ?? true,
      },
      uagent: {
        name: 'quadrax-game-agent',
        port: 8005,
        endpoint: ['http://localhost:8005/submit'],
        mailbox: true,
      }
    })
  }

  /**
   * Initialize ASI Alliance service with Chat Protocol
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true
    
    try {
      await this.asiService.initialize()
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('ASI Alliance initialization failed:', error)
      return false
    }
  }

  /**
   * Check if ASI Alliance service is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }
      return this.isInitialized
    } catch (error) {
      console.error('ASI Alliance connection check failed:', error)
      return false
    }
  }

  /**
   * Generate AI response using ASI Alliance with Chat Protocol
   */
  async generateResponse(prompt: string, context?: string, sessionId?: string): Promise<AIResponse | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const response = await this.asiService.generateResponse(prompt, context, sessionId)
      
      return {
        response,
        model: 'asi1-mini',
        created_at: new Date().toISOString(),
        done: true,
        provider: 'asi',
        sessionId
      }
    } catch (error) {
      console.error('ASI Alliance generation failed:', error)
      return null
    }
  }

  /**
   * Stream response using ASI Alliance Chat Protocol
   */
  async streamResponse(
    prompt: string,
    context?: string,
    onToken?: (token: string) => void
  ): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }
      
      await this.asiService.streamResponse(prompt, context || '', onToken)
    } catch (error) {
      console.error('ASI Alliance streaming failed:', error)
      throw error
    }
  }

  /**
   * Get ASI Alliance capabilities
   */
  getCapabilities(): string[] {
    return [
      'web3_native',
      'agent_discovery', 
      'metta_reasoning',
      'multi_agent_coordination',
      'blockchain_integration',
      'chat_protocol',
      'agentverse_integration',
      'uagent_support',
      'gaming_optimized'
    ]
  }

  /**
   * Query structured reasoning with MeTTa integration
   */
  async queryReasoning(query: string, gameState?: any): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }
      
      // Use ASI service's MeTTa reasoning capabilities
      const contextualQuery = gameState 
        ? `Game State: ${JSON.stringify(gameState)}\nQuery: ${query}`
        : query
        
      const response = await this.asiService.generateResponse(contextualQuery)
      
      return {
        query,
        response,
        gameState,
        provider: 'asi',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('MeTTa reasoning query failed:', error)
      return null
    }
  }

  /**
   * Register agent on Agentverse
   */
  async registerAgent(agentConfig: {
    name: string
    description: string
    capabilities: string[]
  }): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }
      
      // The ASI service handles agent registration internally
      console.log('Agent registration handled by ASI service initialization')
      return `${agentConfig.name}-registered`
    } catch (error) {
      console.error('Agent registration failed:', error)
      return null
    }
  }

  /**
   * Get current ASI service instance for advanced operations
   */
  getASIService(): ASIService {
    return this.asiService
  }

  /**
   * Create new chat session
   */
  async createChatSession(sessionId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }
      // Sessions are handled internally by ASI service
      return true
    } catch (error) {
      console.error('Failed to create chat session:', error)
      return false
    }
  }

  /**
   * End chat session
   */
  async endChatSession(sessionId: string): Promise<boolean> {
    try {
      // Sessions are handled internally by ASI service
      return true
    } catch (error) {
      console.error('Failed to end chat session:', error)
      return false
    }
  }
}

// Create AI provider service with ASI Alliance
function createAIProvider(): AIProviderService {
  return new AIProviderService({
    provider: 'asi',
    apiKey: process.env.NEXT_PUBLIC_ASI_API_KEY,
    agentverse: {
      apiToken: process.env.NEXT_PUBLIC_AGENTVERSE_TOKEN,
      mcpEnabled: true
    },
    metta: {
      enabled: true
    }
  })
}

export const aiProvider = createAIProvider()

export default aiProvider