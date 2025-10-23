// Beta Defender Agent - ASI Alliance Enhanced Defensive Analysis
// Specialized in advanced threat detection, critical blocking, and pattern prevention

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import { findCriticalBlockingPositions, findAllWinningMoves, checkWin } from '../../utils/quadraX/gameLogic'
import { QuadraXMinimaxEngine } from './minimaxEngine'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class BetaDefender {
  public readonly name = 'BetaDefender'
  public readonly type = 'defensive'
  public readonly personality = 'defensive' as const
  public readonly focus = 'MINIMAX DEFENSIVE ANALYSIS & THREAT BLOCKING'
  
  /**
   * Generate defensive analysis for QuadraX moves using Minimax engine
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`🛡️ ${this.name}: Analyzing defensive position with MINIMAX engine...`)
    
    // Use Minimax engine for defensive analysis
    const minimaxResult = QuadraXMinimaxEngine.getBestMove(gamePosition, 4, this.personality)
    
    // Get detailed analysis of the chosen move
    const moveAnalysis = QuadraXMinimaxEngine.analyzeMove(gamePosition, minimaxResult.move, this.personality)
    
    // Determine confidence based on minimax score and defensive analysis
    let confidence = 0.82
    if (minimaxResult.isBlocking) confidence = 0.98  // High confidence for blocking moves
    else if (minimaxResult.isWinning) confidence = 0.95  // High confidence for winning moves
    else if (minimaxResult.score > 200) confidence = 0.90  // Good defensive position
    else if (minimaxResult.score < -800) confidence = 0.70  // Poor defensive position
    
    // Determine move type based on analysis
    let moveType: 'offensive' | 'defensive' | 'strategic' = 'defensive'
    if (minimaxResult.isWinning) moveType = 'offensive'
    else if (minimaxResult.isBlocking) moveType = 'defensive'
    else moveType = 'strategic'
    
    console.log(`🛡️ ${this.name}: MINIMAX selected defensive move with score ${minimaxResult.score}`)
    
    return {
      move: minimaxResult.move,
      confidence,
      reasoning: `MINIMAX DEFENSIVE: ${moveAnalysis.reasoning} (Score: ${minimaxResult.score}, Depth: ${minimaxResult.depth})`,
      agent: this.name,
      type: moveType,
      tacticalAnalysis: `Minimax depth ${minimaxResult.depth}: ${minimaxResult.reasoning}`,
      phaseStrategy: gamePosition.phase,
      minimaxScore: minimaxResult.score
    }
  }
  
  /**
   * Select the best move to block from multiple opponent threats
   */
  private selectBestBlockFromMultipleThreats(
    opponentWinningMoves: Array<{ move: number | { from: number; to: number }, winType: string, positions: number[] }>,
    gamePosition: GamePosition
  ): { move: number | { from: number; to: number }, winType: string } | null {
    
    // Prioritize 2x2 square threats over line threats
    const squareThreats = opponentWinningMoves.filter(m => m.winType.includes('2x2'))
    const lineThreats = opponentWinningMoves.filter(m => m.winType.includes('4-in-a-line'))
    
    const prioritizedThreats = squareThreats.length > 0 ? squareThreats : lineThreats
    
    if (prioritizedThreats.length > 0) {
      // For placement phase, we can only block specific positions
      if (gamePosition.phase === 'placement') {
        const blockableThreats = prioritizedThreats.filter(threat => {
          const move = threat.move
          if (typeof move === 'number') {
            return (gamePosition.possibleMoves as number[]).includes(move)
          }
          return false
        })
        
        if (blockableThreats.length > 0) {
          return {
            move: blockableThreats[0].move,
            winType: blockableThreats[0].winType
          }
        }
      }
    }
    
    return null
  }

  /**
   * Create enhanced defensive analysis prompt
   */
  private createDefensivePrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves } = gamePosition
    
    const criticalThreats = this.analyzeEnhancedCriticalThreats(board, gamePosition.currentPlayer)
    const defensiveStrategy = this.calculateDefensiveSequence(board, possibleMoves, phase)
    
    // ENHANCED: Get critical blocking analysis for better defensive intelligence
    const opponent = gamePosition.currentPlayer === 1 ? 2 : 1
    const criticalPositions = phase === 'placement' ? 
      findCriticalBlockingPositions(board, opponent, possibleMoves as number[]) : []
    
    const emergencyAnalysis = criticalPositions.length > 0 ? 
      `EMERGENCY BLOCKS NEEDED: ${criticalPositions.slice(0, 5).map(p => `Pos ${p.position} (${p.priority})`).join(', ')}` :
      'No emergency blocks detected'
    
    return `You are Beta Defender with ENHANCED THREAT DETECTION. MISSION: PREDICT & DESTROY opponent's plans!

CRITICAL BOARD ANALYSIS:
Current board state: ${board.map((cell, idx) => `pos${idx}=${cell === 0 ? 'empty' : cell === 1 ? 'X' : 'O'}`).join(' ')}
X pieces (you): ${board.map((cell, idx) => cell === 1 ? idx : null).filter(pos => pos !== null).join(', ')} 
O pieces (opponent): ${board.map((cell, idx) => cell === 2 ? idx : null).filter(pos => pos !== null).join(', ')}
Phase: ${phase} | Valid moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

ENHANCED THREAT ANALYSIS: ${criticalThreats}
EMERGENCY ANALYSIS: ${emergencyAnalysis}
DEFENSIVE STRATEGY: ${defensiveStrategy}

2×2 squares: [0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]

MOVEMENT RULE: Pieces can move to ANY empty position on the board!

ENHANCED PREDICTIVE DEFENSE PROTOCOL:
1. CRITICAL PATTERN BLOCKING: Block any position with priority >140 IMMEDIATELY
2. ALMOST-COMPLETE PREVENTION: Prevent opponent from reaching 3/4 of any winning pattern
3. MULTI-THREAT ANALYSIS: Calculate if opponent can create 2+ simultaneous winning threats
4. MOVEMENT-PHASE ANTICIPATION: Block positions opponent could reach during movement
5. PREEMPTIVE BLOCKING: Block critical positions BEFORE opponent can create unblockable setups  
6. PATTERN COMPLETION DENIAL: Block ALL possible ways opponent could complete patterns

CRITICAL DEFENSIVE PRIORITIES (in order):
1. EMERGENCY BLOCKS: Any position with priority >140 must be blocked immediately
2. CRITICAL PATTERNS: Block positions that complete 3/4 opponent patterns
3. MULTI-THREAT PREVENTION: Block positions that would give opponent 2+ winning options
4. MOVEMENT THREATS: Block positions opponent could move to for wins
5. SETUP PREVENTION: Block opponent pattern setups early

DEFENSIVE DECISION MATRIX:
- If emergency analysis shows priority >140: BLOCK THE HIGHEST PRIORITY POSITION
- If opponent has 3/4 of any pattern: BLOCK THE COMPLETION POSITION IMMEDIATELY  
- If opponent can create multi-threats: BLOCK THE INTERSECTION/KEY POSITIONS
- If movement phase threats detected: BLOCK THE TARGET POSITIONS
- Otherwise: Focus on center control and pattern disruption

Your enhanced goal: Use advanced pattern recognition to eliminate ALL opponent winning possibilities!

{"move": ${phase === 'placement' ? 'position' : '{"from": X, "to": Y}'}, "confidence": 0.95, "reasoning": "enhanced_predictive_defense"}`
  }
  
  private analyzeEnhancedCriticalThreats(board: number[], currentPlayer: number): string {
    const opponent = currentPlayer === 1 ? 2 : 1
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    
    let criticalThreats = 0      // 3/4 complete patterns
    let immediateThreats = 0     // 2/4 patterns that could become 3/4
    let setupThreats = 0         // Patterns opponent is building
    let movementThreats = 0      // Threats opponent could create by moving
    
    // Analyze current board state
    squares.forEach(square => {
      const opponentCount = square.filter(pos => board[pos] === opponent).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      const blockedCount = square.filter(pos => board[pos] === currentPlayer).length
      
      if (blockedCount === 0) { // Pattern not yet blocked by us
        if (opponentCount === 3 && emptyCount === 1) {
          criticalThreats++
        } else if (opponentCount === 2 && emptyCount === 2) {
          immediateThreats++
        } else if (opponentCount === 1 && emptyCount >= 2) {
          setupThreats++
        }
      }
    })
    
    // Check for movement threats (pieces that could move to critical positions)
    const opponentPieces = board.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
    squares.forEach(square => {
      const opponentInPattern = square.filter(pos => board[pos] === opponent).length
      const emptyInPattern = square.filter(pos => board[pos] === 0).length
      
      if (opponentInPattern === 2 && emptyInPattern === 2) {
        // Check if opponent has pieces that could move into this pattern
        const emptyPositions = square.filter(pos => board[pos] === 0)
        for (const emptyPos of emptyPositions) {
          for (const opponentPiece of opponentPieces) {
            if (!square.includes(opponentPiece)) {
              movementThreats++
              break
            }
          }
        }
      }
    })
    
    return `CRITICAL: ${criticalThreats}, IMMEDIATE: ${immediateThreats}, SETUPS: ${setupThreats}, MOVEMENT: ${movementThreats}`
  }

  private calculateDefensiveSequence(board: number[], possibleMoves: any[], phase: string): string {
    // Calculate which defensive moves also create offensive opportunities
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    
    if (phase === 'placement') {
      // Find moves that block opponent AND help us
      const smartDefense = possibleMoves.filter(move => {
        // Check if this position is in multiple squares (good for both offense and defense)
        return squares.filter(square => square.includes(move)).length >= 2
      })
      
      if (smartDefense.length > 0) {
        return `SMART DEFENSE: [${smartDefense.join(', ')}] block opponent while building attacks`
      }
    }
    
    return "Execute defensive positioning with counter-attack preparation"
  }

  private findCriticalThreats(board: number[]): string[] {
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    return squares.filter(square => {
      const opponentCount = square.filter(pos => board[pos] === 2).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      return opponentCount >= 3 && emptyCount === 1
    }).map(square => `Square[${square.join(',')}]`)
  }

  private findNearWinSquares(board: number[]): string {
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    const dangerous = squares.filter(square => {
      const opponentCount = square.filter(pos => board[pos] === 2).length
      return opponentCount >= 2
    }).length
    return `${dangerous} squares with 2+ opponent pieces`
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

export default BetaDefender