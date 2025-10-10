/**
 * Game utility functions
 */

import type { Board, CellValue, PlayerSymbol, Address } from '../types/game';

/**
 * Convert cell value to player symbol
 */
export function cellValueToSymbol(value: CellValue): PlayerSymbol | '' {
  if (value === 1) return 'X';
  if (value === 2) return 'O';
  return '';
}

/**
 * Convert player symbol to cell value
 */
export function symbolToCellValue(symbol: PlayerSymbol): 1 | 2 {
  return symbol === 'X' ? 1 : 2;
}

/**
 * Check if position is valid (0-15)
 */
export function isValidPosition(position: number): boolean {
  return position >= 0 && position < 16;
}

/**
 * Check if cell is empty
 */
export function isCellEmpty(board: Board, position: number): boolean {
  return board[position] === 0;
}

/**
 * Check horizontal win
 */
export function checkHorizontalWin(board: Board, player: CellValue): boolean {
  for (let row = 0; row < 4; row++) {
    if (
      board[row * 4] === player &&
      board[row * 4 + 1] === player &&
      board[row * 4 + 2] === player &&
      board[row * 4 + 3] === player
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check vertical win
 */
export function checkVerticalWin(board: Board, player: CellValue): boolean {
  for (let col = 0; col < 4; col++) {
    if (
      board[col] === player &&
      board[col + 4] === player &&
      board[col + 8] === player &&
      board[col + 12] === player
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check diagonal win
 */
export function checkDiagonalWin(board: Board, player: CellValue): boolean {
  // Top-left to bottom-right
  if (
    board[0] === player &&
    board[5] === player &&
    board[10] === player &&
    board[15] === player
  ) {
    return true;
  }

  // Top-right to bottom-left
  if (
    board[3] === player &&
    board[6] === player &&
    board[9] === player &&
    board[12] === player
  ) {
    return true;
  }

  return false;
}

/**
 * Check if player has won
 */
export function checkWinner(board: Board, player: CellValue): boolean {
  return (
    checkHorizontalWin(board, player) ||
    checkVerticalWin(board, player) ||
    checkDiagonalWin(board, player)
  );
}

/**
 * Check if board is full (tie condition)
 */
export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== 0);
}

/**
 * Get empty cell positions
 */
export function getEmptyCells(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, index) => {
    if (cell === 0) acc.push(index);
    return acc;
  }, []);
}

/**
 * Shorten ethereum address
 */
export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format PYUSD amount (6 decimals)
 */
export function formatPYUSD(amount: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === 0n) {
    return wholePart.toString();
  }

  const fractionalString = fractionalPart.toString().padStart(decimals, '0');
  return `${wholePart}.${fractionalString.replace(/0+$/, '')}`;
}

/**
 * Parse PYUSD amount to wei
 */
export function parsePYUSD(amount: string, decimals: number = 6): bigint {
  const [whole = '0', fraction = '0'] = amount.split('.');
  const fractionalPadded = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(fractionalPadded);
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: bigint, feeBps: number = 25): bigint {
  return (amount * BigInt(feeBps)) / 10000n;
}

/**
 * Calculate winner payout after fee
 */
export function calculateWinnerPayout(totalPot: bigint, feeBps: number = 25): bigint {
  const fee = calculatePlatformFee(totalPot, feeBps);
  return totalPot - fee;
}
