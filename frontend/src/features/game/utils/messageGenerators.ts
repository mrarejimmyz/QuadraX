import { Message } from '../types/chat.types'

interface MessageGeneratorParams {
  isConnected: boolean
  pyusdBalance: string
  agentCount: number
}

export const generateWelcomeMessage = ({ isConnected, pyusdBalance, agentCount }: MessageGeneratorParams): string => {
  const balance = parseFloat(pyusdBalance)
  const maxStake = Math.min(balance, 10)
  
  return `🎯 **Welcome to QuadraX!**

Ready to play strategic 4x4 Tic-Tac-Toe with AI agents${isConnected && balance > 0 ? ' and real PYUSD stakes' : ''}!

**🚀 Quick Start Options:**
${isConnected ? 
  balance > 0 ? 
    `• 💰 **"Stake ${Math.min(5, maxStake).toFixed(0)} PYUSD"** - Play with real money (${balance.toFixed(2)} available)
• 🎮 **"Demo game"** - Practice for free` : 
    `• 🎮 **"Demo game"** - Practice for free (No PYUSD detected)
• 🔗 **Add PYUSD** to your wallet for real stakes` :
  `• 🔗 **Connect Wallet** - For PYUSD staking
• 🎮 **"Demo game"** - Practice for free`
}
• 🧠 **"Help me win"** - Get strategy advice
• 📊 **"Analyze"** - Board position analysis

**🤖 AI Team Status:** ${agentCount} specialists online and ready to assist!

What would you like to do?`
}

export const generateHelpMessage = (agentName: string, { isConnected, pyusdBalance }: Pick<MessageGeneratorParams, 'isConnected' | 'pyusdBalance'>): string => {
  return `🤖 **${agentName} Help**

**Game Commands:**
• **"Demo"** - Start practice game
${isConnected ? `• **"Stake [amount] PYUSD"** - Play with real money (${pyusdBalance} available)` : '• **Connect Wallet** - For PYUSD gameplay'}
• **"Help me win"** - Get strategy advice
• **"Analyze board"** - Evaluate current position

**Quick Tips:**
• Win by getting 4 in a row OR forming a 2x2 square
• AI agents will negotiate stakes and provide insights
• Just type naturally - I understand context!

Need anything else?`
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
  return `🤖 **AI Team Ready** (${agentNames.length}/4 active)

${agentNames.map(name => `• **${name}** - specialist`).join('\n')}

Each brings unique strategic insights to help you win!`
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