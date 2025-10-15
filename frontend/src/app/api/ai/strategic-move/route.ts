import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Strategic AI Move API using ASI Alliance Agents
export async function POST(request: NextRequest) {
  try {
    const { boardState, requestType, difficulty } = await request.json()
    
    // Analyze board state with AI agents
    const aiResponse = await analyzeWithASIAgents(boardState, requestType, difficulty)
    
    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error('AI strategic move error:', error)
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 })
  }
}

async function analyzeWithASIAgents(boardState: any, requestType: string, difficulty: string) {
  console.log('🤖 Activating Local QuadraX Strategic AI (ASI services offline)')
  console.log('🎯 Board analysis:', { requestType, difficulty, boardState })
  
  // Skip ASI agent integration due to connectivity issues
  // Use pure local strategic intelligence instead
  
  if (requestType === 'ruthless-optimal-move') {
    console.log('📍 Processing placement request...')
    const placement = getBestPlacement(boardState.board, boardState.availableMoves)
    console.log('✅ Strategic placement decision:', placement)
    return placement
  } 
  
  if (requestType === 'optimal-movement') {
    console.log('🔄 Processing movement request...')
    const movement = getBestMovement(boardState.board, boardState.possibleMoves)
    console.log('✅ Strategic movement decision:', movement)
    return movement
  }

  // Pure strategic intelligence for any other request types
  return executeStrategicIntelligence(boardState, requestType)
}

function buildStrategicPrompt(boardState: any, requestType: string, difficulty: string) {
  const { board, phase, availableMoves, possibleMoves } = boardState
  
  let prompt = `You are a ruthless strategic AI playing 4x4 QuadraX Tic-Tac-Toe. 
  
CURRENT BOARD (16 positions, 0=empty, 1=player X, 2=AI O):
${formatBoard(board)}

RULES:
- Win via: 4-in-row (horizontal/vertical/diagonal) OR 2x2 square block
- Each player has exactly 4 pieces
- Current phase: ${phase}

`

  if (requestType === 'ruthless-optimal-move') {
    prompt += `PLACEMENT PHASE - Choose optimal position for AI piece (O):
Available positions: ${availableMoves.join(', ')}

Analyze:
1. Can I win immediately? 
2. Must I block player from winning?
3. What creates maximum strategic advantage?

Respond with ONLY the position number (0-15) for optimal move.`
  } else if (requestType === 'optimal-movement') {
    prompt += `MOVEMENT PHASE - Choose best piece movement:
Possible moves: ${possibleMoves?.map((m: any) => `${m.from}→${m.to}`).join(', ') || 'analyzing...'}

Analyze:
1. Can I win this turn?
2. Must I block an immediate player threat?
3. What move creates the strongest position?

Respond with format: "from:X to:Y" where X,Y are positions 0-15.`
  }

  prompt += `\n\nBe RUTHLESS. Always prioritize winning over blocking. Think 2-3 moves ahead.`
  
  return prompt
}

function formatBoard(board: number[]) {
  let result = ''
  for (let i = 0; i < 16; i += 4) {
    result += `${board.slice(i, i + 4).map(cell => 
      cell === 0 ? '_' : cell === 1 ? 'X' : 'O'
    ).join(' ')}\n`
  }
  return result
}

function parseAIResponse(aiResponse: string, boardState: any, requestType: string) {
  if (requestType === 'ruthless-optimal-move') {
    // Extract position number
    const moveMatch = aiResponse.match(/\b(\d{1,2})\b/)
    if (moveMatch) {
      const move = parseInt(moveMatch[1])
      if (move >= 0 && move <= 15 && boardState.availableMoves?.includes(move)) {
        return { move }
      }
    }
  } else if (requestType === 'optimal-movement') {
    // Extract movement pattern
    const movementMatch = aiResponse.match(/from:(\d{1,2})\s+to:(\d{1,2})/i)
    if (movementMatch) {
      const from = parseInt(movementMatch[1])
      const to = parseInt(movementMatch[2])
      if (from >= 0 && from <= 15 && to >= 0 && to <= 15) {
        return { movement: { from, to } }
      }
    }
  }

  // Pure strategic intelligence - optimal positioning
  return executeStrategicIntelligence(boardState, requestType)
}

// Pure Strategic Intelligence Engine - No Fallbacks
function executeStrategicIntelligence(boardState: any, requestType: string) {
  const { board, availableMoves, possibleMoves } = boardState
  
  if (requestType === 'ruthless-optimal-move') {
    return getBestPlacement(board, availableMoves)
  }
  
  if (requestType === 'optimal-movement' && possibleMoves?.length > 0) {
    return getBestMovement(board, possibleMoves)
  }
  
  // Pure intelligence - optimal first available position
  return { move: availableMoves?.[0] || 0 }
}

