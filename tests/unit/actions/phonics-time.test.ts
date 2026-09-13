// tests/unit/actions/phonics-time.test.ts

import { describe, it, expect } from 'vitest'
import {
  getTimeProgressAction,
  saveTimeProgressAction,
} from '@/app/actions/phonics-time'
import type { TimeProgress } from '@/types/phonics-time'

describe('Phonics Time Machine Server Actions', () => {
  it('fetches default time progress successfully', async () => {
    const res = await getTimeProgressAction('student-123')
    expect(res.success).toBe(true)
    expect(res.data).toBeDefined()
    expect(res.data?.completedRelicIds).toEqual([])
    expect(res.data?.travelerRank).toBe('novice_nomad')
  })

  it('saves valid time progress and calculates updated rank', async () => {
    const mockProgress: TimeProgress = {
      completedRelicIds: ['egypt-sun', 'egypt-cat', 'egypt-pot', 'greece-sword'],
      currentEra: 'ancient_greece',
      chronoOrbs: 200,
      travelerRank: 'chrono_voyager',
      lastPlayedAt: new Date().toISOString(),
    }

    const res = await saveTimeProgressAction(mockProgress)
    expect(res.success).toBe(true)
    expect(res.data?.saved).toBe(true)
    expect(res.data?.totalRelics).toBe(4)
    expect(res.data?.travelerRank).toBe('chrono_voyager')
  })

  it('rejects invalid time progress payloads', async () => {
    const res = await saveTimeProgressAction(null as unknown as TimeProgress)
    expect(res.success).toBe(false)
    expect(res.error).toContain('không hợp lệ')
  })
})
