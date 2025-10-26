#!/usr/bin/env node

/**
 * Pre-deployment checklist
 * Verifies environment is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 QuadraX Deployment Checklist\n');
console.log('═'.repeat(60));

const checks = [];
let allPassed = true;

// Check 1: .env file exists
console.log('\n📋 Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
  
  // Read .env file
  const envContent = fs.readFileSync('.env', 'utf-8');
  
  // Check for required variables
  const requiredVars = [
    'PRIVATE_KEY',
    'SEPOLIA_RPC_URL',
    'PYUSD_TOKEN_ADDRESS'
  ];
  
  requiredVars.forEach(varName => {
    const match = envContent.match(new RegExp(`${varName}=(.+)`));
    if (match && match[1] && match[1].trim() && !match[1].includes('your_') && !match[1].includes('YOUR_')) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing or not configured`);
      allPassed = false;
    }
  });
  
  // Optional variables
  const optionalVars = ['ETHERSCAN_API_KEY', 'HEDERA_ACCOUNT_ID', 'HEDERA_PRIVATE_KEY'];
  console.log('\n   Optional variables:');
  optionalVars.forEach(varName => {
    const match = envContent.match(new RegExp(`${varName}=(.+)`));
    if (match && match[1] && match[1].trim() && !match[1].includes('your_') && !match[1].includes('YOUR_')) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ⚠️  ${varName} not set (optional)`);
    }
  });
  
} else {
  console.log('❌ .env file not found!');
  console.log('   Create one using: copy .env.example .env');
  allPassed = false;
}

// Check 2: Node modules installed
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules exists');
} else {
  console.log('❌ node_modules not found! Run: npm install');
  allPassed = false;
}

// Check 3: Contracts compiled
console.log('\n🔨 Checking compiled contracts...');
if (fs.existsSync('artifacts/contracts')) {
  console.log('✅ Contracts compiled');
} else {
  console.log('⚠️  Contracts not compiled yet. Run: npm run compile');
}

// Check 4: Frontend dependencies
console.log('\n🎨 Checking frontend setup...');
if (fs.existsSync('frontend/node_modules')) {
  console.log('✅ Frontend dependencies installed');
} else {
  console.log('⚠️  Frontend dependencies not installed. Run: cd frontend && npm install');
}

// Check 5: Hardhat config
console.log('\n⚙️  Checking Hardhat configuration...');
if (fs.existsSync('hardhat.config.js')) {
  const config = fs.readFileSync('hardhat.config.js', 'utf-8');
  if (config.includes('sepolia')) {
    console.log('✅ Sepolia network configured');
  } else {
    console.log('❌ Sepolia network not configured');
    allPassed = false;
  }
} else {
  console.log('❌ hardhat.config.js not found!');
  allPassed = false;
}

// Summary
console.log('\n' + '═'.repeat(60));
if (allPassed) {
  console.log('🎉 All required checks passed! Ready to deploy.\n');
  console.log('📝 Next steps:');
  console.log('   1. Get Sepolia ETH: https://sepoliafaucet.com/');
  console.log('   2. Get Sepolia PYUSD: https://faucet.circle.com/');
  console.log('   3. Deploy: npm run deploy:sepolia');
  console.log('   4. Test: npm run test:staking\n');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  console.log('📚 See docs/DEPLOYMENT_GUIDE.md for detailed instructions\n');
  process.exit(1);
}
