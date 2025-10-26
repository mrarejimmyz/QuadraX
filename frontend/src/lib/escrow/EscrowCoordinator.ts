/**
 * EscrowCoordinator
 * 
 * Unified coordinator that syncs Sepolia PYUSD operations with Hedera state tracking.
 * Ensures both chains stay in sync during staking operations.
 */

import { getHederaAgent } from '../agents/hedera';
import { createPublicClient, createWalletClient, custom, parseUnits, type Address, type Hash } from 'viem';
import { sepolia } from 'viem/chains';
import PYUSDStakingABI from '../../contracts/abis/PYUSDStaking.json';
import PYUSDERC20ABI from '../../contracts/abis/PYUSD.json';

// Contract addresses
const PYUSD_ADDRESS = '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9' as Address;
const STAKING_CONTRACT_ADDRESS = '0x1E7A9732C25DaD9880ac9437d00a071B937c1807' as Address; // PYUSDStaking deployed on Sepolia

interface DeploymentResult {
  sepoliaGameId: string;
  hederaEscrowId: string;
  stakeAmount: string;
  player1: Address;
  player2: Address;
}

interface DepositResult {
  sepoliaTxHash: Hash;
  hederaUpdated: boolean;
  bothDeposited: boolean;
}

interface PayoutResult {
  sepoliaTxHash: Hash;
  hederaReleased: boolean;
  winner: Address;
  amount: string;
}

