// Alpha Strategist Agent - ASI Alliance Strategic Analysis with Minimax Engine
// Specialized in center control, long-term positioning, and advanced pattern recognition

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import { findCriticalBlockingPositions, checkWin, findAllWinningMoves } from '../../utils/quadraX/gameLogic'
import { QuadraXMinimaxEngine } from './minimaxEngine'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class AlphaStrategist {
  public readonly name = 'AlphaStrategist'
  public readonly type = 'strategic'
  public readonly personality = 'strategic' as const
  public readonly focus = 'MINIMAX STRATEGIC ANALYSIS & CENTER CONTROL'
  
  /**
   * Generate strategic analysis for QuadraX moves using Minimax engine
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`🎯 ${this.name}: Analyzing strategic position with MINIMAX engine...`)
    
    // Use Minimax engine for deep strategic analysis
    const minimaxResult = QuadraXMinimaxEngine.getBestMove(gamePosition, 4, this.personality)
    
    // Get detailed analysis of the chosen move
    const moveAnalysis = QuadraXMinimaxEngine.analyzeMove(gamePosition, minimaxResult.move, this.personality)
    
    // Determine confidence based on minimax score and analysis
    let confidence = 0.85
    if (minimaxResult.isWinning) confidence = 0.99
    else if (minimaxResult.isBlocking) confidence = 0.95
    else if (minimaxResult.score > 500) confidence = 0.92
    else if (minimaxResult.score < -500) confidence = 0.75
    
    // Determine move type based on analysis
    let moveType: 'offensive' | 'defensive' | 'strategic' = 'strategic'
    if (moveAnalysis.isWinning) moveType = 'offensive'
    else if (moveAnalysis.isBlocking) moveType = 'defensive'
    
    console.log(`🎯 ${this.name}: MINIMAX selected move with score ${minimaxResult.score}`)
    
    return {
      move: minimaxResult.move,
      confidence,
      reasoning: `MINIMAX STRATEGIC: ${moveAnalysis.reasoning} (Score: ${minimaxResult.score}, Depth: ${minimaxResult.depth})`,
      agent: this.name,
      type: moveType,
      tacticalAnalysis: `Minimax depth ${minimaxResult.depth}: ${minimaxResult.reasoning}`,
      phaseStrategy: gamePosition.phase,
      minimaxScore: minimaxResult.score
    }
  }

  /**
   * Create strategic analysis prompt
   */
  private createStrategicPrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves } = gamePosition
    
    // Analyze opponent state for better decision making
    const playerPieces = board.filter(cell => cell === 1).length
    const opponentPieces = board.filter(cell => cell === 2).length
    const threatAnalysis = this.analyzeEnhancedThreats(board, gamePosition.currentPlayer)
    const lookaheadAnalysis = this.calculateLookaheadStrategy(board, possibleMoves, phase)
    
    // ENHANCED: Get critical blocking analysis
    const opponent = gamePosition.currentPlayer === 1 ? 2 : 1
    const criticalPositions = phase === 'placement' ? 
      findCriticalBlockingPositions(board, opponent, possibleMoves as number[]) : []
    
    const criticalAnalysis = criticalPositions.length > 0 ? 
      `CRITICAL THREATS: ${criticalPositions.slice(0, 3).map(p => `Pos ${p.position} (Priority: ${p.priority})`).join(', ')}` :
      'No immediate critical threats detected'
    
    return `You are Alpha Strategist with ENHANCED THREAT DETECTION. MISSION: WIN AT ANY COST through strategic lookahead.

PRECISE BOARD STATE:
Positions: ${board.map((cell, idx) => `${idx}=${cell === 0 ? 'empty' : cell === 1 ? 'X' : 'O'}`).join(' ')}
Your X pieces at: [${board.map((cell, idx) => cell === 1 ? idx : null).filter(pos => pos !== null).join(', ')}] (${playerPieces} total)
Opponent O pieces at: [${board.map((cell, idx) => cell === 2 ? idx : null).filter(pos => pos !== null).join(', ')}] (${opponentPieces} total)
Phase: ${phase} | Valid moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

ENHANCED THREAT ANALYSIS: ${threatAnalysis}
CRITICAL POSITION ANALYSIS: ${criticalAnalysis}
3-MOVE LOOKAHEAD: ${lookaheadAnalysis}

WINNING CONDITIONS: Complete any 2×2 square: [0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]

MOVEMENT RULE: Pieces can move to ANY empty position on the board!

ENHANCED STRATEGIC PRIORITIES:
1. CRITICAL THREAT BLOCKING: Block any position with priority >150 immediately
2. ALMOST-COMPLETE PATTERN DETECTION: Prevent opponent from getting 3/4 of any winning pattern
3. MULTI-THREAT PREVENTION: Block positions that would give opponent 2+ simultaneous winning options
4. CENTER CONTROL: Prioritize positions [4,5,6,9,10] - these prevent opponent multi-threat setups  
5. MOVEMENT-PHASE ANTICIPATION: Block positions opponent could reach during movement phase
6. PATTERN COMPLETION BLOCKING: Identify and block all ways opponent could complete winning patterns

CRITICAL DECISION MATRIX:
- If any critical position has priority >150: BLOCK IT IMMEDIATELY
- If opponent has 3/4 of any pattern: BLOCK THE MISSING POSITION
- If opponent can create multi-threats: BLOCK THE KEY INTERSECTION POSITIONS
- Otherwise: Create your own winning threats while maintaining defensive coverage

Your enhanced goal: Use pattern recognition to prevent ALL opponent winning paths while creating unstoppable winning position!

{"move": ${phase === 'placement' ? 'position' : '{"from": X, "to": Y}'}, "confidence": 0.9, "reasoning": "enhanced_strategic_analysis"}`
  }

  private analyzeEnhancedThreats(board: number[], currentPlayer: number): string {
    const opponent = currentPlayer === 1 ? 2 : 1
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    
    // Enhanced threat analysis using new detection system
    let criticalThreats = 0
    let immediateThreats = 0
    let ourOpportunities = 0
    let almostCompletePatterns = 0
    
    squares.forEach(square => {
      const opponentCount = square.filter(pos => board[pos] === opponent).length
      const ourCount = square.filter(pos => board[pos] === currentPlayer).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      
      // Critical: opponent has 3/4 of pattern
      if (opponentCount === 3 && emptyCount === 1) {
        criticalThreats++
      }
      // Immediate: opponent has 2/4 and can complete
      else if (opponentCount === 2 && emptyCount === 2) {
        immediateThreats++
      }
      
      // Our opportunities
      if (ourCount === 3 && emptyCount === 1) {
        ourOpportunities++
      } else if (ourCount === 2 && emptyCount >= 1) {
        almostCompletePatterns++
      }
    })
    
    return `Critical threats: ${criticalThreats}, Immediate threats: ${immediateThreats}, Our opportunities: ${ourOpportunities}, Our setups: ${almostCompletePatterns}`
  }

  private analyzeStrategicThreats(board: number[]): string {
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    
    // Analyze opponent threats
    const opponentThreats = squares.filter(square => {
      const opponentCount = square.filter(pos => board[pos] === 2).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      return opponentCount >= 2 && emptyCount >= 1
    }).length

    // Analyze our opportunities  
    const ourOpportunities = squares.filter(square => {
      const ourCount = square.filter(pos => board[pos] === 1).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      return ourCount >= 2 && emptyCount >= 1
    }).length

    return `Opponent threats: ${opponentThreats}, Our opportunities: ${ourOpportunities}`
  }

  private calculateLookaheadStrategy(board: number[], possibleMoves: any[], phase: string): string {
    // Simple lookahead: check if any move creates multiple winning paths
    if (phase === 'placement') {
      const goodMoves = possibleMoves.filter(move => {
        // Check if this placement creates multiple 2x2 opportunities
        const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
        return squares.filter(square => square.includes(move)).length >= 2
      })
      return goodMoves.length > 0 ? `${goodMoves.length} moves create multiple threats` : "Focus on tactical positioning"
    }
    return "Analyze movement combinations for best outcome"
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

export default AlphaStrategist