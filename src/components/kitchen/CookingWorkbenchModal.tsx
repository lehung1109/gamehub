// src/components/kitchen/CookingWorkbenchModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Volume2, Flame, CheckCircle2, Sparkles, Star } from 'lucide-react'
import type { KitchenRecipe } from '@/types/phonics-kitchen'
import { useSpeech } from '@/hooks/useSpeech'

interface CookingWorkbenchModalProps {
  recipe: KitchenRecipe
  isAlreadyMastered: boolean
  onCookComplete: (selectedOptionIndex: number) => void
  onClose: () => void
  playChimeSound?: () => void
  playKickSound?: () => void
}

export function CookingWorkbenchModal({
  recipe,
  isAlreadyMastered,
  onCookComplete,
  onClose,
  playChimeSound,
  playKickSound,
}: CookingWorkbenchModalProps) {
  const { speak } = useSpeech()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isSizzleActive, setIsSizzleActive] = useState(false)

  const handleSpeakChallenge = () => {
    speak(`${recipe.nameEn}! ${recipe.challenge.promptVi}`)
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)

    const correct = idx === recipe.challenge.correctOptionIndex
    setIsCorrect(correct)

    if (correct) {
      setIsSizzleActive(true)
      playChimeSound?.()
      setFeedbackMessage('Xèo xèo! Món ăn đã chín vàng thơm phức! Bạn nhận được +3 Sao Bếp Trưởng!')
      speak(`Delicious! That is ${recipe.nameEn}!`)

      setTimeout(() => {
        setIsSizzleActive(false)
        onCookComplete(idx)
      }, 1500)
    } else {
      playKickSound?.()
      setFeedbackMessage('Chưa đúng nguyên liệu rồi! Hãy lắng nghe lại âm vị và thử lại nhé!')
      speak('Check the sound again!')

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
      aria-label={`Bàn chế biến món ${recipe.nameVi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <Flame className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-2">
                <span>Nấu Món: {recipe.nameVi}</span>
                <span className="text-2xl">{recipe.emoji}</span>
              </h2>
              <p className="text-base text-slate-300 font-medium">
                {recipe.nameEn} • {recipe.phonicsFocus}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bàn chế biến món ăn"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Cooking Pan & Visual Food Stage */}
        <div
          className={`relative rounded-3xl bg-slate-950 border-2 border-dashed border-amber-400/60 p-8 flex flex-col items-center justify-center min-h-[190px] overflow-hidden transition-all ${
            isSizzleActive ? 'ring-4 ring-orange-500/60 shadow-orange-500/30 shadow-2xl' : ''
          }`}
        >
          <div className="text-center space-y-2">
            <span className="text-7xl block filter drop-shadow-md">{recipe.emoji}</span>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {recipe.ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700 text-base font-bold"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Challenge Section */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg sm:text-xl font-bold text-white">
              {recipe.challenge.promptVi}
            </p>
            <button
              type="button"
              onClick={handleSpeakChallenge}
              aria-label="Nghe câu hỏi chọn nguyên liệu"
              className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="size-6" />
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {recipe.challenge.options.map((option, idx) => {
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
              <Sparkles className="size-5 shrink-0 text-yellow-400" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {isAlreadyMastered && !feedbackMessage && (
            <p className="text-base text-emerald-400 font-bold flex items-center gap-1.5">
              <Star className="size-5 text-yellow-400 fill-yellow-400" />
              <span>Bạn đã hoàn thành xuất sắc công thức món ăn này trước đó!</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
