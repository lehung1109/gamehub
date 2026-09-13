// src/components/safari/SafariCameraModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Volume2, Camera, CheckCircle2, Sparkles } from 'lucide-react'
import type { SafariAnimal } from '@/types/phonics-safari'
import { useSpeech } from '@/hooks/useSpeech'

interface SafariCameraModalProps {
  animal: SafariAnimal
  isAlreadyCaptured: boolean
  onCapture: (selectedOptionIndex: number) => void
  onClose: () => void
  playChimeSound?: () => void
  playKickSound?: () => void
}

export function SafariCameraModal({
  animal,
  isAlreadyCaptured,
  onCapture,
  onClose,
  playChimeSound,
  playKickSound,
}: SafariCameraModalProps) {
  const { speak } = useSpeech()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isFlashActive, setIsFlashActive] = useState(false)

  const handleSpeakChallenge = () => {
    speak(`${animal.nameEn}! ${animal.challenge.question}`)
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)

    const correct = idx === animal.challenge.correctOptionIndex
    setIsCorrect(correct)

    if (correct) {
      setIsFlashActive(true)
      playChimeSound?.()
      setFeedbackMessage('Tách! Bức ảnh tuyệt đẹp! Bạn đã giải mã chính xác âm vị!')
      speak(`Excellent! That is ${animal.nameEn}!`)

      setTimeout(() => {
        setIsFlashActive(false)
        onCapture(idx)
      }, 1500)
    } else {
      playKickSound?.()
      setFeedbackMessage('Chưa đúng rồi! Hãy quan sát kỹ và thử lại nhé!')
      speak('Try again!')

      setTimeout(() => {
        setIsAnswered(false)
        setSelectedOption(null)
        setFeedbackMessage(null)
      }, 1800)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Kính ngắm máy ảnh chụp ${animal.nameVi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      {/* Camera Flash Overlay */}
      {isFlashActive && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-60 bg-white pointer-events-none animate-pulse transition-opacity duration-300"
        />
      )}

      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Viewfinder Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <Camera className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2">
                <span>Kính Ngắm Safari: {animal.nameVi}</span>
                <span className="text-2xl">{animal.emoji}</span>
              </h2>
              <p className="text-base text-slate-300 font-medium">
                {animal.nameEn} • {animal.phonicsFocus}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng kính ngắm máy ảnh"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Viewfinder Lens View */}
        <div className="relative rounded-3xl bg-slate-950 border-2 border-dashed border-amber-400/60 p-8 flex flex-col items-center justify-center min-h-[180px] overflow-hidden">
          {/* Corner Crosshairs */}
          <div className="absolute top-4 left-4 size-6 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-4 right-4 size-6 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-4 left-4 size-6 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-4 right-4 size-6 border-b-2 border-r-2 border-amber-400" />

          <div className="text-center space-y-2">
            <span className="text-7xl block filter drop-shadow-md">{animal.emoji}</span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 text-base font-bold">
              <span>{animal.syllables.join(' • ')}</span>
            </div>
          </div>
        </div>

        {/* Challenge Question & Audio */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg sm:text-xl font-bold text-white">
              {animal.challenge.question}
            </p>
            <button
              type="button"
              onClick={handleSpeakChallenge}
              aria-label="Nghe câu hỏi thám hiểm"
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="size-6" />
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {animal.challenge.options.map((option, idx) => {
              const isPicked = selectedOption === idx
              let btnStyle =
                'bg-slate-700/80 hover:bg-amber-500/20 text-white border-slate-600 hover:border-amber-400'

              if (isAnswered && isPicked) {
                btnStyle = isCorrect
                  ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-300'
                  : 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-300'
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && isPicked && isCorrect && (
                    <CheckCircle2 className="size-5 text-emerald-200" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div
              className={`p-4 rounded-2xl border font-bold text-base flex items-center gap-2 ${
                isCorrect
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}
            >
              <Sparkles className="size-5 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {isAlreadyCaptured && !feedbackMessage && (
            <p className="text-base text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="size-5" />
              <span>Bạn đã chụp thành công bức ảnh loài động vật này trước đó!</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
