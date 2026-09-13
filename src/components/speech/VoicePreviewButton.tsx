'use client'

import React from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface VoicePreviewButtonProps {
  onPreview?: (sampleText?: string) => void
  isSpeaking?: boolean
  sampleText?: string
  className?: string
}

export function VoicePreviewButton({
  onPreview,
  isSpeaking = false,
  sampleText = 'Hello! Welcome to GameHub English.',
  className,
}: VoicePreviewButtonProps) {
  const handleClick = () => {
    onPreview?.(sampleText)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSpeaking}
      aria-label="Preview voice pronunciation"
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-base transition-all duration-200 cursor-pointer shadow-sm',
        'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 border-2 border-indigo-200',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
    >
      {isSpeaking ? (
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" aria-hidden="true" />
      ) : (
        <Volume2 className="w-5 h-5 text-indigo-600" aria-hidden="true" />
      )}
      <span>{isSpeaking ? 'Playing...' : 'Preview Voice'}</span>
    </button>
  )
}
