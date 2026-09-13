// tests/unit/actions/phonics-space.test.ts

import { describe, it, expect } from 'vitest'
import {
  getSpaceProgressAction,
  saveSpaceProgressAction,
} from '@/app/actions/phonics-space'
import type { SpaceProgress } from '@/types/phonics-space'

describe('Phonics Space Odyssey Server Actions', () => {
  describe('getSpaceProgressAction', () => {
    it('returns default initial progress successfully', async () => {
      const res = await getSpaceProgressAction()
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.completedMissionIds).toEqual([])
      expect(res.data?.astronautRank).toBe('cadet-explorer')
    })
  })

  describe('saveSpaceProgressAction', () => {
    it('validates invalid progress payloads', async () => {
      // @ts-expect-error test invalid payload
      const res = await saveSpaceProgressAction(null)
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('saves valid progress and updates astronaut rank', async () => {
      const validProgress: SpaceProgress = {
        completedMissionIds: [
          'mars-rover',
          'mars-crater',
          'mars-fuel',
          'saturn-ring',
        ],
        cosmicCrystals: 12,
        astronautRank: 'fleet-commander',
        completedSectors: ['mars'],
      }

      const res = await saveSpaceProgressAction(validProgress)
      expect(res.success).toBe(true)
      expect(res.data?.saved).toBe(true)
      expect(res.data?.totalMissions).toBe(4)
      expect(res.data?.astronautRank).toBe('fleet-commander')
    })
  })
})
