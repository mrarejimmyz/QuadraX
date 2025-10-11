#!/usr/bin/env node

/**
 * CLI Test Script for Hedera Agent Kit A2A Protocol
 * Tests real agent interactions and message flow
 */

const readline = require('readline');

// Mock Hedera Agent Kit for CLI testing
class MockHederaGameAgent {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.messages = [];
    this.subscribers = [];
    
    console.log(`🤖 Agent ${this.name} initialized (ID: ${this.id})`);
  }

  // Subscribe to agent messages
  subscribe(callback) {
    this.subscribers.push(callback);
    console.log(`📡 Subscriber added to ${this.name}`);
  }

  // Send A2A message
  async sendA2AMessage(to, type, gameId, payload) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      from: this.name,
      to,
      gameId,
      payload,
      timestamp: Date.now()
    };

    console.log(`📤 ${this.name} → ${to}: ${type}`);
    console.log(`   Payload:`, JSON.stringify(payload, null, 2));
    
    // Simulate message delivery to other agents
    setTimeout(() => {
      this.deliverMessage(message);
    }, 100 + Math.random() * 500);
  }

  // Deliver message to subscribers
  deliverMessage(message) {
    this.messages.push(message);
    
    // Notify subscribers
    this.subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('❌ Subscriber callback error:', error);
      }
    });

    // Process message if addressed to this agent
    if (message.to === this.name || message.to === 'general') {
      setTimeout(() => this.processMessage(message), 200 + Math.random() * 800);
    }
  }

  // Process incoming message and generate response
  async processMessage(message) {
    if (message.from === this.name) return; // Don't respond to own messages
    
    console.log(`📥 ${this.name} processing: ${message.type} from ${message.from}`);
    
    const isAlpha = this.name === 'AlphaStrategist';
    
    switch (message.type) {
      case 'strategy_share':
        await this.analyzeStrategy(message);
        break;
      case 'negotiation':
        await this.negotiate(message);
        break;
      case 'move_proposal':
        await this.respondToMoveProposal(message);
        break;
      default:
        await this.generateContextualResponse(message);
    }
  }

  // Strategy analysis
  async analyzeStrategy(message) {
    const isAlpha = this.name === 'AlphaStrategist';
    const strategy = message.payload.strategy || 'strategic development';
    
    const analysis = isAlpha ? 
      `Aggressive evaluation: "${strategy}" shows ${Math.random() > 0.5 ? 'high' : 'moderate'} offensive potential.` :
      `Defensive assessment: "${strategy}" requires ${Math.random() > 0.5 ? 'protective counter-measures' : 'risk mitigation'}.`;
    
    await this.sendA2AMessage(message.from, 'negotiation', message.gameId, {
      response: 'strategy_analysis_complete',
      reasoning: analysis,
      confidence: 0.7 + Math.random() * 0.3
    });
  }

  // Negotiation logic
  async negotiate(message) {
    const isAlpha = this.name === 'AlphaStrategist';
    const topics = isAlpha ? [
      'Propose aggressive corner control strategy',
      'Suggest immediate tactical pressure',
      'Recommend high-risk offensive maneuver'
    ] : [
      'Counsel defensive positioning',
      'Recommend risk mitigation',
      'Suggest protective measures'
    ];
    
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    await this.sendA2AMessage(message.from, 'strategy_share', message.gameId, {
      strategy: topic,
      reasoning: `${this.name} negotiation: ${topic} based on current tactical analysis`,
      confidence: 0.65 + Math.random() * 0.35
    });
  }

  // Move proposal response
  async respondToMoveProposal(message) {
    const responses = [
      { response: 'agreement', reasoning: 'Excellent strategic choice!' },
      { response: 'counter_proposal', reasoning: 'I suggest alternative positioning' },
      { response: 'analysis_request', reasoning: 'Need more strategic context' }
    ];
    
    const choice = responses[Math.floor(Math.random() * responses.length)];
    
    await this.sendA2AMessage(message.from, 'negotiation', message.gameId, {
      ...choice,
      confidence: 0.7 + Math.random() * 0.3
    });
  }

  // Contextual response generation
  async generateContextualResponse(message) {
    const isAlpha = this.name === 'AlphaStrategist';
    
    const responses = isAlpha ? [
      'Analyzing tactical implications',
      'Calculating offensive probabilities',
      'Evaluating aggressive strategies'
    ] : [
      'Conducting defensive assessment',
      'Analyzing risk factors',
      'Evaluating protective options'
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    await this.sendA2AMessage('general', 'strategy_share', message.gameId, {
      strategy: response,
      reasoning: `${this.name}: ${response} - automated tactical evaluation`,
      confidence: 0.75 + Math.random() * 0.25
    });
  }
}

