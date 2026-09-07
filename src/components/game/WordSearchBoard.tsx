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
      suppressHydrationWarning
      onPointerUp={onCellPointerUp}
      onPointerMove={(e) => {
        if (disabled) return
        // Support dragging smoothly across cells on both mouse and touch devices
        const target = document.elementFromPoint(e.clientX, e.clientY)
        const cellBtn = target?.closest?.('[data-row][data-col]')
        if (cellBtn) {
          const r = Number(cellBtn.getAttribute('data-row'))
          const c = Number(cellBtn.getAttribute('data-col'))
          if (!Number.isNaN(r) && !Number.isNaN(c)) {
            onCellPointerEnter(r, c)
          }
        }
      }}
      className="p-3 sm:p-5 bg-card/90 backdrop-blur-xs border-2 border-border shadow-sm rounded-3xl overflow-hidden max-w-full inline-block mx-auto touch-none select-none"
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
