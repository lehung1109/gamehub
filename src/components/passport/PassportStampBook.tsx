// src/components/passport/PassportStampBook.tsx
'use client'

import React, { useState } from 'react'
import { Award, Lock, CheckCircle, Sparkles } from 'lucide-react'
import type { PassportStamp, StampCategory } from '@/types/passport'

interface PassportStampBookProps {
  stamps: PassportStamp[]
}

const CATEGORY_LABELS: { id: StampCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất Cả Huy Hiệu' },
  { id: 'games', label: 'Trò Chơi' },
  { id: 'stories', label: 'Truyện Tranh' },
  { id: 'chants', label: 'Bài Vè Karaoke' },
  { id: 'speaking', label: 'Luyện Nói AI' },
  { id: 'guilds', label: 'Bang Hội' },
]

export function PassportStampBook({ stamps }: PassportStampBookProps) {
  const [selectedCategory, setSelectedCategory] = useState<StampCategory | 'all'>('all')

  const filteredStamps = stamps.filter((s) => {
    if (selectedCategory === 'all') return true
    return s.category === selectedCategory
  })

  return (
    <div className="bg-white rounded-3xl border-4 border-amber-300 p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Passport Book Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl border-2 border-amber-300">
            <Award className="size-7 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Sổ Dấu Ấn Hộ Chiếu (Passport Stamps)
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Mỗi dấu ấn ghi dấu một cột mốc năng lực tiếng Anh của em!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-950 font-black text-base inline-flex items-center gap-1.5">
            <Sparkles className="size-4 text-emerald-600" />
            <span>
              {stamps.filter((s) => s.isUnlocked).length}/{stamps.length} Đã Mở Khóa
            </span>
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORY_LABELS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-4 py-2 rounded-2xl font-black text-base transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stamps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStamps.map((stamp) => (
          <div
            key={stamp.id}
            className={`p-5 rounded-3xl border-3 transition-all flex flex-col justify-between space-y-4 ${
              stamp.isUnlocked
                ? 'bg-linear-to-b from-amber-50/80 to-white border-amber-400 shadow-md hover:shadow-lg'
                : 'bg-slate-50 border-slate-200 opacity-70'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-5xl p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  {stamp.icon}
                </span>

                {stamp.isUnlocked ? (
                  <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-base inline-flex items-center gap-1.5 border border-emerald-300">
                    <CheckCircle className="size-4 text-emerald-600" />
                    <span>ĐÃ ĐẠT</span>
                  </span>
                ) : (
                  <span className="px-3.5 py-1 rounded-full bg-slate-200 text-slate-700 font-black text-base inline-flex items-center gap-1.5">
                    <Lock className="size-4 text-slate-500" />
                    <span>CHƯA MỞ</span>
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-950">
                  {stamp.titleVi}
                </h3>
                <p className="text-base font-bold text-indigo-600">
                  {stamp.titleEn}
                </p>
              </div>

              <p className="text-base text-slate-600 font-medium">
                {stamp.criteriaVi}
              </p>
            </div>

            {stamp.isUnlocked && stamp.unlockedAt && (
              <div className="pt-2 border-t border-amber-200 text-base font-bold text-amber-800">
                ✨ Mở khóa ngày {new Date(stamp.unlockedAt).toLocaleDateString('vi-VN')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
