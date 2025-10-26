// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PYUSDStaking
 * @dev Staking and payout contract for QuadraX games
 * @notice Manages PYUSD bets and automatic winner payouts
 * @notice Only the AI Referee Agent can declare winners (prevents cheating)
 */
contract PYUSDStaking is ReentrancyGuard {
    IERC20 public pyusdToken;
    address public gameReferee; // AI Referee Agent - only entity that can declare winners

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

    mapping(uint256 => Game) public games;
    uint256 public gameCounter;

    uint256 public constant MIN_STAKE = 1e6; // 1 PYUSD (6 decimals)
    uint256 public platformFee = 25; // 0.25% (25 basis points)
    address public platformWallet;
    uint256 public accumulatedFees;

    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2);
    event PlayerStaked(uint256 indexed gameId, address indexed player, uint256 amount);
    event GameStarted(uint256 indexed gameId, uint256 totalPot);
    event WinnerPaid(uint256 indexed gameId, address indexed winner, uint256 amount);
    event TieRefunded(uint256 indexed gameId, uint256 player1Refund, uint256 player2Refund);
    event FeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event RefereeUpdated(address indexed oldReferee, address indexed newReferee);

    modifier onlyPlayers(uint256 gameId) {
        require(
            msg.sender == games[gameId].player1 || msg.sender == games[gameId].player2,
            "Not a player in this game"
        );
        _;
    }

    modifier onlyReferee() {
        require(msg.sender == gameReferee, "Only AI Referee can call this");
        _;
    }

    constructor(address _pyusdToken, address _platformWallet, address _gameReferee) {
        require(_pyusdToken != address(0), "Invalid PYUSD address");
        require(_platformWallet != address(0), "Invalid platform wallet");
        require(_gameReferee != address(0), "Invalid referee address");
        pyusdToken = IERC20(_pyusdToken);
        platformWallet = _platformWallet;
        gameReferee = _gameReferee;
    }

    /**
     * @dev Create a new game with two players
     * @param player2 Address of the second player
     * @return gameId ID of the created game
     */
    function createGame(address player2) external returns (uint256) {
        require(player2 != address(0), "Invalid player2 address");
        require(player2 != msg.sender, "Cannot play against yourself");

        uint256 gameId = gameCounter++;

        games[gameId] = Game({
            player1: msg.sender,
            player2: player2,
            player1Stake: 0,
            player2Stake: 0,
            totalPot: 0,
            player1Staked: false,
            player2Staked: false,
            gameStarted: false,
            gameEnded: false,
            winner: address(0),
            isTie: false
        });

        emit GameCreated(gameId, msg.sender, player2);
        return gameId;
    }

    /**
     * @dev Stake PYUSD for a game
     * @param gameId ID of the game
     * @param amount Amount to stake (must be >= MIN_STAKE)
     */
    function stake(uint256 gameId, uint256 amount) external nonReentrant onlyPlayers(gameId) {
        Game storage game = games[gameId];

        require(!game.gameStarted, "Game already started");
        require(!game.gameEnded, "Game has ended");
        require(amount >= MIN_STAKE, "Stake below minimum");

        bool isPlayer1 = msg.sender == game.player1;

        if (isPlayer1) {
            require(!game.player1Staked, "Already staked");
            game.player1Stake = amount;
            game.player1Staked = true;
        } else {
            require(!game.player2Staked, "Already staked");
            game.player2Stake = amount;
            game.player2Staked = true;
        }

        // Transfer PYUSD from player to contract
        require(
            pyusdToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        game.totalPot += amount;

        emit PlayerStaked(gameId, msg.sender, amount);

        // Start game if both players have staked
        if (game.player1Staked && game.player2Staked) {
            game.gameStarted = true;
            emit GameStarted(gameId, game.totalPot);
        }
    }

    /**
     * @dev Declare winner and pay out (ONLY callable by AI Referee Agent)
     * @param gameId ID of the game
     * @param winnerAddress Address of the winner
     * @notice This function can ONLY be called by the trusted AI Referee
     * @notice The referee validates all moves and ensures no cheating occurred
     */
    function declareWinner(uint256 gameId, address winnerAddress) external nonReentrant onlyReferee {
        Game storage game = games[gameId];

        require(game.gameStarted, "Game not started");
        require(!game.gameEnded, "Game already ended");
        require(
            winnerAddress == game.player1 || winnerAddress == game.player2,
            "Invalid winner"
        );

        game.gameEnded = true;
        game.winner = winnerAddress;

        // Calculate platform fee
        uint256 fee = (game.totalPot * platformFee) / 10000;
        uint256 winnerPayout = game.totalPot - fee;

        // Update accumulated fees
        accumulatedFees += fee;

        // Transfer winnings to winner
        require(pyusdToken.transfer(winnerAddress, winnerPayout), "Payout failed");

        emit WinnerPaid(gameId, winnerAddress, winnerPayout);
    }

    /**
     * @dev Handle tie game - refund both players (ONLY callable by AI Referee)
     * @param gameId ID of the game
     */
    function declareTie(uint256 gameId) external nonReentrant onlyReferee {
        Game storage game = games[gameId];

        require(game.gameStarted, "Game not started");
        require(!game.gameEnded, "Game already ended");

        game.gameEnded = true;
        game.isTie = true;

        // Refund each player their stake (no fee on ties)
        require(pyusdToken.transfer(game.player1, game.player1Stake), "Refund failed");
        require(pyusdToken.transfer(game.player2, game.player2Stake), "Refund failed");

        emit TieRefunded(gameId, game.player1Stake, game.player2Stake);
    }

    /**
     * @dev Update platform fee (only platform wallet can call)
     * @param newFee New fee in basis points (e.g., 25 = 0.25%)
     */
    function updateFee(uint256 newFee) external {
        require(msg.sender == platformWallet, "Only platform can update fee");
        require(newFee <= 500, "Fee too high (max 5%)");
        platformFee = newFee;
        emit FeeUpdated(newFee);
    }

    /**
     * @dev Update the AI Referee address (only platform wallet can call)
     * @param newReferee Address of the new referee
     * @notice Use this to upgrade the referee agent or rotate keys
     */
    function updateReferee(address newReferee) external {
        require(msg.sender == platformWallet, "Only platform can update referee");
        require(newReferee != address(0), "Invalid referee address");
        address oldReferee = gameReferee;
        gameReferee = newReferee;
        emit RefereeUpdated(oldReferee, newReferee);
    }

    /**
     * @dev Withdraw accumulated fees to platform wallet
     */
    function withdrawFees() external nonReentrant {
        require(msg.sender == platformWallet, "Only platform can withdraw");
        require(accumulatedFees > 0, "No fees to withdraw");

        uint256 amount = accumulatedFees;
        accumulatedFees = 0;

        require(pyusdToken.transfer(platformWallet, amount), "Withdrawal failed");

        emit FeesWithdrawn(platformWallet, amount);
    }

    /**
     * @dev Get game details
     * @param gameId ID of the game
     */
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
    ) {
        Game memory game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.player1Stake,
            game.player2Stake,
            game.totalPot,
            game.gameStarted,
            game.gameEnded,
            game.winner,
            game.isTie
        );
    }

    /**
     * @dev Check if game is ready to start
     * @param gameId ID of the game
     */
    function isGameReady(uint256 gameId) external view returns (bool) {
        Game memory game = games[gameId];
        return game.player1Staked && game.player2Staked && !game.gameStarted;
    }
}
