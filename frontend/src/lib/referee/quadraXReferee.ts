// QuadraX Referee System
// Validates agent decisions and enforces game rules

import { checkWin, findWinningMove } from '../utils/quadraX/gameLogic'
import { scoreMove } from '../utils/quadraX/moveScoring'
import { callASIAlliance, parseASIResponse } from '../services/asiService'
import type { GamePosition, AgentDecision } from '../agents/asi-alliance/types'

/**
 * Validate agent decisions against QuadraX rules
 */
export function validateMove(
  move: number | { from: number; to: number },
  availableMoves: (number | { from: number; to: number })[],
  phase: 'placement' | 'movement'
): boolean {
  if (phase === 'placement') {
    const placementMove = move as number
    const placementMoves = availableMoves as number[]
    return placementMoves.includes(placementMove)
  } else {
    const movementMove = move as { from: number; to: number }
    const movementMoves = availableMoves as { from: number; to: number }[]
    return movementMoves.some(m => 
      m.from === movementMove.from && m.to === movementMove.to
    )
  }
}

/**
 * Referee agent that validates and provides winning moves
 */
export class QuadraXReferee {
  public readonly name = 'QuadraXReferee'
  public readonly type = 'referee'
  
  /**
   * Find guaranteed winning moves using rule-based analysis
   */
  async findWinningMove(
    board: number[],
    player: number,
    availableMoves: (number | { from: number; to: number })[],
    phase: 'placement' | 'movement'
  ): Promise<{ move: number | { from: number; to: number }; reasoning: string } | null> {
    
    console.log('🏁 REFEREE: Checking for guaranteed winning moves...')
    
    const winningMove = findWinningMove(board, player, availableMoves as any, phase)
    
    if (winningMove !== null) {
      const reasoning = phase === 'placement' 
        ? `REFEREE WIN: Placement at position ${winningMove} completes winning pattern`
        : `REFEREE WIN: Movement ${(winningMove as any).from}→${(winningMove as any).to} creates winning position`
        
      console.log(`🏆 ${reasoning}`)
      return { move: winningMove, reasoning }
    }
    
    return null
  }
  
  /**
   * Find critical blocking moves
   */
  async findBlockingMove(
    board: number[],
    player: number,
    availableMoves: (number | { from: number; to: number })[],
    phase: 'placement' | 'movement'
  ): Promise<{ move: number | { from: number; to: number }; reasoning: string } | null> {
    
    console.log('🚨 REFEREE: Checking for critical opponent threats...')
    
    const opponent = player === 1 ? 2 : 1
    const opponentWinningMove = findWinningMove(board, opponent, availableMoves as any, phase)
    
    if (opponentWinningMove !== null) {
      // Find move that blocks this threat
      if (phase === 'placement' && typeof opponentWinningMove === 'number') {
        const placementMoves = availableMoves as number[]
        if (placementMoves.includes(opponentWinningMove)) {
          const reasoning = `REFEREE BLOCK: Preventing opponent win at position ${opponentWinningMove}`
          console.log(`🛡️ ${reasoning}`)
          return { move: opponentWinningMove, reasoning }
        }
      } else if (phase === 'movement' && typeof opponentWinningMove === 'object') {
        const movementMoves = availableMoves as { from: number; to: number }[]
        // Find any move that can block the opponent's winning position
        for (const move of movementMoves) {
          const testBoard = [...board]
          testBoard[move.from] = 0
          testBoard[move.to] = player
          
          // Check if this blocks the opponent win
          const opponentStillWins = findWinningMove(testBoard, opponent, [], 'placement')
          if (!opponentStillWins) {
            const reasoning = `REFEREE BLOCK: Movement ${move.from}→${move.to} prevents opponent victory`
            console.log(`🛡️ ${reasoning}`)
            return { move, reasoning }
          }
        }
      }
    }
    
    return null
  }
  