// CLI Test Interface
class AgentTestCLI {
  constructor() {
    this.agents = [];
    this.messageCount = 0;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  // Initialize test environment
  async initialize() {
    console.log('🚀 Initializing Hedera Agent Kit A2A Protocol Test');
    console.log('🏆 Target: Hedera Agent Kit + A2A Prize ($4,000)\n');

    // Create agents
    const alpha = new MockHederaGameAgent('AlphaStrategist', 'alpha_001');
    const beta = new MockHederaGameAgent('BetaDefender', 'beta_001');

    // Subscribe to messages
    alpha.subscribe((message) => this.handleMessage(message));
    beta.subscribe((message) => this.handleMessage(message));

    this.agents = [alpha, beta];

    // Send initial welcome messages
    console.log('\n📋 Sending agent introduction messages...');
    await alpha.sendA2AMessage('general', 'strategy_share', 'test_game', {
      strategy: 'AlphaStrategist online! Ready for tactical analysis.',
      reasoning: 'Aggressive positioning and corner control strategies',
      confidence: 0.9
    });

    setTimeout(async () => {
      await beta.sendA2AMessage('general', 'negotiation', 'test_game', {
        response: 'initialization_complete',
        reasoning: 'BetaDefender initialized! Defensive analysis ready - risk assessment and counter-strategies',
        confidence: 0.85
      });
    }, 1000);

    // Start CLI
    setTimeout(() => this.startCLI(), 2000);
  }

  // Handle incoming messages
  handleMessage(message) {
    this.messageCount++;
    console.log(`\n💬 [Message #${this.messageCount}] ${message.from} → ${message.to}`);
    console.log(`   Type: ${message.type}`);
    
    if (message.payload.strategy) {
      console.log(`   Strategy: ${message.payload.strategy}`);
    }
    if (message.payload.reasoning) {
      console.log(`   Reasoning: ${message.payload.reasoning}`);
    }
    if (message.payload.confidence) {
      console.log(`   Confidence: ${Math.round(message.payload.confidence * 100)}%`);
    }
    console.log('');
  }

  // Start interactive CLI
  startCLI() {
    console.log('\n🎮 Interactive Agent Test CLI Ready!');
    console.log('Commands:');
    console.log('  negotiate <gameId> - Start agent negotiation');
    console.log('  move <position> <gameId> - Propose move');
    console.log('  strategy <message> - Share strategy');
    console.log('  stats - Show message statistics');
    console.log('  quit - Exit test\n');

    this.prompt();
  }

  prompt() {
    this.rl.question('🔧 Command: ', (input) => this.handleCommand(input.trim()));
  }

  async handleCommand(input) {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'negotiate':
        const gameId = args[0] || 'test_game';
        console.log(`🤝 Starting negotiation for game: ${gameId}`);
        await this.agents[0].sendA2AMessage('BetaDefender', 'negotiation', gameId, {
          response: 'negotiation_start',
          reasoning: 'AlphaStrategist initiating strategic discussion',
          confidence: 0.8
        });
        break;

      case 'move':
        const position = parseInt(args[0]) || Math.floor(Math.random() * 9);
        const moveGameId = args[1] || 'test_game';
        console.log(`🎯 Proposing move at position ${position}`);
        await this.agents[0].sendA2AMessage('BetaDefender', 'move_proposal', moveGameId, {
          position,
          reasoning: `Strategic move proposal for position ${position}`,
          confidence: 0.75
        });
        break;

      case 'strategy':
        const strategy = args.join(' ') || 'Test strategic analysis';
        console.log(`🧠 Sharing strategy: ${strategy}`);
        await this.agents[1].sendA2AMessage('general', 'strategy_share', 'test_game', {
          strategy,
          reasoning: 'User-initiated strategic discussion via CLI',
          confidence: 0.9
        });
        break;

      case 'stats':
        console.log(`\n📊 Test Statistics:`);
        console.log(`   Total Messages: ${this.messageCount}`);
        console.log(`   Active Agents: ${this.agents.length}`);
        console.log(`   Agent Names: ${this.agents.map(a => a.name).join(', ')}`);
        console.log('');
        break;

      case 'quit':
      case 'exit':
        console.log('🏁 Agent test complete. Thanks for testing!');
        this.rl.close();
        return;

      default:
        console.log('❓ Unknown command. Try: negotiate, move, strategy, stats, quit');
    }

    setTimeout(() => this.prompt(), 500);
  }
}

// Run the test
if (require.main === module) {
  const testCLI = new AgentTestCLI();
  testCLI.initialize().catch(console.error);
}

module.exports = { MockHederaGameAgent, AgentTestCLI };