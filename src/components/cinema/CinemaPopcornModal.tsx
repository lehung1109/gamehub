// src/components/cinema/CinemaPopcornModal.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Clapperboard, Star, RotateCcw, ArrowRight } from 'lucide-react'
import type { CinemaResult } from '@/types/phonics-cinema'

interface CinemaPopcornModalProps {
  episodeTitle: string
  result: CinemaResult
  onReplay: () => void
}

export function CinemaPopcornModal({
  episodeTitle,
  result,
  onReplay,
}: CinemaPopcornModalProps) {
  return (
    <div
      role="dialog"
      aria-label="Vé xem phim và kết quả rạp chiếu Phonics"
      className="p-8 sm:p-10 bg-white rounded-3xl border-4 border-amber-400 shadow-2xl text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95 duration-200"
    >
      {/* Popcorn Cinema Icon */}
      <div className="size-24 sm:size-28 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-5xl sm:text-6xl border-4 border-amber-300 shadow-inner">
        <Clapperboard className="size-14 sm:size-16 text-amber-600 animate-bounce" />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-base uppercase tracking-wider">
          🍿 BUỔI CHIẾU PHIM HOÀN TẤT!
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          {episodeTitle}
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

      {/* Popcorn & Stats Ticket */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200">
        <div className="p-3 bg-white rounded-xl border border-amber-100">
          <span className="block text-base font-semibold text-slate-500">Bắp Rang Bơ</span>
          <span className="block text-2xl font-black text-amber-600">
            🍿 {result.popcornEarned}
          </span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-amber-100">
          <span className="block text-base font-semibold text-slate-500">Thử Thách Đúng</span>
          <span className="block text-2xl font-black text-emerald-600">
            {result.correctPrompts}/{result.totalPrompts}
          </span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-amber-100 col-span-2 sm:col-span-1">
          <span className="block text-base font-semibold text-slate-500">Kinh Nghiệm</span>
          <span className="block text-2xl font-black text-purple-600">
            +{result.expEarned} XP
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <RotateCcw className="size-5" />
          <span>Xem Lại Phim</span>
        </button>

        <Link
          href="/cinema"
          className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 hover:scale-102 transition-all"
        >
          <span>Chọn Phim Khác</span>
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  )
}
