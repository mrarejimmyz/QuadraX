'use client'

import { useState } from 'react'

interface BoardProps {
  board: number[]
  onCellClick: (index: number) => void
  currentPlayer: number
  disabled?: boolean
  gamePhase?: 'placement' | 'movement'
  piecesPlaced?: {player1: number, player2: number}
  selectedCell?: number | null
}

export default function Board({ 
  board, 
  onCellClick, 
  currentPlayer, 
  disabled = false, 
  gamePhase = 'placement',
  piecesPlaced = {player1: 0, player2: 0},
  selectedCell = null 
}: BoardProps) {
  const getCellContent = (value: number) => {
    if (value === 1) return 'X'
    if (value === 2) return 'O'
    return ''
  }

  const getCellColor = (value: number) => {
    if (value === 1) return 'text-cyan-400'
    if (value === 2) return 'text-pink-400'
    return 'text-white/30'
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-8 p-4">
      {/* Glassmorphism Header */}
      <div className="text-center py-6">
        <div className="glass-thin rounded-2xl px-8 py-4 mx-4 backdrop-blur-2xl 
                      border border-white/10 shadow-xl">
          <h2 className="text-white/95 font-bold text-xl tracking-wide">QuadraX</h2>
          <p className="text-white/60 text-sm mt-1">Strategic Battle</p>
        </div>
      </div>

      {/* Glassmorphism Player Status */}
      <div className="px-4 py-2">
        <div className="glass-thin rounded-3xl px-8 py-6 backdrop-blur-2xl 
                      border border-white/15 shadow-2xl">
          <div className="flex items-center justify-center gap-16">
            {/* Player X */}
            <div className="text-center">
              <div className={`w-18 h-18 rounded-2xl flex items-center justify-center mb-3 
                            backdrop-blur-xl border transition-all duration-500 shadow-xl ${
                currentPlayer === 1 && !disabled 
                  ? 'glass-selected border-cyan-400/50 shadow-cyan-400/30 animate-pulse-subtle' 
                  : 'glass-ultra-thin border-white/10'
              }`}>
                <span className="text-cyan-400 text-2xl font-black drop-shadow-lg">X</span>
              </div>
              <div className="text-cyan-400 font-medium text-sm">You ({piecesPlaced.player1}/4)</div>
            </div>

            {/* VS Glass Separator */}
            <div className="glass-ultra-thin rounded-full w-12 h-12 flex items-center justify-center 
                          border border-white/10 backdrop-blur-xl">
              <span className="text-white/60 font-bold text-sm">VS</span>
            </div>

            {/* Player O */}
            <div className="text-center">
              <div className={`w-18 h-18 rounded-2xl flex items-center justify-center mb-3 
                            backdrop-blur-xl border transition-all duration-500 shadow-xl ${
                currentPlayer === 2 && !disabled 
                  ? 'glass-selected border-pink-400/50 shadow-pink-400/30 animate-pulse-subtle' 
                  : 'glass-ultra-thin border-white/10'
              }`}>
                <span className="text-pink-400 text-2xl font-black drop-shadow-lg">O</span>
              </div>
              <div className="text-pink-400 font-medium text-sm">AI ({piecesPlaced.player2}/4)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Continuous Glassmorphism Game Board */}
      <div className="mx-4 py-2">
        <div className="glass-thick rounded-3xl p-8 backdrop-blur-3xl border border-white/20 
                       shadow-2xl shadow-black/50">
        <div 
          className="grid gap-3 mx-auto"
          style={{ 
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            width: '300px',
            height: '300px'
          }}
        >
          {board.map((cell, index) => {
            const isClickable = !disabled && (
              (gamePhase === 'placement' && cell === 0 && piecesPlaced.player1 < 4 && currentPlayer === 1) ||
              (gamePhase === 'movement' && currentPlayer === 1 && (cell === 1 || (selectedCell !== null && cell === 0)))
            )
            
            return (
              <button
                key={index}
                onClick={() => !disabled && onCellClick(index)}
                disabled={disabled || !isClickable}
                className={`
                  relative group
                  flex items-center justify-center
                  w-full h-full
                  rounded-2xl
                  text-3xl font-black
                  transition-all duration-500 ease-out
                  backdrop-blur-xl
                  ${selectedCell === index 
                    ? 'glass-selected border-2 border-yellow-400/80 shadow-2xl shadow-yellow-400/40 scale-110' 
                    : cell === 0 
                      ? (isClickable 
                        ? 'glass-ultra-thin border border-white/10 hover:glass-thin hover:border-white/20 cursor-pointer hover:scale-105 animate-pulse-subtle' 
                        : 'glass-ultra-thin border border-white/5')
                      : 'glass-thin border border-white/15 shadow-xl'
                  }
                  ${getCellColor(cell)}
                `}
              >
                {/* Clean piece display */}
                {cell !== 0 && (
                  <span className={`${getCellColor(cell)} drop-shadow-xl`}
                        style={{
                          fontSize: '2.5rem',
                          fontWeight: '900',
                          textShadow: cell === 1 
                            ? '0 0 15px rgba(34,211,238,0.6), 0 4px 8px rgba(0,0,0,0.8)'
                            : '0 0 15px rgba(244,114,182,0.6), 0 4px 8px rgba(0,0,0,0.8)'
                        }}>
                    {getCellContent(cell)}
                  </span>
                )}
                
                {/* Available move indicator for empty cells */}
                {cell === 0 && isClickable && currentPlayer === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400/40 to-blue-500/30 
                                  animate-pulse shadow-lg shadow-cyan-400/20 border border-cyan-400/50"></div>
                  </div>
                )}
                
                {/* Movement selection indicator */}
                {gamePhase === 'movement' && currentPlayer === 1 && cell === 1 && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/15 to-blue-500/10 
                                animate-pulse border border-cyan-400/40"></div>
                )}
              </button>
            )
          })}
        </div>
        </div>
      </div>

      {/* Glassmorphism Turn Indicator */}
      <div className="px-4 py-2">
        <div className={`glass-thin rounded-2xl px-6 py-4 text-center backdrop-blur-2xl 
                       border shadow-xl transition-all duration-500 ${
          !disabled && currentPlayer === 1 
            ? 'border-cyan-400/30 shadow-cyan-400/20 animate-pulse-subtle'
            : !disabled && currentPlayer === 2
            ? 'border-pink-400/30 shadow-pink-400/20'
            : 'border-white/10'
        }`}>
          {disabled ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
              <p className="text-white/60 text-sm font-medium">Initializing game...</p>
            </div>
          ) : (
            <div>
              <p className={`font-bold text-lg ${
                currentPlayer === 1 ? 'text-cyan-400' : 'text-pink-400'
              }`}>
                {currentPlayer === 1 ? 'Your Turn' : 'AI Thinking'}
              </p>
              <p className="text-white/70 text-sm mt-1 font-medium">
                {currentPlayer === 1 
                  ? (gamePhase === 'placement' 
                    ? `Place piece (${4 - piecesPlaced.player1} remaining)`
                    : (selectedCell !== null ? 'Choose destination' : 'Select piece to move'))
                  : 'Calculating optimal move...'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}