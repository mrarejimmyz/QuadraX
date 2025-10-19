// QuadraX Game Logic - Win Detection System
// Handles all win condition checking for 4x4 QuadraX with 2x2 squares

/**
 * Check if a player has won the game - CORRECTED QUADRAX RULES
 * Priority: 2x2 squares first, then 4-in-a-line
 */
export function checkWin(board: number[], player: number): boolean {
  return checkForWinDetails(board, player) !== null
}

/**
 * Check for win with details about the win type
 */
export function checkForWinDetails(board: number[], player?: number): { winner: number, type: string, positions: number[] } | null {
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
        return { winner: checkPlayer, type: '2x2 square', positions: square }
      }
    }
  }
  
  // SECONDARY WIN CONDITION: 4-in-a-line (rare with only 4 pieces each)
  const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
    [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
  ]
  
  for (const line of lines) {
    for (const checkPlayer of [1, 2]) {
      if (player && checkPlayer !== player) continue
      if (line.every(pos => board[pos] === checkPlayer)) {
        return { winner: checkPlayer, type: '4-in-a-line', positions: line }
      }
    }
  }
  
  return null
}

/**
 * Find winning move for a player using corrected QuadraX rules
 */
export function findWinningMove(
  board: number[], 
  player: number, 
  availableMoves: number[] | { from: number; to: number }[], 
  phase: 'placement' | 'movement'
): number | { from: number; to: number } | null {
  
  if (phase === 'placement') {
    // Check each available placement position
    for (const move of availableMoves as number[]) {
      const testBoard = [...board]
      testBoard[move] = player
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        console.log(`🏆 WIN DETECTED: Player ${player} can win with ${winResult.type} at position ${move}`)
        return move
      }
    }
  } else if (phase === 'movement') {
    // Check each possible movement
    const possibleMoves = availableMoves as { from: number; to: number }[]
    for (const movement of possibleMoves) {
      const testBoard = [...board]
      testBoard[movement.from] = 0
      testBoard[movement.to] = player
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        console.log(`🏆 WIN DETECTED: Player ${player} can win with ${winResult.type} by moving ${movement.from}→${movement.to}`)
        return movement
      }
    }
  }
  
  return null
}

/**
 * Check if a position creates multiple threats (fork)
 */
export function createsFork(board: number[], move: number, player: number): boolean {
  const testBoard = [...board]
  testBoard[move] = player
  
  // Count how many ways this player could win on the next move
  let winningMoves = 0
  for (let pos = 0; pos < 16; pos++) {
    if (testBoard[pos] === 0) {
      const forkTestBoard = [...testBoard]
      forkTestBoard[pos] = player
      if (checkWin(forkTestBoard, player)) {
        winningMoves++
      }
    }
  }
  
  return winningMoves >= 2 // Fork requires 2+ ways to win
}

/**
 * Get all winning patterns that include a specific position
 */
export function getWinningPatternsForPosition(position: number): number[][] {
  const allPatterns = [
    // Horizontal rows
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
    // Vertical columns  
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
    // Diagonals
    [0,5,10,15], [3,6,9,12],
    // 2x2 squares
    [0,1,4,5], [1,2,5,6], [2,3,6,7],
    [4,5,8,9], [5,6,9,10], [6,7,10,11],  
    [8,9,12,13], [9,10,13,14], [10,11,14,15]
  ]
  
  return allPatterns.filter(pattern => pattern.includes(position))
}

/**
 * Count threats for a player (patterns with 3 pieces and 1 empty)
 */
export function countThreats(board: number[], player: number): number {
  const patterns = [
    // Horizontal rows
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
    // Vertical columns  
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
    // Diagonals
    [0,5,10,15], [3,6,9,12],
    // 2x2 squares
    [0,1,4,5], [1,2,5,6], [2,3,6,7],
    [4,5,8,9], [5,6,9,10], [6,7,10,11],  
    [8,9,12,13], [9,10,13,14], [10,11,14,15]
  ]
  
  let threats = 0
  for (const pattern of patterns) {
    const playerPieces = pattern.filter(pos => board[pos] === player).length
    const emptySpaces = pattern.filter(pos => board[pos] === 0).length
    const opponentPieces = pattern.filter(pos => board[pos] !== player && board[pos] !== 0).length
    
    // Threat = 3 player pieces + 1 empty + 0 opponent pieces
    if (playerPieces === 3 && emptySpaces === 1 && opponentPieces === 0) {
      threats++
    }
  }
  
  return threats
}

/**
 * Get adjacent positions to a given position (including diagonals)
 */
export function getAdjacentPositions(position: number): number[] {
  const row = Math.floor(position / 4)
  const col = position % 4
  const adjacent: number[] = []
  
  // Check all 8 directions (including diagonals)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue // Skip self
      
      const newRow = row + dr
      const newCol = col + dc
      
      if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
        adjacent.push(newRow * 4 + newCol)
      }
    }
  }
  
  return adjacent
}

/**
 * Check if a move blocks an opponent threat
 */
export function blocksOpponentThreat(
  board: number[], 
  move: number, 
  player: number
): boolean {
  const opponent = player === 1 ? 2 : 1
  const opponentThreats = countThreats(board, opponent)
  
  // Test the move
  const testBoard = [...board]
  testBoard[move] = player
  const threatsAfterMove = countThreats(testBoard, opponent)
  
  return threatsAfterMove < opponentThreats
}

export default {
  checkWin,
  findWinningMove,
  createsFork,
  getWinningPatternsForPosition,
  countThreats,
  getAdjacentPositions,
  blocksOpponentThreat
}