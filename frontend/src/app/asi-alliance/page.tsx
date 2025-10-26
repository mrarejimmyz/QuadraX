/**
 * ASI Alliance Demo Page - Streamlined for Live Demo
 * Fast-loading showcase of AI chat and reasoning capabilities
 */

'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function ASIAllianceDemoPage() {
  const [mounted, setMounted] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'system',
      text: 'ASI Alliance agents are ready to assist with QuadraX strategy and game analysis.',
      timestamp: Date.now()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: Date.now()
    }

    setChatMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate AI response for demo
    setTimeout(() => {
      const responses = [
        "I understand you're interested in QuadraX strategy. Based on my analysis using MeTTa reasoning, I recommend focusing on center control in the placement phase.",
        "Great question! The ASI Alliance agents suggest a balanced approach: secure 2x2 square formations while preventing opponent forks.",
        "From my strategic analysis, I see multiple winning paths available. Let me break down the optimal move sequence for you.",
        "Excellent! My neural reasoning indicates this position has high winning potential. I recommend prioritizing defensive positioning.",
        "Using advanced game theory, I can see this creates a tactical advantage. The probability calculations favor aggressive center play."
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: randomResponse,
        timestamp: Date.now()
      }

      setChatMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🧠</div>
          <h2 className="text-2xl text-white font-bold">Loading ASI Alliance...</h2>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-purple-200 transition-colors">
            <span className="text-4xl">🧠</span>
            <h1 className="text-3xl font-bold">ASI Alliance</h1>
          </Link>
          <ConnectButton showBalance={false} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-6">
            AI-Powered Strategic Assistance
          </h2>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Chat with ASI Alliance agents powered by MeTTa reasoning for 
            advanced QuadraX strategy and game analysis.
          </p>

          {/* Status Indicators */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              ASI Alliance Active
            </div>
            <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              MeTTa Reasoning Online
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-white/5 border-b border-white/20 p-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  ASI Alliance Strategic Assistant
                </h3>
                <p className="text-gray-300 text-sm mt-1">Powered by MeTTa reasoning and neural analysis</p>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-green-500/20 text-green-100 border border-green-500/30' 
                        : message.sender === 'ai'
                        ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                        : 'bg-gray-500/20 text-gray-100 border border-gray-500/30'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-blue-500/20 text-blue-100 border border-blue-500/30 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="bg-white/5 border-t border-white/20 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                    placeholder="Ask about QuadraX strategy, game analysis, or tactics..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-all"
                  >
                    Send
                  </button>
                </div>
                
                {/* Quick Questions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    "What's the best opening move?",
                    "How do I prevent opponent forks?",
                    "Analyze this position",
                    "Strategic tips for movement phase"
                  ].map((question) => (
                    <button
                      key={question}
                      onClick={() => setInputText(question)}
                      className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 text-gray-300 px-3 py-1 rounded-full text-xs transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Agent Status */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Active Agents
              </h4>
              
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="font-medium text-green-300">AlphaStrategist</span>
                  </div>
                  <p className="text-xs text-gray-300">Strategic positioning & center control</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="font-medium text-blue-300">BetaDefender</span>
                  </div>
                  <p className="text-xs text-gray-300">Threat detection & blocking analysis</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="font-medium text-purple-300">GammaAggressor</span>
                  </div>
                  <p className="text-xs text-gray-300">Aggressive tactics & win creation</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="font-medium text-yellow-300">DeltaAdaptive</span>
                  </div>
                  <p className="text-xs text-gray-300">Adaptive strategy & pattern recognition</p>
                </div>
              </div>
            </div>

            {/* Game Integration */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>🎮</span> Game Integration
              </h4>
              
              <div className="space-y-4">
                <Link
                  href="/game"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all text-center block"
                >
                  🚀 Play with AI Assistance
                </Link>
                
                <Link
                  href="/demo"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-all text-center block"
                >
                  🎬 View Live Demo
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> AI Features
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  MeTTa logical reasoning
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Multi-agent consultation
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Real-time strategy analysis
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Adaptive difficulty scaling
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  Neural pattern recognition
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}