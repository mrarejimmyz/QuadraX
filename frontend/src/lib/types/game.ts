/**
 * Game-related type definitions
 */

export type CellValue = 0 | 1 | 2;
export type Board = CellValue[];
export type PlayerSymbol = 'X' | 'O';

export interface GameState {
  board: Board;
  currentPlayer: 1 | 2;
  winner: Address | null;
  isActive: boolean;
  moveCount: number;
  isAIGame: boolean;
}

export interface GameStatus {
  active: boolean;
  current: Address;
  winnerAddr: Address;
  moves: bigint;
}

export interface Player {
  address: Address;
  symbol: PlayerSymbol;
  isAI: boolean;
}

export interface StakeInfo {
  amount: bigint;
  isStaked: boolean;
}

export interface GameDetails {
  gameId: number;
  player1: Address;
  player2: Address;
  player1Stake: bigint;
  player2Stake: bigint;
  totalPot: bigint;
  gameStarted: boolean;
  gameEnded: boolean;
  winner: Address | null;
  isTie: boolean;
}

export type Address = `0x${string}`;

export type GameMode = 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai';

export interface Move {
  position: number;
  player: Address;
  symbol: PlayerSymbol;
  timestamp: number;
}
