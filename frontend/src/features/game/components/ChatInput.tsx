'use client'

import React from 'react'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  isProcessing: boolean
  enabled: boolean
  onSendMessage: () => void
}

export function ChatInput({ input, setInput, isProcessing, enabled, onSendMessage }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const getActionIcon = (action: string) => {
    const icons = {
      analyze: '📊',
      stake: '💰',
      move: '⚡',
      help: '❓'
    }
    return icons[action as keyof typeof icons] || '⚡'
  }

  return (
    <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-900/90 to-slate-900/90 backdrop-blur-sm">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={enabled ? "💬 Ask AI about strategy, stakes, or moves..." : "🔒 Start a game to enable chat"}
            disabled={!enabled || isProcessing}
            className="w-full border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg"
            style={{ 
              backgroundColor: 'rgba(31, 41, 55, 0.95)',
              color: 'white',
              caretColor: 'white'
            }}
          />
          {isProcessing && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onSendMessage}
          disabled={!enabled || !input.trim() || isProcessing}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none"
        >
          {isProcessing ? '⏳' : '🚀'}
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex gap-2 mt-3">
        {(['analyze', 'stake', 'move', 'help'] as const).map(action => (
          <button
            key={action}
            onClick={() => {
              setInput(action)
              setTimeout(onSendMessage, 10)
            }}
            disabled={!enabled || isProcessing}
            className="flex items-center gap-2 text-sm px-3 py-2 bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm"
          >
            <span>{getActionIcon(action)}</span>
            <span className="capitalize">{action}</span>
          </button>
        ))}
      </div>
    </div>
  )
}