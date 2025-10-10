// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IStaking
 * @dev Interface for staking contracts
 */
interface IStaking {
    // Structs
    struct Game {
        address player1;
        address player2;
        uint256 player1Stake;
        uint256 player2Stake;
        uint256 totalPot;
        bool player1Staked;
        bool player2Staked;
        bool gameStarted;
        bool gameEnded;
        address winner;
        bool isTie;
    }

    // Events
    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2);
    event PlayerStaked(uint256 indexed gameId, address indexed player, uint256 amount);
    event GameStarted(uint256 indexed gameId, uint256 totalPot);
    event WinnerPaid(uint256 indexed gameId, address indexed winner, uint256 amount);
    event TieRefunded(uint256 indexed gameId, uint256 player1Refund, uint256 player2Refund);
    event FeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // Game management
    function createGame(address player2) external returns (uint256);
    function stake(uint256 gameId, uint256 amount) external;
    function declareWinner(uint256 gameId, address winnerAddress) external;
    function declareTie(uint256 gameId) external;

    // View functions
    function getGameDetails(uint256 gameId) external view returns (
        address player1,
        address player2,
        uint256 player1Stake,
        uint256 player2Stake,
        uint256 totalPot,
        bool gameStarted,
        bool gameEnded,
        address winner,
        bool isTie
    );
    function isGameReady(uint256 gameId) external view returns (bool);

    // Fee management
    function updateFee(uint256 newFee) external;
    function withdrawFees() external;
}
