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
    
    return `You are Alpha Strategist, an autonomous QuadraX agent with advanced strategic reasoning capabilities.

OBJECTIVE: Analyze the current QuadraX position and select the optimal move using multi-step reasoning.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

QUADRAX RULES:
- Primary win: Complete any 2×2 square: [0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]
- Secondary win: 4-in-a-row (any direction)
- Each player has exactly 4 pieces

STRATEGIC MISSION:
1. Execute multi-step analysis: immediate threats → future opportunities → opponent patterns
2. Prioritize moves that create multiple winning paths while denying opponent options
3. Control center positions (5,6,9,10) for maximum 2×2 square access
4. Plan 3 moves ahead to prevent opponent from creating unavoidable threats

Use your agentic reasoning to autonomously evaluate all possibilities and select the move that maximizes our winning probability.

OUTPUT FORMAT: {"move": ${phase === 'placement' ? 'number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "autonomous_strategic_analysis"}`
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