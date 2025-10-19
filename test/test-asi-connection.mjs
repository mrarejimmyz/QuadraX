/**
 * Simple ASI Connection Test
 * Just tests if ASI agents can be created and connected
 */

import fetch from 'node-fetch'

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
}

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`)
}

async function testASIConnection() {
  log('\n🔗 ASI CONNECTION TEST', 'cyan')
  log('═'.repeat(40), 'cyan')
  
  try {
    log('\n🤖 Testing simple placement call to see agent creation...', 'yellow')
    
    const response = await fetch('http://localhost:3000/api/ai/strategic-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        boardState: {
          board: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Empty board
          phase: 'placement',
          possibleMoves: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
          player: 2
        },
        requestType: 'strategic-move',
        difficulty: 'hard'
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    log('\n✅ API RESPONSE:', 'green')
    log(`Move: ${result.move}`)
    log(`Agent: ${result.agent || 'Unknown'}`)
    
    if (result.reasoning && result.reasoning.includes('Emergency')) {
      log('\n⚠️  EMERGENCY FALLBACK DETECTED!', 'yellow')
      log('ASI agents are not working properly')
    } else {
      log('\n🎉 ASI AGENTS WORKING!', 'green')
    }
    
  } catch (error) {
    log('\n❌ CONNECTION ERROR:', 'red')
    log(error.message)
  }
}

testASIConnection().catch(console.error)