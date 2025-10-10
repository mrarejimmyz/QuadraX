// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TicTacToe
 * @dev 4x4 Tic-Tac-Toe game contract with win validation
 * @notice Core game logic for QuadraX - ETHOnline 2024
 */
contract TicTacToe {
    // Board is represented as a 1D array of 16 cells (4x4)
    // 0 = empty, 1 = player1 (X), 2 = player2 (O)
    uint8[16] public board;

    address public player1;
    address public player2;
    address public currentPlayer;
    address public winner;

    bool public gameActive;
    bool public isAIGame; // Track if player2 is an AI agent
    uint256 public moveCount;

    event GameCreated(address indexed player1, address indexed player2, bool isAI);
    event MoveMade(address indexed player, uint8 position, uint8 symbol);
    event GameWon(address indexed winner);
    event GameTied();
    event GameReset();

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
     * @dev Initialize a new game
     * @param _player2 Address of second player (can be AI agent address)
     * @param _isAI Whether player2 is an AI agent
     */
    function createGame(address _player2, bool _isAI) external {
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
     * @dev Make a move on the board
     * @param position Position on board (0-15)
     */
    function makeMove(uint8 position) external onlyPlayers onlyCurrentPlayer gameIsActive {
        require(position < 16, "Invalid position");
        require(board[position] == 0, "Position already taken");

        // Determine player symbol (1 for player1, 2 for player2)
        uint8 symbol = (msg.sender == player1) ? 1 : 2;
        board[position] = symbol;
        moveCount++;

        emit MoveMade(msg.sender, position, symbol);

        // Check for winner
        if (checkWinner(symbol)) {
            winner = msg.sender;
            gameActive = false;
            emit GameWon(msg.sender);
            return;
        }

        // Check for tie (all 16 positions filled)
        if (moveCount == 16) {
            gameActive = false;
            emit GameTied();
            return;
        }

        // Switch turns
        currentPlayer = (currentPlayer == player1) ? player2 : player1;
    }

    /**
     * @dev Check if current player has won
     * @param symbol Player's symbol (1 or 2)
     * @return bool True if player has won
     */
    function checkWinner(uint8 symbol) internal view returns (bool) {
        // Check rows
        for (uint8 row = 0; row < 4; row++) {
            if (
                board[row * 4] == symbol &&
                board[row * 4 + 1] == symbol &&
                board[row * 4 + 2] == symbol &&
                board[row * 4 + 3] == symbol
            ) {
                return true;
            }
        }

        // Check columns
        for (uint8 col = 0; col < 4; col++) {
            if (
                board[col] == symbol &&
                board[col + 4] == symbol &&
                board[col + 8] == symbol &&
                board[col + 12] == symbol
            ) {
                return true;
            }
        }

        // Check diagonal (top-left to bottom-right)
        if (
            board[0] == symbol &&
            board[5] == symbol &&
            board[10] == symbol &&
            board[15] == symbol
        ) {
            return true;
        }

        // Check diagonal (top-right to bottom-left)
        if (
            board[3] == symbol &&
            board[6] == symbol &&
            board[9] == symbol &&
            board[12] == symbol
        ) {
            return true;
        }

        return false;
    }

    /**
     * @dev Get current board state
     * @return uint8[16] Current board configuration
     */
    function getBoard() external view returns (uint8[16] memory) {
        return board;
    }

    /**
     * @dev Get game status
     * @return bool active, address current, address winnerAddr, uint256 moves
     */
    function getGameStatus() external view returns (
        bool active,
        address current,
        address winnerAddr,
        uint256 moves
    ) {
        return (gameActive, currentPlayer, winner, moveCount);
    }

    /**
     * @dev Reset game (can only be called after game ends)
     */
    function resetGame() external {
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
}
