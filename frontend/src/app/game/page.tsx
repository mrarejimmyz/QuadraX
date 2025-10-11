'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Board, GameInfo } from '@/features/game'
import StakingPanel from '@/features/staking/StakingPanel'
import { AIChat } from '@/features/game'
import Link from 'next/link'

export default function GamePage() {
  const [board, setBoard] = useState<number[]>(Array(16).fill(0))
  const [currentPlayer, setCurrentPlayer] = useState<number>(1)
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting')
  const [isStaked, setIsStaked] = useState(false)
  const [pot, setPot] = useState('0')

  const handleCellClick = (index: number) => {
    if (gameStatus !== 'playing') return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    // Check for winner (simplified - needs proper implementation)
    if (checkWinner(newBoard, currentPlayer)) {
      setGameStatus('finished')
      alert(`Player ${currentPlayer === 1 ? 'X' : 'O'} wins!`)
      return
    }

    // Switch player
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
  }

  const checkWinner = (board: number[], player: number): boolean => {
    // Check rows
    for (let row = 0; row < 4; row++) {
      if (
        board[row * 4] === player &&
        board[row * 4 + 1] === player &&
        board[row * 4 + 2] === player &&
        board[row * 4 + 3] === player
      ) {
        return true
      }
    }

    // Check columns
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

    // Check diagonals
    if (
      board[0] === player &&
      board[5] === player &&
      board[10] === player &&
      board[15] === player
    ) {
      return true
    }

    if (
      board[3] === player &&
      board[6] === player &&
      board[9] === player &&
      board[12] === player
    ) {
      return true
    }

    return false
  }

  const handleStake = (amount: string) => {
    console.log('Staking:', amount)
    setIsStaked(true)
    setPot(amount)
    // In real implementation, this would interact with smart contract
    setTimeout(() => {
      setGameStatus('playing')
    }, 2000)
  }

  const handleReset = () => {
    setBoard(Array(16).fill(0))
    setCurrentPlayer(1)
    setGameStatus('waiting')
    setIsStaked(false)
    setPot('0')
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
          {/* Left Panel - Game Info & Staking */}
          <div className="space-y-6">
            <GameInfo
              currentPlayer={currentPlayer}
              player1Address="0x1234...5678"
              player2Address="0x8765...4321"
              pot={pot}
              gameStatus={gameStatus}
            />

            {gameStatus === 'waiting' && (
              <StakingPanel
                onStakeComplete={handleStake}
              />
            )}

            {gameStatus === 'finished' && (
              <div className="glass rounded-xl p-6">
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
                disabled={gameStatus !== 'playing'}
              />

              {/* Game Mode Selector */}
              {gameStatus === 'waiting' && (
                <div className="mt-6 glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3 text-white/80">Game Mode</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all">
                      vs Human
                    </button>
                    <button className="py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-all">
                      vs AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div>
            <AIChat aiName="QuadraX AI" enabled={gameStatus === 'playing'} />
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
