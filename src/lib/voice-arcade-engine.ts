// src/lib/voice-arcade-engine.ts

import { VOICE_ARCADE_STAGES } from '@/data/arcade/voice-stages'
import type { ArcadeStage, ArcadeGameMode, ArcadeGameResult } from '@/types/voice-arcade'

/**
 * Retrieve all available voice-controlled arcade stages.
 */
export function getAllArcadeStages(): ArcadeStage[] {
  return VOICE_ARCADE_STAGES
}

/**
 * Retrieve stage configuration by unique ID.
 */
export function getStageById(id: string): ArcadeStage | null {
  return VOICE_ARCADE_STAGES.find((s) => s.id === id) || null
}

/**
 * Clean and compare spoken speech transcript against target word.
 * Tolerant matching: strips punctuation, lowercase comparison, handles partial word endings.
 */
export function evaluateSpokenWord(spokenText: string, targetWord: string): boolean {
  if (!spokenText || !targetWord) return false

  const cleanSpoken = spokenText
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
  const cleanTarget = targetWord
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')

  // Exact match
  if (cleanSpoken === cleanTarget) return true

  // Word list inclusion (e.g. transcript has multiple words "the cat" and target is "cat")
  const spokenTokens = cleanSpoken.split(/\s+/)
  if (spokenTokens.includes(cleanTarget)) return true

  // Substring containment if transcript is at least 3 characters
  if (cleanTarget.length >= 3 && cleanSpoken.includes(cleanTarget)) return true

  return false
}

/**
 * Calculate final game result, stars, and EXP rewards.
 */
export function calculateArcadeScore(
  stageId: string,
  gameMode: ArcadeGameMode,
  wordsHit: number,
  wordsMissed: number,
  maxCombo: number,
  baseWordScore = 100
): ArcadeGameResult {
  const safeHits = Math.max(0, wordsHit)
  const safeMisses = Math.max(0, wordsMissed)
  const total = safeHits + safeMisses

  // Accuracy percent
  const rawAccuracy = total > 0 ? (safeHits / total) * 100 : 0
  const accuracyPercent = Math.min(100, Math.max(0, Math.round(rawAccuracy)))

  // Score calculation: (Hits * baseScore) + (maxCombo * 50)
  const score = safeHits * baseWordScore + maxCombo * 50

  // Star rating:
  // >= 80%: 3 stars
  // >= 50%: 2 stars
  // < 50%: 1 star
  let stars = 1
  if (accuracyPercent >= 80) {
    stars = 3
  } else if (accuracyPercent >= 50) {
    stars = 2
  }

  // EXP: Base 20 + up to 30 based on accuracy (Max 50 XP)
  const expEarned = 20 + Math.round((accuracyPercent / 100) * 30)

  return {
    stageId,
    gameMode,
    score,
    wordsHit: safeHits,
    wordsMissed: safeMisses,
    accuracyPercent,
    maxCombo,
    expEarned,
    stars,
  }
}
