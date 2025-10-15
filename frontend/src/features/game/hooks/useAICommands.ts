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
    
    // Build enhanced context for ASI Alliance
    const gameContext = gamePosition ? `
🎮 Current Game State:
- Phase: ${gamePosition.phase}
- Current Player: ${gamePosition.currentPlayer === 1 ? 'Human (X)' : 'AI (O)'}
- Board Position: ${gamePosition.board.join('')}
- Pieces Placed: Player ${gamePosition.piecesPlaced.player1}/4, AI ${gamePosition.piecesPlaced.player2}/4
` : ''

    const stakingInfo = `
💰 Financial Context:
- Your PYUSD Balance: ${currentBalance.toFixed(2)} PYUSD
- Wallet Connected: ${wallet.isConnected ? 'Yes' : 'No'}
- Available Actions: ${wallet.isConnected ? 
  currentBalance > 0 ? 
    `Real stakes up to ${Math.min(currentBalance, 10).toFixed(2)} PYUSD` :
    `Demo mode only (no PYUSD available)` :
  'Connect wallet for staking'
}`

    const conversationContext = historyText ? `
🗣️ Recent Conversation:
${historyText}
` : ''

    const fullContext = `${gameContext}${stakingInfo}${conversationContext}

User Query: "${command}"

Instructions: Provide intelligent, helpful responses as a QuadraX gaming strategist. Use ASI Alliance reasoning capabilities. For demo requests, include "START_DEMO_MODE". For valid stake agreements (only if user has sufficient balance), include "LOCK_STAKE:{amount}".`

    try {
      // Direct ASI Alliance integration - no fallbacks needed with proper setup
      const { ASIService } = await import('../../../services/asiService')
      const asiService = new ASIService({
        apiKey: process.env.NEXT_PUBLIC_ASI_API_KEY || '',
        baseUrl: 'https://api.asi1.ai/v1',
        model: 'asi1-mini',
        agentverse: {
          apiToken: process.env.NEXT_PUBLIC_AGENTVERSE_API_TOKEN,
          endpoint: 'https://agentverse.ai/api',
          mcpEnabled: true
        },
        metta: {
          enabled: true,
          pythonEndpoint: process.env.NEXT_PUBLIC_METTA_ENDPOINT
        }
      })

      // Initialize ASI service if not already done
      await asiService.initialize()
      
      const aiResponse = await asiService.generateResponse(command, fullContext)
      
      // Handle special commands in response
      let processedResponse = aiResponse
      
      if (aiResponse.includes('START_DEMO_MODE')) {
        processedResponse = aiResponse.replace(/START_DEMO_MODE/gi, '').trim()
        setTimeout(() => {
          if (onNegotiationComplete) {
            onNegotiationComplete(null, true)
          }
        }, 1000)
      }
      
      const lockMatch = aiResponse.match(/LOCK_STAKE:(\d+(?:\.\d+)?)/i)
      if (lockMatch) {
        const agreedStake = parseFloat(lockMatch[1])
        processedResponse = aiResponse.replace(/LOCK_STAKE:\d+(?:\.\d+)?/gi, '').trim()
        
        if (agreedStake >= 1 && agreedStake <= 10 && agreedStake <= currentBalance) {
          setNegotiatedStake(agreedStake)
          setTimeout(() => {
            setShowConfirmation(true)
          }, 800)
        }
      }
      
      return createMessage(
        processedResponse || "I'm here to help with QuadraX strategy using ASI Alliance intelligence!",
        'agent', 
        agent.name
      )
      
    } catch (error) {
      console.error('ASI Alliance integration error:', error)
      
      // Check for specific configuration issues
      const asiApiKey = process.env.NEXT_PUBLIC_ASI_API_KEY
      const agentverseToken = process.env.NEXT_PUBLIC_AGENTVERSE_API_TOKEN
      
      if (!asiApiKey) {
        return createMessage(
          `⚠️ **ASI Alliance Configuration Required**

ASI Alliance API key is missing. Please configure:
\`\`\`
NEXT_PUBLIC_ASI_API_KEY=your_asi_api_key
NEXT_PUBLIC_AGENTVERSE_API_TOKEN=your_agentverse_token
\`\`\`

This enables:
🧠 **ASI:One Intelligence** - Advanced reasoning capabilities
🤖 **Agentverse Integration** - Multi-agent coordination
� **MeTTa Knowledge** - Structured reasoning graphs
⚡ **Chat Protocol** - Natural language interactions

Until configured, basic responses are limited.`,
          'agent',
          agent.name
        )
      }
      
      // ASI Alliance configured but connection failed
      return createMessage(
        `🔄 **ASI Alliance Connection Issue**

${agent.name} is configured but experiencing connectivity issues with ASI Alliance services.

**Troubleshooting:**
• Check internet connection
• Verify API key validity
• Try refreshing the page

**ASI Alliance Status:**
• API Key: ${asiApiKey ? '✅ Configured' : '❌ Missing'}
• Agentverse: ${agentverseToken ? '✅ Configured' : '❌ Missing'}
• MeTTa: ${process.env.NEXT_PUBLIC_METTA_ENDPOINT ? '✅ Configured' : '⚠️ Optional'}

Hedera blockchain operations remain available.`,
        'agent',
        agent.name
      )
    }
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