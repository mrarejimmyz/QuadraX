#!/usr/bin/env node

/**
 * QuadraX Setup Verification Script
 *
 * This script checks if your development environment is properly configured
 * Run with: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, name) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    log(`✓ ${name} is installed`, 'green');
    return true;
  } catch {
    log(`✗ ${name} is NOT installed`, 'red');
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${name} exists`, 'green');
    return true;
  } else {
    log(`✗ ${name} is missing`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, name) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✓ ${name} exists`, 'green');
    return true;
  } else {
    log(`✗ ${name} is missing`, 'red');
    return false;
  }
}

async function main() {
  log('\n========================================', 'cyan');
  log('  QuadraX Setup Verification', 'cyan');
  log('========================================\n', 'cyan');

  let allChecksPass = true;

  // Check Node.js and npm
  log('Checking System Requirements...', 'blue');
  allChecksPass &= checkCommand('node', 'Node.js');
  allChecksPass &= checkCommand('npm', 'npm');

  try {
    const nodeVersion = execSync('node --version').toString().trim();
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (major >= 18) {
      log(`  Node.js version: ${nodeVersion} (✓ >= 18)`, 'green');
    } else {
      log(`  Node.js version: ${nodeVersion} (✗ need >= 18)`, 'red');
      allChecksPass = false;
    }
  } catch {
    log('  Could not determine Node.js version', 'yellow');
  }

  console.log();

  // Check project structure
  log('Checking Project Structure...', 'blue');
  allChecksPass &= checkDirectory('contracts', 'contracts/');
  allChecksPass &= checkDirectory('frontend', 'frontend/');
  allChecksPass &= checkDirectory('scripts', 'scripts/');
  allChecksPass &= checkDirectory('test', 'test/');
  console.log();

  // Check key files
  log('Checking Key Files...', 'blue');
  allChecksPass &= checkFile('package.json', 'package.json');
  allChecksPass &= checkFile('hardhat.config.js', 'hardhat.config.js');
  allChecksPass &= checkFile('frontend/package.json', 'frontend/package.json');
  allChecksPass &= checkFile('frontend/next.config.js', 'frontend/next.config.js');
  console.log();

  // Check contracts
  log('Checking Smart Contracts...', 'blue');
  allChecksPass &= checkFile('contracts/core/TicTacToe.sol', 'TicTacToe.sol');
  allChecksPass &= checkFile('contracts/core/PYUSDStaking.sol', 'PYUSDStaking.sol');
  allChecksPass &= checkFile('contracts/test/MockERC20.sol', 'MockERC20.sol');
  allChecksPass &= checkFile('contracts/interfaces/IGame.sol', 'IGame.sol');
  allChecksPass &= checkFile('contracts/interfaces/IStaking.sol', 'IStaking.sol');
  allChecksPass &= checkFile('contracts/libraries/GameLogic.sol', 'GameLogic.sol');
  console.log();

  // Check tests
  log('Checking Tests...', 'blue');
  allChecksPass &= checkFile('test/TicTacToe.test.js', 'TicTacToe.test.js');
  allChecksPass &= checkFile('test/PYUSDStaking.test.js', 'PYUSDStaking.test.js');
  console.log();

  // Check frontend components
  log('Checking Frontend Components...', 'blue');
  allChecksPass &= checkFile('frontend/src/app/page.tsx', 'app/page.tsx');
  allChecksPass &= checkFile('frontend/src/app/layout.tsx', 'app/layout.tsx');
  allChecksPass &= checkFile('frontend/src/app/providers.tsx', 'app/providers.tsx');
  allChecksPass &= checkFile('frontend/src/features/game/Board.tsx', 'Board.tsx');
  allChecksPass &= checkFile('frontend/src/features/game/GameInfo.tsx', 'GameInfo.tsx');
  allChecksPass &= checkFile('frontend/src/features/staking/StakingPanel.tsx', 'StakingPanel.tsx');
  allChecksPass &= checkFile('frontend/src/features/game/AIChat.tsx', 'AIChat.tsx');
  console.log();

  // Check documentation
  log('Checking Documentation...', 'blue');
  allChecksPass &= checkFile('README.md', 'README.md');
  allChecksPass &= checkFile('TODO.md', 'TODO.md');
  allChecksPass &= checkFile('BUILD.md', 'BUILD.md');
  allChecksPass &= checkFile('TESTING.md', 'TESTING.md');
  allChecksPass &= checkFile('ARCHITECTURE.md', 'ARCHITECTURE.md');
  allChecksPass &= checkFile('PRODUCTION_READY.md', 'PRODUCTION_READY.md');
  console.log();

  // Check if dependencies are installed
  log('Checking Dependencies...', 'blue');
  const rootNodeModules = checkDirectory('node_modules', 'node_modules/');
  const frontendNodeModules = checkDirectory('frontend/node_modules', 'frontend/node_modules/');

  if (!rootNodeModules) {
    log('  Run: npm install', 'yellow');
  }
  if (!frontendNodeModules) {
    log('  Run: cd frontend && npm install', 'yellow');
  }
  console.log();

  // Check environment files
  log('Checking Environment Configuration...', 'blue');
  const hasRootEnv = checkFile('.env', '.env');
  const hasFrontendEnv = checkFile('frontend/.env.local', 'frontend/.env.local');

  if (!hasRootEnv) {
    log('  Run: cp .env.example .env', 'yellow');
  }
  if (!hasFrontendEnv) {
    log('  Run: cd frontend && cp .env.local.example .env.local', 'yellow');
  }
  console.log();

  // Summary
  log('========================================', 'cyan');
  if (allChecksPass && rootNodeModules && frontendNodeModules && hasRootEnv && hasFrontendEnv) {
    log('✓ All checks passed!', 'green');
    log('  Your environment is ready to go!', 'green');
    console.log();
    log('Next steps:', 'blue');
    log('  1. Run tests: npm test', 'cyan');
    log('  2. Start local node: npx hardhat node', 'cyan');
    log('  3. Deploy contracts: npx hardhat run scripts/deploy.js --network localhost', 'cyan');
    log('  4. Start frontend: cd frontend && npm run dev', 'cyan');
  } else {
    log('✗ Some checks failed', 'red');
    log('  Please review the errors above', 'yellow');
    console.log();
    log('Quick fixes:', 'blue');
    if (!rootNodeModules) {
      log('  npm install', 'cyan');
    }
    if (!frontendNodeModules) {
      log('  cd frontend && npm install', 'cyan');
    }
    if (!hasRootEnv) {
      log('  cp .env.example .env', 'cyan');
    }
    if (!hasFrontendEnv) {
      log('  cd frontend && cp .env.local.example .env.local', 'cyan');
    }
  }
  log('========================================\n', 'cyan');

  process.exit(allChecksPass ? 0 : 1);
}

main().catch(console.error);
