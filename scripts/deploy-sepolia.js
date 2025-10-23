/**
 * Deploy QuadraX contracts to Ethereum Sepolia with PYUSD integration
 * Targets PayPal PYUSD hackathon requirements
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Official PYUSD contract on Sepolia
const PYUSD_SEPOLIA_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

async function main() {
  console.log("🚀 Deploying QuadraX to Ethereum Sepolia...");
  console.log("=" .repeat(60));

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.warn("⚠️  Low ETH balance! Get Sepolia ETH from faucet: https://sepoliafaucet.com/");
  }

  // Deploy TicTacToe game contract
  console.log("\n📦 Deploying TicTacToe contract...");
  const TicTacToe = await ethers.getContractFactory("TicTacToe");
  const ticTacToe = await TicTacToe.deploy();
  await ticTacToe.waitForDeployment();
  const ticTacToeAddress = await ticTacToe.getAddress();
  console.log("✅ TicTacToe deployed to:", ticTacToeAddress);

  // Deploy PYUSDStaking contract
  console.log("\n📦 Deploying PYUSDStaking contract...");
  const platformWallet = deployer.address; // Use deployer as platform wallet for now
  
  const PYUSDStaking = await ethers.getContractFactory("PYUSDStaking");
  const stakingContract = await PYUSDStaking.deploy(
    PYUSD_SEPOLIA_ADDRESS,
    platformWallet
  );
  await stakingContract.waitForDeployment();
  const stakingAddress = await stakingContract.getAddress();
  console.log("✅ PYUSDStaking deployed to:", stakingAddress);

  // Verify contract configuration
  console.log("\n🔍 Verifying contract configuration...");
  const pyusdToken = await stakingContract.pyusdToken();
  const platformAddr = await stakingContract.platformWallet();
  const minStake = await stakingContract.MIN_STAKE();
  const platformFee = await stakingContract.platformFee();

  console.log("   PYUSD Token:", pyusdToken);
  console.log("   Platform Wallet:", platformAddr);
  console.log("   Min Stake:", ethers.formatUnits(minStake, 6), "PYUSD");
  console.log("   Platform Fee:", platformFee, "basis points (", platformFee / 100, "%)");

  // Save deployment information
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TicTacToe: ticTacToeAddress,
      PYUSDStaking: stakingAddress,
      PYUSD: PYUSD_SEPOLIA_ADDRESS,
    },
    configuration: {
      platformWallet: platformAddr,
      minStake: minStake.toString(),
      platformFee: platformFee.toString(),
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, "sepolia.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📁 Deployment info saved to:", deploymentFile);

  // Generate environment variables
  console.log("\n📝 Environment Variables for Frontend:");
  console.log("=".repeat(50));
  console.log(`NEXT_PUBLIC_SEPOLIA_TICTACTOE=${ticTacToeAddress}`);
  console.log(`NEXT_PUBLIC_SEPOLIA_STAKING=${stakingAddress}`);
  console.log(`NEXT_PUBLIC_PYUSD_SEPOLIA=${PYUSD_SEPOLIA_ADDRESS}`);
  console.log(`NEXT_PUBLIC_PRIMARY_CHAIN=sepolia`);

  // Explorer links
  console.log("\n🔗 Etherscan Links:");
  console.log(`   TicTacToe: https://sepolia.etherscan.io/address/${ticTacToeAddress}`);
  console.log(`   Staking: https://sepolia.etherscan.io/address/${stakingAddress}`);
  console.log(`   PYUSD: https://sepolia.etherscan.io/address/${PYUSD_SEPOLIA_ADDRESS}`);

  console.log("\n🎉 Deployment Complete!");
  console.log("📋 Next Steps:");
  console.log("   1. Add environment variables to your .env file");
  console.log("   2. Test PYUSD approval and staking functions");
  console.log("   3. Verify contracts on Etherscan (optional)");
  console.log("   4. Fund test accounts with PYUSD for testing");

  return {
    ticTacToe: ticTacToeAddress,
    staking: stakingAddress,
    pyusd: PYUSD_SEPOLIA_ADDRESS
  };
}

// Handle deployment errors
main()
  .then((addresses) => {
    console.log("\n✅ All contracts deployed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });