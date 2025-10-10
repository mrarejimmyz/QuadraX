// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGame
 * @dev Interface for game contracts
 */
interface IGame {
    // Events
    event GameCreated(address indexed player1, address indexed player2, bool isAI);
    event MoveMade(address indexed player, uint8 position, uint8 symbol);
    event GameWon(address indexed winner);
    event GameTied();
    event GameReset();

    // Game creation
    function createGame(address _player2, bool _isAI) external;

    // Game actions
    function makeMove(uint8 position) external;
    function resetGame() external;

    // View functions
    function getBoard() external view returns (uint8[16] memory);
    function getGameStatus() external view returns (
        bool active,
        address current,
        address winnerAddr,
        uint256 moves
    );

    // Player info
    function player1() external view returns (address);
    function player2() external view returns (address);
    function currentPlayer() external view returns (address);
    function winner() external view returns (address);
    function gameActive() external view returns (bool);
}
