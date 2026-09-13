// tests/unit/lib/phonics-dino-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllEras,
  getEraById,
  getAllFossils,
  getFossilById,
  getFossilsByEra,
  calculatePaleontologistRank,
  getDefaultDinoProgress,
  completeDinoFossil,
} from '@/lib/phonics-dino-engine'
import type { GeologicalEraId } from '@/types/phonics-dino'

describe('Phonics Dino Engine Pure Functions', () => {
  it('returns all 4 geological eras in correct order', () => {
    const eras = getAllEras()
    expect(eras).toHaveLength(4)
    expect(eras.map((e) => e.id)).toEqual(['triassic', 'jurassic', 'cretaceous', 'iceage'])
  })

  it('retrieves specific era by ID and handles invalid input', () => {
    const triassic = getEraById('triassic')
    expect(triassic).toBeDefined()
    expect(triassic?.nameEn).toContain('Triassic Valley')
    expect(triassic?.eraEmoji).toBe('🏜️')

    const invalid = getEraById('invalid' as unknown as GeologicalEraId)
    expect(invalid).toBeUndefined()
  })

  it('returns all 12 curated dinosaur fossils with valid structure', () => {
    const fossils = getAllFossils()
    expect(fossils).toHaveLength(12)

    fossils.forEach((f) => {
      expect(f.id).toBeTruthy()
      expect(f.eraId).toBeTruthy()
      expect(f.diet).toBeTruthy()
      expect(f.challenge.targetWord).toBeTruthy()
      expect(f.challenge.phoneticBreakdown.length).toBeGreaterThan(0)
      expect(f.challenge.boneScramble.length).toBeGreaterThanOrEqual(
        f.challenge.phoneticBreakdown.length
      )
      expect(f.challenge.paleoFactVi).toBeTruthy()
    })
  })

  it('filters fossils by geological era and retrieves individual fossil', () => {
    const triassicFossils = getFossilsByEra('triassic')
    expect(triassicFossils).toHaveLength(3)
    expect(triassicFossils.every((f) => f.eraId === 'triassic')).toBe(true)

    const digFossil = getFossilById('triassic-dig')
    expect(digFossil).toBeDefined()
    expect(digFossil?.challenge.targetWord).toBe('DIG')

    const missing = getFossilById('non-existent')
    expect(missing).toBeUndefined()
  })

  it('calculates paleontologist rank based on completed fossils count', () => {
    expect(calculatePaleontologistRank(0)).toBe('junior_digger')
    expect(calculatePaleontologistRank(3)).toBe('junior_digger')
    expect(calculatePaleontologistRank(4)).toBe('expert_excavator')
    expect(calculatePaleontologistRank(8)).toBe('expert_excavator')
    expect(calculatePaleontologistRank(9)).toBe('legendary_dino_master')
    expect(calculatePaleontologistRank(12)).toBe('legendary_dino_master')
  })

  it('manages default progress and completes fossils immutably', () => {
    const initial = getDefaultDinoProgress()
    expect(initial.completedFossilIds).toEqual([])
    expect(initial.amberGems).toBe(0)
    expect(initial.paleontologistRank).toBe('junior_digger')

    // Complete first fossil
    const after1 = completeDinoFossil(initial, 'triassic-dig')
    expect(after1.completedFossilIds).toEqual(['triassic-dig'])
    expect(after1.amberGems).toBe(50)
    expect(after1.paleontologistRank).toBe('junior_digger')

    // Completing duplicate fossil does not award duplicate amber gems
    const duplicate = completeDinoFossil(after1, 'triassic-dig')
    expect(duplicate.completedFossilIds).toEqual(['triassic-dig'])
    expect(duplicate.amberGems).toBe(50)

    // Complete 4 fossils to elevate rank to expert_excavator
    let progress = after1
    progress = completeDinoFossil(progress, 'triassic-rex')
    progress = completeDinoFossil(progress, 'triassic-mud')
    progress = completeDinoFossil(progress, 'jurassic-claw')
    expect(progress.completedFossilIds).toHaveLength(4)
    expect(progress.amberGems).toBe(200)
    expect(progress.paleontologistRank).toBe('expert_excavator')
  })
})
