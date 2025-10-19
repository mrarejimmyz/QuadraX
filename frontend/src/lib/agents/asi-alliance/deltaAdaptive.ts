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
    
    return `🔄 DELTA ADAPTIVE - QuadraX 4x4 EVOLVING Counter-Intelligence with Predictive Analysis

**QUADRAX ADAPTIVE RULES:**
• 4×4 board with unique 2×2 square dynamics
• 4 pieces per player = resource management critical
• Opponent Profile: ${opponentProfile.playStyle} style, ${opponentProfile.skillLevel} level
• Advanced Adaptation: Predict opponent's next 2-3 moves and counter them proactively

**ADAPTIVE BOARD STATE**:
Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
Phase: ${phase} | Moves: ${moveHistory?.length || 0}
Available: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

**ADVANCED OPPONENT PATTERN ANALYSIS**:
• Preferred positions: ${opponentProfile.preferredPositions?.join(', ') || 'analyzing...'}
• Play style: ${opponentProfile.playStyle} (${opponentProfile.winRate * 100}% win rate)
• Behavioral prediction: ${opponentProfile.playStyle === 'aggressive' ? 'Likely to create multiple threats, vulnerable to counter-attacks' : 
                         opponentProfile.playStyle === 'defensive' ? 'Reactive player, exploit with tempo and forcing moves' :
                         opponentProfile.playStyle === 'strategic' ? 'Plans ahead, disrupt with unpredictable tactical shots' :
                         'Unpredictable style, use comprehensive threat analysis'}

**DELTA EVOLVING PRIORITIES**:
1. **ADVANCED COUNTER-STRATEGY**: ${opponentProfile.playStyle === 'aggressive' ? 'Bait them into overcommitment, then exploit the resulting weaknesses with precise defensive counters' :
                                   opponentProfile.playStyle === 'defensive' ? 'Create complex multi-threat scenarios they cannot defend passively, force active decision-making' :
                                   opponentProfile.playStyle === 'strategic' ? 'Introduce chaos and tactical complications to disrupt their long-term planning' :
                                   'Dynamically adjust between aggressive pressure and defensive solidity based on their current approach'}

**PREDICTIVE PATTERN RECOGNITION**:
- **Move Sequence Prediction**: Based on opponent's ${moveHistory?.length || 0} moves, what are their next 3 most likely moves?
- **Weakness Exploitation**: Where has opponent shown poor QuadraX understanding? Target those blind spots!
- **Setup Detection**: Are they building toward a specific 2×2 square pattern? Counter it before they complete the setup!
- **Style Evolution**: Has their play style changed during this game? Adapt our counter-strategy accordingly!

**SOPHISTICATED ADAPTATION TACTICS**:
- **Mirror & Misdirect**: Copy their opening pattern, then suddenly shift to opposite strategy
- **Tempo Manipulation**: Speed up or slow down game pace to match/counter their comfort zone
- **Psychology Warfare**: Create positions that trigger their known behavioral patterns, then punish those patterns
- **Resource Management**: Force them to exhaust their defensive resources while preserving ours for the decisive strike

2. **PREDICTIVE 2×2 SQUARE COUNTER-ADAPTATION**: 
   - Identify ALL 2×2 squares opponent is targeting or could target
   - Counter their setup before they realize we've detected their pattern
   - Create "honeypot" positions that look good but are actually traps

3. **DYNAMIC PHASE-SPECIFIC ADAPTATION**: 
   ${phase === 'placement' ? '• Placement Phase: Mirror their early positioning to learn their strategy, then pivot to counter it\n   • Position pieces to deny their preferred 2×2 squares while setting up flexible movement options' : 
   '• Movement Phase: Analyze their piece mobility patterns and block their best movement corridors\n   • Create movement sequences that force them into disadvantageous positions'}

4. **MULTI-LAYERED PSYCHOLOGICAL WARFARE**:
   - Bait them into making moves that feel strong but create vulnerabilities
   - Use reverse psychology - appear to defend one area while secretly setting up elsewhere
   - Create time pressure through complex positions that require deep thinking

**COMPREHENSIVE ADAPTIVE ANALYSIS**:
- **PATTERN DETECTION**: What consistent 2×2 square preferences has opponent shown?
- **COUNTER-STRATEGY**: How to disrupt their ${opponentProfile.playStyle} approach while advancing our position?
- **TACTICAL ADAPTATION**: Should we play aggressive, defensive, strategic, or chaos-style this turn?
- **EXPLOITATION MATRIX**: What weakness does their preferred position pattern reveal for our next 3 moves?
- **WIN CONDITION ANALYSIS**: Are they closer to winning? Adapt urgency level accordingly!

**DELTA SUPREME FLEXIBILITY PROTOCOL**:
• **Winning Position** → Maintain control through adaptive defense, deny opponent all comeback paths
• **Losing Position** → Take calculated risks with adaptive aggression, create chaos they can't handle  
• **Equal Position** → Apply maximum psychological pressure through unpredictable adaptive play
• **Always** → Evolve strategy based on opponent's revealed patterns, stay 2 moves ahead of their thinking

**ADVANCED TACTICAL ADAPTATION**:
- **Style Morphing**: Start playing like their expected counter, then suddenly shift to exploit their counter-preparation
- **Threat Prioritization**: Adapt threat assessment based on their demonstrated defensive capabilities  
- **Endgame Planning**: ${phase === 'placement' ? 'Plan placement for maximum movement phase adaptation options' : 'Execute movement patterns they cannot predict or counter'}

Respond with: {"move": ${phase === 'placement' ? 'position_number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "comprehensive_adaptive_counter_analysis"}

You are Delta Adaptive, an autonomous QuadraX agent with advanced pattern recognition and opponent modeling.

OBJECTIVE: Use contextual memory and adaptive reasoning to counter opponent strategies dynamically.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}
- Move history: ${moveHistory?.length || 0} moves
- Opponent profile: ${opponentProfile.playStyle} style, ${opponentProfile.skillLevel} level

ADAPTIVE MISSION:
1. Pattern recognition: Analyze opponent's placement/movement preferences
2. Counter-strategy evolution: Adapt our approach based on their revealed patterns  
3. Psychological modeling: Predict their next 2-3 moves based on established behavior
4. Dynamic optimization: Choose moves that exploit their demonstrated weaknesses

AUTONOMOUS ADAPTATION:
Use your contextual memory to:
- Track opponent's 2×2 square priorities and counter them preemptively
- Identify their blind spots and tactical errors from previous moves
- Adapt between aggressive/defensive/strategic approaches based on game state
- Create unpredictable positions that disrupt their established patterns

Execute evolving analysis: learn from every opponent move and continuously optimize our counter-strategy.

OUTPUT FORMAT: {"move": ${phase === 'placement' ? 'number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "autonomous_adaptive_analysis"}`
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