// src/components/dino/DinoMuseumModal.tsx
'use client'

import React from 'react'
import { X, Landmark, Volume2, CheckCircle2, Lock, Sparkles } from 'lucide-react'
import type { DinosaurFossil, DinoDietType } from '@/types/phonics-dino'
import { useSpeech } from '@/hooks/useSpeech'

interface DinoMuseumModalProps {
  isOpen: boolean
  onClose: () => void
  fossils: DinosaurFossil[]
  completedFossilIds: string[]
}

export function DinoMuseumModal({
  isOpen,
  onClose,
  fossils,
  completedFossilIds,
}: DinoMuseumModalProps) {
  const { speak } = useSpeech()

  if (!isOpen) return null

  const completedCount = completedFossilIds.length

  const handlePronounce = (nameEn: string) => {
    speak(nameEn, 'en-US')
  }

  const dietMap: Record<DinoDietType, { label: string; style: string }> = {
    carnivore: { label: 'Ăn Thịt 🥩', style: 'bg-rose-900/60 text-rose-300 border-rose-700' },
    herbivore: { label: 'Ăn Cỏ 🌿', style: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
    piscivore: { label: 'Ăn Cá 🐟', style: 'bg-cyan-900/60 text-cyan-300 border-cyan-700' },
    omnivore: { label: 'Ăn Tạp 🌾', style: 'bg-amber-900/60 text-amber-300 border-amber-700' },
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Viện bảo tàng khủng long và tiền sử"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-stone-900 border-4 border-emerald-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Landmark className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-400">
                Viện Bảo Tàng Khủng Long & Tiền Sử
              </h2>
              <p className="text-base text-stone-300 font-medium">
                Bộ sưu tập 12 hóa thạch sinh vật cổ đại phục chế ({completedCount}/12 hóa thạch)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng viện bảo tàng"
            className="p-2 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Fossils Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fossils.map((fossil) => {
            const isCompleted = completedFossilIds.includes(fossil.id)
            const diet = dietMap[fossil.diet] || dietMap.herbivore

            if (!isCompleted) {
              return (
                <div
                  key={fossil.id}
                  className="p-5 rounded-3xl bg-stone-800/40 border-2 border-dashed border-stone-700 flex items-center gap-4 opacity-75"
                >
                  <div className="size-18 rounded-2xl bg-stone-800 flex items-center justify-center text-4xl grayscale shrink-0">
                    <Lock className="size-8 text-stone-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-stone-400">
                      {fossil.nameEn} ({fossil.eraNameVi})
                    </h3>
                    <p className="text-base text-stone-500">
                      Mẫu hóa thạch chưa khai quật! Hãy đến hầm khảo cổ tương ứng để giải mã và phục chế mẫu vật này.
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={fossil.id}
                className="p-5 rounded-3xl bg-stone-800/90 border-2 border-emerald-400/60 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-5xl shrink-0">{fossil.dinoEmoji}</span>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{fossil.nameVi}</span>
                        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      </h3>
                      <p className="text-base font-bold text-emerald-300">
                        {fossil.nameEn}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePronounce(fossil.nameEn)}
                    aria-label={`Nghe phát âm ${fossil.nameEn}`}
                    className="p-2.5 rounded-xl bg-stone-700 hover:bg-emerald-600 text-white transition-colors cursor-pointer shrink-0"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span
                    className={`px-3 py-1 rounded-xl border text-base font-bold shadow-xs ${diet.style}`}
                  >
                    {diet.label}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-stone-700/60 border border-stone-600 text-stone-300 text-base font-bold">
                    {fossil.eraNameVi}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-amber-900/60 border border-amber-600 text-amber-300 text-base font-bold inline-flex items-center gap-1">
                    <Sparkles className="size-4" />
                    <span>+50 Hổ Phách</span>
                  </span>
                </div>

                <p className="text-base text-stone-300 font-medium">
                  {fossil.descriptionVi}
                </p>

                <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                  <p className="text-base text-emerald-300 font-bold">
                    Âm tiết: {fossil.challenge.phoneticBreakdown.join(' - ')}
                  </p>
                  <p className="text-base text-stone-400 italic">
                    &quot;{fossil.challenge.paleoFactVi}&quot;
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
