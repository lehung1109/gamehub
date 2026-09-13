'use client'

import React, { useSyncExternalStore } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

export interface MicPulseButtonProps {
  isListening: boolean
  isProcessing?: boolean
  isSupported: boolean
  onToggleListen: () => void
}

const emptySubscribe = () => () => {}

export function MicPulseButton({
  isListening,
  isProcessing = false,
  isSupported,
  onToggleListen,
}: MicPulseButtonProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const effectiveSupported = isClient ? isSupported : true

  const getStatusLabel = () => {
    if (!effectiveSupported) {
      return 'Trình duyệt không hỗ trợ micro. Bạn hãy gõ bàn phím bên dưới nhé!'
    }
    if (isProcessing) {
      return 'Đang xử lý và chấm điểm phát âm...'
    }
    if (isListening) {
      return 'Đang lắng nghe... Hãy nói tiếng Anh nhé! (Bấm lại để dừng)'
    }
    return 'Bấm micro để bắt đầu nói tiếng Anh'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2">
      {/* Mic Button with Animated Pulse Rings */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Concentric Rings */}
        {isListening && effectiveSupported && (
          <>
            <div className="absolute -inset-4 rounded-full bg-rose-500/20 animate-ping pointer-events-none" />
            <div className="absolute -inset-8 rounded-full bg-rose-500/10 animate-pulse pointer-events-none" />
          </>
        )}

        <button
          type="button"
          data-testid="mic-pulse-button"
          disabled={!effectiveSupported || isProcessing}
          onClick={onToggleListen}
          className={`relative z-10 size-20 sm:size-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50 ${
            !effectiveSupported
              ? 'bg-muted text-muted-foreground border-2 border-border cursor-not-allowed'
              : isProcessing
              ? 'bg-amber-500 text-white shadow-amber-500/30 cursor-wait animate-pulse'
              : isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/50 scale-105 active:scale-95 ring-4 ring-rose-300 dark:ring-rose-800 animate-pulse'
              : 'bg-linear-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/40 hover:scale-105 active:scale-95'
          }`}
          aria-label={
            !effectiveSupported
              ? 'Microphone không được hỗ trợ'
              : isListening
              ? 'Dừng ghi âm và gửi'
              : 'Bắt đầu ghi âm giọng nói'
          }
        >
          {!effectiveSupported ? (
            <MicOff className="size-9 sm:size-10" />
          ) : isProcessing ? (
            <Loader2 className="size-9 sm:size-10 animate-spin" />
          ) : (
            <Mic className={`size-9 sm:size-10 ${isListening ? 'animate-bounce' : ''}`} />
          )}
        </button>
      </div>

      {/* Status Label */}
      <div
        data-testid="mic-status-label"
        className="text-center px-4 max-w-md"
      >
        <p
          className={`text-base sm:text-lg font-bold transition-colors ${
            !effectiveSupported
              ? 'text-rose-600 dark:text-rose-400'
              : isProcessing
              ? 'text-amber-600 dark:text-amber-400 font-black'
              : isListening
              ? 'text-rose-600 dark:text-rose-400 font-black animate-pulse'
              : 'text-muted-foreground'
          }`}
        >
          {getStatusLabel()}
        </p>
      </div>
    </div>
  )
}
