'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'

export default function Home() {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">QuadraX</h1>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-7xl md:text-8xl font-semibold tracking-tight text-white mb-8 leading-none">
              Strategy meets
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                intelligent play
              </span>
            </h2>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up animation-delay-200">
            Powered by <span className="text-white font-medium">ASI Alliance</span> AI agents, <span className="text-white font-medium">Hedera Agent Kit</span>, and <span className="text-white font-medium">PYUSD</span> staking
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            {mounted && isConnected ? (
              <>
                <Link 
                  href="/game"
                  className="group bg-white text-black px-8 py-3.5 rounded-full font-medium text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Play now 
                </Link>
                
                <Link 
                  href="/demo"
                  className="group text-white px-8 py-3.5 rounded-full font-medium text-lg border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
                >
                  Try demo
                </Link>
              </>
            ) : (
              <div className="text-gray-400 text-sm">
                Connect wallet to start playing
              </div>
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
              <div className="text-5xl mb-4">🔷</div>
              <h4 className="text-lg font-semibold text-white mb-2">Hedera Agent Kit</h4>
              <p className="text-sm text-gray-400">Instant agent-to-agent transactions with sub-second finality</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">🧠</div>
              <h4 className="text-lg font-semibold text-white mb-2">ASI Alliance</h4>
              <p className="text-sm text-gray-400">Superintelligent AI agents from Fetch.ai, SingularityNET & Ocean</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-5xl mb-4">💵</div>
              <h4 className="text-lg font-semibold text-white mb-2">PYUSD Stablecoin</h4>
              <p className="text-sm text-gray-400">Stake PayPal USD for transparent, on-chain competitive gaming</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">10K+</span>
              </div>
              <div className="text-sm text-gray-500">Games Played</div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">&lt;3s</span>
              </div>
              <div className="text-sm text-gray-500">Avg Response</div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">24/7</span>
              </div>
              <div className="text-sm text-gray-500">AI Available</div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-3xl md:text-4xl font-semibold text-white mb-2">
                <span className="bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">100%</span>
              </div>
              <div className="text-sm text-gray-500">On-Chain</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500">Strategic gaming powered by Hedera Agent Kit • ASI Alliance • PYUSD</p>
        </div>
      </footer>
    </main>
  )
}
