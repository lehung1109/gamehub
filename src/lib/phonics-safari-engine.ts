// src/lib/phonics-safari-engine.ts

import { SAFARI_BIOMES, SAFARI_ANIMALS } from '@/data/safari/animals'
import type {
  SafariBiomeType,
  ExplorerRank,
  SafariAnimal,
  SafariBiomeDefinition,
  SafariProgress,
} from '@/types/phonics-safari'

/**
 * Retrieves all curated Safari biomes
 */
export function getAllBiomes(): SafariBiomeDefinition[] {
  return SAFARI_BIOMES
}

/**
 * Retrieves a specific biome definition by its ID
 */
export function getBiomeById(id: SafariBiomeType): SafariBiomeDefinition | undefined {
  return SAFARI_BIOMES.find((b) => b.id === id)
}

/**
 * Retrieves all curated Safari animals
 */
export function getAllAnimals(): SafariAnimal[] {
  return SAFARI_ANIMALS
}

/**
 * Retrieves a specific animal by ID
 */
export function getAnimalById(id: string): SafariAnimal | undefined {
  return SAFARI_ANIMALS.find((a) => a.id === id)
}

/**
 * Retrieves all animals belonging to a specific biome
 */
export function getAnimalsByBiome(biome: SafariBiomeType): SafariAnimal[] {
  return SAFARI_ANIMALS.filter((a) => a.biome === biome)
}

/**
 * Calculates explorer rank based on total photographed animal count
 */
export function calculateExplorerRank(photographedCount: number): ExplorerRank {
  if (photographedCount >= 12) return 'safari-master'
  if (photographedCount >= 4) return 'wild-ranger'
  return 'junior-scout'
}

/**
 * Provides default initial progress for new explorers
 */
export function getDefaultSafariProgress(): SafariProgress {
  return {
    photographedAnimalIds: [],
    completedBiomes: [],
    explorerRank: 'junior-scout',
    totalPhotosCaptured: 0,
  }
}

/**
 * Records an animal photograph snapshot after answering a phonics challenge
 */
export function recordSnapshot(
  progress: SafariProgress,
  animalId: string,
  answerIndex: number
): { success: boolean; updatedProgress: SafariProgress; error?: string } {
  const animal = getAnimalById(animalId)
  if (!animal) {
    return {
      success: false,
      updatedProgress: progress,
      error: 'Không tìm thấy động vật này trong hồ sơ thám hiểm.',
    }
  }

  if (answerIndex !== animal.challenge.correctOptionIndex) {
    return {
      success: false,
      updatedProgress: progress,
      error: 'Chưa đúng rồi! Hãy lắng nghe lại âm vị và thử chụp lại nhé!',
    }
  }

  const alreadyCaptured = progress.photographedAnimalIds.includes(animalId)
  const updatedAnimalIds = alreadyCaptured
    ? progress.photographedAnimalIds
    : [...progress.photographedAnimalIds, animalId]

  const totalPhotos = updatedAnimalIds.length
  const newRank = calculateExplorerRank(totalPhotos)

  // Determine completed biomes
  const completedBiomes: SafariBiomeType[] = []
  for (const biome of SAFARI_BIOMES) {
    const isBiomeComplete = biome.animalIds.every((id) => updatedAnimalIds.includes(id))
    if (isBiomeComplete) {
      completedBiomes.push(biome.id)
    }
  }

  const updatedProgress: SafariProgress = {
    photographedAnimalIds: updatedAnimalIds,
    completedBiomes,
    explorerRank: newRank,
    totalPhotosCaptured: totalPhotos,
  }

  return {
    success: true,
    updatedProgress,
  }
}
