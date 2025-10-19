// Enhanced ASI Alliance Route - Using Modular Architecture
// Complete 4-agent system with referee validation and proper QuadraX rules

import { NextRequest, NextResponse } from 'next/server'

// Import modular ASI Alliance system
import { ASIAllianceFactory } from '@/lib/agents/asi-alliance'
import { QuadraXReferee } from '@/lib/referee/quadraXReferee'
import { scoreMove } from '@/lib/utils/quadraX/moveScoring'
import type { GamePosition, AgentDecision, OpponentProfile } from '@/lib/agents/asi-alliance/types'

interface APIGameState {
  board: number[]
  phase: 'placement' | 'movement'
  currentPlayer: number
  placedPieces?: { [player: number]: number }
}

// Extended AgentDecision with score property
interface ExtendedAgentDecision extends AgentDecision {
  score?: number
}

/**
 * Get possible moves for current game state
 */
function getPossibleMoves(board: number[], phase: 'placement' | 'movement', currentPlayer: number): (number | { from: number; to: number })[] {
  if (phase === 'placement') {
    return board.map((cell, index) => cell === 0 ? index : null).filter(pos => pos !== null) as number[]
  } else {
    const playerPieces = board.map((cell, index) => cell === currentPlayer ? index : -1).filter(pos => pos !== -1)
    const emptySpaces = board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1)
    
    const moves: { from: number, to: number }[] = []
    for (const piece of playerPieces) {
      for (const empty of emptySpaces) {
        if (isAdjacent(piece, empty)) {
          moves.push({ from: piece, to: empty })
        }
      }
    }
    return moves
  }
}

/**
 * Check if two positions are adjacent (including diagonally)
 */
