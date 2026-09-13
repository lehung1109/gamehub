// src/components/story/StoryHub.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Mic,
} from 'lucide-react'
import type { ComicStory, StoryCefrLevel } from '@/types/comic-story'

interface StoryHubProps {
  stories: ComicStory[]
}

export function StoryHub({ stories }: StoryHubProps) {
  const [selectedLevel, setSelectedLevel] = useState<StoryCefrLevel | 'all'>('all')

  const filteredStories = stories.filter((s) => {
    if (selectedLevel === 'all') return true
    return s.level === selectedLevel
  })

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border-2 border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-base font-bold border border-indigo-500/30">
            <Sparkles className="size-5 text-indigo-400" />
            <span>Kho Truyện Tranh Lồng Tiếng Phonics</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Thế Giới Truyện Tranh Tương Tác
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
            Hóa thân thành diễn viên lồng tiếng cho các nhân vật hoạt hình, rèn luyện phát âm âm vị chuẩn bản xứ và tự mình quyết định cái kết của câu chuyện!
          </p>
        </div>

        <div className="size-24 rounded-3xl bg-indigo-600/30 border-2 border-indigo-400/40 text-white flex items-center justify-center text-5xl shadow-xl shrink-0">
          📚
        </div>
      </div>

      {/* Level Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b-2 border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-6 text-indigo-600" />
          <h2 className="text-2xl font-black text-slate-900">Danh Sách Truyện</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Tất cả cấp độ' },
            { key: 'Pre-A1', label: 'Cấp độ Pre-A1' },
            { key: 'A1', label: 'Cấp độ A1' },
            { key: 'A2', label: 'Cấp độ A2' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedLevel(tab.key as typeof selectedLevel)}
              className={`px-5 py-2.5 rounded-2xl text-base font-bold transition-all cursor-pointer ${
                selectedLevel === tab.key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-indigo-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group"
          >
            <div className="space-y-4">
              {/* Cover & Level */}
              <div className="flex items-center justify-between">
                <div className="size-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-4xl shadow-xs group-hover:scale-105 transition-transform">
                  {story.coverEmoji}
                </div>
                <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 text-base font-black border border-purple-200">
                  {story.level}
                </span>
              </div>

              {/* Titles */}
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {story.titleVi}
                </h3>
                <p className="text-base font-bold text-slate-500 italic">
                  {story.title}
                </p>
              </div>

              {/* Synopsis */}
              <p className="text-base font-medium text-slate-600 line-clamp-3">
                {story.synopsisVi}
              </p>

              {/* Focus Phonemes */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-base font-bold text-slate-700">
                  Âm vị trọng tâm:
                </span>
                <div className="flex flex-wrap gap-2">
                  {story.focusPhonemes.map((ph) => (
                    <span
                      key={ph}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-base font-mono font-bold border border-slate-200"
                    >
                      {ph}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Read & Voice-act Action Link */}
            <Link
              href={`/stories/${story.id}`}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center justify-center gap-2.5 group-hover:gap-3.5"
            >
              <Mic className="size-5" />
              <span>Đọc & Lồng Tiếng Ngay</span>
              <ArrowRight className="size-5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
