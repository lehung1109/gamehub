'use client'

import React from 'react'
import type { SpeakingScaffoldingHint, SpeakingHintLevel } from '@/types/speaking'
import { Volume2, Sparkles } from 'lucide-react'

export interface ScaffoldingHintsProps {
  hints: SpeakingScaffoldingHint[]
  onSelectHint: (hint: SpeakingScaffoldingHint) => void
  onPreviewAudio?: (text: string) => void
}

interface TierMeta {
  title: string
  icon: string
  colorBadge: string
  borderStyle: string
}

const TIER_CONFIG: Record<SpeakingHintLevel, TierMeta> = {
  starter: {
    title: 'Khởi đầu 🌱',
    icon: '🌱',
    colorBadge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    borderStyle: 'hover:border-emerald-400 dark:hover:border-emerald-500',
  },
  natural: {
    title: 'Tự nhiên 🌿',
    icon: '🌿',
    colorBadge: 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-700',
    borderStyle: 'hover:border-sky-400 dark:hover:border-sky-500',
  },
  expressive: {
    title: 'Diễn cảm 🌟',
    icon: '🌟',
    colorBadge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    borderStyle: 'hover:border-amber-400 dark:hover:border-amber-500',
  },
}

export function ScaffoldingHints({
  hints,
  onSelectHint,
  onPreviewAudio,
}: ScaffoldingHintsProps) {
  if (!hints || hints.length === 0) {
    return null
  }

  return (
    <div data-testid="scaffolding-hints" className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <h4 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
          <Sparkles className="size-5 text-amber-500" />
          <span>Gợi ý câu trả lời theo cấp độ</span>
        </h4>
        <span className="text-base font-semibold text-muted-foreground">
          (Chọn câu để luyện nói)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {hints.map((hint) => {
          const config = TIER_CONFIG[hint.level] || TIER_CONFIG.starter
          return (
            <div
              key={hint.level}
              data-testid={`hint-${hint.level}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectHint(hint)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelectHint(hint)
                }
              }}
              className={`group relative flex flex-col justify-between p-4 rounded-3xl bg-card border-2 border-border/80 shadow-xs hover:shadow-md ${config.borderStyle} hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50`}
            >
              <div>
                {/* Header tier badge & Preview audio */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-base font-black border ${config.colorBadge}`}
                  >
                    <span>{config.title}</span>
                  </span>

                  {onPreviewAudio && (
                    <button
                      type="button"
                      data-testid={`listen-hint-${hint.level}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreviewAudio(hint.textEn)
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-secondary/80 hover:bg-secondary text-secondary-foreground text-base font-bold transition-transform active:scale-95 border border-border"
                      aria-label={`Nghe thử phát âm câu ${config.title}`}
                    >
                      <Volume2 className="size-4" />
                      <span>Nghe thử</span>
                    </button>
                  )}
                </div>

                {/* English phrase */}
                <p className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors leading-snug my-1.5">
                  {hint.textEn}
                </p>

                {/* Phonetic guide */}
                {hint.phoneticHint && (
                  <p className="text-base font-semibold text-muted-foreground/90 font-mono italic mb-2">
                    {hint.phoneticHint}
                  </p>
                )}
              </div>

              {/* Vietnamese translation */}
              <div className="pt-2 mt-2 border-t border-border/60">
                <p className="text-base font-medium text-muted-foreground leading-relaxed">
                  {hint.textVi}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
