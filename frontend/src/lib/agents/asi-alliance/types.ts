// ASI Alliance Agent Types
// Shared types for all QuadraX agents

export interface GamePosition {
  board: number[]
  phase: 'placement' | 'movement'
  player1Pieces: number
  player2Pieces: number
  possibleMoves: (number | { from: number; to: number })[]
  moveHistory: any[]
  currentPlayer: 1 | 2
}

export interface OpponentProfile {
  playStyle: 'aggressive' | 'defensive' | 'strategic' | 'adaptive'
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  preferredPositions: number[]
  gameHistory: any[]
  winRate: number
}

export interface AgentDecision {
  move: number | { from: number; to: number }
  confidence: number
  reasoning: string
  agent: string
  type: string
  tacticalAnalysis?: string
  phaseStrategy?: string
}

export interface ASIResponse {
  move: number | { from: number; to: number }
  confidence: number
  reasoning: string
  tacticalAnalysis: string
  phaseStrategy: string
}

export interface AgentConfig {
  name: string
  type: string
  personality: string
  focus: string
  description: string
}

export interface MovementOption {
  from: number
  to: number
}

export type PlacementMove = number
export type MovementMove = MovementOption
export type QuadraXMove = PlacementMove | MovementMove

// Pure ASI Alliance system - no fallbacks or backup systems needed