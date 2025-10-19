/**
 * ASI Movement Phase Test
 * Tests the ASI Alliance agents in movement phase specifically
 */

import fetch from 'node-fetch'

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`)
}

async function testASIMovement() {
  log('\n🧠 ASI ALLIANCE MOVEMENT TEST', 'cyan')
  log('═'.repeat(50), 'cyan')
  
  // Test board: Both players have 4 pieces placed, now in movement phase
  const testBoard = [
    1, 2, 0, 1,  // Row 0: Player pieces mixed
    0, 2, 2, 0,  // Row 1: AI has center positions
    1, 0, 2, 0,  // Row 2: Mixed positions
    0, 1, 0, 0   // Row 3: Some pieces placed
  ]
  
  // Possible movements for player 2 (AI) pieces at positions 1, 5, 6, 10
  const possibleMoves = [
    {from: 1, to: 2},   // piece at 1 can move to 2
    {from: 1, to: 3},   // piece at 1 can move to 3
    {from: 5, to: 4},   // piece at 5 can move to 4
    {from: 5, to: 9},   // piece at 5 can move to 9
    {from: 6, to: 7},   // piece at 6 can move to 7
    {from: 6, to: 11},  // piece at 6 can move to 11
    {from: 10, to: 9},  // piece at 10 can move to 9
    {from: 10, to: 11}, // piece at 10 can move to 11
    {from: 10, to: 14}, // piece at 10 can move to 14
    {from: 10, to: 15}  // piece at 10 can move to 15
  ]
  
  log('\n📋 GAME STATE:', 'yellow')
  log('Board:')
  for (let i = 0; i < 4; i++) {
    const row = testBoard.slice(i * 4, i * 4 + 4)
      .map(cell => cell === 0 ? '·' : cell === 1 ? '○' : '●')
      .join(' ')
    log(`  ${row}`)
  }
  
  log('\n🎯 AI Pieces at positions: ' + 
    testBoard.map((cell, i) => cell === 2 ? i : null)
      .filter(i => i !== null)
      .join(', '))
  
  log('\n🔄 Available movements:')
  possibleMoves.forEach(move => {
    log(`  ${move.from} → ${move.to}`)
  })
  
  // Test the ASI strategic move API
  log('\n🤖 Calling ASI Alliance API...', 'blue')
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/strategic-move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        boardState: {
          board: testBoard,
          phase: 'movement',
          possibleMoves: possibleMoves,
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
    
    log('\n✅ ASI RESPONSE:', 'green')
    log(`Full result:`, JSON.stringify(result, null, 2))
    
    // Handle both movement object {from, to} and fallback number
    let moveStr = 'Unknown'
    let isValidMove = false
    
    if (typeof result.move === 'object' && result.move.from !== undefined && result.move.to !== undefined) {
      moveStr = `${result.move.from} → ${result.move.to}`
      isValidMove = possibleMoves.some(m => 
        m.from === result.move.from && m.to === result.move.to
      )
    } else if (typeof result.move === 'number') {
      moveStr = `Position ${result.move} (fallback format)`
      isValidMove = false // Single numbers are not valid movements
    }
    
    log(`Move: ${moveStr}`)
    log(`Agent: ${result.agent || 'Unknown'}`)
    log(`Confidence: ${result.confidence || 'N/A'}`)
    log(`Reasoning: ${(result.reasoning || 'No reasoning provided').substring(0, 200)}...`)
    
    if (isValidMove) {
      log('\n🎉 MOVEMENT TEST PASSED!', 'green')
      log(`Valid ASI movement: ${result.move.from} → ${result.move.to}`)
    } else {
      log('\n❌ MOVEMENT TEST FAILED!', 'red')
      log(`Invalid move returned: ${JSON.stringify(result.move)}`)
      log('Expected movement object like {from: X, to: Y}')
      log('Available movements:', possibleMoves.map(m => `${m.from}→${m.to}`).join(', '))
      
      // Check if it's emergency fallback
      if (result.reasoning && result.reasoning.includes('Emergency')) {
        log('\n⚠️  EMERGENCY FALLBACK DETECTED!', 'yellow')
        log('ASI agents failed, system used emergency fallback')
      }
    }
    
  } catch (error) {
    log('\n❌ ASI API ERROR:', 'red')
    log(error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      log('\n💡 Make sure the frontend is running:', 'yellow')
      log('  cd frontend && npm run dev')
    }
  }
}

// Run the test
testASIMovement().catch(console.error)