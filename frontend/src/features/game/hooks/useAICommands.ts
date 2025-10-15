'use client'

import { QuadraXAgent } from '../../../lib/agents/quadraXAgent'
import { Message, GamePosition, PYUSDStakeContext, ASIStatus } from '../types/chat.types'
import { 
  createMessage, 
  generateHelpMessage, 
  generateStatusMessage, 
  generateAgentsMessage 
} from '../utils/messageGenerators'
import { useWallet } from '../../../lib/hooks/useWallet'
import { useBalances } from '../../../lib/hooks/useBalances'

interface UseAICommandsProps {
  agents: QuadraXAgent[]
  asiStatus: ASIStatus
  gamePosition?: GamePosition
  stakingContext?: PYUSDStakeContext
  onNegotiationComplete?: (stake: number | null, demoMode: boolean) => void
  setNegotiatedStake: (stake: number | null) => void
  setShowConfirmation: (show: boolean) => void
}

export function useAICommands({
  agents,
  asiStatus,
  gamePosition,
  stakingContext,
  onNegotiationComplete,
  setNegotiatedStake,
  setShowConfirmation
}: UseAICommandsProps) {
  const wallet = useWallet()
  const balances = useBalances()

  const handleDemoCommand = (): Message => {
    const demoMessage = createMessage(
      `🎮 **Excellent choice!** Demo mode initiated.

Experience the full power of QuadraX AI strategy without financial risk. You'll face the same advanced ASI Alliance algorithms in a risk-free environment. 

*Preparing your strategic gaming experience...*`,
      'ai'
    )
    
    // Trigger demo mode
    if (onNegotiationComplete) {
      setTimeout(() => {
        onNegotiationComplete(null, true)
      }, 1500)
    }
    
    return demoMessage
  }

  const handleHelpCommand = (): Message => {
    const agentName = agents.length > 0 ? agents[0].name : 'QuadraX AI'
    const pyusdBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'
    
    return createMessage(
      generateHelpMessage(agentName, {
        isConnected: wallet.isConnected,
        pyusdBalance
      }),
      'ai',
      agentName
    )
  }

  const handleStatusCommand = (): Message => {
    const pyusdBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'
    
    return createMessage(
      generateStatusMessage(
        { isConnected: wallet.isConnected, pyusdBalance },
        asiStatus.connected,
        asiStatus.responseTime
      ),
      'ai'
    )
  }

  const handleAgentsCommand = (): Message => {
    return createMessage(
      generateAgentsMessage(agents.map(agent => agent.name)),
      'ai',
      'QuadraX AI'
    )
  }

  const handleStakeValidation = (command: string): { isValid: boolean, message?: Message } => {
    const ABSOLUTE_MIN_STAKE = 1
    const ABSOLUTE_MAX_STAKE = 10
    const currentBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted) : 0
    
    const stakeMatch = command.match(/(\d+(?:\.\d+)?)\s*(?:PYUSD|pyusd)/i)
    if (stakeMatch) {
      const proposedStake = parseFloat(stakeMatch[1])
      
      // Check if user is connected and has wallet
      if (!wallet.isConnected) {
        const errorMessage = createMessage(
          `🔗 **Wallet Connection Required**\n\nTo stake PYUSD, you need to connect your wallet first. Please connect your wallet and ensure you have sufficient PYUSD balance.`,
          'ai'
        )
        return { isValid: false, message: errorMessage }
      }
      
      // Check if user has sufficient balance
      if (currentBalance < proposedStake) {
        const errorMessage = createMessage(
          `💰 **Insufficient Balance**\n\nYou currently have **${currentBalance.toFixed(2)} PYUSD** but are trying to stake **${proposedStake} PYUSD**.\n\n${currentBalance === 0 ? 
            '• You need PYUSD in your wallet to play with real stakes\n• Try **"Demo game"** for free practice instead' : 
            `• Maximum you can stake: **${Math.min(currentBalance, ABSOLUTE_MAX_STAKE).toFixed(2)} PYUSD**\n• Try: "Stake ${Math.min(currentBalance, 5).toFixed(0)} PYUSD" for a balanced match`
          }`,
          'ai'
        )
        return { isValid: false, message: errorMessage }
      }
      
      // Check stake bounds
      if (proposedStake < ABSOLUTE_MIN_STAKE || proposedStake > ABSOLUTE_MAX_STAKE) {
        const errorMessage = createMessage(
          `⚠️ **Invalid Stake Amount**\n\nStakes must be between **${ABSOLUTE_MIN_STAKE} and ${ABSOLUTE_MAX_STAKE} PYUSD**. ${
            proposedStake < ABSOLUTE_MIN_STAKE 
              ? 'Minimum stake is 1 PYUSD for meaningful gameplay.' 
              : 'Maximum stake is 10 PYUSD for responsible gaming.'
          }\n\nSuggested stake: **${Math.min(Math.max(ABSOLUTE_MIN_STAKE, Math.floor(currentBalance)), ABSOLUTE_MAX_STAKE)} PYUSD**`,
          'ai'
        )
        return { isValid: false, message: errorMessage }
      }
    }
    
    return { isValid: true }
  }

  const handleGeneralAIQuery = async (command: string, conversationHistory: Message[]): Promise<Message> => {
    if (agents.length === 0) {
      return createMessage(
        'AI agents loading... Ensure ASI Alliance API keys are configured in environment.',
        'ai'
      )
    }

    const agent = agents[Math.floor(Math.random() * agents.length)]
    const historyText = conversationHistory.slice(-5).map(m => 
      `${m.sender === 'user' ? 'User' : m.agentName || 'AI'}: ${m.text}`
    ).join('\n')

    const currentBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted) : 0
    
    const aiPrompt = `You are ${agent.name}, a QuadraX AI gaming strategist.

User said: "${command}"

IMPORTANT - User's current PYUSD balance: ${currentBalance.toFixed(2)} PYUSD

Available options:
${wallet.isConnected ? 
  currentBalance > 0 ? 
    `- Stake real PYUSD (maximum ${Math.min(currentBalance, 10).toFixed(2)} PYUSD available)` :
    `- NO PYUSD AVAILABLE - suggest demo mode instead` :
  '- Connect wallet for PYUSD games'
}
- Demo games (free practice) 
- Strategy help

CRITICAL: Never suggest staking more than ${currentBalance.toFixed(2)} PYUSD. If balance is 0, only suggest demo mode.

Keep responses brief and friendly. For demo requests, add "START_DEMO_MODE". For valid stake agreements (only if user has sufficient balance), add "LOCK_STAKE:{amount}".

Response:`

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:latest',
          prompt: aiPrompt,
          stream: false,
          options: {
            temperature: 0.85,
            top_p: 0.9,
            num_predict: 150
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        let aiResponse = data.response.trim()
        
        // Handle special commands
        if (aiResponse.includes('START_DEMO_MODE')) {
          aiResponse = aiResponse.replace(/START_DEMO_MODE/gi, '').trim()
          setTimeout(() => {
            if (onNegotiationComplete) {
              onNegotiationComplete(null, true)
            }
          }, 1000)
        }
        
        const lockMatch = aiResponse.match(/LOCK_STAKE:(\d+(?:\.\d+)?)/i)
        if (lockMatch) {
          const agreedStake = parseFloat(lockMatch[1])
          aiResponse = aiResponse.replace(/LOCK_STAKE:\d+(?:\.\d+)?/gi, '').trim()
          
          if (agreedStake >= 1 && agreedStake <= 10) {
            setNegotiatedStake(agreedStake)
            setTimeout(() => {
              setShowConfirmation(true)
            }, 800)
          }
        }
        
        return createMessage(aiResponse || "I'm here to help with QuadraX strategy!", 'agent', agent.name)
      }
    } catch (error) {
      console.error('ASI Alliance AI failed:', error)
    }
    
    return createMessage(
      `${agent.name} here. ASI Alliance seems offline. Try: "help" for commands or check ASI API configuration.`,
      'agent',
      agent.name
    )
  }

  return {
    handleDemoCommand,
    handleHelpCommand,
    handleStatusCommand,
    handleAgentsCommand,
    handleStakeValidation,
    handleGeneralAIQuery
  }
}