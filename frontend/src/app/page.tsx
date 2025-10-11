'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'
import { WalletConnectSetupNotice } from '@/components/WalletConnectSetupNotice'

export default function Home() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                QuadraX
              </h1>
              <p className="text-white/80 mt-1">Agentic 4x4 Tic-Tac-Toe</p>
            </div>
            <div className="z-50 relative">
              <ConnectButton />
              {/* Debug info */}
              <div className="text-xs text-white/60 mt-1">
                {isConnected ? `Connected: ${address?.slice(0, 6)}...` : 'Not connected'} | Chain: {chainId}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* WalletConnect Setup Notice */}
          <WalletConnectSetupNotice />
          {/* Hero Section */}
          <div className="glass rounded-3xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Welcome to QuadraX
            </h2>
            <p className="text-lg text-white/90 text-center mb-8">
              Blockchain-powered 4x4 Tic-Tac-Toe with AI agents and PYUSD staking
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass rounded-xl p-6 btn-hover">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="text-xl font-semibold mb-2">Strategic 4x4 Gameplay</h3>
                <p className="text-white/80 text-sm">
                  Enhanced complexity with a larger board for more strategic depth
                </p>
              </div>

              <div className="glass rounded-xl p-6 btn-hover">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI Agent Opponents</h3>
                <p className="text-white/80 text-sm">
                  Play against intelligent AI that predicts and negotiates
                </p>
              </div>

              <div className="glass rounded-xl p-6 btn-hover">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-xl font-semibold mb-2">PYUSD Staking</h3>
                <p className="text-white/80 text-sm">
                  Stake real PYUSD tokens and win the pot automatically
                </p>
              </div>

              <div className="glass rounded-xl p-6 btn-hover">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Hedera Speed</h3>
                <p className="text-white/80 text-sm">
                  Lightning-fast transactions with minimal fees
                </p>
              </div>
            </div>

            {/* Status & Wallet Connection */}
            <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-6 text-center">
              <p className="text-lg font-semibold mb-2">
                {isConnected ? '🎮 Ready to Play!' : '✨ Frontend Ready!'}
              </p>
              <p className="text-white/80 text-sm mb-4">
                {isConnected 
                  ? `Connected on chain ${chainId}. Ready for gaming!`
                  : 'Connect your wallet to start playing'
                }
              </p>
              <div className="flex justify-center mb-4">
                <ConnectButton />
              </div>
              {isConnected && (
                <div className="text-xs text-white/60">
                  Wallet: {address?.slice(0, 8)}...{address?.slice(-6)} | Network: {chainId === 296 ? 'Hedera Testnet' : `Chain ${chainId}`}
                </div>
              )}
            </div>
          </div>

          {/* Getting Started */}
          <div className="glass rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-6 text-center">How to Play</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Connect Wallet</h4>
                  <p className="text-white/80 text-sm">
                    Link your MetaMask or compatible Web3 wallet
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Get PYUSD</h4>
                  <p className="text-white/80 text-sm">
                    Claim test PYUSD tokens from the faucet
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Stake & Play</h4>
                  <p className="text-white/80 text-sm">
                    Choose your opponent, stake PYUSD, and start playing
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Win Prizes</h4>
                  <p className="text-white/80 text-sm">
                    Winner automatically receives the pot on-chain
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-white/20">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-white/80">
            Built for ETHOnline 2024 | PYUSD × ASI × Hedera
          </p>
        </div>
      </footer>
    </div>
  )
}
