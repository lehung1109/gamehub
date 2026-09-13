// src/components/arcade/ArcadeGameOverModal.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Trophy, Star, RotateCcw, ArrowRight } from 'lucide-react'
import type { ArcadeGameResult } from '@/types/voice-arcade'

interface ArcadeGameOverModalProps {
  stageTitle: string
  result: ArcadeGameResult
  onReplay: () => void
}

export function ArcadeGameOverModal({
  stageTitle,
  result,
  onReplay,
}: ArcadeGameOverModalProps) {
  return (
    <div
      role="dialog"
      aria-label="Kết quả trò chơi arcade"
      className="p-8 sm:p-10 bg-white rounded-3xl border-4 border-amber-300 shadow-2xl text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95 duration-200"
    >
      {/* Header Icon */}
      <div className="size-24 sm:size-28 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-5xl sm:text-6xl border-4 border-amber-300 shadow-inner">
        <Trophy className="size-14 sm:size-16 text-amber-500 animate-bounce" />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-base uppercase tracking-wider">
          🎉 Hoàn Thành Màn Chơi!
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          {stageTitle}
        </h2>
      </div>

      {/* Star Rating */}
      <div className="flex justify-center items-center gap-3">
        {[1, 2, 3].map((starIndex) => (
          <Star
            key={starIndex}
            className={`size-10 sm:size-12 transition-all ${
              starIndex <= result.stars
                ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-md'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
        <div className="p-3 bg-white rounded-xl border border-slate-100">
          <span className="block text-base font-semibold text-slate-500">Điểm Số</span>
          <span className="block text-2xl font-black text-indigo-600">
            {result.score}
          </span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-100">
          <span className="block text-base font-semibold text-slate-500">Độ Chuẩn</span>
          <span className="block text-2xl font-black text-emerald-600">
            {result.accuracyPercent}%
          </span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-100">
          <span className="block text-base font-semibold text-slate-500">Từ Vựng Đạt</span>
          <span className="block text-2xl font-black text-purple-600">
            {result.wordsHit}/{result.wordsHit + result.wordsMissed}
          </span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-100">
          <span className="block text-base font-semibold text-slate-500">Kinh Nghiệm</span>
          <span className="block text-2xl font-black text-amber-600">
            +{result.expEarned} XP
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <RotateCcw className="size-5" />
          <span>Chơi Lại</span>
        </button>

        <Link
          href="/games/voice-arcade"
          className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:scale-102 transition-all"
        >
          <span>Chọn Màn Khác</span>
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  )
}
