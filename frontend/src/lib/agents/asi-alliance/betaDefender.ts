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
    
    return `🛡️ BETA DEFENDER - QuadraX Defensive Analysis

**DEFENSIVE MISSION**: Threat detection and blocking critical opponent strategies

**BOARD STATE**: ${board}
**PHASE**: ${phase}
**AVAILABLE MOVES**: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

**DEFENSIVE PRIORITIES**:
1. **THREAT SCANNING**: Identify immediate opponent win threats
2. **BLOCKING PATTERNS**: Prevent 4-in-a-row and 2x2 formations
3. **COUNTER-POSITIONING**: Disrupt opponent center control
4. **SAFETY ANALYSIS**: Minimize risk exposure from ${opponentProfile.playStyle} tactics

**DEFENSIVE ANALYSIS REQUIRED**:
- Are there immediate threats to block?
- Which opponent patterns need disruption?  
- How can we maintain defensive positioning?
- What move provides maximum threat neutralization?

**BETA DEFENDER DECISION**:
Move: [SELECT BEST DEFENSIVE POSITION]
Confidence: [0.0-1.0]
Reasoning: [DETAILED DEFENSIVE ANALYSIS]

Focus on threat prevention and opponent disruption!`
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