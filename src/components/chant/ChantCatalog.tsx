// src/components/chant/ChantCatalog.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Music, Sparkles, Volume2, ArrowLeft, ArrowRight } from 'lucide-react'
import type { PhonicsChant, ChantDifficulty } from '@/types/phonics-chant'

interface ChantCatalogProps {
  chants: PhonicsChant[]
}

export function ChantCatalog({ chants }: ChantCatalogProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChantDifficulty | 'all'>('all')

  const filteredChants = chants.filter((c) => {
    if (selectedDifficulty === 'all') return true
    return c.difficulty === selectedDifficulty
  })

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
          >
            <ArrowLeft className="size-5" />
            <span>Trang Chủ</span>
          </Link>

          <span className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-900 font-black text-base uppercase tracking-wider inline-flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-600" />
            <span>Karaoke & Vè Phonics</span>
          </span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
            🎵 Phòng Thu Vè Phonics & Karaoke Nhịp Điệu 🎤
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-600 max-w-2xl mx-auto">
            Hòa nhịp vè tiếng Anh, gõ nhịp điệu và làm chủ ngữ điệu tự nhiên cùng âm nhạc sôi động!
          </p>
        </div>
      </div>

      {/* Difficulty Filters */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {[
          { id: 'all', label: 'Tất Cả Bài Vè' },
          { id: 'pre-a1', label: 'Pre-A1 (Mầm non / Lớp 1)' },
          { id: 'a1', label: 'A1 (Lớp 1 - 2)' },
          { id: 'a2', label: 'A2 (Lớp 2 - 3)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedDifficulty(tab.id as ChantDifficulty | 'all')}
            className={`px-5 py-2.5 rounded-2xl font-black text-base transition-all cursor-pointer ${
              selectedDifficulty === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChants.map((chant) => (
          <div
            key={chant.id}
            className="bg-white rounded-3xl border-3 border-slate-800 p-6 flex flex-col justify-between space-y-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-5xl p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                  {chant.badgeIcon}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 font-black text-base uppercase">
                  {chant.difficulty.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-950">
                  {chant.titleVi}
                </h3>
                <p className="text-base font-bold text-indigo-600">
                  {chant.titleEn}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-slate-100">
                <div className="flex items-center gap-2 text-base font-bold text-slate-700">
                  <Volume2 className="size-5 text-indigo-500 shrink-0" />
                  <span>Mục tiêu: {chant.phonicsTarget}</span>
                </div>
                <div className="flex items-center gap-2 text-base font-bold text-slate-700">
                  <Music className="size-5 text-emerald-500 shrink-0" />
                  <span>Tiết tấu: {chant.bpm} BPM</span>
                </div>
                <p className="text-base text-slate-600 font-medium">
                  {chant.descriptionVi}
                </p>
              </div>
            </div>

            <Link
              href={`/chants/${chant.id}`}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Bắt Đầu Hát Vè</span>
              <ArrowRight className="size-5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
