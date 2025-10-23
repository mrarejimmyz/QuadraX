// Test script to debug movement phase winning detection
// Board state from the logs: 0:· 1:O 2:· 3:· 4:· 5:X 6:O 7:· 8:O 9:X 10:O 11:· 12:· 13:X 14:X 15:·

const board = [0,2,0,0,0,1,2,0,2,1,2,0,0,1,1,0]
// 0=empty, 1=human(X), 2=AI(O)

const humanPieces = [5, 9, 13, 14] // X pieces
const aiPieces = [1, 6, 8, 10] // O pieces
const emptySpaces = [0, 2, 3, 4, 7, 11, 12, 15]

// All 2x2 patterns
const squares2x2 = [
  [0,1,4,5], [1,2,5,6], [2,3,6,7],
  [4,5,8,9], [5,6,9,10], [6,7,10,11],
  [8,9,12,13], [9,10,13,14], [10,11,14,15]
]

console.log('=== ANALYZING HUMAN WINNING POTENTIAL ===')
console.log('Current board:', board)
console.log('Human pieces (X):', humanPieces)  
console.log('AI pieces (O):', aiPieces)
console.log('Empty spaces:', emptySpaces)

// Check each possible human movement
console.log('\n=== CHECKING ALL HUMAN MOVEMENTS ===')
for (const fromPos of humanPieces) {
  for (const toPos of emptySpaces) {
    // Simulate movement
    const testBoard = [...board]
    testBoard[fromPos] = 0 // Remove from original position
    testBoard[toPos] = 1   // Place at new position
    
    // Check if this creates a win
    let hasWin = false
    for (const square of squares2x2) {
      if (square.every(pos => testBoard[pos] === 1)) {
        console.log(`🏆 WINNING MOVE: ${fromPos}→${toPos} completes 2x2 square [${square.join(',')}]`)
        hasWin = true
      }
    }
    
    if (hasWin) {
      console.log(`   New board after ${fromPos}→${toPos}:`, testBoard)
    }
  }
}

console.log('\n=== CHECKING AI BLOCKING POTENTIAL ===')
// Check what positions AI should block
for (const emptyPos of emptySpaces) {
  // Check if AI moving to this position would prevent human wins
  let blocksWin = false
  
  for (const humanFrom of humanPieces) {
    const testBoard = [...board]
    testBoard[humanFrom] = 0 // Remove human piece
    testBoard[emptyPos] = 1  // Simulate human moving to empty position
    
    // Check if this would create a human win
    for (const square of squares2x2) {
      if (square.every(pos => testBoard[pos] === 1)) {
        console.log(`🚨 AI should block position ${emptyPos} to prevent human win via ${humanFrom}→${emptyPos}`)
        blocksWin = true
      }
    }
  }
}