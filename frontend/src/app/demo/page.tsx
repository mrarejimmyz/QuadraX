/**
 * Complete Intelligent Staking Demo Component
 * Shows the full flow: AI negotiation → PYUSD staking → TicTacToe game → Winner payout
 */

'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useGameWithIntelligentStaking } from '@/features/game/CompleteGameIntegration'
import { Board, GameInfo } from '@/features/game'
import Link from 'next/link'

export default function CompleteStakingDemo() {
  const {
    gameState,
    negotiationLog,
    negotiationInProgress,
    agents,
    hederaAgents,
    startCompleteNegotiation,
    executeStaking,
    makeMove,
    resetGame,
    messages
  } = useGameWithIntelligentStaking()

  const [showNegotiationLog, setShowNegotiationLog] = useState(false)

  const renderPhaseContent = () => {
    switch (gameState.phase) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🚀 Intelligent Staking System Demo
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🤖 AI Agents Ready:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {agents.slice(0, 2).map((agent, i) => (
                      <div key={i} className="bg-black/30 rounded-lg p-3">
                        <div className="font-semibold text-blue-400">{agent.name}</div>
                        <div className="text-white/70">Style: {agent.personality.primary}</div>
                        <div className="text-white/70">Bankroll: ${agent.bankroll}</div>
                        <div className="text-white/70">Risk Tolerance: {Math.round(agent.personality.riskTolerance * 100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🎯 Complete Flow:</h3>
                  <ol className="text-sm space-y-1 text-white/80">
                    <li>1. 🔮 AI agents predict game outcomes using expertise ratings</li>
                    <li>2. 💰 Calculate optimal stakes using Kelly Criterion + personality</li>
                    <li>3. 🤝 Multi-round negotiation with counter-offers until agreement</li>
                    <li>4. 💸 Stake PYUSD tokens in smart contract (Hedera network)</li>
                    <li>5. 🎮 Play TicTacToe with locked stakes</li>
                    <li>6. 🏆 Winner automatically receives full pot via smart contract</li>
                  </ol>
                </div>

                <button
                  onClick={startCompleteNegotiation}
                  disabled={negotiationInProgress || agents.length < 2}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-blue-600
                           font-bold text-lg btn-hover disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-3"
                >
                  {negotiationInProgress ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
                      AI Negotiation in Progress...
                    </>
                  ) : (
                    <>
                      🤖 Start Intelligent Stake Negotiation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )

      case 'negotiating':
        return (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🧠 AI Negotiation in Progress
              </h2>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="animate-pulse w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-semibold">Agents calculating optimal stakes...</span>
                  <div className="animate-pulse w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                
                <div className="text-center text-sm text-white/70">
                  Using Kelly Criterion, personality risk profiles, and multi-round negotiation
                </div>
              </div>
            </div>
          </div>
        )

      case 'staking':
        return (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                💰 Stake Agreement Reached!
              </h2>
              
              {gameState.stakes.amount && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-400 mb-2">
                      ${gameState.stakes.amount}
                    </div>
                    <div className="text-lg text-white/80">Agreed stake per player</div>
                    <div className="text-sm text-white/60">
                      Total pot: ${gameState.stakes.amount * 2}
                    </div>
                  </div>

                  <div className="bg-green-500/20 rounded-lg p-4">
                    <div className="text-sm font-semibold mb-2">✅ Ready for PYUSD Staking</div>
                    <div className="text-xs text-white/70">
                      Stakes will be locked in smart contract on Hedera network. 
                      Winner takes the full pot automatically upon game completion.
                    </div>
                  </div>

                  <button
                    onClick={executeStaking}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-500 to-blue-600
                             font-bold text-lg btn-hover flex items-center justify-center gap-3"
                  >
                    💸 Confirm PYUSD Stake & Start Game
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case 'playing':
        return (
          <div className="space-y-6">
            <GameInfo
              currentPlayer={gameState.currentPlayer}
              player1Address={gameState.players.player1}
              player2Address={gameState.players.player2}
              pot={(gameState.stakes.amount! * 2).toString()}
              gameStatus="playing"
            />
            
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-center">
                🎮 TicTacToe - Stakes Locked: ${gameState.stakes.amount! * 2}
              </h3>
              
              <Board
                board={gameState.board}
                onCellClick={makeMove}
                currentPlayer={gameState.currentPlayer}
                disabled={false}
              />
            </div>
          </div>
        )

      case 'finished':
        return (
          <div className="space-y-6">
            <div className="glass rounded-xl p-6 text-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                🏆 Game Complete!
              </h2>
              
              <div className="space-y-4">
                <div className="text-xl text-green-400 font-bold">
                  Player {gameState.winner} Wins!
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-4">
                  <div className="text-lg font-semibold mb-2">
                    💰 Winner receives: ${gameState.stakes.amount! * 2}
                  </div>
                  <div className="text-sm text-white/70">
                    PYUSD payout automatically executed via smart contract
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600
                           font-semibold btn-hover"
                >
                  🔄 Start New Negotiation
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl font-bold">QuadraX</span>
              <span className="text-sm text-white/60">Intelligent Staking Demo</span>
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Game Area */}
            <div className="lg:col-span-2">
              {renderPhaseContent()}
            </div>

            {/* Negotiation Log & AI Chat */}
            <div className="space-y-6">
              
              {/* Negotiation Log */}
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">📋 Process Log</h3>
                  <button
                    onClick={() => setShowNegotiationLog(!showNegotiationLog)}
                    className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-all"
                  >
                    {showNegotiationLog ? 'Hide' : 'Show'}
                  </button>
                </div>

                {(showNegotiationLog || negotiationLog.length > 0) && (
                  <div className="bg-black/30 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {negotiationLog.length > 0 ? (
                      negotiationLog.map((log, i) => (
                        <div key={i} className="text-sm text-white/80 py-1 border-l-2 border-blue-500/30 pl-3 mb-2">
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-white/50 text-center py-4">
                        No negotiation activity yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Game Stats */}
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">📊 Game Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Game ID:</span>
                    <span className="font-mono">#{gameState.gameId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Phase:</span>
                    <span className="capitalize text-blue-400">{gameState.phase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">AI Agents:</span>
                    <span>{agents.length} ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Hedera A2A:</span>
                    <span>{hederaAgents.length} connected</span>
                  </div>
                  {gameState.stakes.amount && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Stake Amount:</span>
                      <span className="font-semibold text-green-400">${gameState.stakes.amount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-sm text-white/60">
            🚀 Built for ETHOnline 2024 | PYUSD × ASI × Hedera | Intelligent AI Staking System
          </p>
        </div>
      </footer>
    </div>
  )
}