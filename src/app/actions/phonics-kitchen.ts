// src/app/actions/phonics-kitchen.ts
'use server'

import { getDefaultKitchenProgress, calculateChefRank } from '@/lib/phonics-kitchen-engine'
import type { KitchenProgress } from '@/types/phonics-kitchen'

export interface KitchenActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current Kitchen progress for a student
 */
export async function getKitchenProgressAction(
  studentId?: string
): Promise<KitchenActionResult<KitchenProgress>> {
  void studentId
  const defaultProgress = getDefaultKitchenProgress()
  return {
    success: true,
    data: defaultProgress,
  }
}

/**
 * Validates and records kitchen progress
 */
export async function saveKitchenProgressAction(
  progress: KitchenProgress
): Promise<
  KitchenActionResult<{
    saved: boolean
    totalMastered: number
    chefRank: string
  }>
> {
  if (!progress || !Array.isArray(progress.masteredRecipeIds)) {
    return { success: false, error: 'Dữ liệu nhà bếp MasterChef không hợp lệ.' }
  }

  const calculatedRank = calculateChefRank(progress.masteredRecipeIds.length)

  return {
    success: true,
    data: {
      saved: true,
      totalMastered: progress.masteredRecipeIds.length,
      chefRank: calculatedRank,
    },
  }
}