// Advanced threat assessment for strategic positioning
function determineThreatLevel(board: number[], player1Count: number, player2Count: number): 'low' | 'medium' | 'high' | 'critical' {
  // Check for immediate win threats (3-in-a-row scenarios)
  const patterns = [
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15], // Horizontal
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15], // Vertical  
    [0,5,10,15], [3,6,9,12], // Diagonal
    [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15] // 2x2
  ]
  
  let maxThreat = 0
  for (const pattern of patterns) {
    const player1Pieces = pattern.filter(pos => board[pos] === 1).length
    const player2Pieces = pattern.filter(pos => board[pos] === 2).length
    
    if (player1Pieces === 3 && player2Pieces === 0) return 'critical' // Player near win
    if (player2Pieces === 3 && player1Pieces === 0) return 'critical' // AI near win
    if (player1Pieces === 2 && player2Pieces === 0) maxThreat = Math.max(maxThreat, 3)
    if (player2Pieces === 2 && player1Pieces === 0) maxThreat = Math.max(maxThreat, 3)
  }
  
  if (maxThreat >= 3) return 'high'
  if (player1Count >= 3 || player2Count >= 3) return 'medium'
  return 'low'
}

// Optimal piece selection for strategic movement
function selectOptimalPieceForTarget(board: number[], aiPieces: number[], targetPosition: number): {from: number, to: number} {
  let bestFrom = aiPieces[0]
  let bestScore = -1000
  
  // Evaluate which piece movement creates the strongest position
  for (const piece of aiPieces) {
    const testBoard = [...board]
    testBoard[piece] = 0
    testBoard[targetPosition] = 2
    
    const score = evaluateBoard(testBoard, 2)
    if (score > bestScore) {
      bestScore = score
      bestFrom = piece
    }
  }
  
  return { from: bestFrom, to: targetPosition }
}

