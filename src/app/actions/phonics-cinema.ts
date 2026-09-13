// src/app/actions/phonics-cinema.ts
'use server'

import { getEpisodeById } from '@/lib/phonics-cinema-engine'
import type { CinemaEpisode, CinemaResult } from '@/types/phonics-cinema'

export interface CinemaActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves a cinema episode by episodeId.
 */
export async function getCinemaEpisodeAction(
  episodeId: string
): Promise<CinemaActionResult<CinemaEpisode>> {
  if (!episodeId || typeof episodeId !== 'string') {
    return { success: false, error: 'Mã tập phim hoạt hình không hợp lệ.' }
  }

  const episode = getEpisodeById(episodeId.trim())
  if (!episode) {
    return { success: false, error: 'Không tìm thấy tập phim hoạt hình này.' }
  }

  return { success: true, data: episode }
}

/**
 * Validates and records cinema episode completion and awards popcorn & EXP.
 */
export async function submitCinemaScoreAction(
  result: CinemaResult
): Promise<
  CinemaActionResult<{
    stars: number
    expAwarded: number
    popcornAwarded: number
  }>
> {
  if (!result || !result.episodeId) {
    return { success: false, error: 'Dữ liệu kết quả xem phim không hợp lệ.' }
  }

  const episode = getEpisodeById(result.episodeId)
  if (!episode) {
    return { success: false, error: 'Tập phim không tồn tại.' }
  }

  const popcornAwarded = Math.max(0, Math.round(result.popcornEarned || 0))
  const safeCorrect = Math.max(0, Math.round(result.correctPrompts || 0))
  const safeTotal = Math.max(1, Math.round(result.totalPrompts || 1))

  let stars = 1
  if (safeCorrect === safeTotal) {
    stars = 3
  } else if (safeCorrect / safeTotal >= 0.6) {
    stars = 2
  }

  const expAwarded = Math.max(30, Math.min(300, result.expEarned || 30))

  return {
    success: true,
    data: {
      stars,
      expAwarded,
      popcornAwarded,
    },
  }
}
