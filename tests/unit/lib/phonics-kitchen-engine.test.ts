// tests/unit/lib/phonics-kitchen-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllStations,
  getStationById,
  getAllRecipes,
  getRecipeById,
  getRecipesByStation,
  calculateChefRank,
  getDefaultKitchenProgress,
  cookRecipe,
} from '@/lib/phonics-kitchen-engine'

describe('Phonics Kitchen Pure Engine', () => {
  it('retrieves all 4 stations and 12 recipes', () => {
    const stations = getAllStations()
    expect(stations).toHaveLength(4)

    const recipes = getAllRecipes()
    expect(recipes).toHaveLength(12)
  })

  it('retrieves stations and recipes by ID correctly', () => {
    const pizzeria = getStationById('pizzeria')
    expect(pizzeria).toBeDefined()
    expect(pizzeria?.nameEn).toContain('Italian Pizzeria')

    const pizza = getRecipeById('margherita-pizza')
    expect(pizza).toBeDefined()
    expect(pizza?.nameVi).toContain('Pizza Margherita')
    expect(pizza?.station).toBe('pizzeria')

    const unknown = getRecipeById('unknown-recipe')
    expect(unknown).toBeUndefined()
  })

  it('filters recipes by station properly', () => {
    const pizzeriaRecipes = getRecipesByStation('pizzeria')
    expect(pizzeriaRecipes).toHaveLength(3)
    expect(pizzeriaRecipes.map((r) => r.id)).toEqual([
      'margherita-pizza',
      'creamy-pasta',
      'garlic-bread',
    ])

    const dessertRecipes = getRecipesByStation('bakery-dessert')
    expect(dessertRecipes).toHaveLength(3)
    expect(dessertRecipes.map((r) => r.id)).toEqual([
      'birthday-cake',
      'fruit-pie',
      'fluffy-pancake',
    ])
  })

  it('calculates chef rank based on mastered recipe thresholds', () => {
    expect(calculateChefRank(0)).toBe('apprentice-cook')
    expect(calculateChefRank(3)).toBe('apprentice-cook')
    expect(calculateChefRank(4)).toBe('sous-chef')
    expect(calculateChefRank(8)).toBe('sous-chef')
    expect(calculateChefRank(9)).toBe('executive-masterchef')
    expect(calculateChefRank(12)).toBe('executive-masterchef')
  })

  it('initializes default progress properly', () => {
    const initial = getDefaultKitchenProgress()
    expect(initial.masteredRecipeIds).toEqual([])
    expect(initial.chefStars).toBe(0)
    expect(initial.chefRank).toBe('apprentice-cook')
    expect(initial.completedStations).toEqual([])
  })

  it('cooks recipe, awards stars, upgrades rank, and completes stations', () => {
    const initial = getDefaultKitchenProgress()

    // Wrong answer
    const failed = cookRecipe(initial, 'margherita-pizza', 99)
    expect(failed.success).toBe(false)
    expect(failed.error).toBeDefined()
    expect(failed.updatedProgress.masteredRecipeIds).toHaveLength(0)

    // Non-existent recipe
    const invalid = cookRecipe(initial, 'ghost-soup', 0)
    expect(invalid.success).toBe(false)

    // Correct recipe cook
    const res1 = cookRecipe(initial, 'margherita-pizza', 0)
    expect(res1.success).toBe(true)
    expect(res1.updatedProgress.masteredRecipeIds).toEqual(['margherita-pizza'])
    expect(res1.updatedProgress.chefStars).toBe(3)
    expect(res1.updatedProgress.chefRank).toBe('apprentice-cook')

    // Cook all 3 pizzeria recipes
    let progress = res1.updatedProgress
    progress = cookRecipe(progress, 'creamy-pasta', 0).updatedProgress
    progress = cookRecipe(progress, 'garlic-bread', 0).updatedProgress

    expect(progress.masteredRecipeIds).toHaveLength(3)
    expect(progress.chefStars).toBe(9)
    expect(progress.completedStations).toContain('pizzeria')

    // Cook 4th recipe to reach sous-chef
    progress = cookRecipe(progress, 'salmon-nigiri', 0).updatedProgress
    expect(progress.chefRank).toBe('sous-chef')
    expect(progress.chefStars).toBe(12)
  })
})