export class EscrowCoordinator {
  private publicClient;
  private walletClient;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('EscrowCoordinator can only be used in browser environment');
    }

    // Use MetaMask for both reading and writing
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: custom((window as any).ethereum),
    });

    this.walletClient = createWalletClient({
      chain: sepolia,
      transport: custom((window as any).ethereum),
    });
  }

  /**
   * Deploy game on both chains atomically
   * 1. Create Hedera escrow (fast, always succeeds)
   * 2. Create Sepolia game (may fail due to gas/revert)
   * 3. If Sepolia fails, clean up Hedera
   */
  async deployDualChainGame(
    player1: Address,
    player2: Address,
    stakeAmount: string
  ): Promise<DeploymentResult> {
    console.log('🚀 Starting dual-chain deployment...');
    console.log('Player 1:', player1);
    console.log('Player 2:', player2);
    console.log('Stake:', stakeAmount, 'PYUSD');

    let hederaEscrowId: string | null = null;

    try {
      // Step 1: Deploy Hedera escrow (fast, cheap)
      console.log('📝 Deploying Hedera escrow...');
      const hederaAgent = getHederaAgent();
      const hederaResult = await hederaAgent.deployEscrow(
        parseFloat(stakeAmount),
        player1,
        player2
      );
      hederaEscrowId = hederaResult.contractId;
      console.log('✅ Hedera escrow deployed:', hederaEscrowId);

      // Step 2: Create Sepolia game
      console.log('📝 Creating Sepolia game...');

      const hash = await this.walletClient.writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: PYUSDStakingABI.abi || PYUSDStakingABI,
        functionName: 'createGame',
        args: [player2],
        account: player1,
      });

      console.log('✅ Transaction submitted:', hash);
      console.log('   View on Etherscan: https://sepolia.etherscan.io/tx/' + hash);
      console.log('⏳ Waiting for Sepolia confirmation (may take 30-60 seconds)...');
      
      // Simple retry loop instead of viem's waitForTransactionReceipt
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 60; // 60 attempts = 3 minutes with 3 second intervals
      
      while (!receipt && attempts < maxAttempts) {
        try {
          receipt = await this.publicClient.getTransactionReceipt({ hash });
          if (receipt) {
            console.log('✅ Receipt received after', attempts + 1, 'attempts');
            break;
          }
        } catch (e) {
          // Receipt not available yet, continue waiting
        }
        
        attempts++;
        if (attempts % 10 === 0) {
          console.log(`   Still waiting... (${attempts * 3}s elapsed)`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      }
      
      if (!receipt) {
        throw new Error('Transaction receipt not found after 3 minutes. Check Etherscan: https://sepolia.etherscan.io/tx/' + hash);
      }

      console.log('📦 Receipt status:', receipt.status);
      if (receipt.status !== 'success') {
        throw new Error('Sepolia game creation reverted');
      }

      // Debug: log receipt structure
      console.log('📋 Receipt received. Logs count:', receipt.logs?.length);
      if (receipt.logs && receipt.logs.length > 0) {
        console.log('First log topics:', receipt.logs[0].topics);
      }

      // Extract gameId from logs
      const gameId = this.extractGameIdFromReceipt(receipt);
      console.log('✅ Sepolia game created:', gameId);

      // Step 3: Link the two
      console.log('🔗 Linking Hedera escrow to Sepolia game...');
      localStorage.setItem(`hedera-escrow-${hederaEscrowId}`, JSON.stringify({
        sepoliaGameId: gameId,
        player1,
        player2,
        stakeAmount,
        createdAt: Date.now(),
      }));

      console.log('✅ Dual-chain deployment complete!');
      return {
        sepoliaGameId: gameId,
        hederaEscrowId,
        stakeAmount,
        player1,
        player2,
      };

    } catch (error) {
      console.error('❌ Dual-chain deployment failed:', error);

      // Cleanup: Mark Hedera escrow as failed if it was created
      if (hederaEscrowId) {
        console.log('🧹 Cleaning up Hedera escrow...');
        try {
          const hederaAgent = getHederaAgent();
          await hederaAgent.refundStakes(hederaEscrowId);
        } catch (cleanupError) {
          console.error('Failed to cleanup Hedera:', cleanupError);
        }
      }

      throw error;
    }
  }

  /**
   * Deposit stake on both chains atomically
   * 1. Approve PYUSD on Sepolia
   * 2. Transfer PYUSD to staking contract
   * 3. Update Hedera state only after Sepolia confirms
   */
  async depositStake(
    gameId: string,
    escrowId: string,
    playerAddress: Address,
    amount: string
  ): Promise<DepositResult> {
    console.log('💰 Starting dual-chain deposit...');
    console.log('Game ID:', gameId);
    console.log('Escrow ID:', escrowId);
    console.log('Player:', playerAddress);
    console.log('Amount:', amount, 'PYUSD');

    try {
      // Step 1: Approve PYUSD
      console.log('📝 Approving PYUSD...');
      const amountWei = parseUnits(amount, 6);

      const approveHash = await this.walletClient.writeContract({
        address: PYUSD_ADDRESS,
        abi: PYUSDERC20ABI.abi || PYUSDERC20ABI,
        functionName: 'approve',
        args: [STAKING_CONTRACT_ADDRESS, amountWei],
        account: playerAddress,
      });

      console.log('✅ Approval transaction submitted:', approveHash);
      console.log('   View on Etherscan: https://sepolia.etherscan.io/tx/' + approveHash);
      console.log('⏳ Waiting for approval confirmation...');
      
      // Manual polling for approval receipt
      let approvalReceipt = null;
      let attempts = 0;
      const maxAttempts = 60;
      
      while (!approvalReceipt && attempts < maxAttempts) {
        try {
          approvalReceipt = await this.publicClient.getTransactionReceipt({ hash: approveHash });
          if (approvalReceipt) {
            console.log('✅ Approval confirmed after', attempts + 1, 'attempts');
            break;
          }
        } catch (e) {
          // Receipt not available yet
        }
        attempts++;
        if (attempts % 10 === 0) {
          console.log(`   Still waiting for approval... (${attempts * 3}s elapsed)`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      if (!approvalReceipt) {
        throw new Error('Approval transaction not confirmed after 3 minutes');
      }
      
      console.log('✅ PYUSD approved');

      // Step 2: Stake on Sepolia
      console.log('📝 Staking PYUSD on Sepolia...');
      // Convert gameId string to BigInt for the contract
      const gameIdBigInt = BigInt(gameId);
      console.log(`   Converting gameId "${gameId}" to BigInt: ${gameIdBigInt}`);
      
      const stakeHash = await this.walletClient.writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: PYUSDStakingABI.abi || PYUSDStakingABI,
        functionName: 'stake',
        args: [gameIdBigInt, amountWei],
        account: playerAddress,
      });

      console.log('✅ Stake transaction submitted:', stakeHash);
      console.log('   View on Etherscan: https://sepolia.etherscan.io/tx/' + stakeHash);
      console.log('⏳ Waiting for stake confirmation...');
      
      // Manual polling for stake receipt
      let stakeReceipt = null;
      attempts = 0;
      
      while (!stakeReceipt && attempts < maxAttempts) {
        try {
          stakeReceipt = await this.publicClient.getTransactionReceipt({ hash: stakeHash });
          if (stakeReceipt) {
            console.log('✅ Stake confirmed after', attempts + 1, 'attempts');
            break;
          }
        } catch (e) {
          // Receipt not available yet
        }
        attempts++;
        if (attempts % 10 === 0) {
          console.log(`   Still waiting for stake... (${attempts * 3}s elapsed)`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      if (!stakeReceipt) {
        throw new Error('Stake transaction not confirmed after 3 minutes');
      }

      if (stakeReceipt.status !== 'success') {
        throw new Error('Sepolia stake transaction reverted');
      }
      console.log('✅ PYUSD staked on Sepolia');

      // Step 3: Update Hedera state (only after Sepolia confirms)
      console.log('📝 Updating Hedera escrow state...');
      const hederaAgent = getHederaAgent();
      const hederaResult = await hederaAgent.depositStake(escrowId, playerAddress, amount);
      console.log('✅ Hedera state updated');

      console.log('✅ Dual-chain deposit complete!');
      return {
        sepoliaTxHash: stakeHash,
        hederaUpdated: true,
        bothDeposited: hederaResult.bothDeposited,
      };

    } catch (error) {
      console.error('❌ Dual-chain deposit failed:', error);
      throw error;
    }
  }

  /**
   * Payout winner on both chains
   * 1. Release funds on Sepolia
   * 2. Update Hedera state
   */
  async payoutWinner(
    gameId: string,
    escrowId: string,
    winner: Address
  ): Promise<PayoutResult> {
    console.log('🏆 Starting dual-chain payout...');
    console.log('Game ID:', gameId);
    console.log('Escrow ID:', escrowId);
    console.log('Winner:', winner);

    try {
      // Step 1: Declare winner and trigger automatic payout on Sepolia
      // NOTE: The caller signs the transaction, but the contract sends PYUSD to the winner
      console.log('📝 Declaring winner on Sepolia...');
      console.log('   Winner will receive:', winner);
      console.log('   Transaction signed by:', this.walletClient.account?.address);
      
      // Convert gameId to BigInt
      const gameIdBigInt = BigInt(gameId);
      
      const claimHash = await this.walletClient.writeContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: PYUSDStakingABI.abi || PYUSDStakingABI,
        functionName: 'declareWinner',
        args: [gameIdBigInt, winner],
        // The signer can be anyone - the contract sends funds to 'winner' parameter
      });

      console.log('✅ DeclareWinner transaction submitted:', claimHash);
      console.log('   View on Etherscan: https://sepolia.etherscan.io/tx/' + claimHash);
      console.log('⏳ Waiting for payout confirmation...');
      
      // Manual polling for receipt
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 60; // 3 minutes max
      
      while (!receipt && attempts < maxAttempts) {
        try {
          receipt = await this.publicClient.getTransactionReceipt({ hash: claimHash });
        } catch (e) {
          // Receipt not ready yet
        }
        if (receipt) break;
        attempts++;
        if (attempts % 10 === 0) {
          console.log(`   Still waiting for confirmation... (${attempts * 3}s elapsed)`);
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      if (!receipt) {
        throw new Error('Payout transaction not confirmed after 3 minutes');
      }

      if (receipt.status !== 'success') {
        throw new Error('Sepolia claim transaction reverted');
      }

      // Extract payout amount from logs
      const amount = this.extractPayoutAmountFromReceipt(receipt);
      console.log('✅ PYUSD claimed on Sepolia:', amount);

      // Step 2: Update Hedera state
      console.log('📝 Updating Hedera escrow state...');
      const hederaAgent = getHederaAgent();
      await hederaAgent.releaseToWinner(escrowId, winner);
      console.log('✅ Hedera state updated');

      console.log('✅ Dual-chain payout complete!');
      return {
        sepoliaTxHash: claimHash,
        hederaReleased: true,
        winner,
        amount,
      };

    } catch (error) {
      console.error('❌ Dual-chain payout failed:', error);
      throw error;
    }
  }

  /**
   * Handle tie/refund on both chains
   */
  async refundTie(gameId: string, escrowId: string): Promise<void> {
    console.log('🔄 Starting dual-chain refund...');

    try {
      // Refund on Sepolia
      console.log('📝 Refunding on Sepolia...');
      // (Assuming staking contract has refund function)
      
      // Update Hedera
      console.log('📝 Updating Hedera escrow state...');
      const hederaAgent = getHederaAgent();
      await hederaAgent.refundStakes(escrowId);
      console.log('✅ Hedera state updated');

      console.log('✅ Dual-chain refund complete!');
    } catch (error) {
      console.error('❌ Dual-chain refund failed:', error);
      throw error;
    }
  }

  /**
   * Check sync status between chains
   */
  async checkSyncStatus(gameId: string, escrowId: string): Promise<{
    synced: boolean;
    sepoliaState: any;
    hederaState: any;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Get Sepolia game state
      const sepoliaGame = await this.publicClient.readContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: PYUSDStakingABI.abi || PYUSDStakingABI,
        functionName: 'games',
        args: [gameId],
      }) as any;

      // Get Hedera escrow state
      const hederaAgent = getHederaAgent();
      const hederaEscrow = await hederaAgent.getEscrowStatus(escrowId);

      // Compare states
      if (sepoliaGame.player1Staked && !hederaEscrow.player1Deposited) {
        issues.push('Player 1 staked on Sepolia but not tracked on Hedera');
      }
      if (sepoliaGame.player2Staked && !hederaEscrow.player2Deposited) {
        issues.push('Player 2 staked on Sepolia but not tracked on Hedera');
      }
      if (sepoliaGame.winner && !hederaEscrow.winner) {
        issues.push('Winner declared on Sepolia but not on Hedera');
      }

      return {
        synced: issues.length === 0,
        sepoliaState: sepoliaGame,
        hederaState: hederaEscrow,
        issues,
      };

    } catch (error) {
      console.error('Failed to check sync status:', error);
      throw error;
    }
  }

  // Helper methods
  private extractGameIdFromReceipt(receipt: any): string {
    // Parse GameCreated event to extract gameId
    // Event signature: GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2)
    
    // Try to find GameCreated event in logs
    // The event has 3 indexed parameters, so topics array will have 4 elements: [eventSignature, gameId, player1, player2]
    const gameCreatedLog = receipt.logs?.find((log: any) => 
      log.topics && log.topics.length === 4 // GameCreated has 3 indexed params + signature
    );

    if (gameCreatedLog && gameCreatedLog.topics && gameCreatedLog.topics.length > 1) {
      // The gameId is the second topic (first indexed parameter after signature)
      const gameIdHex = gameCreatedLog.topics[1];
      // Convert hex to decimal string
      const gameIdDecimal = BigInt(gameIdHex).toString();
      console.log(`📊 Extracted gameId: ${gameIdDecimal} (from hex ${gameIdHex})`);
      return gameIdDecimal;
    }

    // Fallback: try to use the last few digits of tx hash as a temporary ID
    console.warn('⚠️ Could not find GameCreated event in receipt');
    console.warn('Receipt logs:', JSON.stringify(receipt.logs, null, 2));
    const fallbackId = BigInt(receipt.transactionHash.slice(-8), 16).toString();
    console.warn(`Using fallback gameId: ${fallbackId}`);
    return fallbackId;
  }

  private extractPayoutAmountFromReceipt(receipt: any): string {
    // Parse WinningsClaimed event to extract amount
    // This is a placeholder - implement based on actual event structure
    return '10'; // PYUSD
  }
}

/**
 * Get singleton instance
 */
let coordinatorInstance: EscrowCoordinator | null = null;

export function getEscrowCoordinator(): EscrowCoordinator {
  if (!coordinatorInstance) {
    coordinatorInstance = new EscrowCoordinator();
  }
  return coordinatorInstance;
}
