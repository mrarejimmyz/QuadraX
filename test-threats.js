// Check for multi-move winning scenarios and missed patterns
const board = [0,2,0,0,0,1,2,0,2,1,2,0,0,1,1,0]

console.log('=== CHECKING FOR MULTI-THREAT SCENARIOS ===')

// The human's current position: X at 5,9,13,14
// Can they create a position where they threaten multiple wins?

const humanPieces = [5, 9, 13, 14]
const emptySpaces = [0, 2, 3, 4, 7, 11, 12, 15]

const lines4 = [
  [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15], // rows
  [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15], // columns  
  [0,5,10,15], [3,6,9,12] // diagonals
]

const squares2x2 = [
  [0,1,4,5], [1,2,5,6], [2,3,6,7],
  [4,5,8,9], [5,6,9,10], [6,7,10,11],
  [8,9,12,13], [9,10,13,14], [10,11,14,15]
]

// Function to check if a move creates multiple threats
function analyzeMove(fromPos, toPos) {
  const testBoard = [...board]
  testBoard[fromPos] = 0
  testBoard[toPos] = 1
  
  let threats = []
  
  // Check 4-in-a-line threats (3 out of 4 positions)
  for (const line of lines4) {
    const pieces = line.map(pos => testBoard[pos])
    const humanCount = pieces.filter(p => p === 1).length
    const aiCount = pieces.filter(p => p === 2).length
    const emptyCount = pieces.filter(p => p === 0).length
    
    if (humanCount === 3 && aiCount === 0 && emptyCount === 1) {
      const emptyPos = line[pieces.indexOf(0)]
      threats.push({ type: '4-line', pattern: line, needsPos: emptyPos })
    }
  }
  
  // Check 2x2 threats (3 out of 4 positions)
  for (const square of squares2x2) {
    const pieces = square.map(pos => testBoard[pos])
    const humanCount = pieces.filter(p => p === 1).length
    const aiCount = pieces.filter(p => p === 2).length
    const emptyCount = pieces.filter(p => p === 0).length
    
    if (humanCount === 3 && aiCount === 0 && emptyCount === 1) {
      const emptyPos = square[pieces.indexOf(0)]
      threats.push({ type: '2x2', pattern: square, needsPos: emptyPos })
    }
  }
  
  return threats
}

console.log('Analyzing all possible human moves for threats...\n')

for (const fromPos of humanPieces) {
  for (const toPos of emptySpaces) {
    const threats = analyzeMove(fromPos, toPos)
    if (threats.length > 0) {
      console.log(`🚨 Move ${fromPos}→${toPos} creates ${threats.length} threat(s):`)
      threats.forEach(threat => {
        console.log(`  - ${threat.type} pattern [${threat.pattern.join(',')}] needs position ${threat.needsPos}`)
      })
      
      if (threats.length > 1) {
        console.log(`  🔥 DOUBLE THREAT! AI cannot block both!`)
      }
    }
  }
}

// Special check: Can human move to position 12 and threaten to complete the line next turn?
console.log('\n=== SPECIAL CASE: POSITION 12 ANALYSIS ===')
const moveToPos12Threats = analyzeMove(5, 12) // Example: move from 5 to 12
if (moveToPos12Threats.length > 0) {
  console.log('Moving to position 12 creates threats:')
  moveToPos12Threats.forEach(threat => {
    console.log(`- ${threat.type} pattern [${threat.pattern.join(',')}] needs position ${threat.needsPos}`)
  })
} else {
  console.log('Moving to position 12 does not create immediate threats.')
}

console.log('\n=== CONCLUSION ===')
console.log('If no double threats are found, the AI is correctly blocking all winning moves.')
console.log('The human logs may be incorrect, or the game state may be different than expected.')