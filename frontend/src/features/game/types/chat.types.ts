export interface Message {
  id: number
  sender: 'ai' | 'user' | 'agent'
  text: string
  timestamp: Date
  agentName?: string
  confidence?: number
  reasoning?: string
  proposedStake?: number
}

export interface GamePosition {
  board: number[]
  phase: 'placement' | 'movement'
  piecesPlaced: { player1: number, player2: number }
  currentPlayer: number
}

export interface PYUSDStakeContext {
  playerBalance: number
  opponentBalance: number
  minStake: number
  maxStake: number
  standardStake: number
  gameId?: string
}

export interface ASIStatus {
  connected: boolean
  responseTime: number
  modelVersion: string
  agentsLoaded: number
}

export interface AIChatProps {
  aiName?: string
  enabled?: boolean
  gameId?: string
  gamePosition?: GamePosition
  stakingContext?: PYUSDStakeContext
  onStakeLocked?: (gameId: number, stake: number) => void
  onNegotiationComplete?: (stake: number | null, demoMode: boolean) => void
}

export type ChatMode = 'chat' | 'analysis' | 'negotiation' | 'strategy'