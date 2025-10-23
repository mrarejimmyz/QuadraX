// Gamma Aggressor Agent - ASI Alliance Enhanced Aggressive Tactics
// Specialized in immediate win creation, multi-threat setups, and smart offensive pressure

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import { findCriticalBlockingPositions, findAllWinningMoves, checkWin } from '../../utils/quadraX/gameLogic'
import { QuadraXMinimaxEngine } from './minimaxEngine'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class GammaAggressor {
  public readonly name = 'GammaAggressor'
  public readonly type = 'aggressive'
  public readonly personality = 'aggressive' as const
  public readonly focus = 'MINIMAX AGGRESSIVE ANALYSIS & WIN CREATION'
  
  /**
   * Generate aggressive analysis for QuadraX moves using Minimax engine
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`⚡ ${this.name}: Analyzing aggressive position with MINIMAX engine...`)
    
    // Use Minimax engine for aggressive analysis
    const minimaxResult = QuadraXMinimaxEngine.getBestMove(gamePosition, 4, this.personality)
    
    // Get detailed analysis of the chosen move
    const moveAnalysis = QuadraXMinimaxEngine.analyzeMove(gamePosition, minimaxResult.move, this.personality)
    
    // Determine confidence based on minimax score and aggressive analysis
    let confidence = 0.88
    if (minimaxResult.isWinning) confidence = 1.0  // Maximum confidence for winning moves
    else if (minimaxResult.score > 800) confidence = 0.95  // High confidence for strong aggressive positions
    else if (minimaxResult.isBlocking) confidence = 0.90  // Even aggressors must block critical threats
    else if (minimaxResult.score > 300) confidence = 0.92  // Good aggressive position
    else if (minimaxResult.score < -500) confidence = 0.75  // Poor position
    
    // Determine move type based on analysis
    let moveType: 'offensive' | 'defensive' | 'strategic' = 'offensive'
    if (minimaxResult.isWinning) moveType = 'offensive'
    else if (minimaxResult.isBlocking) moveType = 'defensive'
    else moveType = 'offensive'  // Aggressors default to offensive
    
    console.log(`⚡ ${this.name}: MINIMAX selected aggressive move with score ${minimaxResult.score}`)
    
    return {
      move: minimaxResult.move,
      confidence,
      reasoning: `MINIMAX AGGRESSIVE: ${moveAnalysis.reasoning} (Score: ${minimaxResult.score}, Depth: ${minimaxResult.depth})`,
      agent: this.name,
      type: moveType,
      tacticalAnalysis: `Minimax depth ${minimaxResult.depth}: ${minimaxResult.reasoning}`,
      phaseStrategy: gamePosition.phase,
      minimaxScore: minimaxResult.score
    }
  }

  /**
   * Create enhanced aggressive analysis prompt
   */
  private createAggressivePrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves } = gamePosition
    
    const winningOpportunities = this.analyzeEnhancedWinningPaths(board, gamePosition.currentPlayer)
    const aggressiveStrategy = this.calculateKillSequence(board, possibleMoves, phase)
    
    // ENHANCED: Get our winning opportunities and multi-threat potential
    const currentPlayer = gamePosition.currentPlayer
    const ourWinningMoves = findAllWinningMoves(board, currentPlayer, possibleMoves as any, phase)
    
    const winAnalysis = ourWinningMoves.length > 0 ? 
      `IMMEDIATE WINS AVAILABLE: ${ourWinningMoves.map(w => `${typeof w.move === 'number' ? w.move : w.move.from + '→' + w.move.to} (${w.winType})`).join(', ')}` :
      'No immediate wins - focus on aggressive setup'
    
    return `You are Gamma Aggressor with ENHANCED WIN DETECTION. MISSION: DESTROY OPPONENT! Win at ANY cost.

EXACT BOARD STATE:
Current positions: ${board.map((cell, idx) => `${idx}=${cell === 0 ? 'empty' : cell === 1 ? 'X' : 'O'}`).join(' ')}
YOUR pieces (X): positions [${board.map((cell, idx) => cell === 1 ? idx : null).filter(pos => pos !== null).join(', ')}]
Opponent pieces (O): positions [${board.map((cell, idx) => cell === 2 ? idx : null).filter(pos => pos !== null).join(', ')}]
Phase: ${phase} | Available moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

ENHANCED WIN ANALYSIS: ${winAnalysis}
KILLING OPPORTUNITIES: ${winningOpportunities}
ATTACK SEQUENCE: ${aggressiveStrategy}

2×2 squares: [0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]

MOVEMENT RULE: Pieces can teleport to ANY empty position!

ENHANCED WARRIOR'S CODE:
1. IMMEDIATE WIN PRIORITY: If you can win NOW, take it immediately
2. MULTI-THREAT CREATION: Create positions where you threaten 2+ wins simultaneously
3. PRESSURE AMPLIFICATION: Every move should make opponent's life harder
4. CENTER DOMINATION: Control [4,5,6,9,10] to enable multiple attack vectors
5. FORCING MOVES: Make moves that opponent MUST respond to
6. TACTICAL BRUTALITY: When in doubt, attack the strongest possible position

ENHANCED KILL PRIORITIES:
- IMMEDIATE WIN: Execute any available winning move instantly
- DOUBLE THREAT: Create 2+ simultaneous winning threats (unblockable)
- FORK CREATION: Force opponent into impossible defensive choices
- CENTER ASSAULT: Dominate center positions for multiple attack angles
- PATTERN COMPLETION: Advance your closest-to-winning patterns
- MOVEMENT SETUP: Position pieces for devastating movement-phase attacks

AGGRESSIVE DECISION MATRIX:
- If immediate win available: TAKE IT NOW
- If can create double threat: CREATE UNSTOPPABLE MULTI-THREAT
- If can force opponent into bad position: APPLY MAXIMUM PRESSURE
- If can advance multiple patterns: BUILD OVERLAPPING THREATS
- Otherwise: ATTACK THE CENTER AND PREPARE DEVASTATING COMBOS

Your enhanced goal: Create overwhelming pressure that leads to inevitable victory!

{"move": ${phase === 'placement' ? 'position' : '{"from": X, "to": Y}'}, "confidence": 0.9, "reasoning": "enhanced_aggressive_dominance"}`
  }
  
  private analyzeEnhancedWinningPaths(board: number[], currentPlayer: number): string {
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    
    let closeToWin = 0        // We have 3/4 positions
    let strongPositions = 0   // We have 2/4 positions
    let potentialForks = 0    // Positions that could create multiple threats
    
    squares.forEach(square => {
      const ourCount = square.filter(pos => board[pos] === currentPlayer).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      const blockedCount = square.filter(pos => board[pos] !== 0 && board[pos] !== currentPlayer).length
      
      if (blockedCount === 0) { // Not blocked by opponent
        if (ourCount === 3 && emptyCount === 1) {
          closeToWin++
        } else if (ourCount === 2 && emptyCount >= 1) {
          strongPositions++
        } else if (ourCount === 1 && emptyCount === 3) {
          // Check if this could create a fork (multiple threat setup)
          const centerPositions = [4, 5, 6, 9, 10]
          if (square.some(pos => centerPositions.includes(pos))) {
            potentialForks++
          }
        }
      }
    })
    
    return `WIN PATHS: ${closeToWin} immediate, ${strongPositions} strong, ${potentialForks} fork opportunities`
  }

  private calculateKillSequence(board: number[], possibleMoves: any[], phase: string): string {
    if (phase === 'placement') {
      // Find intersection positions that threaten multiple squares
      const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
      const devastatingMoves = possibleMoves.filter(move => {
        return squares.filter(square => square.includes(move)).length >= 3
      })
      
      if (devastatingMoves.length > 0) {
        return `DEVASTATING STRIKES: [${devastatingMoves.join(', ')}] threaten multiple squares!`
      }
    }
    
    return "Execute maximum aggression sequence"
  }

  private findForkPotentials(board: number[]): string {
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    const strongPositions = squares.filter(square => {
      const myCount = square.filter(pos => board[pos] === 1).length
      const opponentCount = square.filter(pos => board[pos] === 2).length
      return myCount >= 2 && opponentCount === 0
    }).length
    return `${strongPositions} favorable squares`
  }

  /**
   * Test ASI Alliance connection
   */
  async checkASIConnection(): Promise<boolean> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_ASI_API_KEY
      if (!apiKey) {
        console.log(`🔑 ${this.name}: No API key found`)
        return false
      }
      
      console.log(`🔍 ${this.name}: Testing ASI connection...`)
      const response = await fetch('https://api.asi1.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'asi1-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      })
      
      const connected = response.ok
      console.log(`${connected ? '✅' : '❌'} ${this.name}: ASI connection ${connected ? 'successful' : 'failed'}`)
      return connected
    } catch (error) {
      console.error(`❌ ${this.name}: Connection test failed:`, error)
      return false
    }
  }
}

export default GammaAggressor