// src/components/guild/GuildDetailView.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  Trophy,
  Swords,
  Heart,
  Sparkles,
  ArrowLeft,
  Users,
  Send,
  Crown,
  Flame,
} from 'lucide-react'
import type { StudentGuild, GuildBossRaid } from '@/types/guild'
import { contributeGuildExpAction, postGuildCheerAction } from '@/app/actions/guilds'

interface GuildDetailViewProps {
  initialGuild: StudentGuild
  currentStudentId?: string
  currentStudentName?: string
}

const QUICK_CHEERS = [
  { sticker: '🔥', text: 'Cố lên các bạn ơi, cùng săn Boss nào!' },
  { sticker: '⭐', text: 'Tớ vừa hoàn thành bài học, được thêm XP!' },
  { sticker: '🎉', text: 'Bang hội chúng ta tuyệt vời nhất!' },
  { sticker: '💪', text: 'Sắp hạ gục Boss tuần rồi, tiến lên!' },
]

export function GuildDetailView({
  initialGuild,
  currentStudentId = 'std-guest',
  currentStudentName = 'Bé Bạn Nhỏ',
}: GuildDetailViewProps) {
  const [guild, setGuild] = useState<StudentGuild>(initialGuild)
  const [bossRaid, setBossRaid] = useState<GuildBossRaid>(initialGuild.activeBossRaid)
  const [customCheer, setCustomCheer] = useState('')
  const [isAttacking, setIsAttacking] = useState(false)
  const [attackEffect, setAttackEffect] = useState<string | null>(null)

  const hpPercent = Math.round((bossRaid.currentHp / bossRaid.maxHp) * 100)

  // Handle attacking boss / contributing learning XP
  async function handleAttackBoss() {
    setIsAttacking(true)
    const expContribution = 50
    setAttackEffect('-50 HP!')

    try {
      const res = await contributeGuildExpAction(guild.id, currentStudentId, expContribution)
      if (res.success && res.data) {
        setBossRaid((prev) => ({
          ...prev,
          currentHp: res.data!.bossHp,
          isDefeated: res.data!.isBossDefeated,
        }))
        setGuild((prev) => ({
          ...prev,
          currentExp: res.data!.currentExp,
          currentWeeklyExp: prev.currentWeeklyExp + expContribution,
        }))
      }
    } catch {
      // Local fallback for offline / test
      setBossRaid((prev) => {
        const nextHp = Math.max(0, prev.currentHp - 50)
        return {
          ...prev,
          currentHp: nextHp,
          isDefeated: nextHp === 0,
        }
      })
    } finally {
      setIsAttacking(false)
      setTimeout(() => setAttackEffect(null), 1500)
    }
  }

  // Handle posting cheer message
  async function handleSendCheer(message: string, sticker = '🎉') {
    if (!message.trim()) return

    const res = await postGuildCheerAction(guild.id, currentStudentName, message, sticker)
    if (res.success && res.data) {
      setGuild(res.data)
    } else {
      // Optimistic local fallback
      const newCheer = {
        id: `cheer-opt-${Date.now()}`,
        senderName: currentStudentName,
        senderAvatar: '🌟',
        stickerKey: sticker,
        messageVi: message,
        createdAt: new Date().toISOString(),
      }
      setGuild((prev) => ({
        ...prev,
        cheerWall: [newCheer, ...prev.cheerWall],
      }))
    }
    setCustomCheer('')
  }

  const sortedMembers = [...guild.members].sort(
    (a, b) => b.weeklyExpContributed - a.weeklyExpContributed
  )

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
        <Link
          href="/guilds"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Danh Sách Bang Hội</span>
        </Link>

        <span className="px-4 py-2 rounded-2xl bg-amber-100 text-amber-950 font-black text-base inline-flex items-center gap-2 border-2 border-amber-300">
          <Shield className="size-5 text-amber-600" />
          <span>Mã Bang: {guild.code}</span>
        </span>
      </div>

      {/* Big Guild Banner */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border-4 border-slate-800 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <span className="text-6xl sm:text-7xl p-4 bg-white/10 rounded-3xl backdrop-blur-xs border-2 border-white/20">
              {guild.mascotAvatar}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {guild.name}
                </h1>
                <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-base uppercase">
                  Cấp {guild.level}
                </span>
              </div>
              <p className="text-lg text-slate-300 font-medium max-w-xl">
                {guild.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-xs border border-white/20">
            <Users className="size-6 text-indigo-300" />
            <div>
              <span className="block text-base font-bold text-slate-300">Thành Viên</span>
              <span className="block text-2xl font-black text-white">
                {guild.members.length} bạn
              </span>
            </div>
          </div>
        </div>

        {/* Guild EXP Progress Bar */}
        <div className="space-y-2 pt-2 relative z-10">
          <div className="flex justify-between items-center text-base font-bold text-slate-300">
            <span>Tiến độ kinh nghiệm Bang Hội</span>
            <span>{guild.currentExp % 1000} / 1000 XP để lên Cấp {guild.level + 1}</span>
          </div>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${((guild.currentExp % 1000) / 1000) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Boss Raid Section */}
      <div className="p-8 rounded-3xl bg-amber-50/80 border-4 border-amber-300 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-6xl p-3 bg-amber-100 rounded-2xl border-2 border-amber-300">
              {bossRaid.bossAvatar}
            </span>
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-2 text-rose-700 font-black text-base uppercase">
                <Flame className="size-5 text-rose-600 animate-pulse" />
                <span>Đại Chiến Boss Tuần ({bossRaid.targetWeek})</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                {bossRaid.bossName}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-base font-bold text-slate-600">Phần Thưởng Bang Hội</span>
            <span className="block text-2xl font-black text-amber-700">
              +{bossRaid.rewardsExp} XP / bạn
            </span>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-base font-black">
            <span className="text-slate-700">Máu Của Boss (HP)</span>
            <span className="text-rose-600">
              {bossRaid.currentHp} / {bossRaid.maxHp} HP ({hpPercent}%)
            </span>
          </div>
          <div className="h-6 w-full bg-slate-200 rounded-full overflow-hidden border-2 border-slate-300 relative">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                bossRaid.isDefeated
                  ? 'bg-slate-400'
                  : 'bg-linear-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Boss Action & Defeat State */}
        {bossRaid.isDefeated ? (
          <div className="p-6 bg-emerald-100 border-2 border-emerald-300 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
            <Trophy className="size-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-emerald-950">
              🎉 CHIẾN THẮNG! BOSS TUẦN ĐÃ BỊ ĐÁNH BẠI!
            </h3>
            <p className="text-base text-emerald-800 font-bold">
              Tất cả thành viên trong bang đều nhận được huy hiệu vinh danh và +{bossRaid.rewardsExp} XP!
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-base text-slate-700 font-semibold">
              Mỗi điểm kinh nghiệm em học được từ bài vè hay truyện tranh đều trừ trực tiếp vào máu của Boss!
            </p>

            <button
              type="button"
              onClick={handleAttackBoss}
              disabled={isAttacking}
              aria-label="Tấn công boss bằng 50 XP bài học"
              className="px-6 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-lg inline-flex items-center gap-3 cursor-pointer shadow-lg shadow-rose-600/30 transition-all shrink-0 relative"
            >
              <Swords className="size-6" />
              <span>Tấn Công Boss (-50 HP)</span>
              {attackEffect && (
                <span className="absolute -top-6 right-6 text-2xl font-black text-rose-600 animate-bounce">
                  {attackEffect}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Grid: Members Leaderboard & Social Cheer Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Members Contribution Leaderboard */}
        <div className="bg-white rounded-3xl border-3 border-slate-800 p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
            <div className="flex items-center gap-2 text-indigo-950 font-black text-xl">
              <Trophy className="size-6 text-amber-500" />
              <span>Bảng Vinh Danh Đóng Góp Tuần</span>
            </div>
            <span className="text-base font-bold text-slate-500">
              {sortedMembers.length} thành viên
            </span>
          </div>

          <div className="space-y-3">
            {sortedMembers.map((member, idx) => (
              <div
                key={member.studentId}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-indigo-50/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-black text-slate-400 w-6 text-center">
                    {idx === 0 ? <Crown className="size-6 text-amber-500 fill-amber-500" /> : `#${idx + 1}`}
                  </span>
                  <span className="text-3xl">{member.avatar}</span>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      {member.studentName}
                    </h4>
                    <span className="text-base font-semibold text-indigo-600 uppercase">
                      {member.role === 'leader' ? 'Bang Chủ' : member.role === 'officer' ? 'Phó Bang' : 'Thành Viên'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-lg font-black text-amber-600">
                    +{member.weeklyExpContributed} XP
                  </span>
                  <span className="block text-base font-medium text-slate-500">
                    Tổng: {member.totalExpContributed} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kid-Friendly Cheer Wall */}
        <div className="bg-white rounded-3xl border-3 border-slate-800 p-6 space-y-5 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2 text-purple-950 font-black text-xl">
                <Heart className="size-6 text-rose-500 fill-rose-500" />
                <span>Bức Tường Cổ Vũ Nhí</span>
              </div>
              <span className="text-base font-bold text-slate-500">
                Lan tỏa tinh thần đồng đội
              </span>
            </div>

            {/* Quick Cheer Buttons */}
            <div className="space-y-2">
              <span className="block text-base font-bold text-slate-600">
                Gửi lời cổ vũ nhanh:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_CHEERS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendCheer(q.text, q.sticker)}
                    aria-label={`Gửi cổ vũ ${q.text}`}
                    className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left text-base font-bold text-purple-950 inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <span className="text-xl">{q.sticker}</span>
                    <span className="truncate">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cheer List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {guild.cheerWall.map((cheer) => (
                <div
                  key={cheer.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
                >
                  <div className="flex items-center justify-between text-base">
                    <span className="font-black text-slate-900 inline-flex items-center gap-1.5">
                      <span>{cheer.senderAvatar}</span>
                      <span>{cheer.senderName}</span>
                    </span>
                    <span className="text-xl">{cheer.stickerKey}</span>
                  </div>
                  <p className="text-base text-slate-700 font-medium">
                    {cheer.messageVi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Cheer Input */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={customCheer}
              onChange={(e) => setCustomCheer(e.target.value)}
              placeholder="Nhập lời khen tặng bạn bè..."
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-300 text-base font-semibold text-slate-800 focus:outline-none focus:border-indigo-600"
            />
            <button
              type="button"
              onClick={() => handleSendCheer(customCheer, '🎉')}
              aria-label="Gửi lời cổ vũ bạn bè"
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-base inline-flex items-center gap-2 cursor-pointer shadow-md transition-all shrink-0"
            >
              <Send className="size-5" />
              <span>Gửi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
