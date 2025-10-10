const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TicTacToe", function () {
  let ticTacToe;
  let player1, player2, other;

  beforeEach(async function () {
    [player1, player2, other] = await ethers.getSigners();
    const TicTacToe = await ethers.getContractFactory("TicTacToe");
    ticTacToe = await TicTacToe.deploy();
    await ticTacToe.waitForDeployment();
  });

  describe("Game Creation", function () {
    it("Should create a new game", async function () {
      await ticTacToe.connect(player1).createGame(player2.address, false);

      const status = await ticTacToe.getGameStatus();
      expect(status.active).to.be.true;
      expect(await ticTacToe.player1()).to.equal(player1.address);
      expect(await ticTacToe.player2()).to.equal(player2.address);
      expect(await ticTacToe.currentPlayer()).to.equal(player1.address);
    });

    it("Should not allow creating game against yourself", async function () {
      await expect(
        ticTacToe.connect(player1).createGame(player1.address, false)
      ).to.be.revertedWith("Cannot play against yourself");
    });

    it("Should not allow creating game when one is active", async function () {
      await ticTacToe.connect(player1).createGame(player2.address, false);
      await expect(
        ticTacToe.connect(player1).createGame(other.address, false)
      ).to.be.revertedWith("Game already in progress");
    });
  });

  describe("Making Moves", function () {
    beforeEach(async function () {
      await ticTacToe.connect(player1).createGame(player2.address, false);
    });

    it("Should allow player1 to make first move", async function () {
      await ticTacToe.connect(player1).makeMove(0);
      const board = await ticTacToe.getBoard();
      expect(board[0]).to.equal(1);
    });

    it("Should not allow playing out of turn", async function () {
      await expect(
        ticTacToe.connect(player2).makeMove(0)
      ).to.be.revertedWith("Not your turn");
    });

    it("Should not allow move on occupied position", async function () {
      await ticTacToe.connect(player1).makeMove(0);
      await expect(
        ticTacToe.connect(player2).makeMove(0)
      ).to.be.revertedWith("Position already taken");
    });

    it("Should alternate turns", async function () {
      await ticTacToe.connect(player1).makeMove(0);
      expect(await ticTacToe.currentPlayer()).to.equal(player2.address);

      await ticTacToe.connect(player2).makeMove(1);
      expect(await ticTacToe.currentPlayer()).to.equal(player1.address);
    });

    it("Should not allow invalid position", async function () {
      await expect(
        ticTacToe.connect(player1).makeMove(16)
      ).to.be.revertedWith("Invalid position");
    });
  });

  describe("Win Conditions", function () {
    beforeEach(async function () {
      await ticTacToe.connect(player1).createGame(player2.address, false);
    });

    it("Should detect horizontal win (row 0)", async function () {
      await ticTacToe.connect(player1).makeMove(0);
      await ticTacToe.connect(player2).makeMove(4);
      await ticTacToe.connect(player1).makeMove(1);
      await ticTacToe.connect(player2).makeMove(5);
      await ticTacToe.connect(player1).makeMove(2);
      await ticTacToe.connect(player2).makeMove(6);
      await ticTacToe.connect(player1).makeMove(3);

      expect(await ticTacToe.winner()).to.equal(player1.address);
      const status = await ticTacToe.getGameStatus();
      expect(status.active).to.be.false;
    });

    it("Should detect vertical win (column 0)", async function () {
      await ticTacToe.connect(player1).makeMove(0);
      await ticTacToe.connect(player2).makeMove(1);
      await ticTacToe.connect(player1).makeMove(4);
      await ticTacToe.connect(player2).makeMove(2);
      await ticTacToe.connect(player1).makeMove(8);
      await ticTacToe.connect(player2).makeMove(3);
      await ticTacToe.connect(player1).makeMove(12);

      expect(await ticTacToe.winner()).to.equal(player1.address);
      const status = await ticTacToe.getGameStatus();
      expect(status.active).to.be.false;
    });

    it("Should detect diagonal win (top-left to bottom-right)", async function () {
      await ticTacToe.connect(player1).makeMove(0);
      await ticTacToe.connect(player2).makeMove(1);
      await ticTacToe.connect(player1).makeMove(5);
      await ticTacToe.connect(player2).makeMove(2);
      await ticTacToe.connect(player1).makeMove(10);
      await ticTacToe.connect(player2).makeMove(3);
      await ticTacToe.connect(player1).makeMove(15);

      expect(await ticTacToe.winner()).to.equal(player1.address);
      const status = await ticTacToe.getGameStatus();
      expect(status.active).to.be.false;
    });
  });

  describe("Game Reset", function () {
    it("Should allow reset after game ends", async function () {
      await ticTacToe.connect(player1).createGame(player2.address, false);

      // Quick win
      await ticTacToe.connect(player1).makeMove(0);
      await ticTacToe.connect(player2).makeMove(4);
      await ticTacToe.connect(player1).makeMove(1);
      await ticTacToe.connect(player2).makeMove(5);
      await ticTacToe.connect(player1).makeMove(2);
      await ticTacToe.connect(player2).makeMove(6);
      await ticTacToe.connect(player1).makeMove(3);

      await ticTacToe.connect(player1).resetGame();

      const status = await ticTacToe.getGameStatus();
      expect(status.active).to.be.true;
      expect(status.winnerAddr).to.equal(ethers.ZeroAddress);
      expect(status.moves).to.equal(0);
    });

    it("Should not allow reset during active game", async function () {
      await ticTacToe.connect(player1).createGame(player2.address, false);
      await expect(
        ticTacToe.connect(player1).resetGame()
      ).to.be.revertedWith("Cannot reset active game");
    });
  });
});
