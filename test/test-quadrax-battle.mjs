/**
 * QUADRAX ASI ALLIANCE BATTLE - PROPER RULES ENFORCEMENT
 * 
 * Features:
 * - Correct QuadraX rules (2x2 squares to win)
 * - 4 specialized ASI agents with distinct personalities  
 * - Smart referee system for move validation
 * - Proper placement → movement phase progression
 */

import fetch from 'node-fetch'

const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(c[color] + message + c.reset)
}

// QuadraX Win Detection - CORRECT RULES
function checkForWin(board) {
  // PRIMARY WIN CONDITION: 2x2 squares
  const squares2x2 = [
    [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
    [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
    [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
  ]
  
  for (const square of squares2x2) {
    for (const player of [1, 2]) {
      if (square.every(pos => board[pos] === player)) {
        return { winner: player, type: '2x2 square', positions: square }
      }
    }
  }
  
  // SECONDARY WIN CONDITIONS: 4-in-a-line (rare with only 4 pieces)
  const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // Rows
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // Columns
    [0, 5, 10, 15], [3, 6, 9, 12] // Diagonals
  ]
  
  for (const line of lines) {
    for (const player of [1, 2]) {
      if (line.every(pos => board[pos] === player)) {
        return { winner: player, type: '4-in-a-line', positions: line }
      }
    }
  }
  
  return null
}

class QuadraXGame {
  constructor() {
    this.board = Array(16).fill(0)
    this.phase = 'placement'
    this.currentPlayer = 1
    this.gameOver = false
    this.winner = null
    this.winType = null
    this.placedPieces = { 1: 0, 2: 0 }
  }

  displayBoard() {
    log('\n📋 CURRENT BOARD:', 'cyan')
    for (let row = 0; row < 4; row++) {
      let rowStr = ''
      for (let col = 0; col < 4; col++) {
        const pos = row * 4 + col
        const cell = this.board[pos]
        const symbol = cell === 0 ? '·' : cell === 1 ? '○' : '●'
        rowStr += `${pos.toString().padStart(2)}:${symbol}  `
      }
      log(rowStr, 'bright')
    }
    log(`Phase: ${this.phase} | Turn: Player ${this.currentPlayer} ${this.currentPlayer === 1 ? '○' : '●'}`, 'yellow')
    log(`Pieces placed: Player 1: ${this.placedPieces[1]}/4, Player 2: ${this.placedPieces[2]}/4`, 'yellow')
  }

  getPossibleMoves() {
    if (this.phase === 'placement') {
      return this.board.map((cell, idx) => cell === 0 ? idx : null).filter(idx => idx !== null)
    } else {
      const moves = []
      for (let i = 0; i < 16; i++) {
        if (this.board[i] === this.currentPlayer) {
          const adjacent = this.getAdjacentPositions(i)
          for (const pos of adjacent) {
            if (this.board[pos] === 0) {
              moves.push({ from: i, to: pos })
            }
          }
        }
      }
      return moves
    }
  }

  getAdjacentPositions(pos) {
    const adjacent = []
    const row = Math.floor(pos / 4)
    const col = pos % 4
    
    if (row > 0) adjacent.push(pos - 4)     // Up
    if (row < 3) adjacent.push(pos + 4)     // Down  
    if (col > 0) adjacent.push(pos - 1)     // Left
    if (col < 3) adjacent.push(pos + 1)     // Right
    
    return adjacent
  }

  makeMove(move) {
    if (this.phase === 'placement') {
      if (this.placedPieces[this.currentPlayer] >= 4) {
        throw new Error(`Player ${this.currentPlayer} has already placed 4 pieces!`)
      }
      this.board[move] = this.currentPlayer
      this.placedPieces[this.currentPlayer]++
      
      // Check if placement phase is complete
      if (this.placedPieces[1] === 4 && this.placedPieces[2] === 4) {
        this.phase = 'movement'
        log('\n🔄 TRANSITIONING TO MOVEMENT PHASE!', 'magenta')
      }
    } else {
      // Movement phase
      this.board[move.from] = 0
      this.board[move.to] = this.currentPlayer
    }
    
    this.checkWinner()
    if (!this.gameOver) {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1
    }
  }

  checkWinner() {
    const result = checkForWin(this.board)
    if (result) {
      this.gameOver = true
      this.winner = result.winner
      this.winType = result.type
      log(`🏆 WIN DETECTED: ${result.type} at positions [${result.positions.join(', ')}]`, 'green')
    }
  }
}

// ASI Agent System with Ollama
async function callASIAgent(board, phase, currentPlayer, agentType, availableMoves) {
  const agentPersonalities = {
    alpha: "You are AlphaStrategist, a master of 2x2 square formations. You prioritize center control and creating multiple win threats.",
    beta: "You are BetaDefender, a defensive specialist. You focus on blocking opponent's 2x2 squares and maintaining strong positions.",
    gamma: "You are GammaAggressor, an aggressive attacker. You seek immediate 2x2 square wins and apply constant pressure.",
    delta: "You are DeltaAdaptive, an adaptive intelligence. You change strategy based on current game state and piece positions."
  }

  const boardString = board.map((cell, idx) => 
    `${idx}:${cell === 0 ? '·' : cell === 1 ? '○' : '●'}`
  ).join(' ')

  const movesString = availableMoves.map(move => 
    typeof move === 'object' ? `${move.from}→${move.to}` : move
  ).join(', ')

  const prompt = `🎯 QUADRAX MASTER ANALYSIS:

📋 BOARD: ${boardString}
🎮 Phase: ${phase} | Player: ${currentPlayer} (${currentPlayer === 1 ? '○' : '●'})
🎯 Moves: ${movesString}

🏆 QUADRAX WIN CONDITIONS:
1. PRIMARY: Form a 2x2 SQUARE anywhere (positions like [0,1,4,5] or [5,6,9,10])
2. SECONDARY: 4-in-a-row (horizontal/vertical/diagonal)

🧠 As ${agentType.toUpperCase()}, choose the BEST move focusing on 2x2 squares!

Strategy Priority:
1. Win immediately (complete 2x2 square)
2. Block opponent's 2x2 threats  
3. Create multiple 2x2 opportunities
4. Control center (5,6,9,10)

Respond with ONLY valid JSON:
{
  "move": ${phase === 'placement' ? 'position_number' : '{"from": from_pos, "to": to_pos}'},
  "reasoning": "Focus on 2x2 square strategy",
  "confidence": 0.85
}`

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:latest',
        prompt: prompt,
        system: agentPersonalities[agentType],
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for more consistent JSON
          top_p: 0.8,
          max_tokens: 200
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.response || ''
    
    // Extract JSON more carefully
    const jsonMatch = aiResponse.match(/\{[^}]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          move: parsed.move,
          reasoning: parsed.reasoning || `${agentType.toUpperCase()} strategic decision`,
          confidence: parsed.confidence || 0.8,
          agent: agentType.toUpperCase()
        }
      } catch (parseError) {
        log(`❌ JSON parse error for ${agentType}: ${parseError.message}`, 'red')
      }
    }
  } catch (error) {
    log(`❌ ${agentType.toUpperCase()} Ollama error: ${error.message}`, 'red')
  }

  // Smart fallback based on agent type
  return getSmartFallback(availableMoves, phase, agentType, board, currentPlayer)
}

