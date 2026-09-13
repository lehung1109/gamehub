// src/components/story/StoryCompletedModal.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { Trophy, Award, RotateCcw, BookOpen, Sparkles } from 'lucide-react'

interface StoryCompletedModalProps {
  storyTitle: string
  expGained?: number
  onReplay: () => void
}

export function StoryCompletedModal({
  storyTitle,
  expGained = 25,
  onReplay,
}: StoryCompletedModalProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-amber-300 shadow-2xl max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
      <div className="size-20 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-600 flex items-center justify-center mx-auto shadow-md">
        <Trophy className="size-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-base">
          <Sparkles className="size-5 text-emerald-600" />
          <span>Hoàn Thành Cuộc Phiêu Lưu!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          {storyTitle}
        </h2>
        <p className="text-base font-semibold text-slate-600">
          Em đã hoàn thành xuất sắc các phân cảnh và lồng tiếng truyền cảm cho các nhân vật!
        </p>
      </div>

      {/* Badges Earned */}
      <div className="grid grid-cols-2 gap-4 py-2">
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 space-y-1">
          <span className="block text-base font-bold text-amber-800">EXP Thưởng</span>
          <span className="text-2xl font-black text-amber-950">+{expGained} EXP</span>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200 space-y-1">
          <div className="flex items-center justify-center gap-1 text-indigo-700 font-bold text-base">
            <Award className="size-5" />
            <span>Huy Hiệu</span>
          </div>
          <span className="text-xl font-black text-indigo-950">Nhà Kể Chuyện Nhí</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReplay}
          className="w-full sm:flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-base transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="size-5" />
          <span>Đọc Lại Từ Đầu</span>
        </button>

        <Link
          href="/stories"
          className="w-full sm:flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center justify-center gap-2"
        >
          <BookOpen className="size-5" />
          <span>Kho Truyện Tranh</span>
        </Link>
      </div>
    </div>
  )
}
