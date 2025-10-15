// QuadraX uAgent Framework - ASI Alliance + Hedera A2A Integration
// Built for ETH Online 2025 - combines ASI:One Chat Protocol + Hedera Agent Kit + A2A Protocol

import { EventEmitter } from 'events';
import { ASIService, ASIConfig } from './asiService';

// Hedera Agent Kit Types
interface HederaConfig {
  accountId: string;
  privateKey: string;
  network: 'testnet' | 'mainnet';
  agentMode: 'AUTONOMOUS' | 'RETURN_BYTE';
}

// A2A Protocol Types (Agent-to-Agent Communication)
interface AgentCard {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  contact: string;
  capabilities: AgentCapability[];
  endpoints: AgentEndpoint[];
  auth?: AuthConfig;
}

interface AgentCapability {
  name: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
  examples?: any[];
}

interface AgentEndpoint {
  url: string;
  transport: 'http' | 'https' | 'ws' | 'wss';
  methods: string[];
  auth?: string[];
}

interface AuthConfig {
  schemes: ('bearer' | 'api_key' | 'oauth2')[];
  required: boolean;
}

// A2A Task and Message Types
interface A2ATask {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  messages: A2AMessage[];
  participants: string[];
  metadata?: any;
}

interface A2AMessage {
  id: string;
  taskId: string;
  from: string;
  to: string;
  type: 'text' | 'structured' | 'file' | 'action';
  content: any;
  timestamp: Date;
  metadata?: any;
}

// Hedera Transaction Types
interface HederaTransaction {
  type: 'transfer' | 'token_create' | 'token_transfer' | 'consensus_submit' | 'account_create';
  params: any;
  mode: 'AUTONOMOUS' | 'RETURN_BYTE';
  result?: any;
  transactionId?: string;
  bytes?: Uint8Array;
}

// uAgent Configuration
interface UAgentConfig {
  name: string;
  seed?: string;
  port?: number;
  endpoint?: string[];
  mailbox?: boolean;
  publish?: boolean;
  asi: ASIConfig;
  hedera: HederaConfig;
  a2a: {
    enabled: boolean;
    discoveryUrl?: string;
    serverUrl?: string;
    capabilities: string[];
  };
}

export class QuadraXAgent extends EventEmitter {
  private config: UAgentConfig;
  private asiService: ASIService;
  private hederaClient?: any; // HederaLangchainToolkit
  private agentCard: AgentCard;
  private activeTasks: Map<string, A2ATask> = new Map();
  private knownAgents: Map<string, AgentCard> = new Map();
  private isRunning: boolean = false;

  constructor(config: UAgentConfig) {
    super();
    this.config = config;
    
    // Initialize ASI service
    this.asiService = new ASIService(config.asi);
    
    // Create agent card for A2A discovery
    this.agentCard = this.createAgentCard();
  }

  /**
   * Start the QuadraX agent with full ASI + Hedera + A2A integration
   */
  async start(): Promise<void> {
    try {
      console.log(`[${this.config.name}] Starting QuadraX Agent...`);

      // Initialize ASI Alliance service
      await this.asiService.initialize();
      console.log(`[${this.config.name}] ASI Alliance service initialized`);

      // Initialize Hedera Agent Kit
      if (typeof window === 'undefined') {
        // Node.js environment - use actual Hedera Agent Kit
        await this.initializeHederaKit();
      } else {
        // Browser environment - mock for now
        console.log(`[${this.config.name}] Hedera Kit initialized (browser mode)`);
      }

      // Setup A2A protocol server
      if (this.config.a2a.enabled) {
        await this.setupA2AProtocol();
      }

      // Register on Agentverse for discovery
      await this.registerForDiscovery();

      this.isRunning = true;
      this.emit('started', { 
        agentId: this.agentCard.id,
        capabilities: this.agentCard.capabilities.map(c => c.name)
      });
      
      console.log(`[${this.config.name}] QuadraX Agent running successfully!`);
      console.log(`[${this.config.name}] Agent Address: ${this.asiService.getAgentAddress()}`);
      
    } catch (error) {
      console.error(`[${this.config.name}] Failed to start agent:`, error);
      throw error;
    }
  }

