// Unified Minimax Engine for ASI Alliance Agents
// Implements sophisticated threat detection and winning analysis for all agents

import type { GamePosition, AgentDecision } from './types'

// Import all winning patterns from the master strategy
const ALL_2x2_SQUARES = [
  [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
  [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
  [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
]

const ALL_4_LINES = [
  // Horizontal
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  // Vertical
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  // Diagonal
  [0, 5, 10, 15], [3, 6, 9, 12]
]

export interface MinimaxResult {
  move: number | { from: number; to: number }
  score: number
  depth: number
  isWinning: boolean
  isBlocking: boolean
  threatLevel: number
  reasoning: string
}

export interface EvaluationMetrics {
  immediateWins: number
  blockedThreats: number
  newThreats: number
  positionValue: number
  centerControl: number
  patternDisruption: number
}

export class QuadraXMinimaxEngine {
  private static readonly MAX_DEPTH = 4 // Adjustable based on performance needs
  private static readonly WIN_SCORE = 10000
  private static readonly BLOCK_SCORE = 5000
  private static readonly THREAT_SCORE = 2500

  /**
   * Main minimax entry point for all agents
   */
  static getBestMove(
    position: GamePosition,
    depth: number = this.MAX_DEPTH,
    agentPersonality: 'aggressive' | 'defensive' | 'strategic' | 'adaptive' = 'strategic'
  ): MinimaxResult {
    console.log(`🧠 MINIMAX ENGINE: Analyzing position with depth ${depth} (${agentPersonality} style)`)
    
    const result = this.minimax(position, depth, -Infinity, Infinity, true, agentPersonality)
    
    console.log(`🎯 MINIMAX RESULT: Score ${result.score}, Move ${JSON.stringify(result.move)}`)
    console.log(`🔍 MINIMAX ANALYSIS: ${result.reasoning}`)
    
    return result
  }

  /**
   * Core minimax algorithm with alpha-beta pruning
   */
  private static minimax(
    position: GamePosition,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    personality: 'aggressive' | 'defensive' | 'strategic' | 'adaptive'
  ): MinimaxResult {
    
    // Terminal conditions
    const winner = this.checkWinner(position.board)
    if (winner === position.currentPlayer) {
      return {
        move: -1,
        score: this.WIN_SCORE + depth,
        depth,
        isWinning: true,
        isBlocking: false,
        threatLevel: 0,
        reasoning: "WINNING POSITION"
      }
    }
    if (winner === (position.currentPlayer === 1 ? 2 : 1)) {
      return {
        move: -1,
        score: -this.WIN_SCORE - depth,
        depth,
        isWinning: false,
        isBlocking: false,
        threatLevel: 10,
        reasoning: "LOSING POSITION"
      }
    }
    if (depth === 0) {
      const evaluation = this.evaluatePosition(position, personality)
      return {
        move: -1,
        score: evaluation.positionValue,
        depth,
        isWinning: false,
        isBlocking: false,
        threatLevel: evaluation.newThreats,
        reasoning: `EVAL: Win(${evaluation.immediateWins}) Block(${evaluation.blockedThreats}) Pos(${evaluation.positionValue})`
      }
    }

    const moves = this.generateMoves(position)
    if (moves.length === 0) {
      return {
        move: -1,
        score: 0,
        depth,
        isWinning: false,
        isBlocking: false,
        threatLevel: 0,
        reasoning: "NO MOVES AVAILABLE"
      }
    }

    // Sort moves by initial evaluation for better pruning
    const sortedMoves = this.orderMoves(position, moves, personality)
    
    let bestResult: MinimaxResult = {
      move: sortedMoves[0],
      score: isMaximizing ? -Infinity : Infinity,
      depth,
      isWinning: false,
      isBlocking: false,
      threatLevel: 0,
      reasoning: "INITIAL"
    }

    for (const move of sortedMoves) {
      const newPosition = this.makeMove(position, move)
      const result = this.minimax(newPosition, depth - 1, alpha, beta, !isMaximizing, personality)
      
      if (isMaximizing) {
        if (result.score > bestResult.score) {
          bestResult = {
            ...result,
            move,
            reasoning: `MINIMAX-MAX: ${result.reasoning}`
          }
        }
        alpha = Math.max(alpha, result.score)
      } else {
        if (result.score < bestResult.score) {
          bestResult = {
            ...result,
            move,
            reasoning: `MINIMAX-MIN: ${result.reasoning}`
          }
        }
        beta = Math.min(beta, result.score)
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        console.log(`✂️ MINIMAX: Pruning at depth ${depth}`)
        break
      }
    }

    return bestResult
  }

  /**
   * Comprehensive position evaluation
   */
  private static evaluatePosition(
    position: GamePosition,
    personality: 'aggressive' | 'defensive' | 'strategic' | 'adaptive'
  ): EvaluationMetrics {
    const player = position.currentPlayer
    const opponent = player === 1 ? 2 : 1
    
    const metrics: EvaluationMetrics = {
      immediateWins: 0,
      blockedThreats: 0,
      newThreats: 0,
      positionValue: 0,
      centerControl: 0,
      patternDisruption: 0
    }

    // Count immediate winning opportunities
    metrics.immediateWins = this.countImmediateWins(position.board, player)
    
    // Count threats that need blocking
    const opponentThreats = this.countImmediateWins(position.board, opponent)
    metrics.blockedThreats = opponentThreats
    
    // Evaluate positional advantages
    metrics.centerControl = this.evaluateCenterControl(position.board, player)
    metrics.patternDisruption = this.evaluatePatternDisruption(position.board, player, opponent)
    
    // Calculate overall position value based on personality
    metrics.positionValue = this.calculatePersonalityScore(metrics, personality)
    
    return metrics
  }

  /**
   * Count immediate winning moves available
   */
  private static countImmediateWins(board: number[], player: number): number {
    let wins = 0
    
    // Check 2x2 squares
    for (const square of ALL_2x2_SQUARES) {
      const playerPieces = square.filter(pos => board[pos] === player).length
      const emptySpaces = square.filter(pos => board[pos] === 0).length
      
      if (playerPieces === 3 && emptySpaces === 1) wins++
    }
    
    // Check 4-in-a-line
    for (const line of ALL_4_LINES) {
      const playerPieces = line.filter(pos => board[pos] === player).length
      const emptySpaces = line.filter(pos => board[pos] === 0).length
      
      if (playerPieces === 3 && emptySpaces === 1) wins++
    }
    
    return wins
  }

  /**
   * Evaluate center control (positions 5,6,9,10 are most valuable)
   */
  private static evaluateCenterControl(board: number[], player: number): number {
    const centerPositions = [5, 6, 9, 10]
    const playerCenter = centerPositions.filter(pos => board[pos] === player).length
    const opponentCenter = centerPositions.filter(pos => board[pos] === (player === 1 ? 2 : 1)).length
    
    return (playerCenter - opponentCenter) * 50
  }

  /**
   * Evaluate how well positioned player is to disrupt opponent patterns
   */
  private static evaluatePatternDisruption(board: number[], player: number, opponent: number): number {
    let disruption = 0
    
    // Check how many opponent patterns we're disrupting
    for (const square of ALL_2x2_SQUARES) {
      const opponentPieces = square.filter(pos => board[pos] === opponent).length
      const playerPieces = square.filter(pos => board[pos] === player).length
      
      if (opponentPieces >= 2 && playerPieces >= 1) {
        disruption += opponentPieces * 25
      }
    }
    
    return disruption
  }

  /**
   * Calculate final score based on agent personality
   */
  private static calculatePersonalityScore(
    metrics: EvaluationMetrics,
    personality: 'aggressive' | 'defensive' | 'strategic' | 'adaptive'
  ): number {
    switch (personality) {
      case 'aggressive':
        return (
          metrics.immediateWins * 1000 +
          metrics.centerControl * 2 +
          metrics.patternDisruption * 1.5 -
          metrics.blockedThreats * 500
        )
      
      case 'defensive':
        return (
          metrics.immediateWins * 800 +
          metrics.centerControl * 1.2 +
          metrics.patternDisruption * 2 -
          metrics.blockedThreats * 1200
        )
      
      case 'strategic':
        return (
          metrics.immediateWins * 900 +
          metrics.centerControl * 1.5 +
          metrics.patternDisruption * 1.8 -
          metrics.blockedThreats * 800
        )
      
      case 'adaptive':
        // Adaptive personality adjusts weights based on game state
        const threatWeight = metrics.blockedThreats > 2 ? 1000 : 600
        return (
          metrics.immediateWins * 850 +
          metrics.centerControl * 1.3 +
          metrics.patternDisruption * 1.6 -
          metrics.blockedThreats * threatWeight
        )
      
      default:
        return metrics.immediateWins * 900 - metrics.blockedThreats * 800
    }
  }

  /**
   * Generate all legal moves for current position
   */
  private static generateMoves(position: GamePosition): (number | { from: number; to: number })[] {
    if (position.phase === 'placement') {
      return position.possibleMoves as number[]
    } else {
      // Movement phase - generate from-to moves
      const moves: { from: number; to: number }[] = []
      const playerPieces = position.board
        .map((cell, index) => cell === position.currentPlayer ? index : -1)
        .filter(pos => pos !== -1)
      
      const emptyPositions = position.board
        .map((cell, index) => cell === 0 ? index : -1)
        .filter(pos => pos !== -1)
      
      for (const piece of playerPieces) {
        for (const target of emptyPositions) {
          moves.push({ from: piece, to: target })
        }
      }
      
      return moves
    }
  }

  /**
   * Order moves for better alpha-beta pruning
   */
  private static orderMoves(
    position: GamePosition,
    moves: (number | { from: number; to: number })[],
    personality: 'aggressive' | 'defensive' | 'strategic' | 'adaptive'
  ): (number | { from: number; to: number })[] {
    
    const moveScores = moves.map(move => {
      const testPosition = this.makeMove(position, move)
      const quickEval = this.evaluatePosition(testPosition, personality)
      return { move, score: quickEval.positionValue }
    })

    return moveScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.move)
  }

  /**
   * Create new position after making a move
   */
  private static makeMove(
    position: GamePosition,
    move: number | { from: number; to: number }
  ): GamePosition {
    const newBoard = [...position.board]
    
    if (position.phase === 'placement') {
      newBoard[move as number] = position.currentPlayer
    } else {
      const movement = move as { from: number; to: number }
      newBoard[movement.from] = 0
      newBoard[movement.to] = position.currentPlayer
    }
    
    return {
      ...position,
      board: newBoard,
      currentPlayer: position.currentPlayer === 1 ? 2 : 1
    }
  }

  /**
   * Check if there's a winner
   */
  private static checkWinner(board: number[]): number | null {
    // Check 2x2 squares
    for (const square of ALL_2x2_SQUARES) {
      const player1Count = square.filter(pos => board[pos] === 1).length
      const player2Count = square.filter(pos => board[pos] === 2).length
      
      if (player1Count === 4) return 1
      if (player2Count === 4) return 2
    }
    
    // Check 4-in-a-line
    for (const line of ALL_4_LINES) {
      const player1Count = line.filter(pos => board[pos] === 1).length
      const player2Count = line.filter(pos => board[pos] === 2).length
      
      if (player1Count === 4) return 1
      if (player2Count === 4) return 2
    }
    
    return null
  }

  /**
   * Get detailed move analysis for agent reasoning
   */
  static analyzeMove(
    position: GamePosition,
    move: number | { from: number; to: number },
    personality: 'aggressive' | 'defensive' | 'strategic' | 'adaptive'
  ): {
    isWinning: boolean
    isBlocking: boolean
    threatLevel: number
    strategicValue: number
    reasoning: string
  } {
    const newPosition = this.makeMove(position, move)
    const evaluation = this.evaluatePosition(newPosition, personality)
    
    const isWinning = this.checkWinner(newPosition.board) === position.currentPlayer
    const opponentThreats = this.countImmediateWins(position.board, position.currentPlayer === 1 ? 2 : 1)
    const newOpponentThreats = this.countImmediateWins(newPosition.board, position.currentPlayer === 1 ? 2 : 1)
    const isBlocking = newOpponentThreats < opponentThreats
    
    const reasoning = []
    if (isWinning) reasoning.push("WINNING MOVE")
    if (isBlocking) reasoning.push(`BLOCKS ${opponentThreats - newOpponentThreats} THREATS`)
    if (evaluation.centerControl > 0) reasoning.push(`CENTER CONTROL +${evaluation.centerControl}`)
    if (evaluation.patternDisruption > 0) reasoning.push(`DISRUPTS PATTERNS +${evaluation.patternDisruption}`)
    
    return {
      isWinning,
      isBlocking,
      threatLevel: evaluation.newThreats,
      strategicValue: evaluation.positionValue,
      reasoning: reasoning.join(", ") || "NEUTRAL MOVE"
    }
  }
}