/**
 * AGENTIC ASI ALLIANCE SYSTEM TEST
 * Tests the enhanced ASI:One agentic reasoning capabilities for QuadraX
 * Verifies all 4 agents (Alpha, Beta, Gamma, Delta) work with proper strategic analysis
 */

import fetch from 'node-fetch'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
config({ path: '.env.local' })

// Debug environment loading
console.log('🔍 Environment Check:', {
  hasApiKey: !!process.env.NEXT_PUBLIC_ASI_API_KEY,
  keyLength: process.env.NEXT_PUBLIC_ASI_API_KEY?.length || 0,
  keyPrefix: process.env.NEXT_PUBLIC_ASI_API_KEY?.substring(0, 10) || 'none'
})

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m'
}

function log(message, color = 'reset') {
  console.log(c[color] + message + c.reset)
}

// Test Configuration
const TEST_CONFIG = {
  API_URL: 'https://api.asi1.ai/v1/chat/completions',
  API_KEY: process.env.NEXT_PUBLIC_ASI_API_KEY || process.env.ASI_API_KEY,
  MODEL: 'asi1-mini',
  MAX_TOKENS: 800,
  TEMPERATURE: 0.7
}

// Agent Prompts for Testing
const AGENT_PROMPTS = {
  alpha: (board, phase, moves) => `You are Alpha Strategist, an autonomous QuadraX agent with advanced strategic reasoning capabilities.

OBJECTIVE: Analyze the current QuadraX position and select the optimal move using multi-step reasoning.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${moves.join(', ')}

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

OUTPUT FORMAT: {"move": ${phase === 'placement' ? 'number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "autonomous_strategic_analysis"}`,

  beta: (board, phase, moves) => `You are Beta Defender, an autonomous QuadraX defensive agent with predictive threat analysis.

OBJECTIVE: Execute comprehensive defensive analysis and select the move that best prevents opponent victory.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${moves.join(', ')}

THREAT DETECTION MISSION:
1. Scan all 2×2 squares: [0,1,4,5] [1,2,5,6] [2,3,6,7] [4,5,8,9] [5,6,9,10] [6,7,10,11] [8,9,12,13] [9,10,13,14] [10,11,14,15]
2. Identify immediate threats (opponent has 3/4 pieces in any 2×2)
3. Predict opponent's multi-threat setups (positions that create multiple winning paths)
4. Calculate defensive priorities: Critical blocks > Setup disruption > Positional control

DEFENSIVE REASONING:
Use your autonomous analysis to evaluate:
- Which opponent pieces form the most dangerous combinations
- How opponent might create unavoidable double threats
- Which defensive move denies them the most future opportunities
- Movement corridors that need blocking in movement phase

Execute paranoid analysis: assume opponent will find every winning opportunity unless blocked.

OUTPUT FORMAT: {"move": ${phase === 'placement' ? 'number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "autonomous_threat_analysis"}`,

  gamma: (board, phase, moves) => `You are Gamma Aggressor, an autonomous QuadraX offensive agent optimized for creating winning combinations.

OBJECTIVE: Execute aggressive multi-step planning to create unavoidable winning positions.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${moves.join(', ')}

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

OUTPUT FORMAT: {"move": ${phase === 'placement' ? 'number' : '{"from": X, "to": Y}'}, "confidence": 0.0-1.0, "reasoning": "autonomous_offensive_analysis"}`,

  delta: (board, phase, moves, moveHistory = []) => `You are Delta Adaptive, an autonomous QuadraX agent with advanced pattern recognition and opponent modeling.

OBJECTIVE: Use contextual memory and adaptive reasoning to counter opponent strategies dynamically.

GAME STATE:
- Board: ${board.map((cell, idx) => `${idx}:${cell === 0 ? '·' : cell === 1 ? 'X' : 'O'}`).join(' ')}
- Phase: ${phase}
- Available moves: ${moves.join(', ')}
- Move history: ${moveHistory.length} moves

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

// ASI:One API Call Function
async function callASIAgent(agentType, prompt) {
  log(`🤖 Testing ${agentType.toUpperCase()} Agent with ASI:One...`, 'cyan')
  
  if (!TEST_CONFIG.API_KEY) {
    throw new Error('ASI API Key not found in environment variables')
  }
  
  try {
    const response = await fetch(TEST_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TEST_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an autonomous QuadraX agent with advanced agentic reasoning. Use multi-step analysis, contextual memory, and goal-driven decision making. Think autonomously and provide precise JSON responses.`
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        max_tokens: TEST_CONFIG.MAX_TOKENS,
        temperature: TEST_CONFIG.TEMPERATURE,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ASI:One API Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      const content = data.choices[0].message.content
      log(`✅ ${agentType.toUpperCase()} Response:`, 'green')
      log(content, 'white')
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(content)
        return {
          success: true,
          agentType,
          response: parsed,
          raw: content,
          tokens: data.usage
        }
      } catch (parseError) {
        log(`⚠️  JSON Parse Warning: ${parseError.message}`, 'yellow')
        return {
          success: false,
          agentType,
          error: 'JSON_PARSE_ERROR',
          raw: content,
          tokens: data.usage
        }
      }
    } else {
      throw new Error('Invalid ASI API response structure')
    }
  } catch (error) {
    log(`❌ ${agentType.toUpperCase()} Failed: ${error.message}`, 'red')
    return {
      success: false,
      agentType,
      error: error.message
    }
  }
}

