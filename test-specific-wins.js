// Test specific winning scenarios
const board = [0,2,0,0,0,1,2,0,2,1,2,0,0,1,1,0]
// 0=empty, 1=human(X), 2=AI(O)

const lines4 = [
  [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15], // rows
  [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15], // columns  
  [0,5,10,15], [3,6,9,12] // diagonals
]

console.log('=== TESTING HUMAN WINNING MOVES ===')

// Test moving X from position 5 to position 12
console.log('\n🧪 Testing move 5→12:')
const testBoard1 = [...board]
testBoard1[5] = 0  // Remove X from position 5
testBoard1[12] = 1 // Place X at position 12

console.log('New board after 5→12:', testBoard1)
console.log('Line [12,13,14,15]:', [testBoard1[12], testBoard1[13], testBoard1[14], testBoard1[15]])

// Check if this creates a 4-in-a-line win
const line12_15 = [12,13,14,15]
const pieces = line12_15.map(pos => testBoard1[pos])
if (pieces.every(p => p === 1)) {
  console.log('🏆 WIN! 4-in-a-line completed!')
} else {
  console.log('❌ Not a win. Pieces:', pieces)
}

// Test moving X from position 5 to position 15
console.log('\n🧪 Testing move 5→15:')
const testBoard2 = [...board]
testBoard2[5] = 0  // Remove X from position 5
testBoard2[15] = 1 // Place X at position 15

console.log('New board after 5→15:', testBoard2)
console.log('Line [12,13,14,15]:', [testBoard2[12], testBoard2[13], testBoard2[14], testBoard2[15]])

const pieces2 = line12_15.map(pos => testBoard2[pos])
if (pieces2.every(p => p === 1)) {
  console.log('🏆 WIN! 4-in-a-line completed!')
} else {
  console.log('❌ Not a win. Pieces:', pieces2)
}

// Test all possible human moves to position 12
console.log('\n=== ALL MOVES TO POSITION 12 ===')
const humanPieces = [5, 9, 13, 14]
for (const fromPos of humanPieces) {
  if (fromPos === 12) continue // Can't move to same position
  
  const testBoard = [...board]
  testBoard[fromPos] = 0  // Remove from original position
  testBoard[12] = 1      // Place at position 12
  
  const linePieces = [testBoard[12], testBoard[13], testBoard[14], testBoard[15]]
  console.log(`Move ${fromPos}→12: Line [12,13,14,15] = [${linePieces.join(',')}]`)
  
  if (linePieces.every(p => p === 1)) {
    console.log('  🏆 WINNING MOVE!')
  }
}

// Test all possible human moves to position 15  
console.log('\n=== ALL MOVES TO POSITION 15 ===')
for (const fromPos of humanPieces) {
  if (fromPos === 15) continue // Can't move to same position
  
  const testBoard = [...board]
  testBoard[fromPos] = 0  // Remove from original position
  testBoard[15] = 1      // Place at position 15
  
  const linePieces = [testBoard[12], testBoard[13], testBoard[14], testBoard[15]]
  console.log(`Move ${fromPos}→15: Line [12,13,14,15] = [${linePieces.join(',')}]`)
  
  if (linePieces.every(p => p === 1)) {
    console.log('  🏆 WINNING MOVE!')
  }
}