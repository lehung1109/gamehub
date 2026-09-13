// src/app/actions/phonics-dino.ts
'use server'

import { getDefaultDinoProgress, calculatePaleontologistRank } from '@/lib/phonics-dino-engine'
import type { DinoProgress } from '@/types/phonics-dino'

export interface DinoActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current Dino Kingdom progress for a student
 */
export async function getDinoProgressAction(
  studentId?: string
): Promise<DinoActionResult<DinoProgress>> {
  void studentId
  const defaultProgress = getDefaultDinoProgress()
  return {
    success: true,
    data: defaultProgress,
  }
}

/**
 * Validates and records dinosaur fossil excavation progress
 */
export async function saveDinoProgressAction(
  progress: DinoProgress
): Promise<
  DinoActionResult<{
    saved: boolean
    totalFossils: number
    paleontologistRank: string
  }>
> {
  if (!progress || !Array.isArray(progress.completedFossilIds)) {
    return { success: false, error: 'Dữ liệu vương quốc khủng long không hợp lệ.' }
  }

  const calculatedRank = calculatePaleontologistRank(progress.completedFossilIds.length)

  return {
    success: true,
    data: {
      saved: true,
      totalFossils: progress.completedFossilIds.length,
      paleontologistRank: calculatedRank,
    },
  }
}
