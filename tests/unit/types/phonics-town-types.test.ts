// tests/unit/types/phonics-town-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  BuildingType,
  BuildingLevel,
  MayorRank,
  BuildingUpgradeStage,
  TownResidentQuest,
  TownBuildingDefinition,
  PlacedBuilding,
  TownState,
} from '@/types/phonics-town'

describe('Phonics Town Type Contracts', () => {
  it('validates building types, levels, and mayor ranks', () => {
    const types: BuildingType[] = [
      'bakery',
      'zoo',
      'hospital',
      'library',
      'spaceport',
      'police-station',
    ]
    const levels: BuildingLevel[] = [1, 2, 3]
    const ranks: MayorRank[] = ['novice', 'expert', 'legendary']

    expect(types).toHaveLength(6)
    expect(levels).toHaveLength(3)
    expect(ranks).toHaveLength(3)
  })

  it('constructs a valid BuildingUpgradeStage and TownResidentQuest', () => {
    const stage: BuildingUpgradeStage = {
      level: 1,
      nameVi: 'Xe Bánh Mì',
      nameEn: 'Bakery Cart',
      costBricks: 50,
      icon: '🥖',
      prosperityReward: 20,
    }

    const quest: TownResidentQuest = {
      id: 'q-bakery-1',
      npcName: 'Baker Bob',
      npcRoleVi: 'Bác Thợ Bánh',
      npcAvatar: '👨‍🍳',
      greetingVi: 'Chào Thị trưởng nhí!',
      greetingEn: 'Hello little Mayor!',
      riddleVi: 'Bác cần tìm từ có âm ngắn /e/ (Egg)?',
      riddleEn: 'Find word with short /e/?',
      options: [
        { id: 'opt1', text: 'EGG', icon: '🥚', isCorrect: true, phonicsHint: 'Short /e/' },
        { id: 'opt2', text: 'DOG', icon: '🐶', isCorrect: false, phonicsHint: 'Short /ɒ/' },
      ],
      rewardBricks: 25,
      rewardProsperity: 10,
    }

    expect(stage.level).toBe(1)
    expect(stage.costBricks).toBe(50)
    expect(quest.options[0].isCorrect).toBe(true)
  })

  it('constructs a valid TownBuildingDefinition', () => {
    const def: TownBuildingDefinition = {
      type: 'bakery',
      categoryNameVi: 'Tiệm Bánh Nắng Mai',
      categoryNameEn: 'Sunny Bakery',
      targetPhonics: 'Nguyên âm ngắn & Thực phẩm',
      residentNpc: 'Baker Bob',
      stages: {
        1: { level: 1, nameVi: 'Xe Bánh', nameEn: 'Cart', costBricks: 50, icon: '🥖', prosperityReward: 20 },
        2: { level: 2, nameVi: 'Tiệm Bánh', nameEn: 'Shop', costBricks: 100, icon: '🥐', prosperityReward: 40 },
        3: { level: 3, nameVi: 'Lâu Đài Bánh', nameEn: 'Palace', costBricks: 150, icon: '🎂', prosperityReward: 60 },
      },
      quest: {
        id: 'q-1',
        npcName: 'Bob',
        npcRoleVi: 'Bác thợ bánh',
        npcAvatar: '👨‍🍳',
        greetingVi: 'Xin chào',
        greetingEn: 'Hello',
        riddleVi: 'Câu đố',
        riddleEn: 'Riddle',
        options: [],
        rewardBricks: 25,
        rewardProsperity: 10,
      },
    }

    expect(def.type).toBe('bakery')
    expect(def.stages[3].icon).toBe('🎂')
  })

  it('constructs a valid TownState with PlacedBuilding', () => {
    const placed: PlacedBuilding = {
      slotIndex: 0,
      type: 'bakery',
      level: 2,
      builtAt: new Date().toISOString(),
      isQuestCompletedToday: true,
    }

    const state: TownState = {
      buildings: [placed],
      bricks: 150,
      prosperityStars: 60,
      mayorRank: 'expert',
      totalQuestsCompleted: 5,
    }

    expect(state.buildings).toHaveLength(1)
    expect(state.buildings[0].level).toBe(2)
    expect(state.mayorRank).toBe('expert')
  })
})
