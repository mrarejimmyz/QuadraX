// QuadraX Move Scoring System
// Advanced scoring algorithms for evaluating move quality

import { checkWin, createsFork, getAdjacentPositions, countThreats, detectsMultiThreatSetup, preventsMultiThreatSetup, checkForWinDetails } from './gameLogic'

/**
 * Score a move using aggressive QuadraX strategies
 */
export function scoreMove(
  board: number[], 
  move: number | { from: number; to: number }, 
  player: number, 
  phase: 'placement' | 'movement'
): number {
  let score = 0
  const pos = phase === 'placement' ? (move as number) : (move as { from: number; to: number }).to
  const opponent = player === 1 ? 2 : 1
  
  // AGGRESSIVE CENTER DOMINATION
  if ([5,6,9,10].includes(pos)) score += 8  // Massive center bonus
  if ([1,2,4,7,8,11,13,14].includes(pos)) score += 4  // Adjacent to center
  
  // T-FORMATION BUILDER: Prioritize positions that create multiple threat vectors
  const tFormationPositions = [
    [1,5,9,13], [2,6,10,14], // Vertical T-stems
    [4,5,6,7], [8,9,10,11], // Horizontal T-stems  
    [1,2,5,6], [6,7,10,11], [9,10,13,14], [5,6,9,10] // Central T-formations
  ]
  
  for (const tForm of tFormationPositions) {
    if (tForm.includes(pos)) {
      const playerPieces = tForm.filter(p => board[p] === player).length
      const emptySpots = tForm.filter(p => board[p] === 0).length
      const opponentPieces = tForm.filter(p => board[p] === opponent).length
      
      // Massive bonus for T-formations with no opponent interference
      if (opponentPieces === 0) {
        score += (playerPieces + 1) * 5 // Exponential T-formation bonus
      }
    }
  }
  
  // IMMEDIATE PRESSURE: Prioritize moves that force opponent responses
  let threatCount = 0
  const winPatterns = [
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15], // Horizontal
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15], // Vertical
    [0,5,10,15], [3,6,9,12], // Diagonal
    [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], // 2x2 top rows
    [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15] // 2x2 bottom rows
  ]
  
  for (const pattern of winPatterns) {
    if (pattern.includes(pos)) {
      const playerPieces = pattern.filter(p => board[p] === player).length
      const emptySpots = pattern.filter(p => board[p] === 0).length
      const opponentPieces = pattern.filter(p => board[p] === opponent).length
      
      // Scoring based on pattern completion potential
      if (opponentPieces === 0) { // No opponent interference
        if (playerPieces === 3 && emptySpots === 1) {
          score += 1000 // WINNING MOVE!
        } else if (playerPieces === 2 && emptySpots === 2) {
          score += 100 // Strong threat
          threatCount++
        } else if (playerPieces === 1 && emptySpots === 3) {
          score += 25 // Building threat
        }
      }
    }
  }
  
  // FORK CREATION BONUS: Moves that create multiple threats
  if (threatCount >= 2) score += 200 // Fork bonus
  
  // OPPONENT DISRUPTION: Block opponent progress
  let blockingBonus = 0
  for (const pattern of winPatterns) {
    if (pattern.includes(pos)) {
      const opponentPieces = pattern.filter(p => board[p] === opponent).length
      const emptySpots = pattern.filter(p => board[p] === 0).length
      
      // Block opponent threats
      if (opponentPieces === 3 && emptySpots === 1) {
        blockingBonus += 500 // Block immediate win
      } else if (opponentPieces === 2 && emptySpots === 2) {
        blockingBonus += 80 // Disrupt strong threat
      }
    }
  }
  score += blockingBonus
  
  // AGGRESSIVE POSITIONING: Edge vs corner vs center strategy
  if ([0,3,12,15].includes(pos)) score += 15 // Corner control
  if ([1,2,4,7,8,11,13,14].includes(pos)) score += 25 // Edge superiority
  
  // DENY CENTER EXPANSION: Prevent opponent center control
  if ([5,6,9,10].includes(pos)) {
    const opponentCenterControl = [5,6,9,10].filter(p => board[p] === opponent).length
    if (opponentCenterControl >= 1) score += 6 // Deny center expansion
  }
  
  // CRITICAL: MULTI-THREAT PREVENTION - Prevent unblockable opponent setups
  if (phase === 'placement') {
    // Check if this move directly blocks a position opponent needs for multi-threats
    let blocksOpponentMultiThreatSetup = false
    
    // Test: if opponent could place at this position, would it create multi-threats?
    const opponentMultiThreatTest = [...board]
    opponentMultiThreatTest[pos] = opponent
    
    let opponentWouldHaveThreats = 0
    for (let testPos = 0; testPos < 16; testPos++) {
      if (opponentMultiThreatTest[testPos] === 0) {
        const winTest = [...opponentMultiThreatTest]
        winTest[testPos] = opponent
        if (checkWin(winTest, opponent)) {
          opponentWouldHaveThreats++
        }
      }
    }
    
    if (opponentWouldHaveThreats >= 2) {
      blocksOpponentMultiThreatSetup = true
      score += 1200 // MASSIVE bonus for blocking multi-threat setup positions
      console.log(`🎯 SCORING: HUGE BONUS (+1200) for move ${pos} - blocks opponent multi-threat setup (${opponentWouldHaveThreats} threats prevented)`)
    }
    
    // Also check if our move allows opponent to create multi-threats elsewhere
    const testBoard = [...board]
    testBoard[pos] = player
    
    let allowsMultiThreat = false
    let maxOpponentThreats = 0
    
    for (let opponentPos = 0; opponentPos < 16; opponentPos++) {
      if (testBoard[opponentPos] === 0) {
        const opponentTestBoard = [...testBoard]
        opponentTestBoard[opponentPos] = opponent
        
        // Count opponent threats after their move
        let opponentThreats = 0
        for (let threatPos = 0; threatPos < 16; threatPos++) {
          if (opponentTestBoard[threatPos] === 0) {
            const winTestBoard = [...opponentTestBoard]
            winTestBoard[threatPos] = opponent
            if (checkWin(winTestBoard, opponent)) {
              opponentThreats++
            }
          }
        }
        
        if (opponentThreats >= 2) {
          allowsMultiThreat = true
          maxOpponentThreats = Math.max(maxOpponentThreats, opponentThreats)
        }
      }
    }
    
    if (allowsMultiThreat && !blocksOpponentMultiThreatSetup) {
      score -= 1500 // CATASTROPHIC penalty for allowing multi-threats
      console.log(`🚨 SCORING: CATASTROPHIC PENALTY (-1500) for move ${pos} - allows opponent ${maxOpponentThreats} winning threats`)
    } else if (!blocksOpponentMultiThreatSetup) {
      score += 100 // Bonus for not enabling multi-threats
      console.log(`✅ SCORING: Bonus (+100) for move ${pos} - prevents multi-threats`)
    }
  }
  
  return score
}

