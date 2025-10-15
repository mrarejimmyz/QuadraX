'use client'

import React, { useState, useEffect } from 'react'
import { ASIStatus, ChatMode } from '../types/chat.types'
import { QuadraXAgent } from '../../../lib/agents/quadraXAgent'
import { useChainId, useBlockNumber } from 'wagmi'
import { useWallet } from '../../../lib/hooks/useWallet'
import { useBalances } from '../../../lib/hooks/useBalances'

interface StatusBarProps {
  activeMode: ChatMode
  setActiveMode: (mode: ChatMode) => void
  asiStatus: ASIStatus
  agents: QuadraXAgent[]
}

export function StatusBar({ activeMode, setActiveMode, asiStatus, agents }: StatusBarProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const chainId = useChainId()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const wallet = useWallet()
  const balances = useBalances()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getModeIcon = (mode: string) => {
    const icons = {
      chat: '💬',
      analysis: '📊', 
      negotiation: '🤝',
      strategy: '⚡'
    }
    return icons[mode as keyof typeof icons] || '💬'
  }

  return (
    <>
      {/* Mode Selector */}
      <div className="p-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80">
        <div className="flex gap-2">
          {(['chat', 'analysis', 'negotiation', 'strategy'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                activeMode === mode 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 scale-105' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/80 bg-gray-800/60 hover:scale-102'
              }`}
            >
              <span className="text-base">{getModeIcon(mode)}</span>
              <span>{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="border-b border-gray-700/50 bg-gradient-to-r from-slate-900/90 to-gray-900/90 backdrop-blur-sm">
        <div 
          className="px-4 py-3 flex items-center justify-between text-sm cursor-pointer hover:bg-gray-800/30 transition-all duration-200"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 font-medium">
                {chainId === 11155111 ? 'Sepolia' : chainId === 296 ? 'Hedera' : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isClient && wallet.isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              {isClient && wallet.isConnected ? (
                <span className="text-green-400 font-medium">
                  {balances?.pyusd?.formatted ? parseFloat(balances.pyusd.formatted).toFixed(2) : '0.00'} PYUSD
                </span>
              ) : (
                <span className="text-yellow-400 font-medium">Connect Wallet</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${asiStatus.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`font-medium ${asiStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                AI {asiStatus.connected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <button className="flex items-center gap-1 hover:text-white">
            <span>Details</span>
            <span className={`transform transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
        
        {/* Expandable Technical Details */}
        {showTechnicalDetails && (
          <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-800 grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-400">Block:</span> #{blockNumber?.toString().slice(-6) || 'Syncing'}
            </div>
            <div>
              <span className="text-gray-400">Latency:</span> {asiStatus.responseTime}ms
            </div>
            <div>
              <span className="text-gray-400">Model:</span> {asiStatus.modelVersion}
            </div>
            <div>
              <span className="text-gray-400">Agents:</span> {agents.length}/4 active
            </div>
          </div>
        )}
      </div>
    </>
  )
}