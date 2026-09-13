// tests/unit/lib/phonics-escape-room-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllEscapeRooms,
  getEscapeRoomById,
  validateClueAnswer,
  validateMasterCode,
  calculateEscapeScore,
} from '@/lib/phonics-escape-room-engine'
import type { EscapeClueHotspot } from '@/types/phonics-escape-room'

describe('Phonics Escape Room Engine', () => {
  it('getAllEscapeRooms returns all 3 curated rooms with valid structure', () => {
    const rooms = getAllEscapeRooms()
    expect(rooms).toHaveLength(3)

    const ids = rooms.map((r) => r.id)
    expect(ids).toContain('pharaoh-tomb')
    expect(ids).toContain('haunted-library')
    expect(ids).toContain('space-station')

    rooms.forEach((room) => {
      expect(room.hotspots.length).toBe(4)
      expect(room.masterCipherWord.length).toBe(4)
      expect(room.durationSeconds).toBeGreaterThanOrEqual(180)
    })
  })

  it('getEscapeRoomById returns matching room or undefined', () => {
    const room = getEscapeRoomById('pharaoh-tomb')
    expect(room).toBeDefined()
    expect(room?.titleVi).toBe('Lăng Mộ Pharaoh Bí Ẩn')

    const unknown = getEscapeRoomById('non-existent')
    expect(unknown).toBeUndefined()
  })

  it('validateClueAnswer correctly checks option validity', () => {
    const hotspot: EscapeClueHotspot = {
      id: 'test-hs',
      titleVi: 'Test',
      titleEn: 'Test',
      icon: '🔍',
      positionX: 50,
      positionY: 50,
      riddleVi: 'Test',
      riddleEn: 'Test',
      options: [
        { id: 'opt-correct', text: 'CAT', icon: '🐱', isCorrect: true, phonicsHint: 'Cat' },
        { id: 'opt-wrong', text: 'DOG', icon: '🐶', isCorrect: false, phonicsHint: 'Dog' },
      ],
      explanationVi: 'Correct!',
      unlockedCipherChar: 'C',
    }

    expect(validateClueAnswer(hotspot, 'opt-correct')).toBe(true)
    expect(validateClueAnswer(hotspot, 'opt-wrong')).toBe(false)
    expect(validateClueAnswer(hotspot, 'invalid-id')).toBe(false)
  })

  it('validateMasterCode handles case-insensitive and trimmed password checking', () => {
    const room = getEscapeRoomById('pharaoh-tomb')!
    expect(room.masterCipherWord).toBe('SHIP')

    expect(validateMasterCode(room, 'SHIP')).toBe(true)
    expect(validateMasterCode(room, 'ship')).toBe(true)
    expect(validateMasterCode(room, '  ShIp  ')).toBe(true)
    expect(validateMasterCode(room, 'BOAT')).toBe(false)
  })

  it('calculateEscapeScore computes keys and EXP for perfect escape', () => {
    const res = calculateEscapeScore('pharaoh-tomb', 4, 4, true, 100)
    expect(res.isEscaped).toBe(true)
    expect(res.keysEarned).toBe(3)
    // base 100 + 4*25 + speed 30 = 230
    expect(res.expEarned).toBe(230)
  })

  it('calculateEscapeScore computes partial escape (2 keys)', () => {
    const res = calculateEscapeScore('pharaoh-tomb', 2, 4, true, 200)
    expect(res.isEscaped).toBe(true)
    expect(res.keysEarned).toBe(2)
    // base 100 + 2*25 + 0 speed bonus = 150
    expect(res.expEarned).toBe(150)
  })

  it('calculateEscapeScore computes emergency escape (1 key)', () => {
    const res = calculateEscapeScore('pharaoh-tomb', 1, 4, true, 310)
    expect(res.isEscaped).toBe(true)
    expect(res.keysEarned).toBe(1)
    // base 100 + 1*25 = 125
    expect(res.expEarned).toBe(125)
  })

  it('calculateEscapeScore computes failure score if not escaped', () => {
    const res = calculateEscapeScore('pharaoh-tomb', 1, 4, false, 300)
    expect(res.isEscaped).toBe(false)
    expect(res.keysEarned).toBe(0)
    // base 30 + 1*25 = 55
    expect(res.expEarned).toBe(55)
  })
})
