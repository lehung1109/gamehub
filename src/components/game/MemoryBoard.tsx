'use client'

import React from 'react'
import type { MemoryCard as MemoryCardType } from '@/types/memory-match'
import { MemoryCard } from '@/components/game/MemoryCard'
import { cn } from '@/lib/utils'

export interface MemoryBoardProps {
  cards: MemoryCardType[]
  onCardClick: (index: number) => void
  disabled?: boolean
  className?: string
}

export function MemoryBoard({
  cards,
  onCardClick,
  disabled = false,
  className,
}: MemoryBoardProps) {
  const cardCount = cards.length

  const gridColsClass =
    cardCount <= 8
      ? 'grid-cols-2 sm:grid-cols-4 max-w-xl'
      : cardCount <= 12
      ? 'grid-cols-3 sm:grid-cols-4 max-w-2xl'
      : 'grid-cols-4 max-w-2xl'

  return (
    <div
      role="region"
      aria-label="Bàn cờ lật thẻ"
      className={cn('w-full mx-auto px-2 py-4', className)}
    >
      <div
        className={cn(
          'grid gap-2.5 sm:gap-4 mx-auto justify-center',
          gridColsClass
        )}
      >
        {cards.map((card, index) => (
          <MemoryCard
            key={card.id}
            card={card}
            disabled={disabled}
            onClick={() => onCardClick(index)}
          />
        ))}
      </div>
    </div>
  )
}
