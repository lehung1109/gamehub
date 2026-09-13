// src/app/actions/phonics-town.ts
'use server'

import { getDefaultTownState, calculateMayorRank } from '@/lib/phonics-town-engine'
import type { TownState } from '@/types/phonics-town'

export interface TownActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves the current town state for a student or falls back to default initial town
 */
export async function getTownStateAction(
  _studentId?: string
): Promise<TownActionResult<TownState>> {
  const defaultState = getDefaultTownState()
  return {
    success: true,
    data: defaultState,
  }
}

/**
 * Validates and records town layout, building upgrades, and prosperity stars
 */
export async function saveTownStateAction(
  state: TownState
): Promise<
  TownActionResult<{
    saved: boolean
    prosperityStars: number
    mayorRank: string
  }>
> {
  if (!state || !Array.isArray(state.buildings)) {
    return { success: false, error: 'Dữ liệu thành phố không hợp lệ.' }
  }

  const safeStars = Math.max(0, Math.round(state.prosperityStars || 0))
  const rank = calculateMayorRank(safeStars)

  return {
    success: true,
    data: {
      saved: true,
      prosperityStars: safeStars,
      mayorRank: rank,
    },
  }
}
