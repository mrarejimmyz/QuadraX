// Beta Defender Agent - ASI Alliance Defensive Analysis with Ollama Fallback
// Specialized in threat detection, blocking patterns, and defensive strategy

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class BetaDefender {
  public readonly name = 'BetaDefender'
  public readonly type = 'defensive'
  public readonly personality = 'cautious'
  public readonly focus = 'THREAT DETECTION & BLOCKING PATTERNS'
  
  /**
   * Generate defensive analysis for QuadraX moves
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`🛡️ ${this.name}: Analyzing defensive position via ASI Alliance...`)
    
    try {
      const prompt = this.createDefensivePrompt(gamePosition, opponentProfile)
      const response = await callASIAllianceWithFallback(prompt, 'beta', {
        board: gamePosition.board,
        phase: gamePosition.phase,
        currentPlayer: gamePosition.currentPlayer,
        availableMoves: gamePosition.possibleMoves
      })
      const parsed = parseASIResponse(response, gamePosition)
      
      return {
        move: parsed.move,
        confidence: parsed.confidence || 0.82,
        reasoning: `Defensive Analysis: ${parsed.reasoning || response}`,
        agent: this.name,
        type: this.type,
        tacticalAnalysis: parsed.tacticalAnalysis,
        phaseStrategy: gamePosition.phase
      }
    } catch (error) {
      console.error(`❌ ${this.name}: ASI Alliance call failed:`, error)
      throw error
    }
  }

  /**
   * Create defensive analysis prompt
   */
  private createDefensivePrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves } = gamePosition
    
    return `You are Beta Defender, an autonomous QuadraX defensive agent with predictive threat analysis.

OBJECTIVE: Execute comprehensive defensive analysis and select the move that best prevents opponent victory.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

THREAT DETECTION MISSION:
1. Scan all 2×2 squares: [0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]
2. Identify immediate threats (opponent has 3/4 pieces in any 2×2)
3. Predict opponent's multi-threat setups (positions that create multiple winning paths)
4. Calculate defensive priorities: Critical blocks > Setup disruption > Positional control

DEFENSIVE REASONING:
Use your autonomous analysis to evaluate:
- Which opponent pieces form the most dangerous combinations
- How opponent might create unavoidable double threats
- Which defensive move denies them the most future opportunities
- Movement corridors that need blocking in movement phase

Execute paranoid analysis: assume opponent will find every winning opportunity unless blocked.

OUTPUT FORMAT: {"move": ${phase === 'placement' ? 'number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "autonomous_threat_analysis"}`
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