/**
 * Evaluate center control value
 */
export function evaluateCenterControl(board: number[], player: number): number {
  const centerPositions = [5, 6, 9, 10]
  const playerCenterPieces = centerPositions.filter(pos => board[pos] === player).length
  const opponent = player === 1 ? 2 : 1
  const opponentCenterPieces = centerPositions.filter(pos => board[pos] === opponent).length
  
  return (playerCenterPieces * 15) - (opponentCenterPieces * 10)
}

/**
 * Evaluate opponent pressure value
 */
export function evaluateOpponentPressure(board: number[], move: number): number {
  // Value moves that force opponent into difficult positions
  const adjacentPositions = getAdjacentPositions(move)
  let pressureValue = 0
  
  adjacentPositions.forEach(pos => {
    if (board[pos] === 1) { // Opponent piece nearby
      pressureValue += 25 // Creates local pressure
    }
  })
  
  return pressureValue
}

/**
 * Evaluate risk-taking value
 */
export function evaluateRiskTakingValue(board: number[], move: number): number {
  // Bonus for bold, potentially game-changing moves
  const edgePositions = [1, 2, 4, 7, 8, 11, 13, 14]
  const cornerPositions = [0, 3, 12, 15]
  
  if (cornerPositions.includes(move)) return 60 // High risk/reward
  if (edgePositions.includes(move)) return 30 // Medium risk
  return 10 // Safe move
}

/**
 * Evaluate flexibility value
 */
export function evaluateFlexibilityValue(board: number[], move: number): number {
  // How many future options does this move enable?
  const adjacentEmpty = getAdjacentPositions(move).filter(pos => board[pos] === 0).length
  return adjacentEmpty * 15
}

/**
 * Score movement moves specifically
 */
export function scoreMovement(
  board: number[], 
  movement: { from: number; to: number }, 
  player: number
): number {
  let score = 0
  
  // Base score from destination position
  score += scoreMove(board, movement.to, player, 'placement')
  
  // Penalty for leaving strategic positions
  const centerPositions = [5, 6, 9, 10]
  if (centerPositions.includes(movement.from)) {
    score -= 10 // Penalty for leaving center
  }
  
  // Bonus for creating threats through movement
  const testBoard = [...board]
  testBoard[movement.from] = 0
  testBoard[movement.to] = player
  
  const threatsAfter = countThreats(testBoard, player)
  const threatsBefore = countThreats(board, player)
  score += (threatsAfter - threatsBefore) * 50
  
  // Check if movement creates winning position
  if (checkWin(testBoard, player)) {
    score += 2000 // Winning move bonus
  }
  
  return score
}

export default {
  scoreMove,
  evaluateCenterControl,
  evaluateOpponentPressure,
  evaluateRiskTakingValue,
  evaluateFlexibilityValue,
  scoreMovement
}