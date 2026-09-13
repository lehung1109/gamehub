// tests/unit/actions/phonics-town.test.ts

import { describe, it, expect } from 'vitest'
import {
  getTownStateAction,
  saveTownStateAction,
} from '@/app/actions/phonics-town'
import type { TownState } from '@/types/phonics-town'

describe('Phonics Town Server Actions', () => {
  describe('getTownStateAction', () => {
    it('returns default initial town state with starting bricks', async () => {
      const res = await getTownStateAction()
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.bricks).toBe(150)
      expect(res.data?.buildings).toEqual([])
      expect(res.data?.mayorRank).toBe('novice')
    })
  })

  describe('saveTownStateAction', () => {
    it('returns error when payload is invalid', async () => {
      const res = await saveTownStateAction({} as TownState)
      expect(res.success).toBe(false)
      expect(res.error).toContain('không hợp lệ')
    })

    it('successfully saves and validates town state', async () => {
      const state: TownState = {
        buildings: [
          {
            slotIndex: 0,
            type: 'bakery',
            level: 2,
            builtAt: new Date().toISOString(),
          },
        ],
        bricks: 40,
        prosperityStars: 120,
        mayorRank: 'expert',
        totalQuestsCompleted: 2,
      }

      const res = await saveTownStateAction(state)
      expect(res.success).toBe(true)
      expect(res.data).toEqual({
        saved: true,
        prosperityStars: 120,
        mayorRank: 'expert',
      })
    })
  })
})