  /**
   * Process user input using ASI Alliance + MeTTa reasoning
   */
  async processQuery(query: string, context?: any): Promise<string> {
    if (!this.isRunning) {
      throw new Error('Agent not running. Call start() first.');
    }

    try {
      // Use ASI service for enhanced reasoning
      const response = await this.asiService.generateResponse(query, context?.toString());
      
      // Check if query requires Hedera operations
      const hederaIntent = await this.classifyHederaIntent(query);
      
      if (hederaIntent.shouldExecute && this.hederaClient) {
        // Execute Hedera transaction
        const txResult = await this.executeHederaOperation(hederaIntent);
        
        // Enhance response with transaction details
        return `${response}\n\n🔗 Hedera Transaction: ${txResult.transactionId || 'Prepared'}\n${txResult.details || ''}`;
      }

      // Check if query requires A2A collaboration
      const a2aIntent = await this.classifyA2AIntent(query);
      
      if (a2aIntent.shouldDelegate && this.config.a2a.enabled) {
        // Find suitable agent and delegate
        const collaborationResult = await this.initiateA2ACollaboration(query, a2aIntent);
        return `${response}\n\n🤝 Agent Collaboration: ${collaborationResult}`;
      }

      return response;
    } catch (error) {
      console.error(`[${this.config.name}] Query processing error:`, error);
      throw error;
    }
  }

