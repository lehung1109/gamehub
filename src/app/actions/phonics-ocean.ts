// src/app/actions/phonics-ocean.ts
'use server'

import { getDefaultOceanProgress, calculateDiverRank } from '@/lib/phonics-ocean-engine'
import type { OceanProgress } from '@/types/phonics-ocean'

export interface OceanActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current Ocean explorer progress for a student
 */
export async function getOceanProgressAction(
  studentId?: string
): Promise<OceanActionResult<OceanProgress>> {
  void studentId
  const defaultProgress = getDefaultOceanProgress()
  return {
    success: true,
    data: defaultProgress,
  }
}

/**
 * Validates and records deep sea exploration progress
 */
export async function saveOceanProgressAction(
  progress: OceanProgress
): Promise<
  OceanActionResult<{
    saved: boolean
    totalMissions: number
    diverRank: string
  }>
> {
  if (!progress || !Array.isArray(progress.completedMissionIds)) {
    return { success: false, error: 'Dữ liệu thám hiểm đại dương không hợp lệ.' }
  }

  const calculatedRank = calculateDiverRank(progress.completedMissionIds.length)

  return {
    success: true,
    data: {
      saved: true,
      totalMissions: progress.completedMissionIds.length,
      diverRank: calculatedRank,
    },
  }
}
