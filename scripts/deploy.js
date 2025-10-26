const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const config = require("../config");

/**
 * Deploy QuadraX contracts with new modular structure
 */
async function main() {
  console.log("🚀 Starting QuadraX deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("📝 Deployment Configuration:");
  console.log("   Network:", hre.network.name);
  console.log("   Deployer:", deployer.address);
  console.log("   Balance:", hre.ethers.formatEther(balance), "HBAR/ETH\n");

  const deployedContracts = {};
  const networkName = hre.network.name;
  const isLocal = networkName === "localhost" || networkName === "hardhat";

  // Deploy TicTacToe contract
  console.log("📦 Deploying TicTacToe (with GameLogic library)...");
  const TicTacToe = await hre.ethers.getContractFactory("TicTacToe");
  const ticTacToe = await TicTacToe.deploy();
  await ticTacToe.waitForDeployment();
  const ticTacToeAddress = await ticTacToe.getAddress();
  deployedContracts.ticTacToe = ticTacToeAddress;
  console.log("✅ TicTacToe deployed to:", ticTacToeAddress);

  // Deploy or use existing PYUSD token
  let pyusdAddress;
  if (isLocal) {
    console.log("\n📦 Deploying Mock PYUSD token (for testing)...");
    const MockERC20 = await hre.ethers.getContractFactory(config.contracts.mockPYUSD.name);
    const mockPYUSD = await MockERC20.deploy(...config.contracts.mockPYUSD.constructor);
    await mockPYUSD.waitForDeployment();
    pyusdAddress = await mockPYUSD.getAddress();
    deployedContracts.pyusd = pyusdAddress;
    console.log("✅ Mock PYUSD deployed to:", pyusdAddress);

    // Mint test tokens
    console.log("\n💵 Minting test tokens...");
    const mintAmount = hre.ethers.parseUnits(
      config.contracts.mockPYUSD.initialMint,
      config.testing.testPYUSDDecimals
    );
    await mockPYUSD.mint(deployer.address, mintAmount);
    console.log(`✅ Minted ${config.contracts.mockPYUSD.initialMint} test PYUSD to deployer`);
  } else {
    pyusdAddress = process.env.PYUSD_TOKEN_ADDRESS;
    if (!pyusdAddress) {
      throw new Error("❌ PYUSD_TOKEN_ADDRESS not set in .env file for mainnet deployment");
    }
    deployedContracts.pyusd = pyusdAddress;
    console.log("\n📝 Using PYUSD token at:", pyusdAddress);
  }

  // Set platform wallet and referee
  const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
  const refereeWallet = process.env.REFEREE_WALLET || deployer.address;
  
  console.log("\n📝 Platform Configuration:");
  console.log("   Platform Wallet:", platformWallet);
  console.log("   AI Referee Wallet:", refereeWallet);
  console.log("   Platform Fee:", config.platform.feePercentage + "%");
  console.log("   Min Stake:", config.platform.minStakeAmount, "PYUSD");

  // Deploy PYUSDStaking contract
  console.log("\n📦 Deploying PYUSDStaking contract...");
  console.log("   🤖 AI Referee will be the ONLY entity allowed to declare winners");
  const PYUSDStaking = await hre.ethers.getContractFactory("PYUSDStaking");
  const staking = await PYUSDStaking.deploy(pyusdAddress, platformWallet, refereeWallet);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  deployedContracts.staking = stakingAddress;
  console.log("✅ PYUSDStaking deployed to:", stakingAddress);
  console.log("   🔒 Only referee", refereeWallet, "can declare winners");

  // Save deployment information
  if (config.deployment.saveDeployments) {
    const deployment = {
      network: networkName,
      chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
      deployer: deployer.address,
      contracts: deployedContracts,
      platformWallet: platformWallet,
      refereeWallet: refereeWallet,
      platformFee: config.platform.feeBasisPoints,
      minStake: config.platform.minStakeAmount,
      deployedAt: new Date().toISOString(),
      version: "2.0.0",
    };

    const deploymentsPath = path.join(__dirname, "..", config.deployment.deploymentsPath);
    if (!fs.existsSync(deploymentsPath)) {
      fs.mkdirSync(deploymentsPath, { recursive: true });
    }

    const filename = `${networkName}-${Date.now()}.json`;
    const filepath = path.join(deploymentsPath, filename);
    fs.writeFileSync(filepath, JSON.stringify(deployment, null, 2));

    // Save as latest
    const latestPath = path.join(deploymentsPath, `${networkName}-latest.json`);
    fs.writeFileSync(latestPath, JSON.stringify(deployment, null, 2));

    console.log("\n📄 Deployment info saved:");
    console.log("   File:", filename);
    console.log("   Latest:", `${networkName}-latest.json`);
  }

  // Generate frontend environment variables
  console.log("\n" + "=".repeat(60));
  console.log("📋 Frontend Environment Variables (.env.local):");
  console.log("=".repeat(60));
  console.log(`NEXT_PUBLIC_TICTACTOE_CONTRACT=${ticTacToeAddress}`);
  console.log(`NEXT_PUBLIC_STAKING_CONTRACT=${stakingAddress}`);
  console.log(`NEXT_PUBLIC_PYUSD_TOKEN=${pyusdAddress}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=${(await hre.ethers.provider.getNetwork()).chainId}`);
  if (networkName === "hedera-testnet") {
    console.log(`NEXT_PUBLIC_HEDERA_RPC_URL=https://testnet.hashio.io/api`);
  }
  console.log("=".repeat(60));

  // Verify contracts on explorer (if not local)
  if (!isLocal && config.deployment.verifyContracts) {
    console.log("\n⏳ Waiting before contract verification...");
    await new Promise(resolve => setTimeout(resolve, config.deployment.verifyDelay));

    console.log("\n🔍 Verifying contracts...");

    try {
      console.log("   Verifying TicTacToe...");
      await hre.run("verify:verify", {
        address: ticTacToeAddress,
        constructorArguments: [],
      });
      console.log("   ✅ TicTacToe verified");
    } catch (error) {
      console.log("   ⚠️  TicTacToe verification failed:", error.message);
    }

    try {
      console.log("   Verifying PYUSDStaking...");
      await hre.run("verify:verify", {
        address: stakingAddress,
        constructorArguments: [pyusdAddress, platformWallet],
      });
      console.log("   ✅ PYUSDStaking verified");
    } catch (error) {
      console.log("   ⚠️  PYUSDStaking verification failed:", error.message);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 Deployment Complete!");
  console.log("=".repeat(60));
  console.log("\n📊 Deployed Contracts:");
  console.log(`   TicTacToe: ${ticTacToeAddress}`);
  console.log(`   PYUSDStaking: ${stakingAddress}`);
  console.log(`   PYUSD Token: ${pyusdAddress}`);

  if (networkName === "hedera-testnet") {
    console.log("\n🔗 Explorer Links:");
    console.log(`   TicTacToe: https://hashscan.io/testnet/contract/${ticTacToeAddress}`);
    console.log(`   Staking: https://hashscan.io/testnet/contract/${stakingAddress}`);
  }

  console.log("\n📝 Next Steps:");
  console.log("   1. Copy environment variables to frontend/.env.local");
  console.log("   2. Test contract interactions");
  console.log("   3. Deploy frontend to Vercel");
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
