// src/components/safari/SafariFieldGuideModal.tsx
'use client'

import React from 'react'
import { X, BookOpen, Volume2, CheckCircle2, Lock, Sparkles } from 'lucide-react'
import { getAllAnimals } from '@/lib/phonics-safari-engine'
import { useSpeech } from '@/hooks/useSpeech'

interface SafariFieldGuideModalProps {
  photographedAnimalIds: string[]
  onClose: () => void
}

export function SafariFieldGuideModal({
  photographedAnimalIds,
  onClose,
}: SafariFieldGuideModalProps) {
  const { speak } = useSpeech()
  const allAnimals = getAllAnimals()
  const capturedCount = photographedAnimalIds.length

  const handlePronounce = (nameEn: string, syllables: string[]) => {
    speak(`${nameEn}. ${syllables.join(', ')}. ${nameEn}`, { rate: 0.85 })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sổ tay bách khoa động vật Safari"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900 border-4 border-emerald-500 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <BookOpen className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-400">
                Sổ Tay Bách Khoa Động Vật Safari
              </h2>
              <p className="text-base text-slate-300 font-medium">
                Bộ sưu tập ảnh động vật hoang dã & quy tắc ngữ âm tiếng Anh ({capturedCount}/16 loài)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng sổ tay bách khoa"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Animal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAnimals.map((animal) => {
            const isCaptured = photographedAnimalIds.includes(animal.id)

            if (!isCaptured) {
              return (
                <div
                  key={animal.id}
                  className="p-5 rounded-3xl bg-slate-800/40 border-2 border-dashed border-slate-700 flex items-center gap-4 opacity-75"
                >
                  <div className="size-18 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl grayscale">
                    <Lock className="size-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-400">
                      Sinh Vật Bí Ẩn ({animal.biome.toUpperCase()})
                    </h3>
                    <p className="text-base text-slate-500">
                      Hãy ghé thăm sinh cảnh và dùng kính ngắm máy ảnh để chụp lại!
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={animal.id}
                className="p-5 rounded-3xl bg-slate-800/90 border-2 border-emerald-500/60 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-5xl">{animal.emoji}</span>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{animal.nameVi}</span>
                        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      </h3>
                      <p className="text-base font-bold text-amber-300">
                        {animal.nameEn} ({animal.syllables.join(' - ')})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePronounce(animal.nameEn, animal.syllables)}
                    aria-label={`Nghe phát âm ${animal.nameEn}`}
                    className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Phonics Rule */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-base text-slate-200">
                  <span className="text-amber-400 font-bold">🎯 Quy tắc âm: </span>
                  {animal.challenge.phoneticRuleVi}
                </div>

                {/* Fun Fact */}
                <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-900/60 text-base text-emerald-200 flex items-start gap-2">
                  <Sparkles className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{animal.challenge.funFactVi}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
