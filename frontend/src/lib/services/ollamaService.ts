/**
 * 🦙 OLLAMA FALLBACK SERVICE
 * 
 * Local AI service using Ollama + Llama 3.2 as fallback for ASI:One API
 * Mimics the 4 ASI Alliance agents with distinct personalities
 */

export interface OllamaMove {
  position: number;
  fromPosition?: number;
  reasoning: string;
  confidence: number;
  agentType: 'alpha' | 'beta' | 'gamma' | 'delta';
}

export class OllamaService {
  private baseUrl = 'http://localhost:11434';
  private model = 'llama3.2:latest';

  /**
   * Call Ollama API with retry logic
   */
  private async callOllama(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 200
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('❌ Ollama API call failed:', error);
      throw new Error(`Ollama service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate move using specific agent personality
   */
  async generateAgentMove(
    board: number[],
    phase: 'placement' | 'movement',
    currentPlayer: 1 | 2,
    agentType: 'alpha' | 'beta' | 'gamma' | 'delta',
    availableMoves: any[]
  ): Promise<OllamaMove> {
    const systemPrompts = {
      alpha: `You are AlphaStrategist, a master strategic AI agent specializing in long-term positioning and tactical superiority. You think 3-5 moves ahead and prioritize board control.`,
      beta: `You are BetaDefender, a defensive AI specialist focused on blocking opponent threats and maintaining strong defensive positions. Security is your priority.`,
      gamma: `You are GammaAggressor, an aggressive AI agent that seeks immediate wins and applies constant pressure. You favor bold, attacking moves.`,
      delta: `You are DeltaAdaptive, an adaptive AI that changes strategy based on game state. You analyze patterns and adapt your approach dynamically.`
    };

    const boardString = board.map((cell, idx) => 
      `${idx}:${cell === 0 ? '·' : cell === 1 ? '○' : '●'}`
    ).join(' ');

    const movesString = availableMoves.map(move => 
      typeof move === 'object' ? `${move.from}→${move.to}` : move
    ).join(', ');

    const prompt = `
QUADRAX GAME STATE:
Board: ${boardString}
Phase: ${phase}
Current Player: ${currentPlayer} (${currentPlayer === 1 ? '○' : '●'})
Available Moves: ${movesString}

As ${agentType.toUpperCase()}, analyze this QuadraX position and choose the best move.

QuadraX Rules:
- 4x4 board with placement phase (8 pieces each) then movement phase
- Win condition: Get 4 pieces in a 2x2 square
- Movement: pieces move to adjacent empty squares

Respond ONLY with this JSON format:
{
  "move": ${phase === 'placement' ? 'position_number' : '{"from": from_pos, "to": to_pos}'},
  "reasoning": "Brief explanation of your choice",
  "confidence": 0.85
}`;

    try {
      console.log(`🦙 ${agentType.toUpperCase()} consulting Llama 3.2...`);
      const response = await this.callOllama(prompt, systemPrompts[agentType]);
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Ollama response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        position: phase === 'placement' ? parsed.move : parsed.move.to,
        fromPosition: phase === 'movement' ? parsed.move.from : undefined,
        reasoning: parsed.reasoning || `${agentType.toUpperCase()} strategic decision`,
        confidence: parsed.confidence || 0.7,
        agentType
      };

    } catch (error) {
      console.error(`❌ ${agentType.toUpperCase()} Ollama error:`, error);
      
      // Fallback to simple logic if Ollama fails
      const fallbackMove = this.getFallbackMove(availableMoves, phase, agentType);
      return {
        position: phase === 'placement' ? fallbackMove : fallbackMove.to,
        fromPosition: phase === 'movement' ? fallbackMove.from : undefined,
        reasoning: `${agentType.toUpperCase()} fallback decision (Ollama unavailable)`,
        confidence: 0.5,
        agentType
      };
    }
  }

  /**
   * Simple fallback logic if Ollama is unavailable
   */
  private getFallbackMove(moves: any[], phase: string, agentType: string): any {
    if (moves.length === 0) throw new Error('No moves available');
    
    switch (agentType) {
      case 'alpha':
        // Prefer center positions
        const centerMoves = moves.filter(m => {
          const pos = phase === 'placement' ? m : m.to;
          return [5, 6, 9, 10].includes(pos);
        });
        return centerMoves.length > 0 ? centerMoves[0] : moves[0];
        
      case 'beta':
        // Prefer defensive positions
        return moves[Math.floor(Math.random() * Math.min(2, moves.length))];
        
      case 'gamma':
        // Prefer aggressive positions
        return moves[Math.floor(Math.random() * moves.length)];
        
      case 'delta':
        // Adaptive - use middle strategy
        return moves[Math.floor(moves.length / 2)];
        
      default:
        return moves[0];
    }
  }

  /**
   * Test Ollama connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/version`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const ollamaService = new OllamaService();