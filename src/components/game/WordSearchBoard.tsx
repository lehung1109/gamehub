// src/components/game/WordSearchBoard.tsx
'use client'

import React from 'react'
import type { WordSearchCell } from '@/types/word-search'
import { WordSearchCellItem } from './WordSearchCellItem'
import { Card } from '@/components/ui/card'

export interface WordSearchBoardProps {
  grid: WordSearchCell[][]
  onCellPointerDown: (row: number, col: number) => void
  onCellPointerEnter: (row: number, col: number) => void
  onCellPointerUp: () => void
  onCellClick: (row: number, col: number) => void
  disabled?: boolean
}

export function WordSearchBoard({
  grid,
  onCellPointerDown,
  onCellPointerEnter,
  onCellPointerUp,
  onCellClick,
  disabled = false,
}: WordSearchBoardProps) {
  return (
    <Card
      role="grid"
      aria-label="Bảng ô chữ săn tìm từ vựng 8x8"
      onPointerUp={onCellPointerUp}
      className="p-3 sm:p-5 bg-card/90 backdrop-blur-xs border-2 border-border shadow-sm rounded-3xl overflow-hidden max-w-full inline-block mx-auto touch-none"
    >
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2.5">
        {grid.map((rowCells, r) =>
          rowCells.map((cell, c) => (
            <WordSearchCellItem
              key={cell.id}
              cell={cell}
              disabled={disabled}
              onPointerDown={() => onCellPointerDown(r, c)}
              onPointerEnter={() => onCellPointerEnter(r, c)}
              onPointerUp={onCellPointerUp}
              onClick={() => onCellClick(r, c)}
            />
          ))
        )}
      </div>
    </Card>
  )
}
