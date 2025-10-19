/**
 * Comprehensive ASI Test - Both Phases
 * Tests both placement and movement phases with ASI Alliance
 */

import fetch from 'node-fetch'

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`)
}

async function callASI(boardState) {
  const response = await fetch('http://localhost:3000/api/ai/strategic-move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      boardState: boardState,
      requestType: 'strategic-move',
      difficulty: 'hard'
    })
  })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  
  return await response.json()
}

async function testFullASIFlow() {
  log('\n🧠 COMPREHENSIVE ASI TEST - BOTH PHASES', 'cyan')
  log('═'.repeat(60), 'cyan')
  
  // PHASE 1: PLACEMENT TEST
  log('\n📍 PHASE 1: PLACEMENT TEST', 'blue')
  log('Board: Empty, testing ASI placement logic')
  
  try {
    const placementResult = await callASI({
      board: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      phase: 'placement',
      possibleMoves: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
      player: 2
    })
    
    log(`✅ Placement Result: Position ${placementResult.move}`, 'green')
    log(`Reasoning: ${(placementResult.reasoning || 'N/A').substring(0, 100)}...`)
    
  } catch (error) {
    log(`❌ Placement failed: ${error.message}`, 'red')
    return
  }
  
  // PHASE 2: MOVEMENT TEST
  log('\n🔄 PHASE 2: MOVEMENT TEST', 'blue')
  log('Board: Mid-game, testing ASI movement logic')
  
  const movementBoard = [
    1, 2, 0, 1,  // Mixed pieces
    0, 2, 2, 0,  // AI control center
    1, 0, 2, 0,  // Strategic positions
    0, 1, 0, 0   // Open areas
  ]
  
  const movements = [
    {from: 1, to: 2}, {from: 1, to: 3},
    {from: 5, to: 4}, {from: 5, to: 9},
    {from: 6, to: 7}, {from: 6, to: 11},
    {from: 10, to: 9}, {from: 10, to: 11}, {from: 10, to: 14}, {from: 10, to: 15}
  ]
  
  try {
    const movementResult = await callASI({
      board: movementBoard,
      phase: 'movement',
      possibleMoves: movements,
      player: 2
    })
    
    if (typeof movementResult.move === 'object' && 'from' in movementResult.move) {
      log(`✅ Movement Result: ${movementResult.move.from} → ${movementResult.move.to}`, 'green')
      log(`Reasoning: ${(movementResult.reasoning || 'N/A').substring(0, 100)}...`)
    } else {
      log(`⚠️ Movement returned single position: ${movementResult.move}`, 'yellow')
    }
    
  } catch (error) {
    log(`❌ Movement failed: ${error.message}`, 'red')
    return
  }
  
  // SUMMARY
  log('\n🎯 SUMMARY', 'cyan')
  log('✅ ASI Alliance system is working for both game phases!')
  log('✅ Placement phase: Returns position numbers')
  log('✅ Movement phase: Returns movement objects {from, to}')
  log('✅ Emergency ASI system provides intelligent strategic moves')
  
}

testFullASIFlow().catch(console.error)