// tests/unit/types/phonics-time-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  TimeTravelEraId,
  TimeTravelerRank,
  TimeRelic,
  TimeTravelEraDefinition,
  TimeProgress,
} from '@/types/phonics-time'

describe('Phonics Time Machine TypeScript Type Contracts', () => {
  it('validates TimeTravelEraId and TimeTravelerRank union types', () => {
    const eras: TimeTravelEraId[] = ['ancient_egypt', 'ancient_greece', 'medieval_castle', 'future_cyber']
    expect(eras).toHaveLength(4)

    const ranks: TimeTravelerRank[] = ['novice_nomad', 'chrono_voyager', 'time_space_master']
    expect(ranks).toHaveLength(3)
  })

  it('validates TimeRelic interface structure', () => {
    const mockRelic: TimeRelic = {
      id: 'egypt-sun',
      eraId: 'ancient_egypt',
      nameEn: 'Solar Disc of Ra (SUN)',
      nameVi: 'Thần Mặt Trời Ra',
      relicEmoji: '☀️',
      eraNameVi: 'Ai Cập Cổ Đại',
      chronoOrbReward: 50,
      descriptionVi: 'Vầng thái dương linh thiêng chiếu sáng dòng sông Nile màu mỡ.',
      challenge: {
        targetWord: 'SUN',
        phonicsFocus: 'Short /ʌ/ vowel & CVC hieroglyphs',
        vietnameseMeaning: 'Mặt trời',
        phoneticBreakdown: ['S', 'U', 'N'],
        audioHint: 'Sun',
        historyFactVi: 'Người Ai Cập cổ đại thờ phụng thần Mặt Trời Ra như vị thần tối cao.',
        runeScramble: ['N', 'S', 'U'],
      },
    }

    expect(mockRelic.id).toBe('egypt-sun')
    expect(mockRelic.eraId).toBe('ancient_egypt')
    expect(mockRelic.challenge.targetWord).toBe('SUN')
    expect(mockRelic.challenge.phoneticBreakdown).toEqual(['S', 'U', 'N'])
  })

  it('validates TimeTravelEraDefinition structure', () => {
    const mockEra: TimeTravelEraDefinition = {
      id: 'ancient_egypt',
      nameEn: 'Ancient Egypt',
      nameVi: 'Kim Tự Tháp Ai Cập Cổ Đại',
      eraEmoji: '🏺',
      themeColor: 'amber',
      bgGradient: 'from-amber-950/60 via-yellow-950/40 to-stone-950/80',
      descriptionVi: 'Khám phá bí ẩn lăng mộ kim tự tháp và chữ tượng hình cổ xưa.',
      requiredRelics: 0,
    }

    expect(mockEra.id).toBe('ancient_egypt')
    expect(mockEra.eraEmoji).toBe('🏺')
    expect(mockEra.requiredRelics).toBe(0)
  })

  it('validates TimeProgress default structure', () => {
    const initial: TimeProgress = {
      completedRelicIds: [],
      currentEra: 'ancient_egypt',
      chronoOrbs: 0,
      travelerRank: 'novice_nomad',
      lastPlayedAt: '2026-09-13T10:00:00.000Z',
    }

    expect(initial.completedRelicIds).toEqual([])
    expect(initial.currentEra).toBe('ancient_egypt')
    expect(initial.chronoOrbs).toBe(0)
    expect(initial.travelerRank).toBe('novice_nomad')
  })
})
