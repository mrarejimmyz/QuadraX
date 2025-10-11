/**
 * Wallet feature exports
 * Using RainbowKit ConnectButton instead of custom components
 */

// All wallet functionality is now handled by RainbowKit
// Import ConnectButton directly from '@rainbow-me/rainbowkit'
export { useWallet } from '@/lib/hooks/useWallet';
export { useBalances } from '@/lib/hooks/useBalances';