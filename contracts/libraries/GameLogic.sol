// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GameLogic
 * @dev Library containing game logic utilities
 */
library GameLogic {
    /**
     * @dev Check if a position is valid (0-15 for 4x4 board)
     */
    function isValidPosition(uint8 position) internal pure returns (bool) {
        return position < 16;
    }

    /**
     * @dev Check if a cell is empty
     */
    function isCellEmpty(uint8[16] memory board, uint8 position) internal pure returns (bool) {
        return board[position] == 0;
    }

    /**
     * @dev Check if the board is full (tie condition)
     */
    function isBoardFull(uint8[16] memory board) internal pure returns (bool) {
        for (uint8 i = 0; i < 16; i++) {
            if (board[i] == 0) return false;
        }
        return true;
    }

    /**
     * @dev Check horizontal win for a symbol
     */
    function checkHorizontalWin(uint8[16] memory board, uint8 symbol) internal pure returns (bool) {
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
        return false;
    }

    /**
     * @dev Check vertical win for a symbol
     */
    function checkVerticalWin(uint8[16] memory board, uint8 symbol) internal pure returns (bool) {
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
        return false;
    }

    /**
     * @dev Check diagonal win for a symbol
     */
    function checkDiagonalWin(uint8[16] memory board, uint8 symbol) internal pure returns (bool) {
        // Top-left to bottom-right
        if (
            board[0] == symbol &&
            board[5] == symbol &&
            board[10] == symbol &&
            board[15] == symbol
        ) {
            return true;
        }

        // Top-right to bottom-left
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
     * @dev Check if there's a winner for given symbol
     */
    function checkWinner(uint8[16] memory board, uint8 symbol) internal pure returns (bool) {
        return
            checkHorizontalWin(board, symbol) ||
            checkVerticalWin(board, symbol) ||
            checkDiagonalWin(board, symbol);
    }

    /**
     * @dev Get empty cells count
     */
    function getEmptyCellsCount(uint8[16] memory board) internal pure returns (uint8) {
        uint8 count = 0;
        for (uint8 i = 0; i < 16; i++) {
            if (board[i] == 0) count++;
        }
        return count;
    }
}
