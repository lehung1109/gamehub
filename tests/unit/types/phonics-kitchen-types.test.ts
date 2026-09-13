// tests/unit/types/phonics-kitchen-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  KitchenStationType,
  MasterChefRank,
  KitchenRecipe,
  KitchenStationDefinition,
  KitchenProgress,
} from '@/types/phonics-kitchen'

describe('Phonics Kitchen TypeScript Type Contracts', () => {
  it('validates KitchenStationType and MasterChefRank union types', () => {
    const stations: KitchenStationType[] = [
      'pizzeria',
      'sushi-bar',
      'bakery-dessert',
      'taco-cantina',
    ]
    expect(stations).toHaveLength(4)

    const ranks: MasterChefRank[] = [
      'apprentice-cook',
      'sous-chef',
      'executive-masterchef',
    ]
    expect(ranks).toHaveLength(3)
  })

  it('validates KitchenRecipe interface structure', () => {
    const mockRecipe: KitchenRecipe = {
      id: 'margherita-pizza',
      nameEn: 'Margherita Pizza',
      nameVi: 'Pizza Margherita Truyền Thống',
      emoji: '🍕',
      station: 'pizzeria',
      ingredients: ['Ham', 'Fig', 'Cheese', 'Tomato'],
      phonicsFocus: 'CVC words with short vowels',
      audioPronunciation: 'Pizza',
      storyVi: 'Chiếc bánh pizza giòn rụm từ lò nướng củi than hồng.',
      challenge: {
        targetWord: 'HAM',
        promptVi: 'Chọn nguyên liệu thịt có nguyên âm ngắn /æ/: H__M',
        options: ['HAM', 'HOM', 'HUM'],
        correctOptionIndex: 0,
        phoneticRuleVi: 'Nguyên âm ngắn /æ/ trong từ CVC: Ham, Jam, Pan',
      },
    }

    expect(mockRecipe.id).toBe('margherita-pizza')
    expect(mockRecipe.station).toBe('pizzeria')
    expect(mockRecipe.challenge.options[mockRecipe.challenge.correctOptionIndex]).toBe('HAM')
  })

  it('validates KitchenStationDefinition structure', () => {
    const mockStation: KitchenStationDefinition = {
      id: 'pizzeria',
      nameEn: 'Italian Pizzeria',
      nameVi: 'Tiệm Pizza Nước Ý',
      themeColor: 'rose',
      backgroundGradient: 'from-rose-500/20 via-orange-500/15 to-yellow-500/20',
      descriptionVi: 'Hương thơm nức nở từ phô mai tan chảy và bột nướng vàng giòn.',
      recipeIds: ['margherita-pizza', 'creamy-pasta', 'garlic-bread'],
    }

    expect(mockStation.recipeIds).toHaveLength(3)
  })

  it('validates KitchenProgress initial structure', () => {
    const initial: KitchenProgress = {
      masteredRecipeIds: [],
      chefStars: 0,
      chefRank: 'apprentice-cook',
      completedStations: [],
    }

    expect(initial.masteredRecipeIds).toEqual([])
    expect(initial.chefStars).toBe(0)
    expect(initial.chefRank).toBe('apprentice-cook')
  })
})
