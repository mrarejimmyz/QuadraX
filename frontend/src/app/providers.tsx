'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, optimism, arbitrum, base, zora } from 'wagmi/chains'
import { defineChain } from 'viem'
import { ReactNode } from 'react'
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

// Get WalletConnect project ID - Create one at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  console.warn('⚠️ Missing WalletConnect Project ID. Get one at: https://cloud.walletconnect.com')
  console.warn('⚠️ Some wallet features may be limited without a valid project ID')
}

console.log('RainbowKit initialized with project ID:', projectId ? 'Valid' : 'Missing - using fallback')

// Configure chains - include popular chains for better wallet support
const chains = [
  hederaTestnet,
  ...(isDevelopment ? [hardhatLocal] : []),
  // Include popular chains for better wallet compatibility
  mainnet,
  polygon,
  arbitrum,
  base,
] as const

const config = getDefaultConfig({
  appName: 'QuadraX - Agentic 4x4 Tic-Tac-Toe',
  projectId: projectId || 'b273b1a60e35e5c464e3c8b7c5a4c4a4',
  chains,
  ssr: true,
})

// Create query client with optimized defaults for Web3
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          initialChain={hederaTestnet}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
