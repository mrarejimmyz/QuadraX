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
        console.log(`🏆 WIN FOUND: Player ${checkPlayer} has 2x2 square at positions ${square}`)
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
        console.log(`🏆 WIN FOUND: Player ${checkPlayer} has 4-in-a-line at positions ${line}`)
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
  
  console.log(`🔍 GAMELOGIC: findWinningMove for player ${player} in ${phase} phase with ${availableMoves.length} moves`)
  
  if (phase === 'placement') {
    // Check each available placement position
    for (const move of availableMoves as number[]) {
      const testBoard = [...board]
      testBoard[move] = player
      
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        console.log(`🏆 WIN DETECTED: Player ${player} can win with ${winResult.type} at position ${move}`)
        console.log(`🎯 WINNING PATTERN: Positions ${winResult.positions}`)
        return move
      }
    }
  } else if (phase === 'movement') {
    // Check each possible movement
    const possibleMoves = availableMoves as { from: number; to: number }[]
    console.log(`🔄 GAMELOGIC: Checking ${possibleMoves.length} movement options for player ${player}`)
    
    for (let i = 0; i < possibleMoves.length; i++) {
      const movement = possibleMoves[i]
      const testBoard = [...board]
      testBoard[movement.from] = 0
      testBoard[movement.to] = player
      
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        console.log(`🏆 WIN DETECTED: Player ${player} can win with ${winResult.type} by moving ${movement.from}→${movement.to}`)
        console.log(`🎯 Winning positions: ${winResult.positions}`)
        return movement
      }
      
      // Log first few attempts for debugging
      if (i < 3) {
        console.log(`🔍 GAMELOGIC: Move ${i+1}: ${movement.from}→${movement.to} - No win detected`)
      }
    }
  }
  
  console.log(`❌ GAMELOGIC: No winning move found for player ${player}`)
  return null
}

/**
 * Find ALL winning moves for a player - critical for multi-threat detection
 */
export function findAllWinningMoves(
  board: number[], 
  player: number, 
  availableMoves: number[] | { from: number; to: number }[], 
  phase: 'placement' | 'movement'
): Array<{ move: number | { from: number; to: number }, winType: string, positions: number[] }> {
  
  console.log(`🚨 GAMELOGIC: findAllWinningMoves for player ${player} in ${phase} phase with ${availableMoves.length} moves`)
  
  const allWinningMoves: Array<{ move: number | { from: number; to: number }, winType: string, positions: number[] }> = []
  
  if (phase === 'placement') {
    // Check each available placement position
    for (const move of availableMoves as number[]) {
      const testBoard = [...board]
      testBoard[move] = player
      
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        allWinningMoves.push({
          move: move,
          winType: winResult.type,
          positions: winResult.positions
        })
        console.log(`🏆 WINNING OPTION ${allWinningMoves.length}: Player ${player} can win with ${winResult.type} at position ${move}`)
        console.log(`🎯 WINNING PATTERN: Positions ${winResult.positions}`)
      }
    }
  } else if (phase === 'movement') {
    // Check each possible movement
    const possibleMoves = availableMoves as { from: number; to: number }[]
    console.log(`🔄 GAMELOGIC: Checking ${possibleMoves.length} movement options for player ${player}`)
    
    for (let i = 0; i < possibleMoves.length; i++) {
      const movement = possibleMoves[i]
      const testBoard = [...board]
      testBoard[movement.from] = 0
      testBoard[movement.to] = player
      
      const winResult = checkForWinDetails(testBoard, player)
      if (winResult && winResult.winner === player) {
        allWinningMoves.push({
          move: movement,
          winType: winResult.type,
          positions: winResult.positions
        })
        console.log(`🏆 WINNING OPTION ${allWinningMoves.length}: Player ${player} can win with ${winResult.type} by moving ${movement.from}→${movement.to}`)
        console.log(`🎯 Winning positions: ${winResult.positions}`)
      }
    }
  }
  
  console.log(`🎯 GAMELOGIC: Found ${allWinningMoves.length} total winning moves for player ${player}`)
  return allWinningMoves
}

/**
 * CRITICAL: Find ALL threatening moves for a player - detects moves that create 3/4 patterns forcing wins
 * This is essential for movement phase threat detection 
 */
