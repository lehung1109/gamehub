// src/components/game/WordSearchCellItem.tsx
'use client'

import React, { useMemo } from 'react'
import type { WordSearchCell } from '@/types/word-search'
import { cn } from '@/lib/utils'

export interface WordSearchCellItemProps {
  cell: WordSearchCell
  onPointerDown: () => void
  onPointerEnter: () => void
  onPointerUp: () => void
  onClick: () => void
  disabled?: boolean
}

export function WordSearchCellItem({
  cell,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
  onClick,
  disabled = false,
}: WordSearchCellItemProps) {
  const dynamicStyle = useMemo(() => {
    if (cell.isSelected) return undefined

    if (cell.matchedColors.length === 1) {
      return {
        backgroundColor: `${cell.matchedColors[0]}33`,
        borderColor: cell.matchedColors[0],
        color: cell.matchedColors[0],
      }
    }

    if (cell.matchedColors.length > 1) {
      const c1 = `${cell.matchedColors[0]}44`
      const c2 = `${cell.matchedColors[1]}44`
      return {
        background: `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`,
        borderColor: cell.matchedColors[0],
      }
    }

    return undefined
  }, [cell.isSelected, cell.matchedColors])

  return (
    <button
      type="button"
      role="gridcell"
      data-testid={`cell-r${cell.row}-c${cell.col}`}
      data-row={cell.row}
      data-col={cell.col}
      aria-selected={cell.isSelected}
      suppressHydrationWarning
      aria-label={`Chữ cái ${cell.letter} tại hàng ${cell.row + 1}, cột ${cell.col + 1}`}
      disabled={disabled}
      onPointerDown={(e) => {
        if (disabled) return
        // Prevent default browser drag / text selection gestures while dragging
        e.preventDefault()
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
        onPointerDown()
      }}
      onPointerEnter={() => {
        if (!disabled) onPointerEnter()
      }}
      onPointerUp={() => {
        if (!disabled) onPointerUp()
      }}
      onClick={() => {
        if (!disabled) onClick()
      }}
      style={dynamicStyle}
      className={cn(
        'select-none aspect-square flex items-center justify-center font-black rounded-xl sm:rounded-2xl transition-transform duration-100 touch-none',
        'min-w-[36px] min-h-[36px] sm:min-w-[48px] sm:min-h-[48px] md:min-w-[54px] md:min-h-[54px]',
        'text-base sm:text-xl md:text-2xl',
        cell.isSelected
          ? 'bg-amber-300 text-amber-950 ring-3 ring-amber-500 scale-95 shadow-md z-10 dark:bg-amber-600 dark:text-white'
          : cell.matchedColors.length > 0
          ? 'border-2 font-black shadow-xs hover:scale-105'
          : 'bg-card border border-border/70 text-foreground shadow-xs hover:bg-accent/60 hover:scale-105 active:scale-95',
        cell.isHinted && 'animate-pulse ring-4 ring-amber-400 scale-110 z-20 dark:ring-amber-300'
      )}
    >
      {cell.letter}
    </button>
  )
}
