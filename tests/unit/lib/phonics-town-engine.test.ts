// tests/unit/lib/phonics-town-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllBuildingDefinitions,
  getBuildingDefinition,
  getBuildingCost,
  canAffordBuilding,
  calculateMayorRank,
  getDefaultTownState,
  constructOrUpgradeBuilding,
  validateResidentQuest,
  completeResidentQuest,
} from '@/lib/phonics-town-engine'

describe('Phonics Town Engine', () => {
  it('getAllBuildingDefinitions returns all 6 curated buildings with 3 stages each', () => {
    const defs = getAllBuildingDefinitions()
    expect(defs).toHaveLength(6)

    defs.forEach((def) => {
      expect(def.stages[1].costBricks).toBe(50)
      expect(def.stages[2].costBricks).toBe(100)
      expect(def.stages[3].costBricks).toBe(150)
      expect(def.quest.options.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('getBuildingDefinition returns matching definition or undefined', () => {
    const bakery = getBuildingDefinition('bakery')
    expect(bakery).toBeDefined()
    expect(bakery?.categoryNameVi).toBe('Tiệm Bánh Nắng Mai')

    const unknown = getBuildingDefinition('non-existent' as never)
    expect(unknown).toBeUndefined()
  })

  it('getBuildingCost and canAffordBuilding correctly evaluate affordability', () => {
    expect(getBuildingCost('bakery', 1)).toBe(50)
    expect(getBuildingCost('bakery', 2)).toBe(100)
    expect(getBuildingCost('bakery', 3)).toBe(150)

    expect(canAffordBuilding(50, 'bakery', 1)).toBe(true)
    expect(canAffordBuilding(49, 'bakery', 1)).toBe(false)
  })

  it('calculateMayorRank returns novice, expert, and legendary ranks', () => {
    expect(calculateMayorRank(0)).toBe('novice')
    expect(calculateMayorRank(99)).toBe('novice')
    expect(calculateMayorRank(100)).toBe('expert')
    expect(calculateMayorRank(299)).toBe('expert')
    expect(calculateMayorRank(300)).toBe('legendary')
    expect(calculateMayorRank(500)).toBe('legendary')
  })

  it('constructOrUpgradeBuilding places new building on empty slot and deducts bricks', () => {
    const initial = getDefaultTownState()
    expect(initial.bricks).toBe(150)
    expect(initial.buildings).toHaveLength(0)

    // Build Bakery on slot 0 (cost 50, reward 20)
    const afterBuild = constructOrUpgradeBuilding(initial, 0, 'bakery')
    expect(afterBuild.buildings).toHaveLength(1)
    expect(afterBuild.buildings[0].level).toBe(1)
    expect(afterBuild.buildings[0].slotIndex).toBe(0)
    expect(afterBuild.bricks).toBe(100)
    expect(afterBuild.prosperityStars).toBe(20)

    // Upgrade Bakery to Level 2 (cost 100, reward 40)
    const afterUpgrade = constructOrUpgradeBuilding(afterBuild, 0, 'bakery')
    expect(afterUpgrade.buildings[0].level).toBe(2)
    expect(afterUpgrade.bricks).toBe(0)
    expect(afterUpgrade.prosperityStars).toBe(60)

    // Attempting to upgrade with 0 bricks should fail gracefully
    const noMoney = constructOrUpgradeBuilding(afterUpgrade, 0, 'bakery')
    expect(noMoney.bricks).toBe(0)
    expect(noMoney.buildings[0].level).toBe(2)
  })

  it('validates and completes resident quests', () => {
    const def = getBuildingDefinition('bakery')!
    const correctOpt = def.quest.options.find((o) => o.isCorrect)!.id
    const wrongOpt = def.quest.options.find((o) => !o.isCorrect)!.id

    expect(validateResidentQuest(def.quest, correctOpt)).toBe(true)
    expect(validateResidentQuest(def.quest, wrongOpt)).toBe(false)

    // Setup state with building on slot 0
    let state = getDefaultTownState()
    state = constructOrUpgradeBuilding(state, 0, 'bakery')

    const afterQuest = completeResidentQuest(state, 0)
    // Reward 30 bricks, 15 stars
    expect(afterQuest.bricks).toBe(state.bricks + 30)
    expect(afterQuest.prosperityStars).toBe(state.prosperityStars + 15)
    expect(afterQuest.buildings[0].isQuestCompletedToday).toBe(true)
    expect(afterQuest.totalQuestsCompleted).toBe(1)
  })
})
