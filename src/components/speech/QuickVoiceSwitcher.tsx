'use client'

import React, { useState } from 'react'
import { Volume2 } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'
import { SpeechSettingsModal } from '@/components/speech/SpeechSettingsModal'
import { ACCENT_LABELS } from '@/types/speech'
import { cn } from '@/lib/utils'

export interface QuickVoiceSwitcherProps {
  className?: string
}

export function QuickVoiceSwitcher({ className }: QuickVoiceSwitcherProps) {
  const { config } = useSpeech()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentAccent = ACCENT_LABELS[config.accent] || ACCENT_LABELS.US

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        aria-label={`Voice accent settings: ${config.accent} Voice`}
        title="Change pronunciation accent and speed"
        className={cn(
          'group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border-2 font-bold text-base shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer select-none',
          'bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200',
          className
        )}
      >
        <span className="text-lg leading-none" role="img" aria-label={config.accent}>
          {currentAccent.flag}
        </span>
        <span className="text-base font-bold tracking-tight">
          {config.accent} Voice
        </span>
        <Volume2
          className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform"
          aria-hidden="true"
        />
      </button>

      <SpeechSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
