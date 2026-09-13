'use client'

import React from 'react'
import type { WeeklyLearningDigest } from '@/types/parent'

interface WeeklyDigestCardProps {
  digest: WeeklyLearningDigest
}

export function WeeklyDigestCard({ digest }: WeeklyDigestCardProps) {
  return (
    <div className="space-y-6">
      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-1" aria-hidden="true">⏱️</span>
          <span className="text-base text-muted-foreground font-medium">Tổng thời gian</span>
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {digest.totalMinutesSpent} phút
          </span>
        </div>

        <div className="bg-sky-50 dark:bg-sky-950/30 border-2 border-sky-200 dark:border-sky-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-1" aria-hidden="true">🎮</span>
          <span className="text-base text-muted-foreground font-medium">Đã hoàn thành</span>
          <span className="text-2xl font-bold text-sky-700 dark:text-sky-300">
            {digest.totalGamesPlayed} ván
          </span>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-3xl mb-1" aria-hidden="true">⭐</span>
          <span className="text-base text-muted-foreground font-medium">Sao tuần này</span>
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            +{digest.starsEarnedThisWeek}
          </span>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative">
          <span className="text-3xl mb-1" aria-hidden="true">🔥</span>
          <span className="text-base text-muted-foreground font-medium">Chuỗi chuyên cần</span>
          <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
            {digest.streakDays} ngày
          </span>
          {digest.hasFreezeShield && (
            <span className="mt-1 inline-flex items-center gap-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-200 px-2.5 py-0.5 rounded-full text-base font-medium">
              🛡️ Khiên bảo vệ
            </span>
          )}
        </div>
      </div>

      {/* Strongest & Focus Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl" aria-hidden="true">🌟</span>
            <h3 className="text-lg font-bold text-foreground">Kỹ năng vượt trội</h3>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {digest.strongestSkill.name}
            </span>
            <span className="text-base font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full">
              {digest.strongestSkill.accuracyPercent}% chính xác
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            Bé thể hiện phản xạ rất nhanh và độ chính xác cao ở nội dung này!
          </p>
        </div>

        <div className="bg-card border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl" aria-hidden="true">🎯</span>
            <h3 className="text-lg font-bold text-foreground">Trọng tâm rèn luyện</h3>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xl font-bold text-amber-700 dark:text-amber-300">
              {digest.focusSkill.name}
            </span>
            <span className="text-base font-semibold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
              {digest.focusSkill.accuracyPercent}% chính xác
            </span>
          </div>
          <p className="text-base text-muted-foreground">
            {digest.focusSkill.suggestedActivity}
          </p>
        </div>
      </div>

      {/* Pedagogical Home Tips for Parents */}
      <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl" aria-hidden="true">💡</span>
          <h3 className="text-xl font-bold text-indigo-950 dark:text-indigo-200">
            Góc Phụ Huynh: Mẹo học vui tại nhà cùng bé
          </h3>
        </div>
        <ul className="space-y-2.5">
          {digest.recommendedHomeTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">•</span>
              <span className="text-base text-foreground/90 font-medium leading-relaxed">
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