  /**
   * Validate agent decision using ASI Alliance intelligence
   */
  async validateAgentDecision(
    decision: AgentDecision,
    gamePosition: GamePosition
  ): Promise<{ valid: boolean; confidence: number; reasoning: string }> {
    
    console.log(`🏁 REFEREE: Validating ${decision.agent} decision...`)
    
    // First check rule compliance
    const isValidMove = validateMove(
      decision.move, 
      gamePosition.possibleMoves, 
      gamePosition.phase
    )
    
    if (!isValidMove) {
      return {
        valid: false,
        confidence: 0,
        reasoning: `REFEREE VIOLATION: ${decision.agent} proposed invalid move`
      }
    }
    
    // Score the decision quality
    const moveScore = scoreMove(
      gamePosition.board,
      decision.move,
      gamePosition.currentPlayer,
      gamePosition.phase
    )
    
    // Use ASI to validate strategic quality
    try {
      const prompt = this.createValidationPrompt(decision, gamePosition, moveScore)
      const asiResponse = await callASIAlliance(prompt)
      const parsed = parseASIResponse(asiResponse, gamePosition)
      
      const confidence = Math.min(0.95, Math.max(0.1, parsed.confidence || 0.7))
      
      return {
        valid: true,
        confidence,
        reasoning: `REFEREE APPROVED: ${decision.agent} decision validated (score: ${moveScore})`
      }
    } catch (error) {
      console.error('🏁 REFEREE: ASI validation failed - Pure ASI system only')
      throw new Error(`ASI Alliance required for referee validation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Create ASI prompt for decision validation
   */
  private createValidationPrompt(
    decision: AgentDecision, 
    gamePosition: GamePosition,
    moveScore: number
  ): string {
    const { board, phase, possibleMoves } = gamePosition
    
    return `🏁 QUADRAX REFEREE - Decision Validation

**REFEREE MISSION**: Validate agent decision quality and strategic merit

**AGENT DECISION**: ${decision.agent} recommends ${typeof decision.move === 'object' ? `${decision.move.from}→${decision.move.to}` : decision.move}
**AGENT REASONING**: ${decision.reasoning}
**RULE SCORE**: ${moveScore}

**BOARD STATE**: [${board.join(',')}]
**PHASE**: ${phase}
**ALL OPTIONS**: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

**REFEREE EVALUATION REQUIRED**:
- Is this decision strategically sound?
- Does it align with QuadraX winning principles?
- Are there obviously better alternatives?
- What is the confidence level in this decision?

**REFEREE JUDGMENT**:
Valid: [YES/NO]
Confidence: [0.0-1.0]
Assessment: [BRIEF STRATEGIC EVALUATION]

Provide your official referee validation!`
  }
}

/**
 * Get best move using multi-agent consensus with referee oversight
 */
export async function getRefereeValidatedMove(
  agentDecisions: AgentDecision[],
  gamePosition: GamePosition
): Promise<AgentDecision> {
  const referee = new QuadraXReferee()
  
  // Check for winning moves first
  const winningMove = await referee.findWinningMove(
    gamePosition.board,
    gamePosition.currentPlayer,
    gamePosition.possibleMoves,
    gamePosition.phase
  )
  
  if (winningMove) {
    return {
      move: winningMove.move,
      confidence: 1.0,
      reasoning: winningMove.reasoning,
      agent: 'QuadraXReferee',
      type: 'referee'
    }
  }
  
  // Check for critical blocks
  const blockingMove = await referee.findBlockingMove(
    gamePosition.board,
    gamePosition.currentPlayer,
    gamePosition.possibleMoves,
    gamePosition.phase
  )
  
  if (blockingMove) {
    return {
      move: blockingMove.move,
      confidence: 0.95,
      reasoning: blockingMove.reasoning,
      agent: 'QuadraXReferee',
      type: 'referee'
    }
  }
  
  // Validate agent decisions
  let bestDecision = agentDecisions[0]
  let highestConfidence = 0
  
  for (const decision of agentDecisions) {
    const validation = await referee.validateAgentDecision(decision, gamePosition)
    
    if (validation.valid && validation.confidence > highestConfidence) {
      highestConfidence = validation.confidence
      bestDecision = {
        ...decision,
        confidence: validation.confidence,
        reasoning: `${validation.reasoning}: ${decision.reasoning}`
      }
    }
  }
  
  return bestDecision
}

export default { QuadraXReferee, validateMove, getRefereeValidatedMove }