// src/lib/phonics-town-engine.ts

import { TOWN_BUILDINGS } from '@/data/town/buildings'
import type {
  BuildingType,
  BuildingLevel,
  MayorRank,
  TownBuildingDefinition,
  TownResidentQuest,
  TownState,
  PlacedBuilding,
} from '@/types/phonics-town'

/**
 * Returns all building definitions
 */
export function getAllBuildingDefinitions(): TownBuildingDefinition[] {
  return TOWN_BUILDINGS
}

/**
 * Retrieves a building definition by its type
 */
export function getBuildingDefinition(
  type: BuildingType
): TownBuildingDefinition | undefined {
  return TOWN_BUILDINGS.find((b) => b.type === type)
}

/**
 * Retrieves the brick cost for a specific building stage
 */
export function getBuildingCost(
  type: BuildingType,
  targetLevel: BuildingLevel
): number {
  const def = getBuildingDefinition(type)
  if (!def || !def.stages[targetLevel]) return Infinity
  return def.stages[targetLevel].costBricks
}

/**
 * Checks if the student has enough bricks for building or upgrade
 */
export function canAffordBuilding(
  bricks: number,
  type: BuildingType,
  targetLevel: BuildingLevel
): boolean {
  const cost = getBuildingCost(type, targetLevel)
  return bricks >= cost
}

/**
 * Computes Mayor rank based on accumulated prosperity stars
 */
export function calculateMayorRank(prosperityStars: number): MayorRank {
  if (prosperityStars >= 300) return 'legendary'
  if (prosperityStars >= 100) return 'expert'
  return 'novice'
}

/**
 * Provides default initial town state with starting brick bonus
 */
export function getDefaultTownState(): TownState {
  return {
    buildings: [],
    bricks: 150, // Starting grant to build the first 1-2 buildings
    prosperityStars: 0,
    mayorRank: 'novice',
    totalQuestsCompleted: 0,
  }
}

/**
 * Constructs a new building on an empty slot or upgrades an existing one
 */
export function constructOrUpgradeBuilding(
  state: TownState,
  slotIndex: number,
  type: BuildingType
): TownState {
  if (slotIndex < 0 || slotIndex > 5) return state

  const def = getBuildingDefinition(type)
  if (!def) return state

  const existingBuilding = state.buildings.find((b) => b.slotIndex === slotIndex)
  const targetLevel: BuildingLevel = existingBuilding
    ? (Math.min(3, existingBuilding.level + 1) as BuildingLevel)
    : 1

  const cost = def.stages[targetLevel].costBricks
  if (state.bricks < cost) return state

  const prosperityGain = def.stages[targetLevel].prosperityReward
  const newBricks = state.bricks - cost
  const newProsperity = state.prosperityStars + prosperityGain

  let updatedBuildings: PlacedBuilding[]
  if (existingBuilding) {
    updatedBuildings = state.buildings.map((b) =>
      b.slotIndex === slotIndex ? { ...b, level: targetLevel } : b
    )
  } else {
    const newPlaced: PlacedBuilding = {
      slotIndex,
      type,
      level: targetLevel,
      builtAt: new Date().toISOString(),
      isQuestCompletedToday: false,
    }
    updatedBuildings = [...state.buildings, newPlaced]
  }

  return {
    ...state,
    buildings: updatedBuildings,
    bricks: newBricks,
    prosperityStars: newProsperity,
    mayorRank: calculateMayorRank(newProsperity),
  }
}

/**
 * Validates a resident quest answer
 */
export function validateResidentQuest(
  quest: TownResidentQuest,
  optionId: string
): boolean {
  const opt = quest.options.find((o) => o.id === optionId)
  return Boolean(opt?.isCorrect)
}

/**
 * Completes a resident quest, rewarding bricks and prosperity
 */
export function completeResidentQuest(
  state: TownState,
  slotIndex: number
): TownState {
  const building = state.buildings.find((b) => b.slotIndex === slotIndex)
  if (!building) return state

  const def = getBuildingDefinition(building.type)
  if (!def) return state

  const newBricks = state.bricks + def.quest.rewardBricks
  const newProsperity = state.prosperityStars + def.quest.rewardProsperity
  const updatedBuildings = state.buildings.map((b) =>
    b.slotIndex === slotIndex ? { ...b, isQuestCompletedToday: true } : b
  )

  return {
    ...state,
    buildings: updatedBuildings,
    bricks: newBricks,
    prosperityStars: newProsperity,
    mayorRank: calculateMayorRank(newProsperity),
    totalQuestsCompleted: state.totalQuestsCompleted + 1,
  }
}