function getSmartFallback(moves, phase, agentType, board, currentPlayer) {
  if (moves.length === 0) return null

  // Check for immediate wins first
  for (const move of moves) {
    const testBoard = [...board]
    if (phase === 'placement') {
      testBoard[move] = currentPlayer
    } else {
      testBoard[move.from] = 0
      testBoard[move.to] = currentPlayer
    }
    
    const winResult = checkForWin(testBoard)
    if (winResult && winResult.winner === currentPlayer) {
      return {
        move: move,
        reasoning: `${agentType.toUpperCase()} found winning move!`,
        confidence: 1.0,
        agent: agentType.toUpperCase()
      }
    }
  }

  let selectedMove
  switch (agentType) {
    case 'alpha':
      // Strategic: prefer center positions
      const centerMoves = moves.filter(m => {
        const pos = phase === 'placement' ? m : m.to
        return [5, 6, 9, 10].includes(pos)
      })
      selectedMove = centerMoves.length > 0 ? centerMoves[0] : moves[0]
      break
    case 'beta':
      // Defensive: prefer safe positions, avoid edges
      const safeMoves = moves.filter(m => {
        const pos = phase === 'placement' ? m : m.to
        return ![0, 3, 12, 15].includes(pos) // Avoid corners
      })
      selectedMove = safeMoves.length > 0 ? safeMoves[0] : moves[0]
      break
    case 'gamma':
      // Aggressive: prefer moves that create threats
      selectedMove = moves[Math.floor(Math.random() * moves.length)]
      break
    case 'delta':
      // Adaptive: balanced approach
      selectedMove = moves[Math.floor(moves.length / 2)]
      break
    default:
      selectedMove = moves[0]
  }

  return {
    move: selectedMove,
    reasoning: `${agentType.toUpperCase()} tactical positioning`,
    confidence: 0.6,
    agent: agentType.toUpperCase()
  }
}

