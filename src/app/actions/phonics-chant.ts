// src/app/actions/phonics-chant.ts
'use server'

import { getChantById } from '@/lib/phonics-chant-engine'
import type { PhonicsChant, ChantPerformanceScore } from '@/types/phonics-chant'

export interface GetChantDetailsResult {
  success: boolean
  data?: PhonicsChant
  error?: string
}

export interface SubmitChantPerformanceResult {
  success: boolean
  data?: {
    expAwarded: number
    accuracyPercent: number
    stars: number
    isHighAccuracy: boolean
  }
  error?: string
}

/**
 * Fetch chant details by chantId
 */
export async function getChantDetailsAction(chantId: string): Promise<GetChantDetailsResult> {
  if (!chantId || typeof chantId !== 'string') {
    return { success: false, error: 'Mã bài vè không hợp lệ.' }
  }

  const chant = getChantById(chantId.trim())
  if (!chant) {
    return { success: false, error: 'Không tìm thấy bài vè này.' }
  }

  return { success: true, data: chant }
}

/**
 * Submit and validate student chant rhythm score & calculate stars + EXP rewards
 */
export async function submitChantPerformanceAction(
  score: ChantPerformanceScore
): Promise<SubmitChantPerformanceResult> {
  if (!score || !score.chantId) {
    return { success: false, error: 'Dữ liệu kết quả bài vè không hợp lệ.' }
  }

  const chant = getChantById(score.chantId)
  if (!chant) {
    return { success: false, error: 'Bài vè không tồn tại.' }
  }

  const clampedAccuracy = Math.min(100, Math.max(0, Math.round(score.accuracyPercent || 0)))
  const expAwarded = Math.max(15, Math.min(40, score.expGained || 15))

  // Determine star rating:
  // >= 85%: 3 stars
  // >= 60%: 2 stars
  // < 60%: 1 star
  let stars = 1
  if (clampedAccuracy >= 85) {
    stars = 3
  } else if (clampedAccuracy >= 60) {
    stars = 2
  }

  return {
    success: true,
    data: {
      expAwarded,
      accuracyPercent: clampedAccuracy,
      stars,
      isHighAccuracy: clampedAccuracy >= 80,
    },
  }
}
