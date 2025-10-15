// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/GameLogic.sol";
import "../interfaces/IGame.sol";

/**
 * @title TicTacToe
 * @dev 4x4 Tic-Tac-Toe with modular library architecture
 * @notice Core game logic for QuadraX - ETHOnline 2025
 */
contract TicTacToe is IGame {
    using GameLogic for uint8[16];

    // Board state
    uint8[16] public board;

    // Player addresses
    address public player1;
    address public player2;
    address public currentPlayer;
    address public winner;

    // Game state
    bool public gameActive;
    bool public isAIGame;
    uint256 public moveCount;

    modifier onlyPlayers() {
        require(
            msg.sender == player1 || msg.sender == player2,
            "Not a player in this game"
        );
        _;
    }

    modifier onlyCurrentPlayer() {
        require(msg.sender == currentPlayer, "Not your turn");
        _;
    }

    modifier gameIsActive() {
        require(gameActive, "Game is not active");
        _;
    }

    /**
     * @inheritdoc IGame
     */
    function createGame(address _player2, bool _isAI) external override {
        require(!gameActive, "Game already in progress");
        require(_player2 != address(0), "Invalid player2 address");
        require(_player2 != msg.sender, "Cannot play against yourself");

        player1 = msg.sender;
        player2 = _player2;
        currentPlayer = player1;
        gameActive = true;
        isAIGame = _isAI;
        winner = address(0);
        moveCount = 0;

        // Reset board
        for (uint8 i = 0; i < 16; i++) {
            board[i] = 0;
        }

        emit GameCreated(player1, player2, _isAI);
    }

    /**
     * @inheritdoc IGame
     */
    function makeMove(uint8 position) external override onlyPlayers onlyCurrentPlayer gameIsActive {
        require(GameLogic.isValidPosition(position), "Invalid position");
        require(GameLogic.isCellEmpty(board, position), "Position already taken");

        // Determine player symbol
        uint8 symbol = (msg.sender == player1) ? 1 : 2;
        board[position] = symbol;
        moveCount++;

        emit MoveMade(msg.sender, position, symbol);

        // Check for winner
        if (GameLogic.checkWinner(board, symbol)) {
            winner = msg.sender;
            gameActive = false;
            emit GameWon(msg.sender);
            return;
        }

        // Check for tie
        if (moveCount == 16) {
            gameActive = false;
            emit GameTied();
            return;
        }

        // Switch turns
        currentPlayer = (currentPlayer == player1) ? player2 : player1;
    }

    /**
     * @inheritdoc IGame
     */
    function resetGame() external override {
        require(!gameActive, "Cannot reset active game");
        require(
            msg.sender == player1 || msg.sender == player2,
            "Only players can reset"
        );

        for (uint8 i = 0; i < 16; i++) {
            board[i] = 0;
        }

        currentPlayer = player1;
        winner = address(0);
        moveCount = 0;
        gameActive = true;

        emit GameReset();
    }

    /**
     * @inheritdoc IGame
     */
    function getBoard() external view override returns (uint8[16] memory) {
        return board;
    }

    /**
     * @inheritdoc IGame
     */
    function getGameStatus() external view override returns (
        bool active,
        address current,
        address winnerAddr,
        uint256 moves
    ) {
        return (gameActive, currentPlayer, winner, moveCount);
    }
}
