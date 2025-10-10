/**
 * Custom hook for managing game state
 */

'use client';

import { useState, useCallback } from 'react';
import type { Board, CellValue, Address, GameMode } from '../types/game';
import { checkWinner, isBoardFull } from '../utils/gameHelpers';

export interface UseGameStateReturn {
  board: Board;
  currentPlayer: 1 | 2;
  winner: Address | null;
  isGameActive: boolean;
  moveCount: number;
  gameMode: GameMode;
  makeMove: (position: number) => boolean;
  resetGame: () => void;
  setGameMode: (mode: GameMode) => void;
}

export function useGameState(): UseGameStateReturn {
  const [board, setBoard] = useState<Board>(Array(16).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [winner, setWinner] = useState<Address | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('human-vs-human');

  const makeMove = useCallback(
    (position: number): boolean => {
      if (!isGameActive) return false;
      if (position < 0 || position >= 16) return false;
      if (board[position] !== 0) return false;

      const newBoard = [...board];
      newBoard[position] = currentPlayer as CellValue;
      setBoard(newBoard);
      setMoveCount((prev) => prev + 1);

      // Check for winner
      if (checkWinner(newBoard, currentPlayer as CellValue)) {
        setWinner(`0x${currentPlayer.toString().repeat(40)}` as Address); // Mock address
        setIsGameActive(false);
        return true;
      }

      // Check for tie
      if (isBoardFull(newBoard)) {
        setIsGameActive(false);
        return true;
      }

      // Switch player
      setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
      return true;
    },
    [board, currentPlayer, isGameActive]
  );

  const resetGame = useCallback(() => {
    setBoard(Array(16).fill(0));
    setCurrentPlayer(1);
    setWinner(null);
    setIsGameActive(true);
    setMoveCount(0);
  }, []);

  return {
    board,
    currentPlayer,
    winner,
    isGameActive,
    moveCount,
    gameMode,
    makeMove,
    resetGame,
    setGameMode,
  };
}
