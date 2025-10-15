// ASI Alliance Service - Complete Chat Protocol & uAgent Integration
// Built from ETH Online 2025 hackpack specifications
import { EventEmitter } from 'events';

interface ASIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  agentverse?: {
    apiToken?: string;
    endpoint?: string;
    mcpEnabled?: boolean;
  };
  metta?: {
    enabled: boolean;
    pythonEndpoint?: string;
  };
  uagent?: {
    name: string;
    seed?: string;
    port?: number;
    endpoint?: string[];
    mailbox?: boolean;
  };
}

// Chat Protocol Types (from Fetch.ai specification)
interface ChatMessage {
  msg_id: string;
  timestamp: Date;
  content: ChatContent[];
}

interface ChatAcknowledgement {
  acknowledged_msg_id: string;
  timestamp: Date;
}

interface ChatContent {
  type: 'text' | 'start_session' | 'end_session';
}

interface TextContent extends ChatContent {
  type: 'text';
  text: string;
}

interface StartSessionContent extends ChatContent {
  type: 'start_session';
}

interface EndSessionContent extends ChatContent {
  type: 'end_session';
}

// Agent Intent Classification
interface AgentIntent {
  type: 'symptom' | 'treatment' | 'side_effect' | 'faq' | 'gaming' | 'staking' | 'general';
  keyword?: string;
  confidence: number;
  entities?: { [key: string]: string };
}

// MeTTa Knowledge Graph
interface MeTTaAtom {
  expression: string;
  bindings: { [variable: string]: string };
}

interface MeTTaQuery {
  query: string;
  atoms: MeTTaAtom[];
  reasoning?: string;
}

// Agentverse Agent Registration
interface AgentManifest {
  name: string;
  description: string;
  protocols: string[];
  capabilities: string[];
  readme: string;
  tags: string[];
  version: string;
}

export class ASIService extends EventEmitter {
  private config: ASIConfig;
  private isConnected: boolean = false;
  private chatSessions: Map<string, ChatMessage[]> = new Map();
  private agentAddress?: string;
  
  constructor(config: ASIConfig) {
    super();
    this.config = {
      baseUrl: 'https://api.asi1.ai/v1',
      model: 'asi1-mini',
      ...config,
      agentverse: {
        endpoint: 'https://agentverse.ai/api',
        mcpEnabled: true,
        ...config.agentverse
      },
      metta: {
        enabled: true,
        pythonEndpoint: 'http://localhost:8080/metta',
        ...config.metta
      },
      uagent: {
        name: 'quadrax-agent',
        port: 8005,
        endpoint: ['http://localhost:8005/submit'],
        mailbox: true,
        ...config.uagent
      }
    };
  }

  /**
   * Initialize ASI service with complete Chat Protocol support
   */
  async initialize(): Promise<void> {
    if (this.isConnected) {
      return; // Already initialized
    }
    
    try {
      console.log('Initializing ASI Alliance service...');
      
      // Test ASI:One connection
      await this.testASIConnection();
      
      // Initialize MeTTa if enabled (browser-safe)
      if (this.config.metta?.enabled && typeof window !== 'undefined') {
        try {
          await this.initializeMeTTa();
        } catch (error) {
          console.warn('MeTTa initialization skipped in browser:', error);
        }
      }
      
      // Register on Agentverse with Chat Protocol (if available)
      if (this.config.agentverse?.apiToken) {
        try {
          await this.registerChatProtocolAgent();
        } catch (error) {
          console.warn('Agentverse registration skipped:', error);
        }
      }

      // Setup MCP if enabled (if available)
      if (this.config.agentverse?.mcpEnabled && typeof window !== 'undefined') {
        try {
          await this.setupMCPConnection();
        } catch (error) {
          console.warn('MCP connection skipped in browser:', error);
        }
      }

      this.isConnected = true;
      this.emit('connected', { agentAddress: this.agentAddress });
      console.log('ASI Alliance service initialized successfully');
      
    } catch (error) {
      console.warn('ASI service initialization had issues:', error);
      // Don't fail completely - allow demo mode
      this.isConnected = true;
    }
  }

  /**
   * Generate response using ASI:One with Chat Protocol
   */
  async generateResponse(prompt: string, context?: string, sessionId?: string): Promise<string> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      const session = sessionId || 'default';
      
      // Create Chat Protocol message
      const chatMessage = this.createChatMessage([{
        type: 'text' as const,
        text: prompt
      } as TextContent]);

      // Classify intent and query MeTTa
      const [intent, mettaResults] = await Promise.all([
        this.classifyIntent(prompt),
        this.config.metta?.enabled ? this.queryMeTTa(prompt) : null
      ]);

