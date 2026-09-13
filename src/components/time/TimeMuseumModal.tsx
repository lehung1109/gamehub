// src/components/time/TimeMuseumModal.tsx
'use client'

import React from 'react'
import { X, Landmark, Volume2, CheckCircle2, Lock, Sparkles } from 'lucide-react'
import type { TimeRelic } from '@/types/phonics-time'
import { useSpeech } from '@/hooks/useSpeech'

interface TimeMuseumModalProps {
  isOpen: boolean
  onClose: () => void
  relics: TimeRelic[]
  completedRelicIds: string[]
}

export function TimeMuseumModal({
  isOpen,
  onClose,
  relics,
  completedRelicIds,
}: TimeMuseumModalProps) {
  const { speak } = useSpeech()

  if (!isOpen) return null

  const completedCount = completedRelicIds.length

  const handlePronounce = (nameEn: string) => {
    speak(nameEn, 'en-US')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Viện bảo tàng không thời gian time museum"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-stone-900 border-4 border-purple-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <Landmark className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-400">
                Viện Bảo Tàng Không Thời Gian
              </h2>
              <p className="text-base text-stone-300 font-medium">
                Bộ sưu tập 12 bảo vật lịch sử nhân loại ({completedCount}/12 cổ vật)
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

        {/* Relics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relics.map((relic) => {
            const isRestored = completedRelicIds.includes(relic.id)

            return (
              <div
                key={relic.id}
                className={`p-5 rounded-3xl border-2 transition-all space-y-3 ${
                  isRestored
                    ? 'bg-stone-950/90 border-purple-400/80 shadow-md'
                    : 'bg-stone-950/40 border-stone-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{isRestored ? relic.relicEmoji : '🏺'}</span>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {relic.nameEn}
                      </h3>
                      <p className="text-base font-medium text-stone-300">
                        {isRestored ? relic.nameVi : 'Chưa phục chế trong dòng thời gian'}
                      </p>
                    </div>
                  </div>

                  {isRestored ? (
                    <button
                      type="button"
                      onClick={() => handlePronounce(relic.challenge.audioHint)}
                      aria-label={`Phát âm từ ${relic.challenge.targetWord}`}
                      className="p-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Volume2 className="size-5" />
                    </button>
                  ) : (
                    <Lock className="size-5 text-stone-500" />
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 font-bold text-base">
                    {relic.eraNameVi}
                  </span>
                  {isRestored ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-bold text-base inline-flex items-center gap-1">
                      <CheckCircle2 className="size-4" />
                      <span>Đã Phục Chế</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 font-bold text-base inline-flex items-center gap-1">
                      <Sparkles className="size-4" />
                      <span>+50 Bảo Ngọc</span>
                    </span>
                  )}
                </div>

                {isRestored && (
                  <div className="space-y-1.5 pt-2 border-t border-stone-800/80">
                    <p className="text-base text-amber-300 font-medium">
                      💡 <strong>Ngữ âm:</strong> {relic.challenge.phonicsFocus}
                    </p>
                    <p className="text-base text-stone-300 italic">
                      📖 &quot;{relic.challenge.historyFactVi}&quot;
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-stone-800">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảo tàng"
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-base transition-all cursor-pointer"
          >
            Đóng Viện Bảo Tàng
          </button>
        </div>
      </div>
    </div>
  )
}
