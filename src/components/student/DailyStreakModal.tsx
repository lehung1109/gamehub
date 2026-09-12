'use client'

import React, { useEffect } from 'react'
import { getStoredStreak, getTodayDateString, getEffectiveStreak, STREAK_MILESTONES } from '@/lib/streak'
import { Button } from '@/components/ui/button'
import { X, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DailyStreakModalProps {
  isOpen: boolean
  onClose: () => void
  classCode?: string
  studentName?: string
}

export function DailyStreakModal({
  isOpen,
  onClose,
  classCode,
  studentName,
}: DailyStreakModalProps) {
  // Listen for Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const rawStreak = getStoredStreak(classCode, studentName)
  const today = getTodayDateString()
  const streak = getEffectiveStreak(rawStreak, today)

  const isActiveToday = rawStreak.lastActiveDate === today

  let statusMessage = ''
  if (isActiveToday) {
    statusMessage = '🎉 Hôm nay bạn đã hoàn thành bài học và giữ vững chuỗi!'
  } else if (streak.currentStreak > 0) {
    statusMessage = '⚡ Hãy chơi ít nhất 1 trò chơi hôm nay để tiếp tục chuỗi nhé!'
  } else {
    statusMessage = '⚡ Chuỗi trước đó đã kết thúc. Hãy chơi một trò chơi hôm nay để bắt đầu chuỗi mới nhé!'
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="streak-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-card text-card-foreground border-2 border-orange-200 dark:border-orange-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-orange-50/70 dark:bg-orange-950/30">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Flame className="size-5 fill-white stroke-white" />
            </div>
            <div>
              <h2
                id="streak-modal-title"
                className="text-lg sm:text-xl font-black text-foreground tracking-tight"
              >
                Chuỗi Ngày Học Tập
              </h2>
              {studentName && (
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {studentName}
                  {classCode ? ` • Lớp ${classCode}` : ''}
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-orange-100 dark:hover:bg-orange-900/40 shrink-0 h-9 w-9 min-h-[36px] min-w-[36px]"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Current Streak Hero Card */}
          <div
            className={cn(
              'rounded-2xl p-5 sm:p-6 text-center border-2 transition-all shadow-xs',
              isActiveToday
                ? 'bg-gradient-to-b from-orange-50 via-amber-50/50 to-orange-100/30 border-orange-300 dark:from-orange-950/40 dark:to-amber-950/20 dark:border-orange-700/60'
                : 'bg-gradient-to-b from-amber-50/60 to-orange-50/20 border-amber-200 dark:from-amber-950/30 dark:to-orange-950/10 dark:border-amber-700/50'
            )}
          >
            <div
              className="text-5xl sm:text-6xl mb-2 inline-block select-none animate-bounce"
              role="img"
              aria-label="flame"
            >
              🔥
            </div>
            <div
              className="text-2xl sm:text-3xl font-black text-orange-950 dark:text-orange-100 tracking-tight"
              data-testid="hero-streak-count"
            >
              {streak.currentStreak} Ngày Liên Tiếp
            </div>
            <p className="mt-2 text-base font-semibold text-slate-700 dark:text-slate-300">
              {statusMessage}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Longest streak */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50 flex flex-col items-center text-center shadow-2xs">
              <span className="text-2xl mb-1 select-none" role="img" aria-label="trophy">
                🏆
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Kỷ lục chuỗi dài nhất
              </span>
              <span
                className="text-lg font-black text-amber-950 dark:text-amber-200 mt-0.5"
                data-testid="stat-longest-streak"
              >
                {streak.longestStreak} ngày
              </span>
            </div>

            {/* Total active days */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-700/50 flex flex-col items-center text-center shadow-2xs">
              <span className="text-2xl mb-1 select-none" role="img" aria-label="calendar">
                📅
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Tổng số ngày học
              </span>
              <span
                className="text-lg font-black text-blue-950 dark:text-blue-200 mt-0.5"
                data-testid="stat-total-days"
              >
                {streak.totalActiveDays} ngày
              </span>
            </div>

            {/* Streak freeze */}
            <div className="p-3.5 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-700/50 flex flex-col items-center text-center shadow-2xs">
              <span className="text-2xl mb-1 select-none" role="img" aria-label="ice">
                🧊
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Băng bảo vệ chuỗi
              </span>
              <span
                className="text-lg font-black text-cyan-950 dark:text-cyan-200 mt-0.5"
                data-testid="stat-freeze-count"
              >
                {streak.freezeCount} khiên
              </span>
              <span className="text-xs text-cyan-800 dark:text-cyan-300 mt-1 text-center leading-snug">
                Tự động kích hoạt khi bạn bỏ lỡ 1 ngày để bảo toàn chuỗi.
              </span>
            </div>
          </div>

          {/* Milestones Roadmap */}
          <div className="space-y-2.5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <span>🎯</span>
              <span>Cột mốc chuỗi & phần thưởng</span>
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {STREAK_MILESTONES.map((milestone) => {
                const isUnlocked =
                  streak.unlockedMilestones?.includes(milestone.days) ||
                  streak.currentStreak >= milestone.days

                return (
                  <div
                    key={milestone.days}
                    className={cn(
                      'p-3 rounded-xl border flex items-center justify-between transition-colors',
                      isUnlocked
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-700/50'
                        : 'bg-muted/30 border-border'
                    )}
                  >
                    <div>
                      <div className="text-sm font-bold text-foreground">
                        {milestone.days} ngày
                      </div>
                      <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        <span>+{milestone.bonusStars}</span>
                        <span>⭐</span>
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                          ✓ Đã nhận
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                          <span>🔒</span>
                          <span>Chưa đạt</span>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-slate-50/70 dark:bg-slate-950/30 flex justify-end">
          <Button
            type="button"
            variant="default"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-base font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm rounded-2xl transition-all"
          >
            Tiếp tục học ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
