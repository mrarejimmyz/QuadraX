'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  AlphaStrategist, 
  BetaDefender, 
  GammaAggressor, 
  DeltaAdaptive,
  type GamePosition as ASIGamePosition 
} from '@/lib/agents/asi-alliance'
import { callASIAlliance } from '@/lib/services/asiService'

interface Message {
  id: number
  sender: 'ai' | 'user' | 'agent'
  text: string
  timestamp: Date
  agentName?: string
  confidence?: number
  reasoning?: string
}

interface GamePosition {
  board: number[]
  phase: 'placement' | 'movement'
  piecesPlaced: { player1: number, player2: number }
  currentPlayer: number
}

interface PYUSDStakeContext {
  playerBalance: number
  opponentBalance: number
  minStake: number
  maxStake: number
  standardStake: number
  gameId?: string
}

interface AIChatProps {
  aiName?: string
  enabled?: boolean
  gameId?: string
  gamePosition?: GamePosition
  stakingContext?: PYUSDStakeContext
  onStakeLocked?: (stake: number) => void
  onNegotiationComplete?: (stake: number | null, demoMode: boolean) => void
}

export default function AIChat({ 
  aiName = 'ASI Alliance', 
  enabled = true, 
  gameId = 'demo-game',
  gamePosition,
  stakingContext,
  onStakeLocked,
  onNegotiationComplete
}: AIChatProps) {
  const [agents, setAgents] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeASIAlliance()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeASIAlliance = async () => {
    try {
      // Test ASI connection
      await callASIAlliance('test connection')
      
      const allianceAgents = [
        new AlphaStrategist(),
        new BetaDefender(),
        new GammaAggressor(),
        new DeltaAdaptive()
      ]
      
      setAgents(allianceAgents)
      
      // Welcome message
      addMessage({
        id: Date.now(),
        sender: 'ai',
        text: `ASI Alliance initialized! 4 specialized agents ready: ${allianceAgents.map(a => a.name).join(', ')}`,
        timestamp: new Date(),
        agentName: 'System'
      })
    } catch (error) {
      console.error('Failed to initialize ASI Alliance:', error)
      addMessage({
        id: Date.now(),
        sender: 'ai',
        text: 'ASI Alliance connection failed. Please check your API key configuration.',
        timestamp: new Date(),
        agentName: 'System'
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing || agents.length === 0) return

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInput('')
    setIsProcessing(true)

    try {
      const agent = agents[selectedAgent]
      
      // Prepare game context for agent
      const asiGameContext: ASIGamePosition = gamePosition ? {
        board: gamePosition.board,
        phase: gamePosition.phase,
        currentPlayer: gamePosition.currentPlayer as 1 | 2,
        player1Pieces: gamePosition.piecesPlaced.player1,
        player2Pieces: gamePosition.piecesPlaced.player2,
        possibleMoves: getPossibleMoves(gamePosition),
        moveHistory: []
      } : {
        board: Array(16).fill(0),
        phase: 'placement',
        currentPlayer: 1,
        player1Pieces: 0,
        player2Pieces: 0,
        possibleMoves: Array.from({length: 16}, (_, i) => i),
        moveHistory: []
      }

      // Get response from selected agent
      const response = await agent.selectQuadraXMove(
        asiGameContext,
        { 
          playStyle: 'adaptive', 
          skillLevel: 'intermediate',
          preferredPositions: [],
          gameHistory: [],
          winRate: 0.5
        },
        60
      )

      addMessage({
        id: Date.now() + 1,
        sender: 'agent',
        text: response.reasoning || `Agent ${agent.name} suggests move: ${JSON.stringify(response.move)}`,
        timestamp: new Date(),
        agentName: agent.name,
        confidence: response.confidence
      })

    } catch (error) {
      console.error('Agent response error:', error)
      addMessage({
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an error processing your message.',
        timestamp: new Date(),
        agentName: 'Error'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getPossibleMoves = (position: GamePosition): number[] => {
    if (position.phase === 'placement') {
      return position.board
        .map((cell, index) => cell === 0 ? index : -1)
        .filter(index => index !== -1)
    }
    // For movement phase, return indices of current player's pieces
    return position.board
      .map((cell, index) => cell === position.currentPlayer ? index : -1)
      .filter(index => index !== -1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!enabled) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="text-center text-white/60">
          AI Chat is disabled
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6 h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{aiName}</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${agents.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-white/70">
            {agents.length > 0 ? `${agents.length} agents ready` : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Agent Selector */}
      {agents.length > 0 && (
        <div className="mb-4">
          <select 
            value={selectedAgent} 
            onChange={(e) => setSelectedAgent(Number(e.target.value))}
            className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
          >
            {agents.map((agent, index) => (
              <option key={index} value={index} className="bg-gray-800">
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.sender === 'agent'
                  ? 'bg-purple-500/20 border border-purple-500/30'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              {(message.sender === 'agent' || message.sender === 'ai') && message.agentName && (
                <div className="text-xs font-medium mb-1 text-white/70">
                  {message.agentName}
                  {message.confidence && (
                    <span className="ml-2 text-green-400">
                      ({Math.round(message.confidence * 100)}%)
                    </span>
                  )}
                </div>
              )}
              <div className="text-sm">{message.text}</div>
              <div className="text-xs text-white/50 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={agents.length > 0 ? "Ask the ASI Alliance..." : "Connecting to ASI Alliance..."}
          disabled={isProcessing || agents.length === 0}
          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/50 disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={isProcessing || !input.trim() || agents.length === 0}
          className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg transition-colors"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Send'
          )}
        </button>
      </div>

      {/* Game Context Info */}
      {gamePosition && (
        <div className="mt-4 text-xs text-white/60">
          Game Phase: {gamePosition.phase} | Current Player: {gamePosition.currentPlayer}
        </div>
      )}
    </div>
  )
}