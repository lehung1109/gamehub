'use client'

import React, { useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { LearnerResponse } from '@/types/roleplay'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { evaluatePronunciation } from '@/lib/pronunciation-evaluator'
import { Button } from '@/components/ui/button'

export interface ResponseChoicesProps {
  options: LearnerResponse[]
  onSelect: (option: LearnerResponse) => void
  disabled?: boolean
}

export function ResponseChoices({ options, onSelect, disabled }: ResponseChoicesProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: 'en-US' })

  // Reset transcript and stop listening when options change (new question/turn)
  const prevOptionsRef = useRef(options)
  useEffect(() => {
    if (prevOptionsRef.current !== options) {
      prevOptionsRef.current = options
      resetTranscript()
      if (isListening) {
        stopListening()
      }
    }
  }, [options, isListening, stopListening, resetTranscript])

  // Stop listening and clear transcript when disabled
  useEffect(() => {
    if (disabled && isListening) {
      stopListening()
      resetTranscript()
    }
  }, [disabled, isListening, stopListening, resetTranscript])

  // Check if spoken transcript matches any option
  useEffect(() => {
    if (!isListening && transcript) {
      let matched = false
      for (const opt of options) {
        const result = evaluatePronunciation(opt.text, transcript, 70)
        if (result.isPassed) {
          matched = true
          onSelect(opt)
          resetTranscript()
          return
        }
      }
      // If voice recognition completed but no option matched, reset transcript to avoid stale leaks
      if (!matched) {
        resetTranscript()
      }
    }
  }, [isListening, transcript, options, onSelect, resetTranscript])

  const handleToggleVoice = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      resetTranscript()
      startListening()
    }
  }, [isListening, startListening, stopListening, resetTranscript])

  return (
    <div className="flex flex-col gap-3 w-full mt-4">
      {isSupported && (
        <div className="flex items-center justify-between px-1">
          <Button
            type="button"
            variant={isListening ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleToggleVoice}
            disabled={disabled}
            className="gap-2 text-xs font-semibold rounded-full"
            aria-label="Nói câu trả lời"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {isListening ? 'Đang nghe... hãy nói câu bạn chọn' : 'Nói câu trả lời (Voice)'}
          </Button>
          {isListening && interimTranscript && (
            <span className="text-xs text-muted-foreground italic font-mono max-w-[200px] truncate">
              &ldquo;{interimTranscript}&rdquo;
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 w-full">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            disabled={disabled}
            className="w-full text-left p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium text-foreground shadow-sm"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  )
}
