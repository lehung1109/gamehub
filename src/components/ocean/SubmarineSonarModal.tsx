// src/components/ocean/SubmarineSonarModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Volume2, Waves, CheckCircle2, Sparkles, RotateCcw } from 'lucide-react'
import type { OceanMission } from '@/types/phonics-ocean'
import { useSpeech } from '@/hooks/useSpeech'

interface SubmarineSonarModalProps {
  mission: OceanMission
  isAlreadyCompleted: boolean
  onMissionComplete: () => void
  onClose: () => void
  playChimeSound?: () => void
  playKickSound?: () => void
}

export function SubmarineSonarModal({
  mission,
  isAlreadyCompleted,
  onMissionComplete,
  onClose,
  playChimeSound,
  playKickSound,
}: SubmarineSonarModalProps) {
  const { speak } = useSpeech()
  const [selectedBubbleIndices, setSelectedBubbleIndices] = useState<number[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isSonarPulsing, setIsSonarPulsing] = useState(false)

  const assembledWord = selectedBubbleIndices
    .map((idx) => mission.challenge.bubbleScramble[idx])
    .join('')

  const handleSpeakTargetWord = () => {
    speak(`${mission.challenge.audioHint}! ${mission.challenge.vietnameseMeaning}`)
  }

  const handleToggleBubble = (bubbleIndex: number) => {
    if (isAnswered) return
    if (selectedBubbleIndices.includes(bubbleIndex)) {
      setSelectedBubbleIndices((prev) => prev.filter((i) => i !== bubbleIndex))
    } else {
      setSelectedBubbleIndices((prev) => [...prev, bubbleIndex])
    }
  }

  const handleResetBubbles = () => {
    if (isAnswered) return
    setSelectedBubbleIndices([])
  }

  const handleVerifyAnswer = () => {
    if (isAnswered) return
    setIsAnswered(true)

    const correct = assembledWord.toUpperCase() === mission.challenge.targetWord.toUpperCase()
    setIsCorrect(correct)

    if (correct) {
      setIsSonarPulsing(true)
      playChimeSound?.()
      setFeedbackMessage(
        `Tuyệt vời! Bạn đã mở khóa ${mission.creatureName}! +50 Ngọc Trai Đại Dương 🦪`
      )
      speak(`Sonar locked! That is ${mission.challenge.targetWord}!`)

      setTimeout(() => {
        setIsSonarPulsing(false)
        onMissionComplete()
      }, 1600)
    } else {
      playKickSound?.()
      setFeedbackMessage('Sóng âm chưa khớp! Hãy nghe lại phát âm và ghép các bọt khí nhé!')
      speak('Adjust sonar and try again!')

      setTimeout(() => {
        setIsAnswered(false)
        setFeedbackMessage(null)
        setSelectedBubbleIndices([])
      }, 1800)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Trạm sonar tàu ngầm ${mission.nameVi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-4 border-cyan-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <Waves className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-cyan-400 flex items-center gap-2">
                <span>{mission.nameVi}</span>
                <span className="text-2xl">{mission.creatureEmoji}</span>
              </h2>
              <p className="text-base text-slate-300 font-medium">
                {mission.nameEn} • Độ sâu: {mission.depthMeters}m
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng trạm sonar tàu ngầm"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Sonar Radar Screen */}
        <div
          className={`relative rounded-3xl bg-slate-950 border-2 border-dashed border-cyan-400/60 p-6 flex flex-col items-center justify-center min-h-[190px] overflow-hidden transition-all ${
            isSonarPulsing ? 'ring-4 ring-cyan-500/60 shadow-cyan-500/30 shadow-2xl' : ''
          }`}
        >
          <div className="text-center space-y-3">
            <span className="text-7xl block filter drop-shadow-md">{mission.creatureEmoji}</span>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 text-cyan-300 border border-slate-700 text-base font-bold">
              <span>{mission.descriptionVi}</span>
            </div>
          </div>
        </div>

        {/* Decoder Chamber */}
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-base font-bold text-cyan-300 uppercase tracking-wide block">
                {mission.challenge.phonicsFocus}
              </span>
              <p className="text-lg sm:text-xl font-bold text-white">
                Ý nghĩa: {mission.challenge.vietnameseMeaning}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSpeakTargetWord}
              aria-label={`Nghe phát âm từ ${mission.challenge.targetWord}`}
              className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shrink-0 transition-transform active:scale-95 cursor-pointer"
            >
              <Volume2 className="size-6" />
            </button>
          </div>

          {/* Assembled Word Slot */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 min-h-[64px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-400 mr-2">Từ Đã Ghép:</span>
              {assembledWord ? (
                <span className="text-2xl font-black text-cyan-300 tracking-wider">
                  {assembledWord}
                </span>
              ) : (
                <span className="text-base text-slate-500 italic">
                  Chạm các bọt khí bên dưới để ghép từ...
                </span>
              )}
            </div>

            {selectedBubbleIndices.length > 0 && !isAnswered && (
              <button
                type="button"
                onClick={handleResetBubbles}
                aria-label="Xóa từ đang ghép"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="size-5" />
              </button>
            )}
          </div>

          {/* Floating Bubble Scramble Rack */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {mission.challenge.bubbleScramble.map((chunk, idx) => {
              const isSelected = selectedBubbleIndices.includes(idx)

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleToggleBubble(idx)}
                  className={`px-5 py-3 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-cyan-600 border-cyan-300 text-white scale-95 opacity-50'
                      : 'bg-slate-700/90 hover:bg-cyan-500/20 text-white border-slate-600 hover:border-cyan-400 hover:scale-105'
                  }`}
                >
                  🫧 {chunk}
                </button>
              )
            })}
          </div>

          {/* Verification Action Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isAnswered || selectedBubbleIndices.length === 0}
              onClick={handleVerifyAnswer}
              className={`w-full py-4 rounded-2xl font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-2 ${
                isAnswered || selectedBubbleIndices.length === 0
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-lg cursor-pointer hover:scale-[1.01] active:scale-98'
              }`}
            >
              <Waves className="size-6" />
              <span>Phát Sóng Sonar Khóa Mục Tiêu</span>
            </button>
          </div>

          {/* Feedback Section */}
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
            <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-teal-200 font-bold text-base flex items-center gap-2">
              <CheckCircle2 className="size-5 text-teal-300 shrink-0" />
              <span>{mission.challenge.marineFact}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
