// Alpha Strategist Agent - ASI Alliance Strategic Analysis with Ollama Fallback
// Specialized in center control, long-term positioning, and probability calculations

import { callASIAllianceWithFallback, parseASIResponse } from '../../services/asiService'
import type { GamePosition, AgentDecision, OpponentProfile } from './types'

export class AlphaStrategist {
  public readonly name = 'AlphaStrategist'
  public readonly type = 'strategic'
  public readonly personality = 'analytical'
  public readonly focus = 'CENTER CONTROL & LONG-TERM POSITIONING'
  
  /**
   * Generate strategic analysis for QuadraX moves
   */
  async selectQuadraXMove(
    gamePosition: GamePosition,
    opponentProfile: OpponentProfile,
    timeRemaining: number
  ): Promise<AgentDecision> {
    console.log(`🎯 ${this.name}: Analyzing strategic position via ASI Alliance...`)
    
    try {
      const prompt = this.createStrategicPrompt(gamePosition, opponentProfile)
      const response = await callASIAllianceWithFallback(prompt, 'alpha', {
        board: gamePosition.board,
        phase: gamePosition.phase,
        currentPlayer: gamePosition.currentPlayer,
        availableMoves: gamePosition.possibleMoves
      })
      const parsed = parseASIResponse(response, gamePosition)
      
      return {
        move: parsed.move,
        confidence: parsed.confidence || 0.85,
        reasoning: `Strategic Analysis: ${parsed.reasoning || response}`,
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
   * Create strategic analysis prompt
   */
  private createStrategicPrompt(gamePosition: GamePosition, opponentProfile: OpponentProfile): string {
    const { board, phase, possibleMoves } = gamePosition
    
    return `🎯 ALPHA STRATEGIST - QuadraX Strategic Analysis

**STRATEGIC MISSION**: Center control and long-term positioning dominance

**BOARD STATE**: ${board}
**PHASE**: ${phase}
**AVAILABLE MOVES**: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}**STRATEGIC PRIORITIES**:
1. **CENTER DOMINANCE**: Positions 5,6,9,10 = 67% higher win rate
2. **T-FORMATION BUILDING**: Create multiple threat vectors simultaneously  
3. **PROBABILITY ANALYSIS**: Calculate win percentages for each move
4. **OPPONENT PREDICTION**: Analyze ${opponentProfile.playStyle} patterns

**STRATEGIC ANALYSIS REQUIRED**:
- Which move maximizes center control?
- How does each option affect long-term positioning?
- What are the probability outcomes for each choice?
- Which move creates the most future opportunities?

**ALPHA STRATEGIST DECISION**:
Move: [SELECT BEST STRATEGIC POSITION]
Confidence: [0.0-1.0]
Reasoning: [DETAILED STRATEGIC ANALYSIS]

Focus on mathematical probability and positioning advantage!`
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