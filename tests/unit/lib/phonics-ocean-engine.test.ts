// tests/unit/lib/phonics-ocean-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllZones,
  getZoneById,
  getAllMissions,
  getMissionById,
  getMissionsByZone,
  calculateDiverRank,
  getDefaultOceanProgress,
  completeOceanMission,
} from '@/lib/phonics-ocean-engine'

describe('Phonics Ocean Engine Pure Functions', () => {
  it('returns all 4 depth zones with correct IDs and configurations', () => {
    const zones = getAllZones()
    expect(zones).toHaveLength(4)
    expect(zones.map((z) => z.id)).toEqual(['sunlight', 'twilight', 'midnight', 'abyss'])
  })

  it('retrieves specific zone by ID correctly and handles invalid ID', () => {
    const sunlight = getZoneById('sunlight')
    expect(sunlight).toBeDefined()
    expect(sunlight?.nameEn).toContain('Sunlight Zone')
    expect(sunlight?.depthRange).toBe('0 - 200m')

    const invalid = getZoneById('invalid-zone' as unknown as import('@/types/phonics-ocean').OceanDepthZone)
    expect(invalid).toBeUndefined()
  })

  it('returns all 12 curated ocean missions', () => {
    const missions = getAllMissions()
    expect(missions).toHaveLength(12)

    // Check each mission has complete properties
    missions.forEach((m) => {
      expect(m.id).toBeTruthy()
      expect(m.zoneId).toBeTruthy()
      expect(m.challenge.targetWord).toBeTruthy()
      expect(m.challenge.phoneticBreakdown.length).toBeGreaterThan(0)
      expect(m.challenge.bubbleScramble.length).toBeGreaterThanOrEqual(m.challenge.phoneticBreakdown.length)
      expect(m.challenge.marineFact).toBeTruthy()
    })
  })

  it('filters missions by depth zone and fetches individual mission', () => {
    const sunlightMissions = getMissionsByZone('sunlight')
    expect(sunlightMissions).toHaveLength(3)
    expect(sunlightMissions.every((m) => m.zoneId === 'sunlight')).toBe(true)

    const mission = getMissionById('sunlight-fin')
    expect(mission).toBeDefined()
    expect(mission?.creatureName).toBe('Clownfish')
    expect(mission?.challenge.targetWord).toBe('FIN')

    const missing = getMissionById('non-existent')
    expect(missing).toBeUndefined()
  })

  it('calculates diver rank based on completed missions count', () => {
    expect(calculateDiverRank(0)).toBe('snorkel_cadet')
    expect(calculateDiverRank(3)).toBe('snorkel_cadet')
    expect(calculateDiverRank(4)).toBe('sub_pilot')
    expect(calculateDiverRank(8)).toBe('sub_pilot')
    expect(calculateDiverRank(9)).toBe('ocean_master')
    expect(calculateDiverRank(12)).toBe('ocean_master')
  })

  it('manages default progress and completes missions immutably', () => {
    const initial = getDefaultOceanProgress()
    expect(initial.completedMissionIds).toEqual([])
    expect(initial.pearls).toBe(0)
    expect(initial.diverRank).toBe('snorkel_cadet')

    // Complete first mission
    const after1 = completeOceanMission(initial, 'sunlight-fin')
    expect(after1.completedMissionIds).toEqual(['sunlight-fin'])
    expect(after1.pearls).toBe(50)
    expect(after1.diverRank).toBe('snorkel_cadet')

    // Completing same mission again should not duplicate rewards or IDs
    const duplicate = completeOceanMission(after1, 'sunlight-fin')
    expect(duplicate.completedMissionIds).toEqual(['sunlight-fin'])
    expect(duplicate.pearls).toBe(50)

    // Completing 4 missions elevates to sub_pilot
    let progress = after1
    progress = completeOceanMission(progress, 'sunlight-sun')
    progress = completeOceanMission(progress, 'sunlight-wet')
    progress = completeOceanMission(progress, 'twilight-shell')
    expect(progress.completedMissionIds).toHaveLength(4)
    expect(progress.pearls).toBe(200)
    expect(progress.diverRank).toBe('sub_pilot')
  })
})
