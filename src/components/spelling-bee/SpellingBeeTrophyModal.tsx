// src/components/spelling-bee/SpellingBeeTrophyModal.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Trophy, Star, RotateCcw, ArrowRight, Award } from 'lucide-react'
import type { SpellingBeeResult } from '@/types/spelling-bee'

interface SpellingBeeTrophyModalProps {
  divisionTitle: string
  result: SpellingBeeResult
  onReplay: () => void
}

export function SpellingBeeTrophyModal({
  divisionTitle,
  result,
  onReplay,
}: SpellingBeeTrophyModalProps) {
  return (
    <div
      role="dialog"
      aria-label="Chứng nhận kết quả giải đấu Spelling Bee"
      className="p-8 sm:p-10 bg-white rounded-3xl border-4 border-amber-300 shadow-2xl text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95 duration-200"
    >
      {/* Header Trophy Icon */}
      <div className="size-24 sm:size-28 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-5xl sm:text-6xl border-4 border-amber-300 shadow-inner">
        {result.isChampion ? (
          <Trophy className="size-14 sm:size-16 text-amber-500 animate-bounce" />
        ) : (
          <Award className="size-14 sm:size-16 text-indigo-500" />
        )}
      </div>

      <div className="space-y-2">
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-base uppercase tracking-wider">
          {result.isChampion
            ? '🏆 NHÀ VÔ ĐỊCH SPELLING BEE!'
            : '🎉 HOÀN THÀNH VÒNG THI ĐẤU!'}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          {divisionTitle}
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
          <span className="block text-base font-semibold text-slate-500">Số Từ Đúng</span>
          <span className="block text-2xl font-black text-purple-600">
            {result.wordsCorrect}/{result.wordsTotal}
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
          <span>Thử Lại Vòng Này</span>
        </button>

        <Link
          href="/spelling-bee"
          className="flex-1 py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30 hover:scale-102 transition-all"
        >
          <span>Hạng Thi Khác</span>
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  )
}