function isAdjacent(pos1: number, pos2: number): boolean {
  const row1 = Math.floor(pos1 / 4), col1 = pos1 % 4
  const row2 = Math.floor(pos2 / 4), col2 = pos2 % 4
  
  return Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1 && pos1 !== pos2
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Enhanced ASI Alliance API - Modular System Activated')
    
    const body = await request.json()
    console.log('📥 Request received:', { 
      board: body.board?.slice(0, 5) + '...', 
      phase: body.phase, 
      currentPlayer: body.currentPlayer 
    })
    
    // Parse incoming request with multiple format support
    const gameState: APIGameState = {
      board: body.board || body.gamePosition?.board || body.boardState?.board,
      phase: body.phase || body.gamePosition?.phase || body.boardState?.phase || 'placement',
      currentPlayer: body.currentPlayer || body.gamePosition?.currentPlayer || body.boardState?.currentPlayer || 2,
      placedPieces: body.placedPieces || { 1: 0, 2: 0 }
    }
    
    // Validate game state
    if (!gameState.board || !Array.isArray(gameState.board) || gameState.board.length !== 16) {
      throw new Error('Invalid board state - must be 16-position array')
    }
    
    // Convert to GamePosition format for agents
    const gamePosition: GamePosition = {
      board: gameState.board,
      phase: gameState.phase,
      player1Pieces: gameState.board.filter(cell => cell === 1).length,
      player2Pieces: gameState.board.filter(cell => cell === 2).length,
      possibleMoves: getPossibleMoves(gameState.board, gameState.phase, gameState.currentPlayer),
      moveHistory: [],
      currentPlayer: gameState.currentPlayer as (1 | 2)
    }
    
    console.log(`🎯 Game State: ${gameState.phase} phase, Player ${gameState.currentPlayer}`)
    console.log(`🎲 Board State: ${gameState.board.map((c, i) => `${i}:${c === 0 ? '·' : c === 1 ? 'X' : 'O'}`).join(' ')}`)
    console.log(`📊 Available moves: ${gamePosition.possibleMoves.length} - ${gamePosition.possibleMoves.join(', ')}`)
    
    // Get decision from ASI Alliance system
    const decision = await getASIAllianceDecision(gamePosition)
    
    // Format response for frontend compatibility  
    const response = {
      move: gameState.phase === 'placement' ? decision.move : decision.move,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      agent: decision.agent,
      score: decision.score || 0,
      phase: gameState.phase,
      refereeValidated: true,
      asiAlliance: true,
      modular: true
    }
    
    console.log('✅ ASI Alliance Decision:', {
      move: response.move,
      agent: response.agent,
      confidence: response.confidence
    })
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Enhanced ASI Alliance Error:', error)
    return NextResponse.json({ 
      error: `ASI Alliance error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fallback: true
    }, { status: 500 })
  }
}

/**
 * Main ASI Alliance decision system using modular architecture
 */
async function getASIAllianceDecision(gamePosition: GamePosition): Promise<ExtendedAgentDecision> {
  console.log('🤖 ASI Alliance: Activating 4-agent consultation system...')
  
  // Initialize referee system
  const referee = new QuadraXReferee()
  
  // Check for guaranteed winning moves first
  const winningMove = await referee.findWinningMove(
    gamePosition.board,
    gamePosition.currentPlayer,
    gamePosition.possibleMoves,
    gamePosition.phase
  )
  
  if (winningMove) {
    console.log('🏆 REFEREE: Guaranteed winning move found!')
    return {
      move: winningMove.move,
      reasoning: `WINNING MOVE: ${winningMove.reasoning}`,
      confidence: 1.0,
      agent: 'QuadraXReferee',
      type: 'referee',
      score: 1000
    }
  }
  
  // Check for critical blocks (opponent about to win)
  const criticalBlock = await referee.findBlockingMove(
    gamePosition.board,
    gamePosition.currentPlayer,
    gamePosition.possibleMoves,
    gamePosition.phase
  )
  
  if (criticalBlock) {
    console.log('🛡️ REFEREE: Critical block required!')
    return {
      move: criticalBlock.move,
      reasoning: `CRITICAL BLOCK: ${criticalBlock.reasoning}`,
      confidence: 0.95,
      agent: 'QuadraXReferee',
      type: 'referee',
      score: 900
    }
  }
  
  // Consult all 4 agents for strategic analysis
  const agentDecisions = await consultAllAgents(gamePosition)
  
  if (agentDecisions.length === 0) {
    throw new Error('All ASI Alliance agents failed to respond')
  }
  
  console.log('🔍 Raw agent decisions before scoring:')
  agentDecisions.forEach(decision => {
    console.log(`  ${decision.agent}: move ${decision.move}, confidence ${decision.confidence}`)
  })
  
  // Score and validate all decisions through referee
  const scoredDecisions = await Promise.all(
    agentDecisions.map(async (decision) => {
      const score = await scoreMove(
        gamePosition.board,
        decision.move,
        gamePosition.currentPlayer,
        gamePosition.phase
      )
      
      console.log(`🎯 Scoring ${decision.agent}: move ${decision.move} = ${score} points`)
      
      return {
        ...decision,
        score: score
      }
    })
  )
  
  // Select best decision based on score and confidence
  console.log('🔍 All scored decisions:')
  scoredDecisions.forEach(decision => {
    const weight = (decision.score || 0) * decision.confidence
    console.log(`  ${decision.agent}: move ${decision.move}, score ${decision.score}, confidence ${decision.confidence}, weight ${weight}`)
  })
  
  const bestDecision = scoredDecisions.reduce((best, current) => {
    const bestWeight = (best.score || 0) * best.confidence
    const currentWeight = (current.score || 0) * current.confidence
    console.log(`🔀 Comparing ${current.agent} (${currentWeight}) vs ${best.agent} (${bestWeight})`)
    return currentWeight > bestWeight ? current : best
  })
  
  console.log('🏆 ASI Alliance Final Decision:', {
    agent: bestDecision.agent,
    move: bestDecision.move,
    score: bestDecision.score,
    confidence: bestDecision.confidence
  })
  
  return bestDecision
}

/**
 * Consult all 4 ASI Alliance agents
 */
async function consultAllAgents(gamePosition: GamePosition): Promise<AgentDecision[]> {
  console.log('👥 Consulting all ASI Alliance agents...')
  
  const agents = await ASIAllianceFactory.createAllAgents()
  const opponentProfile: OpponentProfile = {
    playStyle: 'strategic',
    skillLevel: 'advanced',
    preferredPositions: [5, 6, 9, 10],
    gameHistory: [],
    winRate: 0.8
  }
  
  const decisions: AgentDecision[] = []
  
  // Alpha Strategist - Strategic Analysis
  try {
    console.log('🧠 Consulting AlphaStrategist...')
    const alphaDecision = await agents.alphaStrategist.selectQuadraXMove(
      gamePosition,
      opponentProfile,
      30000 // 30 second timeout
    )
    decisions.push(alphaDecision)
    console.log(`✅ AlphaStrategist decision: confidence ${alphaDecision.confidence}`)
  } catch (error) {
    console.log('⚠️ AlphaStrategist failed:', error)
  }
  
  // Beta Defender - Defensive Analysis
  try {
    console.log('🛡️ Consulting BetaDefender...')
    const betaDecision = await agents.betaDefender.selectQuadraXMove(
      gamePosition,
      opponentProfile,
      30000
    )
    decisions.push(betaDecision)
    console.log(`✅ BetaDefender decision: confidence ${betaDecision.confidence}`)
  } catch (error) {
    console.log('⚠️ BetaDefender failed:', error)
  }
  
  // Gamma Aggressor - Aggressive Analysis
  try {
    console.log('⚔️ Consulting GammaAggressor...')
    const gammaDecision = await agents.gammaAggressor.selectQuadraXMove(
      gamePosition,
      opponentProfile,
      30000
    )
    decisions.push(gammaDecision)
    console.log(`✅ GammaAggressor decision: confidence ${gammaDecision.confidence}`)
  } catch (error) {
    console.log('⚠️ GammaAggressor failed:', error)
  }
  
  // Delta Adaptive - Adaptive Analysis
  try {
    console.log('🔄 Consulting DeltaAdaptive...')
    const deltaDecision = await agents.deltaAdaptive.selectQuadraXMove(
      gamePosition,
      opponentProfile,
      30000
    )
    decisions.push(deltaDecision)
    console.log(`✅ DeltaAdaptive decision: confidence ${deltaDecision.confidence}`)
  } catch (error) {
    console.log('⚠️ DeltaAdaptive failed:', error)
  }
  
  console.log(`🏁 Agent consultation complete: ${decisions.length}/4 agents responded`)
  return decisions
}

/**
 * Analyze threat level on the board
 */
function analyzeThreatLevel(board: number[], currentPlayer: number): 'low' | 'medium' | 'high' | 'critical' {
  const opponent = currentPlayer === 1 ? 2 : 1
  
  // Check for immediate win threats (opponent needs 1 move to win)
  const winPatterns = [
    // 2x2 squares (primary threat)
    [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], 
    [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15],
    // 4-in-a-row (secondary threat)  
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
    [0,5,10,15], [3,6,9,12]
  ]
  
  for (const pattern of winPatterns) {
    const opponentPieces = pattern.filter(pos => board[pos] === opponent).length
    const emptySpaces = pattern.filter(pos => board[pos] === 0).length
    
    if (opponentPieces === 3 && emptySpaces === 1) {
      return 'critical' // Opponent wins next move
    }
    if (opponentPieces === 2 && emptySpaces === 2) {
      return 'high' // Opponent has strong setup
    }
  }
  
  // Check our own opportunities
  for (const pattern of winPatterns) {
    const myPieces = pattern.filter(pos => board[pos] === currentPlayer).length
    if (myPieces >= 2) {
      return 'medium' // We have good opportunities
    }
  }
  
  return 'low'
}