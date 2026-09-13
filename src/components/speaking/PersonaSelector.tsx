import React from 'react'
import type { SpeakingPersona, SpeakingAccent } from '@/types/speaking'
import { Check } from 'lucide-react'

export interface PersonaSelectorProps {
  personas: SpeakingPersona[]
  selectedId: string
  onSelect: (id: string) => void
}

const ACCENT_LABELS: Record<SpeakingAccent, { flag: string; label: string }> = {
  us: { flag: '🇺🇸', label: 'Giọng Mỹ (US)' },
  uk: { flag: '🇬🇧', label: 'Giọng Anh (UK)' },
  neutral: { flag: '🌐', label: 'Giọng Quốc tế' },
}

export function PersonaSelector({
  personas,
  selectedId,
  onSelect,
}: PersonaSelectorProps) {
  return (
    <div
      data-testid="persona-selector"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
            <span>🎭</span>
            <span>Chọn Bạn Đồng Hành AI</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
            Lựa chọn phong cách và ngữ điệu phù hợp với mục tiêu luyện nói của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {personas.map((persona) => {
          const isSelected = persona.id === selectedId
          const accentInfo = ACCENT_LABELS[persona.accent] || ACCENT_LABELS.neutral

          return (
            <div
              key={persona.id}
              data-testid={`persona-${persona.id}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(persona.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect(persona.id)
                }
              }}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-400/60 shadow-md scale-[1.02]'
                  : 'border-border/80 bg-card hover:border-amber-300 dark:hover:border-amber-700 hover:bg-accent/40 shadow-2xs'
              }`}
            >
              {/* Header: Avatar, Name, Accent Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-11 rounded-2xl bg-linear-to-br from-amber-100 to-amber-300 dark:from-amber-700 dark:to-amber-500 border border-amber-300 dark:border-amber-600 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    <span role="img" aria-label={persona.name}>
                      {persona.avatar}
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-black text-foreground truncate">
                      {persona.name}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground truncate">
                      {persona.role}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="size-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs animate-in zoom-in-50 duration-150">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Accent Flag Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-background border border-border text-foreground">
                  <span>{accentInfo.flag}</span>
                  <span>{accentInfo.label}</span>
                </span>
              </div>

              {/* Tone Vietnamese description */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                &ldquo;{persona.toneVi}&rdquo;
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
