// src/components/admin/arena/ArenaPodium.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { Trophy, Sparkles, ArrowRight } from 'lucide-react'
import type { LiveArenaParticipant } from '@/types/arena'
import { sortArenaLeaderboard, calculatePodiumRewards } from '@/lib/arena/scoring'

interface ArenaPodiumProps {
  participants: LiveArenaParticipant[]
}

export function ArenaPodium({ participants }: ArenaPodiumProps) {
  const sorted = sortArenaLeaderboard(participants)
  const first = sorted[0]
  const second = sorted[1]
  const third = sorted[2]
  const rest = sorted.slice(3)

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 text-center">
      {/* Title & Celebrations */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-xs">
          <Sparkles className="size-4 text-amber-500" />
          <span>Vinh Danh Đấu Trường Trực Tiếp</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3">
          <Trophy className="size-10 text-amber-500" />
          <span>Bục Trao Giải Chung Cuộc</span>
          <Trophy className="size-10 text-amber-500" />
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Chúc mừng tất cả các bạn học sinh đã nỗ lực thi đấu và rèn luyện tiếng Anh hăng say!
        </p>
      </div>

      {/* 3D-style Podium Display */}
      <div className="flex items-end justify-center gap-2 sm:gap-6 pt-6 pb-2 max-w-2xl mx-auto">
        {/* 2nd Place (Silver) */}
        {second && (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center space-y-1">
              <span className="text-3xl sm:text-4xl">{second.avatar}</span>
              <h3 className="font-bold text-sm text-slate-800 truncate max-w-[110px]">
                {second.studentName}
              </h3>
              <span className="text-xs font-bold text-slate-500 block">{second.score} pts</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold inline-block">
                +10 Sao ⭐
              </span>
            </div>
            <div className="w-full h-32 sm:h-40 bg-gradient-to-t from-slate-400 to-slate-200 rounded-t-2xl flex flex-col items-center justify-center text-slate-700 font-black shadow-lg">
              <span className="text-2xl sm:text-3xl">🥈</span>
              <span className="text-sm sm:text-base font-bold uppercase tracking-wider">Hạng 2</span>
            </div>
          </div>
        )}

        {/* 1st Place (Gold) */}
        {first && (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center space-y-1">
              <span className="text-4xl sm:text-5xl animate-bounce">{first.avatar}</span>
              <h3 className="font-black text-base sm:text-lg text-slate-900 truncate max-w-[140px]">
                {first.studentName}
              </h3>
              <span className="text-sm font-black text-amber-600 block">{first.score} pts</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black inline-block shadow-xs border border-amber-300">
                +15 Sao 👑
              </span>
            </div>
            <div className="w-full h-44 sm:h-56 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-t-2xl flex flex-col items-center justify-center text-amber-950 font-black shadow-xl border-t-2 border-amber-200">
              <span className="text-3xl sm:text-4xl">🥇</span>
              <span className="text-base sm:text-lg font-black uppercase tracking-wider">
                Vô Địch
              </span>
            </div>
          </div>
        )}

        {/* 3rd Place (Bronze) */}
        {third && (
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-2 text-center space-y-1">
              <span className="text-3xl sm:text-4xl">{third.avatar}</span>
              <h3 className="font-bold text-sm text-slate-800 truncate max-w-[110px]">
                {third.studentName}
              </h3>
              <span className="text-xs font-bold text-slate-500 block">{third.score} pts</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold inline-block">
                +5 Sao ⭐
              </span>
            </div>
            <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-2xl flex flex-col items-center justify-center text-amber-100 font-black shadow-md">
              <span className="text-2xl sm:text-3xl">🥉</span>
              <span className="text-sm sm:text-base font-bold uppercase tracking-wider">Hạng 3</span>
            </div>
          </div>
        )}
      </div>

      {/* Other Finishers Table */}
      {rest.length > 0 && (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-4 text-left shadow-xs space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
            Các chiến binh hoàn thành
          </h4>
          <div className="divide-y divide-slate-100">
            {rest.map((p, idx) => {
              const rank = idx + 4
              const rewards = calculatePodiumRewards(rank)
              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-xs font-bold text-slate-400">#{rank}</span>
                    <span className="text-xl">{p.avatar}</span>
                    <span className="font-bold text-sm text-slate-800">{p.studentName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">{p.score} pts</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      +{rewards.stars} Sao
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action to return */}
      <div className="pt-4 flex items-center justify-center gap-3">
        <Link
          href="/admin/dashboard"
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors inline-flex items-center gap-2"
        >
          <span>Về trang Quản trị Dashboard</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
