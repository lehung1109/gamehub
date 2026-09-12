'use client'

import React, { useState } from 'react'
import { useStudentSession } from '@/hooks/use-student-session'
import { getStoredStreak, getTodayDateString } from '@/lib/streak'
import { Button } from '@/components/ui/button'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DailyStreakModal } from '@/components/student/DailyStreakModal'

export interface DailyStreakBadgeProps {
  className?: string
  classCode?: string
  studentName?: string
}

export function DailyStreakBadge({
  className,
  classCode,
  studentName,
}: DailyStreakBadgeProps) {
  const { session, isLoaded } = useStudentSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!isLoaded) {
    return null
  }

  const effectiveClassCode = classCode ?? session?.classCode
  const effectiveStudentName = studentName ?? session?.studentName
  const streak = getStoredStreak(effectiveClassCode, effectiveStudentName)

  const today = getTodayDateString()
  const isActiveToday = streak.lastActiveDate === today

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsModalOpen(true)}
        aria-label={`Chuỗi học tập ${streak.currentStreak} ngày`}
        title={`Chuỗi học tập liên tục ${streak.currentStreak} ngày. Bấm để xem chi tiết!`}
        className={cn(
          'group relative inline-flex items-center gap-2 px-3 py-1.5 h-auto rounded-2xl border-2 font-medium shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer select-none',
          isActiveToday
            ? 'bg-orange-50 hover:bg-orange-100/80 border-orange-300 text-orange-950 dark:bg-orange-950/40 dark:border-orange-700/60 dark:text-orange-200'
            : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-700/50 dark:text-amber-300',
          className
        )}
      >
        {/* Flame icon badge */}
        <div
          className={cn(
            'size-6 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-colors',
            isActiveToday
              ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-white'
              : 'bg-amber-200/80 dark:bg-amber-800 text-amber-700 dark:text-amber-300'
          )}
        >
          <Flame
            data-testid="streak-flame-icon"
            className={cn(
              'size-3.5 fill-current',
              isActiveToday && 'animate-pulse'
            )}
            aria-hidden="true"
          />
        </div>

        {/* Streak count text */}
        <span className="text-sm font-black tracking-tight">
          {streak.currentStreak} ngày
        </span>

        {/* Freeze shield badge */}
        {streak.freezeCount > 0 && (
          <span
            data-testid="streak-freeze-badge"
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-cyan-100/80 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-700/60 text-cyan-800 dark:text-cyan-200 text-xs font-bold leading-none"
            title={`Bảo vệ chuỗi: ${streak.freezeCount} khiên băng`}
          >
            <span role="img" aria-label="ice">🧊</span>
            <span>{streak.freezeCount}</span>
          </span>
        )}

        {/* Indicator dot when not active today */}
        {!isActiveToday && (
          <span
            data-testid="streak-indicator-dot"
            className="relative flex size-2 shrink-0 ml-0.5"
            title="Chưa chơi hôm nay"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
          </span>
        )}
      </Button>

      <DailyStreakModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classCode={effectiveClassCode}
        studentName={effectiveStudentName}
      />
    </>
  )
}
