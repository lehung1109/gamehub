// src/lib/phonics-space-engine.ts

import { SPACE_SECTORS, SPACE_MISSIONS } from '@/data/space/missions'
import type {
  SpaceSectorType,
  AstronautRank,
  SpaceMission,
  SpaceSectorDefinition,
  SpaceProgress,
} from '@/types/phonics-space'

/**
 * Retrieves all curated space sectors
 */
export function getAllSectors(): SpaceSectorDefinition[] {
  return SPACE_SECTORS
}

/**
 * Retrieves a specific space sector definition by ID
 */
export function getSectorById(id: SpaceSectorType): SpaceSectorDefinition | undefined {
  return SPACE_SECTORS.find((s) => s.id === id)
}

/**
 * Retrieves all curated space missions
 */
export function getAllMissions(): SpaceMission[] {
  return SPACE_MISSIONS
}

/**
 * Retrieves a specific mission by its ID
 */
export function getMissionById(id: string): SpaceMission | undefined {
  return SPACE_MISSIONS.find((m) => m.id === id)
}

/**
 * Retrieves missions belonging to a specific space sector
 */
export function getMissionsBySector(sector: SpaceSectorType): SpaceMission[] {
  return SPACE_MISSIONS.filter((m) => m.sector === sector)
}

/**
 * Calculates astronaut rank based on completed mission count
 */
export function calculateAstronautRank(completedCount: number): AstronautRank {
  if (completedCount >= 9) return 'star-lord'
  if (completedCount >= 4) return 'fleet-commander'
  return 'cadet-explorer'
}

/**
 * Provides default initial progress for new astronauts
 */
export function getDefaultSpaceProgress(): SpaceProgress {
  return {
    completedMissionIds: [],
    cosmicCrystals: 0,
    astronautRank: 'cadet-explorer',
    completedSectors: [],
  }
}

/**
 * Validates radio decoding answer and completes space exploration mission
 */
export function completeMission(
  progress: SpaceProgress,
  missionId: string,
  answerIndex: number
): { success: boolean; updatedProgress: SpaceProgress; error?: string } {
  const mission = getMissionById(missionId)
  if (!mission) {
    return {
      success: false,
      updatedProgress: progress,
      error: 'Không tìm thấy nhiệm vụ thám hiểm này trong hệ thống radar.',
    }
  }

  if (answerIndex !== mission.challenge.correctOptionIndex) {
    return {
      success: false,
      updatedProgress: progress,
      error: 'Tín hiệu giải mã chưa chính xác! Hãy lắng nghe lại tần số âm vị nhé!',
    }
  }

  const alreadyCompleted = progress.completedMissionIds.includes(missionId)
  const updatedMissionIds = alreadyCompleted
    ? progress.completedMissionIds
    : [...progress.completedMissionIds, missionId]

  const totalCompleted = updatedMissionIds.length
  const newCrystals = alreadyCompleted ? progress.cosmicCrystals : progress.cosmicCrystals + 3
  const newRank = calculateAstronautRank(totalCompleted)

  // Determine completed sectors
  const completedSectors: SpaceSectorType[] = []
  for (const sector of SPACE_SECTORS) {
    const isSectorComplete = sector.missionIds.every((id) => updatedMissionIds.includes(id))
    if (isSectorComplete) {
      completedSectors.push(sector.id)
    }
  }

  const updatedProgress: SpaceProgress = {
    completedMissionIds: updatedMissionIds,
    cosmicCrystals: newCrystals,
    astronautRank: newRank,
    completedSectors,
  }

  return {
    success: true,
    updatedProgress,
  }
}
