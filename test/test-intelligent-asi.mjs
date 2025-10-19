/**
 * ASI vs ASI BATTLE - WITH REFEREE VALIDATION
 * This version includes referee validation to ensure proper QuadraX gameplay
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
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
}

function log(message, color = 'reset') {
  console.log(c[color] + message + c.reset)
}

// QuadraX Referee System
class QuadraXReferee {
  static validateMove(move, availableMoves, phase) {
    if (phase === 'placement') {
      return availableMoves.includes(move)
    } else {
      return availableMoves.some(m => 
        m.from === move.from && m.to === move.to
      )
    }
  }

  static checkWinningCondition(board) {
    // Check for 2x2 squares (QuadraX win condition)
    const patterns = [
      [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
      [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
      [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
    ]
    
    for (const pattern of patterns) {
      for (const player of [1, 2]) {
        if (pattern.every(pos => board[pos] === player)) {
          return { winner: player, pattern }
        }
      }
    }
    return null
  }

  static findWinningMove(board, player, availableMoves, phase) {
    for (const move of availableMoves) {
      const testBoard = [...board]
      
      if (phase === 'placement') {
        testBoard[move] = player
      } else {
        testBoard[move.from] = 0
        testBoard[move.to] = player
      }
      
      const winCheck = this.checkWinningCondition(testBoard)
      if (winCheck && winCheck.winner === player) {
        return move
      }
    }
    return null
  }

  static findBlockingMove(board, currentPlayer, availableMoves, phase) {
    const opponent = currentPlayer === 1 ? 2 : 1
    
    for (const move of availableMoves) {
      const testBoard = [...board]
      
      if (phase === 'placement') {
        testBoard[move] = opponent // Test if opponent would win
      } else {
        testBoard[move.from] = 0
        testBoard[move.to] = opponent
      }
      
      const winCheck = this.checkWinningCondition(testBoard)
      if (winCheck && winCheck.winner === opponent) {
        return move // Block this winning move
      }
    }
    return null
  }

  static scoreMove(move, board, player, phase) {
    const testBoard = [...board]
    
    if (phase === 'placement') {
      testBoard[move] = player
    } else {
      testBoard[move.from] = 0
      testBoard[move.to] = player
    }
    
    // Score based on strategic value
    let score = 0
    
    // Center control bonus
    const centerPositions = [5, 6, 9, 10]
    const targetPos = phase === 'placement' ? move : move.to
    if (centerPositions.includes(targetPos)) {
      score += 30
    }
    
    // Corner control bonus
    const cornerPositions = [0, 3, 12, 15]
    if (cornerPositions.includes(targetPos)) {
      score += 20
    }
    
    // Check how many 2x2 patterns this move contributes to
    const patterns = [
      [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
      [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
      [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
    ]
    
    for (const pattern of patterns) {
      if (pattern.includes(targetPos)) {
        const playerPieces = pattern.filter(pos => testBoard[pos] === player).length
        const emptySpaces = pattern.filter(pos => testBoard[pos] === 0).length
        const opponentPieces = pattern.filter(pos => testBoard[pos] !== player && testBoard[pos] !== 0).length
        
        if (opponentPieces === 0) { // No opponent pieces blocking
          score += playerPieces * 10 + emptySpaces * 2
        }
      }
    }
    
    return score
  }

  static getBestMove(agentDecisions, gameState) {
    log('🏁 REFEREE: Analyzing agent decisions...', 'cyan')
    
    const validDecisions = agentDecisions.filter(decision => {
      const isValid = this.validateMove(decision.move, gameState.availableMoves, gameState.phase)
      if (!isValid) {
        log(`❌ REFEREE: ${decision.agent} proposed invalid move`, 'red')
      }
      return isValid
    })
    
    if (validDecisions.length === 0) {
      log('❌ REFEREE: No valid moves proposed, using first available', 'red')
      return {
        move: gameState.availableMoves[0],
        agent: 'REFEREE-FALLBACK',
        reasoning: 'No valid agent moves available',
        confidence: 0.5
      }
    }
    
    // Check for winning moves first
    const winningMove = this.findWinningMove(
      gameState.board, 
      gameState.currentPlayer, 
      gameState.availableMoves, 
      gameState.phase
    )
    
    if (winningMove) {
      log('🏆 REFEREE: Winning move detected!', 'green')
      return {
        move: winningMove,
        agent: 'REFEREE-WINNING',
        reasoning: 'Immediate winning move',
        confidence: 1.0
      }
    }
    
    // Check for blocking moves
    const blockingMove = this.findBlockingMove(
      gameState.board,
      gameState.currentPlayer,
      gameState.availableMoves,
      gameState.phase
    )
    
    if (blockingMove) {
      log('🛡️ REFEREE: Blocking move detected!', 'yellow')
      return {
        move: blockingMove,
        agent: 'REFEREE-BLOCKING',
        reasoning: 'Critical blocking move',
        confidence: 0.9
      }
    }
    
    // Score all valid decisions
    const scoredDecisions = validDecisions.map(decision => ({
      ...decision,
      score: this.scoreMove(decision.move, gameState.board, gameState.currentPlayer, gameState.phase)
    }))
    
    // Select highest scoring move
    const bestDecision = scoredDecisions.reduce((best, current) => 
      current.score > best.score ? current : best
    )
    
    log(`✅ REFEREE: Selected ${bestDecision.agent} move (score: ${bestDecision.score})`, 'green')
    return bestDecision
  }
}

class QuadraXGame {
  constructor() {
    this.board = Array(16).fill(0)
    this.phase = 'placement'
    this.currentPlayer = 1
    this.gameOver = false
    this.winner = null
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
    
    // Up, Down, Left, Right
    if (row > 0) adjacent.push(pos - 4)     // Up
    if (row < 3) adjacent.push(pos + 4)     // Down  
    if (col > 0) adjacent.push(pos - 1)     // Left
    if (col < 3) adjacent.push(pos + 1)     // Right
    
    return adjacent
  }

  makeMove(move) {
    if (this.phase === 'placement') {
      this.board[move] = this.currentPlayer
      this.placedPieces[this.currentPlayer]++
      
      if (this.placedPieces[1] === 4 && this.placedPieces[2] === 4) {
        this.phase = 'movement'
        log('\n🔄 TRANSITIONING TO MOVEMENT PHASE!', 'magenta')
      }
    } else {
      this.board[move.from] = 0
      this.board[move.to] = this.currentPlayer
    }
    
    this.checkWinner()
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1
  }

  checkWinner() {
    const result = checkForWin(this.board)
    if (result) {
      this.gameOver = true
      this.winner = result.winner
      log(`🏆 WIN DETECTED: ${result.type} at positions [${result.positions.join(', ')}]`, 'green')
    }
  }
}

// QuadraX Win Detection - CORRECT RULES
function checkForWin(board) {
  // PRIMARY WIN CONDITION: 2x2 squares (most common)
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
    // Rows
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    // Columns  
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    // Diagonals
    [0, 5, 10, 15], [3, 6, 9, 12]
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
}

// Direct Ollama Agent Calls
async function callOllamaAgent(board, phase, currentPlayer, agentType, availableMoves) {
  const agentPersonalities = {
    alpha: "You are AlphaStrategist, a master strategic AI. You prioritize center control and long-term positioning.",
    beta: "You are BetaDefender, a defensive specialist. You focus on blocking opponents and maintaining strong defensive positions.",
    gamma: "You are GammaAggressor, an aggressive attacker. You seek immediate wins and apply constant pressure.",
    delta: "You are DeltaAdaptive, an adaptive intelligence. You change strategy based on the current game state."
  }

  const boardString = board.map((cell, idx) => 
    `${idx}:${cell === 0 ? '·' : cell === 1 ? '○' : '●'}`
  ).join(' ')

  const movesString = availableMoves.map(move => 
    typeof move === 'object' ? `${move.from}→${move.to}` : move
  ).join(', ')

  const prompt = `🎯 QUADRAX GAME ANALYSIS (EXPERT LEVEL):

📋 CURRENT BOARD: ${boardString}
🎮 Phase: ${phase} | Player: ${currentPlayer} (${currentPlayer === 1 ? '○' : '●'})
🎯 Available Moves: ${movesString}

🏆 QUADRAX WIN CONDITIONS (CRITICAL):
1. PRIMARY: Form a 2x2 SQUARE anywhere on the board (most common win)
2. SECONDARY: Get 4-in-a-row (horizontal/vertical/diagonal) - rare with only 4 pieces

📏 QUADRAX RULES:
- 4x4 board with EXACTLY 4 pieces per player
- Phase 1: PLACEMENT - Place your 4 pieces strategically
- Phase 2: MOVEMENT - Move pieces to adjacent empty squares
- NO TIES - games always end with a winner
- Focus on 2x2 squares, not classic tic-tac-toe lines!

🧠 As ${agentType.toUpperCase()}, analyze this position and choose the OPTIMAL move.

🎯 Strategy Priority:
1. Win immediately if possible (complete a 2x2 square)
2. Block opponent's 2x2 square threats
3. Create multiple 2x2 square opportunities
4. Control center squares (5,6,9,10) for maximum flexibility

Respond with VALID JSON only:
{
  "move": ${phase === 'placement' ? 'position_number' : '{"from": from_pos, "to": to_pos}'},
  "reasoning": "Focus on 2x2 squares and specific QuadraX strategy",
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
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 150
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.response || ''
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        move: parsed.move,
        reasoning: parsed.reasoning || `${agentType.toUpperCase()} strategic decision`,
        confidence: parsed.confidence || 0.8,
        agent: agentType.toUpperCase()
      }
    }
  } catch (error) {
    log(`❌ ${agentType.toUpperCase()} Ollama error: ${error.message}`, 'red')
  }

  // Fallback to smart logic
  return getSmartFallback(availableMoves, phase, agentType)
}

function getSmartFallback(moves, phase, agentType) {
  if (moves.length === 0) return null

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
      // Defensive: prefer safe positions
      selectedMove = moves[Math.floor(Math.random() * Math.min(2, moves.length))]
      break
    case 'gamma':
      // Aggressive: prefer attacking positions
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
    reasoning: `${agentType.toUpperCase()} fallback strategy`,
    confidence: 0.6,
    agent: agentType.toUpperCase()
  }
}

async function getIntelligentMove(game, playerType) {
  const agentTypes = ['alpha', 'beta', 'gamma', 'delta']
  log(`� ASI ALLIANCE (${playerType === 1 ? 'Blue ○' : 'Red ●'}) consulting all agents...`, 'cyan')
  
  const availableMoves = game.getPossibleMoves()
  log(`🔍 Available moves: ${availableMoves.map(m => typeof m === 'object' ? `${m.from}→${m.to}` : m).join(', ')}`, 'yellow')
  
  // Get decisions from all 4 agents
  const agentDecisions = []
  
  for (const agentType of agentTypes) {
    try {
      log(`🧠 Consulting ${agentType.toUpperCase()} agent...`, 'magenta')
      const decision = await callOllamaAgent(game.board, game.phase, game.currentPlayer, agentType, availableMoves)
      
      if (decision && decision.move) {
        agentDecisions.push({
          agent: agentType.toUpperCase(),
          move: decision.move,
          reasoning: decision.reasoning,
          confidence: decision.confidence
        })
        log(`💭 ${agentType.toUpperCase()}: ${decision.reasoning}`, 'green')
      }
    } catch (error) {
      log(`❌ ${agentType.toUpperCase()} failed: ${error.message}`, 'red')
    }
  }
  
  // Referee validates and selects best move
  const gameState = {
    board: game.board,
    phase: game.phase,
    currentPlayer: game.currentPlayer,
    availableMoves: availableMoves
  }
  
  const finalDecision = QuadraXReferee.getBestMove(agentDecisions, gameState)
  
  log(`🏆 FINAL DECISION: ${finalDecision.agent} - ${finalDecision.reasoning}`, 'bright')
  return finalDecision.move
}

async function playIntelligentASIvsASI() {
  log('\n🤖 ASI ALLIANCE vs ASI ALLIANCE + REFEREE', 'cyan')
  log('═'.repeat(50), 'cyan')
  log('Watch 4 ASI agents battle with referee validation!', 'bright')
  log('🎯 Alpha: Strategic | 🛡️ Beta: Defensive | ⚔️ Gamma: Aggressive | 🔄 Delta: Adaptive', 'yellow')
  
  const game = new QuadraXGame()
  let turnCount = 0
  
  while (!game.gameOver && turnCount < 25) {
    turnCount++
    
    log(`\n🎮 TURN ${turnCount}`, 'yellow')
    game.displayBoard()
    
    const playerName = game.currentPlayer === 1 ? 'ASI-Blue ○' : 'ASI-Red ●'
    log(`\n🤖 ${playerName} thinking...`, 'bright')
    
    try {
      const move = await getIntelligentMove(game, game.currentPlayer)
      
      if (game.phase === 'placement') {
        log(`✅ ${playerName} places at position ${move}`, 'green')
      } else {
        log(`✅ ${playerName} moves ${move.from} → ${move.to}`, 'green')
      }
      
      game.makeMove(move)
      
      if (game.gameOver) {
        log(`\n🏆 GAME OVER! ${game.winner === 1 ? 'ASI-Blue ○' : 'ASI-Red ●'} WINS!`, 'green')
        game.displayBoard()
        
        // Show winning pattern
        const winResult = QuadraXReferee.checkWinningCondition(game.board)
        if (winResult) {
          log(`🎯 Winning pattern: positions ${winResult.pattern.join(', ')}`, 'cyan')
        }
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

// Run the intelligent battle
playIntelligentASIvsASI().catch(console.error)