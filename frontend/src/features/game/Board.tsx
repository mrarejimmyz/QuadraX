'use client'

import { useState } from 'react'

interface BoardProps {
  board: number[]
  onCellClick: (index: number) => void
  currentPlayer: number
  disabled?: boolean
}

export default function Board({ board, onCellClick, currentPlayer, disabled = false }: BoardProps) {
  const getCellContent = (value: number) => {
    if (value === 1) return 'X'
    if (value === 2) return 'O'
    return ''
  }

  const getCellColor = (value: number) => {
    if (value === 1) return 'text-blue-400'
    if (value === 2) return 'text-pink-400'
    return 'text-white/50'
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-4 gap-2 md:gap-3 p-4 glass rounded-2xl">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => !disabled && cell === 0 && onCellClick(index)}
            disabled={disabled || cell !== 0}
            className={`
              cell aspect-square rounded-lg glass
              flex items-center justify-center
              text-3xl md:text-4xl font-bold
              ${getCellColor(cell)}
              ${!disabled && cell === 0 ? 'cursor-pointer hover:bg-white/20' : 'cursor-not-allowed'}
              transition-all duration-200
            `}
          >
            {getCellContent(cell)}
          </button>
        ))}
      </div>
    </div>
  )
}
