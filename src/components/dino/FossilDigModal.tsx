// src/components/dino/FossilDigModal.tsx
'use client'

import React, { useState } from 'react'
import { X, Volume2, Pickaxe, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react'
import type { DinosaurFossil } from '@/types/phonics-dino'
import { useSpeech } from '@/hooks/useSpeech'

interface FossilDigModalProps {
  fossil: DinosaurFossil
  isOpen: boolean
  isAlreadyCompleted?: boolean
  onClose: () => void
  onComplete: (fossilId: string) => void
  playChimeSound?: () => void
  playKickSound?: () => void
}

export function FossilDigModal({
  fossil,
  isOpen,
  isAlreadyCompleted = false,
  onClose,
  onComplete,
  playChimeSound,
  playKickSound,
}: FossilDigModalProps) {
  const { speak } = useSpeech()
  const [selectedBoneIndices, setSelectedBoneIndices] = useState<number[]>([])
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [isResurrecting, setIsResurrecting] = useState(false)

  if (!isOpen) return null

  const assembledWord = selectedBoneIndices
    .map((idx) => fossil.challenge.boneScramble[idx])
    .join('')

  const handleSpeakWord = () => {
    speak(fossil.challenge.audioHint, 'en-US')
  }

  const handleToggleBone = (boneIndex: number) => {
    if (isAnswered) return
    if (selectedBoneIndices.includes(boneIndex)) {
      setSelectedBoneIndices((prev) => prev.filter((i) => i !== boneIndex))
    } else {
      setSelectedBoneIndices((prev) => [...prev, boneIndex])
    }
  }

  const handleResetBones = () => {
    if (isAnswered) return
    setSelectedBoneIndices([])
  }

  const handleCompleteExcavation = () => {
    if (isAnswered) return
    setIsAnswered(true)

    const correct = assembledWord.toUpperCase() === fossil.challenge.targetWord.toUpperCase()
    setIsCorrect(correct)

    if (correct) {
      setIsResurrecting(true)
      playChimeSound?.()
      setFeedbackMessage(
        'Khai quật thành công! Hóa thạch đã được hồi sinh nguyên vẹn! +50 Hổ Phách 💎'
      )
      speak(`Fossil excavated! That is ${fossil.challenge.targetWord}!`, 'en-US')

      onComplete(fossil.id)
      setTimeout(() => {
        setIsResurrecting(false)
      }, 1500)
    } else {
      playKickSound?.()
      setFeedbackMessage(
        'Đốt xương ghép chưa đúng vị trí giải phẫu! Hãy nghe lại phát âm và ghép lại nhé!'
      )
      speak('Check the bones and try again!', 'en-US')

      setTimeout(() => {
        setIsAnswered(false)
        setFeedbackMessage(null)
        setSelectedBoneIndices([])
      }, 1800)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Hầm khai quật hóa thạch ${fossil.nameVi}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-stone-900 border-4 border-emerald-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Pickaxe className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-300">
                Tiến Sĩ Rex 🦖 & Chippy 🤖
              </h2>
              <p className="text-base text-stone-400 font-medium">
                Hầm Khảo Cổ: {fossil.nameEn} ({fossil.eraNameVi})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hầm khai quật"
            className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Fossil Spotlight Card */}
        <div className="p-5 rounded-2xl bg-stone-950/80 border-2 border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-4xl">{fossil.dinoEmoji}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{fossil.nameEn}</h3>
                <p className="text-base text-stone-300">{fossil.nameVi}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSpeakWord}
              aria-label={`Nghe phát âm từ ${fossil.challenge.targetWord.toLowerCase()}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition-all shadow-sm cursor-pointer"
            >
              <Volume2 className="size-5" />
              <span>Nghe Âm</span>
            </button>
          </div>

          <p className="text-base text-amber-300 font-medium">
            💡 <strong>Quy tắc ngữ âm:</strong> {fossil.challenge.phonicsFocus}
          </p>
          <p className="text-base text-stone-300 italic">
            📖 &quot;{fossil.challenge.paleoFactVi}&quot;
          </p>
        </div>

        {/* Assembly Bone Workspace */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-stone-300">
              Khung xương hóa thạch đang ráp:
            </span>
            {selectedBoneIndices.length > 0 && !isAnswered && (
              <button
                type="button"
                onClick={handleResetBones}
                aria-label="Đào lại mảnh xương"
                className="inline-flex items-center gap-1.5 text-base font-bold text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-4" />
                <span>Đào Lại</span>
              </button>
            )}
          </div>

          <div className="min-h-16 p-4 rounded-2xl bg-stone-950 border-2 border-stone-800 flex items-center justify-center gap-3">
            {selectedBoneIndices.length === 0 ? (
              <span className="text-base text-stone-500 font-medium italic">
                Chạm vào các mảnh xương bên dưới theo đúng thứ tự âm thanh
              </span>
            ) : (
              selectedBoneIndices.map((idx, pos) => (
                <span
                  key={`assembled-${pos}`}
                  className="px-4 py-2 rounded-xl bg-emerald-500/30 border-2 border-emerald-400 text-emerald-300 font-black text-xl sm:text-2xl shadow-sm tracking-wider"
                >
                  {fossil.challenge.boneScramble[idx]}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Scrambled Bone Tiles */}
        <div className="space-y-2">
          <span className="text-base font-bold text-stone-300">
            Các mảnh xương trong lớp đá sa thạch:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {fossil.challenge.boneScramble.map((bone, idx) => {
              const isSelected = selectedBoneIndices.includes(idx)
              return (
                <button
                  key={`scramble-${idx}`}
                  type="button"
                  disabled={isSelected || isAnswered}
                  onClick={() => handleToggleBone(idx)}
                  aria-label={`Mảnh xương ${bone.toLowerCase()}`}
                  className={`px-5 py-3 rounded-2xl font-black text-xl sm:text-2xl border-2 transition-all shadow-md ${
                    isSelected
                      ? 'opacity-30 bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                      : 'bg-stone-800 hover:bg-emerald-800/60 border-stone-600 hover:border-emerald-400 text-white cursor-pointer hover:scale-105 active:scale-95'
                  }`}
                >
                  {bone}
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
                ? 'bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/80 border-2 border-rose-500 text-rose-200'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="size-6 shrink-0 text-emerald-400" />
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
            aria-label="Hủy khai quật"
            className="px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-base transition-all cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={selectedBoneIndices.length === 0 || isAnswered}
            onClick={handleCompleteExcavation}
            aria-label="Hoàn thành khai quật"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-base transition-all shadow-lg ${
              selectedBoneIndices.length === 0 || isAnswered
                ? 'opacity-50 bg-stone-700 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:scale-105 active:scale-95'
            }`}
          >
            <Sparkles className="size-5" />
            <span>{isResurrecting ? 'Đang Hồi Sinh...' : 'Hoàn Thành Khai Quật'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
