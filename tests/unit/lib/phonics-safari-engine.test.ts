// tests/unit/lib/phonics-safari-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllBiomes,
  getBiomeById,
  getAllAnimals,
  getAnimalById,
  getAnimalsByBiome,
  calculateExplorerRank,
  getDefaultSafariProgress,
  recordSnapshot,
} from '@/lib/phonics-safari-engine'

describe('Phonics Safari Pure Engine', () => {
  it('retrieves all 4 biomes and 16 animals', () => {
    const biomes = getAllBiomes()
    expect(biomes).toHaveLength(4)

    const animals = getAllAnimals()
    expect(animals).toHaveLength(16)
  })

  it('retrieves biomes and animals by ID correctly', () => {
    const savanna = getBiomeById('savanna')
    expect(savanna).toBeDefined()
    expect(savanna?.nameEn).toBe('African Savanna')

    const lion = getAnimalById('lion')
    expect(lion).toBeDefined()
    expect(lion?.nameVi).toBe('Sư Tử')
    expect(lion?.biome).toBe('savanna')

    const unknown = getAnimalById('unknown-animal')
    expect(unknown).toBeUndefined()
  })

  it('filters animals by biome properly', () => {
    const savannaAnimals = getAnimalsByBiome('savanna')
    expect(savannaAnimals).toHaveLength(4)
    expect(savannaAnimals.map((a) => a.id)).toEqual(['lion', 'elephant', 'giraffe', 'zebra'])

    const oceanAnimals = getAnimalsByBiome('ocean')
    expect(oceanAnimals).toHaveLength(4)
    expect(oceanAnimals.map((a) => a.id)).toEqual(['dolphin', 'shark', 'sea-turtle', 'octopus'])
  })

  it('calculates explorer rank based on photographed threshold', () => {
    expect(calculateExplorerRank(0)).toBe('junior-scout')
    expect(calculateExplorerRank(3)).toBe('junior-scout')
    expect(calculateExplorerRank(4)).toBe('wild-ranger')
    expect(calculateExplorerRank(11)).toBe('wild-ranger')
    expect(calculateExplorerRank(12)).toBe('safari-master')
    expect(calculateExplorerRank(16)).toBe('safari-master')
  })

  it('handles default progress initialization', () => {
    const initial = getDefaultSafariProgress()
    expect(initial.photographedAnimalIds).toEqual([])
    expect(initial.completedBiomes).toEqual([])
    expect(initial.explorerRank).toBe('junior-scout')
    expect(initial.totalPhotosCaptured).toBe(0)
  })

  it('records successful snapshot and updates rank and completed biomes', () => {
    const initial = getDefaultSafariProgress()

    // Wrong answer
    const failedResult = recordSnapshot(initial, 'lion', 99)
    expect(failedResult.success).toBe(false)
    expect(failedResult.error).toBeDefined()
    expect(failedResult.updatedProgress.photographedAnimalIds).toHaveLength(0)

    // Non-existent animal
    const invalidAnimal = recordSnapshot(initial, 'dragon', 0)
    expect(invalidAnimal.success).toBe(false)

    // Correct answer for lion (index 0)
    const res1 = recordSnapshot(initial, 'lion', 0)
    expect(res1.success).toBe(true)
    expect(res1.updatedProgress.photographedAnimalIds).toEqual(['lion'])
    expect(res1.updatedProgress.totalPhotosCaptured).toBe(1)
    expect(res1.updatedProgress.explorerRank).toBe('junior-scout')

    // Snapshot rest of savanna animals
    let progress = res1.updatedProgress
    progress = recordSnapshot(progress, 'elephant', 0).updatedProgress
    progress = recordSnapshot(progress, 'giraffe', 0).updatedProgress
    progress = recordSnapshot(progress, 'zebra', 0).updatedProgress

    expect(progress.photographedAnimalIds).toHaveLength(4)
    expect(progress.explorerRank).toBe('wild-ranger')
    expect(progress.completedBiomes).toContain('savanna')
  })
})
