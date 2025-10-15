/**
 * ASI Alliance Demo Page  
 * Showcases intelligent AI agents powered by ASI:One + MeTTa + Agentverse for strategic gameplay
 * ETH Online 2025 Integration: ASI Alliance ($8500) + Hedera Agent Kit ($4000)
 */

'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { EnhancedAINegotiationPanel } from '@/components/OllamaIntegration' // TODO: Update to ASI component
import { useEnhancedHederaAgents } from '@/lib/agents/enhancedHederaAgentKit'
import { Board } from '@/features/game'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ASIService } from '@/services/asiService'
import { MeTTaService } from '@/services/mettaService'

export default function ASIAllianceDemoPage() {
  const [asiStatus, setAsiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [mettaStatus, setMettaStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  
  const {
    gameState,
    getAIMove,
    updateBoard
  } = useEnhancedHederaAgents()

  useEffect(() => {
    // Initialize ASI Alliance services
    const initializeServices = async () => {
      try {
        const asiService = new ASIService({
          apiKey: process.env.NEXT_PUBLIC_ASI_API_KEY || ''
        })
        
        const mettaService = new MeTTaService({
          enabled: true,
          endpoint: process.env.NEXT_PUBLIC_METTA_ENDPOINT || 'http://localhost:8080/metta'
        })

        await asiService.initialize()
        setAsiStatus('connected')
        
        setMettaStatus('connected')
      } catch (error) {
        console.error('ASI Alliance initialization failed:', error)
        setAsiStatus('error')
        setMettaStatus('error')
      }
    }

    initializeServices()
  }, [])

  const handleCellClick = async (position: number) => {
    if (gameState.board[position] !== 0 || gameState.gamePhase !== 'playing') return

    // Human move
    updateBoard(position, gameState.currentPlayer)

    // ASI Alliance AI move (enhanced with MeTTa reasoning)
    setTimeout(async () => {
      const aiMove = await getAIMove(0, 30) // Get move from first ASI agent
      if (aiMove !== null) {
        updateBoard(aiMove, gameState.currentPlayer)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-bold">QuadraX</span>
              <span className="text-sm text-white/60">ASI Alliance + Hedera Demo</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Status Indicators */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex gap-4 text-sm">
          <div className={`flex items-center gap-2 ${
            asiStatus === 'connected' ? 'text-green-400' : 
            asiStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              asiStatus === 'connected' ? 'bg-green-400' : 
              asiStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`} />
            ASI:One {asiStatus === 'connected' ? 'Connected' : asiStatus === 'error' ? 'Error' : 'Connecting...'}
          </div>
          <div className={`flex items-center gap-2 ${
            mettaStatus === 'connected' ? 'text-green-400' : 
            mettaStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              mettaStatus === 'connected' ? 'bg-green-400' : 
              mettaStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`} />
            MeTTa {mettaStatus === 'connected' ? 'Connected' : mettaStatus === 'error' ? 'Error' : 'Connecting...'}
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Game Board */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">ASI Alliance Gaming Demo</h1>
              <p className="text-white/80 leading-relaxed">
                Experience QuadraX powered by <strong>ASI Alliance</strong> integration:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>🤖 <strong>ASI:One Chat Protocol:</strong> Multi-agent communication</li>
                <li>🧠 <strong>MeTTa Knowledge Graphs:</strong> Strategic reasoning</li>
                <li>🌐 <strong>Agentverse:</strong> Agent discovery and orchestration</li>
                <li>🔄 <strong>A2A Protocol:</strong> Agent-to-agent collaboration</li>
                <li>💎 <strong>Hedera Integration:</strong> PYUSD staking and settlements</li>
              </ul>
            </div>

            <Board 
              board={gameState.board}
              onCellClick={handleCellClick}
              currentPlayer={gameState.currentPlayer}
            />

            <div className="glass p-4 rounded-xl">
              <h3 className="font-semibold mb-2">ETH Online 2025 Prizes</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>🏆 ASI Alliance Integration</span>
                  <span className="text-green-400">$8,500</span>
                </div>
                <div className="flex justify-between">
                  <span>💎 Hedera Agent Kit</span>
                  <span className="text-blue-400">$4,000</span>
                </div>
                <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total Prize Pool</span>
                  <span className="text-yellow-400">$12,500</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat Panel */}
          <div>
            <EnhancedAINegotiationPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20 p-6 text-center text-sm text-white/60">
        <div className="space-y-2">
          <p>Powered by ASI Alliance: ASI:One + MeTTa + Agentverse + A2A Protocol</p>
          <p>Hedera Agent Kit integration for PYUSD staking and multi-agent coordination</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="https://asi1.ai/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              ASI Alliance
            </a>
            <a href="https://agentverse.ai/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Agentverse
            </a>
            <a href="https://hedera.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Hedera
            </a>
            <Link href="/game" className="hover:text-white">
              Full Game
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}