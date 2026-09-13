// src/components/magic/MagicHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, RotateCcw, Wand2, Sparkles } from 'lucide-react'
import type { WizardRank } from '@/types/phonics-magic'

interface MagicHeaderBarProps {
  wizardRank: WizardRank
  totalCompleted: number
  totalAvailable: number
  manaCrystals: number
  onOpenGrimoire: () => void
  onResetProgress: () => void
}

export function MagicHeaderBar({
  wizardRank,
  totalCompleted,
  totalAvailable,
  manaCrystals,
  onOpenGrimoire,
  onResetProgress,
}: MagicHeaderBarProps) {
  const rankMap: Record<WizardRank, { title: string; badgeStyle: string }> = {
    apprentice_wizard: {
      title: 'Pháp Sư Tập Sự 🪄',
      badgeStyle: 'bg-purple-100 text-purple-950 border-purple-300',
    },
    master_sorcerer: {
      title: 'Phù Thủy Tinh Anh 🔮',
      badgeStyle: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    },
    grand_archmage: {
      title: 'Đại Pháp Sư Tối Cao 🧙‍♂️',
      badgeStyle: 'bg-amber-100 text-amber-950 border-amber-300',
    },
  }

  const currentRank = rankMap[wizardRank] || rankMap['apprentice_wizard']

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-lg">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
      >
        <ArrowLeft className="size-5" />
        <span>Về Trang Chủ</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {/* Wizard Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${currentRank.badgeStyle}`}
        >
          {currentRank.title}
        </span>

        {/* Spells Completed Counter */}
        <span className="px-4 py-2 rounded-2xl bg-purple-50 border border-purple-300 text-purple-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Wand2 className="size-5 text-purple-600" />
          <span>
            Thần Chú: {totalCompleted}/{totalAvailable}
          </span>
        </span>

        {/* Mana Crystals Counter */}
        <span className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-300 text-indigo-950 font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs">
          <Sparkles className="size-5 text-indigo-600" />
          <span>{manaCrystals} Pha Lê 🔮</span>
        </span>

        {/* Ancient Grimoire Modal Trigger */}
        <button
          type="button"
          onClick={onOpenGrimoire}
          aria-label="Mở sách ma thuật cổ Grimoire"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <BookOpen className="size-5" />
          <span>Sách Ma Thuật Cổ</span>
        </button>

        {/* Reset Progress Button */}
        <button
          type="button"
          onClick={onResetProgress}
          aria-label="Đặt lại hành trình học viện phép thuật"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Bắt đầu lại khóa tu luyện phép thuật mới"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