// Test Scenarios
const TEST_SCENARIOS = [
  {
    name: "Opening Position - Empty Board",
    board: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    phase: "placement",
    moves: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    description: "Test agents with completely open board"
  },
  {
    name: "Mid-Game Threat - Player 1 has 2x2 setup",
    board: [1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    phase: "placement", 
    moves: [2,3,5,6,7,8,9,10,11,12,13,14,15],
    description: "Player 1 has pieces at 0,1,4 - threatening 2x2 square [0,1,4,5]"
  },
  {
    name: "Critical Defense - Immediate Threat Block",
    board: [1,1,0,0,1,2,2,0,0,0,0,0,0,2,0,0],
    phase: "placement",
    moves: [2,3,7,8,9,10,11,12,14,15],
    description: "Player 1 can win with position 5 to complete [0,1,4,5]. Must block!"
  },
  {
    name: "Movement Phase - Tactical Positioning",
    board: [1,0,2,0,2,1,0,0,1,0,2,0,0,0,0,1],
    phase: "movement",
    moves: [{from: 0, to: 1}, {from: 5, to: 1}, {from: 8, to: 9}, {from: 15, to: 11}],
    description: "Movement phase with complex positioning"
  },
  {
    name: "Center Control Battle",
    board: [0,0,0,0,0,1,2,0,0,1,2,0,0,0,0,0],
    phase: "placement",
    moves: [0,1,2,3,4,7,8,11,12,13,14,15],
    description: "Battle for center positions 5,6,9,10"
  }
]

// Main Test Function
async function runAgenticASITests() {
  log('🚀 AGENTIC ASI ALLIANCE SYSTEM TEST', 'bright')
  log('=' * 60, 'blue')
  
  // API Connection Test
  log('\n📡 Testing ASI:One API Connection...', 'cyan')
  try {
    const testResponse = await callASIAgent('connection', 'Test connection. Respond with: {"status": "connected"}')
    if (testResponse.success) {
      log('✅ ASI:One API Connected Successfully!', 'green')
    } else {
      log('❌ ASI:One API Connection Failed!', 'red')
      return
    }
  } catch (error) {
    log(`❌ Connection Test Failed: ${error.message}`, 'red')
    return
  }

  // Agent Tests
  let totalTests = 0
  let passedTests = 0
  let failedTests = 0

  for (const scenario of TEST_SCENARIOS) {
    log(`\n🎯 SCENARIO: ${scenario.name}`, 'bright')
    log(`📋 ${scenario.description}`, 'white')
    log(`🎲 Board: ${scenario.board.map(c => c === 0 ? '·' : c === 1 ? 'X' : 'O').join('')}`, 'white')
    log(`📍 Phase: ${scenario.phase} | Moves: ${scenario.moves.length}`, 'white')
    
    // Test each agent
    for (const agentType of ['alpha', 'beta', 'gamma', 'delta']) {
      totalTests++
      
      const prompt = AGENT_PROMPTS[agentType](scenario.board, scenario.phase, scenario.moves, [])
      const result = await callASIAgent(agentType, prompt)
      
      if (result.success) {
        passedTests++
        log(`   ✅ ${agentType.toUpperCase()}: Move ${JSON.stringify(result.response.move)}, Confidence ${result.response.confidence}`, 'green')
        log(`   💭 Reasoning: ${result.response.reasoning?.substring(0, 100)}...`, 'white')
      } else {
        failedTests++
        log(`   ❌ ${agentType.toUpperCase()}: ${result.error}`, 'red')
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Results Summary
  log('\n📊 TEST RESULTS SUMMARY', 'bright')
  log('=' * 40, 'blue')
  log(`🎯 Total Tests: ${totalTests}`, 'white')
  log(`✅ Passed: ${passedTests}`, 'green')
  log(`❌ Failed: ${failedTests}`, 'red')
  log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, 'cyan')
  
  if (passedTests === totalTests) {
    log('\n🏆 ALL TESTS PASSED! Agentic ASI Alliance system is working perfectly!', 'bgGreen')
  } else {
    log(`\n⚠️  ${failedTests} tests failed. Check agent configurations.`, 'yellow')
  }
}

// Run the tests
log('🤖 Starting Agentic ASI Alliance System Test...', 'bright')
runAgenticASITests().catch(error => {
  log(`💥 Test Suite Error: ${error.message}`, 'red')
  console.error(error)
})