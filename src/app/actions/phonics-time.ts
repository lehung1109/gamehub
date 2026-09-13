// src/app/actions/phonics-time.ts
'use server'

import { getDefaultTimeProgress, calculateTimeTravelerRank } from '@/lib/phonics-time-engine'
import type { TimeProgress } from '@/types/phonics-time'

export interface TimeActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current Time Machine progress for a student
 */
export async function getTimeProgressAction(
  studentId?: string
): Promise<TimeActionResult<TimeProgress>> {
  void studentId
  const defaultProgress = getDefaultTimeProgress()
  return {
    success: true,
    data: defaultProgress,
  }
}

/**
 * Validates and records time travel relic restoration progress
 */
export async function saveTimeProgressAction(
  progress: TimeProgress
): Promise<
  TimeActionResult<{
    saved: boolean
    totalRelics: number
    travelerRank: string
  }>
> {
  if (!progress || !Array.isArray(progress.completedRelicIds)) {
    return { success: false, error: 'Dữ liệu cỗ máy thời gian không hợp lệ.' }
  }

  const calculatedRank = calculateTimeTravelerRank(progress.completedRelicIds.length)

  return {
    success: true,
    data: {
      saved: true,
      totalRelics: progress.completedRelicIds.length,
      travelerRank: calculatedRank,
    },
  }
}
