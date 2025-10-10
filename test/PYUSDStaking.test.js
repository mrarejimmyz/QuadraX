const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PYUSDStaking", function () {
  let stakingContract;
  let mockPYUSD;
  let owner, player1, player2, platformWallet;

  const INITIAL_BALANCE = ethers.parseUnits("1000", 6); // 1000 PYUSD
  const MIN_STAKE = ethers.parseUnits("1", 6); // 1 PYUSD

  beforeEach(async function () {
    [owner, player1, player2, platformWallet] = await ethers.getSigners();

    // Deploy mock PYUSD token (ERC20)
    const MockERC20 = await ethers.getContractFactory("contracts/test/MockERC20.sol:MockERC20");
    mockPYUSD = await MockERC20.deploy("Mock PYUSD", "PYUSD", 6);
    await mockPYUSD.waitForDeployment();

    // Mint tokens to players
    await mockPYUSD.mint(player1.address, INITIAL_BALANCE);
    await mockPYUSD.mint(player2.address, INITIAL_BALANCE);

    // Deploy staking contract
    const PYUSDStaking = await ethers.getContractFactory("PYUSDStaking");
    stakingContract = await PYUSDStaking.deploy(
      await mockPYUSD.getAddress(),
      platformWallet.address
    );
    await stakingContract.waitForDeployment();
  });

  describe("Contract Deployment", function () {
    it("Should set correct PYUSD token address", async function () {
      expect(await stakingContract.pyusdToken()).to.equal(await mockPYUSD.getAddress());
    });

    it("Should set correct platform wallet", async function () {
      expect(await stakingContract.platformWallet()).to.equal(platformWallet.address);
    });

    it("Should set correct minimum stake", async function () {
      expect(await stakingContract.MIN_STAKE()).to.equal(MIN_STAKE);
    });

    it("Should set initial platform fee", async function () {
      expect(await stakingContract.platformFee()).to.equal(25); // 0.25%
    });
  });

  describe("Game Creation", function () {
    it("Should create a new game", async function () {
      const tx = await stakingContract.connect(player1).createGame(player2.address);
      await tx.wait();

      const gameDetails = await stakingContract.getGameDetails(0);
      expect(gameDetails.player1).to.equal(player1.address);
      expect(gameDetails.player2).to.equal(player2.address);
      expect(gameDetails.gameStarted).to.be.false;
      expect(gameDetails.gameEnded).to.be.false;
    });

    it("Should increment game counter", async function () {
      await stakingContract.connect(player1).createGame(player2.address);
      expect(await stakingContract.gameCounter()).to.equal(1);

      await stakingContract.connect(player1).createGame(player2.address);
      expect(await stakingContract.gameCounter()).to.equal(2);
    });

    it("Should not allow creating game against yourself", async function () {
      await expect(
        stakingContract.connect(player1).createGame(player1.address)
      ).to.be.revertedWith("Cannot play against yourself");
    });

    it("Should emit GameCreated event", async function () {
      await expect(stakingContract.connect(player1).createGame(player2.address))
        .to.emit(stakingContract, "GameCreated")
        .withArgs(0, player1.address, player2.address);
    });
  });

  describe("Staking", function () {
    let gameId;

    beforeEach(async function () {
      const tx = await stakingContract.connect(player1).createGame(player2.address);
      await tx.wait();
      gameId = 0;
    });

    it("Should allow player1 to stake", async function () {
      const stakeAmount = ethers.parseUnits("5", 6);

      // Approve staking contract to spend tokens
      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stakeAmount);

      // Stake
      await stakingContract.connect(player1).stake(gameId, stakeAmount);

      const gameDetails = await stakingContract.getGameDetails(gameId);
      expect(gameDetails.player1Stake).to.equal(stakeAmount);
      expect(gameDetails.totalPot).to.equal(stakeAmount);
    });

    it("Should allow player2 to stake", async function () {
      const stakeAmount = ethers.parseUnits("5", 6);

      // Player 1 stakes first
      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player1).stake(gameId, stakeAmount);

      // Player 2 stakes
      await mockPYUSD.connect(player2).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player2).stake(gameId, stakeAmount);

      const gameDetails = await stakingContract.getGameDetails(gameId);
      expect(gameDetails.player2Stake).to.equal(stakeAmount);
      expect(gameDetails.totalPot).to.equal(stakeAmount * 2n);
    });

    it("Should start game when both players have staked", async function () {
      const stakeAmount = ethers.parseUnits("5", 6);

      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player1).stake(gameId, stakeAmount);

      await mockPYUSD.connect(player2).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player2).stake(gameId, stakeAmount);

      const gameDetails = await stakingContract.getGameDetails(gameId);
      expect(gameDetails.gameStarted).to.be.true;
    });

    it("Should not allow staking below minimum", async function () {
      const lowStake = ethers.parseUnits("0.5", 6);

      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), lowStake);
      await expect(
        stakingContract.connect(player1).stake(gameId, lowStake)
      ).to.be.revertedWith("Stake below minimum");
    });

    it("Should not allow staking twice", async function () {
      const stakeAmount = ethers.parseUnits("5", 6);

      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stakeAmount * 2n);
      await stakingContract.connect(player1).stake(gameId, stakeAmount);

      await expect(
        stakingContract.connect(player1).stake(gameId, stakeAmount)
      ).to.be.revertedWith("Already staked");
    });

    it("Should emit PlayerStaked and GameStarted events", async function () {
      const stakeAmount = ethers.parseUnits("5", 6);

      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stakeAmount);
      await expect(stakingContract.connect(player1).stake(gameId, stakeAmount))
        .to.emit(stakingContract, "PlayerStaked")
        .withArgs(gameId, player1.address, stakeAmount);

      await mockPYUSD.connect(player2).approve(await stakingContract.getAddress(), stakeAmount);
      await expect(stakingContract.connect(player2).stake(gameId, stakeAmount))
        .to.emit(stakingContract, "GameStarted")
        .withArgs(gameId, stakeAmount * 2n);
    });
  });

  describe("Winner Payout", function () {
    let gameId;
    const stakeAmount = ethers.parseUnits("10", 6);

    beforeEach(async function () {
      // Create game and both players stake
      const tx = await stakingContract.connect(player1).createGame(player2.address);
      await tx.wait();
      gameId = 0;

      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player1).stake(gameId, stakeAmount);

      await mockPYUSD.connect(player2).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player2).stake(gameId, stakeAmount);
    });

    it("Should pay winner correctly with fee deduction", async function () {
      const contractAddress = await stakingContract.getAddress();
      const initialBalance = await mockPYUSD.balanceOf(player1.address);

      // Declare winner
      await stakingContract.declareWinner(gameId, player1.address);

      const finalBalance = await mockPYUSD.balanceOf(player1.address);
      const totalPot = stakeAmount * 2n;
      const fee = (totalPot * 25n) / 10000n; // 0.25%
      const expectedPayout = totalPot - fee;

      expect(finalBalance - initialBalance).to.equal(expectedPayout);
    });

    it("Should accumulate platform fees", async function () {
      await stakingContract.declareWinner(gameId, player1.address);

      const totalPot = stakeAmount * 2n;
      const expectedFee = (totalPot * 25n) / 10000n;

      expect(await stakingContract.accumulatedFees()).to.equal(expectedFee);
    });

    it("Should mark game as ended", async function () {
      await stakingContract.declareWinner(gameId, player1.address);

      const gameDetails = await stakingContract.getGameDetails(gameId);
      expect(gameDetails.gameEnded).to.be.true;
      expect(gameDetails.winner).to.equal(player1.address);
    });

    it("Should not allow declaring winner twice", async function () {
      await stakingContract.declareWinner(gameId, player1.address);

      await expect(
        stakingContract.declareWinner(gameId, player1.address)
      ).to.be.revertedWith("Game already ended");
    });

    it("Should emit WinnerPaid event", async function () {
      const totalPot = stakeAmount * 2n;
      const fee = (totalPot * 25n) / 10000n;
      const expectedPayout = totalPot - fee;

      await expect(stakingContract.declareWinner(gameId, player1.address))
        .to.emit(stakingContract, "WinnerPaid")
        .withArgs(gameId, player1.address, expectedPayout);
    });
  });

  describe("Tie Handling", function () {
    let gameId;
    const stake1 = ethers.parseUnits("10", 6);
    const stake2 = ethers.parseUnits("15", 6);

    beforeEach(async function () {
      const tx = await stakingContract.connect(player1).createGame(player2.address);
      await tx.wait();
      gameId = 0;

      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stake1);
      await stakingContract.connect(player1).stake(gameId, stake1);

      await mockPYUSD.connect(player2).approve(await stakingContract.getAddress(), stake2);
      await stakingContract.connect(player2).stake(gameId, stake2);
    });

    it("Should refund both players on tie", async function () {
      const player1Before = await mockPYUSD.balanceOf(player1.address);
      const player2Before = await mockPYUSD.balanceOf(player2.address);

      await stakingContract.declareTie(gameId);

      const player1After = await mockPYUSD.balanceOf(player1.address);
      const player2After = await mockPYUSD.balanceOf(player2.address);

      expect(player1After - player1Before).to.equal(stake1);
      expect(player2After - player2Before).to.equal(stake2);
    });

    it("Should mark game as tie", async function () {
      await stakingContract.declareTie(gameId);

      const gameDetails = await stakingContract.getGameDetails(gameId);
      expect(gameDetails.isTie).to.be.true;
      expect(gameDetails.gameEnded).to.be.true;
    });

    it("Should emit TieRefunded event", async function () {
      await expect(stakingContract.declareTie(gameId))
        .to.emit(stakingContract, "TieRefunded")
        .withArgs(gameId, stake1, stake2);
    });
  });

  describe("Fee Management", function () {
    it("Should allow platform to update fee", async function () {
      await stakingContract.connect(platformWallet).updateFee(50); // 0.5%
      expect(await stakingContract.platformFee()).to.equal(50);
    });

    it("Should not allow non-platform to update fee", async function () {
      await expect(
        stakingContract.connect(player1).updateFee(50)
      ).to.be.revertedWith("Only platform can update fee");
    });

    it("Should not allow fee above 5%", async function () {
      await expect(
        stakingContract.connect(platformWallet).updateFee(501)
      ).to.be.revertedWith("Fee too high (max 5%)");
    });

    it("Should allow platform to withdraw fees", async function () {
      // Create and complete a game to accumulate fees
      const tx = await stakingContract.connect(player1).createGame(player2.address);
      await tx.wait();
      const gameId = 0;

      const stakeAmount = ethers.parseUnits("10", 6);
      await mockPYUSD.connect(player1).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player1).stake(gameId, stakeAmount);

      await mockPYUSD.connect(player2).approve(await stakingContract.getAddress(), stakeAmount);
      await stakingContract.connect(player2).stake(gameId, stakeAmount);

      await stakingContract.declareWinner(gameId, player1.address);

      const accumulatedFees = await stakingContract.accumulatedFees();
      const platformBefore = await mockPYUSD.balanceOf(platformWallet.address);

      await stakingContract.connect(platformWallet).withdrawFees();

      const platformAfter = await mockPYUSD.balanceOf(platformWallet.address);
      expect(platformAfter - platformBefore).to.equal(accumulatedFees);
      expect(await stakingContract.accumulatedFees()).to.equal(0);
    });
  });
});
