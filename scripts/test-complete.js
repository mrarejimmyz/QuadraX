/**
 * Complete Integration Test
 * Tests all components: Environment, Sepolia setup, Hedera connection
 */

const {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
} = require('@hashgraph/sdk');
const { ethers } = require('ethers');
require('dotenv').config();

console.log('🧪 QuadraX Complete Integration Test\n');
console.log('═'.repeat(70));

// Test results tracker
const results = {
  environment: { passed: 0, failed: 0 },
  sepolia: { passed: 0, failed: 0 },
  hedera: { passed: 0, failed: 0 },
};

function logTest(category, name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`   ${icon} ${name}`);
  if (details) console.log(`      ${details}`);
  
  if (passed) {
    results[category].passed++;
  } else {
    results[category].failed++;
  }
}

async function testEnvironmentVariables() {
  console.log('\n📋 Test Suite 1: Environment Configuration');
  console.log('─'.repeat(70));

  const requiredVars = {
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
    PYUSD_TOKEN_ADDRESS: process.env.PYUSD_TOKEN_ADDRESS,
    PLATFORM_WALLET: process.env.PLATFORM_WALLET,
    HEDERA_ACCOUNT_ID: process.env.HEDERA_ACCOUNT_ID,
    HEDERA_PRIVATE_KEY: process.env.HEDERA_PRIVATE_KEY,
  };

  for (const [key, value] of Object.entries(requiredVars)) {
    const isSet = value && !value.includes('your_') && !value.includes('12345');
    logTest('environment', key, isSet, isSet ? `${value.substring(0, 20)}...` : 'Not configured');
  }

  // Validate format
  const privateKeyValid = requiredVars.PRIVATE_KEY?.startsWith('0x') && requiredVars.PRIVATE_KEY.length === 66;
  logTest('environment', 'Private key format', privateKeyValid, privateKeyValid ? 'Valid 0x format' : 'Invalid format');

  const rpcValid = requiredVars.SEPOLIA_RPC_URL?.startsWith('https://');
  logTest('environment', 'RPC URL format', rpcValid, rpcValid ? 'Valid HTTPS URL' : 'Invalid URL');

  const pyusdValid = requiredVars.PYUSD_TOKEN_ADDRESS?.startsWith('0x') && requiredVars.PYUSD_TOKEN_ADDRESS.length === 42;
  logTest('environment', 'PYUSD address format', pyusdValid, pyusdValid ? 'Valid Ethereum address' : 'Invalid address');

  const hederaAccountValid = requiredVars.HEDERA_ACCOUNT_ID?.match(/^\d+\.\d+\.\d+$/);
  logTest('environment', 'Hedera account format', !!hederaAccountValid, hederaAccountValid ? 'Valid 0.0.x format' : 'Invalid format');

  return requiredVars;
}

