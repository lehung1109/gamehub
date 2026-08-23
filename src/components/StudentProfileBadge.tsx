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
        'inline-flex items-center gap-2.5 px-3 py-1.5 h-auto rounded-2xl bg-amber-50/90 hover:bg-amber-100/80 border-2 border-amber-200 text-slate-800 font-medium shadow-xs transition-all select-none',
        className
      )}
    >
      {/* Level Badge Icon */}
      <div 
        className="size-7 rounded-full bg-gradient-to-tr from-amber-200 to-yellow-400 flex items-center justify-center text-sm shrink-0 shadow-xs border border-amber-300"
        data-testid="level-badge-emoji"
      >
        <span role="img" aria-label={currentLevel.title}>
          {currentLevel.badge}
        </span>
      </div>

      {/* Level and Title */}
      <div className="flex flex-col text-left leading-tight min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-black text-amber-950">
            Lv {currentLevel.level}
          </span>
          <span className="text-[10px] text-amber-700 font-bold">•</span>
          <span className="text-xs font-bold text-amber-800 truncate max-w-[90px] sm:max-w-[120px]">
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
            className="w-20 sm:w-24 h-1.5 bg-amber-200/80 rounded-full overflow-hidden mt-1"
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        ) : (
          <span className="text-[10px] font-bold text-amber-600">Tối đa</span>
        )}
      </div>

      {/* Star Count Pill */}
      <div className="flex items-center gap-1 bg-amber-200/70 border border-amber-300/80 rounded-xl px-2 py-0.5 ml-0.5">
        <Star className="size-3.5 text-amber-600 fill-amber-500" />
        <span className="text-xs font-black text-amber-950" data-testid="total-stars-count">
          {totalStars}
        </span>
      </div>
    </div>
  )
}
