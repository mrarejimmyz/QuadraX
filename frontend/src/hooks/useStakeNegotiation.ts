import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';

const PYUSD_STAKING_ADDRESS = '0x...'; // TODO: Add deployed contract address
const PYUSD_TOKEN_ADDRESS = '0x...'; // TODO: Add PYUSD token address

interface NegotiationResult {
  agreedStake: number; // In PYUSD (human readable)
  player1: string;
  player2: string;
}

export function useStakeNegotiation() {
  const { address } = useAccount();
  const [negotiationState, setNegotiationState] = useState<{
    stage: 'negotiating' | 'confirming' | 'approving' | 'staking' | 'complete';
    agreedStake: number | null;
    gameId: number | null;
    error: string | null;
  }>({
    stage: 'negotiating',
    agreedStake: null,
    gameId: null,
    error: null
  });

  // 1. Approve PYUSD spending
  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash
  });

  // 2. Create game
  const { writeContract: createGame, data: createGameHash } = useWriteContract();
  const { isLoading: isCreatingGame, isSuccess: isGameCreated, data: gameData } = useWaitForTransactionReceipt({
    hash: createGameHash
  });

  // 3. Stake PYUSD
  const { writeContract: stakeTokens, data: stakeHash } = useWriteContract();
  const { isLoading: isStaking, isSuccess: isStaked } = useWaitForTransactionReceipt({
    hash: stakeHash
  });

  /**
   * Called when AI negotiation completes successfully
   */
  const confirmNegotiation = (result: NegotiationResult) => {
    const { agreedStake } = result;
    
    // Validate bounds
    if (agreedStake < 1 || agreedStake > 10) {
      setNegotiationState(prev => ({
        ...prev,
        error: `Invalid stake: ${agreedStake} PYUSD (must be 1-10 PYUSD)`
      }));
      return;
    }

    setNegotiationState({
      stage: 'confirming',
      agreedStake,
      gameId: null,
      error: null
    });
  };

  /**
   * User confirms the negotiated stake and triggers contract interaction
   */
  const lockStakeInContract = async (opponentAddress: string) => {
    if (!negotiationState.agreedStake || !address) return;

    try {
      setNegotiationState(prev => ({ ...prev, stage: 'approving', error: null }));

      // Convert PYUSD amount to contract units (6 decimals)
      const stakeAmount = parseUnits(negotiationState.agreedStake.toString(), 6);

      // Step 1: Approve PYUSD spending
      approveToken({
        address: PYUSD_TOKEN_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ type: 'bool' }]
          }
        ],
        functionName: 'approve',
        args: [PYUSD_STAKING_ADDRESS, stakeAmount]
      });

      // Wait for approval, then create game
      // Note: This will be triggered by useEffect watching isApproved

    } catch (error: any) {
      setNegotiationState(prev => ({
        ...prev,
        error: error.message || 'Failed to lock stake',
        stage: 'negotiating'
      }));
    }
  };

  /**
   * Create game after PYUSD approval
   */
  const executeCreateGame = async (opponentAddress: string) => {
    if (!isApproved) return;

    try {
      setNegotiationState(prev => ({ ...prev, stage: 'staking' }));

      createGame({
        address: PYUSD_STAKING_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'createGame',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [{ name: 'player2', type: 'address' }],
            outputs: [{ name: 'gameId', type: 'uint256' }]
          }
        ],
        functionName: 'createGame',
        args: [opponentAddress as `0x${string}`]
      });
    } catch (error: any) {
      setNegotiationState(prev => ({
        ...prev,
        error: error.message || 'Failed to create game',
        stage: 'negotiating'
      }));
    }
  };

  /**
   * Stake PYUSD after game creation
   */
  const executeStake = async (gameId: number) => {
    if (!negotiationState.agreedStake || !isGameCreated) return;

    try {
      const stakeAmount = parseUnits(negotiationState.agreedStake.toString(), 6);

      stakeTokens({
        address: PYUSD_STAKING_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'stake',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'gameId', type: 'uint256' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: []
          }
        ],
        functionName: 'stake',
        args: [BigInt(gameId), stakeAmount]
      });
    } catch (error: any) {
      setNegotiationState(prev => ({
        ...prev,
        error: error.message || 'Failed to stake tokens',
        stage: 'negotiating'
      }));
    }
  };

  /**
   * Complete flow when stake is confirmed
   */
  const completeNegotiation = () => {
    if (isStaked) {
      setNegotiationState(prev => ({ ...prev, stage: 'complete' }));
    }
  };

  return {
    negotiationState,
    confirmNegotiation,
    lockStakeInContract,
    isApproving,
    isCreatingGame,
    isStaking,
    isComplete: negotiationState.stage === 'complete'
  };
}
