// src/components/guild/GuildHub.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, Sparkles, Users, Swords, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react'
import type { StudentGuild } from '@/types/guild'
import { JoinGuildModal } from './JoinGuildModal'

interface GuildHubProps {
  guilds: StudentGuild[]
  currentStudentId?: string
  currentStudentName?: string
}

export function GuildHub({
  guilds,
  currentStudentId = 'std-guest',
  currentStudentName = 'Bé Bạn Nhỏ',
}: GuildHubProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGuilds = guilds.filter((g) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      g.name.toLowerCase().includes(term) ||
      g.code.toLowerCase().includes(term) ||
      g.description.toLowerCase().includes(term)
    )
  })

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Top Navigation & Hub Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
          >
            <ArrowLeft className="size-5" />
            <span>Trang Chủ</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsJoinModalOpen(true)}
            aria-label="Nhập mã vào bang hội"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base inline-flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
          >
            <KeyRound className="size-5" />
            <span>Nhập Mã Vào Bang</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 font-black text-base uppercase tracking-wider">
            <Sparkles className="size-4 text-amber-600" />
            <span>Tinh Thần Đồng Đội & Săn Boss</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
            🛡️ Đại Sảnh Bang Hội Học Tập 👑
          </h1>
          <p className="text-lg sm:text-xl font-medium text-slate-600 max-w-2xl mx-auto">
            Gia nhập bang hội cùng bạn bè, chung sức đánh bại Boss từ vựng tuần và vinh danh tinh thần học hỏi!
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên bang hoặc mã bang (VD: DRAGON)..."
          className="w-full px-5 py-3.5 rounded-2xl border-2 border-slate-300 text-base font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 shadow-xs"
        />
      </div>

      {/* Guilds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuilds.map((guild) => {
          const boss = guild.activeBossRaid
          const hpPercent = Math.round((boss.currentHp / boss.maxHp) * 100)

          return (
            <div
              key={guild.id}
              className="bg-white rounded-3xl border-3 border-slate-800 p-6 flex flex-col justify-between space-y-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-5xl p-3 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    {guild.mascotAvatar}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-base uppercase">
                      Cấp {guild.level}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-900 font-mono font-bold text-base border border-indigo-200">
                      {guild.code}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-950">
                    {guild.name}
                  </h3>
                  <p className="text-base text-slate-600 font-medium line-clamp-2">
                    {guild.description}
                  </p>
                </div>

                {/* Clan Stats */}
                <div className="space-y-3 pt-3 border-t-2 border-slate-100">
                  <div className="flex items-center justify-between text-base font-bold text-slate-700">
                    <span className="inline-flex items-center gap-2">
                      <Users className="size-5 text-indigo-500" />
                      <span>Thành viên:</span>
                    </span>
                    <span className="font-black text-slate-900">
                      {guild.members.length} bạn
                    </span>
                  </div>

                  {/* Boss Raid Mini-Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-base font-bold">
                      <span className="inline-flex items-center gap-1.5 text-slate-700">
                        <Swords className="size-4 text-rose-500" />
                        <span>Boss tuần:</span>
                      </span>
                      <span className={boss.isDefeated ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>
                        {boss.isDefeated ? 'ĐÃ BỊ HẠ!' : `${hpPercent}% HP`}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          boss.isDefeated ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/guilds/${guild.id}`}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Vào Trụ Sở Bang</span>
                <ArrowRight className="size-5" />
              </Link>
            </div>
          )
        })}
      </div>

      {/* Join Guild Pop-up Modal */}
      <JoinGuildModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        currentStudentId={currentStudentId}
        currentStudentName={currentStudentName}
      />
    </div>
  )
}
