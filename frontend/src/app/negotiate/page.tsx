'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

type Message = {
  role: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
}

export default function NegotiatePage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [proposedStake, setProposedStake] = useState<number | null>(null)
  const [agreedStake, setAgreedStake] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    // Initial greeting from AI
    setMessages([
      {
        role: 'system',
        content: '🤖 AI Opponent Ready',
        timestamp: new Date()
      },
      {
        role: 'ai',
        content: "Welcome to QuadraX! I'm your AI opponent. Before we begin our strategic battle on the 4x4 grid, we need to agree on the stakes. What amount of PYUSD would you like to wager on this match?",
        timestamp: new Date()
      }
    ])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if user is accepting the AI's current proposal
    const isAccepting = /\b(accept|agreed?|yes|ok|deal|sure|fine|i accept)\b/i.test(input)
    
    if (isAccepting && proposedStake) {
      // User accepted the AI's proposal
      const aiMessage: Message = {
        role: 'ai',
        content: `Perfect! ${proposedStake} PYUSD it is. Let's make this battle legendary! 🎯`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setAgreedStake(proposedStake)
      setIsTyping(false)
      return
    }

    // Parse stake amount from user input
    const stakeMatch = input.match(/(\d+\.?\d*)/)
    const userStake = stakeMatch ? parseFloat(stakeMatch[0]) : null

    let aiResponse = ''
    let newProposedStake = proposedStake

    if (userStake !== null) {
      if (userStake < 1) {
        aiResponse = "I appreciate your enthusiasm, but let's keep it interesting. The minimum stake is 1 PYUSD. How about we start at 5 PYUSD?"
        newProposedStake = 5
      } else if (userStake > 100) {
        aiResponse = `${userStake} PYUSD? That's quite bold! I respect your confidence. However, let's keep it reasonable. I counter with ${Math.min(userStake / 2, 50)} PYUSD. Deal?`
        newProposedStake = Math.min(userStake / 2, 50)
      } else if (userStake >= 1 && userStake <= 100) {
        const randomFactor = Math.random()
        if (randomFactor > 0.7) {
          // AI accepts
          aiResponse = `${userStake} PYUSD it is! I accept your terms. This will be an interesting match. Ready to proceed to staking?`
          setAgreedStake(userStake)
        } else if (randomFactor > 0.4) {
          // AI counters slightly higher
          const counter = Math.min(userStake * 1.2, 100)
          aiResponse = `Hmm, ${userStake} PYUSD is reasonable, but I sense you have more confidence than that. How about ${counter.toFixed(2)} PYUSD to make it more thrilling?`
          newProposedStake = parseFloat(counter.toFixed(2))
        } else {
          // AI counters slightly lower
          const counter = Math.max(userStake * 0.8, 1)
          aiResponse = `I like your style! But let's start a bit lower at ${counter.toFixed(2)} PYUSD. We can always increase the stakes for the next match if you win.`
          newProposedStake = parseFloat(counter.toFixed(2))
        }
      }
    } else {
      // Generic responses
      const responses = [
        "Let's talk numbers. What stake amount feels right for you? I'm thinking somewhere between 5-20 PYUSD.",
        "I'm ready for a challenge! Suggest a stake amount and we'll negotiate from there.",
        "Every great game needs good stakes. What's your opening offer in PYUSD?",
      ]
      aiResponse = responses[Math.floor(Math.random() * responses.length)]
    }

    setProposedStake(newProposedStake)

    const aiMessage: Message = {
      role: 'ai',
      content: aiResponse,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiMessage])
    setIsTyping(false)
  }

  const handleProceedToStaking = () => {
    if (agreedStake) {
      // Navigate to game page with agreed stake
      router.push(`/game?stake=${agreedStake}`)
    }
  }

  const quickStakeOptions = [1, 5, 10, 20, 50]

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300">
            ← Back to Home
          </Link>
          <ConnectButton showBalance={false} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💬 Negotiate Stakes
          </h1>
          <p className="text-gray-400">
            Chat with AI to agree on PYUSD stakes before playing
          </p>
        </div>

        {!isConnected && mounted && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 text-center">
            <p className="text-yellow-400 mb-4">
              🔒 Please connect your wallet to negotiate stakes
            </p>
            <ConnectButton />
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : message.role === 'system'
                      ? 'bg-purple-500/20 text-purple-300 text-center w-full'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {message.role === 'ai' && (
                    <div className="text-xs text-gray-400 mb-1">🤖 AI Opponent</div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Stake Suggestions */}
          {!agreedStake && proposedStake && (
            <div className="px-6 py-3 bg-white/5 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-2">AI Suggested: {proposedStake} PYUSD</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setInput(`I accept ${proposedStake} PYUSD`)
                    handleSendMessage()
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => {
                    const counter = proposedStake * 0.8
                    setInput(`How about ${counter.toFixed(2)} PYUSD instead?`)
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors"
                >
                  ↓ Counter Lower
                </button>
                <button
                  onClick={() => {
                    const counter = proposedStake * 1.2
                    setInput(`Let's go higher - ${counter.toFixed(2)} PYUSD?`)
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  ↑ Counter Higher
                </button>
              </div>
            </div>
          )}

          {/* Quick Stakes */}
          {!agreedStake && (
            <div className="px-6 py-3 bg-white/5 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-2">Quick Stakes:</p>
              <div className="flex gap-2">
                {quickStakeOptions.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setInput(`I propose ${amount} PYUSD`)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                  >
                    {amount} PYUSD
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            {agreedStake ? (
              <div className="text-center">
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
                  <p className="text-green-400 font-semibold text-lg mb-2">
                    ✅ Stakes Agreed: {agreedStake} PYUSD
                  </p>
                  <p className="text-gray-300 text-sm">
                    Ready to proceed to staking and gameplay
                  </p>
                </div>
                <button
                  onClick={handleProceedToStaking}
                  disabled={!mounted || !isConnected}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mounted && isConnected ? '🚀 Proceed to Staking' : '🔒 Connect Wallet First'}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your stake proposal or message..."
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none"
                  disabled={!mounted || !isConnected}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!mounted || !input.trim() || isTyping || !isConnected}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-white font-semibold mb-1">Fair Stakes</h3>
            <p className="text-gray-400 text-sm">
              Negotiate a fair amount both players agree on
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="text-white font-semibold mb-1">AI Negotiation</h3>
            <p className="text-gray-400 text-sm">
              Smart AI adapts to your proposals
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="text-white font-semibold mb-1">Secure</h3>
            <p className="text-gray-400 text-sm">
              Stakes locked in smart contract
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
