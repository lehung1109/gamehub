// src/components/admin/arena/ArenaPodium.tsx

'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { Trophy, Sparkles, ArrowRight, BookOpen, CheckCircle2, Loader2 } from 'lucide-react'
import type { LiveArenaParticipant } from '@/types/arena'
import { sortArenaLeaderboard, calculatePodiumRewards } from '@/lib/arena/scoring'
import { exportHardQuestionsToMistakeNotebookAction } from '@/app/actions/arena'

interface ArenaPodiumProps {
  participants: LiveArenaParticipant[]
  arenaId?: string
}

export function ArenaPodium({ participants, arenaId }: ArenaPodiumProps) {
  const [isPending, startTransition] = useTransition()
  const [srsMessage, setSrsMessage] = useState<string | null>(null)

  const sorted = sortArenaLeaderboard(participants)
  const first = sorted[0]
  const second = sorted[1]
  const third = sorted[2]
  const rest = sorted.slice(3)

  function handleExportSRS() {
    if (!arenaId) return
    startTransition(async () => {
      const res = await exportHardQuestionsToMistakeNotebookAction(arenaId)
      if (res.success) {
        const count = res.data?.exportedCount || 0
        if (count > 0) {
          setSrsMessage(`✓ Đã lưu ${count} câu hỏi có tỉ lệ sai >40% vào Sổ tay từ khó (SRS)`)
        } else {
          setSrsMessage('Cả lớp làm rất tốt! Không có câu hỏi nào đạt tỉ lệ sai >40%.')
        }
      } else {
        setSrsMessage(`Lỗi: ${res.error || 'Không thể lưu vào Sổ tay'}`)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 text-center">
      {/* Title & Celebrations */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 text-amber-800 text-base font-bold shadow-xs">
          <Sparkles className="size-5 text-amber-500" />
          <span>Vinh Danh Đấu Trường Trực Tiếp</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <Trophy className="size-10 sm:size-12 text-amber-500" />
          <span>Bục Trao Giải Chung Cuộc</span>
          <Trophy className="size-10 sm:size-12 text-amber-500" />
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
          Chúc mừng tất cả các bạn học sinh đã nỗ lực thi đấu và rèn luyện tiếng Anh hăng say!
        </p>
      </div>

      {/* 3D-style Podium Display */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 pt-6 pb-2 max-w-2xl mx-auto">
        {/* 2nd Place (Silver) */}
        {second && (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center space-y-1">
              <span className="text-4xl sm:text-5xl">{second.avatar}</span>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 truncate max-w-[130px]">
                {second.studentName}
              </h3>
              <span className="text-base font-bold text-slate-500 block">{second.score} pts</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-base font-bold inline-block">
                +10 Sao ⭐
              </span>
            </div>
            <div className="w-full h-36 sm:h-44 bg-gradient-to-t from-slate-400 to-slate-200 rounded-t-2xl flex flex-col items-center justify-center text-slate-700 font-black shadow-lg">
              <span className="text-3xl sm:text-4xl">🥈</span>
              <span className="text-base sm:text-lg font-bold uppercase tracking-wider">Hạng 2</span>
            </div>
          </div>
        )}

        {/* 1st Place (Gold) */}
        {first && (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center space-y-1">
              <span className="text-5xl sm:text-6xl animate-bounce">{first.avatar}</span>
              <h3 className="font-black text-lg sm:text-xl text-slate-900 truncate max-w-[160px]">
                {first.studentName}
              </h3>
              <span className="text-lg font-black text-amber-600 block">{first.score} pts</span>
              <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-base font-black inline-block shadow-xs border border-amber-300">
                +15 Sao 👑
              </span>
            </div>
            <div className="w-full h-48 sm:h-60 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-t-2xl flex flex-col items-center justify-center text-amber-950 font-black shadow-xl border-t-2 border-amber-200">
              <span className="text-4xl sm:text-5xl">🥇</span>
              <span className="text-lg sm:text-xl font-black uppercase tracking-wider">
                Vô Địch
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {third && (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center space-y-1">
              <span className="text-4xl sm:text-5xl">{third.avatar}</span>
              <h3 className="font-bold text-base sm:text-lg text-slate-800 truncate max-w-[130px]">
                {third.studentName}
              </h3>
              <span className="text-base font-bold text-slate-500 block">{third.score} pts</span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-base font-bold inline-block">
                +5 Sao ⭐
              </span>
            </div>
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-2xl flex flex-col items-center justify-center text-amber-100 font-black shadow-md">
              <span className="text-3xl sm:text-4xl">🥉</span>
              <span className="text-base sm:text-lg font-bold uppercase tracking-wider">Hạng 3</span>
            </div>
          </div>
        )}
      </div>

      {/* Other Finishers Table */}
      {rest.length > 0 && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-5 text-left shadow-xs space-y-3">
          <h4 className="text-base font-bold uppercase text-slate-500 tracking-wider mb-2">
            Các chiến binh hoàn thành
          </h4>
          <div className="divide-y divide-slate-100">
            {rest.map((p, idx) => {
              const rank = idx + 4
              const rewards = calculatePodiumRewards(rank)
              return (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-base font-bold text-slate-500">#{rank}</span>
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="font-bold text-base text-slate-800">{p.studentName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-700">{p.score} pts</span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-base font-medium">
                      +{rewards.stars} Sao
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Post-Game Remediation: SRS Mistake Export Section */}
      <div className="p-6 bg-indigo-50/70 rounded-3xl border border-indigo-100 max-w-xl mx-auto space-y-4 text-center">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-indigo-950 flex items-center justify-center gap-2">
            <BookOpen className="size-6 text-indigo-600" />
            <span>Phục Hồi Lỗi Sai & Luyện Tập SRS</span>
          </h3>
          <p className="text-base text-indigo-700">
            Tự động lọc các câu hỏi có hơn 40% học sinh trả lời sai và chuyển vào Sổ Tay Từ Khó.
          </p>
        </div>

        {srsMessage ? (
          <div className="p-4 bg-white rounded-2xl border border-emerald-200 text-emerald-800 font-bold text-base flex items-center justify-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{srsMessage}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleExportSRS}
            disabled={isPending}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-md inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <BookOpen className="size-5" />
            )}
            <span>Lưu câu hỏi khó vào Sổ tay từ khó (SRS)</span>
          </button>
        )}
      </div>

      {/* Action to return */}
      <div className="pt-2 flex items-center justify-center gap-4">
        <Link
          href="/admin/dashboard"
          className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-colors inline-flex items-center gap-2"
        >
          <span>Về trang Quản trị Dashboard</span>
          <ArrowRight className="size-5" />
        </Link>
      </div>
    </div>
  )
}
