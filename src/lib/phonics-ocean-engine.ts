// src/lib/phonics-ocean-engine.ts

import {
  OceanDepthZone,
  DiverRank,
  OceanZoneDefinition,
  OceanMission,
  OceanProgress,
} from '@/types/phonics-ocean'
import { OCEAN_ZONES, OCEAN_MISSIONS } from '@/data/ocean/missions'

/**
 * Returns all 4 ocean depth zones in order
 */
export function getAllZones(): OceanZoneDefinition[] {
  return [...OCEAN_ZONES]
}

/**
 * Retrieves a specific depth zone by its unique ID
 */
export function getZoneById(id: OceanDepthZone): OceanZoneDefinition | undefined {
  return OCEAN_ZONES.find((z) => z.id === id)
}

/**
 * Returns all 12 curated deep-sea missions
 */
export function getAllMissions(): OceanMission[] {
  return [...OCEAN_MISSIONS]
}

/**
 * Retrieves a single mission by its ID
 */
export function getMissionById(id: string): OceanMission | undefined {
  return OCEAN_MISSIONS.find((m) => m.id === id)
}

/**
 * Returns all missions for a specific ocean depth zone
 */
export function getMissionsByZone(zoneId: OceanDepthZone): OceanMission[] {
  return OCEAN_MISSIONS.filter((m) => m.zoneId === zoneId)
}

/**
 * Calculates the diver rank based on the number of completed missions
 * - < 4: Snorkel Cadet (Học Viên Lặn)
 * - 4 - 8: Submarine Pilot (Thuyền Trưởng Tàu Ngầm)
 * - 9 - 12: Ocean Master (Hải Vương Biển Sâu)
 */
export function calculateDiverRank(completedCount: number): DiverRank {
  if (completedCount >= 9) {
    return 'ocean_master'
  }
  if (completedCount >= 4) {
    return 'sub_pilot'
  }
  return 'snorkel_cadet'
}

/**
 * Returns the default initial progress state
 */
export function getDefaultOceanProgress(): OceanProgress {
  return {
    completedMissionIds: [],
    currentZone: 'sunlight',
    pearls: 0,
    diverRank: 'snorkel_cadet',
    lastPlayedAt: new Date().toISOString(),
  }
}

/**
 * Pure function to complete a mission and update pearls, ranks, and state
 */
export function completeOceanMission(
  progress: OceanProgress,
  missionId: string
): OceanProgress {
  const isAlreadyCompleted = progress.completedMissionIds.includes(missionId)
  if (isAlreadyCompleted) {
    return {
      ...progress,
      lastPlayedAt: new Date().toISOString(),
    }
  }

  const nextCompleted = [...progress.completedMissionIds, missionId]
  const nextPearls = progress.pearls + 50
  const nextRank = calculateDiverRank(nextCompleted.length)

  return {
    ...progress,
    completedMissionIds: nextCompleted,
    pearls: nextPearls,
    diverRank: nextRank,
    lastPlayedAt: new Date().toISOString(),
  }
}