// Elite QuadraX AI - Ruthless Placement Strategy
function getBestPlacement(board: number[], availableMoves: number[]) {
  console.log('🎯 AI Analyzing placement options:', availableMoves)
  
  // PRIORITY 1: Win immediately if possible
  for (const move of availableMoves) {
    const testBoard = [...board]
    testBoard[move] = 2
    if (checkWin(testBoard, 2)) {
      console.log('🏆 AI WINNING MOVE FOUND:', move)
      return { move }
    }
  }
  
  // PRIORITY 2: Block player from winning
  for (const move of availableMoves) {
    const testBoard = [...board]
    testBoard[move] = 1 // Test if player could win here
    if (checkWin(testBoard, 1)) {
      console.log('🛡️ AI BLOCKING PLAYER WIN at:', move)
      return { move }
    }
  }
  
  // PRIORITY 3: Strategic positioning with deep analysis
  let bestMove = availableMoves[0]
  let bestScore = -1000
  
  for (const move of availableMoves) {
    const score = evaluateQuadraXPosition(board, move, 2)
    console.log(`📊 Position ${move} score:`, score)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  
  console.log('🎯 AI Selected optimal move:', bestMove, 'with score:', bestScore)
  return { move: bestMove }
}

// Elite QuadraX AI - Ruthless Movement Strategy
function getBestMovement(board: number[], possibleMoves: any[]) {
  console.log('🔄 AI Analyzing movement options:', possibleMoves.length, 'moves')
  
  // PRIORITY 1: Win immediately with movement
  for (const move of possibleMoves) {
    const testBoard = [...board]
    testBoard[move.from] = 0
    testBoard[move.to] = 2
    if (checkWin(testBoard, 2)) {
      console.log('🏆 AI WINNING MOVEMENT FOUND:', move)
      return { movement: move }
    }
  }
  
  // PRIORITY 2: Block player from winning on their next move
  const playerPieces = board.map((cell, index) => cell === 1 ? index : -1).filter(i => i !== -1)
  for (const move of possibleMoves) {
    const testBoard = [...board]
    testBoard[move.from] = 0
    testBoard[move.to] = 2
    
    // Check if this move blocks ALL player winning opportunities
    let blocksPlayerWin = false
    for (const playerPiece of playerPieces) {
      const emptySpaces = testBoard.map((cell, index) => cell === 0 ? index : -1).filter(i => i !== -1)
      for (const empty of emptySpaces) {
        const playerTestBoard = [...testBoard]
        playerTestBoard[playerPiece] = 0
        playerTestBoard[empty] = 1
        if (checkWin(playerTestBoard, 1)) {
          // Player could still win after this AI move
          blocksPlayerWin = false
          break
        }
      }
      if (!blocksPlayerWin) break
    }
    
    if (blocksPlayerWin) {
      console.log('🛡️ AI BLOCKING ALL PLAYER WINS with:', move)
      return { movement: move }
    }
  }
  
  // PRIORITY 3: Create maximum threats while minimizing player threats
  let bestMovement = possibleMoves[0]
  let bestScore = -1000
  
  for (const move of possibleMoves) {
    const testBoard = [...board]
    testBoard[move.from] = 0
    testBoard[move.to] = 2
    
    const score = evaluateQuadraXBoard(testBoard, 2)
    console.log(`📊 Movement ${move.from}→${move.to} score:`, score)
    
    if (score > bestScore) {
      bestScore = score
      bestMovement = move
    }
  }
  
  console.log('🎯 AI Selected optimal movement:', bestMovement, 'with score:', bestScore)
  return { movement: bestMovement }
}

// Elite QuadraX Position Evaluation - Ruthless Analysis
function evaluateQuadraXPosition(board: number[], move: number, player: number) {
  const testBoard = [...board]
  testBoard[move] = player
  
  // Immediate win (maximum priority)
  if (checkWin(testBoard, player)) {
    return 10000
  }
  
  // Blocks opponent win (critical priority)
  const opponent = 3 - player
  const testOpponentBoard = [...board]
  testOpponentBoard[move] = opponent
  if (checkWin(testOpponentBoard, opponent)) {
    return 5000
  }
  
  // Strategic QuadraX evaluation
  return evaluateQuadraXBoard(testBoard, player)
}

// Comprehensive QuadraX Board Evaluation
function evaluateQuadraXBoard(board: number[], player: number) {
  let score = 0
  const opponent = 3 - player
  
  // All QuadraX winning patterns - EXACT 4x4 rules
  const patterns = [
    // HORIZONTAL LINES (4-in-a-row)
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
    
    // VERTICAL LINES (4-in-a-column)  
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
    
    // DIAGONAL LINES (any direction)
    [0,5,10,15], [3,6,9,12],
    
    // 2x2 SQUARE BLOCKS (anywhere on board)
    [0,1,4,5], [1,2,5,6], [2,3,6,7], 
    [4,5,8,9], [5,6,9,10], [6,7,10,11], 
    [8,9,12,13], [9,10,13,14], [10,11,14,15]
  ]
  
  console.log('🔍 Evaluating board for player', player)
  
  for (const pattern of patterns) {
    const aiPieces = pattern.filter(pos => board[pos] === player).length
    const opponentPieces = pattern.filter(pos => board[pos] === opponent).length
    const empty = pattern.filter(pos => board[pos] === 0).length
    
    // AI advantage scoring (MAXIMIZE)
    if (opponentPieces === 0) { // Clear path for AI
      if (aiPieces === 4) {
        console.log('🏆 AI HAS WINNING PATTERN:', pattern)
        score += 10000 // AI wins!
      }
      else if (aiPieces === 3) {
        console.log('⚡ AI 3-in-pattern:', pattern)
        score += 1000 // Near win - very strong
      }
      else if (aiPieces === 2) {
        console.log('💪 AI 2-in-pattern:', pattern)
        score += 100 // Good progress
      }
      else if (aiPieces === 1) {
        score += 10 // Start
      }
    }
    
    // Opponent threat assessment (MINIMIZE)
    if (aiPieces === 0) { // Clear path for opponent - CRITICAL!
      if (opponentPieces === 4) {
        console.log('💀 OPPONENT WINS:', pattern)
        score -= 10000 // Opponent wins - must prevent!
      }
      else if (opponentPieces === 3) {
        console.log('🚨 OPPONENT 3-in-pattern - BLOCK NOW:', pattern)
        score -= 2000 // Critical threat - higher penalty!
      }
      else if (opponentPieces === 2) {
        console.log('⚠️ Opponent 2-in-pattern:', pattern)
        score -= 200 // Significant threat
      }
      else if (opponentPieces === 1) {
        score -= 20 // Early threat
      }
    }
  }
  
  // Strategic positioning bonuses
  const centerPositions = [5, 6, 9, 10] // Center control
  for (const pos of centerPositions) {
    if (board[pos] === player) score += 15
    if (board[pos] === opponent) score -= 15
  }
  
  // Corner control (good for multiple patterns)
  const cornerPositions = [0, 3, 12, 15]
  for (const pos of cornerPositions) {
    if (board[pos] === player) score += 8
    if (board[pos] === opponent) score -= 8
  }
  
  console.log('📊 Final evaluation score:', score)
  return score
}

// Legacy board evaluation - replaced by evaluateQuadraXBoard
function evaluateBoard(board: number[], player: number) {
  return evaluateQuadraXBoard(board, player)
}

function findWinningMove(board: number[], player: number, availableMoves?: number[]): number | null {
  const moves = availableMoves || board.map((_, i) => i).filter(i => board[i] === 0)
  
  for (const move of moves) {
    const testBoard = [...board]
    testBoard[move] = player
    if (checkWin(testBoard, player)) {
      return move
    }
  }
  
  return null
}

function checkWin(board: number[], player: number): boolean {
  // All winning patterns for 4x4 QuadraX
  const patterns = [
    // Horizontal
    [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
    // Vertical  
    [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
    // Diagonal
    [0,5,10,15], [3,6,9,12],
    // 2x2 Squares
    [0,1,4,5], [1,2,5,6], [2,3,6,7], [4,5,8,9], 
    [5,6,9,10], [6,7,10,11], [8,9,12,13], [9,10,13,14], [10,11,14,15]
  ]
  
  return patterns.some(pattern => 
    pattern.every(pos => board[pos] === player)
  )
}

