// src/components/space/CosmicRoverModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Volume2, Rocket, CheckCircle2, Sparkles, Radio } from 'lucide-react'
import type { SpaceMission } from '@/types/phonics-space'
import { useSpeech } from '@/hooks/useSpeech'

interface CosmicRoverModalProps {
  mission: SpaceMission
  isAlreadyCompleted: boolean
  onMissionComplete: (selectedOptionIndex: number) => void
  onClose: () => void
  playChimeSound?: () => void
  playKickSound?: () => void
}

export function CosmicRoverModal({
  mission,
  isAlreadyCompleted,
  onMissionComplete,
  onClose,
  playChimeSound,
  playKickSound,
}: CosmicRoverModalProps) {
  const { speak } = useSpeech()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isThrusterActive, setIsThrusterActive] = useState(false)

  const handleSpeakChallenge = () => {
    speak(`${mission.nameEn}! ${mission.challenge.promptVi}`)
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return
    setSelectedOption(idx)
    setIsAnswered(true)

    const correct = idx === mission.challenge.correctOptionIndex
    setIsCorrect(correct)

    if (correct) {
      setIsThrusterActive(true)
      playChimeSound?.()
      setFeedbackMessage('Bíp bíp! Tín hiệu vũ trụ đã được giải mã! Bạn nhận được +3 Tinh Thể Không Gian!')
      speak(`Mission accomplished! That is ${mission.nameEn}!`)

      setTimeout(() => {
        setIsThrusterActive(false)
        onMissionComplete(idx)
      }, 1500)
    } else {
      playKickSound?.()
      setFeedbackMessage('Tần số chưa khớp rồi! Hãy lắng nghe lại âm vị và thử lại nhé!')
      speak('Adjust frequency and try again!')

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
      aria-label={`Trạm điều khiển nhiệm vụ ${mission.nameVi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-4 border-cyan-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <Rocket className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-cyan-400 flex items-center gap-2">
                <span>Nhiệm Vụ: {mission.nameVi}</span>
                <span className="text-2xl">{mission.emoji}</span>
              </h2>
              <p className="text-base text-slate-300 font-medium">
                {mission.nameEn} • {mission.targetPhonics}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng trạm điều khiển nhiệm vụ"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Space Radar & Landing Stage */}
        <div
          className={`relative rounded-3xl bg-slate-950 border-2 border-dashed border-cyan-400/60 p-8 flex flex-col items-center justify-center min-h-[190px] overflow-hidden transition-all ${
            isThrusterActive ? 'ring-4 ring-cyan-500/60 shadow-cyan-500/30 shadow-2xl' : ''
          }`}
        >
          <div className="text-center space-y-2">
            <span className="text-7xl block filter drop-shadow-md">{mission.emoji}</span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 text-cyan-300 border border-slate-700 text-base font-bold">
              <Radio className="size-4 animate-pulse text-cyan-400" />
              <span>{mission.storyVi}</span>
            </div>
          </div>
        </div>

        {/* Challenge Section */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg sm:text-xl font-bold text-white">
              {mission.challenge.promptVi}
            </p>
            <button
              type="button"
              onClick={handleSpeakChallenge}
              aria-label="Nghe câu hỏi giải mã tín hiệu"
              className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="size-6" />
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {mission.challenge.options.map((option, idx) => {
              const isPicked = selectedOption === idx
              let btnStyle =
                'bg-slate-700/80 hover:bg-cyan-500/20 text-white border-slate-600 hover:border-cyan-400'

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
              <Sparkles className="size-5 shrink-0 text-cyan-300" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {isAlreadyCompleted && !feedbackMessage && (
            <p className="text-base text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="size-5 text-cyan-300" />
              <span>Nhiệm vụ không gian này đã hoàn thành xuất sắc trước đó!</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
