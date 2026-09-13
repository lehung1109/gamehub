// src/components/safari/SafariHeaderBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, RotateCcw, Camera } from 'lucide-react'
import type { ExplorerRank } from '@/types/phonics-safari'

interface SafariHeaderBarProps {
  explorerRank: ExplorerRank
  totalPhotos: number
  totalAvailable: number
  onOpenFieldGuide: () => void
  onResetProgress: () => void
}

export function SafariHeaderBar({
  explorerRank,
  totalPhotos,
  totalAvailable,
  onOpenFieldGuide,
  onResetProgress,
}: SafariHeaderBarProps) {
  const rankMap: Record<ExplorerRank, { title: string; badgeStyle: string }> = {
    'junior-scout': {
      title: 'Thám Tử Nhí 🧭',
      badgeStyle: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    },
    'wild-ranger': {
      title: 'Kiểm Lâm Viên 🚙',
      badgeStyle: 'bg-amber-100 text-amber-950 border-amber-300',
    },
    'safari-master': {
      title: 'Bậc Thầy Thám Hiểm 🦁',
      badgeStyle: 'bg-purple-100 text-purple-950 border-purple-300',
    },
  }

  const currentRank = rankMap[explorerRank] || rankMap['junior-scout']

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
        {/* Explorer Rank Badge */}
        <span
          className={`px-4 py-2 rounded-2xl border font-black text-base sm:text-lg inline-flex items-center gap-1.5 shadow-xs ${currentRank.badgeStyle}`}
        >
          {currentRank.title}
        </span>

        {/* Photo Counter */}
        <span className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 font-black text-base sm:text-lg inline-flex items-center gap-2 shadow-xs">
          <Camera className="size-5 text-amber-600" />
          <span>
            Ảnh Đã Chụp: {totalPhotos}/{totalAvailable}
          </span>
        </span>

        {/* Field Guide Trigger Button */}
        <button
          type="button"
          onClick={onOpenFieldGuide}
          aria-label="Mở sổ tay bách khoa động vật"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
        >
          <BookOpen className="size-5" />
          <span>Sổ Tay Bách Khoa</span>
        </button>

        {/* Reset Progress Button */}
        <button
          type="button"
          onClick={onResetProgress}
          aria-label="Đặt lại hành trình thám hiểm"
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
          title="Bắt đầu lại chuyến thám hiểm mới"
        >
          <RotateCcw className="size-5" />
        </button>
      </div>
    </div>
  )
}
