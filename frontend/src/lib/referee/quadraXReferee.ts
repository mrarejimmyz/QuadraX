// QuadraX Referee System
// Validates agent decisions and enforces game rules

import { checkWin, findWinningMove, findAllWinningMoves, findAllThreateningMoves, detectsMultiThreatSetup, preventsMultiThreatSetup, findCriticalBlockingPositions } from '../utils/quadraX/gameLogic'
import { scoreMove } from '../utils/quadraX/moveScoring'
import { callASIAlliance, parseASIResponse } from '../services/asiService'
import { QuadraXMasterStrategy } from './quadraXMasterStrategy'
import type { GamePosition, AgentDecision } from '../agents/asi-alliance/types'

/**
 * Check if two positions are adjacent (including diagonally)
 */
function isAdjacent(pos1: number, pos2: number): boolean {
  const row1 = Math.floor(pos1 / 4), col1 = pos1 % 4
  const row2 = Math.floor(pos2 / 4), col2 = pos2 % 4
  
  return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1 && pos1 !== pos2
}

/**
 * Validate agent decisions against QuadraX rules
 */
export function validateMove(
  move: number | { from: number; to: number },
  availableMoves: (number | { from: number; to: number })[],
  phase: 'placement' | 'movement'
): boolean {
  if (phase === 'placement') {
    const placementMove = move as number
    const placementMoves = availableMoves as number[]
    return placementMoves.includes(placementMove)
  } else {
    const movementMove = move as { from: number; to: number }
    const movementMoves = availableMoves as { from: number; to: number }[]
    return movementMoves.some(m => 
      m.from === movementMove.from && m.to === movementMove.to
    )
  }
}

/**
 * Referee agent that validates and provides winning moves
 */
export class QuadraXReferee {
  public readonly name = 'QuadraXReferee'
  public readonly type = 'referee'
  
  /**
   * 🧠 MASTER STRATEGY: Complete finite game analysis using predetermined patterns
   * This replaces reactive threat detection with proactive total board control
   */
  async getMasterStrategicMove(
    board: number[],
    player: number,
    availableMoves: (number | { from: number; to: number })[],
    phase: 'placement' | 'movement'
  ): Promise<{ move: number | { from: number; to: number }; reasoning: string } | null> {
    
    console.log('🧠 MASTER STRATEGY: Initiating complete finite game analysis...')
    console.log(`🎯 Player ${player}, Phase: ${phase}, Moves: ${availableMoves.length}`)
    
    const analysis = QuadraXMasterStrategy.analyzePosition({
      board,
      player,
      opponent: player === 1 ? 2 : 1,
      phase,
      availableMoves
    })
    
    console.log(`🔥 MASTER ANALYSIS: Urgency ${analysis.urgency}`)
    console.log(`💡 MASTER REASONING: ${analysis.reasoning}`)
    
    if (analysis.recommendedMove && analysis.recommendedMove.move !== undefined) {
      return {
        move: analysis.recommendedMove.move,
        reasoning: `MASTER STRATEGY: ${analysis.reasoning}`
      }
    }
    
    console.log('❌ MASTER STRATEGY: No strategic move identified')
    return null
  }
  
