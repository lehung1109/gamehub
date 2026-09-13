// src/components/escape-room/EscapeCipherKeypad.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Lock, Unlock, Delete, KeyRound } from 'lucide-react'
import {
  createRhythmSynthesizer,
  SoundSynthesizer,
} from '@/lib/rhythm-beat-synthesizer'

interface EscapeCipherKeypadProps {
  masterCipherWord: string
  cipherHintVi: string
  unlockedChars: Set<string>
  onUnlockSuccess: () => void
  onClose: () => void
}

export function EscapeCipherKeypad({
  masterCipherWord,
  cipherHintVi,
  unlockedChars,
  onUnlockSuccess,
  onClose,
}: EscapeCipherKeypadProps) {
  const [enteredChars, setEnteredChars] = useState<string[]>([])
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE')

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const wordLength = masterCipherWord.length
  const keyboardLetters = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z',
  ]

  const handleKeyPress = (letter: string) => {
    if (status === 'SUCCESS' || enteredChars.length >= wordLength) return

    const newChars = [...enteredChars, letter]
    setEnteredChars(newChars)

    if (newChars.length === wordLength) {
      const candidateWord = newChars.join('')
      if (candidateWord.toUpperCase() === masterCipherWord.toUpperCase()) {
        setStatus('SUCCESS')
        synthRef.current?.playChime()
        setTimeout(() => {
          onUnlockSuccess()
        }, 1500)
      } else {
        setStatus('ERROR')
        synthRef.current?.playKick()
        setTimeout(() => {
          setStatus('IDLE')
          setEnteredChars([])
        }, 1200)
      }
    }
  }

  const handleDelete = () => {
    if (status === 'SUCCESS') return
    setEnteredChars((prev) => prev.slice(0, -1))
    setStatus('IDLE')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ổ khóa mật mã cửa thoát hiểm"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <KeyRound className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400">
                Ổ Khóa Mật Mã Cửa Thoát Hiểm
              </h2>
              <p className="text-base text-slate-300 font-medium">
                Nhập từ tiếng Anh 4 chữ cái để mở cửa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bàn phím mật mã"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Hint Box */}
        <div className="p-4 rounded-2xl bg-amber-950/60 border-2 border-amber-400/40 text-amber-200 space-y-1">
          <span className="block text-base font-bold text-amber-400">
            💡 Gợi ý mật mã từ thám tử:
          </span>
          <p className="text-base font-medium">{cipherHintVi}</p>
        </div>

        {/* Password Display Slots */}
        <div className="flex items-center justify-center gap-3 py-2">
          {Array.from({ length: wordLength }).map((_, idx) => {
            const char = enteredChars[idx] || ''
            let slotStyle = 'bg-slate-950 border-2 border-slate-700 text-white'
            if (status === 'SUCCESS') {
              slotStyle = 'bg-emerald-600 border-2 border-emerald-400 text-white shadow-lg shadow-emerald-600/50 scale-105'
            } else if (status === 'ERROR') {
              slotStyle = 'bg-rose-600 border-2 border-rose-400 text-white animate-shake'
            } else if (char) {
              slotStyle = 'bg-slate-800 border-2 border-amber-400 text-amber-300 shadow-md'
            }

            return (
              <div
                key={idx}
                data-testid={`cipher-display-slot-${idx}`}
                className={`size-16 rounded-2xl flex items-center justify-center text-3xl font-black transition-all ${slotStyle}`}
              >
                {char}
              </div>
            )
          })}
        </div>

        {/* Status Toast */}
        {status === 'SUCCESS' && (
          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-950 border-2 border-emerald-500 text-emerald-300 font-black text-lg animate-bounce">
            <Unlock className="size-6" />
            <span>MẬT MÃ CHÍNH XÁC! CỬA ĐANG MỞ...</span>
          </div>
        )}
        {status === 'ERROR' && (
          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-950 border-2 border-rose-500 text-rose-300 font-black text-lg animate-shake">
            <Lock className="size-6" />
            <span>MẬT MÃ SAI! VUI LÒNG THỬ LẠI!</span>
          </div>
        )}

        {/* Virtual Keyboard */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {keyboardLetters.map((char) => {
              const isUnlockedClue = unlockedChars.has(char)
              return (
                <button
                  key={char}
                  type="button"
                  onClick={() => handleKeyPress(char)}
                  disabled={status === 'SUCCESS'}
                  aria-label={`Ký tự ${char}`}
                  className={`size-11 sm:size-12 rounded-xl font-black text-lg flex items-center justify-center cursor-pointer transition-all ${
                    isUnlockedClue
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 ring-2 ring-amber-300 shadow-md scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {char}
                </button>
              )
            })}
            <button
              type="button"
              onClick={handleDelete}
              disabled={status === 'SUCCESS' || enteredChars.length === 0}
              aria-label="Xóa ký tự vừa nhập"
              className="px-4 h-11 sm:h-12 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white font-bold text-base flex items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-700"
            >
              <Delete className="size-5" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
