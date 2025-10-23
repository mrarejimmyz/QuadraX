/**
 * Complete PYUSD + Hedera Cross-Chain Integration Hook
 * Handles staking, game management, and cross-chain messaging
 */

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS } from '@/lib/constants/contracts';
import { PYUSD_STAKING_ABI, ERC20_ABI } from '@/lib/constants/abis';
import { createHederaAgentKit, HederaAgentKit } from '@/lib/services/hederaAgentKit';

interface GameState {
  gameId: string | null;
  phase: 'setup' | 'negotiating' | 'staking' | 'playing' | 'completed';
  stakes: {
    player1: string | null;
    player2: string | null;
    amount: number | null;
  };
  status: string;
  error: string | null;
}

interface CrossChainOperation {
  id: string;
  type: 'stake_notification' | 'game_result' | 'payout';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ethereumTx?: string;
  hederaTx?: string;
  timestamp: Date;
}

export function usePYUSDHederaIntegration() {
  const { address } = useAccount();
  const [gameState, setGameState] = useState<GameState>({
    gameId: null,
    phase: 'setup',
    stakes: { player1: null, player2: null, amount: null },
    status: 'Ready to start',
    error: null
  });
  
  const [hederaAgent, setHederaAgent] = useState<HederaAgentKit | null>(null);
  const [crossChainOps, setCrossChainOps] = useState<CrossChainOperation[]>([]);

  // Wagmi hooks for contract interactions
  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash
  });

  const { writeContract: createGame, data: createGameHash } = useWriteContract();
  const { isLoading: isCreatingGame, isSuccess: isGameCreated } = useWaitForTransactionReceipt({
    hash: createGameHash
  });

  const { writeContract: stakeTokens, data: stakeHash } = useWriteContract();
  const { isLoading: isStaking, isSuccess: isStaked } = useWaitForTransactionReceipt({
    hash: stakeHash
  });

  /**
   * Initialize Hedera Agent Kit on component mount
   */
  useEffect(() => {
    const initializeHedera = async () => {
      try {
        const agent = createHederaAgentKit();
        await agent.initialize();
        
        // Setup event listeners
        agent.on('stake-notified', (data) => {
          console.log('Hedera: Stake notification confirmed', data);
          updateGameStatus('Stake confirmed on Hedera');
        });

        agent.on('game-result-processed', (data) => {
          console.log('Hedera: Game result processed', data);
          updateGameStatus('Game result submitted to Hedera');
        });

        agent.on('ethereum-payout-requested', (data) => {
          console.log('Hedera: Ethereum payout requested', data);
          updateGameStatus('Payout processing via bridge');
        });

        setHederaAgent(agent);
        updateGameStatus('Hedera Agent Kit ready');
      } catch (error) {
        console.error('Failed to initialize Hedera Agent Kit:', error);
        updateGameStatus('Hedera Agent Kit initialization failed');
      }
    };

    initializeHedera();
  }, []);

  /**
   * Update game status helper
   */
  const updateGameStatus = useCallback((status: string, error?: string) => {
    setGameState(prev => ({
      ...prev,
      status,
      error: error || null
    }));
  }, []);

  /**
   * Complete cross-chain PYUSD staking flow
   */
  const executeStakingFlow = useCallback(async (
    player2Address: string,
    stakeAmount: number
  ) => {
    if (!address || !hederaAgent) {
      updateGameStatus('Error', 'Wallet or Hedera Agent not ready');
      return;
    }

    try {
      setGameState(prev => ({ ...prev, phase: 'staking', error: null }));
      updateGameStatus('Starting cross-chain staking flow...');

      // Step 1: Approve PYUSD spending
      updateGameStatus('Approving PYUSD spending...');
      const stakeAmountWei = parseUnits(stakeAmount.toString(), 6);

      await approveToken({
        address: CONTRACTS.PYUSD.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.STAKING.address, stakeAmountWei]
      });

      // Wait for approval
      updateGameStatus('Waiting for PYUSD approval...');
      // Approval status will be handled by useWaitForTransactionReceipt

    } catch (error: any) {
      updateGameStatus('Error', error.message || 'Staking flow failed');
      setGameState(prev => ({ ...prev, phase: 'setup' }));
    }
  }, [address, hederaAgent, approveToken]);

  /**
   * Handle approval success and create game
   */
  useEffect(() => {
    if (isApproved && gameState.phase === 'staking') {
      createGameAfterApproval();
    }
  }, [isApproved, gameState.phase]);

  const createGameAfterApproval = useCallback(async () => {
    try {
      updateGameStatus('Creating game in staking contract...');

      // Get player2 from game state (should be set during negotiation)
      const player2 = gameState.stakes.player2;
      if (!player2) {
        throw new Error('Player 2 address not set');
      }

      await createGame({
        address: CONTRACTS.STAKING.address,
        abi: PYUSD_STAKING_ABI,
        functionName: 'createGame',
        args: [player2 as `0x${string}`]
      });

      updateGameStatus('Waiting for game creation...');
    } catch (error: any) {
      updateGameStatus('Error', error.message || 'Game creation failed');
    }
  }, [gameState.stakes.player2, createGame]);

  /**
   * Handle game creation success and stake tokens
   */
  useEffect(() => {
    if (isGameCreated && gameState.phase === 'staking') {
      stakeInGame();
    }
  }, [isGameCreated, gameState.phase]);

  const stakeInGame = useCallback(async () => {
    try {
      updateGameStatus('Staking PYUSD in game...');

      const stakeAmount = gameState.stakes.amount;
      if (!stakeAmount) {
        throw new Error('Stake amount not set');
      }

      const stakeAmountWei = parseUnits(stakeAmount.toString(), 6);
      
      // Assume gameId is 0 for the newly created game (should be improved)
      const gameId = 0;

      await stakeTokens({
        address: CONTRACTS.STAKING.address,
        abi: PYUSD_STAKING_ABI,
        functionName: 'stake',
        args: [BigInt(gameId), stakeAmountWei]
      });

      updateGameStatus('Waiting for stake confirmation...');
    } catch (error: any) {
      updateGameStatus('Error', error.message || 'Staking failed');
    }
  }, [gameState.stakes.amount, stakeTokens]);

  /**
   * Handle stake success and notify Hedera
   */
  useEffect(() => {
    if (isStaked && gameState.phase === 'staking' && hederaAgent) {
      notifyHederaOfStake();
    }
  }, [isStaked, gameState.phase, hederaAgent]);

  const notifyHederaOfStake = useCallback(async () => {
    if (!hederaAgent || !stakeHash || !gameState.stakes.amount) return;

    try {
      updateGameStatus('Notifying Hedera of stake...');

      // Create cross-chain operation record
      const crossChainOp: CrossChainOperation = {
        id: `stake_${Date.now()}`,
        type: 'stake_notification',
        status: 'processing',
        ethereumTx: stakeHash,
        timestamp: new Date()
      };

      setCrossChainOps(prev => [...prev, crossChainOp]);

      // Notify Hedera Agent Kit
      const hederaTx = await hederaAgent.notifyStake(
        gameState.gameId || '0',
        address!,
        gameState.stakes.amount.toString(),
        stakeHash
      );

      // Update cross-chain operation
      setCrossChainOps(prev => prev.map(op => 
        op.id === crossChainOp.id 
          ? { ...op, status: 'completed', hederaTx }
          : op
      ));

      // Move to playing phase
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        gameId: '0' // Should get actual gameId from contract events
      }));

      updateGameStatus('Cross-chain staking completed! Game ready to play.');

    } catch (error: any) {
      updateGameStatus('Error', `Hedera notification failed: ${error.message}`);
      
      // Update cross-chain operation as failed
      setCrossChainOps(prev => prev.map(op => 
        op.type === 'stake_notification' && op.status === 'processing'
          ? { ...op, status: 'failed' }
          : op
      ));
    }
  }, [hederaAgent, stakeHash, gameState, address]);

  /**
   * Process game completion and trigger cross-chain payout
   */
  const processGameCompletion = useCallback(async (
    winner: string,
    amount: string
  ) => {
    if (!hederaAgent || !gameState.gameId) {
      updateGameStatus('Error', 'Cannot process game completion');
      return;
    }

    try {
      updateGameStatus('Processing game completion...');

      // Create cross-chain operation record
      const crossChainOp: CrossChainOperation = {
        id: `payout_${Date.now()}`,
        type: 'game_result',
        status: 'processing',
        timestamp: new Date()
      };

      setCrossChainOps(prev => [...prev, crossChainOp]);

      // Submit game result to Hedera
      const hederaTx = await hederaAgent.processGameResult(
        gameState.gameId,
        winner,
        amount
      );

      // Update cross-chain operation
      setCrossChainOps(prev => prev.map(op => 
        op.id === crossChainOp.id 
          ? { ...op, status: 'completed', hederaTx }
          : op
      ));

      setGameState(prev => ({ ...prev, phase: 'completed' }));
      updateGameStatus('Game completed! Payout processing via Hedera bridge.');

    } catch (error: any) {
      updateGameStatus('Error', `Game completion failed: ${error.message}`);
    }
  }, [hederaAgent, gameState.gameId]);

  /**
   * Set negotiation result and prepare for staking
   */
  const setNegotiationResult = useCallback((
    player2: string,
    stakeAmount: number
  ) => {
    setGameState(prev => ({
      ...prev,
      phase: 'negotiating',
      stakes: {
        player1: address!,
        player2,
        amount: stakeAmount
      }
    }));
    updateGameStatus(`Negotiated ${stakeAmount} PYUSD stake with ${player2.slice(0, 8)}...`);
  }, [address]);

  /**
   * Get cross-chain operation history
   */
  const getCrossChainHistory = useCallback(async (gameId?: string) => {
    if (!hederaAgent) return [];
    return await hederaAgent.getMessageHistory(gameId);
  }, [hederaAgent]);

  return {
    // Game state
    gameState,
    crossChainOps,
    
    // Loading states
    isApproving,
    isCreatingGame,
    isStaking,
    
    // Actions
    executeStakingFlow,
    processGameCompletion,
    setNegotiationResult,
    getCrossChainHistory,
    
    // Hedera status
    hederaReady: hederaAgent?.isReady() || false,
    hederaNetworkInfo: hederaAgent?.getNetworkInfo() || null,
    
    // Utilities
    updateGameStatus
  };
}