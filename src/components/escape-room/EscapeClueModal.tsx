// src/components/escape-room/EscapeClueModal.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Volume2, CheckCircle2, Sparkles } from 'lucide-react'
import type { EscapeClueHotspot } from '@/types/phonics-escape-room'
import { validateClueAnswer } from '@/lib/phonics-escape-room-engine'
import { useSpeech } from '@/hooks/useSpeech'
import {
  createRhythmSynthesizer,
  SoundSynthesizer,
} from '@/lib/rhythm-beat-synthesizer'

interface EscapeClueModalProps {
  hotspot: EscapeClueHotspot
  isSolved: boolean
  onSolveClue: (char: string) => void
  onClose: () => void
}

export function EscapeClueModal({
  hotspot,
  isSolved,
  onSolveClue,
  onClose,
}: EscapeClueModalProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(
    isSolved ? 'CORRECT' : null
  )

  const synthRef = useRef<SoundSynthesizer | null>(null)
  const { speak } = useSpeech({ rate: 0.9 })

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const handleSelectOption = (optionId: string) => {
    if (feedback === 'CORRECT') return

    setSelectedOptionId(optionId)
    const isCorrect = validateClueAnswer(hotspot, optionId)

    if (isCorrect) {
      setFeedback('CORRECT')
      synthRef.current?.playChime()
      setTimeout(() => {
        onSolveClue(hotspot.unlockedCipherChar)
      }, 1200)
    } else {
      setFeedback('WRONG')
      synthRef.current?.playKick()
      setTimeout(() => {
        setFeedback(null)
        setSelectedOptionId(null)
      }, 1000)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Khám phá manh mối thám tử"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{hotspot.icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400">
                {hotspot.titleVi}
              </h2>
              <span className="text-base text-slate-400 font-bold">
                {hotspot.titleEn}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng manh mối"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Riddle Content */}
        <div className="space-y-3 bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg sm:text-xl font-bold text-amber-200 leading-relaxed">
              {hotspot.riddleVi}
            </p>
            <button
              type="button"
              onClick={() => speak(hotspot.riddleEn)}
              aria-label="Nghe câu đố tiếng Anh"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer shrink-0 transition-colors"
            >
              <Volume2 className="size-5" />
            </button>
          </div>
          <p className="text-base text-slate-400 italic">
            &quot;{hotspot.riddleEn}&quot;
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <span className="block text-base font-bold text-slate-300">
            Bé hãy chọn câu trả lời đúng để giải mã ký tự:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {hotspot.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id
              const showSuccess = isSolved || (isSelected && feedback === 'CORRECT')
              const showError = isSelected && feedback === 'WRONG'

              let btnStyle = 'bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-700'
              if (showSuccess) {
                btnStyle = 'bg-emerald-600 text-white border-2 border-emerald-400 scale-105 shadow-lg shadow-emerald-600/30'
              } else if (showError) {
                btnStyle = 'bg-rose-600 text-white border-2 border-rose-400 animate-shake'
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={feedback === 'CORRECT' || isSolved}
                  className={`p-4 rounded-2xl font-black text-lg flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${btnStyle}`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <span>{opt.text}</span>
                  <span className="text-base font-medium text-slate-300">
                    {opt.phonicsHint}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Feedback Display */}
        {feedback === 'CORRECT' && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 space-y-2 text-emerald-200">
            <div className="flex items-center gap-2 text-lg font-black text-emerald-300">
              <CheckCircle2 className="size-6" />
              <span>Chính xác! Đã mở khóa mảnh mật mã!</span>
            </div>
            <p className="text-base font-medium">{hotspot.explanationVi}</p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-base font-bold text-slate-300">
                Ký tự bí mật nhận được:
              </span>
              <span className="size-12 rounded-xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
                {hotspot.unlockedCipherChar}
              </span>
            </div>
          </div>
        )}

        {feedback === 'WRONG' && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-center text-lg font-black animate-pulse">
            ❌ Chưa đúng rồi! Bé hãy suy nghĩ lại nhé.
          </div>
        )}

        {isSolved && feedback !== 'CORRECT' && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800 border border-slate-700">
            <span className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Sparkles className="size-5" />
              <span>Manh mối này đã được giải mã!</span>
            </span>
            <span className="size-10 rounded-xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center">
              {hotspot.unlockedCipherChar}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
