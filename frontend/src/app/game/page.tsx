'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Board, GameInfo } from '@/features/game'
import StakingPanel from '@/features/staking/StakingPanel'
import { IntelligentStakingPanel } from '@/features/staking/IntelligentStakingSystem'
import { useGameWithIntelligentStaking } from '@/features/game/CompleteGameIntegration'
import { AIChat } from '@/features/game'
import Link from 'next/link'

// Game position interface for AI analysis
interface GamePosition {
  board: number[]
  phase: 'placement' | 'movement'
  piecesPlaced: { player1: number, player2: number }
  currentPlayer: number
}

// PYUSD staking context for AI
interface PYUSDStakeContext {
  playerBalance: number
  opponentBalance: number
  minStake: number
  maxStake: number
  standardStake: number
  gameId?: string
}

export default function GamePage() {
  // === 3-PHASE FLOW STATE ===
  // Phase 1: negotiation → Phase 2: staking → Phase 3: gameplay
  const [gamePhase, setGamePhase] = useState<'negotiation' | 'staking' | 'gameplay' | 'finished'>('negotiation')
  const [isDemoMode, setIsDemoMode] = useState(false) // Free play without stakes
  
  // Strategic 4x4 QuadraX Game State
  const [board, setBoard] = useState<number[]>(Array(16).fill(0))
  const [currentPlayer, setCurrentPlayer] = useState<number>(1)
  const [gameId] = useState<number>(Math.floor(Math.random() * 1000000))
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [placementPhase, setPlacementPhase] = useState(true)
  
  // Staking state
  const [negotiatedStake, setNegotiatedStake] = useState<number | null>(null)
  const [isStaked, setIsStaked] = useState(false)
  const [pot, setPot] = useState('0')
  
  // Game position for AI analysis (live updates during gameplay)
  const [gamePosition, setGamePosition] = useState<GamePosition>({
    board: Array(16).fill(0),
    phase: 'placement',
    piecesPlaced: { player1: 0, player2: 0 },
    currentPlayer: 1
  })
  
  // Staking context for AI
  const [stakingContext, setStakingContext] = useState<PYUSDStakeContext>({
    playerBalance: 100,
    opponentBalance: 100,
    minStake: 1,
    maxStake: 10,
    standardStake: 6,
    gameId: gameId.toString()
  })
  
  // Update game position when board changes (for AI commentary)
  useEffect(() => {
    setGamePosition({
      board,
      phase: 'placement',
      piecesPlaced: {
        player1: board.filter(cell => cell === 1).length,
        player2: board.filter(cell => cell === 2).length
      },
      currentPlayer
    })
  }, [board, currentPlayer])

  // === PHASE 1: NEGOTIATION HANDLERS ===
  const handleNegotiationComplete = (stake: number | null, demo: boolean) => {
    if (demo) {
      setIsDemoMode(true)
      setNegotiatedStake(0)
      setPot('0')
      // Skip staking, go directly to gameplay
      setGamePhase('gameplay')
    } else if (stake && stake >= 1 && stake <= 10) {
      setNegotiatedStake(stake)
      setPot((stake * 2).toString())
      // Move to staking phase
      setGamePhase('staking')
    }
  }
  
  // === PHASE 2: STAKING HANDLERS ===
  const handleStakeLocked = (lockedGameId: number, stake: number) => {
    console.log('✅ Stake locked:', stake, 'PYUSD for game', lockedGameId)
    setIsStaked(true)
    // Move to gameplay phase after stake is locked
    setGamePhase('gameplay')
  }
  
  // === STRATEGIC 4x4 QUADRAX GAMEPLAY ===
  const handleCellClick = (index: number) => {
    if (gamePhase !== 'gameplay' || currentPlayer !== 1) return

    const player1Pieces = board.filter(cell => cell === 1).length
    const player2Pieces = board.filter(cell => cell === 2).length

    // PLACEMENT PHASE: Each player places 4 pieces
    if (placementPhase) {
      if (board[index] !== 0) return // Cell must be empty
      if (player1Pieces >= 4) return // Player already has 4 pieces

      const newBoard = [...board]
      newBoard[index] = 1 // Player 1 places X
      setBoard(newBoard)

      // Check for winner after placement (only if both players have placed all pieces)
      const newPlayer1Count = newBoard.filter(cell => cell === 1).length
      const newPlayer2Count = newBoard.filter(cell => cell === 2).length
      
      if (newPlayer1Count === 4 && newPlayer2Count === 4 && checkWinner(newBoard, 1)) {
        setGamePhase('finished')
        // Delay alert to allow board to visually update
        setTimeout(() => {
          alert(`🎉 You win during placement!${!isDemoMode ? `\n💰 Payout: ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD` : ''}`)
        }, 100)
        return
      }

      // Check if placement phase is complete
      if (newPlayer1Count === 4 && newPlayer2Count === 4) {
        setPlacementPhase(false)
      }

      // Switch to AI turn
      setCurrentPlayer(2)

      // Trigger AI placement after delay
      setTimeout(() => {
        makeAIPlacement(newBoard)
      }, 800)

    } else {
      // MOVEMENT PHASE: Select and move existing pieces
      if (selectedCell === null) {
        // First click: select a piece to move
        if (board[index] === 1) { // Only select player's own pieces
          setSelectedCell(index)
        }
      } else {
        // Second click: move the selected piece
        if (index === selectedCell) {
          // Clicking same cell deselects
          setSelectedCell(null)
          return
        }

        // Move the selected piece
        if (board[index] === 0) { // Can only move to empty cells
          const newBoard = [...board]
          newBoard[selectedCell] = 0 // Remove from old position
          newBoard[index] = 1 // Place in new position
          setBoard(newBoard)
          setSelectedCell(null)

          // Check for winner after movement
          if (checkWinner(newBoard, 1)) {
            setGamePhase('finished')
            // Delay alert to allow board to visually update
            setTimeout(() => {
              alert(`🎉 You win!${!isDemoMode ? `\n💰 Payout: ${(parseFloat(pot) * 0.9975).toFixed(4)} PYUSD` : ''}`)
            }, 100)
            return
          }

          // Switch to AI turn
          setCurrentPlayer(2)

          // Trigger AI movement after delay
          setTimeout(() => {
            makeAIMovement(newBoard)
          }, 800)
        }
      }
    }
  }

  const checkWinner = (board: number[], player: number): boolean => {
    // Horizontal (4 rows)
    for (let row = 0; row < 4; row++) {
      const start = row * 4
      if (
        board[start] === player &&
        board[start + 1] === player &&
        board[start + 2] === player &&
        board[start + 3] === player
      ) {
        return true
      }
    }

    // Vertical (4 columns)
    for (let col = 0; col < 4; col++) {
      if (
        board[col] === player &&
        board[col + 4] === player &&
        board[col + 8] === player &&
        board[col + 12] === player
      ) {
        return true
      }
    }

    // Diagonal (top-left to bottom-right)
    if (
      board[0] === player &&
      board[5] === player &&
      board[10] === player &&
      board[15] === player
    ) {
      return true
    }

    // Diagonal (top-right to bottom-left)
    if (
      board[3] === player &&
      board[6] === player &&
      board[9] === player &&
      board[12] === player
    ) {
      return true
    }

    // 2x2 squares (9 possible positions)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const topLeft = row * 4 + col
        if (
          board[topLeft] === player &&
          board[topLeft + 1] === player &&
          board[topLeft + 4] === player &&
          board[topLeft + 5] === player
        ) {
          return true
        }
      }
    }

    return false
  }

  // AI Agent-Powered Move Selection
  const getAIMove = async (board: number[], phase: 'placement' | 'movement', availableMoves: number[]): Promise<number> => {
    console.log('🤖 AI Move Request:', { board, phase, availableMoves })
    
    // Prepare board analysis for AI agents
    const boardAnalysis = {
      board: board,
      phase: phase,
      playerPieces: board.filter(cell => cell === 1).length,
      aiPieces: board.filter(cell => cell === 2).length,
      availableMoves: availableMoves,
      winningPatterns: getWinningPatterns()
    }

    try {
      // Query ASI Alliance agents for strategic analysis
      const response = await fetch('/api/ai/strategic-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardState: boardAnalysis,
          requestType: 'ruthless-optimal-move',
          difficulty: 'maximum'
        })
      })

      if (!response.ok) {
        console.error('❌ AI API Error:', response.status, response.statusText)
        // Fallback to first available move if API fails
        return availableMoves[0] || 0
      }

      const aiDecision = await response.json()
      console.log('🎯 AI Decision Response:', aiDecision)
      
      // Validate the AI's move
      if (aiDecision.move !== undefined && availableMoves.includes(aiDecision.move)) {
        console.log('✅ AI Selected Move:', aiDecision.move)
        return aiDecision.move
      } else {
        console.warn('⚠️ AI returned invalid move:', aiDecision.move, 'Available:', availableMoves)
        return availableMoves[0] || 0
      }
    } catch (error) {
      console.error('💥 AI Request Failed:', error)
      // Fallback to first available move
      return availableMoves[0] || 0
    }
  }

  const getAIMovement = async (board: number[], aiPieces: number[]): Promise<{from: number, to: number} | null> => {
    console.log('🔄 AI Movement Request:', { board, aiPieces })
    
    // Get all possible moves
    const possibleMoves = []
    const emptySpaces = board.map((cell, index) => cell === 0 ? index : null).filter(i => i !== null) as number[]
    
    for (const piece of aiPieces) {
      for (const target of emptySpaces) {
        possibleMoves.push({ from: piece, to: target })
      }
    }

    console.log('🎯 Possible AI Movements:', possibleMoves.length, 'options')

    try {
      // Query AI agents for best movement
      const response = await fetch('/api/ai/strategic-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardState: { board, aiPieces, possibleMoves },
          requestType: 'optimal-movement',
          difficulty: 'ruthless'
        })
      })

      if (!response.ok) {
        console.error('❌ AI Movement API Error:', response.status)
        return possibleMoves.length > 0 ? possibleMoves[0] : null
      }

      const aiDecision = await response.json()
      console.log('🎯 AI Movement Response:', aiDecision)
      
      if (aiDecision.movement) {
        console.log('✅ AI Selected Movement:', aiDecision.movement)
        return aiDecision.movement
      } else {
        console.warn('⚠️ AI returned no movement, using random')
        return possibleMoves.length > 0 ? possibleMoves[0] : null
      }
    } catch (error) {
      console.error('💥 AI Movement Request Failed:', error)
      return possibleMoves.length > 0 ? possibleMoves[0] : null
    }
  }

  const makeAIPlacement = async (currentBoard: number[]) => {
    console.log('🤖 AI Placement Turn Started')
    const availableMoves = currentBoard.map((cell, index) => cell === 0 ? index : null).filter(i => i !== null) as number[]
    console.log('📍 Available placement moves:', availableMoves)
    if (availableMoves.length === 0) return

    const aiMove = await getAIMove(currentBoard, 'placement', availableMoves)
    console.log('🎯 AI Selected Position:', aiMove)

    const newBoard = [...currentBoard]
    newBoard[aiMove] = 2 // AI places O
    setBoard(newBoard)

    // Check for AI winner (only if both players have placed all pieces)
    const finalPlayer1Count = newBoard.filter(cell => cell === 1).length
    const finalPlayer2Count = newBoard.filter(cell => cell === 2).length
    
    if (finalPlayer1Count === 4 && finalPlayer2Count === 4 && checkWinner(newBoard, 2)) {
      setGamePhase('finished')
      // Delay alert to allow board to visually update
      setTimeout(() => {
        alert('🤖 AI wins during placement!')
      }, 100)
      return
    }

    // Check if placement phase is complete
    if (finalPlayer1Count === 4 && finalPlayer2Count === 4) {
      setPlacementPhase(false)
    }

    // Switch back to player
    setCurrentPlayer(1)
  }

  const makeAIMovement = async (currentBoard: number[]) => {
    console.log('🚀 AI Movement Turn Started')
    const aiPieces = currentBoard.map((cell, index) => cell === 2 ? index : null).filter(i => i !== null) as number[]
    console.log('🔍 AI Pieces on board:', aiPieces)
    if (aiPieces.length === 0) return

    const aiMovement = await getAIMovement(currentBoard, aiPieces)
    console.log('➡️ AI Movement Decision:', aiMovement)
    if (!aiMovement) return

    const newBoard = [...currentBoard]
    newBoard[aiMovement.from] = 0 // Remove from old position
    newBoard[aiMovement.to] = 2 // Place in new position
    setBoard(newBoard)

    // Check for AI winner
    if (checkWinner(newBoard, 2)) {
      setGamePhase('finished')
      // Delay alert to allow board to visually update
      setTimeout(() => {
        alert('🤖 AI wins!')
      }, 100)
      return
    }

    // Switch back to player
    setCurrentPlayer(1)
  }

  const getWinningPatterns = () => {
    return [
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
  }

  const findWinningMove = (board: number[], player: number): number | null => {
    const patterns = getWinningPatterns()
    
    for (const pattern of patterns) {
      const cells = pattern.map(i => board[i])
      const playerCount = cells.filter(cell => cell === player).length
      const emptyCount = cells.filter(cell => cell === 0).length
      
      // If 3 pieces and 1 empty, that's a winning move
      if (playerCount === 3 && emptyCount === 1) {
        const emptyIndex = pattern[cells.indexOf(0)]
        return emptyIndex
      }
    }
    
    return null
  }

  const handleReset = () => {
    setBoard(Array(16).fill(0))
    setCurrentPlayer(1)
    setGamePhase('negotiation')
    setIsStaked(false)
    setPot('0')
    setNegotiatedStake(null)
    setIsDemoMode(false)
    setSelectedCell(null)
    setPlacementPhase(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-bold">QuadraX</span>
              <span className="text-sm text-white/60">Game Room</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          
          {/* === PHASE INDICATOR === */}
          <div className="lg:col-span-3 mb-4">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-center gap-4">
                {/* Phase 1: Negotiation */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  gamePhase === 'negotiation' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : gamePhase === 'staking' || gamePhase === 'gameplay' || gamePhase === 'finished'
                    ? 'bg-green-600/30 text-green-200'
                    : 'bg-white/10 text-white/40'
                }`}>
                  <span className="text-xl">{gamePhase === 'negotiation' ? '🤖' : '✅'}</span>
                  <span className="font-semibold">1. Negotiation</span>
                </div>

                <div className="text-white/40">→</div>

                {/* Phase 2: Staking */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  gamePhase === 'staking' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : gamePhase === 'gameplay' || gamePhase === 'finished'
                    ? 'bg-green-600/30 text-green-200'
                    : 'bg-white/10 text-white/40'
                }`}>
                  <span className="text-xl">{gamePhase === 'staking' ? '💰' : gamePhase === 'gameplay' || gamePhase === 'finished' ? '✅' : '🔒'}</span>
                  <span className="font-semibold">2. Staking</span>
                  {isDemoMode && (gamePhase === 'gameplay' || gamePhase === 'finished') && (
                    <span className="text-xs bg-yellow-500/30 px-2 py-0.5 rounded">DEMO</span>
                  )}
                </div>

                <div className="text-white/40">→</div>

                {/* Phase 3: Gameplay */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  gamePhase === 'gameplay' 
                    ? 'bg-green-600 text-white shadow-lg animate-pulse' 
                    : gamePhase === 'finished'
                    ? 'bg-green-600/30 text-green-200'
                    : 'bg-white/10 text-white/40'
                }`}>
                  <span className="text-xl">{gamePhase === 'gameplay' ? '🎮' : gamePhase === 'finished' ? '🏆' : '⏳'}</span>
                  <span className="font-semibold">3. Gameplay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Panel - Game Info */}
          <div className="space-y-6">
            <GameInfo
              currentPlayer={currentPlayer}
              player1Address="0x1234...5678"
              player2Address="0x8765...4321"
              pot={pot}
              gameStatus={gamePhase === 'gameplay' ? 'playing' : gamePhase === 'finished' ? 'finished' : 'waiting'}
            />

            {/* Phase-specific panels */}
            {gamePhase === 'staking' && negotiatedStake && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">💰 Stake Confirmation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Agreed Stake:</span>
                    <span className="font-bold text-green-400">{negotiatedStake} PYUSD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Pot:</span>
                    <span className="font-bold">{negotiatedStake * 2} PYUSD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Platform Fee:</span>
                    <span>0.25%</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                    <span className="text-white/60">Winner Gets:</span>
                    <span className="font-bold text-blue-400">{(negotiatedStake * 2 * 0.9975).toFixed(4)} PYUSD</span>
                  </div>
                </div>
              </div>
            )}

            {gamePhase === 'finished' && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-green-400">🎉 Game Over!</h3>
                <button
                  onClick={handleReset}
                  className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-blue-600
                           font-semibold btn-hover"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Center - Game Board */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Board
                board={board}
                onCellClick={handleCellClick}
                currentPlayer={currentPlayer}
                disabled={gamePhase !== 'gameplay'}
                selectedCell={selectedCell}
                gamePhase={placementPhase ? 'placement' : 'movement'}
                piecesPlaced={{
                  player1: board.filter(cell => cell === 1).length,
                  player2: board.filter(cell => cell === 2).length
                }}
              />

              {/* Phase status message */}
              <div className="mt-4 glass rounded-xl p-4 text-center">
                {gamePhase === 'negotiation' && (
                  <div className="space-y-3">
                    <p className="text-sm text-white/80">
                      💬 <strong>Step 1:</strong> Chat with AI to negotiate stakes or try demo mode
                    </p>
                    
                    {/* Quick Demo Button */}
                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleNegotiationComplete(null, true)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 
                                   text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl 
                                   transform hover:scale-105 transition-all duration-200
                                   border-2 border-yellow-400/20 hover:border-yellow-300/40"
                      >
                        🎮 Start Demo Game
                      </button>
                      <p className="text-xs text-white/60 mt-2">
                        Skip negotiation • No stakes • Instant play
                      </p>
                    </div>
                  </div>
                )}
                {gamePhase === 'staking' && (
                  <p className="text-sm text-white/80">
                    🔐 <strong>Step 2:</strong> Confirm stake and lock PYUSD in smart contract
                  </p>
                )}
                {gamePhase === 'gameplay' && (
                  <p className="text-sm text-green-400">
                    🎮 <strong>Playing!</strong> Make your moves - AI is watching
                  </p>
                )}
                {gamePhase === 'finished' && (
                  <p className="text-sm text-yellow-400">
                    🏆 <strong>Game Complete!</strong> Check results above
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Game Strategy & AI */}
          <div className="space-y-6">
            {/* Strategic Game Guide */}
            <div className="glass rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span>
                4x4 QuadraX Rules
              </h3>
              
              <div className="space-y-4 text-sm">
                {/* Game Phases */}
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">Game Phases</h4>
                  <div className="space-y-1 text-white/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">🔹</span>
                      <span><strong>Placement:</strong> Each player places 4 pieces</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">🔄</span>
                      <span><strong>Movement:</strong> Move any piece to any empty cell</span>
                    </div>
                  </div>
                </div>

                {/* Win Conditions */}
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">Win Conditions</h4>
                  <div className="space-y-2 text-white/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">→</span>
                      <span>4 in a row (horizontal/vertical/diagonal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">⬛</span>
                      <span>2x2 square block anywhere on board</span>
                    </div>
                    
                    {/* Mini pattern examples */}
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-white/60">Winning Patterns:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* 4-in-row example */}
                        <div className="bg-slate-800/30 rounded p-2">
                          <div className="text-xs text-cyan-400 mb-1">4-in-Row</div>
                          <div className="grid grid-cols-4 gap-0.5">
                            {[1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0].map((cell, i) => (
                              <div key={i} className={`w-2 h-2 rounded-sm ${
                                cell === 1 ? 'bg-cyan-400' : 'bg-slate-600/50'
                              }`}></div>
                            ))}
                          </div>
                        </div>
                        
                        {/* 2x2 block example */}
                        <div className="bg-slate-800/30 rounded p-2">
                          <div className="text-xs text-purple-400 mb-1">2x2 Block</div>
                          <div className="grid grid-cols-4 gap-0.5">
                            {[1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0].map((cell, i) => (
                              <div key={i} className={`w-2 h-2 rounded-sm ${
                                cell === 1 ? 'bg-purple-400' : 'bg-slate-600/50'
                              }`}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Game Stats */}
                {gamePhase === 'gameplay' && (
                  <div>
                    <h4 className="font-semibold text-yellow-400 mb-2">Game Status</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-cyan-400 font-semibold">Player X</div>
                        <div className="text-white/80">{board.filter(cell => cell === 1).length}/4 pieces</div>
                      </div>
                      <div className="bg-slate-800/50 rounded p-2">
                        <div className="text-pink-400 font-semibold">AI O</div>
                        <div className="text-white/80">{board.filter(cell => cell === 2).length}/4 pieces</div>
                      </div>
                      <div className="col-span-2 bg-slate-800/50 rounded p-2">
                        <div className="text-white/90">
                          Phase: <span className="text-yellow-400 font-semibold">
                            {placementPhase ? 'Placement' : 'Movement'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Chat */}
            <AIChat 
              aiName="QuadraX AI" 
              enabled={true}
              gameId={gameId.toString()}
              gamePosition={gamePhase === 'gameplay' ? gamePosition : undefined}
              stakingContext={stakingContext}
              onStakeLocked={handleStakeLocked}
              onNegotiationComplete={handleNegotiationComplete}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-white/60">
            Built for ETHOnline 2024 | PYUSD × ASI × Hedera
          </p>
        </div>
      </footer>
    </div>
  )
}
