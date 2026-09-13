// src/components/dino/DinoHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Landmark, RotateCcw, Bone, Sparkles } from 'lucide-react'
import type { PaleontologistRank } from '@/types/phonics-dino'

interface DinoHeaderBarProps {
  paleontologistRank: PaleontologistRank
  totalCompleted: number
  totalAvailable: number
  amberGems: number
  onOpenMuseum: () => void
  onResetProgress: () => void
}

export function DinoHeaderBar({
  paleontologistRank,
  totalCompleted,
  totalAvailable,
  amberGems,
  onOpenMuseum,
  onResetProgress,
}: DinoHeaderBarProps) {
  const rankMap: Record<PaleontologistRank, { title: string; badgeStyle: string }> = {
    junior_digger: {
      title: 'Nhà Khảo Cổ Tập Sự 🔍',
      badgeStyle: 'bg-amber-100 text-amber-950 border-amber-300',
    },
    expert_excavator: {
      title: 'Chuyên Gia Khai Quật 🦕',
      badgeStyle: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    },
    legendary_dino_master: {
      title: 'Đại Bậc Thầy Khủng Long 🦖',
      badgeStyle: 'bg-yellow-100 text-yellow-950 border-yellow-300',
    },
  }

  const currentRank = rankMap[paleontologistRank] || rankMap['junior_digger']

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-stone-200 shadow-lg">
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-base font-bold transition-all"
      >
        <ArrowLeft className="size-5" />
        <span>Về Trang Chủ</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        {/* Paleontologist Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${currentRank.badgeStyle}`}
        >
          {currentRank.title}
        </span>

        {/* Fossils Completed Counter */}
        <span className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Bone className="size-5 text-amber-600" />
          <span>
            Hóa Thạch: {totalCompleted}/{totalAvailable}
          </span>
        </span>

        {/* Amber Gems Counter */}
        <span className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs">
          <Sparkles className="size-5 text-emerald-600" />
          <span>{amberGems} Hổ Phách 💎</span>
        </span>

        {/* Prehistoric Museum Modal Trigger */}
        <button
          type="button"
          onClick={onOpenMuseum}
          aria-label="Mở viện bảo tàng tiền sử fossil museum"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <Landmark className="size-5" />
          <span>Viện Bảo Tàng Tiền Sử</span>
        </button>

        {/* Reset Progress Button */}
        <button
          type="button"
          onClick={onResetProgress}
          aria-label="Đặt lại hành trình khảo cổ khủng long"
          className="p-2.5 rounded-2xl bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Bắt đầu lại hành trình khảo cổ khủng long mới"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
