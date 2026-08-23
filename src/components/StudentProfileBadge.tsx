'use client'

import React from 'react'
import { useStudentSession } from '@/hooks/use-student-session'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudentProfileBadgeProps {
  className?: string
}

export function StudentProfileBadge({ className }: StudentProfileBadgeProps) {
  const { session, totalStars, levelInfo, isAnonymous, isLoaded } = useStudentSession()

  // Don't show if session is not loaded, there is no session, or user is anonymous
  if (!isLoaded || !session || isAnonymous) {
    return null
  }

  const { currentLevel, nextLevel, progressToNext, starsToNext } = levelInfo

  const tooltipTitle = nextLevel
    ? `Cấp độ ${currentLevel.level}: ${currentLevel.title} (${totalStars} sao) - Cần thêm ${starsToNext} sao để lên ${nextLevel.title} ${nextLevel.badge}`
    : `Cấp độ ${currentLevel.level}: ${currentLevel.title} (${totalStars} sao) - Đã đạt cấp độ tối đa!`

  return (
    <div
      data-testid="student-profile-badge"
      title={tooltipTitle}
      className={cn(
        'inline-flex items-center gap-2.5 px-3 py-1.5 h-auto rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-950/60 border-2 border-amber-200 dark:border-amber-700/60 text-slate-800 dark:text-slate-100 font-medium shadow-xs transition-all select-none',
        className
      )}
    >
      {/* Level Badge Icon */}
      <div 
        className="size-7 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-400 dark:from-amber-600 dark:to-yellow-500 flex items-center justify-center text-sm shrink-0 shadow-xs border border-amber-300 dark:border-amber-500"
        data-testid="level-badge-emoji"
      >
        <span role="img" aria-label={currentLevel.title}>
          {currentLevel.badge}
        </span>
      </div>

      {/* Level and Title */}
      <div className="flex flex-col text-left leading-tight min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-black text-amber-950 dark:text-amber-200">
            Lv {currentLevel.level}
          </span>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">•</span>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate max-w-[90px] sm:max-w-[120px]">
            {currentLevel.title}
          </span>
        </div>

        {/* Progress Bar towards Next Level */}
        {nextLevel ? (
          <div
            role="progressbar"
            aria-valuenow={progressToNext}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Tiến trình lên ${nextLevel.title}: ${progressToNext}%`}
            className="w-20 sm:w-24 h-1.5 bg-amber-200/80 dark:bg-amber-900/60 rounded-full overflow-hidden mt-1"
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        ) : (
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Tối đa</span>
        )}
      </div>

      {/* Star Count Pill */}
      <div className="flex items-center gap-1 bg-amber-200/70 dark:bg-amber-900/60 border border-amber-300/80 dark:border-amber-700/60 rounded-xl px-2 py-0.5 ml-0.5">
        <Star className="size-3.5 text-amber-600 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
        <span className="text-xs font-black text-amber-950 dark:text-amber-200" data-testid="total-stars-count">
          {totalStars}
        </span>
      </div>
    </div>
  )
}
