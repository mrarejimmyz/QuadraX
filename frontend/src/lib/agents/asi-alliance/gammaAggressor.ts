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
    
    return `⚔️ GAMMA AGGRESSOR - QuadraX Aggressive Analysis

**GAME STATE:**
Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
Phase: ${phase} | Available: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

**AGGRESSIVE PRIORITIES:**
1. **WIN NOW**: Complete any 2×2 square immediately if possible
2. **CREATE FORKS**: Set up multiple 2×2 threats opponent cannot defend simultaneously
3. **PRESSURE**: Force opponent into defensive positions while building our attacks
4. **DOMINATE CENTER**: Control positions 5,6,9,10 for maximum 2×2 square access
5. **TEMPO**: Every move must threaten something while advancing our position

**2×2 TARGET SQUARES:**
[0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]

**ATTACK STRATEGY:**
- Which move threatens the most 2×2 squares next turn?
- Can we create an unavoidable double threat?
- Target intersection positions (appear in multiple 2×2 squares)
- Force opponent to react while we maintain offensive momentum

You are Gamma Aggressor, an autonomous QuadraX offensive agent optimized for creating winning combinations.

OBJECTIVE: Execute aggressive multi-step planning to create unavoidable winning positions.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

OFFENSIVE MISSION:
1. Immediate win detection: Can we complete any 2×2 square now?
2. Fork creation: Which moves threaten multiple 2×2 squares simultaneously?
3. Pressure application: Force opponent into defensive positions while building attacks
4. Tempo control: Every move must advance our winning chances

AGGRESSIVE REASONING:
Use your autonomous analysis to:
- Calculate which positions create the most future winning threats
- Identify intersection squares that appear in multiple 2×2 patterns
- Plan offensive sequences that opponent cannot fully defend
- Create positions where we have multiple paths to victory

Execute relentless offensive analysis: always be threatening to win on the next move.

OUTPUT FORMAT: {"move": ${phase === 'placement' ? 'number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "autonomous_offensive_analysis"}`
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