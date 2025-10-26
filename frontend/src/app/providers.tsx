'use client'

import '@/lib/utils/consoleFilter' // Suppress noisy extension messages
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base, zora, sepolia } from 'wagmi/chains'
import { defineChain } from 'viem'
import React, { ReactNode, useState, useEffect } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

// Define Hedera Testnet
export const hederaTestnet = defineChain({
  id: 296,
  name: 'Hedera Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.hashio.io/api'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'HashScan', 
      url: 'https://hashscan.io/testnet',
      apiUrl: 'https://testnet.mirrornode.hedera.com'
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 0,
    },
  },
  testnet: true,
})

// Define Hardhat Local Network
export const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
})

// Configure chains based on environment
const isDevelopment = process.env.NODE_ENV === 'development'

// Get WalletConnect project ID - MUST be real for production
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// Validate Project ID format
const isValidProjectId = projectId && projectId.length >= 32 && !projectId.includes('placeholder')

if (!isValidProjectId) {
  console.error('🚨 INVALID WalletConnect Project ID!')
  console.error('📋 Steps to fix:')
  console.error('   1. Go to https://cloud.walletconnect.com')
  console.error('   2. Create account and new project')
  console.error('   3. Copy Project ID to .env.local')
  console.error('   4. Restart dev server')
}

console.log('🔗 WalletConnect Status:', isValidProjectId ? 'Valid Project ID' : 'Invalid/Missing Project ID')

// Configure chains - Sepolia as primary testnet with PYUSD support
const chains = [
  sepolia, // Primary testnet - has official PYUSD contract
  hederaTestnet, // Secondary option
  ...(isDevelopment ? [hardhatLocal] : []),
  // Include popular chains for better wallet compatibility
  mainnet,
  polygon,
  arbitrum,
  base,
] as const

// Create wagmi config singleton to prevent re-initialization
let wagmiConfig: ReturnType<typeof getDefaultConfig> | undefined = undefined

function getWagmiConfig() {
  if (!wagmiConfig) {
    wagmiConfig = getDefaultConfig({
      appName: 'QuadraX - Agentic 4x4 Tic-Tac-Toe',
      projectId: projectId || 'da5fd500fc534848c0c6112afa93e5d1',
      chains,
      ssr: false, // Disable SSR to ensure proper browser wallet detection
    })
  }
  return wagmiConfig
}

const config = getWagmiConfig()

// Create QueryClient factory to ensure singleton in client components
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Prevent refetching on mount
        refetchOnReconnect: false, // Prevent refetching on reconnect
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues by only rendering RainbowKit on client
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <RainbowKitProvider 
            initialChain={sepolia}
            showRecentTransactions={true}
            modalSize="compact"
            avatar={() => null}
          >
            {children}
          </RainbowKitProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
