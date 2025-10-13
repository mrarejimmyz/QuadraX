/**
 * Hedera Agent Kit V2 - Legacy Compatibility Module
 * Provides backward compatibility for older integrations
 */

import { QuadraXAgent, QuadraXAgentFactory, PlayerProfile, GamePosition, PYUSDStakeContext } from './quadraXAgent'
import { useEnhancedHederaAgents } from './enhancedHederaAgentKit'

// Legacy agent interface for backward compatibility
export interface HederaAgentV2 {
  id: string
  name: string
  personality: {
    primary: string
    secondary: string
    riskTolerance: number
  }
  bankroll: number
  performance: {
    wins: number
    losses: number
    totalStaked: number
    profitLoss: number
  }
  hederaAccount: string
  status: 'active' | 'inactive' | 'negotiating'
}

// Legacy negotiation interface
export interface NegotiationSession {
  id: string
  participants: string[]
  targetStake: number
  currentOffers: Record<string, number>
  messages: Array<{
    from: string
    message: string
    timestamp: Date
    offer?: number
  }>
  status: 'active' | 'completed' | 'failed'
  finalStake?: number
}

// Legacy game state interface
export interface GameStateV2 {
  phase: 'setup' | 'negotiation' | 'staking' | 'playing' | 'finished'
  players: string[]
  stakes: Record<string, number>
  gameData: {
    board: number[]
    currentPlayer: number
    winner?: string
  }
  negotiation?: NegotiationSession
}

// Hook for legacy compatibility
export function useGameWithIntelligentStaking() {
  const {
    agents: modernAgents,
    gameState: modernGameState,
    messages,
    analyzePosition,
    calculateStake,
    startNewGame
  } = useEnhancedHederaAgents()

  // Convert modern agents to legacy format
  const agents: HederaAgentV2[] = modernAgents.map((agent, index) => ({
    id: `agent-${index}`,
    name: agent.name,
    personality: {
      primary: agent.personality.riskProfile,
      secondary: agent.personality.negotiationStyle,
      riskTolerance: agent.personality.riskProfile === 'aggressive' ? 0.8 : 
                      agent.personality.riskProfile === 'analytical' ? 0.5 : 0.3
    },
    bankroll: 1000, // Mock bankroll
    performance: {
      wins: Math.floor(Math.random() * 20),
      losses: Math.floor(Math.random() * 10),
      totalStaked: Math.floor(Math.random() * 500),
      profitLoss: Math.floor(Math.random() * 200 - 100)
    },
    hederaAccount: agent.hederaAccountId,
    status: 'active'
  }))

  // Mock Hedera agents (legacy format)
  const hederaAgents = agents.map(agent => ({
    ...agent,
    wallet: { address: agent.hederaAccount, balance: agent.bankroll },
    aiCapabilities: {
      strategicAnalysis: true,
      riskCalculation: true,
      negotiation: true
    }
  }))

  // Convert modern game state to legacy format
  const gameState: GameStateV2 = {
    phase: modernGameState.gamePhase === 'waiting' ? 'setup' :
           modernGameState.gamePhase === 'playing' ? 'playing' : 'finished',
    players: ['player1', 'player2'],
    stakes: {
      player1: modernGameState.stakes.player1Stake,
      player2: modernGameState.stakes.player2Stake
    },
    gameData: {
      board: modernGameState.board,
      currentPlayer: modernGameState.currentPlayer,
      winner: modernGameState.winner ? `player${modernGameState.winner}` : undefined
    }
  }

  // Mock negotiation log
  const negotiationLog: Array<{
    timestamp: Date
    phase: string
    details: string
    participants: string[]
  }> = messages.slice(0, 5).map(msg => ({
    timestamp: msg.timestamp,
    phase: 'negotiation',
    details: msg.content.substring(0, 100),
    participants: [msg.from || 'System']
  }))

  // Legacy functions
  const startCompleteNegotiation = async () => {
    console.log('Starting legacy negotiation...')
    if (agents.length >= 2) {
      await analyzePosition(0)
      await calculateStake(0.65, 0)
    }
  }

  const executeStaking = async () => {
    console.log('Executing legacy staking...')
    return Promise.resolve(true)
  }

  const makeMove = (position: number) => {
    console.log(`Legacy move at position ${position}`)
    // This would integrate with the modern game system
  }

  const resetGame = () => {
    startNewGame()
  }

  return {
    gameState,
    negotiationLog,
    negotiationInProgress: false,
    agents,
    hederaAgents,
    startCompleteNegotiation,
    executeStaking,
    makeMove,
    resetGame,
    messages: messages.map(msg => ({
      id: msg.id,
      text: msg.content,
      timestamp: msg.timestamp,
      sender: msg.from || 'system'
    }))
  }
}

// Export modern agent system with legacy wrapper
export { QuadraXAgent as HederaAgent, QuadraXAgentFactory }
export type { PlayerProfile, GamePosition, PYUSDStakeContext }

// Legacy exports for compatibility
export const createLegacyAgent = (name: string, type: 'aggressive' | 'defensive' | 'analytical') => {
  const privateKey = `legacy-key-${Date.now()}`
  const account = `0.0.${Math.floor(Math.random() * 9999)}`
  
  switch (type) {
    case 'aggressive':
      return QuadraXAgentFactory.createAggressiveTrader(name, account, privateKey)
    case 'defensive':
      return QuadraXAgentFactory.createDefensiveExpert(name, account, privateKey)
    default:
      return QuadraXAgentFactory.createStrategicAnalyst(name, account, privateKey)
  }
}