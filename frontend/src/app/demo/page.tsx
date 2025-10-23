/**
 * Streamlined Demo Page - Optimized for Live Demo Recording
 * Fast loading, clear flow, minimal complexity
 */

'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function StreamlinedDemo() {
  const [currentStep, setCurrentStep] = useState(1)
  const [demoStarted, setDemoStarted] = useState(false)

  const startDemo = () => {
    setDemoStarted(true)
    setCurrentStep(1)
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const resetDemo = () => {
    setDemoStarted(false)
    setCurrentStep(1)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-white hover:text-purple-200 transition-colors">
            <span className="text-4xl">🎮</span>
            <h1 className="text-3xl font-bold">QuadraX Demo</h1>
          </Link>
          <ConnectButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!demoStarted ? (
          /* Demo Introduction */
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-6">
              🚀 Live Demo Experience
            </h2>
            
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
              See how QuadraX combines AI negotiation, PYUSD staking, 
              and strategic gameplay in one seamless experience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-semibold text-white mb-2">AI Chat</h3>
                <p className="text-gray-300 text-sm">Negotiate stakes with intelligent agents</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="font-semibold text-white mb-2">PYUSD Staking</h3>
                <p className="text-gray-300 text-sm">Lock real stakes in smart contracts</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="font-semibold text-white mb-2">Strategic Game</h3>
                <p className="text-gray-300 text-sm">4x4 enhanced tic-tac-toe gameplay</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="font-semibold text-white mb-2">Auto Payout</h3>
                <p className="text-gray-300 text-sm">Winner gets pot automatically</p>
              </div>
            </div>

            <button
              onClick={startDemo}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-4 rounded-lg font-bold text-xl transition-all duration-200 transform hover:scale-105"
            >
              🚀 Start Live Demo
            </button>
          </div>
        ) : (
          /* Demo Steps */
          <div className="max-w-6xl mx-auto">
            {/* Progress Bar */}
            <div className="bg-white/10 rounded-full p-1 mb-8">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Panel - Current Step */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
                  {currentStep === 1 && (
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <span>🤖</span> Step 1: AI Negotiation
                      </h3>
                      
                      <div className="bg-black/30 rounded-lg p-6 mb-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">AI</div>
                            <div className="bg-blue-500/20 rounded-lg p-3 flex-1">
                              <p className="text-white">Hello! I'm ready for a QuadraX match. What stake would you like to play for?</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">YOU</div>
                            <div className="bg-green-500/20 rounded-lg p-3 flex-1">
                              <p className="text-white">Let's play for 5 PYUSD</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">AI</div>
                            <div className="bg-blue-500/20 rounded-lg p-3 flex-1">
                              <p className="text-white">Perfect! 5 PYUSD is a great stake. I agree to these terms. Ready to lock in the stakes?</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30 mb-6">
                        <h4 className="font-semibold text-green-300 mb-2">✅ Negotiation Complete</h4>
                        <p className="text-green-200">Stakes agreed: 5 PYUSD each player</p>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <span>�</span> Step 2: PYUSD Staking
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="bg-black/30 rounded-lg p-6">
                          <h4 className="text-xl font-semibold text-white mb-4">Smart Contract Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Your Stake:</span>
                              <div className="text-2xl font-bold text-green-400">5.00 PYUSD</div>
                            </div>
                            <div>
                              <span className="text-gray-400">AI Stake:</span>
                              <div className="text-2xl font-bold text-blue-400">5.00 PYUSD</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Total Pot:</span>
                              <div className="text-2xl font-bold text-yellow-400">10.00 PYUSD</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Platform Fee:</span>
                              <div className="text-2xl font-bold text-purple-400">0.025 PYUSD</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                          <h4 className="font-semibold text-green-300 mb-2">✅ Stakes Locked</h4>
                          <p className="text-green-200">Smart contract deployed, funds secured</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <span>🎮</span> Step 3: Strategic Gameplay
                      </h3>
                      
                      <div className="bg-black/30 rounded-lg p-6 mb-6">
                        <h4 className="text-xl font-semibold text-white mb-4">QuadraX Board (4x4)</h4>
                        
                        {/* Simple demo board */}
                        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto mb-4">
                          {[
                            'X', 'O', '', '',
                            'O', 'X', 'X', '',
                            '', 'X', 'O', '',
                            '', '', 'O', 'X'
                          ].map((cell, i) => (
                            <div 
                              key={i}
                              className="aspect-square bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-2xl font-bold"
                            >
                              <span className={cell === 'X' ? 'text-green-400' : 'text-blue-400'}>
                                {cell}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-center space-y-2">
                          <p className="text-green-400 font-semibold">🎯 Goal: Get 4 in a row or 2x2 square</p>
                          <p className="text-gray-300">Turn: Player (X)</p>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
                        <h4 className="font-semibold text-yellow-300 mb-2">⚡ Game in Progress</h4>
                        <p className="text-yellow-200">Strategic moves being made...</p>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                        <span>🏆</span> Step 4: Winner & Payout
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-8 text-center border border-green-500/30">
                          <div className="text-6xl mb-4">🏆</div>
                          <h4 className="text-3xl font-bold text-green-300 mb-2">You Win!</h4>
                          <p className="text-green-200 mb-4">Completed winning pattern: 2x2 square</p>
                          
                          <div className="bg-black/30 rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-400 mb-2">Payout: 9.975 PYUSD</div>
                            <p className="text-gray-300 text-sm">Total pot (10.00) - Platform fee (0.025)</p>
                          </div>
                        </div>
                        
                        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                          <h4 className="font-semibold text-green-300 mb-2">✅ Auto Payout Complete</h4>
                          <p className="text-green-200">PYUSD transferred to your wallet automatically</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={resetDemo}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      🔄 Reset Demo
                    </button>
                    
                    {currentStep < 4 ? (
                      <button
                        onClick={nextStep}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                      >
                        Next Step →
                      </button>
                    ) : (
                      <Link
                        href="/game"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all inline-block"
                      >
                        🚀 Play Real Game
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Demo Info */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">📋 Demo Progress</h4>
                  
                  <div className="space-y-3">
                    {[
                      { step: 1, title: "AI Negotiation", icon: "🤖" },
                      { step: 2, title: "PYUSD Staking", icon: "💰" },
                      { step: 3, title: "Strategic Game", icon: "🎮" },
                      { step: 4, title: "Winner Payout", icon: "🏆" }
                    ].map((item) => (
                      <div 
                        key={item.step}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          currentStep >= item.step 
                            ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                            : currentStep + 1 === item.step
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                            : 'bg-white/5 border-white/10 text-gray-400'
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium">{item.title}</span>
                        {currentStep >= item.step && <span className="ml-auto text-green-400">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-4">🎯 Key Features</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      Real PYUSD stakes (1-10 range)
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      AI-powered negotiation
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      Smart contract security
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      Automatic payouts
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span>
                      Only 0.25% platform fee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
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
            🚀 Built for ETHOnline 2025 | PYUSD × ASI × Hedera | Intelligent AI Staking System
          </p>
        </div>
      </footer>
    </div>
  )
}