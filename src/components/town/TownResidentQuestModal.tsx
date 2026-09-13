// src/components/town/TownResidentQuestModal.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Volume2, CheckCircle2, Sparkles } from 'lucide-react'
import type { TownBuildingDefinition } from '@/types/phonics-town'
import { validateResidentQuest } from '@/lib/phonics-town-engine'
import { useSpeech } from '@/hooks/useSpeech'
import {
  createRhythmSynthesizer,
  SoundSynthesizer,
} from '@/lib/rhythm-beat-synthesizer'

interface TownResidentQuestModalProps {
  buildingDef: TownBuildingDefinition
  isCompleted: boolean
  onComplete: () => void
  onClose: () => void
}

export function TownResidentQuestModal({
  buildingDef,
  isCompleted,
  onComplete,
  onClose,
}: TownResidentQuestModalProps) {
  const quest = buildingDef.quest
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(
    isCompleted ? 'CORRECT' : null
  )

  const synthRef = useRef<SoundSynthesizer | null>(null)
  const { speak } = useSpeech({ rate: 0.9 })

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    // Read greeting
    if (!isCompleted && quest.greetingEn) {
      speak(quest.greetingEn)
    }
    return () => {
      void synthRef.current?.close()
    }
  }, [isCompleted, quest.greetingEn, speak])

  const handleSelectOption = (optionId: string) => {
    if (feedback === 'CORRECT' || isCompleted) return

    setSelectedOptionId(optionId)
    const isCorrect = validateResidentQuest(quest, optionId)

    if (isCorrect) {
      setFeedback('CORRECT')
      synthRef.current?.playChime()
      setTimeout(() => {
        onComplete()
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
      aria-label="Nhiệm vụ cư dân thị trấn"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header: Resident Avatar & Greeting */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{quest.npcAvatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-400">
                  {quest.npcName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-base">
                  {quest.npcRoleVi}
                </span>
              </div>
              <p className="text-base text-slate-300 font-medium">
                {buildingDef.categoryNameVi}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng nhiệm vụ cư dân"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* NPC Dialogue & Riddle */}
        <div className="space-y-3 bg-slate-950/70 rounded-2xl p-4 sm:p-5 border border-slate-800">
          <p className="text-base text-slate-300 font-medium italic">
            &quot;{quest.greetingVi}&quot;
          </p>
          <div className="flex items-start justify-between gap-3 pt-2 border-t border-slate-800/80">
            <p className="text-lg sm:text-xl font-bold text-amber-200 leading-relaxed">
              {quest.riddleVi}
            </p>
            <button
              type="button"
              onClick={() => speak(quest.riddleEn)}
              aria-label="Nghe câu đố tiếng Anh"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer shrink-0 transition-colors"
            >
              <Volume2 className="size-5" />
            </button>
          </div>
          <p className="text-base text-slate-400 italic">
            &quot;{quest.riddleEn}&quot;
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <span className="block text-base font-bold text-slate-300">
            Bé hãy chọn từ vựng chính xác để giúp cư dân:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quest.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id
              const showSuccess = isCompleted || (isSelected && feedback === 'CORRECT')
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
                  disabled={feedback === 'CORRECT' || isCompleted}
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
          <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-lg font-black text-emerald-300">
              <CheckCircle2 className="size-6" />
              <span>Tuyệt vời! Cư dân vô cùng cảm ơn Thị trưởng!</span>
            </div>
            <div className="flex items-center justify-center gap-4 pt-1 font-black text-lg text-amber-300">
              <span>+{quest.rewardBricks} 🧱 Gạch</span>
              <span>+{quest.rewardProsperity} 🌟 Thịnh vượng</span>
            </div>
          </div>
        )}

        {feedback === 'WRONG' && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-center text-lg font-black animate-pulse">
            ❌ Chưa đúng rồi! Bé hãy thử lại nhé.
          </div>
        )}

        {isCompleted && feedback !== 'CORRECT' && (
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between text-base font-bold text-emerald-400">
            <span className="flex items-center gap-2">
              <Sparkles className="size-5" />
              <span>Nhiệm vụ hôm nay đã hoàn thành xuất sắc!</span>
            </span>
            <span className="text-amber-300">Hoàn tất</span>
          </div>
        )}
      </div>
    </div>
  )
}