  /**
   * Find guaranteed winning moves using rule-based analysis
   */
  async findWinningMove(
    board: number[],
    player: number,
    availableMoves: (number | { from: number; to: number })[],
    phase: 'placement' | 'movement'
  ): Promise<{ move: number | { from: number; to: number }; reasoning: string } | null> {
    
    console.log('🏁 REFEREE: Checking for guaranteed winning moves...')
    console.log(`🎯 REFEREE: Player ${player}, Phase: ${phase}, Moves: ${availableMoves.length}`)
    console.log(`🎲 REFEREE: Board: ${board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
    if (phase === 'movement' && availableMoves.length > 0) {
      console.log(`🚀 REFEREE: Sample moves: ${JSON.stringify(availableMoves.slice(0, 3))}`)
    }
    
    const winningMove = findWinningMove(board, player, availableMoves as any, phase)
    
    if (winningMove !== null) {
      const reasoning = phase === 'placement' 
        ? `REFEREE WIN: Placement at position ${winningMove} completes winning pattern`
        : `REFEREE WIN: Movement ${(winningMove as any).from}→${(winningMove as any).to} creates winning position`
        
      console.log(`🏆 ${reasoning}`)
      return { move: winningMove, reasoning }
    }
    
    return null
  }
  
  /**
   * ENHANCED: Find almost-complete patterns that could lead to wins
   * This is the critical fix for preventing easy wins
   */
  private findAlmostCompletePatterns(
    board: number[],
    opponent: number,
    availableMoves: number[],
    phase: 'placement' | 'movement'
  ): { move: number; reasoning: string } | null {
    
    console.log(`🧩 PATTERN ANALYSIS: Checking almost-complete patterns for opponent ${opponent}`)
    
    // Define all possible 2x2 square patterns (primary win condition)
    const squares2x2 = [
      [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
      [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
      [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
    ]
    
    // Define all possible 4-in-a-line patterns (secondary win condition)
    const lines4 = [
      [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
      [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
      [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
    ]
    
    const allPatterns = [...squares2x2.map(p => ({ positions: p, type: '2x2 square' })), 
                        ...lines4.map(p => ({ positions: p, type: '4-in-a-line' }))]
    
    // Check each pattern for almost-complete formations
    for (const pattern of allPatterns) {
      const opponentPositions = pattern.positions.filter(pos => board[pos] === opponent)
      const emptyPositions = pattern.positions.filter(pos => board[pos] === 0)
      const otherPlayerPositions = pattern.positions.filter(pos => board[pos] !== 0 && board[pos] !== opponent)
      
      // Critical pattern: 3 out of 4 positions filled by opponent, 1 empty
      if (opponentPositions.length === 3 && emptyPositions.length === 1 && otherPlayerPositions.length === 0) {
        const threatPosition = emptyPositions[0]
        
        console.log(`🚨 CRITICAL PATTERN: Opponent has 3/4 of ${pattern.type} at ${pattern.positions}, missing position ${threatPosition}`)
        
        // Check if we can block this threat
        if (phase === 'placement' && availableMoves.includes(threatPosition)) {
          const reasoning = `BLOCKING CRITICAL PATTERN: Preventing opponent ${pattern.type} completion at position ${threatPosition} (3/4 complete: ${opponentPositions})`
          console.log(`🛡️ ${reasoning}`)
          return { move: threatPosition, reasoning }
        }
        
        // For movement phase, check if opponent can complete this pattern
        if (phase === 'movement') {
          const opponentPieces = board.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
          
          for (const opponentPiece of opponentPieces) {
            // Check if this piece can move to complete the pattern
            if (opponentPiece !== threatPosition && !pattern.positions.includes(opponentPiece)) {
              console.log(`🚨 MOVEMENT THREAT: Opponent piece at ${opponentPiece} can move to ${threatPosition} to complete ${pattern.type}`)
              
              // We need to place our piece at the threat position during placement
              if (availableMoves.includes(threatPosition)) {
                const reasoning = `BLOCKING MOVEMENT THREAT: Preventing opponent from completing ${pattern.type} by moving to position ${threatPosition}`
                console.log(`🛡️ ${reasoning}`)
                return { move: threatPosition, reasoning }
              }
            }
          }
        }
      }
      
      // Secondary pattern: 2 out of 4 positions filled, 2 empty (setup detection)
      if (opponentPositions.length === 2 && emptyPositions.length === 2 && otherPlayerPositions.length === 0) {
        // Check if opponent can complete this in one move by moving a piece
        const opponentPieces = board.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
        
        for (const emptyPos of emptyPositions) {
          for (const opponentPiece of opponentPieces) {
            // Check if opponent can move a piece to this empty position
            if (!pattern.positions.includes(opponentPiece)) {
              // This would create a 3/4 pattern - very dangerous
              if (availableMoves.includes(emptyPos) && Math.random() < 0.3) { // 30% chance to block setup
                const reasoning = `BLOCKING SETUP: Preventing opponent ${pattern.type} setup at position ${emptyPos} (currently 2/4: ${opponentPositions})`
                console.log(`🛡️ SETUP BLOCK: ${reasoning}`)
                return { move: emptyPos, reasoning }
              }
            }
          }
        }
      }
    }
    
    console.log(`✅ PATTERN ANALYSIS: No critical almost-complete patterns found`)
    return null
  }
  
  /**
   * Find critical blocking moves with enhanced pattern recognition
   */
  async findBlockingMove(
    board: number[],
    player: number,
    availableMoves: (number | { from: number; to: number })[],
    phase: 'placement' | 'movement'
  ): Promise<{ move: number | { from: number; to: number }; reasoning: string } | null> {
    
    console.log('🚨 REFEREE: Checking for critical opponent threats...')
    console.log(`🎯 REFEREE: Current player ${player}, opponent ${player === 1 ? 2 : 1}`)
    console.log(`🔍 REFEREE: Phase ${phase}, available moves: ${availableMoves.length}`)
    
    const opponent = player === 1 ? 2 : 1
    
    // ENHANCED: Check for almost-complete patterns first (critical fix)
    const criticalThreat = this.findAlmostCompletePatterns(board, opponent, availableMoves as number[], phase)
    if (criticalThreat) {
      console.log(`🚨 CRITICAL PATTERN THREAT: ${criticalThreat.reasoning}`)
      return criticalThreat
    }
    
    // ENHANCED: Use advanced critical blocking analysis for placement phase
    if (phase === 'placement') {
      const criticalPositions = findCriticalBlockingPositions(board, opponent, availableMoves as number[])
      if (criticalPositions.length > 0) {
        const topThreat = criticalPositions[0]
        if (topThreat.priority >= 150) { // High priority threshold
          const reasoning = `ENHANCED BLOCKING: ${topThreat.threats.join(', ')} - Priority: ${topThreat.priority}`
          console.log(`🛡️ ENHANCED BLOCK: ${reasoning}`)
          return { move: topThreat.position, reasoning }
        }
      }
    }
    
    // For movement phase, we need to generate opponent's possible moves, not use our moves!
    let opponentMoves: (number | { from: number; to: number })[]
    
    if (phase === 'movement') {
      // Generate opponent's possible movements
      const opponentPieces = board.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
      const emptySpaces = board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1)
      
      console.log(`🎯 REFEREE: Opponent pieces: ${opponentPieces}`)
      console.log(`🎯 REFEREE: Empty spaces: ${emptySpaces.slice(0, 5)}... (${emptySpaces.length} total)`)
      
      // CRITICAL FIX: Generate ALL opponent movements (not just winning ones)
      // We need to analyze all possible moves to detect threats and threatening moves
      const opponentMovements: { from: number, to: number }[] = []
      for (const piece of opponentPieces) {
        for (const empty of emptySpaces) {
          opponentMovements.push({ from: piece, to: empty })
        }
      }
      opponentMoves = opponentMovements
      console.log(`🎯 REFEREE: Opponent has ${opponentMoves.length} possible movements`)
    } else {
      // ENHANCED: For placement, use comprehensive threat analysis
      console.log('🔮 REFEREE: Enhanced threat analysis for placement phase...')
      
      // Standard placement threats
      const placementThreats = availableMoves as number[]
      
      // ENHANCED: Comprehensive movement threat detection
      const opponentPieces = board.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
      const futureMovementTargets: number[] = []
      const allEmptyPositions = board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1)
      
      console.log(`🔍 ENHANCED ANALYSIS: Opponent pieces: ${opponentPieces}`)
      console.log(`🔍 ENHANCED ANALYSIS: All empty positions: ${allEmptyPositions}`)
      
      // Check ALL empty positions as potential movement targets (not just available moves)
      for (const emptyPos of allEmptyPositions) {
        // Simulate opponent moving any of their pieces to this position
        for (const opponentPiece of opponentPieces) {
          const testBoard = [...board]
          testBoard[opponentPiece] = 0 // Remove opponent piece from original position
          testBoard[emptyPos] = opponent // Place opponent piece at target position
          
          if (checkWin(testBoard, opponent)) {
            console.log(`🔮 ENHANCED THREAT: Opponent can win by moving piece ${opponentPiece} → ${emptyPos}`)
            if (!futureMovementTargets.includes(emptyPos)) {
              futureMovementTargets.push(emptyPos)
            }
          }
        }
      }
      
      console.log(`🔮 REFEREE: Enhanced movement threats at positions: ${futureMovementTargets}`)
      
      // Only include movement targets that we can actually block during placement
      const blockableMovementTargets = futureMovementTargets.filter(pos => 
        (availableMoves as number[]).includes(pos)
      )
      
      console.log(`🛡️ REFEREE: Blockable movement threats: ${blockableMovementTargets}`)
      
      // Combine placement and blockable movement threats
      opponentMoves = [...placementThreats, ...blockableMovementTargets.map(pos => ({ from: -1, to: pos }))]
      console.log(`🎯 REFEREE: Total blockable threats: ${opponentMoves.length}`)
    }
    
    // ENHANCED MULTI-THREAT DETECTION using findAllWinningMoves AND findAllThreateningMoves
    const allOpponentThreats = findAllWinningMoves(board, opponent, opponentMoves as any, phase)
    const allOpponentThreateningMoves = findAllThreateningMoves(board, opponent, opponentMoves as any, phase)
    
    // Combine immediate wins and threatening moves for complete analysis
    const totalThreats = allOpponentThreats.length + allOpponentThreateningMoves.length
    
    if (totalThreats > 0) {
      console.log(`🚨🚨 COMPLETE THREAT ANALYSIS: Opponent has ${allOpponentThreats.length} winning moves + ${allOpponentThreateningMoves.length} threatening moves = ${totalThreats} total threats!`)
      
      // Log immediate winning threats
      allOpponentThreats.forEach((threat, index) => {
        console.log(`🚨 IMMEDIATE WIN ${index + 1}: ${typeof threat.move === 'number' ? `Position ${threat.move}` : `Move ${threat.move.from}→${threat.move.to}`} (${threat.winType})`)
      })
      
      // Log threatening moves (3/4 patterns)
      allOpponentThreateningMoves.forEach((threat, index) => {
        console.log(`🚨 THREATENING MOVE ${index + 1}: ${typeof threat.move === 'number' ? `Position ${threat.move}` : `Move ${threat.move.from}→${threat.move.to}`} creates ${threat.threatType} [${threat.positions.join(',')}] needs ${threat.needsPosition}`)
      })
      
      if (totalThreats >= 1) { // Check for any threats (immediate wins OR threatening moves)
        console.log(`🚨🚨 CRITICAL THREAT: Opponent has ${totalThreats} total threats (${allOpponentThreats.length} wins + ${allOpponentThreateningMoves.length} threatening moves)!`)
        
        // ENHANCED: For movement phase, we need different blocking strategy
        if (phase === 'movement') {
          // In movement phase, we must move to block opponent's winning target positions
          const criticalTargetPositions: number[] = []
          
          // Handle immediate winning moves
          allOpponentThreats.forEach(threat => {
            if (typeof threat.move === 'object' && 'to' in threat.move) {
              const targetPosition = threat.move.to
              if (!criticalTargetPositions.includes(targetPosition)) {
                criticalTargetPositions.push(targetPosition)
              }
              console.log(`🎯 IMMEDIATE THREAT: Opponent moving to position ${targetPosition} creates ${threat.winType}`)
            }
          })
          
          // Handle threatening moves (3/4 patterns) - block the position they need to complete
          allOpponentThreateningMoves.forEach(threat => {
            const needsPosition = threat.needsPosition
            if (!criticalTargetPositions.includes(needsPosition)) {
              criticalTargetPositions.push(needsPosition)
            }
            console.log(`🎯 THREATENING MOVE: Must block position ${needsPosition} to prevent ${threat.threatType} [${threat.positions.join(',')}]`)
          })
          
          // Find our pieces that can move to block these critical positions
          const ourPieces = availableMoves as { from: number, to: number }[]
          const blockingMoves = ourPieces.filter(move => 
            criticalTargetPositions.includes(move.to)
          )
          
          if (blockingMoves.length > 0) {
            const bestBlock = blockingMoves[0]
            const reasoning = `MOVEMENT BLOCK: Moving to position ${bestBlock.to} to prevent opponent ${allOpponentThreats[0].winType}`
            console.log(`🛡️ ${reasoning}`)
            return { move: bestBlock, reasoning }
          } else {
            console.log(`🚨 NO MOVEMENT BLOCKS AVAILABLE: Cannot reach critical positions ${criticalTargetPositions}`)
          }
        } else {
          // Original placement phase logic
          // First priority: Block immediate winning moves
          const blockableImmediateThreats = allOpponentThreats.filter(threat => {
            const placementMoves = availableMoves as number[]
            if (typeof threat.move === 'number') {
              return placementMoves.includes(threat.move)
            } else if (typeof threat.move === 'object' && 'to' in threat.move) {
              return placementMoves.includes(threat.move.to)
            }
            return false
          })
          
          // Second priority: Block threatening moves by placing at the position they need
          const blockableThreateningMoves = allOpponentThreateningMoves.filter(threat => {
            const placementMoves = availableMoves as number[]
            return placementMoves.includes(threat.needsPosition)
          })
          
          console.log(`🛡️ REFEREE: ${blockableImmediateThreats.length} immediate threats + ${blockableThreateningMoves.length} threatening moves can be blocked`)
          
          // Block immediate threats first
          if (blockableImmediateThreats.length > 0) {
            const threat = blockableImmediateThreats[0]
            const position = typeof threat.move === 'number' ? threat.move : threat.move.to
            const reasoning = `CRITICAL BLOCK: Preventing opponent immediate ${threat.winType} at position ${position}`
            console.log(`🛡️ ${reasoning}`)
            return { move: position, reasoning }
          }
          
          // Then block threatening moves
          if (blockableThreateningMoves.length > 0) {
            const threat = blockableThreateningMoves[0]
            const position = threat.needsPosition
            const reasoning = `THREAT BLOCK: Preventing opponent ${threat.threatType} [${threat.positions.join(',')}] by blocking position ${position}`
            console.log(`🛡️ ${reasoning}`)
            return { move: position, reasoning }
          }
        }
      }
      
      // Original multi-threat logic for complex scenarios
      if (allOpponentThreats.length >= 2) {
        console.log(`🚨🚨 MULTIPLE THREATS: Opponent has ${allOpponentThreats.length} ways to win - VERY DANGEROUS!`)
        
        // Strategy for multiple threats: Prioritize blocking based on threat type and accessibility
        const blockableThreats = allOpponentThreats.filter(threat => {
          if (phase === 'placement') {
            const placementMoves = availableMoves as number[]
            if (typeof threat.move === 'number') {
              return placementMoves.includes(threat.move)
            } else if (typeof threat.move === 'object' && 'to' in threat.move) {
              return placementMoves.includes(threat.move.to)
            }
          }
          return false
        })
        
        console.log(`🛡️ REFEREE: ${blockableThreats.length} of ${allOpponentThreats.length} threats can be blocked`)
        
        if (blockableThreats.length === 0) {
          console.log(`🚨🚨 GAME LOST: Cannot block any of the ${allOpponentThreats.length} opponent threats!`)
          // Still try to block the first threat as a last resort
          const firstThreat = allOpponentThreats[0]
          if (typeof firstThreat.move === 'number') {
            const reasoning = `DESPERATE BLOCK: Attempting to block one of ${allOpponentThreats.length} threats at position ${firstThreat.move}`
            console.log(`🛡️ ${reasoning}`)
            return { move: firstThreat.move, reasoning }
          }
        } else if (blockableThreats.length === 1) {
          console.log(`🛡️ SINGLE BLOCKABLE THREAT: Blocking the only threat we can prevent`)
          const threat = blockableThreats[0]
          const position = typeof threat.move === 'number' ? threat.move : threat.move.to
          const reasoning = `CRITICAL BLOCK: Preventing opponent ${threat.winType} (1 of ${allOpponentThreats.length} threats) at position ${position}`
          console.log(`🛡️ ${reasoning}`)
          return { move: position, reasoning }
        } else {
          console.log(`🛡️ MULTIPLE BLOCKABLE THREATS: Choosing best threat to block`)
          
          // Prioritize 2x2 squares over 4-in-a-line (more immediate threat in QuadraX)
          const squareThreats = blockableThreats.filter(t => t.winType.includes('2x2'))
          const lineThreats = blockableThreats.filter(t => t.winType.includes('4-in-a-line'))
          
          let chosenThreat = blockableThreats[0] // Default fallback
          
          if (squareThreats.length > 0) {
            console.log(`🎯 PRIORITIZING 2x2 SQUARE THREAT: More immediate than 4-in-a-line`)
            chosenThreat = squareThreats[0]
          } else if (lineThreats.length > 0) {
            chosenThreat = lineThreats[0]
          }
          
          const position = typeof chosenThreat.move === 'number' ? chosenThreat.move : chosenThreat.move.to
          const reasoning = `STRATEGIC BLOCK: Blocking ${chosenThreat.winType} threat at position ${position} (prioritized from ${blockableThreats.length} options)`
          console.log(`🛡️ ${reasoning}`)
          return { move: position, reasoning }
        }
      } else {
        // Single threat - block it normally
        const threat = allOpponentThreats[0]
        if (phase === 'placement') {
          const placementMoves = availableMoves as number[]
          
          if (typeof threat.move === 'number') {
            // Direct placement threat
            if (placementMoves.includes(threat.move)) {
              const reasoning = `REFEREE BLOCK: Preventing opponent ${threat.winType} win at position ${threat.move}`
              console.log(`🛡️ ${reasoning}`)
              return { move: threat.move, reasoning }
            }
          } else if (typeof threat.move === 'object' && 'to' in threat.move) {
            // Future movement threat - block the target position
            const targetPosition = threat.move.to
            if (placementMoves.includes(targetPosition)) {
              const reasoning = `FUTURE MOVEMENT BLOCK: Preventing opponent from moving to winning position ${targetPosition}`
              console.log(`🔮 ${reasoning}`)
              return { move: targetPosition, reasoning }
            }
          }
        }
      }
    }
    
    // Legacy single-threat detection (fallback)
    const opponentWinningMove = findWinningMove(board, opponent, opponentMoves as any, phase)
    
    if (opponentWinningMove !== null) {
      // Find move that blocks this threat
      if (phase === 'placement') {
        const placementMoves = availableMoves as number[]
        
        if (typeof opponentWinningMove === 'number') {
          // Direct placement threat
          if (placementMoves.includes(opponentWinningMove)) {
            const reasoning = `REFEREE BLOCK: Preventing opponent placement win at position ${opponentWinningMove}`
            console.log(`🛡️ ${reasoning}`)
            return { move: opponentWinningMove, reasoning }
          }
        } else if (typeof opponentWinningMove === 'object' && 'to' in opponentWinningMove) {
          // Future movement threat - block the target position
          const targetPosition = opponentWinningMove.to
          if (placementMoves.includes(targetPosition)) {
            const reasoning = `FUTURE MOVEMENT BLOCK: Preventing opponent from moving to winning position ${targetPosition}`
            console.log(`🔮 ${reasoning}`)
            return { move: targetPosition, reasoning }
          }
        }
      } else if (phase === 'movement' && typeof opponentWinningMove === 'object') {
        console.log(`🚨 REFEREE: Opponent can win with movement ${opponentWinningMove.from}→${opponentWinningMove.to}`)
        console.log(`🚨 REFEREE: This is CRITICAL - opponent has a winning move available!`)
        
        const movementMoves = availableMoves as { from: number; to: number }[]
        console.log(`🛡️ REFEREE: Checking ${movementMoves.length} defensive moves...`)
        console.log(`🛡️ REFEREE: Available AI moves: ${movementMoves.slice(0, 3).map(m => `${m.from}→${m.to}`).join(', ')}...`)
        
        // Find any move that can block the opponent's winning position
        for (let i = 0; i < movementMoves.length; i++) {
          const move = movementMoves[i]
          console.log(`🛡️ REFEREE: Testing defensive move ${i+1}/${movementMoves.length}: ${move.from}→${move.to}`)
          const testBoard = [...board]
          testBoard[move.from] = 0
          testBoard[move.to] = player
          
          // Re-generate opponent moves after our defensive move
          const newOpponentPieces = testBoard.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
          const newEmptySpaces = testBoard.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1)
          
          const newOpponentMovements: { from: number, to: number }[] = []
          for (const piece of newOpponentPieces) {
            for (const empty of newEmptySpaces) {
              // QuadraX Rule: Pieces can move to ANY empty position
              newOpponentMovements.push({ from: piece, to: empty })
            }
          }
          
          // Check if opponent can still win after our move
          const opponentStillWins = findWinningMove(testBoard, opponent, newOpponentMovements as any, 'movement')
          if (!opponentStillWins) {
            const reasoning = `REFEREE BLOCK: Movement ${move.from}→${move.to} prevents opponent victory`
            console.log(`🛡️ ${reasoning}`)
            return { move, reasoning }
          }
        }
        
        console.log(`⚠️ REFEREE: Could not find defensive move to block opponent win!`)
        
        // EMERGENCY: Try direct blocking - move our piece to target positions
        if (phase === 'movement') {
          console.log(`🚨 EMERGENCY BLOCKING: Attempting direct target blocking...`)
          const ourPieces = board.map((cell, index) => cell === player ? index : -1).filter(pos => pos !== -1)
          const emptySpaces = board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1)
          
          // Check opponent winning moves again and block their targets directly
          const opponentPieces = board.map((cell, index) => cell === opponent ? index : -1).filter(pos => pos !== -1)
          
          for (const opponentPiece of opponentPieces) {
            for (const targetPosition of emptySpaces) {
              const testBoard = [...board]
              testBoard[opponentPiece] = 0
              testBoard[targetPosition] = opponent
              
              if (checkWin(testBoard, opponent)) {
                // Opponent wins by moving to targetPosition - we must block it!
                console.log(`🚨 EMERGENCY: Player can win by moving ${opponentPiece}→${targetPosition}! Blocking position ${targetPosition}`)
                
                // Find our piece that can move to block this target
                for (const ourPiece of ourPieces) {
                  const blockingMove = { from: ourPiece, to: targetPosition }
                  const isValidMove = (availableMoves as any[]).find((m: any) => 
                    typeof m === 'object' && m.from === ourPiece && m.to === targetPosition
                  )
                  
                  if (isValidMove) {
                    const reasoning = `EMERGENCY BLOCK: Moving ${ourPiece}→${targetPosition} to prevent opponent win`
                    console.log(`🛡️ ${reasoning}`)
                    return { move: blockingMove, reasoning }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      console.log(`✅ REFEREE: No immediate opponent winning moves detected`)
      
      // CRITICAL: Check for multi-threat setups that opponent can create
      if (phase === 'placement') {
        console.log(`🚨 REFEREE: Checking for potential multi-threat setups...`)
        const placementMoves = availableMoves as number[]
        const opponent = player === 1 ? 2 : 1
        
        // Check if opponent can create unblockable multi-threats on their next turn
        for (const opponentMove of placementMoves) {
          if (detectsMultiThreatSetup(board, opponentMove, opponent)) {
            console.log(`🚨 CRITICAL: Opponent can create multi-threat at position ${opponentMove}!`)
            
            // Find our move that prevents this
            for (const ourMove of placementMoves) {
              if (ourMove !== opponentMove) {
                const testBoard = [...board]
                testBoard[ourMove] = player
                
                // Check if our move prevents the multi-threat
                if (!detectsMultiThreatSetup(testBoard, opponentMove, opponent)) {
                  const reasoning = `REFEREE MULTI-THREAT PREVENTION: Blocking position ${ourMove} to prevent opponent multi-threat setup at ${opponentMove}`
                  console.log(`🛡️ ${reasoning}`)
                  return { move: ourMove, reasoning }
                }
              }
            }
            
            // If we can't prevent it, at least take the critical position
            if (placementMoves.includes(opponentMove)) {
              const reasoning = `REFEREE EMERGENCY: Taking position ${opponentMove} to prevent multi-threat setup`
              console.log(`🚨 ${reasoning}`)
              return { move: opponentMove, reasoning }
            }
          }
        }
        
        console.log(`✅ REFEREE: No multi-threat setups detected`)
      }
    }
    
    return null
  }
  
  /**
   * Validate agent decision using ASI Alliance intelligence
   */
  async validateAgentDecision(
    decision: AgentDecision,
    gamePosition: GamePosition
  ): Promise<{ valid: boolean; confidence: number; reasoning: string }> {
    
    console.log(`🏁 REFEREE: Validating ${decision.agent} decision...`)
    
    // First check rule compliance
    const isValidMove = validateMove(
      decision.move, 
      gamePosition.possibleMoves, 
      gamePosition.phase
    )
    
    if (!isValidMove) {
      return {
        valid: false,
        confidence: 0,
        reasoning: `REFEREE VIOLATION: ${decision.agent} proposed invalid move`
      }
    }
    
    // Score the decision quality
    const moveScore = scoreMove(
      gamePosition.board,
      decision.move,
      gamePosition.currentPlayer,
      gamePosition.phase
    )
    
    // Use ASI to validate strategic quality
    try {
      const prompt = this.createValidationPrompt(decision, gamePosition, moveScore)
      const asiResponse = await callASIAlliance(prompt)
      const parsed = parseASIResponse(asiResponse, gamePosition)
      
      const confidence = Math.min(0.95, Math.max(0.1, parsed.confidence || 0.7))
      
      return {
        valid: true,
        confidence,
        reasoning: `REFEREE APPROVED: ${decision.agent} decision validated (score: ${moveScore})`
      }
    } catch (error) {
      console.error('🏁 REFEREE: ASI validation failed - Pure ASI system only')
      throw new Error(`ASI Alliance required for referee validation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Create ASI prompt for decision validation
   */
  private createValidationPrompt(
    decision: AgentDecision, 
    gamePosition: GamePosition,
    moveScore: number
  ): string {
    const { board, phase, possibleMoves } = gamePosition
    
    return `🏁 QUADRAX REFEREE - Decision Validation

**REFEREE MISSION**: Validate agent decision quality and strategic merit

**AGENT DECISION**: ${decision.agent} recommends ${typeof decision.move === 'object' ? `${decision.move.from}→${decision.move.to}` : decision.move}
**AGENT REASONING**: ${decision.reasoning}
**RULE SCORE**: ${moveScore}

**BOARD STATE**: [${board.join(',')}]
**PHASE**: ${phase}
**ALL OPTIONS**: ${possibleMoves.map((m: any) => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}

**REFEREE EVALUATION REQUIRED**:
- Is this decision strategically sound?
- Does it align with QuadraX winning principles?
- Are there obviously better alternatives?
- What is the confidence level in this decision?

**REFEREE JUDGMENT**:
Valid: [YES/NO]
Confidence: [0.0-1.0]
Assessment: [BRIEF STRATEGIC EVALUATION]

Provide your official referee validation!`
  }
}

/**
 * Get best move using multi-agent consensus with referee oversight
 */
export async function getRefereeValidatedMove(
  agentDecisions: AgentDecision[],
  gamePosition: GamePosition
): Promise<AgentDecision> {
  const referee = new QuadraXReferee()
  
  // Check for winning moves first
  const winningMove = await referee.findWinningMove(
    gamePosition.board,
    gamePosition.currentPlayer,
    gamePosition.possibleMoves,
    gamePosition.phase
  )
  
  if (winningMove) {
    return {
      move: winningMove.move,
      confidence: 1.0,
      reasoning: winningMove.reasoning,
      agent: 'QuadraXReferee',
      type: 'referee'
    }
  }
  
  // Check for critical blocks
  const blockingMove = await referee.findBlockingMove(
    gamePosition.board,
    gamePosition.currentPlayer,
    gamePosition.possibleMoves,
    gamePosition.phase
  )
  
  if (blockingMove) {
    return {
      move: blockingMove.move,
      confidence: 0.95,
      reasoning: blockingMove.reasoning,
      agent: 'QuadraXReferee',
      type: 'referee'
    }
  }
  
  // Validate agent decisions
  let bestDecision = agentDecisions[0]
  let highestConfidence = 0
  
  for (const decision of agentDecisions) {
    const validation = await referee.validateAgentDecision(decision, gamePosition)
    
    if (validation.valid && validation.confidence > highestConfidence) {
      highestConfidence = validation.confidence
      bestDecision = {
        ...decision,
        confidence: validation.confidence,
        reasoning: `${validation.reasoning}: ${decision.reasoning}`
      }
    }
  }
  
  return bestDecision
}

export default { QuadraXReferee, validateMove, getRefereeValidatedMove }