async function testSepoliaConnection(config) {
  console.log('\n📋 Test Suite 2: Sepolia Testnet Connection');
  console.log('─'.repeat(70));

  try {
    const provider = new ethers.JsonRpcProvider(config.SEPOLIA_RPC_URL);
    
    // Test connection
    const network = await provider.getNetwork();
    const isCorrect = network.chainId === 11155111n;
    logTest('sepolia', 'Network connection', isCorrect, `Chain ID: ${network.chainId}`);

    // Test wallet
    const wallet = new ethers.Wallet(config.PRIVATE_KEY, provider);
    const walletMatches = wallet.address.toLowerCase() === config.PLATFORM_WALLET.toLowerCase();
    logTest('sepolia', 'Wallet address match', walletMatches, `Address: ${wallet.address}`);

    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    const ethBalanceEth = ethers.formatEther(ethBalance);
    const hasEth = parseFloat(ethBalanceEth) > 0;
    logTest('sepolia', 'ETH balance', hasEth, `${ethBalanceEth} ETH`);

    // Check PYUSD token contract
    const pyusdCode = await provider.getCode(config.PYUSD_TOKEN_ADDRESS);
    const isPyusdDeployed = pyusdCode !== '0x';
    logTest('sepolia', 'PYUSD token contract', isPyusdDeployed, 'Contract exists');

    // Check PYUSD balance
    const pyusdContract = new ethers.Contract(
      config.PYUSD_TOKEN_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    const pyusdBalance = await pyusdContract.balanceOf(wallet.address);
    const pyusdBalanceFormatted = ethers.formatUnits(pyusdBalance, 6);
    const hasPyusd = parseFloat(pyusdBalanceFormatted) > 0;
    logTest('sepolia', 'PYUSD balance', hasPyusd, `${pyusdBalanceFormatted} PYUSD`);

    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    logTest('sepolia', 'Latest block', true, `Block: ${blockNumber}`);

    return {
      provider,
      wallet,
      ethBalance: ethBalanceEth,
      pyusdBalance: pyusdBalanceFormatted,
      hasEth,
      hasPyusd,
    };
  } catch (error) {
    console.error(`   ❌ Sepolia test failed: ${error.message}`);
    logTest('sepolia', 'Connection', false, error.message);
    throw error;
  }
}

async function testHederaConnection(config) {
  console.log('\n📋 Test Suite 3: Hedera Testnet Connection');
  console.log('─'.repeat(70));

  let client;

  try {
    // Initialize client
    client = Client.forTestnet();
    logTest('hedera', 'Client initialization', true, 'Testnet client created');

    // Set operator
    const operatorId = AccountId.fromString(config.HEDERA_ACCOUNT_ID);
    const operatorKey = PrivateKey.fromStringDer(config.HEDERA_PRIVATE_KEY);
    client.setOperator(operatorId, operatorKey);
    logTest('hedera', 'Operator setup', true, `Account: ${operatorId.toString()}`);

    // Check balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    const hbarBalance = balance.hbars.toString();
    const hasHbar = !balance.hbars.toBigNumber().isZero();
    logTest('hedera', 'Account balance', hasHbar, `Balance: ${hbarBalance}`);

    // Test account info access
    logTest('hedera', 'Account access', true, `Can query account ${operatorId.toString()}`);

    return {
      client,
      accountId: operatorId.toString(),
      balance: hbarBalance,
      hasHbar,
    };
  } catch (error) {
    console.error(`   ❌ Hedera test failed: ${error.message}`);
    logTest('hedera', 'Connection', false, error.message);
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

function printSummary(sepoliaInfo, hederaInfo) {
  console.log('\n' + '═'.repeat(70));
  console.log('📊 Test Summary\n');

  // Test results
  const totalPassed = results.environment.passed + results.sepolia.passed + results.hedera.passed;
  const totalFailed = results.environment.failed + results.sepolia.failed + results.hedera.failed;
  const totalTests = totalPassed + totalFailed;

  console.log(`   Environment: ${results.environment.passed}/${results.environment.passed + results.environment.failed} passed`);
  console.log(`   Sepolia:     ${results.sepolia.passed}/${results.sepolia.passed + results.sepolia.failed} passed`);
  console.log(`   Hedera:      ${results.hedera.passed}/${results.hedera.passed + results.hedera.failed} passed`);
  console.log(`   ─────────────────────────`);
  console.log(`   Total:       ${totalPassed}/${totalTests} passed`);

  // Deployment readiness
  console.log('\n🚀 Deployment Readiness:\n');

  const hasSepoliaEth = sepoliaInfo?.hasEth || false;
  const hasSepoliaPyusd = sepoliaInfo?.hasPyusd || false;
  const hasHederaHbar = hederaInfo?.hasHbar || false;

  console.log(`   ${hasSepoliaEth ? '✅' : '❌'} Sepolia ETH for gas`);
  console.log(`   ${hasSepoliaPyusd ? '✅' : '❌'} Sepolia PYUSD for staking`);
  console.log(`   ${hasHederaHbar ? '✅' : '❌'} Hedera HBAR for transactions`);

  const isReady = hasSepoliaEth && hasHederaHbar;
  
  console.log('\n' + '═'.repeat(70));
  
  if (isReady) {
    console.log('✅ System Ready for Deployment!\n');
    console.log('Next steps:');
    console.log('   1. npm run deploy:sepolia');
    console.log('   2. Update EscrowCoordinator with deployed address');
    console.log('   3. npm run test:staking');
    console.log('   4. cd frontend && npm run dev\n');
    
    if (!hasSepoliaPyusd) {
      console.log('💡 Optional: Get Sepolia PYUSD from https://faucet.circle.com/');
    }
  } else {
    console.log('⚠️  Not Ready - Missing Resources\n');
    
    if (!hasSepoliaEth) {
      console.log('❌ Get Sepolia ETH:');
      console.log('   https://sepoliafaucet.com/');
      console.log(`   Wallet: ${process.env.PLATFORM_WALLET}\n`);
    }
    
    if (!hasHederaHbar) {
      console.log('❌ Get Hedera HBAR:');
      console.log('   https://portal.hedera.com/');
      console.log(`   Account: ${process.env.HEDERA_ACCOUNT_ID}\n`);
    }
  }
}

async function main() {
  try {
    // Run all test suites
    const config = await testEnvironmentVariables();
    const sepoliaInfo = await testSepoliaConnection(config);
    const hederaInfo = await testHederaConnection(config);

    // Print summary
    printSummary(sepoliaInfo, hederaInfo);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
