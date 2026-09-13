// tests/unit/actions/phonics-ocean.test.ts

import { describe, it, expect } from 'vitest'
import {
  getOceanProgressAction,
  saveOceanProgressAction,
} from '@/app/actions/phonics-ocean'
import type { OceanProgress } from '@/types/phonics-ocean'

describe('Phonics Ocean Server Actions', () => {
  it('fetches default ocean progress successfully', async () => {
    const res = await getOceanProgressAction('student-123')
    expect(res.success).toBe(true)
    expect(res.data).toBeDefined()
    expect(res.data?.completedMissionIds).toEqual([])
    expect(res.data?.diverRank).toBe('snorkel_cadet')
  })

  it('saves valid ocean progress and calculates updated rank', async () => {
    const mockProgress: OceanProgress = {
      completedMissionIds: [
        'sunlight-fin',
        'sunlight-sun',
        'sunlight-wet',
        'twilight-shell',
      ],
      currentZone: 'twilight',
      pearls: 200,
      diverRank: 'sub_pilot',
      lastPlayedAt: new Date().toISOString(),
    }

    const res = await saveOceanProgressAction(mockProgress)
    expect(res.success).toBe(true)
    expect(res.data?.saved).toBe(true)
    expect(res.data?.totalMissions).toBe(4)
    expect(res.data?.diverRank).toBe('sub_pilot')
  })

  it('rejects invalid ocean progress payloads', async () => {
    const res = await saveOceanProgressAction(null as unknown as OceanProgress)
    expect(res.success).toBe(false)
    expect(res.error).toContain('không hợp lệ')
  })
})
