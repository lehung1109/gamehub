// src/components/arcade/VoiceArcadeHub.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Gamepad2,
  Sparkles,
  Zap,
  Play,
  Volume2,
  Flame,
  ShieldCheck,
} from 'lucide-react'
import type { ArcadeStage, ArcadeGameMode } from '@/types/voice-arcade'

interface VoiceArcadeHubProps {
  stages: ArcadeStage[]
}

export function VoiceArcadeHub({ stages }: VoiceArcadeHubProps) {
  const [selectedMode, setSelectedMode] = useState<ArcadeGameMode | 'ALL'>('ALL')

  const filteredStages = stages.filter((stage) => {
    if (selectedMode === 'ALL') return true
    return stage.gameMode === selectedMode
  })

  const modeLabels: { mode: ArcadeGameMode | 'ALL'; label: string; icon: string }[] = [
    { mode: 'ALL', label: 'Tất Cả Màn Chơi', icon: '🎮' },
    { mode: 'runner', label: 'Nhảy Vượt Chướng Ngại', icon: '🏃' },
    { mode: 'blaster', label: 'Bắn Thiên Thạch', icon: '☄️' },
    { mode: 'glider', label: 'Tên Lửa Lướt Gió', icon: '🚀' },
  ]

  const getDifficultyBadge = (diff: ArcadeStage['difficulty']) => {
    switch (diff) {
      case 'easy':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-base">
            Dễ ⭐
          </span>
        )
      case 'medium':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-base">
            Vừa ⭐⭐
          </span>
        )
      case 'hard':
        return (
          <span className="px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 font-black text-base">
            Thử Thách ⭐⭐⭐
          </span>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-700 via-purple-700 to-pink-600 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 font-black text-base backdrop-blur-md">
            <Gamepad2 className="size-5 text-amber-300" />
            <span>Phonics Voice Arcade • Speak-to-Play</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Khu Trò Chơi Giọng Nói 🎙️
          </h1>

          <p className="text-lg sm:text-xl font-medium text-indigo-100 leading-relaxed">
            Không cần bấm nút! Hô to và chuẩn xác từ vựng Phonics tiếng Anh để điều khiển
            nhân vật nhảy cao, phóng tên lửa và bắn hạ thiên thạch vũ trụ!
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Zap className="size-5 text-amber-300" />
              <span>Phản hồi giọng nói tức thì</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <Sparkles className="size-5 text-emerald-300" />
              <span>Âm thanh tổng hợp Web Audio</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-xs font-bold text-base">
              <ShieldCheck className="size-5 text-sky-300" />
              <span>Hỗ trợ nút kích hoạt mô phỏng</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Icons */}
        <div className="absolute -right-8 -bottom-10 opacity-20 text-[180px] pointer-events-none select-none">
          🕹️
        </div>
      </section>

      {/* Mode Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
        {modeLabels.map((item) => {
          const isActive = selectedMode === item.mode
          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => setSelectedMode(item.mode)}
              className={`px-5 py-3 rounded-2xl font-black text-base sm:text-lg inline-flex items-center gap-2.5 cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStages.map((stage) => (
          <article
            key={stage.id}
            data-testid={`arcade-stage-card-${stage.id}`}
            className="flex flex-col justify-between bg-white rounded-3xl border-4 border-slate-200 hover:border-indigo-400 p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all group"
          >
            <div className="space-y-4">
              {/* Header: Badge Icon & Difficulty */}
              <div className="flex items-center justify-between">
                <div className="size-16 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                  {stage.badgeIcon}
                </div>
                {getDifficultyBadge(stage.difficulty)}
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {stage.titleEn}
                </h3>
                <p className="text-base font-bold text-slate-500">
                  {stage.titleVi}
                </p>
                <p className="text-base text-slate-700 font-medium pt-1">
                  {stage.descriptionVi}
                </p>
              </div>

              {/* Word Targets Preview */}
              <div className="space-y-2 pt-2">
                <span className="block text-base font-black text-slate-700">
                  🎯 Từ vựng thử thách ({stage.words.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {stage.words.map((w) => (
                    <span
                      key={w.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-black text-base border border-slate-200 inline-flex items-center gap-1.5"
                    >
                      <span>{w.icon}</span>
                      <span>{w.word}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Play Button */}
            <div className="pt-6">
              <Link
                href={`/games/voice-arcade/${stage.id}`}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 group-hover:scale-102 transition-all"
              >
                <Play className="size-5 fill-current" />
                <span>Vào Chơi Ngay</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Voice Tips Card for Kids */}
      <section className="bg-amber-50 rounded-3xl border-3 border-amber-300 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-amber-400 text-white flex items-center justify-center text-2xl font-black">
            💡
          </div>
          <h2 className="text-2xl font-black text-amber-950">
            Mẹo Phát Âm Chuẩn Dành Cho Bé
          </h2>
        </div>
        <ul className="space-y-2 text-base sm:text-lg text-amber-900 font-medium list-disc list-inside">
          <li>Ngồi cách micro khoảng một cánh tay và phát âm to, dứt khoát từng từ.</li>
          <li>Quan sát kỹ hình ảnh và từ vựng xuất hiện trên màn hình trước khi nói.</li>
          <li>Bé cũng có thể bấm nút &quot;Nói Thử & Nhảy&quot; nếu môi trường xung quanh đang ồn ào!</li>
        </ul>
      </section>
    </div>
  )
}
