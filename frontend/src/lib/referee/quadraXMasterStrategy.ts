// QuadraX Master Strategy - Complete Board Control System
// Treats QuadraX as a finite tactical puzzle, not an open strategic game

/**
 * COMPLETE QUADRAX ANALYSIS SYSTEM
 * Since each player has only 4 pieces and there are only 9 possible 2x2 wins,
 * we can calculate ALL possible outcomes and control critical positions
 */

// All possible 2x2 winning squares (PRIMARY WIN CONDITION)
const ALL_2x2_SQUARES = [
  [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
  [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
  [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
]

// All possible 4-in-a-line patterns (SECONDARY WIN CONDITION)
const ALL_4_LINES = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
  [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
]

// Critical positions that appear in multiple winning patterns
const CRITICAL_CONTROL_POSITIONS = [5, 6, 9, 10] // Center positions in most squares

interface QuadraXPosition {
  board: number[]
  player: number
  opponent: number
  phase: 'placement' | 'movement'
  availableMoves: (number | { from: number; to: number })[]
}

interface StrategicAnalysis {
  winningMoves: any[]
  criticalBlocks: any[]
  controlPositions: number[]
  humanWinScenarios: any[]
  aiWinScenarios: any[]
  recommendedMove: any
  reasoning: string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export class QuadraXMasterStrategy {
  
  /**
   * MASTER ANALYSIS: Complete position evaluation using finite game theory
   */
  static analyzePosition(position: QuadraXPosition): StrategicAnalysis {
    console.log('🧠 MASTER STRATEGY: Complete position analysis initiated')
    console.log(`🎯 Player ${position.player}, Phase: ${position.phase}`)
    console.log(`🎲 Board: ${position.board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
    
    // Step 1: Check for immediate wins
    const winningMoves = this.findAllWins(position)
    if (winningMoves.length > 0) {
      return {
        winningMoves,
        criticalBlocks: [],
        controlPositions: [],
        humanWinScenarios: [],
        aiWinScenarios: [],
        recommendedMove: winningMoves[0],
        reasoning: `IMMEDIATE WIN: ${winningMoves[0].reasoning}`,
        urgency: 'CRITICAL'
      }
    }
    
    // Step 2: Check for critical blocks (opponent can win next move)
    const criticalBlocks = this.findCriticalBlocks(position)
    if (criticalBlocks.length > 0) {
      // ENHANCED: Check if we're in a losing position due to multiple threats
      if (criticalBlocks.length > 1) {
        console.log(`🚨💀 MASTER ALERT: MULTIPLE IMMEDIATE THREATS - POSITION LIKELY LOST!`)
        console.log(`🔥 THREATS: ${criticalBlocks.map(b => b.reasoning).join(' | ')}`)
        
        // Try a desperate counter-attack
        const desperateCounter = this.findDesperateCounterAttack(position)
        if (desperateCounter) {
          return {
            winningMoves: [],
            criticalBlocks,
            controlPositions: [],
            humanWinScenarios: [],
            aiWinScenarios: [],
            recommendedMove: desperateCounter,
            reasoning: `DESPERATE COUNTER: ${desperateCounter.reasoning} (Position likely lost due to ${criticalBlocks.length} threats)`,
            urgency: 'CRITICAL'
          }
        }
      }
      
      return {
        winningMoves: [],
        criticalBlocks,
        controlPositions: [],
        humanWinScenarios: [],
        aiWinScenarios: [],
        recommendedMove: criticalBlocks[0],
        reasoning: `CRITICAL BLOCK: ${criticalBlocks[0].reasoning}`,
        urgency: 'CRITICAL'
      }
    }
    
    // Step 3: FINITE GAME ANALYSIS - Calculate all possible futures
    const humanWinScenarios = this.calculateOpponentWinScenarios(position)
    const aiWinScenarios = this.calculateOurWinScenarios(position)
    
    console.log(`🔥 FINITE ANALYSIS: Human has ${humanWinScenarios.length} potential win paths`)
    console.log(`💎 FINITE ANALYSIS: AI has ${aiWinScenarios.length} potential win paths`)
    
    // Step 4: Control position analysis
    const controlPositions = this.findCriticalControlPositions(position)
    
    // Step 5: Strategic move selection based on finite analysis
    const strategicMove = this.selectOptimalStrategicMove(position, humanWinScenarios, aiWinScenarios, controlPositions)
    
    return {
      winningMoves: [],
      criticalBlocks: [],
      controlPositions,
      humanWinScenarios,
      aiWinScenarios,
      recommendedMove: strategicMove,
      reasoning: strategicMove.reasoning,
      urgency: this.calculateUrgency(humanWinScenarios, aiWinScenarios)
    }
  }
  
  /**
   * Find all immediate winning moves
   */
  private static findAllWins(position: QuadraXPosition): any[] {
    const wins: any[] = []
    
    for (const move of position.availableMoves) {
      const testBoard = [...position.board]
      
      if (position.phase === 'placement') {
        testBoard[move as number] = position.player
      } else {
        const movement = move as { from: number; to: number }
        testBoard[movement.from] = 0
        testBoard[movement.to] = position.player
      }
      
      if (this.checkWin(testBoard, position.player)) {
        wins.push({
          move,
          reasoning: position.phase === 'placement' 
            ? `Position ${move} completes winning pattern`
            : `Movement ${(move as any).from}→${(move as any).to} creates win`
        })
      }
    }
    
    console.log(`🏆 MASTER: Found ${wins.length} immediate winning moves`)
    return wins
  }
  
  /**
   * Find all critical blocking moves (opponent wins next turn)
   * ENHANCED: Detect multiple simultaneous threats
   */
  private static findCriticalBlocks(position: QuadraXPosition): any[] {
    const blocks: any[] = []
    
    // Generate all possible opponent moves
    const opponentMoves = this.generateOpponentMoves(position)
    
    console.log(`🚨 MASTER: Checking ${opponentMoves.length} opponent moves for immediate wins`)
    
    // Track which positions opponent can win from
    const winningPositions = new Set<number>()
    const immediateWinMoves: any[] = []
    
    for (const opponentMove of opponentMoves) {
      const testBoard = [...position.board]
      
      if (position.phase === 'placement') {
        testBoard[opponentMove as number] = position.opponent
      } else {
        const movement = opponentMove as { from: number; to: number }
        testBoard[movement.from] = 0
        testBoard[movement.to] = position.opponent
      }
      
      if (this.checkWin(testBoard, position.opponent)) {
        // Opponent can win with this move - we must block it
        if (position.phase === 'placement') {
          // Block by placing our piece at that position
          if (position.availableMoves.includes(opponentMove)) {
            blocks.push({
              move: opponentMove,
              reasoning: `CRITICAL: Block opponent win at position ${opponentMove}`
            })
            winningPositions.add(opponentMove as number)
            immediateWinMoves.push(opponentMove)
          }
        } else {
          // Block by moving to the target position
          const movement = opponentMove as { from: number; to: number }
          const blockingMoves = (position.availableMoves as { from: number; to: number }[])
            .filter(ourMove => ourMove.to === movement.to)
          
          if (blockingMoves.length > 0) {
            blocks.push({
              move: blockingMoves[0],
              reasoning: `CRITICAL: Block opponent movement to position ${movement.to}`
            })
            winningPositions.add(movement.to)
            immediateWinMoves.push(movement)
          }
        }
      }
    }
    
    // CRITICAL CHECK: Multiple threat detection
    console.log(`🔍 THREAT ANALYSIS: Found ${blocks.length} critical blocks, ${winningPositions.size} unique winning positions`)
    
    if (winningPositions.size > 1) {
      console.log(`🚨🚨 MASTER ALERT: MULTIPLE THREATS DETECTED! Opponent has ${winningPositions.size} winning positions: [${Array.from(winningPositions).join(', ')}]`)
      console.log(`⚡ IMMEDIATE WIN MOVES: ${JSON.stringify(immediateWinMoves)}`)
      
      // If opponent has multiple ways to win, we're in a losing position
      // Prioritize the most critical block or try to create counter-threats
      if (blocks.length > 1) {
        console.log(`🔥 MASTER: Opponent has FORK/DOUBLE THREAT - cannot block all ${blocks.length} threats!`)
        
        // Try to find if we can create a counter-threat that forces opponent to respond
        const counterThreats = this.findCounterThreats(position)
        if (counterThreats.length > 0) {
          console.log(`⚔️ MASTER: Found ${counterThreats.length} counter-threats available`)
          return counterThreats // Return counter-threat instead of futile block
        } else {
          console.log(`💀 MASTER: No counter-threats available - position likely lost!`)
        }
      }
    } else if (blocks.length > 1) {
      console.log(`🚨 MULTIPLE BLOCKS NEEDED: ${blocks.length} different threats to block`)
      console.log(`🔥 THREATS: ${blocks.map(b => b.reasoning).join(' | ')}`)
    }
    
    console.log(`🛡️ MASTER: Found ${blocks.length} critical blocking moves`)
    return blocks
  }
  
  /**
   * ENHANCED: Find counter-threats when opponent has multiple threats
   */
  private static findCounterThreats(position: QuadraXPosition): any[] {
    const counterThreats: any[] = []
    
    console.log(`⚔️ MASTER: Searching for counter-threats...`)
    
    // Check if we can create an immediate win threat that forces opponent to block us
    for (const move of position.availableMoves) {
      const testBoard = [...position.board]
      
      if (position.phase === 'placement') {
        testBoard[move as number] = position.player
      } else {
        const movement = move as { from: number; to: number }
        testBoard[movement.from] = 0
        testBoard[movement.to] = position.player
      }
      
      // Check if this move creates a threat that opponent must block
      const threatValue = this.evaluateThreatLevel(testBoard, position.player, position.opponent)
      
      if (threatValue >= 0.8) { // High threat that opponent must respond to
        counterThreats.push({
          move,
          reasoning: `COUNTER-THREAT: Create forcing threat (threat level: ${threatValue.toFixed(2)})`
        })
        console.log(`⚔️ MASTER: Counter-threat found at ${JSON.stringify(move)} with threat level ${threatValue.toFixed(2)}`)
      }
    }
    
    return counterThreats
  }
  
  /**
   * Evaluate how threatening a position is (0.0 = no threat, 1.0 = immediate win)
   */
  private static evaluateThreatLevel(board: number[], player: number, opponent: number): number {
    let maxThreat = 0
    
    // Check each winning pattern
    ALL_2x2_SQUARES.forEach(square => {
      const playerPieces = square.filter(pos => board[pos] === player).length
      const opponentPieces = square.filter(pos => board[pos] === opponent).length
      const emptyPieces = square.filter(pos => board[pos] === 0).length
      
      if (opponentPieces === 0) { // We can still win this pattern
        if (playerPieces === 3 && emptyPieces === 1) {
          maxThreat = Math.max(maxThreat, 0.9) // One move from win
        } else if (playerPieces === 2 && emptyPieces === 2) {
          maxThreat = Math.max(maxThreat, 0.6) // Two moves from win
        }
      }
    })
    
    ALL_4_LINES.forEach(line => {
      const playerPieces = line.filter(pos => board[pos] === player).length
      const opponentPieces = line.filter(pos => board[pos] === opponent).length
      const emptyPieces = line.filter(pos => board[pos] === 0).length
      
      if (opponentPieces === 0) { // We can still win this pattern
        if (playerPieces === 3 && emptyPieces === 1) {
          maxThreat = Math.max(maxThreat, 0.85) // One move from win
        } else if (playerPieces === 2 && emptyPieces === 2) {
          maxThreat = Math.max(maxThreat, 0.5) // Two moves from win
        }
      }
    })
    
    return maxThreat
  }
  
  /**
   * FINITE ANALYSIS: Calculate all possible opponent win scenarios
   * Since opponent has limited pieces, enumerate all possibilities
   */
  private static calculateOpponentWinScenarios(position: QuadraXPosition): any[] {
    const scenarios: any[] = []
    
    // Get all opponent pieces
    const opponentPieces = position.board
      .map((cell, index) => cell === position.opponent ? index : -1)
      .filter(pos => pos !== -1)
    
    console.log(`🔍 MASTER: Opponent has ${opponentPieces.length} pieces at positions [${opponentPieces.join(', ')}]`)
    
    // For each possible winning pattern, check how close opponent is
    ALL_2x2_SQUARES.forEach((square, index) => {
      const opponentInSquare = square.filter(pos => position.board[pos] === position.opponent)
      const emptyInSquare = square.filter(pos => position.board[pos] === 0)
      const ourPiecesInSquare = square.filter(pos => position.board[pos] === position.player)
      
      // If opponent has pieces in this square and we don't control it
      if (opponentInSquare.length > 0 && ourPiecesInSquare.length === 0) {
        const movesNeeded = 4 - opponentInSquare.length
        
        scenarios.push({
          type: '2x2 square',
          pattern: square,
          currentPieces: opponentInSquare.length,
          movesNeeded,
          positions: square,
          emptyPositions: emptyInSquare,
          threat: movesNeeded <= 2 ? 'HIGH' : movesNeeded <= 3 ? 'MEDIUM' : 'LOW'
        })
        
        console.log(`🚨 OPPONENT SCENARIO: 2x2 square ${index} - has ${opponentInSquare.length}/4, needs ${movesNeeded} more`)
      }
    })
    
    return scenarios.filter(s => s.movesNeeded <= 3) // Only realistic scenarios
  }
  
  /**
   * Calculate our potential win scenarios
   */
  private static calculateOurWinScenarios(position: QuadraXPosition): any[] {
    const scenarios: any[] = []
    
    const ourPieces = position.board
      .map((cell, index) => cell === position.player ? index : -1)
      .filter(pos => pos !== -1)
    
    ALL_2x2_SQUARES.forEach((square, index) => {
      const ourPiecesInSquare = square.filter(pos => position.board[pos] === position.player)
      const emptyInSquare = square.filter(pos => position.board[pos] === 0)
      const opponentPiecesInSquare = square.filter(pos => position.board[pos] === position.opponent)
      
      // If we have pieces in this square and opponent doesn't control it
      if (ourPiecesInSquare.length > 0 && opponentPiecesInSquare.length === 0) {
        const movesNeeded = 4 - ourPiecesInSquare.length
        
        scenarios.push({
          type: '2x2 square',
          pattern: square,
          currentPieces: ourPiecesInSquare.length,
          movesNeeded,
          positions: square,
          emptyPositions: emptyInSquare,
          priority: movesNeeded <= 1 ? 'CRITICAL' : movesNeeded <= 2 ? 'HIGH' : 'MEDIUM'
        })
        
        console.log(`💎 OUR SCENARIO: 2x2 square ${index} - has ${ourPiecesInSquare.length}/4, needs ${movesNeeded} more`)
      }
    })
    
    return scenarios
  }
  
  /**
   * Find critical control positions that prevent multiple opponent wins
   */
  private static findCriticalControlPositions(position: QuadraXPosition): number[] {
    const positionValues: { [pos: number]: number } = {}
    
    // Calculate how many opponent win scenarios each empty position disrupts
    const emptyPositions = position.board
      .map((cell, index) => cell === 0 ? index : -1)
      .filter(pos => pos !== -1)
    
    emptyPositions.forEach(pos => {
      let disruptionValue = 0
      
      // Count how many 2x2 squares this position appears in where opponent has pieces
      ALL_2x2_SQUARES.forEach(square => {
        if (square.includes(pos)) {
          const opponentInSquare = square.filter(p => position.board[p] === position.opponent)
          const ourPiecesInSquare = square.filter(p => position.board[p] === position.player)
          
          // If opponent has pieces here and we don't control it, this position is valuable
          if (opponentInSquare.length > 0 && ourPiecesInSquare.length === 0) {
            disruptionValue += opponentInSquare.length * 10 // More valuable if opponent is closer
          }
        }
      })
      
      positionValues[pos] = disruptionValue
    })
    
    // Return positions sorted by disruption value
    const sortedPositions = Object.entries(positionValues)
      .sort(([,a], [,b]) => b - a)
      .map(([pos,]) => parseInt(pos))
      .slice(0, 5) // Top 5 control positions
    
    console.log(`🎯 MASTER: Critical control positions: ${sortedPositions.join(', ')}`)
    return sortedPositions
  }
  
  /**
   * Select optimal strategic move based on complete analysis
   */
  /**
   * ENHANCED Strategic move selection with multi-threat prevention
   */
  private static selectOptimalStrategicMove(
    position: QuadraXPosition, 
    humanScenarios: any[], 
    aiScenarios: any[], 
    controlPositions: number[]
  ): any {
    
    console.log(`🎯 STRATEGIC SELECTION: Evaluating ${position.availableMoves.length} possible moves`)
    
    // Priority 1: Advance our closest win scenario
    const criticalOurScenarios = aiScenarios.filter(s => s.priority === 'CRITICAL')
    if (criticalOurScenarios.length > 0) {
      const scenario = criticalOurScenarios[0]
      const nextPosition = scenario.emptyPositions[0]
      
      if (position.phase === 'placement' && position.availableMoves.includes(nextPosition)) {
        return {
          move: nextPosition,
          reasoning: `WINNING SETUP: Complete our 2x2 square (${scenario.currentPieces}/4) at position ${nextPosition}`
        }
      }
    }
    
    // Priority 2: PLACEMENT PHASE - Prevent dangerous 2x2 formations early
    if (position.phase === 'placement') {
      const formationPrevention = this.preventDangerous2x2Formations(position)
      if (formationPrevention) {
        console.log(`🚧 2x2 PREVENTION: ${formationPrevention.reasoning}`)
        return formationPrevention
      }
    }

    // Priority 3: ENHANCED - Filter out dangerous moves that create multi-threat setups
    console.log(`🔍 MULTI-THREAT ANALYSIS: Filtering out dangerous setup moves...`)
    
    const safeMoves: any[] = []
    const dangerousMoves: any[] = []
    
    for (const move of position.availableMoves) {
      // Simulate the move and check if opponent will have multiple threats afterwards
      const futureThreats = this.simulateOpponentThreatsAfterMove(position, move)
      
      if (futureThreats.immediateWins >= 2) {
        console.log(`🚨 CRITICAL SETUP DETECTED: Move ${JSON.stringify(move)} would give opponent ${futureThreats.immediateWins} immediate win options! - REJECTING`)
        dangerousMoves.push({ move, threats: futureThreats.immediateWins, type: 'CRITICAL' })
        continue // Skip this move completely
      }
      
      if (futureThreats.oneMoveThreat >= 3) {
        console.log(`🚨 DANGEROUS SETUP: Move ${JSON.stringify(move)} would give opponent ${futureThreats.oneMoveThreat} one-move-away threats! - REJECTING`)
        dangerousMoves.push({ move, threats: futureThreats.oneMoveThreat, type: 'DANGEROUS' })
        continue // Skip moves that create 3+ threats
      }
      
      if (futureThreats.oneMoveThreat >= 2) {
        console.log(`⚠️ RISKY SETUP: Move ${JSON.stringify(move)} would give opponent ${futureThreats.oneMoveThreat} one-move-away threats - marking as risky`)
        safeMoves.push({ move, riskLevel: 'HIGH', threats: futureThreats.oneMoveThreat })
      } else {
        safeMoves.push({ move, riskLevel: 'LOW', threats: futureThreats.oneMoveThreat })
      }
    }
    
    console.log(`🛡️ THREAT FILTERING: ${safeMoves.length} safe moves, ${dangerousMoves.length} dangerous moves rejected`)
    
    // If we have safe moves, continue with only those
    if (safeMoves.length > 0) {
      // Prefer low-risk moves if available
      const lowRiskMoves = safeMoves.filter(m => m.riskLevel === 'LOW')
      const filteredMoves = lowRiskMoves.length > 0 ? lowRiskMoves : safeMoves
      console.log(`✅ USING FILTERED MOVES: ${filteredMoves.length} moves (${lowRiskMoves.length} low-risk)`)
      
      // Update available moves to only include safe ones
      const safeMovesOnly = filteredMoves.map(m => m.move)
      
      // Find the best move among safe options by analyzing them with existing preventive logic
      const tempPosition = { ...position, availableMoves: safeMovesOnly }
      const safePreventiveMove = this.findPreventiveMove(tempPosition)
      if (safePreventiveMove) {
        console.log(`🛡️ SAFE PREVENTIVE MOVE: ${safePreventiveMove.reasoning}`)
        return safePreventiveMove
      }
      
      // If no specific preventive move, choose the lowest risk option
      const bestSafeMove = filteredMoves.sort((a, b) => a.threats - b.threats)[0]
      if (bestSafeMove) {
        console.log(`✅ SAFEST AVAILABLE: Move with ${bestSafeMove.threats} threat(s)`)
        return {
          move: bestSafeMove.move,
          reasoning: `THREAT-FILTERED MOVE: Safest available option (${bestSafeMove.threats} potential threats)`
        }
      }
    } else {
      console.log(`💀 NO SAFE MOVES AVAILABLE: All moves create dangerous setups - using least dangerous`)
    }
    
    // Priority 3: Find moves that PREVENT opponent multi-threat setups
    const preventiveMove = this.findPreventiveMove(position)
    if (preventiveMove) {
      console.log(`🛡️ PREVENTIVE MOVE FOUND: ${preventiveMove.reasoning}`)
      return preventiveMove
    }
    
    // Priority 4: Block opponent's most dangerous scenario
    const dangerousHumanScenarios = humanScenarios.filter(s => s.threat === 'HIGH')
    if (dangerousHumanScenarios.length > 0) {
      const scenario = dangerousHumanScenarios[0]
      const blockPosition = scenario.emptyPositions[0]
      
      if (position.phase === 'placement' && position.availableMoves.includes(blockPosition)) {
        return {
          move: blockPosition,
          reasoning: `PREVENT SETUP: Block opponent 2x2 square (${scenario.currentPieces}/4) at position ${blockPosition}`
        }
      }
    }
    
    // Priority 5: Control critical positions
    const availableControlPositions = controlPositions.filter(pos => 
      position.phase === 'placement' ? position.availableMoves.includes(pos) : false
    )
    
    if (availableControlPositions.length > 0) {
      return {
        move: availableControlPositions[0],
        reasoning: `STRATEGIC CONTROL: Occupy critical position ${availableControlPositions[0]} (disrupts multiple opponent scenarios)`
      }
    }
    
    // Priority 6: STRATEGIC POSITION CONTROL - After all critical analysis
    console.log(`🏰 NO CRITICAL MOVES: Applying strategic positioning system...`)
    const strategicMove = this.evaluateStrategicPositioning(position)
    if (strategicMove && strategicMove.priority !== 'LOW') {
      console.log(`🏰 STRATEGIC CONTROL: ${strategicMove.reasoning}`)
      return strategicMove
    }
    
    // Fallback: Use safest available move
    const safestMove = this.findSafestMove(position)
    return safestMove || {
      move: position.availableMoves[0],
      reasoning: 'FALLBACK: No critical moves identified, using first available'
    }
  }
  
  /**
   * NEW: Simulate what threats opponent would have after our move
   */
  private static simulateOpponentThreatsAfterMove(
    position: QuadraXPosition, 
    ourMove: number | { from: number; to: number }
  ): { immediateWins: number; oneMoveThreat: number } {
    
    // Simulate making our move
    const testBoard = [...position.board]
    if (position.phase === 'placement') {
      testBoard[ourMove as number] = position.player
    } else {
      const movement = ourMove as { from: number; to: number }
      testBoard[movement.from] = 0
      testBoard[movement.to] = position.player
    }
    
    // Now check what threats opponent would have
    const opponentMoves = this.generateOpponentMoves({
      ...position,
      board: testBoard
    })
    
    let immediateWins = 0
    const oneMoveThreatPatterns = new Set<string>()
    
    for (const opponentMove of opponentMoves) {
      const futureBoard = [...testBoard]
      
      if (position.phase === 'placement') {
        futureBoard[opponentMove as number] = position.opponent
      } else {
        const movement = opponentMove as { from: number; to: number }
        futureBoard[movement.from] = 0
        futureBoard[movement.to] = position.opponent
      }
      
      // Check if opponent wins immediately
      if (this.checkWin(futureBoard, position.opponent)) {
        immediateWins++
      } else {
        // Check if opponent is one move away from winning
        const threatsAfter = this.countOneMoveThreatPatterns(futureBoard, position.opponent)
        threatsAfter.forEach(pattern => oneMoveThreatPatterns.add(pattern))
      }
    }
    
    return {
      immediateWins,
      oneMoveThreat: oneMoveThreatPatterns.size
    }
  }
  
  /**
   * NEW: Find moves that prevent opponent from creating multi-threat setups
   */
  private static findPreventiveMove(position: QuadraXPosition): any | null {
    console.log(`🛡️ PREVENTIVE ANALYSIS: Searching for setup-blocking moves...`)
    
    // Look for key positions that would prevent opponent from creating forks
    const criticalPreventionPositions: number[] = []
    
    // Check each winning pattern to see if opponent is close to controlling it
    ALL_2x2_SQUARES.forEach((square, index) => {
      const opponentPieces = square.filter(pos => position.board[pos] === position.opponent).length
      const emptyPieces = square.filter(pos => position.board[pos] === 0)
      const ourPieces = square.filter(pos => position.board[pos] === position.player).length
      
      // If opponent has 2 pieces in a square and we have none, they're setting up a threat
      if (opponentPieces === 2 && ourPieces === 0 && emptyPieces.length === 2) {
        console.log(`🚨 PREVENTION TARGET: Square ${index} - opponent has 2/4 pieces, empty at [${emptyPieces.join(', ')}]`)
        // Add empty positions as critical prevention targets
        criticalPreventionPositions.push(...emptyPieces)
      }
      
      // If opponent has 1 piece and controls center, they might be setting up multiple patterns
      if (opponentPieces === 1 && ourPieces === 0) {
        const centerPositions = square.filter(pos => CRITICAL_CONTROL_POSITIONS.includes(pos))
        if (centerPositions.some(pos => position.board[pos] === position.opponent)) {
          criticalPreventionPositions.push(...emptyPieces)
        }
      }
    })
    
    // Find available moves that hit these prevention targets
    const availablePreventionMoves = criticalPreventionPositions.filter(pos => {
      if (position.phase === 'placement') {
        return position.availableMoves.includes(pos)
      } else {
        return (position.availableMoves as { from: number; to: number }[])
          .some(move => move.to === pos)
      }
    })
    
    if (availablePreventionMoves.length > 0) {
      const preventionTarget = availablePreventionMoves[0]
      
      if (position.phase === 'placement') {
        return {
          move: preventionTarget,
          reasoning: `MULTI-THREAT PREVENTION: Block opponent setup at position ${preventionTarget}`
        }
      } else {
        const preventionMove = (position.availableMoves as { from: number; to: number }[])
          .find(move => move.to === preventionTarget)
        
        if (preventionMove) {
          return {
            move: preventionMove,
            reasoning: `MULTI-THREAT PREVENTION: Move to position ${preventionTarget} to block opponent setup`
          }
        }
      }
    }
    
    return null
  }
  
  /**
   * NEW: Count how many patterns opponent is one move away from winning
   */
  private static countOneMoveThreatPatterns(board: number[], player: number): string[] {
    const patterns: string[] = []
    
    ALL_2x2_SQUARES.forEach((square, index) => {
      const playerPieces = square.filter(pos => board[pos] === player).length
      const emptyPieces = square.filter(pos => board[pos] === 0).length
      
      if (playerPieces === 3 && emptyPieces === 1) {
        patterns.push(`2x2_${index}`)
      }
    })
    
    ALL_4_LINES.forEach((line, index) => {
      const playerPieces = line.filter(pos => board[pos] === player).length
      const emptyPieces = line.filter(pos => board[pos] === 0).length
      
      if (playerPieces === 3 && emptyPieces === 1) {
        patterns.push(`4line_${index}`)
      }
    })
    
    return patterns
  }
  
  /**
   * NEW: Find the safest move that doesn't create opponent opportunities
   */
  private static findSafestMove(position: QuadraXPosition): any | null {
    let bestMove = null
    let lowestThreatScore = Infinity
    
    for (const move of position.availableMoves) {
      const futureThreats = this.simulateOpponentThreatsAfterMove(position, move)
      const threatScore = futureThreats.immediateWins * 10 + futureThreats.oneMoveThreat
      
      if (threatScore < lowestThreatScore) {
        lowestThreatScore = threatScore
        bestMove = {
          move,
          reasoning: `SAFEST MOVE: Minimizes opponent threats (score: ${threatScore})`
        }
      }
    }
    
    return bestMove
  }
  
  /**
   * NEW: Find a desperate counter-attack when in a losing position
   */
  private static findDesperateCounterAttack(position: QuadraXPosition): any | null {
    console.log(`💀 DESPERATE COUNTER: Searching for last-chance moves...`)
    
    // Look for any move that creates an immediate win threat
    for (const move of position.availableMoves) {
      const testBoard = [...position.board]
      
      if (position.phase === 'placement') {
        testBoard[move as number] = position.player
      } else {
        const movement = move as { from: number; to: number }
        testBoard[movement.from] = 0
        testBoard[movement.to] = position.player
      }
      
      // Check if this creates an immediate win threat that opponent must respond to
      const threatLevel = this.evaluateThreatLevel(testBoard, position.player, position.opponent)
      
      if (threatLevel >= 0.85) {
        return {
          move,
          reasoning: `LAST CHANCE: Create immediate threat (level: ${threatLevel.toFixed(2)}) - force opponent to block`
        }
      }
    }
    
    console.log(`💀 DESPERATE: No viable counter-attacks found`)
    return null
  }
  
  /**
   * Generate all possible opponent moves
   */
  private static generateOpponentMoves(position: QuadraXPosition): (number | { from: number; to: number })[] {
    if (position.phase === 'placement') {
      // All empty positions
      return position.board
        .map((cell, index) => cell === 0 ? index : -1)
        .filter(pos => pos !== -1)
    } else {
      // All possible movements for opponent pieces
      const opponentPieces = position.board
        .map((cell, index) => cell === position.opponent ? index : -1)
        .filter(pos => pos !== -1)
      
      const emptyPositions = position.board
        .map((cell, index) => cell === 0 ? index : -1)
        .filter(pos => pos !== -1)
      
      const moves: { from: number; to: number }[] = []
      opponentPieces.forEach(piece => {
        emptyPositions.forEach(empty => {
          moves.push({ from: piece, to: empty })
        })
      })
      
      return moves
    }
  }
  
  /**
   * Calculate urgency level
   */
  private static calculateUrgency(humanScenarios: any[], aiScenarios: any[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highThreatHuman = humanScenarios.filter(s => s.threat === 'HIGH').length
    const criticalOur = aiScenarios.filter(s => s.priority === 'CRITICAL').length
    
    if (criticalOur > 0) return 'CRITICAL'
    if (highThreatHuman > 1) return 'HIGH'
    if (highThreatHuman > 0) return 'MEDIUM'
    return 'LOW'
  }
  
  /**
   * NEW: Prevent dangerous 2x2 formations during placement phase
   */
  private static preventDangerous2x2Formations(position: QuadraXPosition): any {
    console.log(`🚧 FORMATION ANALYSIS: Scanning for dangerous 2x2 setups to prevent...`)
    
    // ENHANCED: Check for potential fork scenarios early
    const forkPrevention = this.preventForkSetups(position)
    if (forkPrevention) {
      return forkPrevention
    }
    
    // Check each 2x2 square for opponent control/threat level
    for (const square of ALL_2x2_SQUARES) {
      const opponentPieces = square.filter(pos => position.board[pos] === position.opponent).length
      const ourPieces = square.filter(pos => position.board[pos] === position.player).length  
      const emptySpaces = square.filter(pos => position.board[pos] === 0)
      
      // CRITICAL: If opponent has 2+ pieces in a 2x2 and there are empty spaces, we must contest
      if (opponentPieces >= 2 && ourPieces === 0 && emptySpaces.length > 0) {
        const contestPosition = emptySpaces.find(pos => position.availableMoves.includes(pos))
        if (contestPosition !== undefined) {
          console.log(`🚨 DANGEROUS 2x2 DETECTED: Opponent has ${opponentPieces} pieces in square ${square}, contesting at ${contestPosition}`)
          return {
            move: contestPosition,
            reasoning: `CRITICAL 2x2 CONTEST: Opponent has ${opponentPieces} pieces in 2x2 square, must contest at position ${contestPosition}`
          }
        }
      }
      
      // HIGH: If opponent has 1 piece and we have none, consider blocking strategic positions
      if (opponentPieces === 1 && ourPieces === 0 && emptySpaces.length >= 3) {
        // Focus on center positions of 2x2 squares (most valuable)
        const centerPositions = [5, 6, 9, 10] // Center 2x2 is most dangerous
        const contestPosition = emptySpaces.find(pos => 
          centerPositions.includes(pos) && position.availableMoves.includes(pos)
        )
        if (contestPosition !== undefined) {
          console.log(`⚠️ EARLY 2x2 CONTEST: Preventing opponent center control at ${contestPosition}`)
          return {
            move: contestPosition,
            reasoning: `2x2 CENTER CONTEST: Prevent opponent from dominating center 2x2 formation at position ${contestPosition}`
          }
        }
      }
    }
    
    return null
  }

  /**
   * NEW: Prevent potential fork setups during placement
   */
  private static preventForkSetups(position: QuadraXPosition): any {
    console.log(`🍴 FORK PREVENTION: Analyzing potential multi-threat setups...`)
    
    // Get opponent pieces
    const opponentPieces = position.board
      .map((cell, index) => cell === position.opponent ? index : -1)
      .filter(pos => pos !== -1)
    
    // If opponent has 3+ pieces, check for potential fork formations
    if (opponentPieces.length >= 3) {
      console.log(`🍴 FORK ANALYSIS: Opponent has ${opponentPieces.length} pieces at [${opponentPieces.join(', ')}]`)
      
      // Check each available move to see if it prevents multiple future threats
      const criticalPositions = this.findCriticalAntiJorkPositions(position, opponentPieces)
      
      if (criticalPositions.length > 0) {
        const bestPosition = criticalPositions[0]
        if (position.availableMoves.includes(bestPosition)) {
          console.log(`🍴 CRITICAL FORK PREVENTION: Blocking setup at position ${bestPosition}`)
          return {
            move: bestPosition,
            reasoning: `FORK PREVENTION: Block opponent multi-threat setup at position ${bestPosition}`
          }
        }
      }
    }
    
    return null
  }

  /**
   * Find positions that prevent opponent from creating multiple threats
   */
  private static findCriticalAntiJorkPositions(position: QuadraXPosition, opponentPieces: number[]): number[] {
    const criticalPositions: number[] = []
    
    // For each empty position, simulate placing our piece there
    const emptyPositions = position.board
      .map((cell, index) => cell === 0 ? index : -1)
      .filter(pos => pos !== -1)
    
    for (const testPos of emptyPositions) {
      if (!position.availableMoves.includes(testPos)) continue
      
      // Simulate placing our piece at this position
      const testBoard = [...position.board]
      testBoard[testPos] = position.player
      
      // Count how many different ways opponent could win from this position
      let threatsBlocked = 0
      
      // Check 2x2 squares that include this position
      for (const square of ALL_2x2_SQUARES) {
        if (square.includes(testPos)) {
          const opponentInSquare = square.filter(pos => opponentPieces.includes(pos)).length
          if (opponentInSquare >= 1) {
            threatsBlocked++
          }
        }
      }
      
      // Check 4-in-a-line formations that include this position
      for (const line of ALL_4_LINES) {
        if (line.includes(testPos)) {
          const opponentInLine = line.filter(pos => opponentPieces.includes(pos)).length
          if (opponentInLine >= 2) {
            threatsBlocked++
          }
        }
      }
      
      if (threatsBlocked >= 2) {
        console.log(`🍴 ANTI-FORK POSITION: ${testPos} blocks ${threatsBlocked} potential threats`)
        criticalPositions.push(testPos)
      }
    }
    
    // Sort by most threats blocked
    return criticalPositions.sort((a, b) => {
      const threatsA = this.countThreatsBlocked(position, opponentPieces, a)
      const threatsB = this.countThreatsBlocked(position, opponentPieces, b)
      return threatsB - threatsA
    })
  }

  /**
   * Count how many threats a position blocks
   */
  private static countThreatsBlocked(position: QuadraXPosition, opponentPieces: number[], testPos: number): number {
    let threats = 0
    
    // Count 2x2 threats blocked
    for (const square of ALL_2x2_SQUARES) {
      if (square.includes(testPos)) {
        const opponentInSquare = square.filter(pos => opponentPieces.includes(pos)).length
        if (opponentInSquare >= 1) threats++
      }
    }
    
    // Count line threats blocked  
    for (const line of ALL_4_LINES) {
      if (line.includes(testPos)) {
        const opponentInLine = line.filter(pos => opponentPieces.includes(pos)).length
        if (opponentInLine >= 2) threats++
      }
    }
    
    return threats
  }

  /**
   * NEW: Evaluate strategic positioning for proactive control
   */
  private static evaluateStrategicPositioning(position: QuadraXPosition): any {
    console.log(`🏰 STRATEGIC ANALYSIS: Evaluating board control and positioning...`)
    
    // Key strategic positions (center control, corner control, etc.)
    const centerPositions = [5, 6, 9, 10] // Central 2x2 area - most valuable
    const cornerPositions = [0, 3, 12, 15] // Corner control
    const edgePositions = [1, 2, 4, 7, 8, 11, 13, 14] // Edge positions
    
    // Count pieces in strategic areas
    const humanCenter = centerPositions.filter(pos => position.board[pos] === position.opponent).length
    const aiCenter = centerPositions.filter(pos => position.board[pos] === position.player).length
    const emptyCenters = centerPositions.filter(pos => position.board[pos] === 0)
    
    console.log(`🎯 CENTER CONTROL: AI(${aiCenter}) vs Human(${humanCenter}), Empty: ${emptyCenters.length}`)
    
    // CRITICAL: If human is dominating center, we must contest
    if (humanCenter >= 2 && aiCenter === 0 && emptyCenters.length > 0) {
      const contestMove = this.findCenterContestMove(position, emptyCenters)
      if (contestMove) {
        return {
          move: contestMove.move,
          reasoning: `CRITICAL CENTER CONTEST: Human has ${humanCenter} center pieces, must contest at position ${contestMove.target}`,
          priority: 'CRITICAL'
        }
      }
    }
    
    // HIGH: Secure center advantage if we have opportunity
    if (aiCenter >= humanCenter && emptyCenters.length > 0) {
      const centerMove = this.findCenterControlMove(position, emptyCenters)
      if (centerMove) {
        return {
          move: centerMove.move,
          reasoning: `CENTER CONTROL: Secure center dominance at position ${centerMove.target}`,
          priority: 'HIGH'
        }
      }
    }
    
    // MEDIUM: Corner control strategy
    const cornerMove = this.findCornerControlMove(position, cornerPositions)
    if (cornerMove) {
      return cornerMove
    }
    
    // LOW: Position value optimization
    const valueMove = this.findHighestValueMove(position)
    return valueMove
  }
  
  /**
   * Find move to contest center control
   */
  private static findCenterContestMove(position: QuadraXPosition, emptyCenters: number[]): any {
    for (const target of emptyCenters) {
      if (position.phase === 'placement' && position.availableMoves.includes(target)) {
        return { move: target, target }
      }
      
      if (position.phase === 'movement') {
        const moveToCenter = (position.availableMoves as { from: number; to: number }[])
          .find(move => move.to === target)
        if (moveToCenter) {
          return { move: moveToCenter, target }
        }
      }
    }
    return null
  }
  
  /**
   * Find move to control center
   */
  private static findCenterControlMove(position: QuadraXPosition, emptyCenters: number[]): any {
    // Prioritize positions that create multiple potential 2x2 squares
    const strategicCenters = [5, 6, 9, 10] // Order by strategic value
    
    for (const target of strategicCenters) {
      if (emptyCenters.includes(target)) {
        if (position.phase === 'placement' && position.availableMoves.includes(target)) {
          return { move: target, target }
        }
        
        if (position.phase === 'movement') {
          const moveToCenter = (position.availableMoves as { from: number; to: number }[])
            .find(move => move.to === target)
          if (moveToCenter) {
            return { move: moveToCenter, target }
          }
        }
      }
    }
    return null
  }
  
  /**
   * Find corner control moves
   */
  private static findCornerControlMove(position: QuadraXPosition, cornerPositions: number[]): any {
    const emptyCorners = cornerPositions.filter(pos => position.board[pos] === 0)
    
    if (emptyCorners.length > 0) {
      const target = emptyCorners[0]
      
      if (position.phase === 'placement' && position.availableMoves.includes(target)) {
        return {
          move: target,
          reasoning: `CORNER CONTROL: Secure corner position ${target}`,
          priority: 'MEDIUM'
        }
      }
      
      if (position.phase === 'movement') {
        const cornerMove = (position.availableMoves as { from: number; to: number }[])
          .find(move => move.to === target)
        if (cornerMove) {
          return {
            move: cornerMove,
            reasoning: `CORNER CONTROL: Move to secure corner ${target}`,
            priority: 'MEDIUM'
          }
        }
      }
    }
    return null
  }
  
  /**
   * Find highest value move based on position analysis
   */
  private static findHighestValueMove(position: QuadraXPosition): any {
    const moveScores = new Map()
    
    for (const move of position.availableMoves) {
      let score = 0
      let targetPos: number
      
      if (position.phase === 'placement') {
        targetPos = move as number
      } else {
        const movement = move as { from: number; to: number }
        targetPos = movement.to
      }
      
      // Score based on position value
      const centerPositions = [5, 6, 9, 10]
      const cornerPositions = [0, 3, 12, 15]
      
      if (centerPositions.includes(targetPos)) score += 50
      if (cornerPositions.includes(targetPos)) score += 30
      
      // Score based on potential 2x2 formations
      score += this.calculatePotentialFormations(position.board, targetPos, position.player)
      
      moveScores.set(move, score)
    }
    
    // Find highest scoring move
    let bestMove = null
    let bestScore = -1
    
    for (const [move, score] of moveScores) {
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    return {
      move: bestMove,
      reasoning: `OPTIMAL POSITIONING: Best value move (score: ${bestScore})`,
      priority: 'LOW'
    }
  }
  
  /**
   * Calculate potential formations from a position
   */
  private static calculatePotentialFormations(board: number[], position: number, player: number): number {
    let formations = 0
    
    // Check how many 2x2 squares this position participates in
    for (const square of ALL_2x2_SQUARES) {
      if (square.includes(position)) {
        const ourPieces = square.filter(pos => board[pos] === player).length
        const emptySpaces = square.filter(pos => board[pos] === 0).length + 1 // +1 for our move
        const opponentPieces = square.filter(pos => board[pos] === (player === 1 ? 2 : 1)).length
        
        if (opponentPieces === 0) { // Only count if opponent doesn't block
          formations += ourPieces + emptySpaces // More points for closer to completion
        }
      }
    }
    
    return formations
  }

  /**
   * Check if a player has won
   */
  private static checkWin(board: number[], player: number): boolean {
    // Check 2x2 squares first
    for (const square of ALL_2x2_SQUARES) {
      if (square.every(pos => board[pos] === player)) {
        return true
      }
    }
    
    // Check 4-in-a-line
    for (const line of ALL_4_LINES) {
      if (line.every(pos => board[pos] === player)) {
        return true
      }
    }
    
    return false
  }
}