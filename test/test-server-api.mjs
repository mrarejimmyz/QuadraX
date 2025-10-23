#!/usr/bin/env node

/**
 * Test ASI Alliance API through the running server
 */

import fetch from 'node-fetch'

console.log('🌐 Testing ASI Alliance through running server (localhost:3000)')
console.log('==============================================================')

// Test board state with movement phase
const testBoard = [0, 2, 0, 0, 2, 1, 2, 0, 1, 1, 1, 2, 0, 0, 0, 0]

console.log('Board state:')
console.log(`  ${testBoard.slice(0,4).map((c,i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log(`  ${testBoard.slice(4,8).map((c,i) => `${i+4}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log(`  ${testBoard.slice(8,12).map((c,i) => `${i+8}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log(`  ${testBoard.slice(12,16).map((c,i) => `${i+12}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log()

const requestData = {
  board: testBoard,
  phase: 'movement',
  currentPlayer: 1
}

console.log('📡 Sending request to ASI Alliance API...')

try {
  const response = await fetch('http://localhost:3000/api/ai/strategic-move', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  const result = await response.json()
  
  console.log('✅ ASI Alliance Response:')
  console.log(`   Agent: ${result.agent}`)
  console.log(`   Move: ${JSON.stringify(result.move)}`)
  console.log(`   Confidence: ${result.confidence}`)
  console.log(`   Reasoning: ${result.reasoning}`)
  console.log(`   Score: ${result.score}`)
  console.log()
  
  if (result.move && typeof result.move === 'object' && result.move.from !== undefined && result.move.to !== undefined) {
    console.log('✅ Movement phase working correctly!')
    console.log(`   Piece moving from position ${result.move.from} to position ${result.move.to}`)
    
    // Verify this is a valid move (piece exists at 'from' position)
    if (testBoard[result.move.from] === 1) {
      console.log('✅ Valid movement - piece exists at source position')
    } else {
      console.log('❌ Invalid movement - no piece at source position')
    }
    
    // Verify target is empty
    if (testBoard[result.move.to] === 0) {
      console.log('✅ Valid target - destination is empty')
    } else {
      console.log('❌ Invalid target - destination is occupied')
    }
  } else {
    console.log('❌ Invalid move format returned')
  }
  
} catch (error) {
  console.error('❌ Error testing ASI Alliance API:', error.message)
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Make sure the development server is running:')
    console.log('   cd frontend && npm run dev')
  }
}

console.log('\n🏁 Test complete!')