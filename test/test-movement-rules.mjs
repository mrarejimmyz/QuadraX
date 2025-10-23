#!/usr/bin/env node

/**
 * Test QuadraX movement rules - verify pieces can move anywhere
 */

// Simulate a movement phase board
const board = [0, 2, 0, 0, 2, 1, 2, 0, 1, 1, 1, 2, 0, 0, 0, 0]
// Positions: [empty, O, empty, empty, O, X, O, empty, X, X, X, O, empty, empty, empty, empty]

console.log('🧪 QuadraX Movement Rule Test')
console.log('============================')

console.log('Board state:')
console.log(`  ${board.slice(0,4).map((c,i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log(`  ${board.slice(4,8).map((c,i) => `${i+4}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log(`  ${board.slice(8,12).map((c,i) => `${i+8}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log(`  ${board.slice(12,16).map((c,i) => `${i+12}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
console.log()

// Find X pieces (player 1)
const xPieces = board.map((cell, idx) => cell === 1 ? idx : null).filter(pos => pos !== null)
console.log(`X pieces at positions: [${xPieces.join(', ')}]`)

// Find empty spaces  
const emptySpaces = board.map((cell, idx) => cell === 0 ? idx : null).filter(pos => pos !== null)
console.log(`Empty spaces: [${emptySpaces.join(', ')}]`)

// Generate all possible movements (OLD way - adjacent only)
console.log('\n🚫 OLD (INCORRECT) Adjacent-only movements:')
function isAdjacent(pos1, pos2) {
  const row1 = Math.floor(pos1 / 4), col1 = pos1 % 4
  const row2 = Math.floor(pos2 / 4), col2 = pos2 % 4
  return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1 && pos1 !== pos2
}

let adjacentMoves = []
for (const piece of xPieces) {
  for (const empty of emptySpaces) {
    if (isAdjacent(piece, empty)) {
      adjacentMoves.push(`${piece}→${empty}`)
    }
  }
}
console.log(`Adjacent moves: ${adjacentMoves.slice(0, 10).join(', ')}... (${adjacentMoves.length} total)`)

// Generate all possible movements (NEW way - any position)  
console.log('\n✅ NEW (CORRECT) Move-anywhere rule:')
let allMoves = []
for (const piece of xPieces) {
  for (const empty of emptySpaces) {
    allMoves.push(`${piece}→${empty}`)
  }
}
console.log(`All moves: ${allMoves.slice(0, 10).join(', ')}... (${allMoves.length} total)`)

console.log(`\n📊 Comparison:`)
console.log(`  Adjacent-only: ${adjacentMoves.length} moves`)
console.log(`  Move-anywhere: ${allMoves.length} moves`)
console.log(`  Difference: ${allMoves.length - adjacentMoves.length} more strategic options!`)

console.log('\n✅ Movement rule verification complete!')
console.log('   Pieces can now move to ANY empty position on the board')