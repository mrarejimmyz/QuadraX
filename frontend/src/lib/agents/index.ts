/**
 * QuadraX AI Agent Exports
 * Production-ready game-specific agents for 4x4 TicTacToe with PYUSD staking
 */

export { QuadraXAgent, QuadraXAgentFactory } from './quadraXAgent'

// Export types for TypeScript consumers
export type {
  QuadraXGameRules,
  PlayerProfile, 
  GameResult,
  PYUSDStakeContext,
  GamePosition
} from './quadraXAgent'