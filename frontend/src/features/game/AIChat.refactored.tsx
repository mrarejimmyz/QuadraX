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
      <div className="backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center shadow-2xl bg-gradient-to-br from-gray-900/80 to-slate-900/80">
        <div className="text-gray-300 mb-4 text-4xl">🤖</div>
        <h3 className="text-gray-200 font-semibold text-lg mb-2">AI Chat Disabled</h3>
        <p className="text-gray-400 text-sm">Start a game to enable AI assistance and strategy insights</p>
      </div>
    )
  }

  return (
    <>
      <div className="backdrop-blur-xl rounded-2xl border border-gray-700/30 flex flex-col h-[550px] shadow-2xl shadow-black/20 bg-gradient-to-br from-gray-900/90 to-slate-900/90">
        {/* Enhanced Header */}
        <div className="p-5 border-b border-gray-700/30 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <div className="absolute inset-0 w-4 h-4 bg-green-400/30 rounded-full animate-ping"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{aiName}</h3>
                <p className="text-xs text-gray-400">Multi-Agent Intelligence System</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-200">{agents.length}/4 Agents</div>
              <div className="text-xs text-gray-400">{messages.length} messages</div>
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