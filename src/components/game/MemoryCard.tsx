'use client'

import React from 'react'
import type { MemoryCard as MemoryCardType } from '@/types/memory-match'
import { cn } from '@/lib/utils'
import { Sparkles, Check } from 'lucide-react'

export interface MemoryCardProps {
  card: MemoryCardType
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function MemoryCard({
  card,
  onClick,
  disabled = false,
  className,
}: MemoryCardProps) {
  const isFaceUp = card.isFlipped || card.isMatched

  const ariaLabel = isFaceUp
    ? card.type === 'emoji'
      ? `Thẻ hình ảnh: ${card.english}`
      : `Thẻ chữ: ${card.english}`
    : 'Thẻ úp'

  return (
    <button
      type="button"
      role="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      data-word-id={card.wordId}
      data-card-type={card.type}
      onClick={() => {
        if (!disabled) {
          onClick()
        }
      }}
      className={cn(
        'group relative w-full aspect-square min-h-[72px] min-w-[72px] sm:min-h-[96px] sm:min-w-[96px] rounded-2xl sm:rounded-3xl p-1 sm:p-2 cursor-pointer transition-all duration-300 select-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 [perspective:1000px]',
        disabled && 'cursor-default opacity-90',
        card.isMatched && 'border-2 border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-emerald-500/20 shadow-md',
        className
      )}
    >
      <div
        className={cn(
          'w-full h-full rounded-xl sm:rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] flex items-center justify-center shadow-sm',
          isFaceUp && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Card Back (Face down) */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl flex flex-col items-center justify-center bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-sm [backface-visibility:hidden]',
            isFaceUp && 'pointer-events-none'
          )}
        >
          <span className="text-2xl sm:text-4xl opacity-80 group-hover:scale-110 transition-transform">
            ❓
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 mt-1">
            Lật thẻ
          </span>
        </div>

        {/* Card Front (Face up) */}
        <div
          className={cn(
            'absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-2 [backface-visibility:hidden] [transform:rotateY(180deg)] border',
            card.isMatched
              ? 'border-emerald-400 bg-emerald-100/90 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-700'
              : 'border-indigo-200 bg-card text-card-foreground dark:border-indigo-900 shadow-md'
          )}
        >
          {isFaceUp && (
            <>
              {card.type === 'emoji' ? (
                <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
                  <span className="text-3xl sm:text-5xl drop-shadow-xs">
                    {card.content}
                  </span>
                  {card.isMatched && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                      <Check className="size-3" />
                      <span>{card.english}</span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-75 duration-200 px-1">
                  <span className="text-sm sm:text-lg md:text-xl font-black tracking-tight text-foreground">
                    {card.content}
                  </span>
                  {card.phonetic && (
                    <span className="text-xs font-medium text-muted-foreground mt-0.5">
                      {card.phonetic}
                    </span>
                  )}
                  {card.isMatched && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      <Sparkles className="size-3" />
                      <span>Đúng!</span>
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </button>
  )
}
