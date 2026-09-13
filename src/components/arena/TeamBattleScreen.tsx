// src/components/arena/TeamBattleScreen.tsx

'use client'

import React from 'react'
import {
  Swords,
  Flame,
  Users,
  Trophy,
} from 'lucide-react'
import type { TeamState } from '@/types/team-battle'

interface TeamBattleScreenProps {
  pin: string
  currentQuestionIndex: number
  totalQuestions: number
  teams: TeamState[]
  onNextQuestion?: () => void
}

export function TeamBattleScreen({
  pin,
  currentQuestionIndex,
  totalQuestions,
  teams,
  onNextQuestion,
}: TeamBattleScreenProps) {
  const totalClassPoints = Math.max(
    1,
    teams.reduce((sum, t) => sum + t.totalScore, 0)
  )

  const isDualClash = teams.length === 2

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-10 flex flex-col justify-between space-y-8">
      {/* Host Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-indigo-600/30 border-2 border-indigo-500 text-indigo-300 flex items-center justify-center">
            <Swords className="size-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-base font-bold border border-indigo-500/30">
              <span>Đại Chiến Chia Đội Lớp Học</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white pt-1">
              Câu {currentQuestionIndex + 1} / {totalQuestions}
            </h1>
          </div>
        </div>

        {/* PIN Badge */}
        <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-2xl border-2 border-slate-800">
          <span className="text-base font-bold text-slate-400 uppercase tracking-wider">
            Mã PIN phòng:
          </span>
          <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-widest">
            {pin}
          </span>
        </div>
      </div>

      {/* Main Arena Power Meter: Tug-of-War for 2 Teams */}
      {isDualClash && (
        <div className="space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between text-2xl font-black">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-4xl">{teams[0].config.mascotEmoji}</span>
              <span>{teams[0].config.nameVi}</span>
            </div>

            <div className="px-5 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-amber-300 text-lg font-black">
              VS
            </div>

            <div className="flex items-center gap-3 text-blue-400">
              <span>{teams[1].config.nameVi}</span>
              <span className="text-4xl">{teams[1].config.mascotEmoji}</span>
            </div>
          </div>

          {/* Tug of war bar */}
          <div className="w-full h-8 bg-slate-900 rounded-full overflow-hidden border-2 border-slate-800 flex shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-700"
              style={{
                width: `${(teams[0].totalScore / totalClassPoints) * 100}%`,
              }}
            />
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
              style={{
                width: `${(teams[1].totalScore / totalClassPoints) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Team Cards Grid */}
      <div
        className={`grid gap-6 max-w-6xl mx-auto w-full ${
          isDualClash ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {teams.map((team) => (
          <div
            key={team.id}
            className={`p-6 sm:p-8 rounded-3xl border-2 bg-slate-900/90 shadow-xl space-y-5 transition-all ${
              team.config.borderClass
            }`}
          >
            {/* Team Mascot Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl sm:text-5xl">{team.config.mascotEmoji}</span>
                <div>
                  <h3 className={`text-2xl font-black ${team.config.textClass}`}>
                    {team.config.nameVi}
                  </h3>
                  <div className="flex items-center gap-1.5 text-base text-slate-400 font-bold">
                    <Users className="size-4" />
                    <span>{team.members.length} thành viên</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-xl bg-slate-800 text-amber-300 text-base font-black border border-slate-700">
                  Hạng #{team.rank}
                </span>
              </div>
            </div>

            {/* Total Points */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Trophy className="size-5" />
                <span>Tổng Điểm:</span>
              </div>
              <span className="text-3xl font-black text-white font-mono">
                {team.totalScore.toLocaleString()}
              </span>
            </div>

            {/* Combo Multiplier Badge */}
            {team.comboMultiplier > 1.0 && (
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-500/20 text-amber-300 font-black text-base border border-amber-500/30 animate-pulse">
                <Flame className="size-5 text-amber-400 fill-amber-400" />
                <span>Combo Đội: x{team.comboMultiplier} Điểm Thưởng!</span>
              </div>
            )}

            {/* Member List Preview */}
            <div className="space-y-2 pt-2">
              <span className="block text-base font-bold text-slate-400">
                Thành viên xuất sắc:
              </span>
              <div className="flex flex-wrap gap-2">
                {team.members.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-base font-bold text-slate-200 flex items-center gap-1.5"
                  >
                    <span>{m.avatar}</span>
                    <span>{m.name}</span>
                    <span className="text-amber-400">({m.points}đ)</span>
                  </div>
                ))}
                {team.members.length === 0 && (
                  <span className="text-base text-slate-500 font-medium italic">
                    Đang chờ học sinh tham gia...
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Host Controls */}
      <div className="flex justify-end max-w-6xl mx-auto w-full pt-4">
        {onNextQuestion && (
          <button
            type="button"
            onClick={onNextQuestion}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-base shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
          >
            Chuyển Câu Tiếp Theo →
          </button>
        )}
      </div>
    </div>
  )
}
