/**
 * Ollama + Llama 3.2 8B Demo Page
 * Showcases intelligent AI agents powered by Llama 3.2 8B for strategic gameplay
 */

'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { EnhancedAINegotiationPanel } from '@/components/OllamaIntegration'
import { useEnhancedHederaAgents } from '@/lib/agents/enhancedHederaAgentKit'
import { Board } from '@/features/game'
import Link from 'next/link'

export default function OllamaDemoPage() {
  const {
    gameState,
    getAIMove,
    updateBoard
  } = useEnhancedHederaAgents()

  const handleCellClick = async (position: number) => {
    if (gameState.board[position] !== 0 || gameState.gamePhase !== 'playing') return

    // Human move
    updateBoard(position, gameState.currentPlayer)

    // AI move (if enabled)
    setTimeout(async () => {
      const aiMove = await getAIMove(0, 30) // Get move from first agent
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
              <span className="text-sm text-white/60">Ollama + Llama 3.2 8B Demo</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              🧠 Ollama + Llama 3.2 8B Integration
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Experience truly intelligent AI agents powered by Llama 3.2 8B that analyze game states, 
              calculate optimal stakes using Kelly Criterion, and negotiate with sophisticated reasoning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="glass rounded-xl p-6">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold mb-2">Strategic Analysis</h3>
                <p className="text-sm text-white/70">
                  Llama 3.2 8B analyzes game positions, opponent patterns, and strategic opportunities 
                  with human-like reasoning.
                </p>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-lg font-bold mb-2">Intelligent Staking</h3>
                <p className="text-sm text-white/70">
                  AI calculates optimal stake amounts using Kelly Criterion, risk assessment, 
                  and personality-based adjustments.
                </p>
              </div>

              <div className="glass rounded-xl p-6">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-lg font-bold mb-2">Natural Negotiation</h3>
                <p className="text-sm text-white/70">
                  Agents negotiate with natural language reasoning, counter-offers, 
                  and strategic decision making.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel - AI Controls */}
            <div className="lg:col-span-1">
              <EnhancedAINegotiationPanel />
            </div>

            {/* Center Panel - Game Board */}
            <div className="lg:col-span-1">
              <div className="glass rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6 text-center">
                  🎮 AI vs Human Gameplay
                </h3>
                
                <Board
                  board={gameState.board}
                  onCellClick={handleCellClick}
                  currentPlayer={gameState.currentPlayer}
                  disabled={gameState.gamePhase !== 'playing'}
                />

                <div className="mt-6 text-center">
                  <div className="text-sm text-white/70 mb-2">Game Phase:</div>
                  <div className="text-lg font-semibold capitalize text-blue-400">
                    {gameState.gamePhase}
                  </div>
                  
                  {gameState.stakes.agreed && (
                    <div className="mt-4 bg-green-500/20 rounded-lg p-4">
                      <div className="text-lg font-bold text-green-400">
                        Stakes: ${gameState.stakes.amount}
                      </div>
                      <div className="text-sm text-white/70">
                        AI negotiated and agreed!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Technical Info */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Model Info */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🤖 Llama 3.2 8B Model
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Model Size:</span>
                    <span>8 billion parameters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Context Length:</span>
                    <span>128K tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Inference Speed:</span>
                    <span>~50 tokens/sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Memory Usage:</span>
                    <span>~8GB RAM</span>
                  </div>
                </div>

                <div className="mt-4 bg-blue-500/20 rounded-lg p-4">
                  <div className="font-semibold text-blue-300 mb-2">
                    Perfect for Gaming AI:
                  </div>
                  <ul className="text-xs text-blue-200 space-y-1">
                    <li>• Excellent strategic reasoning</li>
                    <li>• Fast decision making</li>
                    <li>• Strong numerical analysis</li>
                    <li>• Natural language negotiation</li>
                    <li>• Local inference (privacy)</li>
                  </ul>
                </div>
              </div>

              {/* Technical Features */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">⚡ Technical Features</h3>
                <div className="space-y-4 text-sm">
                  
                  <div>
                    <div className="font-semibold text-purple-300 mb-1">🧠 AI Capabilities:</div>
                    <ul className="text-white/70 space-y-1">
                      <li>• Game state analysis</li>
                      <li>• Probability calculations</li>
                      <li>• Risk assessment</li>
                      <li>• Strategic planning</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-semibold text-green-300 mb-1">💰 Financial Features:</div>
                    <ul className="text-white/70 space-y-1">
                      <li>• Kelly Criterion optimization</li>
                      <li>• Bankroll management</li>
                      <li>• Risk-adjusted staking</li>
                      <li>• Personality-based trading</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-semibold text-blue-300 mb-1">🔗 Blockchain Integration:</div>
                    <ul className="text-white/70 space-y-1">
                      <li>• PYUSD token staking</li>
                      <li>• Hedera network integration</li>
                      <li>• Smart contract automation</li>
                      <li>• Automatic payouts</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">📊 AI Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Analysis Speed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-14 h-full bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">Fast</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Negotiation Quality</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-15 h-full bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">Excellent</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/70">Strategic Depth</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="w-14 h-full bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-sm">Advanced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-white/60 mb-2">
              🚀 Built for ETHOnline 2024 | PYUSD × ASI × Hedera × Ollama
            </p>
            <p className="text-xs text-white/40">
              Powered by Llama 3.2 8B - The perfect AI model for strategic gaming and financial analysis
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}