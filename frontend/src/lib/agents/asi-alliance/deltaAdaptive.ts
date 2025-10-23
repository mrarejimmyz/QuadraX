// Delta Adaptive Agent - ASI Alliance Enhanced Adaptive Intelligence
// Specialized in comprehensive analysis, balanced strategy, and intelligent adaptation

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import { findCriticalBlockingPositions, findAllWinningMoves } from '../../utils/quadraX/gameLogic'
import { QuadraXMinimaxEngine } from './minimaxEngine'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class DeltaAdaptive {
  public readonly name = 'DeltaAdaptive'
  public readonly type = 'adaptive'
  public readonly personality = 'adaptive' as const
  public readonly focus = 'MINIMAX ADAPTIVE ANALYSIS & PATTERN RECOGNITION'
  
  /**
   * Generate adaptive analysis for QuadraX moves using Minimax engine
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`🔄 ${this.name}: Analyzing adaptive position with MINIMAX engine...`)
    
    // Use Minimax engine for adaptive analysis
    const minimaxResult = QuadraXMinimaxEngine.getBestMove(gamePosition, 4, this.personality)
    
    // Get detailed analysis of the chosen move
    const moveAnalysis = QuadraXMinimaxEngine.analyzeMove(gamePosition, minimaxResult.move, this.personality)
    
    // Determine confidence based on minimax score and adaptive analysis
    let confidence = 0.85
    if (minimaxResult.isWinning) confidence = 1.0  // Maximum confidence for winning moves
    else if (minimaxResult.isBlocking) confidence = 0.92  // High confidence for blocking moves
    else if (minimaxResult.score > 600) confidence = 0.94  // High confidence for strong positions
    else if (minimaxResult.score > 200) confidence = 0.90  // Good position
    else if (minimaxResult.score < -400) confidence = 0.78  // Poor position
    
    // Determine move type based on analysis - adaptive agents balance all types
    let moveType: 'offensive' | 'defensive' | 'strategic' = 'strategic'
    if (minimaxResult.isWinning) moveType = 'offensive'
    else if (minimaxResult.isBlocking) moveType = 'defensive'
    else if (minimaxResult.score > 400) moveType = 'offensive'  // Strong offensive position
    else if (minimaxResult.score < -200) moveType = 'defensive'  // Need defensive play
    else moveType = 'strategic'  // Balanced strategic play
    
    console.log(`🔄 ${this.name}: MINIMAX selected adaptive move with score ${minimaxResult.score}`)
    
    return {
      move: minimaxResult.move,
      confidence,
      reasoning: `MINIMAX ADAPTIVE: ${moveAnalysis.reasoning} (Score: ${minimaxResult.score}, Depth: ${minimaxResult.depth})`,
      agent: this.name,
      type: moveType,
      tacticalAnalysis: `Minimax depth ${minimaxResult.depth}: ${minimaxResult.reasoning}`,
      phaseStrategy: gamePosition.phase,
      minimaxScore: minimaxResult.score
    }
  }

  /**
   * Create adaptive analysis prompt
   */
  private createAdaptivePrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves, moveHistory } = gamePosition
    const adaptationAnalysis = this.analyzeAdaptationNeeds(board)
    const dynamicStrategy = this.calculateDynamicStrategy(board, possibleMoves, phase)
    
    return `You are Delta Adaptive. MISSION: ADAPT & EVOLVE to dominate any situation!

CRITICAL BOARD ANALYSIS:
Current board state: ${board.map((cell, idx) => `pos${idx}=${cell === 0 ? 'empty' : cell === 1 ? 'X' : 'O'}`).join(' ')}
X pieces (you): ${board.map((cell, idx) => cell === 1 ? idx : null).filter(pos => pos !== null).join(', ')} 
O pieces (opponent): ${board.map((cell, idx) => cell === 2 ? idx : null).filter(pos => pos !== null).join(', ')}
Phase: ${phase} | Valid moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

ADAPTATION ANALYSIS: ${adaptationAnalysis}
DYNAMIC STRATEGY: ${dynamicStrategy}

Opponent Profile: ${opponentProfile.playStyle} style (${moveHistory?.length || 0} moves made)
Recent patterns: ${moveHistory?.slice(-3).join(' → ') || 'None yet'}

2×2 squares: [0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]

MOVEMENT RULE: Pieces can move to ANY empty position on the board!

ADAPTIVE INTELLIGENCE PROTOCOL:
1. PATTERN RECOGNITION: Identify opponent's playing style and counter it instantly
2. TACTICAL FLEXIBILITY: Switch between offensive/defensive based on real-time board state
3. PREDICTION MATRIX: Calculate multiple future scenarios and pick optimal survival path
4. EVOLUTION MODE: Adapt strategy based on what's working vs what's failing

STRATEGIC COUNTER-ADAPTATION:
- If opponent plays aggressively: COUNTER with defensive positioning and smart traps
- If opponent plays defensively: OVERWHELM with multi-front coordinated attacks  
- If game is even: CREATE CONTROLLED CHAOS and force opponent into uncomfortable positions
- Always look 3 moves ahead and predict opponent's most likely response patterns

ADAPTIVE GOALS:
1. Analyze the 3 most dangerous things opponent can do next
2. Counter their strongest possible sequences while building your own threats
3. Stay unpredictable - change tactics when they start to counter you
4. Force opponent to react to YOUR plans instead of executing theirs

Think like a master chess player: Read their mind, counter their strategy, stay 3 steps ahead!

{"move": ${phase === 'placement' ? 'position' : '{"from": X, "to": Y}'}, "confidence": 0.94, "reasoning": "adaptive_evolution"}`
  }

  private analyzeAdaptationNeeds(board: number[]): string {
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    
    // Count pieces and analyze game state
    const myPieces = board.filter(cell => cell === 1).length
    const opponentPieces = board.filter(cell => cell === 2).length
    
    // Analyze control of squares
    const myControl = squares.filter(square => {
      const myCount = square.filter(pos => board[pos] === 1).length
      const opponentCount = square.filter(pos => board[pos] === 2).length
      return myCount > opponentCount
    }).length
    
    const opponentControl = squares.filter(square => {
      const myCount = square.filter(pos => board[pos] === 1).length
      const opponentCount = square.filter(pos => board[pos] === 2).length
      return opponentCount > myCount
    }).length
    
    if (opponentControl > myControl) {
      return `BEHIND: Opponent controls ${opponentControl} vs our ${myControl} squares. ADAPT: Switch to aggressive disruption!`
    }
    if (myControl > opponentControl) {
      return `AHEAD: We control ${myControl} vs opponent's ${opponentControl} squares. ADAPT: Maintain pressure while defending!`
    }
    return `EVEN: Equal control (${myControl}-${opponentControl}). ADAPT: Create chaos and force mistakes!`
  }

  private calculateDynamicStrategy(board: number[], possibleMoves: any[], phase: string): string {
    const squares = [[0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]]
    
    // Check for immediate threats or opportunities
    const myWinThreats = squares.filter(square => {
      const myCount = square.filter(pos => board[pos] === 1).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      return myCount >= 3 && emptyCount === 1
    }).length
    
    const opponentWinThreats = squares.filter(square => {
      const opponentCount = square.filter(pos => board[pos] === 2).length
      const emptyCount = square.filter(pos => board[pos] === 0).length
      return opponentCount >= 3 && emptyCount === 1
    }).length
    
    if (myWinThreats > 0) {
      return `WINNING MODE: ${myWinThreats} win opportunity(ies)! Execute immediately!`
    }
    if (opponentWinThreats > 0) {
      return `CRISIS MODE: ${opponentWinThreats} opponent win threat(s)! Block then counter-attack!`
    }
    
    // Adaptive strategy based on phase and board state
    if (phase === 'placement') {
      return `BUILD MODE: Focus on center control and multi-square positions for maximum flexibility`
    }
    return `TACTICAL MODE: Use unrestricted movement to create unexpected threats and disrupt opponent plans`
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

export default DeltaAdaptive