// Enhanced Referee System
function validateAndScoreMove(move, board, phase, currentPlayer, availableMoves) {
  // Check if move is valid
  let isValid = false
  
  if (phase === 'placement') {
    isValid = availableMoves.includes(move) && move >= 0 && move <= 15
  } else {
    isValid = availableMoves.some(m => 
      typeof m === 'object' && m.from === move.from && m.to === move.to
    )
  }
  
  if (!isValid) {
    return { valid: false, score: 0 }
  }
  
  // Create test board
  const testBoard = [...board]
  if (phase === 'placement') {
    testBoard[move] = currentPlayer
  } else {
    testBoard[move.from] = 0
    testBoard[move.to] = currentPlayer
  }
  
  let score = 20 // Base score for valid move
  
  // Check for immediate win
  const winResult = checkForWin(testBoard)
  if (winResult && winResult.winner === currentPlayer) {
    score += 1000 // Massive bonus for winning
  }
  
  // Check for blocking opponent win
  const opponent = currentPlayer === 1 ? 2 : 1
  for (const availableMove of availableMoves) {
    const opponentTestBoard = [...board]
    if (phase === 'placement') {
      if (typeof availableMove === 'number') {
        opponentTestBoard[availableMove] = opponent
      }
    } else if (typeof availableMove === 'object') {
      opponentTestBoard[availableMove.from] = 0
      opponentTestBoard[availableMove.to] = opponent
    }
    
    const opponentWin = checkForWin(opponentTestBoard)
    if (opponentWin && opponentWin.winner === opponent) {
      // Check if our move blocks this
      if (phase === 'placement') {
        if (move === availableMove) score += 500 // Block opponent win
      } else {
        if (move.to === availableMove.to) score += 500
      }
    }
  }
  
  // Center control bonus
  const centerSquares = [5, 6, 9, 10]
  const targetPos = phase === 'placement' ? move : move.to
  if (centerSquares.includes(targetPos)) {
    score += 50
  }
  
  return { valid: true, score }
}

async function getASIAllianceDecision(game) {
  const agentTypes = ['alpha', 'beta', 'gamma', 'delta']
  const availableMoves = game.getPossibleMoves()
  
  if (availableMoves.length === 0) {
    throw new Error('No available moves')
  }
  
  log(`🧠 ASI ALLIANCE consulting all agents...`, 'cyan')
  log(`🔍 Available moves: ${availableMoves.map(m => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}`, 'yellow')
  
  const agentDecisions = []
  
  // Get decisions from all 4 agents
  for (const agentType of agentTypes) {
    log(`🧠 Consulting ${agentType.toUpperCase()} agent...`, 'blue')
    
    try {
      const decision = await callASIAgent(
        game.board, 
        game.phase, 
        game.currentPlayer, 
        agentType, 
        availableMoves
      )
      
      if (decision) {
        log(`💭 ${decision.agent}: ${decision.reasoning}`, 'green')
        agentDecisions.push(decision)
      }
    } catch (error) {
      log(`❌ ${agentType.toUpperCase()} failed: ${error.message}`, 'red')
    }
  }
  
  if (agentDecisions.length === 0) {
    throw new Error('All agents failed')
  }
  
  // Referee validates and scores each decision
  log(`🏁 REFEREE: Analyzing ${agentDecisions.length} agent decisions...`, 'magenta')
  
  let bestDecision = null
  let bestScore = -1
  
  for (const decision of agentDecisions) {
    const validation = validateAndScoreMove(
      decision.move,
      game.board,
      game.phase,
      game.currentPlayer,
      availableMoves
    )
    
    if (validation.valid) {
      log(`✅ REFEREE: ${decision.agent} move valid (score: ${validation.score})`, 'green')
      if (validation.score > bestScore) {
        bestScore = validation.score
        bestDecision = decision
      }
    } else {
      log(`❌ REFEREE: ${decision.agent} proposed invalid move`, 'red')
    }
  }
  
  if (!bestDecision) {
    // Emergency fallback
    log(`🚨 REFEREE: All moves invalid, using first available`, 'red')
    return availableMoves[0]
  }
  
  log(`🏆 FINAL DECISION: ${bestDecision.agent} - ${bestDecision.reasoning}`, 'green')
  return bestDecision.move
}

async function playQuadraXBattle() {
  log('\n🤖 QUADRAX: ASI ALLIANCE BATTLE', 'cyan')
  log('═'.repeat(50), 'cyan')
  log('Watch 4 ASI agents battle with proper QuadraX rules!', 'bright')
  log('🎯 Win by forming 2x2 squares!', 'yellow')
  
  const game = new QuadraXGame()
  let turnCount = 0
  
  while (!game.gameOver && turnCount < 25) {
    turnCount++
    
    log(`\n🎮 TURN ${turnCount}`, 'yellow')
    game.displayBoard()
    
    const playerName = game.currentPlayer === 1 ? 'ASI-Blue ○' : 'ASI-Red ●'
    log(`\n🤖 ${playerName} thinking...`, 'bright')
    
    try {
      const move = await getASIAllianceDecision(game)
      
      if (game.phase === 'placement') {
        log(`✅ ${playerName} places at position ${move}`, 'green')
      } else {
        log(`✅ ${playerName} moves ${move.from} → ${move.to}`, 'green')
      }
      
      game.makeMove(move)
      
      if (game.gameOver) {
        log(`\n🏆 GAME OVER! ${game.winner === 1 ? 'ASI-Blue ○' : 'ASI-Red ●'} WINS!`, 'green')
        log(`🎯 Victory Type: ${game.winType}`, 'green')
        game.displayBoard()
        break
      }
      
    } catch (error) {
      log(`❌ Move failed: ${error.message}`, 'red')
      break
    }
  }
  
  if (!game.gameOver) {
    log('\n⏰ Game reached turn limit - analyzing final position...', 'yellow')
    game.displayBoard()
  }
}

// Run the battle
playQuadraXBattle().catch(console.error)