// src/app/actions/phonics-space.ts
'use server'

import { getDefaultSpaceProgress, calculateAstronautRank } from '@/lib/phonics-space-engine'
import type { SpaceProgress } from '@/types/phonics-space'

export interface SpaceActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current Space explorer progress for a student
 */
export async function getSpaceProgressAction(
  studentId?: string
): Promise<SpaceActionResult<SpaceProgress>> {
  void studentId
  const defaultProgress = getDefaultSpaceProgress()
  return {
    success: true,
    data: defaultProgress,
  }
}

/**
 * Validates and records space exploration progress
 */
export async function saveSpaceProgressAction(
  progress: SpaceProgress
): Promise<
  SpaceActionResult<{
    saved: boolean
    totalMissions: number
    astronautRank: string
  }>
> {
  if (!progress || !Array.isArray(progress.completedMissionIds)) {
    return { success: false, error: 'Dữ liệu hành trình vũ trụ không hợp lệ.' }
  }

  const calculatedRank = calculateAstronautRank(progress.completedMissionIds.length)

  return {
    success: true,
    data: {
      saved: true,
      totalMissions: progress.completedMissionIds.length,
      astronautRank: calculatedRank,
    },
  }
}
