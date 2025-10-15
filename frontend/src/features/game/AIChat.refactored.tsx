'use client'

import React, { useState, useEffect } from 'react'
import { StakeConfirmation } from '../../components/StakeConfirmation'
import { useAccount } from 'wagmi'
import { useStakeNegotiation } from '../../hooks/useStakeNegotiation'
import { useWallet } from '../../lib/hooks/useWallet'
import { useBalances } from '../../lib/hooks/useBalances'

// Import refactored components and types
import { StatusBar } from './components/StatusBar'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import { useAgentManager } from './hooks/useAgentManager'
import { useAICommands } from './hooks/useAICommands'
import { generateWelcomeMessage, createMessage } from './utils/messageGenerators'
import { 
  Message, 
  GamePosition, 
  PYUSDStakeContext, 
  AIChatProps, 
  ChatMode 
} from './types/chat.types'

export default function AIChat({ 
  aiName = 'QuadraX AI', 
  enabled = true, 
  gameId = 'demo-game',
  gamePosition,
  stakingContext,
  onStakeLocked,
  onNegotiationComplete
}: AIChatProps) {
  // Blockchain hooks
  const { address } = useAccount()
  const wallet = useWallet()
  const balances = useBalances()
  const stakeHook = useStakeNegotiation()
  
  // Agent management
  const { agents, asiStatus } = useAgentManager()
  
  // Component state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [negotiatedStake, setNegotiatedStake] = useState<number | null>(null)
  const [opponentAddress, setOpponentAddress] = useState<string>('0x0000000000000000000000000000000000000000')
  const [activeMode, setActiveMode] = useState<ChatMode>('chat')

  // AI command handlers
  const aiCommands = useAICommands({
    agents,
    asiStatus,
    gamePosition,
    stakingContext,
    onNegotiationComplete,
    setNegotiatedStake,
    setShowConfirmation
  })

  // Initialize welcome message when agents are ready
  useEffect(() => {
    if (agents.length > 0 && messages.length === 0) {
      const pyusdBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'
      
      const welcomeMessage = createMessage(
        generateWelcomeMessage({
          isConnected: wallet.isConnected,
          pyusdBalance,
          agentCount: agents.length
        }),
        'ai',
        'QuadraX AI System'
      )
      
      setMessages([welcomeMessage])
    }
  }, [agents, wallet.isConnected, balances?.pyusd?.formatted])

  // Update welcome message when network data changes
  useEffect(() => {
    if (agents.length > 0 && messages.length > 0 && messages[0].agentName === 'QuadraX AI System') {
      const pyusdBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'
      
      const updatedWelcome = createMessage(
        generateWelcomeMessage({
          isConnected: wallet.isConnected,
          pyusdBalance,
          agentCount: agents.length
        }),
        'ai',
        'QuadraX AI System'
      )
      
      setMessages(prev => [{ ...updatedWelcome, id: prev[0].id }, ...prev.slice(1)])
    }
  }, [wallet.isConnected, balances?.pyusd?.formatted])

  const handleAICommand = async (command: string) => {
    setIsProcessing(true)
    
    try {
      const lowerCommand = command.toLowerCase()
      let responseMessage: Message | null = null

      // Handle different command types
      if (lowerCommand.includes('demo') || lowerCommand.includes('free') || lowerCommand.includes('practice')) {
        responseMessage = aiCommands.handleDemoCommand()
      } 
      else if (lowerCommand.includes('help')) {
        responseMessage = aiCommands.handleHelpCommand()
      }
      else if (lowerCommand.includes('status')) {
        responseMessage = aiCommands.handleStatusCommand()
      }
      else if (lowerCommand.includes('agents')) {
        responseMessage = aiCommands.handleAgentsCommand()
      }
      else {
        // Validate stakes first
        const validation = aiCommands.handleStakeValidation(command)
        if (!validation.isValid && validation.message) {
          responseMessage = validation.message
        } else {
          // Handle general AI query
          responseMessage = await aiCommands.handleGeneralAIQuery(command, messages)
        }
      }

      if (responseMessage) {
        setMessages(prev => [...prev, responseMessage])
      }
    } catch (error) {
      console.error('AI command error:', error)
      const errorMessage = createMessage(
        'Error processing request. Check ASI Alliance configuration and try again.',
        'ai'
      )
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return
    
    const userInput = input.trim()
    setInput('')
    
    // Add user message
    const userMessage = createMessage(userInput, 'user')
    setMessages(prev => [...prev, userMessage])
    
    // Process AI response
    await handleAICommand(userInput)
  }

  if (!enabled) {
    return (
      <div className="glass-thick rounded-2xl p-6 text-center border border-white/20 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 
                        bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-400/20 to-gray-500/10 
                        flex items-center justify-center border border-white/10">
            <span className="text-2xl opacity-60">🤖</span>
          </div>
          <h3 className="text-white/80 font-semibold text-lg mb-2">AI Chat Paused</h3>
          <p className="text-white/60 text-sm">Start a game to activate AI assistance</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="glass-thick rounded-2xl flex flex-col h-[500px] overflow-hidden border border-white/20 relative">
        {/* Apple-style Header with Gradient */}
        <div className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
          
          {/* Header content */}
          <div className="relative p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* AI Status Indicator */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 
                                  flex items-center justify-center shadow-lg">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse 
                                shadow-lg shadow-green-400/50"></div>
                </div>
                
                {/* AI Info */}
                <div>
                  <h3 className="font-bold text-white text-lg">{aiName}</h3>
                  <p className="text-xs text-white/70">Strategic Intelligence</p>
                </div>
              </div>
              
              {/* Compact Stats */}
              <div className="flex items-center gap-3">
                <div className="glass-ultra-thin px-3 py-1 rounded-lg">
                  <span className="text-xs font-medium text-white/90">{agents.length}/4 Agents</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar 
          activeMode={activeMode}
          setActiveMode={setActiveMode}
          asiStatus={asiStatus}
          agents={agents}
        />

        {/* Messages */}
        <MessageList 
          messages={messages}
          isProcessing={isProcessing}
        />

        {/* Input */}
        <ChatInput 
          input={input}
          setInput={setInput}
          isProcessing={isProcessing}
          enabled={enabled}
          onSendMessage={sendMessage}
        />
      </div>

      {/* Stake Confirmation Modal */}
      {showConfirmation && negotiatedStake && (
        <StakeConfirmation
          agreedStake={negotiatedStake}
          player1Address={address || ''}
          player2Address={opponentAddress}
          isProcessing={false}
          stage="confirming"
          onConfirm={() => {
            console.log(`Stake confirmed: ${negotiatedStake} PYUSD`)
            if (onStakeLocked) {
              onStakeLocked(Date.now(), negotiatedStake)
            }
            if (onNegotiationComplete) {
              onNegotiationComplete(negotiatedStake, false)
            }
            setShowConfirmation(false)
            setNegotiatedStake(null)
          }}
          onCancel={() => {
            setShowConfirmation(false)
            setNegotiatedStake(null)
          }}
        />
      )}
    </>
  )
}