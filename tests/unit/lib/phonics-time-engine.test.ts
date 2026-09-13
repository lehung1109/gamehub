// tests/unit/lib/phonics-time-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllEras,
  getEraById,
  getAllRelics,
  getRelicById,
  getRelicsByEra,
  calculateTimeTravelerRank,
  getDefaultTimeProgress,
  completeTimeRelic,
} from '@/lib/phonics-time-engine'
import type { TimeTravelEraId } from '@/types/phonics-time'

describe('Phonics Time Machine Engine Pure Functions', () => {
  it('returns all 4 historical eras in correct order', () => {
    const eras = getAllEras()
    expect(eras).toHaveLength(4)
    expect(eras.map((e) => e.id)).toEqual([
      'ancient_egypt',
      'ancient_greece',
      'medieval_castle',
      'future_cyber',
    ])
  })

  it('retrieves specific era by ID and handles invalid input', () => {
    const egypt = getEraById('ancient_egypt')
    expect(egypt).toBeDefined()
    expect(egypt?.nameEn).toContain('Ancient Egypt')
    expect(egypt?.eraEmoji).toBe('🏺')

    const invalid = getEraById('invalid' as unknown as TimeTravelEraId)
    expect(invalid).toBeUndefined()
  })

  it('returns all 12 curated historical relics with valid structure', () => {
    const relics = getAllRelics()
    expect(relics).toHaveLength(12)

    relics.forEach((r) => {
      expect(r.id).toBeTruthy()
      expect(r.eraId).toBeTruthy()
      expect(r.challenge.targetWord).toBeTruthy()
      expect(r.challenge.phoneticBreakdown.length).toBeGreaterThan(0)
      expect(r.challenge.runeScramble.length).toBeGreaterThanOrEqual(
        r.challenge.phoneticBreakdown.length
      )
      expect(r.challenge.historyFactVi).toBeTruthy()
    })
  })

  it('filters relics by historical era and retrieves individual relic', () => {
    const egyptRelics = getRelicsByEra('ancient_egypt')
    expect(egyptRelics).toHaveLength(3)
    expect(egyptRelics.every((r) => r.eraId === 'ancient_egypt')).toBe(true)

    const sunRelic = getRelicById('egypt-sun')
    expect(sunRelic).toBeDefined()
    expect(sunRelic?.challenge.targetWord).toBe('SUN')

    const missing = getRelicById('non-existent')
    expect(missing).toBeUndefined()
  })

  it('calculates time traveler rank based on completed relics count', () => {
    expect(calculateTimeTravelerRank(0)).toBe('novice_nomad')
    expect(calculateTimeTravelerRank(3)).toBe('novice_nomad')
    expect(calculateTimeTravelerRank(4)).toBe('chrono_voyager')
    expect(calculateTimeTravelerRank(8)).toBe('chrono_voyager')
    expect(calculateTimeTravelerRank(9)).toBe('time_space_master')
    expect(calculateTimeTravelerRank(12)).toBe('time_space_master')
  })

  it('manages default progress and completes relics immutably', () => {
    const initial = getDefaultTimeProgress()
    expect(initial.completedRelicIds).toEqual([])
    expect(initial.chronoOrbs).toBe(0)
    expect(initial.travelerRank).toBe('novice_nomad')

    // Complete first relic
    const after1 = completeTimeRelic(initial, 'egypt-sun')
    expect(after1.completedRelicIds).toEqual(['egypt-sun'])
    expect(after1.chronoOrbs).toBe(50)
    expect(after1.travelerRank).toBe('novice_nomad')

    // Completing duplicate relic does not award duplicate chrono-orbs
    const duplicate = completeTimeRelic(after1, 'egypt-sun')
    expect(duplicate.completedRelicIds).toEqual(['egypt-sun'])
    expect(duplicate.chronoOrbs).toBe(50)

    // Complete 4 relics to elevate rank to chrono_voyager
    let progress = after1
    progress = completeTimeRelic(progress, 'egypt-cat')
    progress = completeTimeRelic(progress, 'egypt-pot')
    progress = completeTimeRelic(progress, 'greece-sword')
    expect(progress.completedRelicIds).toHaveLength(4)
    expect(progress.chronoOrbs).toBe(200)
    expect(progress.travelerRank).toBe('chrono_voyager')
  })
})
