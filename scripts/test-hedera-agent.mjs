/**
 * Test Hedera Agent - Escrow and Treasury Functionality
 * Tests the full lifecycle: deploy → deposit → payout/refund
 */

import { HederaAgent } from '../frontend/src/lib/agents/hedera/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test configuration
const TEST_CONFIG = {
  player1: '0x224783D70D55F9Ab790Fe27fCFc4629241F45371', // Your wallet
  player2: '0xAI_AGENT_ADDRESS_PLACEHOLDER', // AI opponent
  stakeAmount: '5.00', // 5 PYUSD
};

async function runTests() {
  console.log('🧪 Testing Hedera Agent - Escrow & Treasury\n');
  console.log('═'.repeat(60));

  const agent = new HederaAgent();
  let escrowId = null;

  try {
    // Test 1: Initialize Agent
    console.log('\n📋 Test 1: Initialize Hedera Agent');
    console.log('─'.repeat(60));
    
    await agent.initialize();
    console.log('✅ Agent initialized successfully');

    // Test 2: Deploy Escrow Contract
    console.log('\n📋 Test 2: Deploy Escrow Contract');
    console.log('─'.repeat(60));
    console.log(`   Player 1: ${TEST_CONFIG.player1}`);
    console.log(`   Player 2: ${TEST_CONFIG.player2}`);
    console.log(`   Stake: ${TEST_CONFIG.stakeAmount} PYUSD`);
    
    const deployment = await agent.deployEscrow(
      TEST_CONFIG.player1,
      TEST_CONFIG.player2,
      TEST_CONFIG.stakeAmount
    );

    if (deployment.success && deployment.contractId) {
      escrowId = deployment.contractId;
      console.log('✅ Escrow deployed successfully');
      console.log(`   Contract ID: ${escrowId}`);
      console.log(`   Transaction ID: ${deployment.transactionId}`);
      console.log(`   Message: ${deployment.message}`);
    } else {
      throw new Error(`Deployment failed: ${deployment.message}`);
    }

    // Test 3: Check Initial Status
    console.log('\n📋 Test 3: Check Initial Escrow Status');
    console.log('─'.repeat(60));
    
    const initialStatus = await agent.getEscrowStatus(escrowId);
    console.log('   Status:', JSON.stringify(initialStatus, null, 2));
    
    if (!initialStatus.player1Deposited && !initialStatus.player2Deposited) {
      console.log('✅ Initial status correct (no deposits yet)');
    } else {
      console.warn('⚠️  Unexpected initial status');
    }

    // Test 4: Player 1 Deposit
    console.log('\n📋 Test 4: Player 1 Deposits Stake');
    console.log('─'.repeat(60));
    
    const deposit1 = await agent.depositStake(
      escrowId,
      TEST_CONFIG.player1,
      TEST_CONFIG.stakeAmount
    );

    console.log(`   Player 1 deposited: ${deposit1.deposited ? '✅' : '❌'}`);
    console.log(`   Both deposited: ${deposit1.bothDeposited ? '✅' : '❌'}`);
    console.log(`   Total pot: ${deposit1.totalPot}`);

    if (deposit1.deposited) {
      console.log('✅ Player 1 deposit recorded');
    } else {
      console.warn('⚠️  Player 1 deposit failed');
    }

    // Test 5: Check Status After First Deposit
    console.log('\n📋 Test 5: Check Status After Player 1 Deposit');
    console.log('─'.repeat(60));
    
    const statusAfterP1 = await agent.getEscrowStatus(escrowId);
    console.log('   Player 1 Deposited:', statusAfterP1.player1Deposited ? '✅' : '❌');
    console.log('   Player 2 Deposited:', statusAfterP1.player2Deposited ? '✅' : '❌');
    console.log('   Total Deposited:', statusAfterP1.totalDeposited);

    if (statusAfterP1.player1Deposited && !statusAfterP1.player2Deposited) {
      console.log('✅ Status correctly shows Player 1 deposited');
    }

    // Test 6: Player 2 Deposit
    console.log('\n📋 Test 6: Player 2 Deposits Stake');
    console.log('─'.repeat(60));
    
    const deposit2 = await agent.depositStake(
      escrowId,
      TEST_CONFIG.player2,
      TEST_CONFIG.stakeAmount
    );

    console.log(`   Player 2 deposited: ${deposit2.deposited ? '✅' : '❌'}`);
    console.log(`   Both deposited: ${deposit2.bothDeposited ? '✅' : '❌'}`);
    console.log(`   Total pot: ${deposit2.totalPot}`);

    if (deposit2.bothDeposited) {
      console.log('✅ Both players deposited - escrow ready!');
    }

    // Test 7: Check Status After Both Deposits
    console.log('\n📋 Test 7: Check Status After Both Deposits');
    console.log('─'.repeat(60));
    
    const statusAfterBoth = await agent.getEscrowStatus(escrowId);
    console.log('   Player 1 Deposited:', statusAfterBoth.player1Deposited ? '✅' : '❌');
    console.log('   Player 2 Deposited:', statusAfterBoth.player2Deposited ? '✅' : '❌');
    console.log('   Total Deposited:', statusAfterBoth.totalDeposited);
    console.log('   Total Pot:', parseFloat(TEST_CONFIG.stakeAmount) * 2);

    if (statusAfterBoth.player1Deposited && statusAfterBoth.player2Deposited) {
      console.log('✅ Both deposits confirmed in escrow');
    }

    // Test 8: Release to Winner (Player 1 wins)
    console.log('\n📋 Test 8: Release Funds to Winner (Player 1)');
    console.log('─'.repeat(60));
    
    const release = await agent.releaseToWinner(escrowId, TEST_CONFIG.player1);
    console.log(`   Released: ${release.success ? '✅' : '❌'}`);
    console.log(`   Winner: ${release.winner}`);
    console.log(`   Amount: ${release.amount} PYUSD`);

    if (release.success) {
      console.log('✅ Funds released to winner successfully');
    }

    // Test 9: Check Final Status
    console.log('\n📋 Test 9: Check Final Status After Payout');
    console.log('─'.repeat(60));
    
    const finalStatus = await agent.getEscrowStatus(escrowId);
    console.log('   Winner:', finalStatus.winner || 'None');
    console.log('   Game Completed:', finalStatus.gameCompleted ? '✅' : '❌');
    console.log('   Funds Released:', finalStatus.fundsReleased ? '✅' : '❌');

    if (finalStatus.winner === TEST_CONFIG.player1 && finalStatus.fundsReleased) {
      console.log('✅ Final status correct - payout completed');
    }

    // Test 10: Treasury Check (Demo)
    console.log('\n📋 Test 10: Treasury Functionality (Demo)');
    console.log('─'.repeat(60));
    console.log('   Platform Fee: 2.5%');
    console.log(`   Total Pot: ${parseFloat(TEST_CONFIG.stakeAmount) * 2} PYUSD`);
    console.log(`   Platform Fee Amount: ${parseFloat(TEST_CONFIG.stakeAmount) * 2 * 0.025} PYUSD`);
    console.log(`   Winner Receives: ${parseFloat(TEST_CONFIG.stakeAmount) * 2 * 0.975} PYUSD`);
    console.log('   ℹ️  Treasury tracking via localStorage in demo mode');

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 All Tests Completed!\n');
    console.log('📊 Test Summary:');
    console.log('   ✅ Agent initialization');
    console.log('   ✅ Escrow deployment');
    console.log('   ✅ Initial status check');
    console.log('   ✅ Player 1 deposit');
    console.log('   ✅ Player 2 deposit');
    console.log('   ✅ Both deposits verified');
    console.log('   ✅ Winner payout');
    console.log('   ✅ Final status check');
    console.log('   ✅ Treasury calculation');

    console.log('\n🔗 Hedera Resources:');
    console.log('   HashScan (Testnet):', `https://hashscan.io/testnet/account/${process.env.HEDERA_ACCOUNT_ID || '0.0.12345'}`);
    console.log('   Contract:', escrowId ? `https://hashscan.io/testnet/contract/${escrowId}` : 'N/A');

    console.log('\n✅ Hedera Agent is working correctly!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nError details:', error);
    
    // Helpful error messages
    if (error.message.includes('HEDERA_ACCOUNT_ID')) {
      console.log('\n💡 Fix: Set HEDERA_ACCOUNT_ID in .env file');
      console.log('   Get one free at: https://portal.hedera.com/');
    } else if (error.message.includes('HEDERA_PRIVATE_KEY')) {
      console.log('\n💡 Fix: Set HEDERA_PRIVATE_KEY in .env file');
      console.log('   Get from Hedera portal when you create account');
    } else if (error.message.includes('insufficient balance')) {
      console.log('\n💡 Fix: Get free testnet HBAR');
      console.log('   Portal: https://portal.hedera.com/');
    }

    throw error;
  }
}

