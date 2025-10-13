/**
 * Enhanced Hedera Agent Kit with Ollama + Llama 3.2 Integration
 * Production-ready agents for QuadraX gameplay with PYUSD staking
 */

import { useState, useEffect, useCallback } from 'react'
import { QuadraXAgent, QuadraXAgentFactory, PlayerProfile, GamePosition, PYUSDStakeContext } from './quadraXAgent'

// Ollama Status Interface
export interface OllamaStatusInterface {
  connected: boolean
  model: string
  version: string
  memory: string
  inference_speed: string
  last_updated: Date
  error?: string
}

// Game State Interface
export interface EnhancedGameState {
  board: number[]
  currentPlayer: 1 | 2
  gamePhase: 'waiting' | 'playing' | 'finished'
  winner: number | null
  moveCount: number
  stakes: {
    amount: number
    agreed: boolean
    player1Stake: number
    player2Stake: number
  }
}

// Agent Message Interface
export interface AgentMessage {
  id: string
  from: string
  type: 'analysis' | 'stake_proposal' | 'negotiation' | 'move_suggestion'
  content: string
  timestamp: Date
  data?: any
}

// Hook for Enhanced Hedera Agents
export function useEnhancedHederaAgents() {
  const [agents, setAgents] = useState<QuadraXAgent[]>([])
  const [gameState, setGameState] = useState<EnhancedGameState>({
    board: Array(16).fill(0),
    currentPlayer: 1,
    gamePhase: 'waiting',
    winner: null,
    moveCount: 0,
    stakes: {
      amount: 10,
      agreed: false,
      player1Stake: 10,
      player2Stake: 10
    }
  })
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatusInterface>({
    connected: false,
    model: 'llama3.2:latest',
    version: '8B',
    memory: '8GB',
    inference_speed: '~50 tokens/sec',
    last_updated: new Date()
  })
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize agents on mount
  useEffect(() => {
    initializeAgents()
    checkOllamaStatus()
  }, [])

  const initializeAgents = useCallback(async () => {
    try {
      const agentInstances = [
        QuadraXAgentFactory.createStrategicAnalyst('AlphaAnalyst', '0.0.3001', 'key1'),
        QuadraXAgentFactory.createDefensiveExpert('BetaDefender', '0.0.3002', 'key2'),
        QuadraXAgentFactory.createAggressiveTrader('GammaAggressor', '0.0.3003', 'key3'),
        QuadraXAgentFactory.createAdaptivePlayer('DeltaEvolver', '0.0.3004', 'key4')
      ]
      
      setAgents(agentInstances)
      
      // Add initialization message
      const initMessage: AgentMessage = {
        id: `init-${Date.now()}`,
        from: 'System',
        type: 'analysis',
        content: `✅ Initialized ${agentInstances.length} QuadraX agents with Ollama integration`,
        timestamp: new Date()
      }
      setMessages([initMessage])
      
    } catch (error) {
      console.error('Failed to initialize agents:', error)
      setOllamaStatus(prev => ({ ...prev, connected: false, error: 'Agent initialization failed' }))
    }
  }, [])

  const checkOllamaStatus = useCallback(async () => {
    try {
      // Try to connect to Ollama
      const response = await fetch('http://localhost:11434/api/version')
      if (response.ok) {
        const version = await response.json()
        setOllamaStatus(prev => ({
          ...prev,
          connected: true,
          version: version.version || '8B',
          last_updated: new Date(),
          error: undefined
        }))
      } else {
        throw new Error('Ollama not responding')
      }
    } catch (error) {
      setOllamaStatus(prev => ({
        ...prev,
        connected: false,
        error: 'Ollama offline - start with: ollama serve',
        last_updated: new Date()
      }))
    }
  }, [])

  // Update board state
  const updateBoard = useCallback((position: number, player: 1 | 2) => {
    setGameState(prev => {
      if (prev.board[position] !== 0 || prev.gamePhase !== 'playing') {
        return prev
      }

      const newBoard = [...prev.board]
      newBoard[position] = player
      
      // Check for winner
      const winner = checkWinner(newBoard)
      const newMoveCount = prev.moveCount + 1
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer: player === 1 ? 2 : 1,
        winner,
        gamePhase: winner ? 'finished' : 'playing',
        moveCount: newMoveCount
      }
    })
  }, [])

  // Get AI move recommendation
  const getAIMove = useCallback(async (agentIndex: number, timeLimit: number = 30): Promise<number | null> => {
    if (agents.length === 0 || agentIndex >= agents.length) return null
    
    setIsProcessing(true)
    
    try {
      const agent = agents[agentIndex]
      const gamePosition: GamePosition = {
        board: gameState.board,
        phase: gameState.moveCount < 8 ? 'placement' : 'movement',
        player1Pieces: gameState.board.filter(cell => cell === 1).length,
        player2Pieces: gameState.board.filter(cell => cell === 2).length,
        currentPlayer: gameState.currentPlayer,
        possibleMoves: gameState.board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1),
        threatLevel: 'medium'
      }
      
      const mockOpponent: PlayerProfile = {
        address: '0x456789abcdef',
        gamesPlayed: 15,
        winRate: 0.65,
        averageStake: 12,
        preferredStrategy: 'adaptive',
        stakingPattern: 'moderate',
        gameHistory: []
      }
      
      const moveResult = await agent.selectQuadraXMove(gamePosition, mockOpponent, timeLimit)
      
      // Add move message
      const moveMessage: AgentMessage = {
        id: `move-${Date.now()}`,
        from: agent.name,
        type: 'move_suggestion',
        content: `🎯 Recommends position ${moveResult.move} (${Math.round(moveResult.confidence * 100)}% confidence): ${moveResult.reasoning.substring(0, 100)}...`,
        timestamp: new Date(),
        data: moveResult
      }
      setMessages(prev => [...prev, moveMessage])
      
      return moveResult.move
      
    } catch (error) {
      console.error('AI move generation failed:', error)
      return null
    } finally {
      setIsProcessing(false)
    }
  }, [agents, gameState])

  // Analyze current position
  const analyzePosition = useCallback(async (agentIndex: number = 0) => {
    if (agents.length === 0 || agentIndex >= agents.length) return
    
    setIsProcessing(true)
    
    try {
      const agent = agents[agentIndex]
      const gamePosition: GamePosition = {
        board: gameState.board,
        phase: gameState.moveCount < 8 ? 'placement' : 'movement',
        player1Pieces: gameState.board.filter(cell => cell === 1).length,
        player2Pieces: gameState.board.filter(cell => cell === 2).length,
        currentPlayer: gameState.currentPlayer,
        possibleMoves: gameState.board.map((cell, index) => cell === 0 ? index : -1).filter(pos => pos !== -1),
        threatLevel: 'medium'
      }
      
      const mockOpponent: PlayerProfile = {
        address: '0x789abcdef123',
        gamesPlayed: 20,
        winRate: 0.7,
        averageStake: 15,
        preferredStrategy: 'aggressive',
        stakingPattern: 'high-roller',
        gameHistory: []
      }
      
      const mockPyusdContext: PYUSDStakeContext = {
        minStake: 1,
        platformFee: 0.25,
        gasEstimate: 0.001,
        playerBalance: 100,
        opponentBalance: 80,
        marketConditions: 'stable'
      }
      
      const analysis = await agent.analyzeQuadraXPosition(gamePosition, mockOpponent, mockPyusdContext)
      
      // Add analysis message
      const analysisMessage: AgentMessage = {
        id: `analysis-${Date.now()}`,
        from: agent.name,
        type: 'analysis',
        content: `🧠 Win probability: ${analysis.winProbability}% | Strategy: ${analysis.phaseStrategy} | ${analysis.reasoning.substring(0, 150)}...`,
        timestamp: new Date(),
        data: analysis
      }
      setMessages(prev => [...prev, analysisMessage])
      
    } catch (error) {
      console.error('Position analysis failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [agents, gameState])

  // Calculate optimal stake
  const calculateStake = useCallback(async (winProbability: number, agentIndex: number = 0) => {
    if (agents.length === 0 || agentIndex >= agents.length) return
    
    setIsProcessing(true)
    
    try {
      const agent = agents[agentIndex]
      
      const mockOpponent: PlayerProfile = {
        address: '0xabcdef123456',
        gamesPlayed: 30,
        winRate: 0.6,
        averageStake: 8,
        preferredStrategy: 'defensive',
        stakingPattern: 'conservative',
        gameHistory: []
      }
      
      const mockPyusdContext: PYUSDStakeContext = {
        minStake: 1,
        platformFee: 0.25,
        gasEstimate: 0.001,
        playerBalance: 100,
        opponentBalance: 120,
        marketConditions: 'stable'
      }
      
      const stakeCalc = await agent.calculateQuadraXStake(
        winProbability,
        mockOpponent,
        mockPyusdContext,
        { isRankedMatch: true }
      )
      
      // Update stakes in game state
      setGameState(prev => ({
        ...prev,
        stakes: {
          ...prev.stakes,
          amount: stakeCalc.recommendedStake,
          player1Stake: stakeCalc.recommendedStake
        }
      }))
      
      // Add stake message
      const stakeMessage: AgentMessage = {
        id: `stake-${Date.now()}`,
        from: agent.name,
        type: 'stake_proposal',
        content: `💰 Optimal stake: ${stakeCalc.recommendedStake} PYUSD (range: ${stakeCalc.minStake}-${stakeCalc.maxStake}) | ${stakeCalc.reasoning.substring(0, 100)}...`,
        timestamp: new Date(),
        data: stakeCalc
      }
      setMessages(prev => [...prev, stakeMessage])
      
    } catch (error) {
      console.error('Stake calculation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [agents])

  // Start new game
  const startNewGame = useCallback(() => {
    setGameState({
      board: Array(16).fill(0),
      currentPlayer: 1,
      gamePhase: 'playing',
      winner: null,
      moveCount: 0,
      stakes: {
        amount: 10,
        agreed: false,
        player1Stake: 10,
        player2Stake: 10
      }
    })
    
    const gameMessage: AgentMessage = {
      id: `game-${Date.now()}`,
      from: 'System',
      type: 'analysis',
      content: '🎮 New QuadraX game started! 4x4 grid, place 4 pieces then move to win.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, gameMessage])
  }, [])

  // Helper function to check winner
  const checkWinner = (board: number[]): number | null => {
    const winPatterns = [
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
    
    for (const pattern of winPatterns) {
      const [a, b, c, d] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]) {
        return board[a]
      }
    }
    return null
  }

  return {
    agents,
    gameState,
    ollamaStatus,
    messages,
    isProcessing,
    updateBoard,
    getAIMove,
    analyzePosition,
    calculateStake,
    startNewGame,
    checkOllamaStatus,
    initializeAgents
  }
}

// Export agent factory for direct use
export { QuadraXAgentFactory, QuadraXAgent }
export type { PlayerProfile, GamePosition, PYUSDStakeContext }