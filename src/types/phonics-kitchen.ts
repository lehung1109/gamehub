// src/types/phonics-kitchen.ts

export type KitchenStationType = 'pizzeria' | 'sushi-bar' | 'bakery-dessert' | 'taco-cantina'

export type MasterChefRank = 'apprentice-cook' | 'sous-chef' | 'executive-masterchef'

export interface RecipeIngredientChallenge {
  targetWord: string
  promptVi: string
  options: string[]
  correctOptionIndex: number
  phoneticRuleVi: string
}

export interface KitchenRecipe {
  id: string
  nameEn: string
  nameVi: string
  emoji: string
  station: KitchenStationType
  ingredients: string[]
  phonicsFocus: string
  audioPronunciation: string
  storyVi: string
  challenge: RecipeIngredientChallenge
}

export interface KitchenStationDefinition {
  id: KitchenStationType
  nameEn: string
  nameVi: string
  themeColor: string
  backgroundGradient: string
  descriptionVi: string
  recipeIds: string[]
}

export interface KitchenProgress {
  masteredRecipeIds: string[]
  chefStars: number
  chefRank: MasterChefRank
  completedStations: KitchenStationType[]
}
