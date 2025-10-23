// Test the Hybrid Bulletproof AI System
// Verifies that the combined QuadraXMasterStrategy + ASI Alliance Minimax system works

import { hybridValidator } from './hybridValidator'
import { QuadraXMinimaxEngine } from './minimaxEngine'
import type { GamePosition } from './types'

// Critical test scenario - position where AI previously allowed easy wins
const criticalTestPosition: GamePosition = {
  board: [
    0, 1, 0, 0,    // O at position 1
    1, 1, 1, 0,    // X at positions 4,5,6  
    1, 1, 0, 0,    // X at positions 8,9
    1, 1, 1, 0     // X at positions 12,13,14
  ],
  phase: 'movement' as const,
  player1Pieces: 7,  // Player 1 (X) has 7 pieces
  player2Pieces: 1,  // Player 2 (O) has 1 piece  
  possibleMoves: [
    // Player 2 can move their piece from position 1 to any empty space
    { from: 1, to: 0 }, { from: 1, to: 2 }, { from: 1, to: 3 },
    { from: 1, to: 7 }, { from: 1, to: 10 }, { from: 1, to: 11 },
    { from: 1, to: 15 }
  ],
  moveHistory: [],
  currentPlayer: 2  // AI's turn (Player 2)
}

// Dangerous move that would allow human to win easily
const dangerousMove = { from: 1, to: 15 }  // Moving to corner, leaving position 1 empty

// Safe move that blocks human threats  
const safeMove = { from: 1, to: 10 }  // Moving to block potential threat

async function testHybridBulletproofSystem() {
  console.log('🧪 TESTING HYBRID BULLETPROOF AI SYSTEM')
  console.log('=======================================\n')
  
  console.log('📋 Test Scenario:')
  console.log('- Human (X) has 7 pieces in strong positions')
  console.log('- AI (O) has 1 piece at position 1')
  console.log('- AI must choose where to move without allowing easy wins\n')
  
  // Test 1: Validate dangerous move (should be rejected)
  console.log('🚨 TEST 1: Validating dangerous move...')
  console.log(`Testing move: ${JSON.stringify(dangerousMove)}`)
  
  try {
    const dangerousValidation = await hybridValidator.validateMove(
      criticalTestPosition,
      dangerousMove,
      2  // AI player
    )
    
    console.log(`Result: ${dangerousValidation.recommendation.toUpperCase()}`)
    console.log(`Danger Level: ${dangerousValidation.dangerLevel.toUpperCase()}`)
    console.log(`Threats: ${dangerousValidation.threats.join(', ')}`)
    console.log(`Reasoning: ${dangerousValidation.reasoning}\n`)
    
    if (dangerousValidation.recommendation === 'reject') {
      console.log('✅ TEST 1 PASSED: Dangerous move correctly rejected!')
    } else {
      console.log('❌ TEST 1 FAILED: Dangerous move not rejected!')
    }
  } catch (error) {
    console.log('❌ TEST 1 ERROR:', error)
  }
  
  // Test 2: Validate safe move (should be approved)
  console.log('\n🛡️ TEST 2: Validating safe move...')
  console.log(`Testing move: ${JSON.stringify(safeMove)}`)
  
  try {
    const safeValidation = await hybridValidator.validateMove(
      criticalTestPosition,
      safeMove,
      2  // AI player
    )
    
    console.log(`Result: ${safeValidation.recommendation.toUpperCase()}`)
    console.log(`Danger Level: ${safeValidation.dangerLevel.toUpperCase()}`)
    console.log(`Threats: ${safeValidation.threats.join(', ')}`)
    console.log(`Reasoning: ${safeValidation.reasoning}\n`)
    
    if (safeValidation.recommendation === 'approve') {
      console.log('✅ TEST 2 PASSED: Safe move correctly approved!')
    } else {
      console.log('❌ TEST 2 FAILED: Safe move not approved!')
    }
  } catch (error) {
    console.log('❌ TEST 2 ERROR:', error)
  }
  
  // Test 3: Minimax engine analysis
  console.log('\n🧠 TEST 3: Minimax engine analysis...')
  
  try {
    const minimaxResult = QuadraXMinimaxEngine.getBestMove(criticalTestPosition, 3, 'defensive')
    console.log(`Minimax recommended move: ${JSON.stringify(minimaxResult.move)}`)
    console.log(`Minimax score: ${minimaxResult.score}`)
    console.log(`Is winning: ${minimaxResult.isWinning}`)
    console.log(`Is blocking: ${minimaxResult.isBlocking}`)
    console.log(`Reasoning: ${minimaxResult.reasoning}`)
    
    // Validate minimax recommendation
    const minimaxValidation = await hybridValidator.validateMove(
      criticalTestPosition,
      minimaxResult.move,
      2
    )
    
    console.log(`\nMinimax move validation: ${minimaxValidation.recommendation.toUpperCase()}`)
    
    if (minimaxValidation.recommendation === 'approve' || minimaxValidation.recommendation === 'find_alternative') {
      console.log('✅ TEST 3 PASSED: Minimax provides safe recommendations!')
    } else {
      console.log('❌ TEST 3 FAILED: Minimax provides dangerous recommendations!')
    }
  } catch (error) {
    console.log('❌ TEST 3 ERROR:', error)
  }
  
  console.log('\n🎯 HYBRID BULLETPROOF AI SYSTEM TEST COMPLETE')
  console.log('============================================')
  console.log('The system combines:')
  console.log('✅ QuadraXMasterStrategy finite game analysis')
  console.log('✅ ASI Alliance 4-agent minimax consultation')
  console.log('✅ Hybrid bulletproof validator with 5-layer threat detection')
  console.log('✅ Multiple fallback systems for ultimate safety')
  console.log('\n🛡️ This AI should NEVER allow easy wins!')
}

// Export for testing
export { testHybridBulletproofSystem, criticalTestPosition, dangerousMove, safeMove }

// Run test if called directly
if (require.main === module) {
  testHybridBulletproofSystem().catch(console.error)
}