/**
 * ASI vs ASI - Complete QuadraX Game
 * Watch two ASI Alliance agents battle each other in a full game!
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

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class QuadraXGame {
  constructor() {
    this.board = new Array(16).fill(0) // 0=empty, 1=Player1(X), 2=Player2(O)
    this.currentPlayer = 1
    this.phase = 'placement'
    this.piecesPlaced = { 1: 0, 2: 0 }
    this.moveHistory = []
    this.gameOver = false
    this.winner = null
  }

  displayBoard() {
    log('\n📋 CURRENT BOARD:', 'cyan')
    for (let i = 0; i < 4; i++) {
      const row = this.board.slice(i * 4, i * 4 + 4)
        .map((cell, j) => {
          const pos = i * 4 + j
          const piece = cell === 0 ? '·' : cell === 1 ? '○' : '●'
          const colored = cell === 1 ? `${c.blue}○${c.reset}` : 
                        cell === 2 ? `${c.red}●${c.reset}` : '·'
          return `${pos.toString().padStart(2)}:${colored}`
        }).join(' ')
      log(`  ${row}`)
    }
    log(`Phase: ${this.phase} | Turn: Player ${this.currentPlayer} ${this.currentPlayer === 1 ? '○' : '●'}`)
  }

  getPossibleMoves() {
    if (this.phase === 'placement') {
      return this.board.map((cell, i) => cell === 0 ? i : null).filter(i => i !== null)
    } else {
      // Movement phase: find all valid movements
      const moves = []
      const playerPieces = this.board.map((cell, i) => cell === this.currentPlayer ? i : null)
        .filter(i => i !== null)
      
      for (const from of playerPieces) {
        const adjacents = this.getAdjacentPositions(from)
        for (const to of adjacents) {
          if (this.board[to] === 0) {
            moves.push({ from, to })
          }
        }
      }
      return moves
    }
  }

  getAdjacentPositions(pos) {
    const row = Math.floor(pos / 4)
    const col = pos % 4
    const adjacents = []
    
    // Up, Down, Left, Right
    if (row > 0) adjacents.push((row - 1) * 4 + col)
    if (row < 3) adjacents.push((row + 1) * 4 + col)
    if (col > 0) adjacents.push(row * 4 + (col - 1))
    if (col < 3) adjacents.push(row * 4 + (col + 1))
    
    return adjacents
  }

  makeMove(move) {
    if (this.phase === 'placement') {
      this.board[move] = this.currentPlayer
      this.piecesPlaced[this.currentPlayer]++
      this.moveHistory.push({ player: this.currentPlayer, type: 'place', position: move })
      
      // Check if placement phase is over
      if (this.piecesPlaced[1] === 4 && this.piecesPlaced[2] === 4) {
        this.phase = 'movement'
        log('\n🔄 TRANSITIONING TO MOVEMENT PHASE!', 'yellow')
      }
    } else {
      // Movement
      this.board[move.from] = 0
      this.board[move.to] = this.currentPlayer
      this.moveHistory.push({ 
        player: this.currentPlayer, 
        type: 'move', 
        from: move.from, 
        to: move.to 
      })
    }

    // Check for win
    this.checkWin()
    
    // Switch players
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1
  }

  checkWin() {
    const player = this.currentPlayer
    
    // Check 4-in-a-row (horizontal, vertical, diagonal)
    const winPatterns = [
      // Horizontal
      [0,1,2,3], [4,5,6,7], [8,9,10,11], [12,13,14,15],
      // Vertical  
      [0,4,8,12], [1,5,9,13], [2,6,10,14], [3,7,11,15],
      // Diagonal
      [0,5,10,15], [3,6,9,12]
    ]
    
    for (const pattern of winPatterns) {
      if (pattern.every(pos => this.board[pos] === player)) {
        this.gameOver = true
        this.winner = player
        return
      }
    }
    
    // Check 2x2 squares
    const squarePatterns = [
      [0,1,4,5], [1,2,5,6], [2,3,6,7],
      [4,5,8,9], [5,6,9,10], [6,7,10,11],
      [8,9,12,13], [9,10,13,14], [10,11,14,15]
    ]
    
    for (const pattern of squarePatterns) {
      if (pattern.every(pos => this.board[pos] === player)) {
        this.gameOver = true
        this.winner = player
        return
      }
    }
  }
}

async function getASIMove(game) {
  try {
    const response = await fetch('http://localhost:3000/api/ai/strategic-move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        board: game.board,
        phase: game.phase,
        currentPlayer: game.currentPlayer,
        possibleMoves: game.getPossibleMoves(),
        requestType: 'strategic-move',
        difficulty: 'hard'
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const result = await response.json()
    return result
    
  } catch (error) {
    log(`❌ ASI call failed: ${error.message}`, 'red')
    // Return random fallback
    const moves = game.getPossibleMoves()
    return { move: moves[0] }
  }
}

async function playASIvsASI() {
  log('\n🤖 ASI ALLIANCE vs ASI ALLIANCE', 'cyan')
  log('═'.repeat(50), 'cyan')
  log('Watch two ASI agents battle in QuadraX!', 'bright')
  
  const game = new QuadraXGame()
  let turnCount = 0
  
  while (!game.gameOver && turnCount < 50) {
    turnCount++
    
    log(`\n🎮 TURN ${turnCount}`, 'yellow')
    game.displayBoard()
    
    const playerName = game.currentPlayer === 1 ? 'ASI-Blue ○' : 'ASI-Red ●'
    log(`\n🤖 ${playerName} thinking...`, 'blue')
    
    await sleep(1000) // Dramatic pause
    
    // Debug: Show what we're sending to ASI
    const possibleMoves = game.getPossibleMoves()
    log(`🔍 Available moves for Player ${game.currentPlayer}: [${game.phase === 'placement' ? possibleMoves.join(', ') : possibleMoves.map(m => `${m.from}→${m.to}`).join(', ')}]`, 'yellow')
    
    const aiResult = await getASIMove(game)
    
    let moveDescription
    if (game.phase === 'placement') {
      moveDescription = `places at position ${aiResult.move}`
      game.makeMove(aiResult.move)
    } else {
      if (typeof aiResult.move === 'object' && 'from' in aiResult.move) {
        moveDescription = `moves ${aiResult.move.from} → ${aiResult.move.to}`
        game.makeMove(aiResult.move)
      } else {
        log('⚠️ Invalid move format received', 'yellow')
        const moves = game.getPossibleMoves()
        const fallbackMove = moves[0]
        moveDescription = `fallback move ${fallbackMove.from} → ${fallbackMove.to}`
        game.makeMove(fallbackMove)
      }
    }
    
    log(`✅ ${playerName} ${moveDescription}`, 'green')
    
    // Show which specific ASI agent made the decision
    if (aiResult.agent && aiResult.agent !== 'Unknown') {
      log(`🤖 Agent: ${aiResult.agent}`, 'cyan')
    }
    
    if (aiResult.reasoning) {
      const shortReason = aiResult.reasoning.substring(0, 80) + '...'
      log(`💭 Reasoning: ${shortReason}`, 'magenta')
    }
    
    if (game.gameOver) {
      break
    }
    
    await sleep(500)
  }
  
  // Game Over
  log('\n' + '═'.repeat(50), 'cyan')
  game.displayBoard()
  
  if (game.winner) {
    const winnerName = game.winner === 1 ? 'ASI-Blue ○' : 'ASI-Red ●'
    log(`\n🏆 GAME OVER! ${winnerName} WINS!`, 'bgGreen')
  } else if (turnCount >= 50) {
    log('\n⏱️ GAME TIMEOUT - DRAW!', 'yellow')
  } else {
    log('\n🤝 DRAW!', 'yellow')
  }
  
  log(`\n📊 Game Stats:`)
  log(`- Total turns: ${turnCount}`)
  log(`- Phase reached: ${game.phase}`)
  log(`- Pieces placed: P1=${game.piecesPlaced[1]}, P2=${game.piecesPlaced[2]}`)
  
  log('\n🎯 ASI Alliance Battle Complete!', 'cyan')
}

playASIvsASI().catch(console.error)