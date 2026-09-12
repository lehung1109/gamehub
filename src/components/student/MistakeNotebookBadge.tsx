'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useStudentSession } from '@/hooks/use-student-session'
import { getStoredSrsDeck } from '@/lib/srs-storage'
import { getDueCards } from '@/lib/srs'
import { getLevelInfo } from '@/lib/levels'
import { StudentGamificationModal } from '@/components/student/StudentGamificationModal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MistakeNotebookBadgeProps {
  className?: string
  classCode?: string
  studentName?: string
}

export function MistakeNotebookBadge({
  className,
  classCode,
  studentName,
}: MistakeNotebookBadgeProps = {}) {
  const {
    session,
    totalStars,
    levelInfo,
    isAnonymous,
    isLoaded,
    refreshProgress,
  } = useStudentSession()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Listen to window storage, focus, and srs-deck-updated events to keep deck count updated
  useEffect(() => {
    const handleUpdate = () => setRefreshKey((k) => k + 1)
    window.addEventListener('storage', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    window.addEventListener('srs-deck-updated', handleUpdate)
    return () => {
      window.removeEventListener('storage', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
      window.removeEventListener('srs-deck-updated', handleUpdate)
    }
  }, [])

  const effectiveClassCode = classCode ?? session?.classCode
  const effectiveStudentName = studentName ?? session?.studentName

  const currentDeck = useMemo(() => {
    if (
      !isLoaded ||
      !effectiveClassCode ||
      !effectiveStudentName ||
      (isAnonymous && !classCode)
    ) {
      return []
    }
    void refreshKey
    void isModalOpen
    return getStoredSrsDeck(effectiveClassCode, effectiveStudentName)
  }, [
    isLoaded,
    effectiveClassCode,
    effectiveStudentName,
    isAnonymous,
    classCode,
    refreshKey,
    isModalOpen,
  ])

  const dueCards = useMemo(() => getDueCards(currentDeck), [currentDeck])
  const dueCount = dueCards.length

  // If session is not ready, anonymous, or no credentials, do not render
  if (
    !isLoaded ||
    !effectiveClassCode ||
    !effectiveStudentName ||
    (isAnonymous && !classCode)
  ) {
    return null
  }

  // If no due cards and modal is not open, do not render
  if (dueCount <= 0 && !isModalOpen) {
    return null
  }

  const safeTotalStars = totalStars ?? 0
  const safeLevelInfo = levelInfo ?? getLevelInfo(safeTotalStars)

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setRefreshKey((k) => k + 1)
    void refreshProgress()
  }

  return (
    <>
      {dueCount > 0 && (
        <Button
          data-testid="mistake-notebook-badge"
          type="button"
          variant="ghost"
          onClick={() => setIsModalOpen(true)}
          aria-label={`Sổ tay từ vựng: ${dueCount} từ cần ôn`}
          title={`Bạn có ${dueCount} từ cần ôn tập trong Sổ tay! Bấm để ôn ngay.`}
          className={cn(
            'group relative inline-flex items-center gap-1.5 px-3 py-1.5 h-auto rounded-2xl border-2 font-medium shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer select-none bg-rose-50/90 hover:bg-rose-100/90 border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:hover:bg-rose-950/60 dark:border-rose-700/60 dark:text-rose-200',
            className
          )}
        >
          <span
            className="text-sm leading-none shrink-0 select-none"
            role="img"
            aria-label="notebook"
          >
            📖
          </span>
          <span
            className="text-xs sm:text-sm font-black tracking-tight"
            data-testid="mistake-due-count-text"
          >
            {dueCount} từ cần ôn
          </span>
          <span
            data-testid="mistake-indicator-dot"
            className="relative flex size-2 shrink-0 ml-0.5"
            aria-hidden="true"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-rose-500" />
          </span>
        </Button>
      )}

      {isModalOpen && (
        <StudentGamificationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          classCode={effectiveClassCode}
          studentName={effectiveStudentName}
          totalStars={safeTotalStars}
          levelInfo={safeLevelInfo}
          initialTab="notebook"
          onStarsClaimed={() => {
            void refreshProgress()
          }}
          onStarsSpent={() => {
            void refreshProgress()
          }}
        />
      )}
    </>
  )
}
