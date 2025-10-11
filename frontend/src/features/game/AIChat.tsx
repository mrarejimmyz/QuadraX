'use client'

import { useState, useEffect, useRef } from 'react'
import { useHederaAgents, A2AGameMessage } from '@/lib/agents/hederaAgentKitV2'

interface Message {
  id: number
  sender: 'ai' | 'user' | 'agent'
  text: string
  timestamp: Date
  agentName?: string
}

interface AIChatProps {
  aiName?: string
  enabled?: boolean
  gameId?: string
}

export default function AIChat({ aiName = 'AI Agent', enabled = true, gameId = 'demo-game' }: AIChatProps) {
  // Initialize Hedera Agent Kit for A2A communication
  const { agents, messages: agentMessages, startNegotiation } = useHederaAgents()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isNegotiating, setIsNegotiating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize with dynamic welcome message
  useEffect(() => {
    if (agents.length > 0) {
      const welcomeMessage: Message = {
        id: 1,
        sender: 'ai',
        text: `🤖 Hedera Agent Kit initialized! ${agents.length} AI agents ready for A2A protocol communication. Available agents: ${agents.map(a => a.name).join(', ')}`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [agents.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Convert Hedera Agent A2A messages to chat messages with human-readable format
  useEffect(() => {
    if (agentMessages.length > 0) {
      const latestAgentMessage = agentMessages[agentMessages.length - 1]
      
      // Skip messages that are too frequent (prevent spam)
      const lastMessageTime = messages.length > 0 ? messages[messages.length - 1].timestamp.getTime() : 0
      const currentTime = Date.now()
      if (currentTime - lastMessageTime < 2000) {
        return // Skip if less than 2 seconds since last message
      }
      
      // Set negotiation state when agents are communicating
      setIsNegotiating(true)
      setTimeout(() => setIsNegotiating(false), 3000) // Show negotiating for 3 seconds
      
      // Format the message in a human-readable way
      let humanText = ""
      let emoji = "🤖"
      
      switch (latestAgentMessage.type) {
        case 'move_proposal':
          emoji = "🎯"
          humanText = `Agent ${latestAgentMessage.from} proposes strategic move at position ${latestAgentMessage.payload.position} with ${Math.round((latestAgentMessage.payload.confidence || 0) * 100)}% confidence`
          break
        case 'strategy_share':
          emoji = "🧠"
          const strategy = latestAgentMessage.payload.strategy || 'Strategic analysis'
          const reasoning = latestAgentMessage.payload.reasoning || 'Tactical evaluation in progress'
          humanText = `${latestAgentMessage.from}: "${strategy}" - ${reasoning}`
          break
        case 'negotiation':
          emoji = "🤝"
          const response = latestAgentMessage.payload.response || 'strategic_discussion'
          const negReasoning = latestAgentMessage.payload.reasoning || 'Agent negotiation in progress'
          const confidence = Math.round((latestAgentMessage.payload.confidence || 0) * 100)
          humanText = `${latestAgentMessage.from} ${response}: "${negReasoning}" (${confidence}% confidence)`
          break
        case 'human_approval_request':
          emoji = "👤"
          const decision = latestAgentMessage.payload.decision || 'Strategic decision required'
          const reqReasoning = latestAgentMessage.payload.reasoning || 'Human oversight requested'
          humanText = `${latestAgentMessage.from} requests approval: "${decision}" - ${reqReasoning}`
          break
        default:
          emoji = "🔄"
          humanText = `${latestAgentMessage.from} sends ${latestAgentMessage.type} message via A2A protocol`
      }
      
      const chatMessage: Message = {
        id: Date.now(),
        sender: 'agent',
        text: `${emoji} ${humanText}`,
        timestamp: new Date(latestAgentMessage.timestamp),
        agentName: latestAgentMessage.from
      }
      
      setMessages(prev => [...prev.slice(-10), chatMessage]) // Keep only last 10 messages
    }
  }, [agentMessages])

  const handleSend = () => {
    if (input.trim() && enabled) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'user',
        text: input,
        timestamp: new Date()
      }
      setMessages([...messages, newMessage])
      setInput('')

      // Trigger real agent interaction based on user input
      setTimeout(() => {
        if (input.toLowerCase().includes('stake') || input.toLowerCase().includes('pyusd')) {
          // Start a negotiation about stakes
          startNegotiation(gameId, Math.floor(Math.random() * 9))
        } else if (input.toLowerCase().includes('move') || input.toLowerCase().includes('play')) {
          // Agents discuss moves
          const aiResponse: Message = {
            id: Date.now(),
            sender: 'ai',
            text: `🎮 Analyzing your suggestion... Let me coordinate with the ${agents.length} active agents via A2A protocol.`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiResponse])
          
          // Trigger agent negotiation after a short delay
          setTimeout(() => {
            startNegotiation(gameId, Math.floor(Math.random() * 9))
          }, 2000)
        } else if (input.toLowerCase().includes('status') || input.toLowerCase().includes('agents')) {
          // Show real agent status
          const aiResponse: Message = {
            id: Date.now(),
            sender: 'ai',
            text: `📊 System Status: ${agents.length} active Hedera agents (${agents.map(a => a.name).join(', ')}). Total A2A messages: ${agentMessages.length}. Ready for strategic negotiations!`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiResponse])
        } else if (input.toLowerCase().includes('help') || input.toLowerCase().includes('commands')) {
          // Show available commands
          const aiResponse: Message = {
            id: Date.now(),
            sender: 'ai',
            text: `💡 Available commands: "stake" or "pyusd" (discuss stakes), "move" or "play" (strategy discussion), "status" (agent info), "negotiate" (start A2A negotiation). All powered by real Hedera Agent Kit!`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiResponse])
        } else {
          // General response with real agent data
          const aiResponse: Message = {
            id: Date.now(),
            sender: 'ai',
            text: `🤖 "${input}" received by ${agents.length} Hedera agents. Try "help" for commands, or mention "negotiate" to start A2A protocol communications!`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, aiResponse])
        }
      }, 500)
    }
  }

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col h-[500px] hover:shadow-2xl transition-all duration-300">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white/20"></div>
            </div>
            <div>
              <h3 className="font-bold text-white">Hedera AI Agents</h3>
              <p className="text-xs text-purple-200">A2A Protocol Communication</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-200">🏆 Target: $4,000 Prize</div>
            <div className="text-xs text-white/60">
              {agents.length} agents active | {agentMessages.length} A2A messages
            </div>
            <div className={`text-xs flex items-center gap-2 justify-end ${isNegotiating ? 'text-yellow-400' : 'text-green-400'}`}>
              <button 
                onClick={() => {setMessages([]); window.location.reload()}} 
                className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 hover:text-red-200 transition-colors"
              >
                Reset
              </button>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isNegotiating ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
              {isNegotiating ? 'A2A Negotiating...' : agentMessages.length > 0 ? 'Ready' : 'Waiting'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-500/30 ml-auto'
                  : message.sender === 'agent'
                  ? 'bg-purple-500/30 border border-purple-400/30'
                  : 'bg-white/10'
              }`}
            >
              {message.sender === 'agent' && (
                <p className="text-xs text-purple-300 mb-1">🤖 Hedera Agent: {message.agentName}</p>
              )}
              <p className="text-sm">{message.text}</p>
              <p className="text-xs text-white/50 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={!enabled}
            placeholder={enabled ? "Chat with AI..." : "AI offline"}
            className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20
                     focus:border-white/40 focus:outline-none text-white text-sm
                     placeholder:text-white/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!enabled || !input.trim()}
            className="px-6 py-2 rounded-lg btn-secondary btn-hover font-bold text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     shadow-lg hover:shadow-blue-500/25"
          >
            🚀 Send
          </button>
        </div>
        
        {/* Enhanced Hedera Agent Kit Demo Section */}
        <div className="mt-3 pt-3 border-t border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-3 -mx-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-purple-200">🚀 Real Hedera Agent Kit A2A</div>
            <div className="text-xs bg-purple-500/30 px-2 py-1 rounded-full text-purple-200">
              {agents.length} Agents | {agentMessages.length} Messages
            </div>
          </div>
          
          <button
            onClick={() => startNegotiation(gameId, Math.floor(Math.random() * 9))}
            className="w-full px-4 py-4 rounded-xl btn-rainbow btn-hover font-black text-sm
                     uppercase tracking-wider shadow-2xl hover:shadow-purple-500/50
                     border-2 border-transparent relative overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              <span className="text-xl animate-bounce">🤖</span>
              <span className="text-white drop-shadow-lg">Start A2A Agent Negotiation</span>
              <span className="text-xl animate-pulse">💬</span>
            </div>
          </button>
          
          <div className="mt-2 text-center">
            <p className="text-xs text-purple-200 font-medium">🏆 Target: $4,000 Hedera Prize</p>
            <p className="text-xs text-white/60">Multi-agent communication via A2A protocol</p>
          </div>
        </div>
      </div>
    </div>
  )
}
