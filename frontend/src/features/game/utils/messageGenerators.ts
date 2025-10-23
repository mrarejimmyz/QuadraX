import { Message } from '../types/chat.types'

interface MessageGeneratorParams {
  isConnected: boolean
  pyusdBalance: string
  agentCount: number
}

export const generateWelcomeMessage = ({ isConnected, pyusdBalance, agentCount }: MessageGeneratorParams): string => {
  const balance = parseFloat(pyusdBalance)
  const maxStake = Math.min(balance, 10)
  
  return `💰 **Welcome to QuadraX Stake Negotiation!**

I'm your intelligent stake advisor powered by 4 ASI Alliance agents. Let's find the perfect PYUSD stake for your strategic advantage!

**🎯 Stake Options:**
${isConnected ? 
  balance > 0 ? 
    `• � **"Stake ${Math.min(3, maxStake).toFixed(0)} PYUSD"** - Conservative approach (${balance.toFixed(2)} available)
• ⚡ **"Stake ${Math.min(5, maxStake).toFixed(0)} PYUSD"** - Balanced risk/reward
• 🚀 **"Stake ${Math.min(8, maxStake).toFixed(0)} PYUSD"** - Aggressive play` : 
    `• 🎮 **"Demo game"** - Practice for free (No PYUSD detected)
• � **Add PYUSD** to your wallet for real stakes` :
  `• 🔗 **Connect Wallet** - Required for PYUSD staking
• 🎮 **"Demo game"** - Practice without stakes`
}

**🤖 Negotiation Commands:**
• 💭 **"Help me decide"** - Get personalized stake recommendation
• 🎲 **"What are my odds?"** - Win probability analysis
• 🔍 **"Analyze risk"** - Risk assessment for different stakes

**${agentCount} AI Advisors Online:** Ready to optimize your stake strategy!

What stake amount interests you?`
}

export const generateHelpMessage = (agentName: string, { isConnected, pyusdBalance }: Pick<MessageGeneratorParams, 'isConnected' | 'pyusdBalance'>): string => {
  return `💰 **${agentName} - Stake Negotiation Help**

**Stake Commands:**
• **"Demo"** - Start practice game without stakes
${isConnected ? `• **"Stake [1-10] PYUSD"** - Propose specific amount (${pyusdBalance} available)` : '• **Connect Wallet** - Required for PYUSD staking'}
• **"Help me decide"** - Get personalized stake recommendation
• **"What are my odds?"** - AI calculates your win probability

**Negotiation Tips:**
💡 **Conservative (1-3 PYUSD):** Lower risk, steady play
⚡ **Balanced (4-6 PYUSD):** Optimal risk/reward ratio  
🚀 **Aggressive (7-10 PYUSD):** High stakes, maximum excitement

**AI Analysis Available:**
• Risk assessment based on your wallet balance
• Opponent behavior prediction
• Optimal stake calculation using Kelly Criterion

Ready to negotiate your perfect stake amount?`
}

export const generateStatusMessage = ({ isConnected, pyusdBalance }: Pick<MessageGeneratorParams, 'isConnected' | 'pyusdBalance'>, asiConnected: boolean, asiResponseTime: number): string => {
  return `📊 **System Status**

${isConnected ? 
  `🟢 Ready to play with ${pyusdBalance} PYUSD` : 
  '🔴 Connect wallet to enable PYUSD games'
}
${asiConnected ? 
  `🤖 AI agents online (${asiResponseTime}ms)` : 
  '🤖 AI agents connecting...'
}

All systems ${isConnected && asiConnected ? 'ready' : 'initializing'}!`
}

export const generateAgentsMessage = (agentNames: string[]): string => {
  return `🤖 **Stake Advisory Team** (${agentNames.length}/4 active)

${agentNames.map((name, i) => {
  const specialties = [
    'Risk Assessment & Conservative Strategy',
    'Aggressive Staking & Market Analysis', 
    'Defensive Planning & Safety First',
    'Adaptive Negotiation & Dynamic Pricing'
  ]
  return `• **${name}** - ${specialties[i] || 'Strategic Analysis'}`
}).join('\n')}

Each agent brings unique perspectives on stake optimization and risk management!`
}

export const createMessage = (
  text: string, 
  sender: Message['sender'] = 'ai',
  agentName?: string,
  confidence?: number,
  proposedStake?: number
): Message => ({
  id: Date.now() + Math.random(), // Better unique ID
  sender,
  text,
  timestamp: new Date(),
  agentName,
  confidence,
  proposedStake
})