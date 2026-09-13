// src/lib/phonics-kitchen-engine.ts

import { KITCHEN_STATIONS, KITCHEN_RECIPES } from '@/data/kitchen/recipes'
import type {
  KitchenStationType,
  MasterChefRank,
  KitchenRecipe,
  KitchenStationDefinition,
  KitchenProgress,
} from '@/types/phonics-kitchen'

/**
 * Retrieves all curated kitchen stations
 */
export function getAllStations(): KitchenStationDefinition[] {
  return KITCHEN_STATIONS
}

/**
 * Retrieves a specific station definition by ID
 */
export function getStationById(id: KitchenStationType): KitchenStationDefinition | undefined {
  return KITCHEN_STATIONS.find((s) => s.id === id)
}

/**
 * Retrieves all curated recipes
 */
export function getAllRecipes(): KitchenRecipe[] {
  return KITCHEN_RECIPES
}

/**
 * Retrieves a recipe by its ID
 */
export function getRecipeById(id: string): KitchenRecipe | undefined {
  return KITCHEN_RECIPES.find((r) => r.id === id)
}

/**
 * Retrieves recipes belonging to a specific station
 */
export function getRecipesByStation(station: KitchenStationType): KitchenRecipe[] {
  return KITCHEN_RECIPES.filter((r) => r.station === station)
}

/**
 * Calculates MasterChef rank based on mastered recipes count
 */
export function calculateChefRank(masteredCount: number): MasterChefRank {
  if (masteredCount >= 9) return 'executive-masterchef'
  if (masteredCount >= 4) return 'sous-chef'
  return 'apprentice-cook'
}

/**
 * Provides default initial progress for new culinary students
 */
export function getDefaultKitchenProgress(): KitchenProgress {
  return {
    masteredRecipeIds: [],
    chefStars: 0,
    chefRank: 'apprentice-cook',
    completedStations: [],
  }
}

/**
 * Validates ingredient choice and records completed recipe
 */
export function cookRecipe(
  progress: KitchenProgress,
  recipeId: string,
  answerIndex: number
): { success: boolean; updatedProgress: KitchenProgress; error?: string } {
  const recipe = getRecipeById(recipeId)
  if (!recipe) {
    return {
      success: false,
      updatedProgress: progress,
      error: 'Không tìm thấy công thức món ăn này trong sổ tay bếp.',
    }
  }

  if (answerIndex !== recipe.challenge.correctOptionIndex) {
    return {
      success: false,
      updatedProgress: progress,
      error: 'Chưa đúng nguyên liệu rồi! Hãy lắng nghe lại âm vị và thử nấu lại nhé!',
    }
  }

  const alreadyMastered = progress.masteredRecipeIds.includes(recipeId)
  const updatedRecipeIds = alreadyMastered
    ? progress.masteredRecipeIds
    : [...progress.masteredRecipeIds, recipeId]

  const totalMastered = updatedRecipeIds.length
  const newStars = alreadyMastered ? progress.chefStars : progress.chefStars + 3
  const newRank = calculateChefRank(totalMastered)

  // Determine completed stations
  const completedStations: KitchenStationType[] = []
  for (const station of KITCHEN_STATIONS) {
    const isStationComplete = station.recipeIds.every((id) => updatedRecipeIds.includes(id))
    if (isStationComplete) {
      completedStations.push(station.id)
    }
  }

  const updatedProgress: KitchenProgress = {
    masteredRecipeIds: updatedRecipeIds,
    chefStars: newStars,
    chefRank: newRank,
    completedStations,
  }

  return {
    success: true,
    updatedProgress,
  }
}
