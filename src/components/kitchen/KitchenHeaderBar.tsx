// src/components/kitchen/KitchenHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, RotateCcw, Utensils, Star } from 'lucide-react'
import type { MasterChefRank } from '@/types/phonics-kitchen'

interface KitchenHeaderBarProps {
  chefRank: MasterChefRank
  totalMastered: number
  totalAvailable: number
  chefStars: number
  onOpenRecipeBook: () => void
  onResetProgress: () => void
}

export function KitchenHeaderBar({
  chefRank,
  totalMastered,
  totalAvailable,
  chefStars,
  onOpenRecipeBook,
  onResetProgress,
}: KitchenHeaderBarProps) {
  const rankMap: Record<MasterChefRank, { title: string; badgeStyle: string }> = {
    'apprentice-cook': {
      title: 'Phụ Bếp Nhí 🥄',
      badgeStyle: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    },
    'sous-chef': {
      title: 'Bếp Phó Tài Ba 🍳',
      badgeStyle: 'bg-amber-100 text-amber-950 border-amber-300',
    },
    'executive-masterchef': {
      title: 'Bếp Trưởng Thần Bếp 🌟',
      badgeStyle: 'bg-purple-100 text-purple-950 border-purple-300',
    },
  }

  const currentRank = rankMap[chefRank] || rankMap['apprentice-cook']

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
        {/* MasterChef Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${currentRank.badgeStyle}`}
        >
          {currentRank.title}
        </span>

        {/* Mastered Recipes Counter */}
        <span className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Utensils className="size-5 text-amber-600" />
          <span>
            Món Đã Nấu: {totalMastered}/{totalAvailable}
          </span>
        </span>

        {/* Chef Stars */}
        <span className="px-4 py-2 rounded-2xl bg-yellow-50 border border-yellow-300 text-yellow-950 font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs">
          <Star className="size-5 text-yellow-500 fill-yellow-500" />
          <span>{chefStars} Sao</span>
        </span>

        {/* Recipe Book Trigger */}
        <button
          type="button"
          onClick={onOpenRecipeBook}
          aria-label="Mở sổ tay công thức món ăn"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <BookOpen className="size-5" />
          <span>Sổ Tay Công Thức</span>
        </button>

        {/* Reset Progress Button */}
        <button
          type="button"
          onClick={onResetProgress}
          aria-label="Đặt lại tiến trình nấu ăn"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Bắt đầu lại học viện bếp trưởng"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
