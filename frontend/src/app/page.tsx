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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-white animate-pulse text-xl">Loading QuadraX Platform...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Apple-Style Header */}
      <header className="glass sticky top-0 z-50 border-b" style={{borderColor: 'var(--separator)'}}>
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-title2 font-black text-primary">
                ⚡ QuadraX
              </h1>
              <div className="hidden md:flex items-center gap-3">
                <div className="badge badge-success">
                  <span>🏆 $10k PYUSD</span>
                </div>
                <div className="badge badge-primary">
                  <span>🤖 $4k Hedera</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-callout text-green font-mono">Connected</span>
                </div>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Setup Notices (Hidden if not needed) */}
      <div className="container mx-auto px-4 pt-2">
        <WalletConnectProjectIdNotice />
        <WalletConnectSetupNotice />
      </div>

      {/* Main Dashboard */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Apple-Style Welcome Card */}
          {!isConnected && (
            <div className="card card-large text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-6">
                <span className="text-4xl">🎮</span>
                <h2 className="text-large-title text-primary">
                  Crypto Gaming Revolution
                </h2>
                <span className="text-4xl">🤖</span>
              </div>
              <p className="text-body text-secondary mb-8 max-w-2xl mx-auto">
                Experience the future of blockchain gaming with real <span className="text-green font-medium">PYUSD stakes</span> and <span className="text-blue font-medium">AI-powered strategy</span>
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="badge badge-success">
                  <span>💰 Real PYUSD Rewards</span>
                </div>
                <div className="badge badge-primary">
                  <span>🤖 Hedera A2A Protocol</span>
                </div>
                <div className="badge badge-warning">
                  <span>⚡ Dual-Chain Power</span>
                </div>
              </div>
              <button className="btn btn-primary">
                🚀 Connect & Win $14,000+
              </button>
            </div>
          )}

          {/* Apple-Style Segmented Control */}
          <div className="flex justify-center mb-8">
            <div className="material-regular p-1 flex gap-1 inline-flex">
              <button 
                onClick={() => setActiveTab('game')}
                className={`btn ${
                  activeTab === 'game' 
                    ? 'btn-primary' 
                    : 'btn-tinted'
                }`}
              >
                🎮 Game
              </button>
              <button 
                onClick={() => setActiveTab('staking')}
                className={`btn ${
                  activeTab === 'staking' 
                    ? 'btn-success' 
                    : 'btn-tinted'
                }`}
              >
                💰 Staking
              </button>
              <button 
                onClick={() => setActiveTab('agents')}
                className={`btn ${
                  activeTab === 'agents' 
                    ? 'btn-secondary' 
                    : 'btn-tinted'
                }`}
              >
                🤖 AI Agents
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
                    ⚡ Strategic 4x4 Battleground
                  </h3>
                  <div className="flex justify-center">
                    <div className="card card-compact max-w-md w-full">
                      <div className="text-center mb-6">
                        <div className="text-6xl mb-4">🎮</div>
                        <h4 className="text-title3 text-primary mb-2">Next-Gen Tic-Tac-Toe</h4>
                        <p className="text-body text-secondary mb-6">4x4 grid with enhanced strategic depth and real PYUSD stakes</p>
                        
                        <div className="material-ultrathin p-4 mb-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-footnote text-tertiary">Entry Stake</div>
                              <div className="text-headline text-green font-mono">10 PYUSD</div>
                            </div>
                            <div className="text-center">
                              <div className="text-footnote text-tertiary">Winner Takes</div>
                              <div className="text-headline text-orange font-mono">18 PYUSD</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isConnected ? (
                        <div className="space-y-3">
                          <button className="btn btn-primary w-full">
                            🚀 Launch Game (10 PYUSD)
                          </button>
                          <p className="text-caption1 text-tertiary text-center">Game starts when opponent joins</p>
                        </div>
                      ) : (
                        <div className="space-y-4 text-center">
                          <div className="badge badge-danger mx-auto">⚠️ Wallet Required</div>
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
                      <span className="text-2xl mr-3">🎯</span>
                      <h4 className="text-title3 text-blue">Game Rules</h4>
                    </div>
                    <ul className="text-secondary space-y-3 text-body">
                      <li className="flex items-start">
                        <span className="text-blue mr-2">•</span>
                        4x4 grid with enhanced strategic depth
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue mr-2">•</span>
                        Get 4 in a row (horizontal, vertical, or diagonal)
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue mr-2">•</span>
                        Stake PYUSD to join competitive matches
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue mr-2">•</span>
                        AI agents provide strategic assistance
                      </li>
                    </ul>
                  </div>
                  
                  <div className="card">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">💰</span>
                      <h4 className="text-title3 text-green">Prize Pool</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 material-regular rounded-lg">
                        <span className="text-secondary">Entry Stake:</span>
                        <span className="text-green font-mono text-headline">10 PYUSD</span>
                      </div>
                      <div className="flex justify-between items-center p-3 material-regular rounded-lg">
                        <span className="text-secondary">Winner Takes:</span>
                        <span className="text-green font-mono text-headline">18 PYUSD</span>
                      </div>
                      <div className="flex justify-between items-center p-3 material-regular rounded-lg">
                        <span className="text-secondary">Platform Fee:</span>
                        <span className="text-orange font-mono text-headline">2 PYUSD</span>
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
            <div className="glass rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">�</div>
              <div className="text-sm text-white/60">Prize Pool</div>
              <div className="font-bold text-green-400">$14,000+</div>
            </div>
            
            <div className="card card-compact text-center">
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-footnote text-tertiary mb-1">Architecture</div>
              <div className="text-title3 text-blue">Dual-Chain</div>
            </div>
            
            <div className="card card-compact text-center">
              <div className="text-4xl mb-3">🤖</div>
              <div className="text-footnote text-tertiary mb-1">AI System</div>
              <div className="text-title3 text-purple">A2A Protocol</div>
            </div>
            
            <div className="card card-compact text-center">
              <div className="text-4xl mb-3">💰</div>
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
            <span>🏆 Hackathon 2024</span>
            <span>•</span>
            <span>💰 PYUSD Integration</span>
            <span>•</span>
            <span>🤖 Hedera A2A Protocol</span>
            <span>•</span>
            <span>⚡ $14k+ Prize Target</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
