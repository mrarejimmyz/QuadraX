/**
 * QuadraX Configuration
 * Centralized configuration for deployment and testing
 */

module.exports = {
  // Contract configuration
  contracts: {
    ticTacToe: {
      name: "TicTacToe",
      constructor: [], // No constructor args
    },
    staking: {
      name: "PYUSDStaking",
      // Constructor args: (pyusdAddress, platformWallet)
    },
    mockPYUSD: {
      name: "contracts/test/MockERC20.sol:MockERC20",
      constructor: ["Mock PYUSD", "PYUSD", 6],
      initialMint: "10000", // 10,000 PYUSD per test account
    },
  },

  // Network configuration
  networks: {
    hardhat: {
      chainId: 1337,
      gasPrice: "auto",
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    hederaTestnet: {
      url: "https://testnet.hashio.io/api",
      chainId: 296,
      timeout: 60000,
      gasPrice: "auto",
    },
  },

  // Gas configuration
  gas: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    reportGas: process.env.REPORT_GAS === "true",
  },

  // Platform configuration
  platform: {
    feePercentage: 0.25, // 0.25%
    feeBasisPoints: 25, // 25 basis points
    maxFeePercentage: 5, // Maximum 5%
    minStakeAmount: "1", // 1 PYUSD minimum
  },

  // Test configuration
  testing: {
    timeout: 60000, // 60 seconds
    mockAccounts: 10,
    defaultStakeAmount: "5", // 5 PYUSD
    testPYUSDDecimals: 6,
  },

  // Deployment configuration
  deployment: {
    saveDeployments: true,
    deploymentsPath: "./deployments",
    verifyContracts: true,
    verifyDelay: 30000, // Wait 30s before verification
  },

  // Frontend configuration
  frontend: {
    defaultNetwork: "hedera-testnet",
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    supportedChainIds: [296, 1337], // Hedera testnet, local
  },
};
