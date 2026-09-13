// src/app/actions/spelling-bee.ts
'use server'

import { getDivisionById } from '@/lib/spelling-bee-engine'
import type { SpellingBeeDivision, SpellingBeeResult } from '@/types/spelling-bee'

export interface SpellingBeeActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves a tournament division by its divisionId.
 */
export async function getSpellingBeeDivisionAction(
  divisionId: string
): Promise<SpellingBeeActionResult<SpellingBeeDivision>> {
  if (!divisionId || typeof divisionId !== 'string') {
    return { success: false, error: 'Mã phân hạng giải đấu không hợp lệ.' }
  }

  const division = getDivisionById(divisionId.trim())
  if (!division) {
    return { success: false, error: 'Không tìm thấy phân hạng giải đấu này.' }
  }

  return { success: true, data: division }
}

/**
 * Validates and records a tournament round score and awards EXP.
 */
export async function submitSpellingBeeScoreAction(
  result: SpellingBeeResult
): Promise<
  SpellingBeeActionResult<{
    expAwarded: number
    stars: number
    finalScore: number
    accuracyPercent: number
    isChampion: boolean
  }>
> {
  if (!result || !result.divisionId) {
    return { success: false, error: 'Dữ liệu kết quả thi đấu không hợp lệ.' }
  }

  const division = getDivisionById(result.divisionId)
  if (!division) {
    return { success: false, error: 'Phân hạng giải đấu không tồn tại.' }
  }

  const clampedAccuracy = Math.min(100, Math.max(0, Math.round(result.accuracyPercent || 0)))
  const finalScore = Math.max(0, Math.round(result.score || 0))
  const expAwarded = Math.max(20, Math.min(350, result.expEarned || 20))

  let stars = 0
  if (result.isChampion) {
    stars = 3
  } else if (clampedAccuracy >= 70) {
    stars = 2
  } else if (clampedAccuracy >= 40) {
    stars = 1
  }

  return {
    success: true,
    data: {
      expAwarded,
      stars,
      finalScore,
      accuracyPercent: clampedAccuracy,
      isChampion: Boolean(result.isChampion),
    },
  }
}
