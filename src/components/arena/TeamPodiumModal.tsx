// src/components/arena/TeamPodiumModal.tsx

'use client'

import React from 'react'
import {
  Crown,
  Medal,
  Star,
  RotateCcw,
} from 'lucide-react'
import type { TeamBattleSummary } from '@/types/team-battle'

interface TeamPodiumModalProps {
  summary: TeamBattleSummary
  onPlayAgain?: () => void
}

export function TeamPodiumModal({ summary, onPlayAgain }: TeamPodiumModalProps) {
  const { winningTeam, teamRankings, mvps } = summary

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border-2 border-amber-400/40 shadow-2xl max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
      {/* Champion Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 text-amber-300 text-base font-bold border border-amber-500/40">
          <Crown className="size-6 text-amber-400 fill-amber-400" />
          <span>Nhà Vô Địch Đấu Trường Đồng Đội</span>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <span className="text-6xl sm:text-7xl animate-bounce">
            {winningTeam.config.mascotEmoji}
          </span>
          <div className="text-left">
            <h1 className={`text-3xl sm:text-5xl font-black ${winningTeam.config.textClass}`}>
              {winningTeam.config.nameVi}
            </h1>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono pt-1">
              🏆 {winningTeam.totalScore.toLocaleString()} Điểm
            </p>
          </div>
        </div>
      </div>

      {/* Team Rankings Table / Cards */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-slate-300">Bảng Xếp Hạng Chung Cuộc:</h2>
        <div className="grid gap-3">
          {teamRankings.map((team, idx) => (
            <div
              key={team.id}
              className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
                idx === 0
                  ? 'bg-amber-500/15 border-amber-400/50'
                  : 'bg-slate-800/80 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-slate-950 flex items-center justify-center font-black text-xl text-amber-300">
                  {idx === 0 ? <Medal className="size-6 text-amber-400" /> : `#${idx + 1}`}
                </div>
                <span className="text-3xl">{team.config.mascotEmoji}</span>
                <span className={`text-xl font-black ${team.config.textClass}`}>
                  {team.config.nameVi}
                </span>
                <span className="text-base text-slate-400 font-semibold hidden sm:inline">
                  ({team.members.length} thành viên)
                </span>
              </div>

              <span className="text-2xl font-black text-white font-mono">
                {team.totalScore.toLocaleString()} đ
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MVP Spotlights */}
      {mvps.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-lg">
            <Star className="size-5 text-amber-400 fill-amber-400" />
            <span>Chiến Binh Xuất Sắc Nhất Từng Đội (MVP):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mvps.map((mvp) => (
              <div
                key={mvp.teamId}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 shadow-inner"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{mvp.avatar}</span>
                  <div>
                    <span className="block text-base font-black text-white">
                      {mvp.studentName}
                    </span>
                    <span className="text-base font-bold text-slate-400">
                      Đội {mvp.teamId.toUpperCase()}
                    </span>
                  </div>
                </div>

                <span className="text-xl font-black text-amber-400 font-mono">
                  {mvp.score} đ
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {onPlayAgain && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2.5 cursor-pointer transition-all"
          >
            <RotateCcw className="size-5" />
            <span>Khởi Động Trận Đấu Mới</span>
          </button>
        </div>
      )}
    </div>
  )
}
