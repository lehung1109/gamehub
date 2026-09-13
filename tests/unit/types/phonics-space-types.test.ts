// tests/unit/types/phonics-space-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  SpaceSectorType,
  AstronautRank,
  SpaceMission,
  SpaceSectorDefinition,
  SpaceProgress,
} from '@/types/phonics-space'

describe('Phonics Space Odyssey TypeScript Type Contracts', () => {
  it('validates SpaceSectorType and AstronautRank union types', () => {
    const sectors: SpaceSectorType[] = ['mars', 'saturn', 'neptune', 'galaxy']
    expect(sectors).toHaveLength(4)

    const ranks: AstronautRank[] = ['cadet-explorer', 'fleet-commander', 'star-lord']
    expect(ranks).toHaveLength(3)
  })

  it('validates SpaceMission interface structure', () => {
    const mockMission: SpaceMission = {
      id: 'mars-rover',
      nameEn: 'Mars Rover Landing',
      nameVi: 'Thám Hiểm Robot Sao Hỏa',
      emoji: '🚀',
      sector: 'mars',
      targetPhonics: 'CVC words with short vowels',
      audioPronunciation: 'Mars',
      storyVi: 'Hạ cánh robot thăm dò xuống thung lũng đá đỏ kỳ bí.',
      challenge: {
        targetWord: 'ROCK',
        promptVi: 'Chọn từ CVC chỉ những tảng đá đỏ trên Sao Hỏa: R__CK',
        options: ['ROCK', 'RACK', 'RUCK'],
        correctOptionIndex: 0,
        phoneticRuleVi: 'Âm ngắn /ɒ/ trong từ CVC: Rock, Hot, Pot',
      },
    }

    expect(mockMission.id).toBe('mars-rover')
    expect(mockMission.sector).toBe('mars')
    expect(mockMission.challenge.options[mockMission.challenge.correctOptionIndex]).toBe('ROCK')
  })

  it('validates SpaceSectorDefinition structure', () => {
    const mockSector: SpaceSectorDefinition = {
      id: 'mars',
      nameEn: 'Red Desert Mars',
      nameVi: 'Hành Tinh Sao Hỏa',
      themeColor: 'rose',
      backgroundGradient: 'from-rose-600/20 via-orange-600/15 to-red-600/20',
      descriptionVi: 'Xứ sở sa mạc cát đỏ bao la với ngọn núi lửa Olympus hùng vĩ.',
      missionIds: ['mars-rover', 'mars-crater', 'mars-fuel'],
    }

    expect(mockSector.missionIds).toHaveLength(3)
  })

  it('validates SpaceProgress default structure', () => {
    const initial: SpaceProgress = {
      completedMissionIds: [],
      cosmicCrystals: 0,
      astronautRank: 'cadet-explorer',
      completedSectors: [],
    }

    expect(initial.completedMissionIds).toEqual([])
    expect(initial.cosmicCrystals).toBe(0)
    expect(initial.astronautRank).toBe('cadet-explorer')
  })
})
