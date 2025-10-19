/**
 * 🧠 LOCAL ASI FALLBACK SYSTEM - DISABLED
 * 
 * This file is temporarily disabled since Ollama fallback is working.
 * The OllamaService provides the actual fallback functionality.
 */

export interface LocalASIMove {
  position: number;
  fromPosition?: number;
  reasoning: string;
  confidence: number;
  agentType: 'alpha' | 'beta' | 'gamma' | 'delta';
}

export class LocalASIFallback {
  async generateMove(): Promise<LocalASIMove> {
    throw new Error('LocalASIFallback is disabled - use OllamaService instead');
  }
}

export const localASIFallback = new LocalASIFallback();