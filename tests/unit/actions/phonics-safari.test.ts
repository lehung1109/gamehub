// tests/unit/actions/phonics-safari.test.ts

import { describe, it, expect } from 'vitest'
import {
  getSafariProgressAction,
  saveSafariProgressAction,
} from '@/app/actions/phonics-safari'
import type { SafariProgress } from '@/types/phonics-safari'

describe('Phonics Safari Server Actions', () => {
  describe('getSafariProgressAction', () => {
    it('returns default initial progress successfully', async () => {
      const res = await getSafariProgressAction()
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.photographedAnimalIds).toEqual([])
      expect(res.data?.explorerRank).toBe('junior-scout')
    })
  })

  describe('saveSafariProgressAction', () => {
    it('validates invalid progress payloads', async () => {
      // @ts-expect-error test invalid payload
      const res = await saveSafariProgressAction(null)
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('saves valid progress and recalculates rank', async () => {
      const validProgress: SafariProgress = {
        photographedAnimalIds: ['lion', 'elephant', 'giraffe', 'zebra'],
        completedBiomes: ['savanna'],
        explorerRank: 'wild-ranger',
        totalPhotosCaptured: 4,
      }

      const res = await saveSafariProgressAction(validProgress)
      expect(res.success).toBe(true)
      expect(res.data?.saved).toBe(true)
      expect(res.data?.totalPhotos).toBe(4)
      expect(res.data?.explorerRank).toBe('wild-ranger')
    })
  })
})
