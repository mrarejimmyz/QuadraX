/**
 * 🏆 DUAL-CHAIN HACKATHON CONTRACT CONFIGURATION 🏆
 * Targets PayPal PYUSD ($10k) + Hedera ($10k) hackathon prizes
 */

// Determine active chain from environment
const primaryChain = process.env.NEXT_PUBLIC_PRIMARY_CHAIN || 'sepolia'
const isSepoliaMode = primaryChain === 'sepolia'

export const CONTRACTS = {
  // 🎯 Dynamic contract selection based on primary chain
  TIC_TAC_TOE: {
    address: (isSepoliaMode 
      ? process.env.NEXT_PUBLIC_SEPOLIA_TICTACTOE 
      : process.env.NEXT_PUBLIC_HEDERA_TICTACTOE
    ) as `0x${string}` || '0x',
    name: 'TicTacToe',
  },
  STAKING: {
    address: (isSepoliaMode 
      ? process.env.NEXT_PUBLIC_SEPOLIA_STAKING 
      : process.env.NEXT_PUBLIC_HEDERA_STAKING
    ) as `0x${string}` || '0x',
    name: 'PYUSDStaking',
  },
  PYUSD: {
    address: (isSepoliaMode 
      ? process.env.NEXT_PUBLIC_PYUSD_SEPOLIA 
      : process.env.NEXT_PUBLIC_PYUSD_TOKEN
    ) as `0x${string}` || '0x',
    name: 'PYUSD',
  },
  
  // 💰 Sepolia-specific contracts (PayPal PYUSD hackathon)
  SEPOLIA: {
    TIC_TAC_TOE: (process.env.NEXT_PUBLIC_SEPOLIA_TICTACTOE || '0x') as `0x${string}`,
    STAKING: (process.env.NEXT_PUBLIC_SEPOLIA_STAKING || '0x') as `0x${string}`,
    PYUSD: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9' as `0x${string}`, // Official PYUSD Sepolia
  },
  
  // 🤖 Hedera-specific contracts (Hedera Agent Kit hackathon)
  HEDERA: {
    TIC_TAC_TOE: (process.env.NEXT_PUBLIC_HEDERA_TICTACTOE || '0x') as `0x${string}`,
    STAKING: (process.env.NEXT_PUBLIC_HEDERA_STAKING || '0x') as `0x${string}`,
    PYUSD: (process.env.NEXT_PUBLIC_PYUSD_TOKEN || '0x') as `0x${string}`, // Mock PYUSD or bridged
  },
} as const;

export const CHAIN_CONFIG = {
  // 💰 Sepolia - PayPal PYUSD Hackathon Focus
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    hackathon: 'PayPal PYUSD',
    prizes: ['Grand Prize $4.5k', 'Consumer Champion $3.5k', 'Innovation $2k'],
    features: ['Official PYUSD Contract', 'Seamless Payments', 'Consumer UX'],
  },
  
  // 🤖 Hedera - Agent Kit & A2A Hackathon Focus  
  HEDERA_TESTNET: {
    id: 296,
    name: 'Hedera Testnet', 
    rpcUrl: process.env.NEXT_PUBLIC_HEDERA_RPC_URL || 'https://testnet.hashio.io/api',
    blockExplorer: 'https://hashscan.io/testnet',
    hackathon: 'Hedera',
    prizes: ['Agent Kit $4k', 'EVM Innovator $4k', 'Lit Protocol $1k', 'Plugin $1k'],
    features: ['Agent Kit Integration', 'A2A Messaging', 'HCS', 'Cross-chain'],
  },
  
  LOCAL: {
    id: 1337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    hackathon: 'Development',
    prizes: [],
    features: ['Local Testing', 'MockERC20'],
  },
} as const;

// 🎯 Active configuration based on primary chain
export const ACTIVE_CHAIN = process.env.NEXT_PUBLIC_PRIMARY_CHAIN === 'hedera' 
  ? CHAIN_CONFIG.HEDERA_TESTNET 
  : CHAIN_CONFIG.SEPOLIA;

export const MIN_STAKE = 1000000; // 1 PYUSD (6 decimals)
export const PLATFORM_FEE_BPS = 25; // 0.25%
