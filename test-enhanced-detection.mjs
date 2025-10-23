// Test the enhanced threat detection system
// This should now properly detect the human's threatening moves

import { findAllThreateningMoves, findAllWinningMoves } from './frontend/src/lib/utils/quadraX/gameLogic.js'

// Board state from the user logs: 0:· 1:O 2:· 3:· 4:· 5:X 6:O 7:· 8:O 9:X 10:O 11:· 12:· 13:X 14:X 15:·
const board = [0,2,0,0,0,1,2,0,2,1,2,0,0,1,1,0]
// 0=empty, 1=human(X), 2=AI(O)

console.log('=== TESTING ENHANCED THREAT DETECTION ===')
console.log('Board:', board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' '))

// Generate human movement options (X pieces can move to empty positions)
const humanPieces = [5, 9, 13, 14]
const emptySpaces = [0, 2, 3, 4, 7, 11, 12, 15]
const humanMovements = []

for (const fromPos of humanPieces) {
  for (const toPos of emptySpaces) {
    humanMovements.push({ from: fromPos, to: toPos })
  }
}

console.log(`\nHuman has ${humanMovements.length} possible movements`)

// Test findAllWinningMoves (should find 0 - immediate wins)
console.log('\n=== TESTING findAllWinningMoves ===')
const winningMoves = findAllWinningMoves(board, 1, humanMovements, 'movement')
console.log('Result:', winningMoves)

// Test findAllThreateningMoves (should find the threats!)
console.log('\n=== TESTING findAllThreateningMoves ===')
const threateningMoves = findAllThreateningMoves(board, 1, humanMovements, 'movement')
console.log('Result:', threateningMoves)

if (threateningMoves.length > 0) {
  console.log('\n🎉 SUCCESS! Enhanced threat detection is working!')
  threateningMoves.forEach((threat, index) => {
    console.log(`${index + 1}. Move ${threat.move.from}→${threat.move.to} creates ${threat.threatType} [${threat.positions.join(',')}] needs position ${threat.needsPosition}`)
  })
} else {
  console.log('\n❌ PROBLEM: No threats detected - this should find the 4-line threats!')
}

console.log('\n=== EXPECTED RESULTS ===')
console.log('Should detect moves 5→12, 5→15, 9→12, 9→15 creating 4-line threats at [12,13,14,15]')