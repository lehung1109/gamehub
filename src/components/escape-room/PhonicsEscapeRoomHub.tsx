// src/components/escape-room/PhonicsEscapeRoomHub.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  KeyRound,
  Clock,
  Sparkles,
  Award,
  Search,
  ArrowRight,
} from 'lucide-react'
import type { EscapeRoom, EscapeDifficulty } from '@/types/phonics-escape-room'

interface PhonicsEscapeRoomHubProps {
  rooms: EscapeRoom[]
}

export function PhonicsEscapeRoomHub({ rooms }: PhonicsEscapeRoomHubProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    EscapeDifficulty | 'ALL'
  >('ALL')

  const filteredRooms = rooms.filter((r) => {
    if (selectedDifficulty === 'ALL') return true
    return r.difficulty === selectedDifficulty
  })

  const difficultyFilters: {
    key: EscapeDifficulty | 'ALL'
    label: string
    icon: string
  }[] = [
    { key: 'ALL', label: 'Tất Cả Phòng', icon: '🔍' },
    { key: 'beginner', label: 'Khởi Động (Digraphs)', icon: '🏺' },
    { key: 'intermediate', label: 'Thám Tử (Vowel Teams)', icon: '📚' },
    { key: 'advanced', label: 'Bậc Thầy (Compound Words)', icon: '🚀' },
  ]

  const difficultyBadgeMap: Record<EscapeDifficulty, { label: string; style: string }> = {
    beginner: {
      label: 'Cơ Bản',
      style: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    intermediate: {
      label: 'Thử Thách',
      style: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    advanced: {
      label: 'Cao Cấp',
      style: 'bg-purple-100 text-purple-900 border-purple-300',
    },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-amber-800 via-orange-900 to-stone-900 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 font-black text-base backdrop-blur-md">
            <Search className="size-5 text-amber-300" />
            <span>Phonics Mystery Escape Room • Thám Tử Thoát Hiểm</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Phòng Thoát Hiểm Bí Mật 🗝️
          </h1>

          <p className="text-lg sm:text-xl font-medium text-amber-100 leading-relaxed">
            Hóa thân thành thám tử nhí điều tra các mật thất cổ đại và trạm không gian!
            Giải mã manh mối ngữ âm Phonics để thu thập ký tự và mở khóa cánh cửa thoát hiểm!
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <KeyRound className="size-5 text-amber-300" />
              <span>Chìa Khóa Xương Vàng 🗝️</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Sparkles className="size-5 text-emerald-300" />
              <span>Giải mã mật mã 4 chữ cái</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Award className="size-5 text-sky-300" />
              <span>Chứng chỉ thám tử xuất sắc</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <div className="absolute -right-8 -bottom-10 opacity-20 text-[180px] pointer-events-none select-none">
          🗝️
        </div>
      </section>

      {/* Difficulty Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
        {difficultyFilters.map((diff) => {
          const isActive = selectedDifficulty === diff.key
          return (
            <button
              key={diff.key}
              type="button"
              onClick={() => setSelectedDifficulty(diff.key)}
              className={`px-5 py-3 rounded-2xl font-black text-base sm:text-lg inline-flex items-center gap-2.5 cursor-pointer transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-102'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200'
              }`}
            >
              <span>{diff.icon}</span>
              <span>{diff.label}</span>
            </button>
          )
        })}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const diffBadge = difficultyBadgeMap[room.difficulty]
          return (
            <article
              key={room.id}
              data-testid={`escape-room-card-${room.id}`}
              className="flex flex-col justify-between bg-white rounded-3xl border-4 border-slate-200 hover:border-amber-400 p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="space-y-4">
                {/* Header: Badge & Difficulty */}
                <div className="flex items-center justify-between">
                  <div className="size-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                    {room.badgeIcon}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full font-black text-base border ${diffBadge.style}`}
                    >
                      {diffBadge.label}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-base inline-flex items-center gap-1">
                      <Clock className="size-4 text-amber-600" />
                      <span>{Math.round(room.durationSeconds / 60)} phút</span>
                    </span>
                  </div>
                </div>

                {/* Title & Synopsis */}
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                    {room.titleVi}
                  </h3>
                  <p className="text-base font-bold text-slate-500">
                    {room.titleEn}
                  </p>
                  <p className="text-base text-slate-700 font-medium pt-1">
                    {room.synopsisVi}
                  </p>
                </div>

                {/* Target Phonics */}
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <span className="block text-base font-bold text-amber-900">
                    🎯 Ngữ âm mục tiêu:
                  </span>
                  <span className="block text-base font-black text-amber-950">
                    {room.targetPhonics}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Link
                  href={`/escape-room/${room.id}`}
                  className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 group-hover:scale-102 transition-all"
                >
                  <KeyRound className="size-5" />
                  <span>Vào Điều Tra Ngay</span>
                  <ArrowRight className="size-5" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      {/* Detective Rules Card */}
      <section className="bg-amber-50 rounded-3xl border-3 border-amber-300 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-black">
            🔍
          </div>
          <h2 className="text-2xl font-black text-amber-950">
            Cẩm Nang Thám Tử Thoát Hiểm
          </h2>
        </div>
        <ul className="space-y-2 text-base sm:text-lg text-amber-900 font-medium list-disc list-inside">
          <li>Bấm vào các điểm chấm sáng trên phòng để mở câu đố ngữ âm.</li>
          <li>Mỗi câu đố giải đúng sẽ mang lại 1 chữ cái trong mật mã 4 ký tự.</li>
          <li>Bấm vào ổ khóa cửa chính và nhập từ tiếng Anh để mở cổng thoát hiểm thành công!</li>
          <li>Hoàn thành càng nhanh, bé càng nhận được nhiều EXP và Chìa Khóa Vàng 🗝️!</li>
        </ul>
      </section>
    </div>
  )
}
