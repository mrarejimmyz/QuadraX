// Hybrid Bulletproof AI Validation System
// Additional safety layer that combines all threat detection systems
// Ensures absolutely no dangerous moves are allowed

import type { GamePosition } from '@/lib/agents/asi-alliance/types'
import { QuadraXReferee } from '@/lib/referee/quadraXReferee'
import { findCriticalBlockingPositions, checkWin } from '@/lib/utils/quadraX/gameLogic'

export interface HybridValidationResult {
  isValid: boolean
  dangerLevel: 'safe' | 'risky' | 'dangerous' | 'fatal'
  threats: string[]
  recommendation: 'approve' | 'reject' | 'find_alternative'
  reasoning: string
}

export class HybridBulletproofValidator {
  private referee: QuadraXReferee

  constructor() {
    this.referee = new QuadraXReferee()
  }

  /**
   * Ultimate validation system that combines all threat detection methods
   */
  async validateMove(
    gamePosition: GamePosition,
    proposedMove: number | { from: number; to: number },
    currentPlayer: number
  ): Promise<HybridValidationResult> {
    console.log('🛡️ HYBRID VALIDATOR: Running comprehensive threat analysis...')
    
    const threats: string[] = []
    let dangerLevel: 'safe' | 'risky' | 'dangerous' | 'fatal' = 'safe'
    
    // Create test board with proposed move
    const testBoard = [...gamePosition.board]
    if (gamePosition.phase === 'placement') {
      testBoard[proposedMove as number] = currentPlayer
    } else {
      const moveObj = proposedMove as { from: number; to: number }
      testBoard[moveObj.from] = 0
      testBoard[moveObj.to] = currentPlayer
    }
    
    const opponent = currentPlayer === 1 ? 2 : 1
    
    // Test 1: Immediate opponent win check
    console.log('🔍 TEST 1: Checking for immediate opponent wins...')
    const immediateWin = await this.referee.findWinningMove(
      testBoard,
      opponent,
      this.getPossibleMoves(testBoard, gamePosition.phase === 'placement' ? 'placement' : 'movement', opponent),
      gamePosition.phase === 'placement' ? 'placement' : 'movement'
    )
    
    if (immediateWin) {
      threats.push('IMMEDIATE_OPPONENT_WIN')
      dangerLevel = 'fatal'
      console.log('🚨 TEST 1 FAILED: Move allows immediate opponent win!')
    }
    
    // Test 2: Critical blocking position analysis
    console.log('🔍 TEST 2: Critical blocking position analysis...')
    if (gamePosition.phase === 'placement') {
      const criticalBlocks = findCriticalBlockingPositions(
        testBoard,
        opponent,
        this.getPossibleMoves(testBoard, 'placement', opponent) as number[]
      )
      
      if (criticalBlocks.length > 0 && criticalBlocks[0].priority >= 150) {
        threats.push(`CRITICAL_THREAT_PRIORITY_${criticalBlocks[0].priority}`)
        dangerLevel = dangerLevel === 'fatal' ? 'fatal' : 'dangerous'
        console.log(`🚨 TEST 2 WARNING: Creates critical threat with priority ${criticalBlocks[0].priority}`)
      }
    }
    
    // Test 3: Multiple threat creation check
    console.log('🔍 TEST 3: Multiple threat creation analysis...')
    const multipleThreats = await this.detectMultipleThreats(testBoard, opponent)
    if (multipleThreats.count >= 2) {
      threats.push(`MULTIPLE_THREATS_${multipleThreats.count}`)
      dangerLevel = dangerLevel === 'fatal' ? 'fatal' : 'dangerous'
      console.log(`🚨 TEST 3 WARNING: Creates ${multipleThreats.count} threats for opponent`)
    }
    
    // Test 4: Fork setup detection
    console.log('🔍 TEST 4: Fork setup detection...')
    const forkSetup = this.detectForkSetup(testBoard, opponent)
    if (forkSetup.isFork) {
      threats.push('FORK_SETUP_DETECTED')
      dangerLevel = dangerLevel === 'fatal' ? 'fatal' : 'dangerous'
      console.log('🚨 TEST 4 WARNING: Move creates fork setup for opponent')
    }
    
    // Test 5: Future movement threat analysis (for placement phase)
    if (gamePosition.phase === 'placement') {
      console.log('🔍 TEST 5: Future movement threat analysis...')
      const futureThreats = await this.analyzeFutureMovementThreats(testBoard, opponent)
      if (futureThreats.highRisk) {
        threats.push('FUTURE_MOVEMENT_THREAT')
        dangerLevel = dangerLevel === 'fatal' ? 'fatal' : (dangerLevel === 'dangerous' ? 'dangerous' : 'risky')
        console.log('⚠️ TEST 5 WARNING: Creates future movement threats')
      }
    }
    
    // Determine final recommendation
    let recommendation: 'approve' | 'reject' | 'find_alternative'
    let reasoning: string
    
    if (dangerLevel === 'fatal') {
      recommendation = 'reject'
      reasoning = `FATAL THREATS DETECTED: ${threats.join(', ')} - Move must be rejected`
    } else if (dangerLevel === 'dangerous') {
      recommendation = 'find_alternative'
      reasoning = `DANGEROUS MOVE: ${threats.join(', ')} - Seek safer alternative`
    } else if (dangerLevel === 'risky') {
      recommendation = 'approve' // Allow risky moves if no alternatives
      reasoning = `RISKY BUT ACCEPTABLE: ${threats.join(', ')} - Monitor carefully`
    } else {
      recommendation = 'approve'
      reasoning = 'MOVE VALIDATED: No significant threats detected'
    }
    
    console.log(`🛡️ HYBRID VALIDATION RESULT: ${recommendation.toUpperCase()} (${dangerLevel.toUpperCase()})`)
    console.log(`📋 Reasoning: ${reasoning}`)
    
    return {
      isValid: recommendation === 'approve',
      dangerLevel,
      threats,
      recommendation,
      reasoning
    }
  }
  