  /**
   * Stream response with real-time updates
   */
  async streamQuery(query: string, context?: any, onToken?: (token: string) => void): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Agent not running. Call start() first.');
    }

    await this.asiService.streamResponse(query, context?.toString(), onToken);
  }

  /**
   * Initialize Hedera Agent Kit (Node.js only)
   */
  private async initializeHederaKit(): Promise<void> {
    try {
      // Dynamic import for Node.js only
      const { Client, PrivateKey } = await import('@hashgraph/sdk');
      // TODO: Install hedera-agent-kit package when available
      // const { HederaLangchainToolkit, coreQueriesPlugin, coreAccountPlugin, coreHtsPlugin } = 
      //   await import('hedera-agent-kit');

      // Setup Hedera client
      const client = this.config.hedera.network === 'mainnet' 
        ? Client.forMainnet()
        : Client.forTestnet();
      
      client.setOperator(
        this.config.hedera.accountId,
        PrivateKey.fromStringECDSA(this.config.hedera.privateKey)
      );

      // TODO: Initialize Hedera Agent Kit when package is available
      // this.hederaClient = new HederaLangchainToolkit({
      //   client,
      //   configuration: {
      //     plugins: [
      //       coreQueriesPlugin,
      //       coreAccountPlugin, 
      //       coreHtsPlugin
      //     ]
      //   }
      // });

      console.log(`[${this.config.name}] Hedera SDK initialized for ${this.config.hedera.network} (Agent Kit pending)`);
    } catch (error) {
      console.warn(`[${this.config.name}] Hedera Kit not available in browser:`, error);
    }
  }

  /**
   * Setup A2A Protocol for agent-to-agent communication
   */
  private async setupA2AProtocol(): Promise<void> {
    try {
      // For now, setup A2A discovery and basic server
      console.log(`[${this.config.name}] Setting up A2A Protocol...`);
      
      // Register capabilities
      this.emit('a2a-ready', {
        agentCard: this.agentCard,
        serverUrl: this.config.a2a.serverUrl || `http://localhost:${this.config.port}/a2a`
      });

      console.log(`[${this.config.name}] A2A Protocol ready`);
    } catch (error) {
      console.error(`[${this.config.name}] A2A setup failed:`, error);
    }
  }

  /**
   * Register agent for discovery on Agentverse and A2A networks
   */
  private async registerForDiscovery(): Promise<void> {
    try {
      // Emit registration event for external handling
      this.emit('register-discovery', {
        agentCard: this.agentCard,
        protocols: ['ASI:ChatProtocol', 'A2A:v0.3.0', 'Hedera:AgentKit'],
        capabilities: this.config.a2a.capabilities
      });
      
      console.log(`[${this.config.name}] Registered for discovery`);
    } catch (error) {
      console.error(`[${this.config.name}] Discovery registration failed:`, error);
    }
  }

  /**
   * Create A2A Agent Card for discovery
   */
  private createAgentCard(): AgentCard {
    return {
      id: `quadrax-agent-${crypto.randomUUID()}`,
      name: this.config.name,
      description: 'QuadraX AI Agent with ASI Alliance, Hedera, and A2A integration for gaming and DeFi',
      version: '1.0.0',
      author: 'QuadraX Team',
      contact: 'https://github.com/mrarejimmyz/QuadraX',
      capabilities: [
        {
          name: 'gaming',
          description: 'TicTacToe gameplay and strategy analysis',
          inputSchema: { type: 'object', properties: { move: { type: 'string' } } },
          outputSchema: { type: 'object', properties: { analysis: { type: 'string' } } }
        },
        {
          name: 'staking',
          description: 'PYUSD staking operations on Hedera',
          inputSchema: { type: 'object', properties: { amount: { type: 'number' } } },
          outputSchema: { type: 'object', properties: { transactionId: { type: 'string' } } }
        },
        {
          name: 'metta-reasoning',
          description: 'Structured knowledge reasoning using MeTTa',
          inputSchema: { type: 'object', properties: { query: { type: 'string' } } },
          outputSchema: { type: 'object', properties: { reasoning: { type: 'object' } } }
        },
        {
          name: 'hedera-transactions',
          description: 'Execute Hedera network transactions',
          inputSchema: { type: 'object', properties: { operation: { type: 'string' } } },
          outputSchema: { type: 'object', properties: { result: { type: 'object' } } }
        }
      ],
      endpoints: [
        {
          url: this.config.endpoint?.[0] || `http://localhost:${this.config.port}`,
          transport: 'https',
          methods: ['POST'],
          auth: ['bearer']
        }
      ],
      auth: {
        schemes: ['bearer'],
        required: false
      }
    };
  }

  /**
   * Classify if query requires Hedera operations
   */
  private async classifyHederaIntent(query: string): Promise<any> {
    try {
      const hederaKeywords = [
        'balance', 'transfer', 'hbar', 'token', 'create', 'mint', 
        'staking', 'pyusd', 'consensus', 'submit', 'account'
      ];
      
      const hasHederaIntent = hederaKeywords.some(keyword => 
        query.toLowerCase().includes(keyword)
      );
      
      if (hasHederaIntent) {
        // Use ASI to determine specific operation
        const intentResponse = await this.asiService.generateResponse(
          `Classify this Hedera operation: "${query}". 
          Respond with JSON: {"operation": "transfer|token_create|consensus_submit|account_balance", "params": {...}, "shouldExecute": true}`
        );
        
        try {
          return JSON.parse(intentResponse.replace(/```json|```/g, ''));
        } catch {
          return { shouldExecute: false };
        }
      }
      
      return { shouldExecute: false };
    } catch (error) {
      return { shouldExecute: false };
    }
  }

  /**
   * Execute Hedera operation
   */
  private async executeHederaOperation(intent: any): Promise<any> {
    if (!this.hederaClient) {
      return { error: 'Hedera client not available' };
    }

    try {
      // Use Hedera Agent Kit tools
      const tools = this.hederaClient.getTools();
      
      // Find appropriate tool for operation
      const tool = tools.find((t: any) => 
        t.name.toLowerCase().includes(intent.operation.toLowerCase())
      );
      
      if (tool) {
        const result = await tool.invoke(intent.params || {});
        return {
          transactionId: result.transactionId,
          details: `Successfully executed ${intent.operation}`,
          result
        };
      }
      
      return { error: `No tool found for operation: ${intent.operation}` };
    } catch (error) {
      return { error: `Hedera operation failed: ${error}` };
    }
  }

  /**
   * Classify if query requires A2A collaboration
   */
  private async classifyA2AIntent(query: string): Promise<any> {
    try {
      const collaborationKeywords = [
        'negotiate', 'collaborate', 'coordinate', 'delegate', 'ask another', 
        'multi-agent', 'team up', 'work together'
      ];
      
      const needsCollaboration = collaborationKeywords.some(keyword => 
        query.toLowerCase().includes(keyword)
      );
      
      return { shouldDelegate: needsCollaboration, type: 'collaboration' };
    } catch (error) {
      return { shouldDelegate: false };
    }
  }

  /**
   * Initiate A2A collaboration with other agents
   */
  private async initiateA2ACollaboration(query: string, intent: any): Promise<string> {
    try {
      // For now, return a mock collaboration result
      // In a full implementation, this would:
      // 1. Discover suitable agents via A2A protocol
      // 2. Create A2A tasks
      // 3. Negotiate and coordinate
      // 4. Aggregate results
      
      const taskId = crypto.randomUUID();
      const task: A2ATask = {
        id: taskId,
        type: 'collaboration',
        description: query,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        participants: [this.agentCard.id]
      };
      
      this.activeTasks.set(taskId, task);
      
      // Emit for external A2A handling
      this.emit('a2a-task-created', { task, query, intent });
      
      return `Created collaboration task ${taskId}`;
    } catch (error) {
      return `Collaboration failed: ${error}`;
    }
  }

  /**
   * Handle incoming A2A messages
   */
  async handleA2AMessage(message: A2AMessage): Promise<void> {
    try {
      const task = this.activeTasks.get(message.taskId);
      if (!task) {
        console.warn(`[${this.config.name}] Received message for unknown task: ${message.taskId}`);
        return;
      }

      task.messages.push(message);
      task.updatedAt = new Date();
      
      // Process message based on type
      switch (message.type) {
        case 'text':
          // Use ASI service to generate response
          const response = await this.asiService.generateResponse(
            message.content, 
            `Task: ${task.description}\nCollaborating with: ${message.from}`
          );
          
          // Send response back
          this.emit('a2a-send-message', {
            taskId: task.id,
            to: message.from,
            type: 'text',
            content: response
          });
          break;
          
        case 'action':
          // Handle action requests (e.g., Hedera transactions)
          const actionResult = await this.executeAction(message.content);
          
          this.emit('a2a-send-message', {
            taskId: task.id,
            to: message.from,
            type: 'structured',
            content: actionResult
          });
          break;
      }
      
      this.emit('a2a-message-processed', { task, message });
    } catch (error) {
      console.error(`[${this.config.name}] A2A message handling error:`, error);
    }
  }

  /**
   * Execute action requested by other agents
   */
  private async executeAction(actionRequest: any): Promise<any> {
    try {
      switch (actionRequest.type) {
        case 'hedera_transfer':
          return await this.executeHederaOperation({
            operation: 'transfer',
            params: actionRequest.params,
            shouldExecute: true
          });
          
        case 'game_move':
          // Handle TicTacToe moves
          return {
            success: true,
            move: actionRequest.move,
            analysis: 'Strategic move analyzed'
          };
          
        case 'stake_tokens':
          return await this.executeHederaOperation({
            operation: 'token_transfer',
            params: actionRequest.params,
            shouldExecute: true
          });
          
        default:
          return { error: `Unknown action type: ${actionRequest.type}` };
      }
    } catch (error) {
      return { error: `Action execution failed: ${error}` };
    }
  }

  /**
   * Get agent status and capabilities
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      agentId: this.agentCard.id,
      name: this.config.name,
      capabilities: this.agentCard.capabilities.map(c => c.name),
      activeTasks: this.activeTasks.size,
      knownAgents: this.knownAgents.size,
      protocols: ['ASI:ChatProtocol', 'A2A:v0.3.0', 'Hedera:AgentKit'],
      hederaNetwork: this.config.hedera.network,
      asiConnected: this.asiService.isServiceConnected()
    };
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    
    // Complete active tasks
    for (const [taskId, task] of this.activeTasks) {
      task.status = 'completed';
      this.emit('a2a-task-completed', task);
    }
    
    this.activeTasks.clear();
    this.emit('stopped');
    console.log(`[${this.config.name}] QuadraX Agent stopped`);
  }

  // Getters for external access
  getAgentCard(): AgentCard { return this.agentCard; }
  getActiveTasks(): A2ATask[] { return Array.from(this.activeTasks.values()); }
  getASIService(): ASIService { return this.asiService; }
}

// Export types for external use
export type { 
  UAgentConfig, 
  AgentCard, 
  AgentCapability, 
  A2ATask, 
  A2AMessage, 
  HederaTransaction,
  HederaConfig
};

// Default configuration for QuadraX
export const defaultUAgentConfig: Partial<UAgentConfig> = {
  name: 'QuadraX-Agent',
  port: 8005,
  endpoint: ['http://localhost:8005/submit'],
  mailbox: true,
  publish: true,
  a2a: {
    enabled: true,
    capabilities: ['gaming', 'staking', 'metta-reasoning', 'hedera-transactions']
  }
};