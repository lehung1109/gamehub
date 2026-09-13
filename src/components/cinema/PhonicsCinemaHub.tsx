// src/components/cinema/PhonicsCinemaHub.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Film,
  Sparkles,
  Play,
  Clock,
  Popcorn,
  Award,
} from 'lucide-react'
import type { CinemaEpisode, CinemaCategory } from '@/types/phonics-cinema'

interface PhonicsCinemaHubProps {
  episodes: CinemaEpisode[]
}

export function PhonicsCinemaHub({ episodes }: PhonicsCinemaHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<CinemaCategory | 'ALL'>('ALL')

  const filteredEpisodes = episodes.filter((ep) => {
    if (selectedCategory === 'ALL') return true
    return ep.category === selectedCategory
  })

  const categoryFilters: { key: CinemaCategory | 'ALL'; label: string; icon: string }[] = [
    { key: 'ALL', label: 'Tất Cả Phim', icon: '🎬' },
    { key: 'cvc', label: 'Nguyên Âm Ngắn (CVC)', icon: '🦖' },
    { key: 'digraphs', label: 'Phụ Âm Kép (Digraphs)', icon: '🧙' },
    { key: 'vowels', label: 'Magic E & Âm Dài', icon: '🧞' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-800 via-indigo-800 to-rose-700 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 font-black text-base backdrop-blur-md">
            <Film className="size-5 text-amber-300" />
            <span>Interactive Phonics Cinema • Rạp Phim Tương Tác</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Rạp Chiếu Phim Phonics 🍿
          </h1>

          <p className="text-lg sm:text-xl font-medium text-purple-100 leading-relaxed">
            Xem hoạt hình không chỉ để giải trí! Cùng tham gia giải cứu nhân vật bằng cách
            trả lời các câu đố ngữ âm Phonics ở những khoảnh khắc gay cấn để thu thập bắp rang bơ vàng!
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Popcorn className="size-5 text-amber-300" />
              <span>Thu thập bắp rang bơ vàng 🍿</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Sparkles className="size-5 text-emerald-300" />
              <span>Hoạt hình vector tương tác tức thì</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Award className="size-5 text-sky-300" />
              <span>Vé xem phim & Cúp vinh danh</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Cinema Icons */}
        <div className="absolute -right-8 -bottom-10 opacity-20 text-[180px] pointer-events-none select-none">
          🍿
        </div>
      </section>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
        {categoryFilters.map((cat) => {
          const isActive = selectedCategory === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-5 py-3 rounded-2xl font-black text-base sm:text-lg inline-flex items-center gap-2.5 cursor-pointer transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-102'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEpisodes.map((episode) => (
          <article
            key={episode.id}
            data-testid={`cinema-episode-card-${episode.id}`}
            className="flex flex-col justify-between bg-white rounded-3xl border-4 border-slate-200 hover:border-purple-400 p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="space-y-4">
              {/* Header: Badge & Duration */}
              <div className="flex items-center justify-between">
                <div className="size-16 rounded-2xl bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                  {episode.badgeIcon}
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 font-black text-base inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-purple-600" />
                  <span>{episode.durationEstimate}</span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  {episode.titleEn}
                </h3>
                <p className="text-base font-bold text-slate-500">
                  {episode.titleVi}
                </p>
                <p className="text-base text-slate-700 font-medium pt-1">
                  {episode.synopsisVi}
                </p>
              </div>

              {/* Target Phonics */}
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1">
                <span className="block text-base font-bold text-purple-900">
                  🎯 Mục tiêu Phonics:
                </span>
                <span className="block text-base font-black text-purple-950">
                  {episode.targetPhonics}
                </span>
              </div>
            </div>

            {/* Watch Button */}
            <div className="pt-6">
              <Link
                href={`/cinema/${episode.id}`}
                className="w-full py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 group-hover:scale-102 transition-all"
              >
                <Play className="size-5 fill-current" />
                <span>Vào Xem Phim Ngay</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Cinema Tips */}
      <section className="bg-amber-50 rounded-3xl border-3 border-amber-300 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black">
            💡
          </div>
          <h2 className="text-2xl font-black text-amber-950">
            Mẹo Xem Phim Tương Tác Cùng Bé
          </h2>
        </div>
        <ul className="space-y-2 text-base sm:text-lg text-amber-900 font-medium list-disc list-inside">
          <li>Khi phim tạm dừng tại thử thách, hãy đọc to các lựa chọn để tìm âm thanh phù hợp.</li>
          <li>Mỗi câu trả lời đúng ngay lần đầu sẽ thưởng cho bé 50 bắp rang bơ vàng 🍿.</li>
          <li>Bé có thể bấm nút loa để nghe lại lời kể tiếng Anh bất kỳ lúc nào!</li>
        </ul>
      </section>
    </div>
  )
}
