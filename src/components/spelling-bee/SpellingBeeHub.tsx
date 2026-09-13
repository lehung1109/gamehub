// src/components/spelling-bee/SpellingBeeHub.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Award, Volume2, Sparkles, Trophy, Play, CheckCircle } from 'lucide-react'
import type { SpellingBeeDivision } from '@/types/spelling-bee'

interface SpellingBeeHubProps {
  divisions: SpellingBeeDivision[]
}

export function SpellingBeeHub({ divisions }: SpellingBeeHubProps) {
  const getTierBadge = (tier: SpellingBeeDivision['tier']) => {
    switch (tier) {
      case 'bronze':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-base">
            Cấp Độ 1 (Lớp 1-2) ⭐
          </span>
        )
      case 'silver':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-slate-200 text-slate-900 font-black text-base">
            Cấp Độ 2 (Lớp 3) ⭐⭐
          </span>
        )
      case 'gold':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-yellow-100 text-yellow-950 font-black text-base">
            Cấp Độ 3 (Lớp 4-5) ⭐⭐⭐
          </span>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500 p-8 sm:p-12 text-slate-950 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/40 px-4 py-1.5 font-black text-base backdrop-blur-md">
            <Trophy className="size-5 text-amber-950" />
            <span>Phonics Spelling Bee Championship • Đấu Trường Đánh Vần</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Đấu Trường Đánh Vần 🐝
          </h1>

          <p className="text-lg sm:text-xl font-medium text-amber-950 leading-relaxed">
            Lắng nghe phát âm tiếng Anh chuẩn bản xứ, khám phá ngữ âm IPA và thử tài
            đánh vần chuẩn xác từng ký tự để giành cúp vàng vô địch Spelling Bee danh giá!
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="inline-flex items-center gap-2 bg-white/30 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Volume2 className="size-5 text-indigo-900" />
              <span>Phát âm mẫu chuẩn bản xứ 1.0x & 0.75x</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/30 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Sparkles className="size-5 text-purple-900" />
              <span>Gợi ý ngữ âm IPA & Câu ngữ cảnh</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/30 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Award className="size-5 text-emerald-900" />
              <span>Chứng nhận cúp vàng vô địch</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Emojis */}
        <div className="absolute -right-8 -bottom-10 opacity-20 text-[180px] pointer-events-none select-none">
          🏆
        </div>
      </section>

      {/* Divisions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.map((division) => (
          <article
            key={division.id}
            data-testid={`spelling-bee-division-card-${division.id}`}
            className="flex flex-col justify-between bg-white rounded-3xl border-4 border-slate-200 hover:border-amber-400 p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="space-y-4">
              {/* Header: Badge & Tier */}
              <div className="flex items-center justify-between">
                <div className="size-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                  {division.badgeEmoji}
                </div>
                {getTierBadge(division.tier)}
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  {division.titleEn}
                </h3>
                <p className="text-base font-bold text-slate-500">
                  {division.titleVi}
                </p>
                <p className="text-base text-slate-700 font-medium pt-1">
                  {division.descriptionVi}
                </p>
              </div>

              {/* Word Targets Preview */}
              <div className="space-y-2 pt-2">
                <span className="block text-base font-black text-slate-700">
                  🎯 Từ vựng trong bảng ({division.words.length} từ):
                </span>
                <div className="flex flex-wrap gap-2">
                  {division.words.map((w) => (
                    <span
                      key={w.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-black text-base border border-slate-200"
                    >
                      {w.word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Play Button */}
            <div className="pt-6">
              <Link
                href={`/spelling-bee/${division.id}`}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30 group-hover:scale-102 transition-all"
              >
                <Play className="size-5 fill-current" />
                <span>Vào Đấu Trường Ngay</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Spelling Bee Rules & Tips for Kids */}
      <section className="bg-amber-50 rounded-3xl border-3 border-amber-300 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black">
            💡
          </div>
          <h2 className="text-2xl font-black text-amber-950">
            Bí Kíp Trở Thành Quán Quân Spelling Bee
          </h2>
        </div>
        <ul className="space-y-2 text-base sm:text-lg text-amber-900 font-medium list-disc list-inside">
          <li>Bấm nút &quot;Nghe Phát Âm&quot; để nghe kỹ từng âm thanh của từ trước khi gõ chữ.</li>
          <li>Nếu cảm thấy giọng đọc hơi nhanh, bé có thể bật &quot;Đọc Chậm&quot; để nghe rõ từng âm vị.</li>
          <li>Bấm &quot;Gợi Ý Nghĩa & IPA&quot; và &quot;Câu Ví Dụ&quot; để không bị nhầm lẫn giữa các từ đồng âm!</li>
        </ul>
      </section>
    </div>
  )
}
