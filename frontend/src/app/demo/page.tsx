'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { ASIAllianceFactory } from '@/lib/agents/asi-alliance'
import { HybridBulletproofValidator } from '@/lib/agents/asi-alliance/hybridValidator'
import type { GamePosition } from '@/lib/agents/asi-alliance/types'

type Cell = number // 0 = empty, 1 = Player (X), 2 = AI (O)
type Board = Cell[]

export default function DemoPage() {
  const { address, isConnected } = useAccount()
  const [board, setBoard] = useState<Board>(Array(16).fill(0))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [placementPhase, setPlacementPhase] = useState(true)
  const [playerPieces, setPlayerPieces] = useState(0)
  const [aiPieces, setAIPieces] = useState(0)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [aiMessage, setAIMessage] = useState<string>('')
  const [agents, setAgents] = useState<any>(null)

  // Log connection status for debugging
  useEffect(() => {
    console.log('🔗 Wallet connection status:', { isConnected, address })
  }, [isConnected, address])

  // Initialize AI agents
  useEffect(() => {
    const initAgents = async () => {
      const allAgents = await ASIAllianceFactory.createAllAgents()
      setAgents(allAgents)
      setAIMessage('🤖 AI agents initialized and ready!')
    }
    initAgents()
  }, [])

  const checkWinner = (currentBoard: Board): number | null => {
    // Check 4-in-a-row (horizontal, vertical, diagonal)
    const lines = [
      // Horizontal
      [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
      // Vertical
      [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
      // Diagonal
      [0, 5, 10, 15], [3, 6, 9, 12]
    ]

    for (const line of lines) {
      const [a, b, c, d] = line
      if (currentBoard[a] !== 0 && currentBoard[a] === currentBoard[b] && 
          currentBoard[a] === currentBoard[c] && currentBoard[a] === currentBoard[d]) {
        return currentBoard[a]
      }
    }

    // Check 2x2 squares
    const squares = [
      [0, 1, 4, 5], [1, 2, 5, 6], [2, 3, 6, 7],
      [4, 5, 8, 9], [5, 6, 9, 10], [6, 7, 10, 11],
      [8, 9, 12, 13], [9, 10, 13, 14], [10, 11, 14, 15]
    ]

    for (const square of squares) {
      const [a, b, c, d] = square
      if (currentBoard[a] !== 0 && currentBoard[a] === currentBoard[b] && 
          currentBoard[a] === currentBoard[c] && currentBoard[a] === currentBoard[d]) {
        return currentBoard[a]
      }
    }

    return null
  }

  // AI makes a move using the hybrid system
  const makeAIMove = useCallback(async () => {
    if (!agents || winner || isPlayerTurn || isAIThinking) return

    setIsAIThinking(true)
    setAIMessage('🧠 AI analyzing board position...')

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 800))

    // Generate possible moves
    const emptySpots = board.map((cell, idx) => cell === 0 ? idx : -1).filter(idx => idx !== -1)
    
    // Check if placement phase is complete for AI
    if (placementPhase && aiPieces >= 4) {
      setIsPlayerTurn(true)
      setIsAIThinking(false)
      setAIMessage('⏸️ AI placement complete, waiting for player...')
      return
    }

    // No valid moves available
    if (emptySpots.length === 0) {
      setIsPlayerTurn(true)
      setIsAIThinking(false)
      setAIMessage('⚠️ No valid moves available')
      return
    }
    
    const gamePosition: GamePosition = {
      board,
      phase: placementPhase ? 'placement' : 'movement',
      currentPlayer: 2,
      moveHistory: [],
      possibleMoves: emptySpots
    }

    try {
      // Get move from Alpha Strategist (primary decision maker)
      const opponentProfile = {
        movesCount: playerPieces,
        averageResponseTime: 3000,
        aggressionLevel: 0.5,
        errorRate: 0.1,
        preferredPositions: [] as number[]
      }
      
      const decision = await agents.alphaStrategist.selectQuadraXMove(gamePosition, opponentProfile, 30000)
      
      let moveIndex: number
      if (decision.move.type === 'placement' && decision.move.position !== undefined) {
        moveIndex = decision.move.position
        setAIMessage(`🎯 ${decision.reasoning.slice(0, 80)}...`)
      } else {
        // Fallback to random valid move
        moveIndex = emptySpots[Math.floor(Math.random() * emptySpots.length)]
        setAIMessage('🤖 AI making strategic placement...')
      }

      // Validate with hybrid validator
      const validator = new HybridBulletproofValidator()
      const validation = await validator.validateMove(gamePosition, moveIndex, 2)
      
      if (validation.isValid) {
        const newBoard = [...board]
        newBoard[moveIndex] = 2
        setBoard(newBoard)
        setAIPieces(aiPieces + 1)

        const gameWinner = checkWinner(newBoard)
        if (gameWinner) {
          setWinner(gameWinner === 1 ? 'Player' : 'AI')
          setAIMessage(gameWinner === 2 ? '🏆 AI wins!' : '😔 You won!')
          setIsAIThinking(false)
          return
        }

        if (playerPieces === 4 && aiPieces + 1 === 4) {
          setPlacementPhase(false)
          setAIMessage('✅ Placement complete! Movement phase begins.')
        }

        setIsPlayerTurn(true)
        setIsAIThinking(false)
      } else {
        // Validation failed - fallback to random valid move
        console.warn('AI move validation failed, using fallback')
        const fallbackIndex = emptySpots[Math.floor(Math.random() * emptySpots.length)]
        const newBoard = [...board]
        newBoard[fallbackIndex] = 2
        setBoard(newBoard)
        setAIPieces(aiPieces + 1)
        setIsPlayerTurn(true)
        setIsAIThinking(false)
        setAIMessage('🤖 AI made a move')
      }
    } catch (error) {
      console.error('AI move error:', error)
      // Fallback to random move on error
      const fallbackIndex = emptySpots[Math.floor(Math.random() * emptySpots.length)]
      const newBoard = [...board]
      newBoard[fallbackIndex] = 2
      setBoard(newBoard)
      setAIPieces(aiPieces + 1)
      setIsPlayerTurn(true)
      setIsAIThinking(false)
      setAIMessage('⚠️ AI used fallback move')
    }
  }, [agents, winner, isPlayerTurn, isAIThinking, board, placementPhase, aiPieces, playerPieces])

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (!isPlayerTurn && !winner && agents && !isAIThinking) {
      console.log('🤖 Triggering AI move - Turn:', !isPlayerTurn, 'Winner:', winner, 'Agents:', !!agents, 'Thinking:', isAIThinking)
      makeAIMove()
    }
  }, [isPlayerTurn, winner, agents, isAIThinking, makeAIMove])

  const handleCellClick = (index: number) => {
    if (winner || board[index] !== 0 || !isPlayerTurn || isAIThinking) return

    if (placementPhase) {
      // Placement phase - max 4 pieces per player
      if (playerPieces >= 4) return

      const newBoard = [...board]
      newBoard[index] = 1 // Player is 1
      setBoard(newBoard)
      setPlayerPieces(playerPieces + 1)

      const gameWinner = checkWinner(newBoard)
      if (gameWinner) {
        setWinner(gameWinner === 1 ? 'Player' : 'AI')
        return
      }

      if (playerPieces + 1 === 4 && aiPieces === 4) {
        setPlacementPhase(false)
        setAIMessage('🎮 Movement phase unlocked!')
      }

      setIsPlayerTurn(false) // AI's turn
    }
  }

  const resetGame = () => {
    setBoard(Array(16).fill(0))
    setIsPlayerTurn(true)
    setWinner(null)
    setPlacementPhase(true)
    setPlayerPieces(0)
    setAIPieces(0)
    setIsAIThinking(false)
    setAIMessage('🤖 AI ready for a new game!')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Simple Header */}
      <header className="border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300">
            ← Back to Home
          </Link>
          <ConnectButton showBalance={false} />
        </div>
      </header>

      {/* Main Game */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Demo Game - No Stakes
          </h1>

          {/* Wallet Status (optional - for demo, wallet not required) */}
          {isConnected && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-6 text-center">
              <p className="text-green-400 text-sm">
                ✅ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}

          {/* AI Status Message */}
          {aiMessage && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                {isAIThinking && (
                  <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                )}
                <p className="text-white font-medium">{aiMessage}</p>
              </div>
            </div>
          )}

          {/* Game Status */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-2xl p-6 mb-8">
            {winner ? (
              <div className="text-center">
                <div className="text-5xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {winner} Wins!
                </h2>
                <button
                  onClick={resetGame}
                  className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  Play Again
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {placementPhase ? '📍 Placement Phase' : '🎮 Movement Phase'}
                </div>
                <div className="text-xl text-gray-300">
                  {isPlayerTurn ? "🎯 Your turn" : "🤖 AI is thinking..."}
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  Player: {playerPieces}/4 pieces | AI: {aiPieces}/4 pieces
                </div>
              </div>
            )}
          </div>

          {/* 4x4 Game Board */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8">
            <div className="grid grid-cols-4 gap-3">
              {board.map((cell, index) => (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={!!winner || !isPlayerTurn || isAIThinking || cell !== 0}
                  className={`
                    aspect-square rounded-xl text-4xl font-bold transition-all duration-200
                    ${cell === 1 ? 'bg-blue-500 text-white' : 
                      cell === 2 ? 'bg-pink-500 text-white' : 
                      'bg-gray-800/50 hover:bg-gray-700/50 border-2 border-gray-700 hover:border-gray-600'}
                    ${!winner && isPlayerTurn && !isAIThinking && cell === 0 ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-70'}
                    flex items-center justify-center
                  `}
                >
                  {cell === 1 ? 'X' : cell === 2 ? 'O' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Win Conditions */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Win Conditions</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              <div>↔️ 4 in a row (horizontal)</div>
              <div>↕️ 4 in a row (vertical)</div>
              <div>↘️ 4 in a row (diagonal)</div>
              <div>◼️ 2x2 square block</div>
            </div>
          </div>

          {/* Play Real Game CTA */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Ready to play with real stakes?</p>
            <Link
              href="/game"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              🚀 Play Real Game with PYUSD
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