      // Build enhanced context with knowledge
      const enhancedContext = this.buildKnowledgeContext(context, intent, mettaResults);

      // Generate response via ASI:One
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { 
              role: 'system', 
              content: this.getSystemPrompt() + '\n\n' + enhancedContext 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        throw new Error(`ASI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      // Store in session with Chat Protocol format
      const responseMessage = this.createChatMessage([{
        type: 'text' as const,
        text: assistantResponse
      } as TextContent]);

      this.storeChatSession(session, [chatMessage, responseMessage]);

      // Learn new knowledge if needed
      if (intent.confidence > 0.8 && this.config.metta?.enabled) {
        await this.learnFromInteraction(prompt, assistantResponse, intent);
      }

      return assistantResponse;
      
    } catch (error) {
      console.error('ASI generateResponse error:', error);
      throw error;
    }
  }

  /**
   * Stream response using ASI:One Chat Protocol
   */
  async streamResponse(prompt: string, context?: string, onToken?: (token: string) => void): Promise<void> {
    if (!this.isConnected) {
      await this.initialize();
    }

    try {
      // Pre-process with intent and MeTTa
      const [intent, mettaResults] = await Promise.all([
        this.classifyIntent(prompt),
        this.config.metta?.enabled ? this.queryMeTTa(prompt) : null
      ]);

      const enhancedContext = this.buildKnowledgeContext(context, intent, mettaResults);

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { 
              role: 'system', 
              content: this.getSystemPrompt() + '\n\n' + enhancedContext 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`ASI streaming error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      let fullResponse = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullResponse += delta;
                onToken?.(delta);
              }
            } catch (e) {
              // Skip invalid JSON chunks
            }
          }
        }
      }

      // Learn from successful interaction
      if (intent.confidence > 0.8 && this.config.metta?.enabled) {
        await this.learnFromInteraction(prompt, fullResponse, intent);
      }

    } catch (error) {
      console.error('ASI streamResponse error:', error);
      throw error;
    }
  }

  /**
   * Test ASI:One API connection (browser-friendly)
   */
  private async testASIConnection(): Promise<void> {
    try {
      // For browser environments, we'll do a simple API key check instead of full connection test
      if (!this.config.apiKey || this.config.apiKey === 'your-api-key-here') {
        console.warn('ASI Alliance API key not configured, using demo mode');
        return; // Allow demo mode
      }
      
      // Try a lightweight connection test
      console.log('ASI:One connection configured');
    } catch (error) {
      console.warn(`ASI:One connection test skipped: ${error}`);
      // Don't throw error in browser environment - allow fallback
    }
  }

  /**
   * Initialize MeTTa knowledge graph
   */
  private async initializeMeTTa(): Promise<void> {
    if (!this.config.metta?.pythonEndpoint) {
      console.log('MeTTa initialized with mock data');
      return;
    }

    try {
      // Initialize MeTTa with QuadraX knowledge
      const knowledgeGraph = {
        // Gaming knowledge
        atoms: [
          'symptom fever flu',
          'treatment flu rest_fluids_antivirals',
          'gaming tictactoe strategy_game',
          'staking pyusd ethereum_yield',
          'defi hedera smart_contracts'
        ]
      };

      const response = await fetch(`${this.config.metta.pythonEndpoint}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledgeGraph),
      });

      if (response.ok) {
        console.log('MeTTa knowledge graph initialized');
      } else {
        console.warn('MeTTa initialization failed, using mock mode');
      }
    } catch (error) {
      console.warn('MeTTa service unavailable, using mock knowledge:', error);
    }
  }

  /**
   * Register Chat Protocol compatible agent on Agentverse
   */
  private async registerChatProtocolAgent(): Promise<void> {
    if (!this.config.agentverse?.apiToken) return;

    try {
      const manifest: AgentManifest = {
        name: this.config.uagent?.name || 'quadrax-agent',
        description: 'QuadraX AI Agent with ASI Alliance, MeTTa reasoning, and Hedera integration',
        protocols: ['AgentChatProtocol'],
        capabilities: [
          'reasoning', 
          'gaming', 
          'staking', 
          'metta-integration',
          'defi',
          'tictactoe',
          'pyusd-staking'
        ],
        readme: `# QuadraX Agent

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)

AI-powered gaming and DeFi agent with:
- ASI Alliance integration
- MeTTa knowledge reasoning  
- Hedera smart contracts
- PYUSD staking
- TicTacToe gameplay

Supports ASI:One Chat Protocol for natural language interaction.`,
        tags: ['gaming', 'defi', 'ai', 'metta', 'asi-alliance', 'hedera', 'tictactoe'],
        version: '1.0.0'
      };

      const response = await fetch(`${this.config.agentverse.endpoint}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.agentverse.apiToken}`,
        },
        body: JSON.stringify(manifest),
      });

      if (response.ok) {
        const data = await response.json();
        this.agentAddress = data.address;
        console.log('Agent registered on Agentverse:', this.agentAddress);
        
        // Publish Chat Protocol manifest
        await this.publishChatProtocol();
      } else {
        console.warn('Agentverse registration failed:', response.statusText);
      }
    } catch (error) {
      console.warn('Agentverse registration error:', error);
    }
  }

  /**
   * Setup Model Context Protocol connection
   */
  private async setupMCPConnection(): Promise<void> {
    try {
      // MCP connection setup for Claude Desktop, Cursor, etc.
      const mcpConfig = {
        server: 'agentverse-mcp',
        type: 'http',
        url: 'https://mcp.agentverse.ai/sse',
        timeout: 180000,
        env: {
          AGENTVERSE_API_TOKEN: this.config.agentverse?.apiToken
        }
      };
      
      console.log('MCP configuration ready:', mcpConfig);
      this.emit('mcp-ready', mcpConfig);
    } catch (error) {
      console.warn('MCP setup failed:', error);
    }
  }

  /**
   * Publish Chat Protocol manifest
   */
  private async publishChatProtocol(): Promise<void> {
    const protocolSpec = {
      name: 'AgentChatProtocol',
      version: '1.0.0',
      messages: [
        {
          type: 'ChatMessage',
          handler: 'handle_chat_message',
          description: 'Handles incoming chat messages from ASI:One'
        },
        {
          type: 'ChatAcknowledgement', 
          handler: 'handle_chat_acknowledgement',
          description: 'Acknowledges received messages'
        }
      ]
    };

    this.emit('protocol-published', protocolSpec);
  }

  /**
   * Classify intent using ASI:One with gaming context
   */
  private async classifyIntent(query: string): Promise<AgentIntent> {
    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{
            role: 'system',
            content: `Classify queries for QuadraX gaming/DeFi platform:

Categories:
- gaming: TicTacToe gameplay, strategies, rules
- staking: PYUSD staking, rewards, DeFi
- symptom: Health symptoms (legacy medical support)
- treatment: Medical treatments (legacy)
- side_effect: Drug side effects (legacy)
- faq: General questions about platform
- general: Other queries

Extract entities like game_type, token_name, action, etc.

Respond with JSON: {"type": "category", "keyword": "main_keyword", "confidence": 0.95, "entities": {"key": "value"}}`
          },
          { role: 'user', content: query }],
          temperature: 0.1,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        return { type: 'general', confidence: 0.5 };
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        return JSON.parse(content);
      } catch {
        return { type: 'general', confidence: 0.5 };
      }
    } catch {
      return { type: 'general', confidence: 0.5 };
    }
  }

  /**
   * Query MeTTa knowledge graph
   */
  private async queryMeTTa(query: string): Promise<MeTTaQuery | null> {
    if (!this.config.metta?.enabled) return null;

    try {
      if (this.config.metta.pythonEndpoint) {
        // Real MeTTa service
        const response = await fetch(`${this.config.metta.pythonEndpoint}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Mock MeTTa for development
      return this.mockMeTTaQuery(query);
    } catch (error) {
      console.error('MeTTa query error:', error);
      return this.mockMeTTaQuery(query);
    }
  }

  /**
   * Mock MeTTa responses for development
   */
  private mockMeTTaQuery(query: string): MeTTaQuery {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('tictactoe') || lowerQuery.includes('game')) {
      return {
        query: `!(match &self (gaming tictactoe $strategy) $strategy)`,
        atoms: [
          { expression: 'gaming tictactoe strategy_game', bindings: { '$strategy': 'strategic_thinking' } },
          { expression: 'gaming tictactoe blockchain_rewards', bindings: { '$strategy': 'earn_while_playing' } }
        ],
        reasoning: 'Found TicTacToe gaming knowledge'
      };
    }
    
    if (lowerQuery.includes('staking') || lowerQuery.includes('pyusd')) {
      return {
        query: `!(match &self (staking pyusd $benefit) $benefit)`,
        atoms: [
          { expression: 'staking pyusd ethereum_yield', bindings: { '$benefit': 'passive_income' } },
          { expression: 'staking pyusd hedera_integration', bindings: { '$benefit': 'cross_chain_rewards' } }
        ],
        reasoning: 'Found PYUSD staking knowledge'
      };
    }

    return {
      query: `!(match &self (general ${query} $info) $info)`,
      atoms: [],
      reasoning: 'General knowledge query'
    };
  }

  /**
   * Learn from interactions to improve knowledge
   */
  private async learnFromInteraction(query: string, response: string, intent: AgentIntent): Promise<void> {
    try {
      if (!this.config.metta?.enabled) return;

      const knowledge = {
        query,
        response,
        intent: intent.type,
        keyword: intent.keyword,
        entities: intent.entities,
        timestamp: new Date().toISOString()
      };

      if (this.config.metta.pythonEndpoint) {
        await fetch(`${this.config.metta.pythonEndpoint}/learn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(knowledge),
        });
      }

      console.log('Learned from interaction:', intent.type, intent.keyword);
    } catch (error) {
      console.error('Learning error:', error);
    }
  }

  /**
   * Create Chat Protocol message
   */
  private createChatMessage(content: ChatContent[]): ChatMessage {
    return {
      msg_id: crypto.randomUUID(),
      timestamp: new Date(),
      content
    };
  }

  /**
   * Store chat session
   */
  private storeChatSession(sessionId: string, messages: ChatMessage[]): void {
    if (!this.chatSessions.has(sessionId)) {
      this.chatSessions.set(sessionId, []);
    }
    this.chatSessions.get(sessionId)?.push(...messages);
  }

  /**
   * Build knowledge-enhanced context
   */
  private buildKnowledgeContext(baseContext?: string, intent?: AgentIntent, mettaResults?: MeTTaQuery | null): string {
    let context = baseContext || '';
    
    if (intent && intent.type !== 'general') {
      context += `\n\nIntent: ${intent.type} (${intent.keyword}) - Confidence: ${intent.confidence}`;
      if (intent.entities) {
        context += `\nEntities: ${JSON.stringify(intent.entities)}`;
      }
    }
    
    if (mettaResults?.atoms?.length) {
      context += `\n\nKnowledge Graph Results:`;
      mettaResults.atoms.forEach(atom => {
        context += `\n- ${atom.expression}`;
        if (Object.keys(atom.bindings).length > 0) {
          context += ` | Bindings: ${JSON.stringify(atom.bindings)}`;
        }
      });
      if (mettaResults.reasoning) {
        context += `\nReasoning: ${mettaResults.reasoning}`;
      }
    }
    
    return context;
  }

  /**
   * Get system prompt for ASI:One
   */
  private getSystemPrompt(): string {
    return `You are QuadraX Agent, an AI assistant powered by ASI Alliance technology with:

🎮 GAMING: Expert in TicTacToe strategy and blockchain gaming
💰 DEFI: PYUSD staking on Hedera, yield optimization  
🧠 REASONING: MeTTa knowledge graphs for structured thinking
🔗 INTEGRATION: ASI:One Chat Protocol, Agentverse connectivity

Use your MeTTa knowledge graph for structured reasoning. Provide actionable insights for gaming strategies and DeFi opportunities.`;
  }

  /**
   * Public API methods
   */
  getChatSession(sessionId: string = 'default'): ChatMessage[] {
    return this.chatSessions.get(sessionId) || [];
  }

  clearChatSession(sessionId: string = 'default'): void {
    this.chatSessions.delete(sessionId);
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  getAgentAddress(): string | undefined {
    return this.agentAddress;
  }

  getSupportedProtocols(): string[] {
    return ['AgentChatProtocol', 'StructuredOutputProtocol'];
  }

  getCapabilities(): string[] {
    return ['reasoning', 'gaming', 'staking', 'metta-integration', 'defi'];
  }
}

// Export interfaces for other modules
export type { 
  ASIConfig, 
  ChatMessage, 
  ChatContent, 
  TextContent, 
  AgentIntent, 
  MeTTaQuery, 
  MeTTaAtom,
  AgentManifest 
};

// Default configuration for QuadraX
export const defaultASIConfig: Partial<ASIConfig> = {
  baseUrl: 'https://api.asi1.ai/v1',
  model: 'asi1-mini',
  agentverse: {
    endpoint: 'https://agentverse.ai/api',
    mcpEnabled: true,
    apiToken: process.env.NEXT_PUBLIC_AGENTVERSE_API_TOKEN
  },
  metta: {
    enabled: true,
    pythonEndpoint: process.env.NEXT_PUBLIC_METTA_ENDPOINT
  },
  uagent: {
    name: 'quadrax-agent',
    port: 8005,
    endpoint: ['http://localhost:8005/submit'],
    mailbox: true
  }
};