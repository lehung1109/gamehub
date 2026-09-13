// src/components/passport/VoicePortfolioPlayer.tsx
'use client'

import React, { useState } from 'react'
import { Mic, Play, Pause, Volume2, Sparkles, CheckCircle2 } from 'lucide-react'
import type { VoicePortfolioItem } from '@/types/passport'
import { useSpeech } from '@/hooks/useSpeech'

interface VoicePortfolioPlayerProps {
  items: VoicePortfolioItem[]
}

export function VoicePortfolioPlayer({ items }: VoicePortfolioPlayerProps) {
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null)
  const { speak, cancel } = useSpeech({ rate: 0.9 })

  function handlePlayVoice(item: VoicePortfolioItem) {
    if (activePlayingId === item.id) {
      cancel()
      setActivePlayingId(null)
    } else {
      setActivePlayingId(item.id)
      speak(item.audioSampleText)
      setTimeout(() => {
        setActivePlayingId(null)
      }, item.durationSeconds * 1000 + 500)
    }
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-indigo-300 p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl border-2 border-indigo-300">
            <Mic className="size-7 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Hồ Sơ Giọng Nói Nhí (Audio Portfolio)
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Lưu giữ những bản thu âm tự tin và tiến bộ phát âm theo thời gian của em!
            </p>
          </div>
        </div>

        <span className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-950 font-black text-base inline-flex items-center gap-1.5">
          <Sparkles className="size-4 text-indigo-600" />
          <span>{items.length} Bản Ghi Âm Tiêu Biểu</span>
        </span>
      </div>

      {/* Voice Items List */}
      <div className="space-y-4">
        {items.map((item) => {
          const isPlaying = activePlayingId === item.id

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 font-bold text-base uppercase">
                    {item.type === 'story-dialogue'
                      ? 'Lồng Tiếng Truyện'
                      : item.type === 'phonics-chant'
                      ? 'Bài Vè Karaoke'
                      : 'Hội Thoại AI'}
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    {item.titleVi}
                  </h4>
                </div>

                <p className="text-xl font-black text-slate-950 tracking-wide font-sans">
                  &ldquo;{item.audioSampleText}&rdquo;
                </p>

                <div className="flex items-center gap-4 text-base font-semibold text-slate-500">
                  <span>Thời lượng: {item.durationSeconds}s</span>
                  <span>•</span>
                  <span>Ngày thu: {new Date(item.recordedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>

              {/* Accuracy & Playback */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-600 font-black text-xl">
                    <CheckCircle2 className="size-5" />
                    <span>{item.accuracyPercent}%</span>
                  </div>
                  <span className="block text-base font-bold text-slate-500">Độ chuẩn xác</span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayVoice(item)}
                  aria-label={`Nghe lại đoạn thu âm ${item.titleVi}`}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-base inline-flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
                >
                  {isPlaying ? <Pause className="size-5" /> : <Volume2 className="size-5" />}
                  <span>{isPlaying ? 'Dừng' : 'Nghe Lại'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
