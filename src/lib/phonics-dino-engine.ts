// src/lib/phonics-dino-engine.ts

import {
  GeologicalEraId,
  PaleontologistRank,
  GeologicalEraDefinition,
  DinosaurFossil,
  DinoProgress,
} from '@/types/phonics-dino'
import { GEOLOGICAL_ERAS, DINOSAUR_FOSSILS } from '@/data/dino/dinosaurs'

/**
 * Returns all 4 geological eras in order
 */
export function getAllEras(): GeologicalEraDefinition[] {
  return [...GEOLOGICAL_ERAS]
}

/**
 * Retrieves a specific geological era by its unique ID
 */
export function getEraById(id: GeologicalEraId): GeologicalEraDefinition | undefined {
  return GEOLOGICAL_ERAS.find((e) => e.id === id)
}

/**
 * Returns all 12 curated dinosaur fossils
 */
export function getAllFossils(): DinosaurFossil[] {
  return [...DINOSAUR_FOSSILS]
}

/**
 * Retrieves a single dinosaur fossil by its ID
 */
export function getFossilById(id: string): DinosaurFossil | undefined {
  return DINOSAUR_FOSSILS.find((f) => f.id === id)
}

/**
 * Returns all fossils for a specific geological era
 */
export function getFossilsByEra(eraId: GeologicalEraId): DinosaurFossil[] {
  return DINOSAUR_FOSSILS.filter((f) => f.eraId === eraId)
}

/**
 * Calculates paleontologist rank based on completed fossils count
 * - < 4: Junior Digger (Nhà Khảo Cổ Tập Sự 🔍)
 * - 4 - 8: Expert Excavator (Chuyên Gia Khai Quật 🦕)
 * - 9 - 12: Legendary Dino Master (Đại Bậc Thầy Khủng Long 🦖)
 */
export function calculatePaleontologistRank(completedCount: number): PaleontologistRank {
  if (completedCount >= 9) {
    return 'legendary_dino_master'
  }
  if (completedCount >= 4) {
    return 'expert_excavator'
  }
  return 'junior_digger'
}

/**
 * Returns the default initial progress state for Dino Kingdom
 */
export function getDefaultDinoProgress(): DinoProgress {
  return {
    completedFossilIds: [],
    currentEra: 'triassic',
    amberGems: 0,
    paleontologistRank: 'junior_digger',
    lastPlayedAt: new Date().toISOString(),
  }
}

/**
 * Pure function to complete a fossil and update amber gems, ranks, and state
 */
export function completeDinoFossil(
  progress: DinoProgress,
  fossilId: string
): DinoProgress {
  const isAlreadyCompleted = progress.completedFossilIds.includes(fossilId)
  if (isAlreadyCompleted) {
    return {
      ...progress,
      lastPlayedAt: new Date().toISOString(),
    }
  }

  const nextCompleted = [...progress.completedFossilIds, fossilId]
  const nextAmber = progress.amberGems + 50
  const nextRank = calculatePaleontologistRank(nextCompleted.length)

  return {
    ...progress,
    completedFossilIds: nextCompleted,
    amberGems: nextAmber,
    paleontologistRank: nextRank,
    lastPlayedAt: new Date().toISOString(),
  }
}
