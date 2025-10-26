'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { WalletBalance } from '@/components/WalletBalance'

export default function Home() {
  const { isConnected, address } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [showRules, setShowRules] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug wallet connection
  useEffect(() => {
    console.log('🔍 Wallet Debug:', { isConnected, address, mounted })
  }, [isConnected, address, mounted])

  return (
    <main className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* 4x4 Logo Grid */}
              <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                <div className="bg-blue-400 rounded-sm"></div>
                <div className="bg-purple-400 rounded-sm"></div>
                <div className="bg-purple-400 rounded-sm"></div>
                <div className="bg-pink-400 rounded-sm"></div>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">QuadraX</h1>
            </div>
            <div className="flex items-center gap-4">
              {mounted && <WalletBalance />}
              <ConnectButton showBalance={false} />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            {/* 4x4 Grid Icon */}
            <div className="inline-flex gap-1 mb-6 opacity-50">
              {[...Array(4)].map((_, row) => (
                <div key={row} className="flex flex-col gap-1">
                  {[...Array(4)].map((_, col) => (
                    <div
                      key={col}
                      className="w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-400 rounded-sm"
                      style={{
                        animationDelay: `${(row + col) * 100}ms`,
                        animation: 'pulse 2s ease-in-out infinite'
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            <h2 className="text-7xl md:text-8xl font-semibold tracking-tight text-white mb-8 leading-none">
              4x4 Tic-Tac-Toe
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                with AI negotiation
              </span>
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-6 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-200">
            Negotiate stakes with AI agents, lock PYUSD in smart contracts, then compete in strategic 4x4 gameplay
          </p>
          
          <p className="text-base text-gray-500 mb-12 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
            Powered by <span className="text-white font-medium">ASI Alliance</span> AI agents • <span className="text-white font-medium">Hedera Agent Kit</span> • <span className="text-white font-medium">PYUSD</span> staking
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            {mounted && isConnected ? (
              <>
                <Link 
                  href="/negotiate"
                  className="group bg-white text-black px-8 py-3.5 rounded-full font-medium text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  💬 Negotiate & Stake →
                </Link>
                
                <Link 
                  href="/demo"
                  className="group text-white px-8 py-3.5 rounded-full font-medium text-lg border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
                >
                  Play Demo (No Stakes)
                </Link>
                
                <button
                  onClick={() => setShowRules(true)}
                  className="group text-gray-400 px-8 py-3.5 rounded-full font-medium text-lg border border-gray-600/20 hover:border-gray-400/40 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  📖 Rules
                </button>
              </>
            ) : (
              <>
                <div className="text-gray-400 text-sm">
                  Connect wallet to start playing
                </div>
                <button
                  onClick={() => setShowRules(true)}
                  className="group text-gray-400 px-8 py-3.5 rounded-full font-medium text-lg border border-gray-600/20 hover:border-gray-400/40 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  📖 Rules
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-center text-2xl font-semibold text-white mb-12">Powered by cutting-edge technology</h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                {/* Hedera H logo */}
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">H</span>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Hedera Agent Kit</h4>
              <p className="text-sm text-gray-400">Instant agent-to-agent transactions with sub-second finality</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                {/* ASI Alliance logo - center dot with 3 connected circles on each side */}
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Center dot (isolated) */}
                    <circle cx="20" cy="20" r="2.5" fill="white"/>
                    
                    {/* Left group - 3 connected circles */}
                    <circle cx="8" cy="20" r="2.5" fill="white"/>
                    <circle cx="11" cy="14" r="2.5" fill="white"/>
                    <circle cx="11" cy="26" r="2.5" fill="white"/>
                    <line x1="8" y1="20" x2="11" y2="14" stroke="white" strokeWidth="1.5"/>
                    <line x1="8" y1="20" x2="11" y2="26" stroke="white" strokeWidth="1.5"/>
                    
                    {/* Right group - 3 connected circles */}
                    <circle cx="32" cy="20" r="2.5" fill="white"/>
                    <circle cx="29" cy="14" r="2.5" fill="white"/>
                    <circle cx="29" cy="26" r="2.5" fill="white"/>
                    <line x1="32" y1="20" x2="29" y2="14" stroke="white" strokeWidth="1.5"/>
                    <line x1="32" y1="20" x2="29" y2="26" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">ASI Alliance</h4>
              <p className="text-sm text-gray-400">Superintelligent AI agents from Fetch.ai, SingularityNET & Ocean</p>
            </div>
            
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-4">
                {/* PayPal USD logo - clean double P */}
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-8 h-9" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background P (lighter, offset) */}
                    <path d="M2 0 L2 28 L5.5 28 L5.5 16 L10.5 16 C14.5 16 17 13.2 17 9.5 C17 5.8 14.5 3 10.5 3 L5.5 3 L5.5 13 L10.5 13 C12.2 13 13.5 11.8 13.5 9.5 C13.5 7.2 12.2 6 10.5 6 L5.5 6 L5.5 0 L2 0 Z" 
                          fill="white" opacity="0.4"/>
                    {/* Front P (main, offset right) */}
                    <path d="M5 2 L5 26 L8.5 26 L8.5 14 L13.5 14 C17.5 14 20 11.2 20 7.5 C20 3.8 17.5 1 13.5 1 L8.5 1 L8.5 11 L13.5 11 C15.2 11 16.5 9.8 16.5 7.5 C16.5 5.2 15.2 4 13.5 4 L8.5 4 L8.5 2 L5 2 Z" 
                          fill="white"/>
                  </svg>
                </div>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">PayPal USD</h4>
              <p className="text-sm text-gray-400">Dollar-backed stablecoin on Ethereum by PayPal & Paxos</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mt-12">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">100%</span>
              </div>
              <div className="text-sm text-gray-500">On-Chain Logic</div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">2</span>
              </div>
              <div className="text-sm text-gray-500">Win Conditions</div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">0</span>
              </div>
              <div className="text-sm text-gray-500">Ties Possible</div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">⚡</span>
              </div>
              <div className="text-sm text-gray-500">Instant Payouts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Modal */}
      {showRules && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowRules(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-white">Game Rules</h2>
              <button 
                onClick={() => setShowRules(false)}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Overview */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 mb-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                Place <span className="text-white font-semibold">4 pieces</span> turn-by-turn on the 4x4 grid, 
                then <span className="text-white font-semibold">slide them anywhere</span> to create winning formations
              </p>
            </div>

            {/* Key Differences */}
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Key Differences vs. Classic Tic-Tac-Toe
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 text-gray-300">
                <span className="text-2xl">🟦</span>
                <div>
                  <p><span className="text-white font-medium">4x4 grid</span> (vs. 3x3) with only <span className="text-white font-medium">4 pieces per player</span></p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="text-2xl">🔄</span>
                <div>
                  <p><span className="text-white font-medium">Two phases:</span> Place → then move anywhere</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-white font-medium mb-2">Win via:</p>
                  <div className="space-y-2 ml-4">
                    <p>↔️ <span className="text-white">Horizontal line</span> (4-in-a-row)</p>
                    <p>↕️ <span className="text-white">Vertical line</span> (4-in-a-column)</p>
                    <p>↘️↙️ <span className="text-white">Diagonal line</span> (any direction)</p>
                    <p>◼️ <span className="text-white">2x2 square block</span> (anywhere)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-gray-300">
                <span className="text-2xl">🚫</span>
                <div>
                  <p><span className="text-white font-medium">No ties</span> – games always end with a winner</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowRules(false)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform duration-300"
              >
                Got it! Let's Play 🎮
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">Strategic gaming powered by Hedera Agent Kit • ASI Alliance • PYUSD</p>
        </div>
      </footer>
    </main>
  )
}
