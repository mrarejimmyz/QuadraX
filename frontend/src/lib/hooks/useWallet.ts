/**
 * Enhanced wallet connection hook with comprehensive state management
 */

'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useCallback, useEffect, useState } from 'react';

export interface WalletState {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  chainId: number | undefined;
  isWrongNetwork: boolean;
  connector: any;
}

export interface WalletActions {
  connect: () => void;
  disconnect: () => Promise<void>;
  switchToHederaTestnet: () => Promise<void>;
}

const HEDERA_TESTNET_CHAIN_ID = 296;

export function useWallet(): WalletState & WalletActions {
  const { address, isConnected, connector } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect, isPending: isDisconnecting } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check if user is on wrong network
  const isWrongNetwork = isConnected && chainId !== HEDERA_TESTNET_CHAIN_ID;

  // Handle connection
  const handleConnect = useCallback(() => {
    try {
      setConnectionError(null);
      if (openConnectModal) {
        openConnectModal();
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError('Failed to open wallet connection modal');
    }
  }, [openConnectModal]);

  // Handle disconnection
  const handleDisconnect = useCallback(async () => {
    try {
      setConnectionError(null);
      await disconnect();
    } catch (error) {
      console.error('Disconnection error:', error);
      setConnectionError('Failed to disconnect wallet');
    }
  }, [disconnect]);

  // Handle network switching
  const switchToHederaTestnet = useCallback(async () => {
    try {
      setConnectionError(null);
      if (switchChain) {
        await switchChain({ chainId: HEDERA_TESTNET_CHAIN_ID });
      }
    } catch (error) {
      console.error('Network switch error:', error);
      setConnectionError('Failed to switch to Hedera Testnet');
    }
  }, [switchChain]);

  // Clear errors when connection state changes
  useEffect(() => {
    if (isConnected && !isWrongNetwork) {
      setConnectionError(null);
    }
  }, [isConnected, isWrongNetwork]);

  return {
    // State
    address,
    isConnected,
    isConnecting: isConnecting || isSwitching,
    isDisconnecting,
    chainId,
    isWrongNetwork,
    connector,
    
    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    switchToHederaTestnet,
  };
}