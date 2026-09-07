// src/components/game/WordSearchWordList.tsx
'use client'

import React from 'react'
import type { WordSearchTargetWord } from '@/types/word-search'
import { Volume2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WordSearchWordListProps {
  words: WordSearchTargetWord[]
  onPlayPronunciation: (english: string) => void
}

export function WordSearchWordList({
  words,
  onPlayPronunciation,
}: WordSearchWordListProps) {
  return (
    <div
      aria-label="Danh sách từ mục tiêu cần tìm"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 sm:gap-2.5 w-full"
    >
      {words.map((word) => {
        const isFound = word.isFound

        return (
          <div
            key={word.id}
            data-testid={`target-word-${word.english.toLowerCase()}`}
            style={
              isFound
                ? {
                    borderColor: word.color,
                    backgroundColor: `${word.color}18`,
                  }
                : undefined
            }
            className={cn(
              'flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all duration-200',
              isFound
                ? 'border-2 shadow-xs'
                : 'bg-card border-border/80 text-foreground shadow-xs hover:border-primary/40'
            )}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden">
              <span className="text-xl sm:text-2xl select-none" aria-hidden="true">
                {word.emoji}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'font-black text-sm sm:text-base tracking-wide truncate',
                      isFound ? 'line-through text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {word.english}
                  </span>
                  {isFound && (
                    <Check
                      className="size-4 shrink-0 text-emerald-500 stroke-[3]"
                      aria-label="Đã tìm thấy"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {word.vietnamese}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onPlayPronunciation(word.english)}
              aria-label={`Nghe phát âm ${word.english}`}
              className="p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Volume2 className="size-4 sm:size-4.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
