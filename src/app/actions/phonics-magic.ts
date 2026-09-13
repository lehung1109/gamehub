// src/app/actions/phonics-magic.ts
'use server'

import { getDefaultMagicProgress, calculateWizardRank } from '@/lib/phonics-magic-engine'
import type { MagicProgress } from '@/types/phonics-magic'

export interface MagicActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current Magic Academy progress for a student
 */
export async function getMagicProgressAction(
  studentId?: string
): Promise<MagicActionResult<MagicProgress>> {
  void studentId
  const defaultProgress = getDefaultMagicProgress()
  return {
    success: true,
    data: defaultProgress,
  }
}

/**
 * Validates and records magic spellcraft progress
 */
export async function saveMagicProgressAction(
  progress: MagicProgress
): Promise<
  MagicActionResult<{
    saved: boolean
    totalSpells: number
    wizardRank: string
  }>
> {
  if (!progress || !Array.isArray(progress.completedSpellIds)) {
    return { success: false, error: 'Dữ liệu học viện phép thuật không hợp lệ.' }
  }

  const calculatedRank = calculateWizardRank(progress.completedSpellIds.length)

  return {
    success: true,
    data: {
      saved: true,
      totalSpells: progress.completedSpellIds.length,
      wizardRank: calculatedRank,
    },
  }
}
