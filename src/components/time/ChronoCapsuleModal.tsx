// src/components/time/ChronoCapsuleModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Volume2, Hourglass, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react'
import type { TimeRelic } from '@/types/phonics-time'
import { useSpeech } from '@/hooks/useSpeech'

interface ChronoCapsuleModalProps {
  relic: TimeRelic
  isOpen: boolean
  isAlreadyCompleted?: boolean
  onClose: () => void
  onComplete: (relicId: string) => void
  playChimeSound?: () => void
  playKickSound?: () => void
}

export function ChronoCapsuleModal({
  relic,
  isOpen,
  isAlreadyCompleted = false,
  onClose,
  onComplete,
  playChimeSound,
  playKickSound,
}: ChronoCapsuleModalProps) {
  const { speak } = useSpeech()
  const [selectedRuneIndices, setSelectedRuneIndices] = useState<number[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  if (!isOpen) return null

  const assembledWord = selectedRuneIndices
    .map((idx) => relic.challenge.runeScramble[idx])
    .join('')

  const handleSpeakWord = () => {
    speak(relic.challenge.audioHint, 'en-US')
  }

  const handleToggleRune = (runeIndex: number) => {
    if (isAnswered) return
    if (selectedRuneIndices.includes(runeIndex)) {
      setSelectedRuneIndices((prev) => prev.filter((i) => i !== runeIndex))
    } else {
      setSelectedRuneIndices((prev) => [...prev, runeIndex])
    }
  }

  const handleResetRunes = () => {
    if (isAnswered) return
    setSelectedRuneIndices([])
  }

  const handleCompleteRestoration = () => {
    if (isAnswered) return
    setIsAnswered(true)

    const correct = assembledWord.toUpperCase() === relic.challenge.targetWord.toUpperCase()
    setIsCorrect(correct)

    if (correct) {
      setIsRestoring(true)
      playChimeSound?.()
      setFeedbackMessage(
        'Khôi phục thành công! Dòng thời gian đã ổn định trở lại! +50 Bảo Ngọc ⏳'
      )
      speak(`Relic restored! That is ${relic.challenge.targetWord}!`, 'en-US')

      onComplete(relic.id)
      setTimeout(() => {
        setIsRestoring(false)
      }, 1500)
    } else {
      playKickSound?.()
      setFeedbackMessage(
        'Mảnh rune thời gian ghép chưa đúng thứ tự âm vị! Hãy nghe lại phát âm và ghép lại nhé!'
      )
      speak('Check the runes and try again!', 'en-US')

      setTimeout(() => {
        setIsAnswered(false)
        setFeedbackMessage(null)
        setSelectedRuneIndices([])
      }, 1800)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Hầm giải mã cổ vật ${relic.nameVi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-stone-900 border-4 border-purple-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <Hourglass className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-300">
                Giáo Sư Chronos 🕰️ & Mèo Pip 🐱
              </h2>
              <p className="text-base text-stone-400 font-medium">
                Khoang Thời Gian: {relic.nameEn} ({relic.eraNameVi})
                {isAlreadyCompleted ? ' • Đã phục chế 🏺' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng khoang thời gian"
            className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Relic Spotlight Card */}
        <div className="p-5 rounded-2xl bg-stone-950/80 border-2 border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-4xl">{relic.relicEmoji}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{relic.nameEn}</h3>
                <p className="text-base text-stone-300">{relic.nameVi}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSpeakWord}
              aria-label={`Nghe phát âm từ ${relic.challenge.targetWord.toLowerCase()}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-base font-bold transition-all shadow-sm cursor-pointer"
            >
              <Volume2 className="size-5" />
              <span>Nghe Âm</span>
            </button>
          </div>

          <p className="text-base text-amber-300 font-medium">
            💡 <strong>Quy tắc ngữ âm:</strong> {relic.challenge.phonicsFocus}
          </p>
          <p className="text-base text-stone-300 italic">
            📖 &quot;{relic.challenge.historyFactVi}&quot;
          </p>
        </div>

        {/* Assembly Rune Workspace */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-stone-300">
              Mảnh rune cổ vật đang ghép:
            </span>
            {selectedRuneIndices.length > 0 && !isAnswered && (
              <button
                type="button"
                onClick={handleResetRunes}
                aria-label="Ghép lại mảnh rune"
                className="inline-flex items-center gap-1.5 text-base font-bold text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-4" />
                <span>Ghép Lại</span>
              </button>
            )}
          </div>

          <div className="min-h-16 p-4 rounded-2xl bg-stone-950 border-2 border-stone-800 flex items-center justify-center gap-3">
            {selectedRuneIndices.length === 0 ? (
              <span className="text-base text-stone-500 font-medium italic">
                Chạm vào các mảnh rune bên dưới theo đúng thứ tự ngữ âm
              </span>
            ) : (
              selectedRuneIndices.map((idx, pos) => (
                <span
                  key={`assembled-${pos}`}
                  className="px-4 py-2 rounded-xl bg-purple-500/30 border-2 border-purple-400 text-purple-300 font-black text-xl sm:text-2xl shadow-sm tracking-wider"
                >
                  {relic.challenge.runeScramble[idx]}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Scrambled Rune Tiles */}
        <div className="space-y-2">
          <span className="text-base font-bold text-stone-300">
            Các mảnh rune trong vòng xoáy thời gian:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {relic.challenge.runeScramble.map((rune, idx) => {
              const isSelected = selectedRuneIndices.includes(idx)
              return (
                <button
                  key={`scramble-${idx}`}
                  type="button"
                  disabled={isSelected || isAnswered}
                  onClick={() => handleToggleRune(idx)}
                  aria-label={`Mảnh rune ${rune.toLowerCase()}`}
                  className={`px-5 py-3 rounded-2xl font-black text-xl sm:text-2xl border-2 transition-all shadow-md ${
                    isSelected
                      ? 'opacity-30 bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                      : 'bg-stone-800 hover:bg-purple-800/60 border-stone-600 hover:border-purple-400 text-white cursor-pointer hover:scale-105 active:scale-95'
                  }`}
                >
                  {rune}
                </button>
              )
            })}
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div
            className={`p-4 rounded-2xl text-base font-bold flex items-center gap-3 ${
              isCorrect
                ? 'bg-purple-950/80 border-2 border-purple-500 text-purple-200'
                : 'bg-rose-950/80 border-2 border-rose-500 text-rose-200'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="size-6 shrink-0 text-purple-400" />
            ) : (
              <RotateCcw className="size-6 shrink-0 text-rose-400" />
            )}
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800">
          <button
            type="button"
            onClick={onClose}
            aria-label="Hủy khôi phục"
            className="px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-base transition-all cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={selectedRuneIndices.length === 0 || isAnswered}
            onClick={handleCompleteRestoration}
            aria-label="Khôi phục bảo vật"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-base transition-all shadow-lg ${
              selectedRuneIndices.length === 0 || isAnswered
                ? 'opacity-50 bg-stone-700 text-stone-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer hover:scale-105 active:scale-95'
            }`}
          >
            <Sparkles className="size-5" />
            <span>{isRestoring ? 'Đang Khôi Phục...' : 'Khôi Phục Bảo Vật'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
