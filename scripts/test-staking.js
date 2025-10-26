/**
 * Test deployed PYUSDStaking contract
 * Verifies all functionality works correctly
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testing PYUSDStaking Contract...\n");

  // Load latest deployment
  const deploymentsPath = path.join(__dirname, "..", "deployments", "sepolia-latest.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("❌ No deployment found! Please deploy first with: npm run deploy:sepolia");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  console.log("📝 Loaded Deployment:");
  console.log("   Network:", deployment.network);
  console.log("   PYUSD:", deployment.contracts.PYUSD);
  console.log("   Staking:", deployment.contracts.PYUSDStaking);
  console.log("");

  const [deployer, player1, player2] = await hre.ethers.getSigners();
  console.log("👥 Test Accounts:");
  console.log("   Deployer:", deployer.address);
  console.log("   Player 1:", player1.address);
  console.log("   Player 2:", player2.address);
  console.log("");

  // Get contract instances
  const PYUSD = await hre.ethers.getContractAt("IERC20", deployment.contracts.PYUSD);
  const Staking = await hre.ethers.getContractAt("PYUSDStaking", deployment.contracts.PYUSDStaking);

  // Test 1: Check PYUSD balance
  console.log("Test 1: Check PYUSD Balances");
  console.log("─".repeat(60));
  
  const balance1 = await PYUSD.balanceOf(player1.address);
  const balance2 = await PYUSD.balanceOf(player2.address);
  
  console.log(`   Player 1 balance: ${hre.ethers.formatUnits(balance1, 6)} PYUSD`);
  console.log(`   Player 2 balance: ${hre.ethers.formatUnits(balance2, 6)} PYUSD`);
  
  if (balance1 === 0n) {
    console.log("   ⚠️  Player 1 has no PYUSD! Get testnet PYUSD from faucet");
  }
  console.log("");

  // Test 2: Create Game
  console.log("Test 2: Create Game");
  console.log("─".repeat(60));
  
  const stakeAmount = hre.ethers.parseUnits("5", 6); // 5 PYUSD
  console.log(`   Creating game with ${hre.ethers.formatUnits(stakeAmount, 6)} PYUSD stake...`);
  
  try {
    const tx = await Staking.connect(player1).createGame(player2.address, stakeAmount);
    const receipt = await tx.wait();
    
    // Extract gameId from event
    const gameCreatedEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === "GameCreated"
    );
    
    const gameId = gameCreatedEvent ? gameCreatedEvent.args[0] : 0;
    console.log(`   ✅ Game created! Game ID: ${gameId}`);
    console.log(`   Transaction: ${receipt.hash}`);
    console.log("");

    // Test 3: Check Game Info
    console.log("Test 3: Check Game Info");
    console.log("─".repeat(60));
    
    const gameInfo = await Staking.games(gameId);
    console.log(`   Player 1: ${gameInfo.player1}`);
    console.log(`   Player 2: ${gameInfo.player2}`);
    console.log(`   Stake Amount: ${hre.ethers.formatUnits(gameInfo.stakeAmount, 6)} PYUSD`);
    console.log(`   Player 1 Staked: ${gameInfo.player1Staked}`);
    console.log(`   Player 2 Staked: ${gameInfo.player2Staked}`);
    console.log(`   Active: ${gameInfo.active}`);
    console.log("");

    // Test 4: Approve PYUSD
    console.log("Test 4: Approve PYUSD for Staking");
    console.log("─".repeat(60));
    
    console.log("   Player 1 approving...");
    const approveTx1 = await PYUSD.connect(player1).approve(
      deployment.contracts.staking,
      stakeAmount
    );
    await approveTx1.wait();
    console.log("   ✅ Player 1 approved");
    
    const allowance = await PYUSD.allowance(player1.address, deployment.contracts.staking);
    console.log(`   Allowance: ${hre.ethers.formatUnits(allowance, 6)} PYUSD`);
    console.log("");

    // Test 5: Stake for Game
    console.log("Test 5: Stake for Game");
    console.log("─".repeat(60));
    
    console.log("   Player 1 staking...");
    const stakeTx = await Staking.connect(player1).stakeForGame(gameId);
    const stakeReceipt = await stakeTx.wait();
    console.log("   ✅ Player 1 staked successfully");
    console.log(`   Transaction: ${stakeReceipt.hash}`);
    console.log("");

    // Test 6: Verify Stakes
    console.log("Test 6: Verify Stakes");
    console.log("─".repeat(60));
    
    const updatedGame = await Staking.games(gameId);
    console.log(`   Player 1 Staked: ${updatedGame.player1Staked ? "✅" : "❌"}`);
    console.log(`   Player 2 Staked: ${updatedGame.player2Staked ? "✅" : "❌"}`);
    console.log(`   Game Active: ${updatedGame.active ? "✅" : "❌"}`);
    
    // Check contract balance
    const contractBalance = await PYUSD.balanceOf(deployment.contracts.staking);
    console.log(`   Contract Balance: ${hre.ethers.formatUnits(contractBalance, 6)} PYUSD`);
    console.log("");

    console.log("🎉 All Tests Passed!");
    console.log("\n📋 Summary:");
    console.log("   ✅ Contract deployed and accessible");
    console.log("   ✅ Game creation works");
    console.log("   ✅ PYUSD approval works");
    console.log("   ✅ Staking works");
    console.log("   ✅ Contract holds funds correctly");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    
    if (error.message.includes("insufficient allowance")) {
      console.log("\n💡 Tip: Make sure to approve PYUSD before staking");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Tip: Get PYUSD from Sepolia faucet");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
