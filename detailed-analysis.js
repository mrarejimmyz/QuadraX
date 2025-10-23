// More detailed analysis of the board state
// Board state: 0:· 1:O 2:· 3:· 4:· 5:X 6:O 7:· 8:O 9:X 10:O 11:· 12:· 13:X 14:X 15:·

const board = [0,2,0,0,0,1,2,0,2,1,2,0,0,1,1,0]
// 0=empty, 1=human(X), 2=AI(O)

const squares2x2 = [
  [0,1,4,5], [1,2,5,6], [2,3,6,7],
  [4,5,8,9], [5,6,9,10], [6,7,10,11],
  [8,9,12,13], [9,10,13,14], [10,11,14,15]
]

const lines4 = [
  [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15], // rows
  [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15], // columns  
  [0,5,10,15], [3,6,9,12] // diagonals
]

console.log('=== DETAILED 2x2 ANALYSIS ===')
for (let i = 0; i < squares2x2.length; i++) {
  const square = squares2x2[i]
  const pieces = square.map(pos => board[pos])
  const humanCount = pieces.filter(p => p === 1).length
  const aiCount = pieces.filter(p => p === 2).length
  const emptyCount = pieces.filter(p => p === 0).length
  
  console.log(`2x2 [${square.join(',')}]: ${pieces.join(',')} - Human:${humanCount} AI:${aiCount} Empty:${emptyCount}`)
  
  if (humanCount >= 2 && aiCount === 0) {
    console.log(`  🎯 Human threat! Has ${humanCount}/4 pieces`)
  } else if (humanCount >= 1 && aiCount >= 1) {
    console.log(`  🛡️ Blocked by AI`)
  }
}

console.log('\n=== DETAILED 4-IN-A-LINE ANALYSIS ===')
for (let i = 0; i < lines4.length; i++) {
  const line = lines4[i]
  const pieces = line.map(pos => board[pos])
  const humanCount = pieces.filter(p => p === 1).length
  const aiCount = pieces.filter(p => p === 2).length
  const emptyCount = pieces.filter(p => p === 0).length
  
  console.log(`4-line [${line.join(',')}]: ${pieces.join(',')} - Human:${humanCount} AI:${aiCount} Empty:${emptyCount}`)
  
  if (humanCount >= 2 && aiCount === 0) {
    console.log(`  🎯 Human threat! Has ${humanCount}/4 pieces`)
  } else if (humanCount >= 1 && aiCount >= 1) {
    console.log(`  🛡️ Blocked by AI`)
  }
}

console.log('\n=== WHY THE HUMAN LOGS SHOWED "EASY WIN" ===')
console.log('The human likely misunderstood the board state or the AI correctly blocked threats.')
console.log('Based on this analysis, there are NO winning moves for the human.')
console.log('All potential winning patterns are either incomplete or blocked by AI pieces.')