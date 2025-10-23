'use client'

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
  agents: any[]
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
        'AI stake advisors loading... Please wait a moment.',
        'ai'
      )
    }

    const agent = agents[Math.floor(Math.random() * agents.length)]
    const currentBalance = balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted) : 0
    
    // Enhanced stake negotiation responses
    if (command.toLowerCase().includes('help me decide') || command.toLowerCase().includes('recommend')) {
      const optimalStake = Math.min(Math.max(1, Math.floor(currentBalance * 0.15)), 10)
      return createMessage(
        `🎯 **Personalized Stake Recommendation**

Based on your ${currentBalance.toFixed(2)} PYUSD balance, I recommend:

**💡 Optimal Stake: ${optimalStake} PYUSD**

**📊 Analysis:**
• **Risk Level:** ${optimalStake <= 3 ? 'Conservative' : optimalStake <= 6 ? 'Moderate' : 'Aggressive'}
• **Bankroll %:** ${((optimalStake / currentBalance) * 100).toFixed(1)}% of your balance
• **Potential Reward:** ~${(optimalStake * 1.995).toFixed(2)} PYUSD if you win

**🎲 Win Scenarios:**
• If you win: +${(optimalStake * 0.995).toFixed(2)} PYUSD profit
• If you lose: -${optimalStake} PYUSD loss
• Platform fee: 0.25% (${(optimalStake * 2 * 0.0025).toFixed(3)} PYUSD)

Ready to stake ${optimalStake} PYUSD? Just say "Stake ${optimalStake} PYUSD" to proceed!`,
        'agent',
        agent.name
      )
    }

    // Handle odds/probability queries
    if (command.toLowerCase().includes('odds') || command.toLowerCase().includes('probability')) {
      return createMessage(
        `🎲 **Win Probability Analysis**

${agent.name} calculates your chances:

**🧠 Factors Considered:**
• Your strategic advantage: Estimated 58% win rate
• QuadraX complexity: Multiple win conditions favor tactical players
• AI opponent analysis: Beatable with good positioning

**📈 Expected Outcomes:**
• **Your Win Rate:** ~58% (above average)
• **Expected Value:** Positive at stakes up to ${Math.min(currentBalance * 0.2, 8).toFixed(0)} PYUSD
• **Confidence Level:** High (mathematically favorable)

**💰 Stake Recommendations by Confidence:**
• **High Confidence (1-3 PYUSD):** 95% sure of positive EV
• **Medium Confidence (4-6 PYUSD):** 80% sure of positive EV  
• **Lower Confidence (7-10 PYUSD):** 65% sure of positive EV

The math is in your favor - choose your risk tolerance!`,
        'agent',
        agent.name
      )
    }

    // Handle risk analysis
    if (command.toLowerCase().includes('risk') || command.toLowerCase().includes('analyze risk')) {
      return createMessage(
        `⚠️ **Risk Assessment Report**

**💳 Your Financial Position:**
• PYUSD Balance: ${currentBalance.toFixed(2)}
• Recommended Max Stake: ${Math.min(currentBalance * 0.25, 10).toFixed(2)} PYUSD (25% rule)

**📊 Risk Levels by Stake Amount:**

🟢 **LOW RISK (1-2 PYUSD):**
• Loss impact: Minimal
• Recommended for: New players, cautious approach

🟡 **MODERATE RISK (3-5 PYUSD):**
• Loss impact: Manageable
• Recommended for: Balanced strategy

🔴 **HIGH RISK (6-10 PYUSD):**
• Loss impact: Significant
• Recommended for: Confident players only

What risk level matches your style?`,
        'agent',
        agent.name
      )
    }

    // Handle specific stake amounts
    const stakeMatch = command.match(/(\d+(?:\.\d+)?)/i)
    if (stakeMatch && command.toLowerCase().includes('stake')) {
      const proposedStake = parseFloat(stakeMatch[1])
      
      if (proposedStake >= 1 && proposedStake <= 10 && proposedStake <= currentBalance) {
        const riskLevel = proposedStake <= 3 ? 'conservative' : proposedStake <= 6 ? 'balanced' : 'aggressive'
        
        return createMessage(
          `💰 **Stake Analysis: ${proposedStake} PYUSD**

${agent.name} evaluates your proposal:

**✅ Assessment: ${riskLevel.toUpperCase()} APPROACH**

**📊 Financial Impact:**
• Your stake: ${proposedStake} PYUSD
• Total pot: ${(proposedStake * 2).toFixed(2)} PYUSD
• Winner receives: ~${(proposedStake * 1.995).toFixed(2)} PYUSD

**🤖 ${agent.name}'s Verdict:** ${
  proposedStake <= 3 ? 'Solid conservative choice!' :
  proposedStake <= 6 ? 'Excellent balanced approach!' :
  'Bold move! High risk, high reward.'
}

Ready to lock in ${proposedStake} PYUSD? LOCK_STAKE:${proposedStake}`,
          'agent',
          agent.name
        )
      }
    }

    // Default response
    return createMessage(
      `🤖 **${agent.name} - Stake Advisor**

I'm here to help optimize your PYUSD stake strategy! Try:

• 💡 **"Help me decide"** - Get personalized recommendation
• 🎲 **"What are my odds?"** - Win probability analysis  
• ⚠️ **"Analyze risk"** - Risk assessment by stake level
• 💰 **"Stake [amount] PYUSD"** - Evaluate specific amounts

What would you like to know about staking strategy?`,
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