export function findAllThreateningMoves(
  board: number[], 
  player: number, 
  availableMoves: number[] | { from: number; to: number }[], 
  phase: 'placement' | 'movement'
): Array<{ move: number | { from: number; to: number }, threatType: string, positions: number[], needsPosition: number }> {
  
  console.log(`🎯 GAMELOGIC: findAllThreateningMoves for player ${player} in ${phase} phase with ${availableMoves.length} moves`)
  
  const allThreateningMoves: Array<{ move: number | { from: number; to: number }, threatType: string, positions: number[], needsPosition: number }> = []
  
  // Define all winning patterns
  const squares2x2 = [
    [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
    [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
    [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
  ]
  
  const lines4 = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
    [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
  ]
  
  if (phase === 'placement') {
    // Check each available placement position
    for (const move of availableMoves as number[]) {
      const testBoard = [...board]
      testBoard[move] = player
      
      // Check 2x2 patterns for 3/4 threats
      for (const square of squares2x2) {
        const pieces = square.map(pos => testBoard[pos])
        const playerCount = pieces.filter(p => p === player).length
        const opponentCount = pieces.filter(p => p === (player === 1 ? 2 : 1)).length
        const emptyCount = pieces.filter(p => p === 0).length
        
        if (playerCount === 3 && opponentCount === 0 && emptyCount === 1) {
          const needsPosition = square[pieces.indexOf(0)]
          allThreateningMoves.push({
            move: move,
            threatType: '2x2 threat',
            positions: square,
            needsPosition: needsPosition
          })
          console.log(`🚨 THREAT FOUND: Player ${player} placement at ${move} creates 2x2 threat [${square.join(',')}] needs ${needsPosition}`)
        }
      }
      
      // Check 4-in-a-line patterns for 3/4 threats
      for (const line of lines4) {
        const pieces = line.map(pos => testBoard[pos])
        const playerCount = pieces.filter(p => p === player).length
        const opponentCount = pieces.filter(p => p === (player === 1 ? 2 : 1)).length
        const emptyCount = pieces.filter(p => p === 0).length
        
        if (playerCount === 3 && opponentCount === 0 && emptyCount === 1) {
          const needsPosition = line[pieces.indexOf(0)]
          allThreateningMoves.push({
            move: move,
            threatType: '4-line threat',
            positions: line,
            needsPosition: needsPosition
          })
          console.log(`🚨 THREAT FOUND: Player ${player} placement at ${move} creates 4-line threat [${line.join(',')}] needs ${needsPosition}`)
        }
      }
    }
  } else if (phase === 'movement') {
    // Check each possible movement
    const possibleMoves = availableMoves as { from: number; to: number }[]
    console.log(`🔄 THREAT CHECK: Checking ${possibleMoves.length} movement options for player ${player}`)
    
    for (let i = 0; i < possibleMoves.length; i++) {
      const movement = possibleMoves[i]
      const testBoard = [...board]
      testBoard[movement.from] = 0
      testBoard[movement.to] = player
      
      // Check 2x2 patterns for 3/4 threats
      for (const square of squares2x2) {
        const pieces = square.map(pos => testBoard[pos])
        const playerCount = pieces.filter(p => p === player).length
        const opponentCount = pieces.filter(p => p === (player === 1 ? 2 : 1)).length
        const emptyCount = pieces.filter(p => p === 0).length
        
        if (playerCount === 3 && opponentCount === 0 && emptyCount === 1) {
          const needsPosition = square[pieces.indexOf(0)]
          allThreateningMoves.push({
            move: movement,
            threatType: '2x2 threat',
            positions: square,
            needsPosition: needsPosition
          })
          console.log(`🚨 MOVEMENT THREAT: Player ${player} move ${movement.from}→${movement.to} creates 2x2 threat [${square.join(',')}] needs ${needsPosition}`)
        }
      }
      
      // Check 4-in-a-line patterns for 3/4 threats
      for (const line of lines4) {
        const pieces = line.map(pos => testBoard[pos])
        const playerCount = pieces.filter(p => p === player).length
        const opponentCount = pieces.filter(p => p === (player === 1 ? 2 : 1)).length
        const emptyCount = pieces.filter(p => p === 0).length
        
        if (playerCount === 3 && opponentCount === 0 && emptyCount === 1) {
          const needsPosition = line[pieces.indexOf(0)]
          allThreateningMoves.push({
            move: movement,
            threatType: '4-line threat',
            positions: line,
            needsPosition: needsPosition
          })
          console.log(`🚨 MOVEMENT THREAT: Player ${player} move ${movement.from}→${movement.to} creates 4-line threat [${line.join(',')}] needs ${needsPosition}`)
        }
      }
    }
  }
  
  console.log(`🎯 THREAT ANALYSIS: Found ${allThreateningMoves.length} total threatening moves for player ${player}`)
  return allThreateningMoves
}

/**
 * ENHANCED: Find positions that would create multiple threats for the opponent
 * This helps identify critical blocking positions during placement phase
 */
export function findCriticalBlockingPositions(
  board: number[],
  opponent: number,
  availableMoves: number[]
): Array<{ position: number, threats: string[], priority: number }> {
  
  console.log(`🚨 CRITICAL BLOCKING: Analyzing threats for opponent ${opponent}`)
  
  const criticalPositions: Array<{ position: number, threats: string[], priority: number }> = []
  
  // Define all winning patterns
  const squares2x2 = [
    [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
    [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
    [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
  ]
  
  const lines4 = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
    [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
  ]
  
  // Check each available position
  for (const position of availableMoves) {
    const threats: string[] = []
    let priority = 0
    
    // Check if this position completes any pattern for the opponent
    const allPatterns = [
      ...squares2x2.map(p => ({ positions: p, type: '2x2 square', basePriority: 100 })),
      ...lines4.map(p => ({ positions: p, type: '4-in-a-line', basePriority: 90 }))
    ]
    
    for (const pattern of allPatterns) {
      if (pattern.positions.includes(position)) {
        const opponentCount = pattern.positions.filter(pos => board[pos] === opponent).length
        const emptyCount = pattern.positions.filter(pos => board[pos] === 0).length
        const blockedByUs = pattern.positions.filter(pos => board[pos] !== 0 && board[pos] !== opponent).length
        
        // Critical: 3 out of 4 positions filled by opponent
        if (opponentCount === 3 && emptyCount === 1 && blockedByUs === 0) {
          threats.push(`CRITICAL: Completes ${pattern.type} (3/4 filled)`)
          priority += pattern.basePriority + 50
        }
        
        // Important: 2 out of 4 positions filled by opponent
        else if (opponentCount === 2 && emptyCount === 2 && blockedByUs === 0) {
          threats.push(`SETUP: Prevents ${pattern.type} setup (2/4 filled)`)
          priority += pattern.basePriority + 20
        }
        
        // Also check if opponent could move here to create threats
        const opponentPieces = board.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
        for (const opponentPiece of opponentPieces) {
          if (!pattern.positions.includes(opponentPiece)) {
            // Opponent could move here to advance this pattern
            if (opponentCount >= 1) {
              threats.push(`MOVEMENT THREAT: Prevents movement to complete ${pattern.type}`)
              priority += pattern.basePriority + 10
            }
          }
        }
      }
    }
    
    if (threats.length > 0) {
      console.log(`🎯 CRITICAL POSITION ${position}: ${threats.length} threats, priority ${priority}`)
      criticalPositions.push({ position, threats, priority })
    }
  }
  
  // Sort by priority (highest first)
  criticalPositions.sort((a, b) => b.priority - a.priority)
  
  console.log(`🚨 FOUND ${criticalPositions.length} critical blocking positions`)
  if (criticalPositions.length > 0) {
    console.log(`🔥 TOP PRIORITY: Position ${criticalPositions[0].position} with priority ${criticalPositions[0].priority}`)
  }
  
  return criticalPositions
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

/**
 * CRITICAL: Check if opponent can create multiple simultaneous threats (unforkable position)
 * This prevents the AI from allowing "multiple win conditions" that can't all be blocked
 */
export function detectsMultiThreatSetup(board: number[], opponentMove: number, opponent: number): boolean {
  const testBoard = [...board]
  testBoard[opponentMove] = opponent
  
  // After opponent's move, count how many 1-move wins they would have
  let opponentWinOptions = 0
  
  for (let pos = 0; pos < 16; pos++) {
    if (testBoard[pos] === 0) {
      const winTestBoard = [...testBoard]
      winTestBoard[pos] = opponent
      if (checkWin(winTestBoard, opponent)) {
        opponentWinOptions++
      }
    }
  }
  
  console.log(`🚨 MULTI-THREAT DETECTION: Opponent move ${opponentMove} would create ${opponentWinOptions} win options`)
  
  // If opponent would have 2+ ways to win, that's unblockable
  return opponentWinOptions >= 2
}

/**
 * PREVENTIVE ANALYSIS: Check if allowing opponent to play at a position creates unblockable threats
 */
export function preventsMultiThreatSetup(board: number[], playerMove: number, player: number): boolean {
  const opponent = player === 1 ? 2 : 1
  
  // Test our move
  const testBoard = [...board]
  testBoard[playerMove] = player
  
  // Check if opponent can still create multi-threat after our move
  for (let opponentPos = 0; opponentPos < 16; opponentPos++) {
    if (testBoard[opponentPos] === 0) {
      if (detectsMultiThreatSetup(testBoard, opponentPos, opponent)) {
        return false // Our move doesn't prevent multi-threat setup
      }
    }
  }
  
  return true // Our move prevents opponent from creating multi-threats
}

export default {
  checkWin,
  findWinningMove,
  findAllWinningMoves,
  findAllThreateningMoves,
  createsFork,
  getWinningPatternsForPosition,
  countThreats,
  getAdjacentPositions,
  blocksOpponentThreat,
  detectsMultiThreatSetup,
  preventsMultiThreatSetup
}