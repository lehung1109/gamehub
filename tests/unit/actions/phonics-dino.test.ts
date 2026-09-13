// tests/unit/actions/phonics-dino.test.ts

import { describe, it, expect } from 'vitest'
import {
  getDinoProgressAction,
  saveDinoProgressAction,
} from '@/app/actions/phonics-dino'
import type { DinoProgress } from '@/types/phonics-dino'

describe('Phonics Dino Server Actions', () => {
  it('fetches default dino progress successfully', async () => {
    const res = await getDinoProgressAction('student-123')
    expect(res.success).toBe(true)
    expect(res.data).toBeDefined()
    expect(res.data?.completedFossilIds).toEqual([])
    expect(res.data?.paleontologistRank).toBe('junior_digger')
  })

  it('saves valid dino progress and calculates updated rank', async () => {
    const mockProgress: DinoProgress = {
      completedFossilIds: ['triassic-dig', 'triassic-rex', 'triassic-mud', 'jurassic-claw'],
      currentEra: 'jurassic',
      amberGems: 200,
      paleontologistRank: 'expert_excavator',
      lastPlayedAt: new Date().toISOString(),
    }

    const res = await saveDinoProgressAction(mockProgress)
    expect(res.success).toBe(true)
    expect(res.data?.saved).toBe(true)
    expect(res.data?.totalFossils).toBe(4)
    expect(res.data?.paleontologistRank).toBe('expert_excavator')
  })

  it('rejects invalid dino progress payloads', async () => {
    const res = await saveDinoProgressAction(null as unknown as DinoProgress)
    expect(res.success).toBe(false)
    expect(res.error).toContain('không hợp lệ')
  })
})
