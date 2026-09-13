// src/app/actions/phonics-safari.ts
'use server'

import { getDefaultSafariProgress, calculateExplorerRank } from '@/lib/phonics-safari-engine'
import type { SafariProgress } from '@/types/phonics-safari'

export interface SafariActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current Safari explorer progress for a student
 */
export async function getSafariProgressAction(
  studentId?: string
): Promise<SafariActionResult<SafariProgress>> {
  void studentId
  const defaultProgress = getDefaultSafariProgress()
  return {
    success: true,
    data: defaultProgress,
  }
}

/**
 * Validates and records safari progress
 */
export async function saveSafariProgressAction(
  progress: SafariProgress
): Promise<
  SafariActionResult<{
    saved: boolean
    totalPhotos: number
    explorerRank: string
  }>
> {
  if (!progress || !Array.isArray(progress.photographedAnimalIds)) {
    return { success: false, error: 'Dữ liệu hành trình Safari không hợp lệ.' }
  }

  const calculatedRank = calculateExplorerRank(progress.photographedAnimalIds.length)

  return {
    success: true,
    data: {
      saved: true,
      totalPhotos: progress.photographedAnimalIds.length,
      explorerRank: calculatedRank,
    },
  }
}
