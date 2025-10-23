// Test winning detection logic

function checkForWinDetails(board, player) {
  console.log(`🔍 WIN CHECK: Checking for wins on board ${board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
  if (player) {
    console.log(`🎯 WIN CHECK: Looking specifically for player ${player}`)
  }
  
  // PRIMARY WIN CONDITION: 2x2 squares
  const squares2x2 = [
    [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
    [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
    [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
  ]
  
  for (const square of squares2x2) {
    for (const checkPlayer of [1, 2]) {
      if (player && checkPlayer !== player) continue
      if (square.every(pos => board[pos] === checkPlayer)) {
        console.log(`🏆 WIN FOUND: Player ${checkPlayer} has 2x2 square at positions ${square}`)
        return { winner: checkPlayer, type: '2x2 square', positions: square }
      }
    }
  }
  
  // SECONDARY WIN CONDITION: 4-in-a-line
  const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
    [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
  ]
  
  for (const line of lines) {
    for (const checkPlayer of [1, 2]) {
      if (player && checkPlayer !== player) continue
      if (line.every(pos => board[pos] === checkPlayer)) {
        console.log(`🏆 WIN FOUND: Player ${checkPlayer} has 4-in-a-line at positions ${line}`)
        return { winner: checkPlayer, type: '4-in-a-line', positions: line }
      }
    }
  }
  
  console.log(`❌ WIN CHECK: No win found`)
  return null
}

function findWinningMove(board, player, availableMoves, phase) {
  console.log(`🔍 GAMELOGIC: findWinningMove for player ${player} in ${phase} phase with ${availableMoves.length} moves`)
  console.log(`🎲 GAMELOGIC: Current board: ${board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
  
  if (phase === 'placement') {
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = player
      console.log(`🔍 GAMELOGIC: Testing placement at ${move}...`)
      console.log(`🎲 GAMELOGIC: Test board: ${testBoard.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
      
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        console.log(`🏆 WIN DETECTED: Player ${player} can win with ${winResult.type} at position ${move}`)
        console.log(`🎯 WINNING PATTERN: Positions ${winResult.positions}`)
        return move
      } else {
        console.log(`❌ No win at position ${move}`)
      }
    }
  } else if (phase === 'movement') {
    for (let i = 0; i < availableMoves.length; i++) {
      const movement = availableMoves[i]
      const testBoard = [...board]
      testBoard[movement.from] = 0
      testBoard[movement.to] = player
      
      console.log(`🔍 GAMELOGIC: Testing movement ${i+1}/${availableMoves.length}: ${movement.from}→${movement.to}`)
      console.log(`🎲 GAMELOGIC: Test board: ${testBoard.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
      
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        console.log(`🏆 WIN DETECTED: Player ${player} can win with ${winResult.type} by moving ${movement.from}→${movement.to}`)
        console.log(`🎯 Winning positions: ${winResult.positions}`)
        return movement
      } else {
        console.log(`❌ No win with move ${movement.from}→${movement.to}`)
      }
    }
  }
  
  console.log(`❌ GAMELOGIC: No winning move found for player ${player}`)
  return null
}

// TEST CASE 1: Simple 2x2 win detection
console.log('\n=== TEST 1: 2x2 Square Win Detection ===')
const board1 = [
  1, 1, 0, 0,
  1, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
]
const winningMove1 = findWinningMove(board1, 1, [5], 'placement')
console.log('Result:', winningMove1)

// TEST CASE 2: 4-in-a-line win
console.log('\n=== TEST 2: 4-in-a-line Win Detection ===')
const board2 = [
  1, 1, 1, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
]
const winningMove2 = findWinningMove(board2, 1, [3], 'placement')
console.log('Result:', winningMove2)

// TEST CASE 3: Movement win
console.log('\n=== TEST 3: Movement Win Detection ===')
const board3 = [
  1, 0, 1, 0,
  1, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0
]
const winningMove3 = findWinningMove(board3, 1, [{from: 2, to: 1}], 'movement')
console.log('Result:', winningMove3)