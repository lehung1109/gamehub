// src/components/magic/AncientGrimoireModal.tsx
'use client'

import React from 'react'
import { X, BookOpen, Volume2, CheckCircle2, Lock, Sparkles } from 'lucide-react'
import { getAllSpells } from '@/lib/phonics-magic-engine'
import { useSpeech } from '@/hooks/useSpeech'

interface AncientGrimoireModalProps {
  completedSpellIds: string[]
  onClose: () => void
}

export function AncientGrimoireModal({
  completedSpellIds,
  onClose,
}: AncientGrimoireModalProps) {
  const { speak } = useSpeech()
  const allSpells = getAllSpells()
  const completedCount = completedSpellIds.length

  const handlePronounce = (nameEn: string) => {
    speak(nameEn)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sách ma thuật cổ Grimoire"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900 border-4 border-purple-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
              <BookOpen className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-purple-400">
                Sách Ma Thuật Cổ Grimoire
              </h2>
              <p className="text-base text-slate-300 font-medium">
                Kho tàng thần chú nguyên tố & phát âm cổ ngữ ({completedCount}/12 thần chú)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng sách ma thuật Grimoire"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Spells Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allSpells.map((spell) => {
            const isCompleted = completedSpellIds.includes(spell.id)

            if (!isCompleted) {
              return (
                <div
                  key={spell.id}
                  className="p-5 rounded-3xl bg-slate-800/40 border-2 border-dashed border-slate-700 flex items-center gap-4 opacity-75"
                >
                  <div className="size-18 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl grayscale">
                    <Lock className="size-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-400">
                      Thần Chú Bị Phong Ấn ({spell.towerId.toUpperCase()})
                    </h3>
                    <p className="text-base text-slate-500">
                      Hãy đến ngọn tháp nguyên tố tương ứng để niệm thần chú và mở khóa trang sách này!
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={spell.id}
                className="p-5 rounded-3xl bg-slate-800/90 border-2 border-purple-400/60 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-5xl">{spell.spellEmoji}</span>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{spell.nameVi}</span>
                        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      </h3>
                      <p className="text-base font-bold text-purple-300">
                        {spell.nameEn} ({spell.incantationName})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePronounce(spell.challenge.targetWord)}
                    aria-label={`Nghe phát âm ${spell.challenge.targetWord}`}
                    className="p-2.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Phonics Focus & Syllable Breakdown */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-base text-slate-200">
                  <span className="text-amber-400 font-bold">🎯 Trọng tâm âm: </span>
                  {spell.challenge.phonicsFocus}
                  <div className="mt-1 text-purple-300 font-bold">
                    Cấu trúc âm: {spell.challenge.phoneticBreakdown.join(' • ')}
                  </div>
                </div>

                {/* Magical Lore */}
                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-900/50 text-base text-purple-200 flex items-start gap-2">
                  <Sparkles className="size-5 text-purple-400 shrink-0 mt-0.5" />
                  <span>{spell.challenge.magicalLore}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
