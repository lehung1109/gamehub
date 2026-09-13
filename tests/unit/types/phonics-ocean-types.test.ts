// tests/unit/types/phonics-ocean-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  OceanDepthZone,
  DiverRank,
  OceanMission,
  OceanZoneDefinition,
  OceanProgress,
} from '@/types/phonics-ocean'

describe('Phonics Ocean Explorer TypeScript Type Contracts', () => {
  it('validates OceanDepthZone and DiverRank union types', () => {
    const zones: OceanDepthZone[] = ['sunlight', 'twilight', 'midnight', 'abyss']
    expect(zones).toHaveLength(4)

    const ranks: DiverRank[] = ['snorkel_cadet', 'sub_pilot', 'ocean_master']
    expect(ranks).toHaveLength(3)
  })

  it('validates OceanMission interface structure', () => {
    const mockMission: OceanMission = {
      id: 'sunlight-fin',
      zoneId: 'sunlight',
      nameEn: 'Clownfish Fin',
      nameVi: 'Vây Cá Hề Nhiệt Đới',
      creatureName: 'Clownfish',
      creatureEmoji: '🐠',
      depthMeters: 50,
      descriptionVi: 'Khám phá rạn san hô và giải mã vây cá bơi lội.',
      challenge: {
        targetWord: 'FIN',
        phonicsFocus: 'Short /ɪ/ vowel',
        vietnameseMeaning: 'Vây cá',
        phoneticBreakdown: ['F', 'I', 'N'],
        audioHint: 'Fin',
        marineFact: 'Vây cá giúp chúng giữ thăng bằng và chuyển hướng dưới làn nước biển!',
        bubbleScramble: ['N', 'F', 'I'],
      },
    }

    expect(mockMission.id).toBe('sunlight-fin')
    expect(mockMission.zoneId).toBe('sunlight')
    expect(mockMission.challenge.targetWord).toBe('FIN')
    expect(mockMission.challenge.phoneticBreakdown).toEqual(['F', 'I', 'N'])
  })

  it('validates OceanZoneDefinition structure', () => {
    const mockZone: OceanZoneDefinition = {
      id: 'sunlight',
      nameEn: 'Sunlight Zone',
      nameVi: 'Tầng Ánh Nắng (0 - 200m)',
      depthRange: '0 - 200m',
      themeColor: 'cyan',
      bgGradient: 'from-cyan-900/30 via-teal-900/20 to-blue-900/30',
      descriptionVi: 'Khu vực ngập tràn ánh nắng mặt trời, nơi tập trung 90% sinh vật biển.',
      requiredMissions: 0,
    }

    expect(mockZone.id).toBe('sunlight')
    expect(mockZone.depthRange).toBe('0 - 200m')
    expect(mockZone.requiredMissions).toBe(0)
  })

  it('validates OceanProgress default structure', () => {
    const initial: OceanProgress = {
      completedMissionIds: [],
      currentZone: 'sunlight',
      pearls: 0,
      diverRank: 'snorkel_cadet',
      lastPlayedAt: '2026-09-13T10:00:00.000Z',
    }

    expect(initial.completedMissionIds).toEqual([])
    expect(initial.currentZone).toBe('sunlight')
    expect(initial.pearls).toBe(0)
    expect(initial.diverRank).toBe('snorkel_cadet')
  })
})
