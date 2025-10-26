// ASI Alliance Agents - Unified Export
// Provides easy access to all 4 specialized QuadraX agents + Negotiator

export { AlphaStrategist } from './alphaStrategist'
export { BetaDefender } from './betaDefender'  
export { GammaAggressor } from './gammaAggressor'
export { DeltaAdaptive } from './deltaAdaptive'
export { NegotiatorAgent } from './negotiatorAgent'

export type {
  GamePosition,
  OpponentProfile,
  AgentDecision,
  ASIResponse,
  AgentConfig,
  MovementOption,
  PlacementMove,
  MovementMove,
  QuadraXMove
} from './types'

export type {
  NegotiationContext,
  NegotiationResponse
} from './negotiatorAgent'

// Agent factory for creating agent instances
export class ASIAllianceFactory {
  /**
   * Create all 4 ASI Alliance agents
   */
  static async createAllAgents() {
    const { AlphaStrategist } = await import('./alphaStrategist')
    const { BetaDefender } = await import('./betaDefender')
    const { GammaAggressor } = await import('./gammaAggressor')  
    const { DeltaAdaptive } = await import('./deltaAdaptive')
    
    return {
      alphaStrategist: new AlphaStrategist(),
      betaDefender: new BetaDefender(),
      gammaAggressor: new GammaAggressor(),
      deltaAdaptive: new DeltaAdaptive()
    }
  }
  
  /**
   * Create specific agent by type
   */
  static async createAgent(type: 'strategic' | 'defensive' | 'aggressive' | 'adaptive') {
    switch (type) {
      case 'strategic': {
        const { AlphaStrategist } = await import('./alphaStrategist')
        return new AlphaStrategist()
      }
      case 'defensive': {
        const { BetaDefender } = await import('./betaDefender')
        return new BetaDefender()
      }
      case 'aggressive': {
        const { GammaAggressor } = await import('./gammaAggressor')
        return new GammaAggressor()
      }
      case 'adaptive': {
        const { DeltaAdaptive } = await import('./deltaAdaptive')
        return new DeltaAdaptive()
      }
      default:
        throw new Error(`Unknown agent type: ${type}`)
    }
  }
  
  /**
   * Get agent configuration for all agents
   */
  static getAgentConfigs() {
    return [
      {
        name: 'AlphaStrategist',
        type: 'strategic',
        personality: 'analytical', 
        focus: 'CENTER CONTROL & LONG-TERM POSITIONING',
        description: 'Strategic analyst powered by ASI Alliance for long-term positioning'
      },
      {
        name: 'BetaDefender',
        type: 'defensive',
        personality: 'cautious',
        focus: 'THREAT DETECTION & BLOCKING PATTERNS',
        description: 'Defensive expert using MeTTa knowledge graphs for threat analysis'
      },
      {
        name: 'GammaAggressor', 
        type: 'aggressive',
        personality: 'bold',
        focus: 'IMMEDIATE WIN CREATION & PRESSURE',
        description: 'Aggressive trader with ASI:One Chat Protocol for dynamic strategy'
      },
      {
        name: 'DeltaAdaptive',
        type: 'adaptive', 
        personality: 'flexible',
        focus: 'PATTERN RECOGNITION & COUNTER-STRATEGY',
        description: 'Adaptive player using A2A Protocol for real-time learning'
      }
    ]
  }
}