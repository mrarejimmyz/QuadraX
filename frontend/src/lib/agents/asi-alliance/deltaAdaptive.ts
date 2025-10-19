// Delta Adaptive Agent - ASI Alliance Adaptive Intelligence with Ollama Fallback
// Specialized in pattern recognition, counter-strategy, and real-time learning

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class DeltaAdaptive {
  public readonly name = 'DeltaAdaptive'
  public readonly type = 'adaptive'
  public readonly personality = 'flexible'
  public readonly focus = 'PATTERN RECOGNITION & COUNTER-STRATEGY'
  
  /**
   * Generate adaptive analysis for QuadraX moves
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`🔄 ${this.name}: Analyzing adaptive position via ASI Alliance...`)
    
    try {
      const prompt = this.createAdaptivePrompt(gamePosition, opponentProfile)
      const response = await callASIAllianceWithFallback(prompt, 'delta', {
        board: gamePosition.board,
        phase: gamePosition.phase,
        currentPlayer: gamePosition.currentPlayer,
        availableMoves: gamePosition.possibleMoves
      })
      const parsed = parseASIResponse(response, gamePosition)
      
      return {
        move: parsed.move,
        confidence: parsed.confidence || 0.85,
        reasoning: `Adaptive Analysis: ${parsed.reasoning || response}`,
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
   * Create adaptive analysis prompt
   */
  private createAdaptivePrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves, moveHistory } = gamePosition
    
    return `🔄 DELTA ADAPTIVE - QuadraX Adaptive Intelligence

**ADAPTIVE MISSION**: Pattern recognition and real-time strategic adjustment

**BOARD STATE**: ${board}
**PHASE**: ${phase}  
**AVAILABLE MOVES**: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}
**MOVE HISTORY**: ${moveHistory?.length || 0} moves

**ADAPTIVE PRIORITIES**:
1. **PATTERN ANALYSIS**: Identify opponent behavioral patterns
2. **COUNTER-STRATEGY**: Adapt to ${opponentProfile.playStyle} style (${opponentProfile.skillLevel} level)
3. **LEARNING INTEGRATION**: Apply insights from ${opponentProfile.winRate * 100}% win rate profile  
4. **FLEXIBLE TACTICS**: Switch between aggressive/defensive based on game state

**ADAPTIVE ANALYSIS REQUIRED**:
- What patterns emerge from opponent's preferred positions ${opponentProfile.preferredPositions}?
- How should we counter their ${opponentProfile.playStyle} approach?
- Which strategy adaptation gives us the best advantage?
- What move provides maximum strategic flexibility?

**DELTA ADAPTIVE DECISION**:
Move: [SELECT MOST ADAPTIVE POSITION]
Confidence: [0.0-1.0]
Reasoning: [DETAILED ADAPTIVE ANALYSIS]

Focus on opponent prediction and strategic flexibility!`
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