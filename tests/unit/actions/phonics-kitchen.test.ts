// tests/unit/actions/phonics-kitchen.test.ts

import { describe, it, expect } from 'vitest'
import {
  getKitchenProgressAction,
  saveKitchenProgressAction,
} from '@/app/actions/phonics-kitchen'
import type { KitchenProgress } from '@/types/phonics-kitchen'

describe('Phonics Kitchen Server Actions', () => {
  describe('getKitchenProgressAction', () => {
    it('returns default initial progress successfully', async () => {
      const res = await getKitchenProgressAction()
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.masteredRecipeIds).toEqual([])
      expect(res.data?.chefRank).toBe('apprentice-cook')
    })
  })

  describe('saveKitchenProgressAction', () => {
    it('validates invalid progress payloads', async () => {
      // @ts-expect-error test invalid payload
      const res = await saveKitchenProgressAction(null)
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('saves valid progress and updates chef rank', async () => {
      const validProgress: KitchenProgress = {
        masteredRecipeIds: [
          'margherita-pizza',
          'creamy-pasta',
          'garlic-bread',
          'salmon-nigiri',
        ],
        chefStars: 12,
        chefRank: 'sous-chef',
        completedStations: ['pizzeria'],
      }

      const res = await saveKitchenProgressAction(validProgress)
      expect(res.success).toBe(true)
      expect(res.data?.saved).toBe(true)
      expect(res.data?.totalMastered).toBe(4)
      expect(res.data?.chefRank).toBe('sous-chef')
    })
  })
})
