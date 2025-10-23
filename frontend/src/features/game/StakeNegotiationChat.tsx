'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useWallet } from '@/lib/hooks/useWallet'
import { useBalances } from '@/lib/hooks/useBalances'
import { useAICommands } from './hooks/useAICommands'
import { generateWelcomeMessage } from './utils/messageGenerators'
import type { Message, GamePosition, PYUSDStakeContext, ASIStatus } from './types/chat.types'

interface StakeNegotiationChatProps {
  aiName?: string
  enabled?: boolean
  gameId?: string
  gamePosition?: GamePosition
  stakingContext?: PYUSDStakeContext
  onStakeLocked?: (stake: number) => void
  onNegotiationComplete?: (stake: number | null, demoMode: boolean) => void
}

export default function StakeNegotiationChat({ 
  aiName = 'QuadraX Stake Advisor', 
  enabled = true, 
  gameId = 'demo-game',
  gamePosition,
  stakingContext,
  onStakeLocked,
  onNegotiationComplete
}: StakeNegotiationChatProps) {
  const [isClient, setIsClient] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [negotiatedStake, setNegotiatedStake] = useState<number | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const wallet = useWallet()
  const balances = useBalances()

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mock ASI Alliance agents for stake negotiation
  const agents = [
    { name: 'AlphaStrategist', specialty: 'Risk Assessment' },
    { name: 'BetaDefender', specialty: 'Conservative Strategy' },
    { name: 'GammaAggressor', specialty: 'Aggressive Staking' },
    { name: 'DeltaAdaptive', specialty: 'Dynamic Negotiation' }
  ]

  const asiStatus: ASIStatus = {
    connected: true,
    responseTime: 150,
    modelVersion: 'ASI-1.0',
    agentsLoaded: agents.length
  }

  const aiCommands = useAICommands({
    agents,
    asiStatus,
    gamePosition,
    stakingContext,
    onNegotiationComplete,
    setNegotiatedStake,
    setShowConfirmation
  })

  useEffect(() => {
    // Send welcome message when component loads and is on client
    if (!isClient) return
    
    const currentBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted) : 0
    
    const welcomeMessage: Message = {
      id: Date.now(),
      sender: 'ai',
      text: generateWelcomeMessage({
        isConnected: wallet.isConnected,
        pyusdBalance: currentBalance.toFixed(2),
        agentCount: agents.length
      }),
      timestamp: new Date(),
      agentName: 'QuadraX Stake Advisor'
    }
    
    setMessages([welcomeMessage])
  }, [isClient, wallet.isConnected, balances?.pyusd?.formatted])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (showConfirmation && negotiatedStake) {
      addMessage({
        id: Date.now(),
        sender: 'ai',
        text: `✅ **Stake Agreement Reached!**

**Agreed Amount:** ${negotiatedStake} PYUSD
**Total Pot:** ${negotiatedStake * 2} PYUSD
**Winner Takes:** ~${(negotiatedStake * 2 * 0.9975).toFixed(2)} PYUSD (after 0.25% platform fee)

🎯 Ready to lock this stake and start your QuadraX match?

**Next Steps:**
1. Click **"Lock Stake"** to confirm
2. Approve PYUSD spending in your wallet
3. Start playing immediately after confirmation

*Your opponent will be notified and the game will begin once both stakes are locked.*`,
        timestamp: new Date(),
        agentName: 'Stake Coordinator'
      })
    }
  }, [showConfirmation, negotiatedStake])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    }

    addMessage(userMessage)
    const command = input.trim().toLowerCase()
    setInput('')
    setIsProcessing(true)

    try {
      let response: Message

      // Handle specific commands
      if (command === 'demo' || command.includes('demo game') || command.includes('practice')) {
        response = aiCommands.handleDemoCommand()
      } else if (command === 'help' || command === 'commands') {
        response = aiCommands.handleHelpCommand()
      } else if (command === 'status') {
        response = aiCommands.handleStatusCommand()
      } else if (command === 'agents' || command.includes('who are you')) {
        response = aiCommands.handleAgentsCommand()
      } else if (command.includes('stake') && command.match(/\d+/)) {
        // Handle stake proposals
        const validation = aiCommands.handleStakeValidation(command)
        if (!validation.isValid && validation.message) {
          response = validation.message
        } else {
          // Valid stake amount - negotiate
          response = await aiCommands.handleGeneralAIQuery(command, messages)
        }
      } else {
        // General AI conversation
        response = await aiCommands.handleGeneralAIQuery(command, messages)
      }

      addMessage(response)
    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        id: Date.now() + 1,
        sender: 'ai',
        text: '🔄 **Temporary Connection Issue**\n\nI\'m having trouble connecting to the ASI Alliance network. Please try again in a moment.',
        timestamp: new Date(),
        agentName: 'System'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLockStake = () => {
    if (negotiatedStake && onStakeLocked) {
      onStakeLocked(negotiatedStake)
      addMessage({
        id: Date.now(),
        sender: 'ai',
        text: `🔐 **Stake Locked Successfully!**\n\n${negotiatedStake} PYUSD has been locked for your QuadraX match. The game will begin once your opponent also locks their stake.\n\n🎮 **Get ready to play!**`,
        timestamp: new Date(),
        agentName: 'Blockchain Coordinator'
      })
      setShowConfirmation(false)
    }
  }

  if (!enabled) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="text-center text-white/60">
          Stake Negotiation Chat is disabled
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl p-6 h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          💰 {aiName}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${asiStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-white/70">
            {asiStatus.connected ? `${agents.length} advisors ready` : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Wallet Status */}
      <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/70">PYUSD Balance:</span>
          <span className={`font-mono ${isClient && wallet.isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {!isClient 
              ? 'Loading...'
              : wallet.isConnected 
                ? `${balances?.pyusd?.formatted || '0.00'} PYUSD`
                : 'Wallet not connected'
            }
          </span>
        </div>
      </div>

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
              <div className="text-sm whitespace-pre-line">{message.text}</div>
              <div className="text-xs text-white/50 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Stake Confirmation Panel */}
      {showConfirmation && negotiatedStake && (
        <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-green-400">Stake Agreement Ready</div>
              <div className="text-lg font-bold">{negotiatedStake} PYUSD</div>
            </div>
            <button
              onClick={handleLockStake}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors"
            >
              🔐 Lock Stake
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={asiStatus.connected ? "Ask about stakes, try 'Stake 5 PYUSD' or 'Demo game'" : "Connecting to AI advisors..."}
          disabled={isProcessing || !asiStatus.connected}
          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/50 disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={isProcessing || !input.trim() || !asiStatus.connected}
          className="px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 rounded-lg transition-colors"
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            '💬'
          )}
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex gap-2 text-xs">
        <button
          onClick={() => setInput('Demo game')}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          🎮 Demo
        </button>
        <button
          onClick={() => setInput('Stake 5 PYUSD')}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          disabled={!isClient || !wallet.isConnected}
        >
          💰 Stake 5
        </button>
        <button
          onClick={() => setInput('Help me decide')}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          🤔 Advice
        </button>
      </div>

      {/* Context Info */}
      {gamePosition && (
        <div className="mt-2 text-xs text-white/60 text-center">
          Game: {gamePosition.phase} phase | Player {gamePosition.currentPlayer}
        </div>
      )}
    </div>
  )
}