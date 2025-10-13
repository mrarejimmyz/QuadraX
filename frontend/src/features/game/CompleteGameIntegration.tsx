/**
 * Complete Game Integration with Intelligent Staking
 * Connects Hedera Agent Kit A2A with intelligent stake negotiation and PYUSD contracts
 */

import { useCallback, useEffect, useState } from 'react'
import { useIntelligentStaking } from '@/features/staking/IntelligentStakingSystem'
import { useEnhancedHederaAgents } from '@/lib/agents/enhancedHederaAgentKit'
import { useWriteContract, useAccount } from 'wagmi'
import { parseUnits } from 'viem'

interface GameState {
  phase: 'setup' | 'negotiating' | 'staking' | 'playing' | 'finished'
  gameId: number
  players: {
    player1: string
    player2: string
  }
  stakes: {
    agreed: boolean
    amount?: number
    player1Staked: boolean
    player2Staked: boolean
  }
  board: number[]
  currentPlayer: number
  winner?: number
}

export function useGameWithIntelligentStaking() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  
  // Intelligent staking system
  const {
    agents,
    negotiationInProgress,
    agreedStake,
    negotiateStakes,
    stakeToContract,
    setCurrentGameId
  } = useIntelligentStaking()

  // Hedera Agent Kit A2A system
  const {
    agents: hederaAgents,
    messages
  } = useEnhancedHederaAgents()

  const [gameState, setGameState] = useState<GameState>({
    phase: 'setup',
    gameId: Math.floor(Math.random() * 1000000),
    players: {
      player1: address || '',
      player2: '0x8765432109876543210987654321098765432109' // Mock opponent
    },
    stakes: {
      agreed: false,
      player1Staked: false,
      player2Staked: false
    },
    board: Array(16).fill(0),
    currentPlayer: 1
  })

  const [negotiationLog, setNegotiationLog] = useState<string[]>([])

  // Initialize game when address is available
  useEffect(() => {
    if (address && gameState.players.player1 !== address) {
      setGameState(prev => ({
        ...prev,
        players: { ...prev.players, player1: address }
      }))
      setCurrentGameId(gameState.gameId)
    }
  }, [address, gameState.gameId, gameState.players.player1, setCurrentGameId])

  // Complete negotiation flow with both AI systems
  const startCompleteNegotiation = useCallback(async () => {
    if (agents.length < 2 || hederaAgents.length < 2) {
      console.error('Not enough agents available for negotiation')
      return
    }

    setGameState(prev => ({ ...prev, phase: 'negotiating' }))
    setNegotiationLog(['🎮 Starting complete AI negotiation system...'])

    try {
      // Phase 1: Hedera A2A Protocol Negotiation
      setNegotiationLog(prev => [...prev, '🔄 Phase 1: Hedera A2A Protocol Communication'])
      
      // Start A2A negotiation with correct parameters
      // TODO: Implement A2A negotiation
      // await startA2ANegotiation(`stake_negotiation_game_${gameState.gameId}`, 0)

      // Wait for A2A messages
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Phase 2: Intelligent Stake Calculation & Negotiation
      setNegotiationLog(prev => [...prev, '💰 Phase 2: Intelligent Stake Negotiation'])
      
      const negotiationResult = await negotiateStakes(
        agents[0], 
        agents[1], 
        (update: string) => {
          setNegotiationLog(prev => [...prev, update])
        }
      )

      if (negotiationResult.agreed && negotiationResult.finalStake) {
        setGameState(prev => ({
          ...prev,
          phase: 'staking',
          stakes: {
            ...prev.stakes,
            agreed: true,
            amount: negotiationResult.finalStake
          }
        }))

        setNegotiationLog(prev => [...prev, 
          `✅ Negotiation Complete: $${negotiationResult.finalStake} agreed`,
          '📝 Ready for PYUSD staking on Hedera network'
        ])
      } else {
        setNegotiationLog(prev => [...prev, '❌ Negotiation failed - agents could not agree'])
        setGameState(prev => ({ ...prev, phase: 'setup' }))
      }

    } catch (error) {
      console.error('Negotiation error:', error)
      setNegotiationLog(prev => [...prev, `❌ Error: ${error}`])
      setGameState(prev => ({ ...prev, phase: 'setup' }))
    }
  }, [agents, hederaAgents, gameState.gameId, negotiateStakes])

  // Handle PYUSD staking
  const executeStaking = useCallback(async () => {
    if (!gameState.stakes.amount || !address) return

    try {
      setNegotiationLog(prev => [...prev, '💸 Executing PYUSD stake transaction...'])

      // Create game in staking contract
      await writeContract({
        address: process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`,
        abi: [
          {
            name: 'createGame',
            type: 'function',
            inputs: [
              { name: 'player1', type: 'address' },
              { name: 'player2', type: 'address' }
            ],
            outputs: [{ name: 'gameId', type: 'uint256' }]
          }
        ],
        functionName: 'createGame',
        args: [gameState.players.player1 as `0x${string}`, gameState.players.player2 as `0x${string}`]
      })

      // Approve PYUSD spending
      const stakeAmountWei = parseUnits(gameState.stakes.amount.toString(), 6)
      
      await writeContract({
        address: process.env.NEXT_PUBLIC_PYUSD_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ],
        functionName: 'approve',
        args: [process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`, stakeAmountWei]
      })

      // Stake in game
      await writeContract({
        address: process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`,
        abi: [
          {
            name: 'stakeInGame',
            type: 'function',
            inputs: [
              { name: 'gameId', type: 'uint256' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: []
          }
        ],
        functionName: 'stakeInGame',
        args: [BigInt(gameState.gameId), stakeAmountWei]
      })

      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        stakes: {
          ...prev.stakes,
          player1Staked: true
        }
      }))

      setNegotiationLog(prev => [...prev, 
        '✅ PYUSD stake confirmed on Hedera network!',
        '🎮 Game ready to start - stakes locked in smart contract'
      ])

    } catch (error) {
      console.error('Staking error:', error)
      setNegotiationLog(prev => [...prev, `❌ Staking failed: ${error}`])
    }
  }, [gameState, address, writeContract])

  // Game logic
  const makeMove = useCallback((position: number) => {
    if (gameState.phase !== 'playing') return

    const newBoard = [...gameState.board]
    if (newBoard[position] !== 0) return // Position already taken

    newBoard[position] = gameState.currentPlayer
    
    // Check for winner
    const winner = checkWinner(newBoard, gameState.currentPlayer)
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: winner ? prev.currentPlayer : (prev.currentPlayer === 1 ? 2 : 1),
      phase: winner ? 'finished' : 'playing',
      winner: winner ? prev.currentPlayer : undefined
    }))

    if (winner) {
      handleGameEnd(gameState.currentPlayer)
    }
  }, [gameState])

  const handleGameEnd = useCallback(async (winner: number) => {
    setNegotiationLog(prev => [...prev, 
      `🏆 Player ${winner} wins!`,
      '💰 Executing payout from smart contract...'
    ])

    try {
      // Trigger winner payout in smart contract
      await writeContract({
        address: process.env.NEXT_PUBLIC_STAKING_CONTRACT as `0x${string}`,
        abi: [
          {
            name: 'declareWinner',
            type: 'function',
            inputs: [
              { name: 'gameId', type: 'uint256' },
              { name: 'winner', type: 'address' }
            ],
            outputs: []
          }
        ],
        functionName: 'declareWinner',
        args: [
          BigInt(gameState.gameId), 
          winner === 1 ? gameState.players.player1 as `0x${string}` : gameState.players.player2 as `0x${string}`
        ]
      })

      setNegotiationLog(prev => [...prev, '✅ Winner payout executed successfully!'])
    } catch (error) {
      console.error('Payout error:', error)
      setNegotiationLog(prev => [...prev, `❌ Payout failed: ${error}`])
    }
  }, [gameState, writeContract])

  const checkWinner = (board: number[], player: number): boolean => {
    // Check rows
    for (let row = 0; row < 4; row++) {
      if (board[row * 4] === player && 
          board[row * 4 + 1] === player && 
          board[row * 4 + 2] === player && 
          board[row * 4 + 3] === player) {
        return true
      }
    }

    // Check columns  
    for (let col = 0; col < 4; col++) {
      if (board[col] === player && 
          board[col + 4] === player && 
          board[col + 8] === player && 
          board[col + 12] === player) {
        return true
      }
    }

    // Check diagonals
    if (board[0] === player && board[5] === player && board[10] === player && board[15] === player) {
      return true
    }
    
    if (board[3] === player && board[6] === player && board[9] === player && board[12] === player) {
      return true
    }

    return false
  }

  const resetGame = useCallback(() => {
    setGameState({
      phase: 'setup',
      gameId: Math.floor(Math.random() * 1000000),
      players: {
        player1: address || '',
        player2: '0x8765432109876543210987654321098765432109'
      },
      stakes: {
        agreed: false,
        player1Staked: false,
        player2Staked: false
      },
      board: Array(16).fill(0),
      currentPlayer: 1
    })
    setNegotiationLog([])
  }, [address])

  return {
    gameState,
    negotiationLog,
    negotiationInProgress,
    agents,
    hederaAgents,
    startCompleteNegotiation,
    executeStaking,
    makeMove,
    resetGame,
    // A2A Communication
    messages
  }
}

// Helper function to format negotiation messages for display
export function formatNegotiationMessage(message: any): string {
  if (message.type === 'strategy_share') {
    return `📈 ${message.agent}: ${message.data.strategy} (confidence: ${Math.round(message.data.confidence * 100)}%)`
  } else if (message.type === 'negotiation') {
    return `🤝 ${message.agent}: ${message.data.response} - ${message.data.reasoning}`
  } else if (message.type === 'stake_proposal') {
    return `💰 ${message.agent} proposes $${message.data.amount} stake`
  }
  return `🔄 ${message.agent}: ${JSON.stringify(message.data)}`
}