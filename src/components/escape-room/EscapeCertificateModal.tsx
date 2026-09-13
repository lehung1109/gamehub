// src/components/escape-room/EscapeCertificateModal.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Award, KeyRound, RotateCcw, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'
import type { EscapeResult } from '@/types/phonics-escape-room'

interface EscapeCertificateModalProps {
  roomTitle: string
  result: EscapeResult
  onReplay: () => void
}

export function EscapeCertificateModal({
  roomTitle,
  result,
  onReplay,
}: EscapeCertificateModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chứng chỉ thám tử thoát hiểm xuất sắc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Certificate Badge Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-400 border-2 border-amber-400/50 shadow-inner">
            <Award className="size-16 sm:size-20" />
          </div>
          <span className="block text-base font-bold text-amber-400 tracking-wider uppercase">
            CHỨNG NHẬN THÁM TỬ XUẤT SẮC
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {result.isEscaped ? 'THOÁT HIỂM THÀNH CÔNG!' : 'HẾT GIỜ ĐIỀU TRA!'}
          </h2>
          <p className="text-base text-slate-300 font-medium">{roomTitle}</p>
        </div>

        {/* Keys Awarded */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[1, 2, 3].map((starIndex) => {
            const hasKey = starIndex <= result.keysEarned
            return (
              <div
                key={starIndex}
                className={`size-16 sm:size-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  hasKey
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40 scale-105'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                }`}
              >
                <KeyRound className="size-8 sm:size-9" />
                <span className="text-base font-black">
                  {hasKey ? 'VÀNG' : 'KHÓA'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-base font-bold">
              <Clock className="size-4 text-sky-400" />
              <span>Thời gian</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-sky-400">
              {formatTime(result.timeSpentSeconds)}
            </span>
          </div>

          <div className="space-y-1 border-x border-slate-800">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-base font-bold">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span>Manh mối</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              {result.cluesSolved}/{result.totalClues}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-base font-bold">
              <Award className="size-4 text-amber-400" />
              <span>Kinh nghiệm</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              +{result.expEarned} XP
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onReplay}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-base sm:text-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="size-5" />
            <span>Thử Lại Phòng</span>
          </button>
          <Link
            href="/escape-room"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base sm:text-lg inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
          >
            <ArrowLeft className="size-5" />
            <span>Sảnh Thoát Hiểm</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