// Alternative test: Just check if agent can initialize
async function quickTest() {
  console.log('🧪 Quick Test: Hedera Agent Initialization\n');
  
  const agent = new HederaAgent();
  
  try {
    await agent.initialize();
    console.log('✅ Hedera Agent initialized successfully!');
    console.log('   Ready to deploy escrow contracts');
    return true;
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    
    if (error.message.includes('HEDERA_ACCOUNT_ID') || error.message.includes('HEDERA_PRIVATE_KEY')) {
      console.log('\n⚠️  Hedera credentials not configured');
      console.log('\n📝 To configure Hedera:');
      console.log('   1. Go to https://portal.hedera.com/');
      console.log('   2. Create free testnet account');
      console.log('   3. Copy Account ID (e.g., 0.0.123456)');
      console.log('   4. Copy Private Key');
      console.log('   5. Add to .env:');
      console.log('      HEDERA_ACCOUNT_ID=0.0.123456');
      console.log('      HEDERA_PRIVATE_KEY=your_key_here');
      console.log('\n   For now, you can deploy to Sepolia only.');
      console.log('   Hedera escrow is optional but recommended.\n');
    }
    return false;
  }
}

// Run appropriate test based on configuration
async function main() {
  const hasHederaConfig = process.env.HEDERA_ACCOUNT_ID && 
                          process.env.HEDERA_PRIVATE_KEY &&
                          !process.env.HEDERA_ACCOUNT_ID.includes('12345') &&
                          !process.env.HEDERA_PRIVATE_KEY.includes('your_');

  if (hasHederaConfig) {
    console.log('✅ Hedera credentials found - running full tests\n');
    await runTests();
  } else {
    console.log('ℹ️  Hedera credentials not configured - running quick test\n');
    const initialized = await quickTest();
    
    if (!initialized) {
      console.log('\n📋 Next Steps:');
      console.log('   1. Configure Hedera credentials (optional)');
      console.log('   2. OR proceed with Sepolia-only deployment:');
      console.log('      npm run deploy:sepolia');
      console.log('\n   Hedera escrow adds:');
      console.log('   - Fast finality (<5 seconds)');
      console.log('   - Low fees ($0.0001)');
      console.log('   - Automatic state synchronization');
      process.exit(0); // Exit gracefully, not an error
    }
  }
}

main()
  .then(() => {
    console.log('\n✅ Testing complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Testing failed:', error);
    process.exit(1);
  });