  /**
   * Detect multiple winning threats for opponent
   */
  private async detectMultipleThreats(board: number[], opponent: number): Promise<{ count: number; threats: string[] }> {
    const winPatterns = [
      // 2x2 squares
      [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], 
      [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15],
      // 4-in-a-row
      [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
      [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
      [0,5,10,15], [3,6,9,12]
    ]
    
    let threatCount = 0
    const threats: string[] = []
    
    for (const pattern of winPatterns) {
      const opponentPieces = pattern.filter(pos => board[pos] === opponent).length
      const emptySpaces = pattern.filter(pos => board[pos] === 0).length
      
      if (opponentPieces === 3 && emptySpaces === 1) {
        threatCount++
        const emptyPos = pattern.find(pos => board[pos] === 0)
        threats.push(`WIN_THREAT_AT_${emptyPos}`)
      }
    }
    
    return { count: threatCount, threats }
  }
  
  /**
   * Detect fork setups (multiple winning paths)
   */
  private detectForkSetup(board: number[], opponent: number): { isFork: boolean; details: string[] } {
    const winPatterns = [
      [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], 
      [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]
    ]
    
    const potentialWins: { pattern: number[], emptyPos: number }[] = []
    
    for (const pattern of winPatterns) {
      const opponentPieces = pattern.filter(pos => board[pos] === opponent).length
      const emptySpaces = pattern.filter(pos => board[pos] === 0)
      
      if (opponentPieces === 2 && emptySpaces.length === 2) {
        // Potential winning pattern with 2 empty spaces
        emptySpaces.forEach(pos => {
          potentialWins.push({ pattern, emptyPos: pos })
        })
      }
    }
    
    // Check for overlapping positions (fork indicators)
    const positionCounts = new Map<number, number>()
    potentialWins.forEach(win => {
      positionCounts.set(win.emptyPos, (positionCounts.get(win.emptyPos) || 0) + 1)
    })
    
    const forkPositions = Array.from(positionCounts.entries()).filter(([_, count]) => count >= 2)
    
    return {
      isFork: forkPositions.length > 0,
      details: forkPositions.map(([pos, count]) => `FORK_AT_${pos}_COUNT_${count}`)
    }
  }
  
  /**
   * Analyze future movement threats after placement
   */
  private async analyzeFutureMovementThreats(board: number[], opponent: number): Promise<{ highRisk: boolean; analysis: string[] }> {
    // Simulate opponent having mobility in movement phase
    const opponentPieces = board.map((cell, idx) => cell === opponent ? idx : -1).filter(pos => pos !== -1)
    const emptySpaces = board.map((cell, idx) => cell === 0 ? idx : -1).filter(pos => pos !== -1)
    
    let highRiskCount = 0
    const analysis: string[] = []
    
    // Check if opponent pieces can create multiple threats via movement
    for (const piecePos of opponentPieces) {
      for (const targetPos of emptySpaces) {
        // Simulate moving opponent piece
        const testBoard = [...board]
        testBoard[piecePos] = 0
        testBoard[targetPos] = opponent
        
        // Check if this creates immediate wins
        const threatsCreated = await this.detectMultipleThreats(testBoard, opponent)
        if (threatsCreated.count >= 2) {
          highRiskCount++
          analysis.push(`PIECE_${piecePos}_TO_${targetPos}_CREATES_${threatsCreated.count}_THREATS`)
        }
      }
    }
    
    return {
      highRisk: highRiskCount >= 3, // High risk if 3+ movement combinations create multiple threats
      analysis: analysis.slice(0, 5) // Limit output
    }
  }
  
  /**
   * Helper function to get possible moves
   */
  private getPossibleMoves(board: number[], phase: 'placement' | 'movement', player: number): (number | { from: number; to: number })[] {
    if (phase === 'placement') {
      return board.map((cell, index) => cell === 0 ? index : null).filter(pos => pos !== null) as number[]
    } else {
      const playerPieces = board.map((cell, index) => cell === player ? index : -1).filter(pos => pos !== -1)
      const emptySpaces = board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1)
      
      const moves: { from: number, to: number }[] = []
      for (const piece of playerPieces) {
        for (const empty of emptySpaces) {
          moves.push({ from: piece, to: empty })
        }
      }
      return moves
    }
  }
}

// Export singleton instance
export const hybridValidator = new HybridBulletproofValidator()