// src/app/actions/voice-arcade.ts
'use server'

import { getStageById } from '@/lib/voice-arcade-engine'
import type { ArcadeStage, ArcadeGameResult } from '@/types/voice-arcade'

export interface ArcadeActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch stage configuration by stageId.
 */
export async function getArcadeStageAction(
  stageId: string
): Promise<ArcadeActionResult<ArcadeStage>> {
  if (!stageId || typeof stageId !== 'string') {
    return { success: false, error: 'Mã màn chơi không hợp lệ.' }
  }

  const stage = getStageById(stageId.trim())
  if (!stage) {
    return { success: false, error: 'Không tìm thấy màn chơi này.' }
  }

  return { success: true, data: stage }
}

/**
 * Validate and record arcade game result and calculate awarded EXP and stars.
 */
export async function submitArcadeScoreAction(
  result: ArcadeGameResult
): Promise<
  ArcadeActionResult<{
    expAwarded: number
    stars: number
    finalScore: number
    accuracyPercent: number
  }>
> {
  if (!result || !result.stageId) {
    return { success: false, error: 'Dữ liệu kết quả trò chơi không hợp lệ.' }
  }

  const stage = getStageById(result.stageId)
  if (!stage) {
    return { success: false, error: 'Màn chơi không tồn tại.' }
  }

  const clampedAccuracy = Math.min(100, Math.max(0, Math.round(result.accuracyPercent || 0)))
  const finalScore = Math.max(0, Math.round(result.score || 0))
  const expAwarded = Math.max(20, Math.min(50, result.expEarned || 20))

  let stars = 1
  if (clampedAccuracy >= 80) {
    stars = 3
  } else if (clampedAccuracy >= 50) {
    stars = 2
  }

  return {
    success: true,
    data: {
      expAwarded,
      stars,
      finalScore,
      accuracyPercent: clampedAccuracy,
    },
  }
}
