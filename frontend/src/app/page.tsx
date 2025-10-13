'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'
import { WalletConnectSetupNotice } from '@/components/WalletConnectSetupNotice'
import { WalletConnectProjectIdNotice } from '@/components/WalletConnectProjectIdNotice'
import { StakingPanel } from '@/features/staking'
import ErrorBoundary from '@/components/ErrorBoundary'
import AIChat from '@/features/game/AIChat'
import { Board } from '@/features/game'
import Link from 'next/link'

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'game' | 'staking' | 'agents'>('game')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <div className="text-6xl mb-4 emoji animate-pulse">🎮</div>
          <h2 className="text-title2 text-primary">Loading QuadraX...</h2>
          <p className="text-body text-secondary mt-2">Preparing your gaming experience</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <WalletConnectSetupNotice />
      <main className="min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1">
          {/* Apple-Style Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="text-6xl emoji">🎮</div>
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce emoji">⚡</div>
              </div>
              <h1 className="text-largetitle font-bold text-primary tracking-tight">
                QuadraX
              </h1>
            </div>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a 
                href="/game" 
                className="btn btn-primary flex items-center gap-2"
              >
                <span className="emoji">🎮</span> Play Game
              </a>
              <a 
                href="/demo" 
                className="btn btn-secondary flex items-center gap-2"
              >
                <span className="emoji">🚀</span> Complete Demo
              </a>
              <a 
                href="/ollama" 
                className="btn btn-success flex items-center gap-2"
              >
                <span className="emoji">🧠</span> Ollama + Llama 3.2 8B
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="badge badge-success">
                <span className="emoji">🏆</span> $10k PYUSD
              </div>
              <div className="badge badge-secondary">
                <span className="emoji">🤖</span> $4k Hedera
              </div>
            </div>

            <p className="text-title3 text-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
              Experience the future of strategic gaming with AI-powered assistance, 
              real PYUSD rewards, and revolutionary Agent-to-Agent protocol on Hedera's dual-chain architecture.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="material-regular p-6 text-center group hover:scale-105 transition-transform duration-300">
                <span className="text-4xl emoji">🎮</span>
                <h3 className="text-headline text-primary mt-4 mb-2">Strategic Gaming</h3>
                <p className="text-callout text-secondary">4x4 enhanced Tic-Tac-Toe with real stakes</p>
              </div>
              
              <div className="material-regular p-6 text-center group hover:scale-105 transition-transform duration-300">
                <span className="text-4xl emoji">🤖</span>
                <h3 className="text-headline text-primary mt-4 mb-2">AI Assistance</h3>
                <p className="text-callout text-secondary">Hedera Agent Kit with A2A protocol</p>
              </div>
              
              <div className="material-regular p-6 text-center group hover:scale-105 transition-transform duration-300">
                <span className="text-4xl emoji">💰</span>
                <h3 className="text-headline text-primary mt-4 mb-2">Real Rewards</h3>
                <p className="text-callout text-secondary">Win actual PYUSD on dual-chain network</p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="badge badge-tinted">
                <span className="emoji">💰</span> Real PYUSD Rewards
              </div>
              <div className="badge badge-tinted">
                <span className="emoji">🤖</span> Hedera A2A Protocol
              </div>
              <div className="badge badge-tinted">
                <span className="emoji">⚡</span> Dual-Chain Power
              </div>
            </div>
          </div>

          {/* Apple-Style Segmented Control */}
          <div className="max-w-md mx-auto mb-8">
            <div className="segmented-control">
              <button 
                onClick={() => setActiveTab('game')}
                className={`btn ${
                  activeTab === 'game' 
                    ? 'btn-primary' 
                    : 'btn-tinted'
                }`}
              >
                <span className="emoji">🎮</span> Game
              </button>
              <button 
                onClick={() => setActiveTab('staking')}
                className={`btn ${
                  activeTab === 'staking' 
                    ? 'btn-success' 
                    : 'btn-tinted'
                }`}
              >
                <span className="emoji">💰</span> Staking
              </button>
              <button 
                onClick={() => setActiveTab('agents')}
                className={`btn ${
                  activeTab === 'agents' 
                    ? 'btn-secondary' 
                    : 'btn-tinted'
                }`}
              >
                <span className="emoji">🤖</span> AI Agents
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {/* Apple-Style Game Tab */}
            {activeTab === 'game' && (
              <div className="space-y-6">
                <div className="card text-center">
                  <h3 className="text-title1 text-primary mb-6">
                    <span className="emoji">⚡</span> Strategic 4x4 Battleground
                  </h3>
                  <div className="flex justify-center">
                    <div className="card card-compact max-w-md w-full">
                      <div className="text-center mb-6">
                        <div className="text-6xl mb-4 emoji">🎮</div>
                        <h4 className="text-title3 text-primary mb-2">AI-Powered QuadraX</h4>
                        <p className="text-body text-secondary mb-6">Negotiate stakes with AI • 4×4 strategic gameplay • Real PYUSD rewards</p>
                        
                        <div className="material-ultrathin p-4 mb-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-footnote text-tertiary">Stake Range</div>
                              <div className="text-headline text-blue font-mono">1-10 PYUSD</div>
                            </div>
                            <div className="text-center">
                              <div className="text-footnote text-tertiary">Winner Takes</div>
                              <div className="text-headline text-green font-mono">~99.75% of pot</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <div className="space-y-3">
                          <Link href="/game" className="btn btn-primary w-full block text-center">
                            <span className="emoji">🚀</span> Launch Game - Negotiate Stakes with AI
                          </Link>
                          <p className="text-caption1 text-tertiary text-center">Chat with AI to negotiate stakes or try demo mode</p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-center">
                          <div className="badge badge-danger mx-auto"><span className="emoji">⚠️</span> Wallet Required</div>
                          <ConnectButton />
                          <p className="text-caption1 text-tertiary">Connect to access gaming features</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3 emoji">🎯</span>
                      <h4 className="text-title3 text-blue">How to Play</h4>
                    </div>
                    <ul className="text-secondary space-y-3 text-body">
                      <li className="flex items-start">
                        <span className="text-blue mr-2">1️⃣</span>
                        <strong>Negotiate:</strong> Chat with AI to agree on stakes (1-10 PYUSD) or say "demo"
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue mr-2">2️⃣</span>
                        <strong>Stake:</strong> Confirm and lock PYUSD in smart contract
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue mr-2">3️⃣</span>
                        <strong>Play:</strong> 4x4 grid - get 4 in a row or 2×2 square to win
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue mr-2">🏆</span>
                        <strong>Win:</strong> Get pot minus 0.25% platform fee
                      </li>
                    </ul>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3 emoji">🤖</span>
                      <h4 className="text-title3 text-purple">AI-Powered Stakes</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 material-regular rounded-lg">
                        <span className="text-secondary">Stake Range:</span>
                        <span className="text-blue font-mono text-headline">1-10 PYUSD</span>
                      </div>
                      <div className="flex justify-between items-center p-3 material-regular rounded-lg">
                        <span className="text-secondary">AI Negotiation:</span>
                        <span className="text-purple font-mono text-body">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between items-center p-3 material-regular rounded-lg">
                        <span className="text-secondary">Platform Fee:</span>
                        <span className="text-green font-mono text-headline">0.25%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Staking Tab */}
            {activeTab === 'staking' && (
              <div className="max-w-2xl mx-auto">
                <ErrorBoundary>
                  <StakingPanel 
                    onStakeComplete={(amount) => {
                      console.log('🎯 Staked:', amount, 'PYUSD')
                    }}
                  />
                </ErrorBoundary>
              </div>
            )}

            {/* Agents Tab */}
            {activeTab === 'agents' && (
              <div className="max-w-4xl mx-auto">
                <ErrorBoundary>
                  <AIChat 
                    aiName="Hedera Agent Kit A2A Demo"
                    enabled={true}
                    gameId="hackathon-demo-2024"
                  />
                </ErrorBoundary>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="card card-compact text-center">
              <div className="text-4xl mb-3 emoji">💎</div>
              <div className="text-footnote text-tertiary mb-1">Prize Pool</div>
              <div className="text-title3 text-green">$14,000+</div>
            </div>
            
            <div className="card card-compact text-center">
              <div className="text-4xl mb-3 emoji">⚡</div>
              <div className="text-footnote text-tertiary mb-1">Architecture</div>
              <div className="text-title3 text-blue">Dual-Chain</div>
            </div>
            
            <div className="card card-compact text-center">
              <div className="text-4xl mb-3 emoji">🤖</div>
              <div className="text-footnote text-tertiary mb-1">AI System</div>
              <div className="text-title3 text-purple">A2A Protocol</div>
            </div>
            
            <div className="card card-compact text-center">
              <div className="text-4xl mb-3 emoji">💰</div>
              <div className="text-footnote text-tertiary mb-1">Currency</div>
              <div className="text-title3 text-green">PYUSD</div>
            </div>
          </div>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className="glass border-t border-white/20 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-white/60">
            <span className="emoji">🏆</span> Hackathon 2024
            <span>•</span>
            <span className="emoji">💰</span> PYUSD Integration
            <span>•</span>
            <span className="emoji">🤖</span> Hedera A2A Protocol
            <span>•</span>
            <span className="emoji">⚡</span> $14k+ Prize Target
          </div>
        </div>
      </footer>
    </>
  )
}