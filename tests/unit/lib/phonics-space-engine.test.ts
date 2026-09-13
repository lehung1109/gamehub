// tests/unit/lib/phonics-space-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllSectors,
  getSectorById,
  getAllMissions,
  getMissionById,
  getMissionsBySector,
  calculateAstronautRank,
  getDefaultSpaceProgress,
  completeMission,
} from '@/lib/phonics-space-engine'

describe('Phonics Space Odyssey Pure Engine', () => {
  it('retrieves all 4 sectors and 12 missions', () => {
    const sectors = getAllSectors()
    expect(sectors).toHaveLength(4)

    const missions = getAllMissions()
    expect(missions).toHaveLength(12)
  })

  it('retrieves sectors and missions by ID correctly', () => {
    const mars = getSectorById('mars')
    expect(mars).toBeDefined()
    expect(mars?.nameEn).toContain('Red Desert Mars')

    const roverMission = getMissionById('mars-rover')
    expect(roverMission).toBeDefined()
    expect(roverMission?.nameVi).toContain('Robot Sao Hỏa')
    expect(roverMission?.sector).toBe('mars')

    const unknown = getMissionById('unknown-mission')
    expect(unknown).toBeUndefined()
  })

  it('filters missions by sector properly', () => {
    const marsMissions = getMissionsBySector('mars')
    expect(marsMissions).toHaveLength(3)
    expect(marsMissions.map((m) => m.id)).toEqual(['mars-rover', 'mars-crater', 'mars-fuel'])

    const galaxyMissions = getMissionsBySector('galaxy')
    expect(galaxyMissions).toHaveLength(3)
    expect(galaxyMissions.map((m) => m.id)).toEqual([
      'galaxy-spaceship',
      'galaxy-telescope',
      'galaxy-spacewalk',
    ])
  })

  it('calculates astronaut rank based on mission thresholds', () => {
    expect(calculateAstronautRank(0)).toBe('cadet-explorer')
    expect(calculateAstronautRank(3)).toBe('cadet-explorer')
    expect(calculateAstronautRank(4)).toBe('fleet-commander')
    expect(calculateAstronautRank(8)).toBe('fleet-commander')
    expect(calculateAstronautRank(9)).toBe('star-lord')
    expect(calculateAstronautRank(12)).toBe('star-lord')
  })

  it('initializes default progress properly', () => {
    const initial = getDefaultSpaceProgress()
    expect(initial.completedMissionIds).toEqual([])
    expect(initial.cosmicCrystals).toBe(0)
    expect(initial.astronautRank).toBe('cadet-explorer')
    expect(initial.completedSectors).toEqual([])
  })

  it('completes mission, awards crystals, upgrades rank, and completes sectors', () => {
    const initial = getDefaultSpaceProgress()

    // Wrong answer
    const failed = completeMission(initial, 'mars-rover', 99)
    expect(failed.success).toBe(false)
    expect(failed.error).toBeDefined()
    expect(failed.updatedProgress.completedMissionIds).toHaveLength(0)

    // Non-existent mission
    const invalid = completeMission(initial, 'alien-invasion', 0)
    expect(invalid.success).toBe(false)

    // Correct mission completion
    const res1 = completeMission(initial, 'mars-rover', 0)
    expect(res1.success).toBe(true)
    expect(res1.updatedProgress.completedMissionIds).toEqual(['mars-rover'])
    expect(res1.updatedProgress.cosmicCrystals).toBe(3)
    expect(res1.updatedProgress.astronautRank).toBe('cadet-explorer')

    // Complete all 3 mars missions
    let progress = res1.updatedProgress
    progress = completeMission(progress, 'mars-crater', 0).updatedProgress
    progress = completeMission(progress, 'mars-fuel', 0).updatedProgress

    expect(progress.completedMissionIds).toHaveLength(3)
    expect(progress.cosmicCrystals).toBe(9)
    expect(progress.completedSectors).toContain('mars')

    // Complete 4th mission to reach fleet-commander
    progress = completeMission(progress, 'saturn-ring', 0).updatedProgress
    expect(progress.astronautRank).toBe('fleet-commander')
    expect(progress.cosmicCrystals).toBe(12)
  })
})
