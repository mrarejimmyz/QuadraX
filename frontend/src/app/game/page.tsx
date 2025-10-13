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
  
  // Game state
  const [board, setBoard] = useState<number[]>(Array(16).fill(0))
  const [currentPlayer, setCurrentPlayer] = useState<number>(1)
  const [gameId] = useState<number>(Math.floor(Math.random() * 1000000))
  
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
  
  // === PHASE 3: GAMEPLAY HANDLERS ===
  const handleCellClick = (index: number) => {
    if (gamePhase !== 'gameplay') return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    // Check for winner
    if (checkWinner(newBoard, currentPlayer)) {
      setGamePhase('finished')
      const winnerName = currentPlayer === 1 ? 'X' : 'O'
      const payout = isDemoMode ? 0 : parseFloat(pot) * 0.9975 // 0.25% fee
      alert(`🎉 Player ${winnerName} wins!${!isDemoMode ? `\n💰 Payout: ${payout.toFixed(4)} PYUSD` : ''}`)
      return
    }

    // Switch player
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
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

  const handleReset = () => {
    setBoard(Array(16).fill(0))
    setCurrentPlayer(1)
    setGamePhase('negotiation')
    setIsStaked(false)
    setPot('0')
    setNegotiatedStake(null)
    setIsDemoMode(false)
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
              />

              {/* Phase status message */}
              <div className="mt-4 glass rounded-xl p-4 text-center">
                {gamePhase === 'negotiation' && (
                  <p className="text-sm text-white/80">
                    💬 <strong>Step 1:</strong> Chat with AI to negotiate stakes or try demo mode
                  </p>
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

          {/* Right Panel - AI Chat (Always Active) */}
          <div>
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
