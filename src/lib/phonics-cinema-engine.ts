// src/lib/phonics-cinema-engine.ts

import { CINEMA_EPISODES } from '@/data/cinema/episodes'
import type {
  CinemaEpisode,
  CinemaInteractivePrompt,
  CinemaResult,
} from '@/types/phonics-cinema'

/**
 * Returns all available Phonics Cinema episodes.
 */
export function getAllEpisodes(): CinemaEpisode[] {
  return CINEMA_EPISODES
}

/**
 * Retrieves a cinema episode by its unique episodeId.
 */
export function getEpisodeById(id: string): CinemaEpisode | undefined {
  if (!id) return undefined
  const cleanId = id.trim().toLowerCase()
  return CINEMA_EPISODES.find((ep) => ep.id.toLowerCase() === cleanId)
}

/**
 * Validates whether the selected option for an interactive prompt is correct.
 */
export function validatePromptAnswer(
  prompt: CinemaInteractivePrompt,
  selectedOptionId: string
): boolean {
  if (!prompt || !selectedOptionId) return false
  const option = prompt.options.find((opt) => opt.id === selectedOptionId)
  return Boolean(option?.isCorrect)
}

/**
 * Calculates movie completion score, stars, popcorn bonuses, and EXP rewards.
 */
export function calculateCinemaScore(
  episodeId: string,
  correctPrompts: number,
  totalPrompts: number,
  popcornEarned: number,
  maxPopcorn: number
): CinemaResult {
  const safeTotal = Math.max(1, totalPrompts)
  const safeCorrect = Math.max(0, Math.min(correctPrompts, safeTotal))
  const accuracyPercent = Math.round((safeCorrect / safeTotal) * 100)

  let stars = 1
  if (safeCorrect === safeTotal) {
    stars = 3
  } else if (accuracyPercent >= 60) {
    stars = 2
  }

  // Base EXP plus completion bonus
  const baseExp = safeCorrect * 30
  const completionBonus = safeCorrect === safeTotal ? 60 : 20
  const expEarned = baseExp + completionBonus

  return {
    episodeId,
    popcornEarned: Math.max(0, popcornEarned),
    maxPopcorn: Math.max(popcornEarned, maxPopcorn),
    correctPrompts: safeCorrect,
    totalPrompts: safeTotal,
    stars,
    expEarned,
    completedAt: new Date().toISOString(),
  }
}
