// tests/unit/actions/phonics-magic.test.ts

import { describe, it, expect } from 'vitest'
import {
  getMagicProgressAction,
  saveMagicProgressAction,
} from '@/app/actions/phonics-magic'
import type { MagicProgress } from '@/types/phonics-magic'

describe('Phonics Magic Server Actions', () => {
  it('fetches default magic progress successfully', async () => {
    const res = await getMagicProgressAction('student-123')
    expect(res.success).toBe(true)
    expect(res.data).toBeDefined()
    expect(res.data?.completedSpellIds).toEqual([])
    expect(res.data?.wizardRank).toBe('apprentice_wizard')
  })

  it('saves valid magic progress and calculates updated rank', async () => {
    const mockProgress: MagicProgress = {
      completedSpellIds: ['fire-hot', 'fire-red', 'fire-sun', 'water-splash'],
      currentTower: 'water',
      manaCrystals: 200,
      wizardRank: 'master_sorcerer',
      lastPlayedAt: new Date().toISOString(),
    }

    const res = await saveMagicProgressAction(mockProgress)
    expect(res.success).toBe(true)
    expect(res.data?.saved).toBe(true)
    expect(res.data?.totalSpells).toBe(4)
    expect(res.data?.wizardRank).toBe('master_sorcerer')
  })

  it('rejects invalid magic progress payloads', async () => {
    const res = await saveMagicProgressAction(null as unknown as MagicProgress)
    expect(res.success).toBe(false)
    expect(res.error).toContain('không hợp lệ')
  })
})
