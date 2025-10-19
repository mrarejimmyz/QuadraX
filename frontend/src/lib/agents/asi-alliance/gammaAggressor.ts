// Gamma Aggressor Agent - ASI Alliance Aggressive Tactics with Ollama Fallback
// Specialized in immediate win creation, pressure tactics, and offensive combinations

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class GammaAggressor {
  public readonly name = 'GammaAggressor'
  public readonly type = 'aggressive'
  public readonly personality = 'bold'
  public readonly focus = 'IMMEDIATE WIN CREATION & PRESSURE'
  
  /**
   * Generate aggressive analysis for QuadraX moves
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`⚡ ${this.name}: Analyzing aggressive position via ASI Alliance...`)
    
    try {
      const prompt = this.createAggressivePrompt(gamePosition, opponentProfile)
      const response = await callASIAllianceWithFallback(prompt, 'gamma', {
        board: gamePosition.board,
        phase: gamePosition.phase,
        currentPlayer: gamePosition.currentPlayer,
        availableMoves: gamePosition.possibleMoves
      })
      const parsed = parseASIResponse(response, gamePosition)
      
      return {
        move: parsed.move,
        confidence: parsed.confidence || 0.88,
        reasoning: `Aggressive Analysis: ${parsed.reasoning || response}`,
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
   * Create aggressive analysis prompt
   */
  private createAggressivePrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves } = gamePosition
    
    return `⚡ GAMMA AGGRESSOR - QuadraX Aggressive Tactics

**AGGRESSIVE MISSION**: Create immediate winning opportunities and maximum pressure

**BOARD STATE**: ${board}
**PHASE**: ${phase}
**AVAILABLE MOVES**: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

**AGGRESSIVE PRIORITIES**:
1. **IMMEDIATE WINS**: Can we win this turn?
2. **FORK CREATION**: Set up multiple winning threats simultaneously  
3. **PRESSURE TACTICS**: Force opponent into defensive positions
4. **TEMPO CONTROL**: Dictate game pace against ${opponentProfile.playStyle} opponent

**AGGRESSIVE ANALYSIS REQUIRED**:
- Is there an immediate winning move available?
- Which move creates the most threats?
- How can we maximize opponent pressure?
- What move leads to fastest victory path?

**GAMMA AGGRESSOR DECISION**:
Move: [SELECT MOST AGGRESSIVE POSITION]
Confidence: [0.0-1.0]
Reasoning: [DETAILED AGGRESSIVE ANALYSIS]

Focus on winning combinations and tactical superiority!`
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