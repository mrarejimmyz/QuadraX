/**
 * Smart Contract ABIs for QuadraX
 * Centralized ABI management for type safety and reusability
 */

// PYUSD Staking Contract ABI (essential functions)
export const PYUSD_STAKING_ABI = [
  // Constructor
  {
    "inputs": [
      { "internalType": "address", "name": "_pyusdToken", "type": "address" },
      { "internalType": "address", "name": "_platformWallet", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Create Game
  {
    "inputs": [
      { "internalType": "address", "name": "player2", "type": "address" }
    ],
    "name": "createGame",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Stake
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Declare Winner
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "internalType": "address", "name": "winnerAddress", "type": "address" }
    ],
    "name": "declareWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Declare Tie
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "declareTie",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Get Game Details
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "getGameDetails",
    "outputs": [
      { "internalType": "address", "name": "player1", "type": "address" },
      { "internalType": "address", "name": "player2", "type": "address" },
      { "internalType": "uint256", "name": "player1Stake", "type": "uint256" },
      { "internalType": "uint256", "name": "player2Stake", "type": "uint256" },
      { "internalType": "uint256", "name": "totalPot", "type": "uint256" },
      { "internalType": "bool", "name": "gameStarted", "type": "bool" },
      { "internalType": "bool", "name": "gameEnded", "type": "bool" },
      { "internalType": "address", "name": "winner", "type": "address" },
      { "internalType": "bool", "name": "isTie", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Constants and Views
  {
    "inputs": [],
    "name": "MIN_STAKE",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformFee",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pyusdToken",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "player1", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "player2", "type": "address" }
    ],
    "name": "GameCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "PlayerStaked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "totalPot", "type": "uint256" }
    ],
    "name": "GameStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "WinnerPaid",
    "type": "event"
  }
] as const;

// TicTacToe Game Contract ABI (minimal for game logic)
export const TIC_TAC_TOE_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "internalType": "uint8", "name": "position", "type": "uint8" }
    ],
    "name": "makeMove",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "getGameState",
    "outputs": [
      { "internalType": "uint8[9]", "name": "board", "type": "uint8[9]" },
      { "internalType": "address", "name": "currentPlayer", "type": "address" },
      { "internalType": "bool", "name": "gameEnded", "type": "bool" },
      { "internalType": "address", "name": "winner", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Standard ERC20 ABI (for PYUSD interactions)
export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ABI Export Map for easy access
export const CONTRACT_ABIS = {
  PYUSD_STAKING: PYUSD_STAKING_ABI,
  TIC_TAC_TOE: TIC_TAC_TOE_ABI,
  ERC20: ERC20_ABI,
} as const;