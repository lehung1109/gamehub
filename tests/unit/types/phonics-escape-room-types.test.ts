// tests/unit/types/phonics-escape-room-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  EscapeRoomTheme,
  EscapeDifficulty,
  EscapeClueOption,
  EscapeClueHotspot,
  EscapeRoom,
  EscapeResult,
} from '@/types/phonics-escape-room'

describe('Phonics Escape Room Type Contracts', () => {
  it('validates theme and difficulty literals', () => {
    const themes: EscapeRoomTheme[] = ['pyramid', 'library', 'space-lab']
    const difficulties: EscapeDifficulty[] = ['beginner', 'intermediate', 'advanced']

    expect(themes).toHaveLength(3)
    expect(difficulties).toHaveLength(3)
  })

  it('constructs a valid EscapeClueOption and EscapeClueHotspot', () => {
    const opt: EscapeClueOption = {
      id: 'opt-1',
      text: 'SHIP',
      icon: '🚢',
      isCorrect: true,
      phonicsHint: 'Âm /ʃ/ trong Ship',
    }

    const hotspot: EscapeClueHotspot = {
      id: 'hs-1',
      titleVi: 'Hòm Báu Cổ',
      titleEn: 'Ancient Chest',
      icon: '📦',
      positionX: 30,
      positionY: 60,
      riddleVi: 'Tìm từ có âm /ʃ/',
      riddleEn: 'Find word with /ʃ/',
      options: [opt],
      explanationVi: 'Chính xác! Ship bắt đầu bằng /ʃ/',
      unlockedCipherChar: 'S',
    }

    expect(hotspot.id).toBe('hs-1')
    expect(hotspot.unlockedCipherChar).toBe('S')
    expect(hotspot.options[0].isCorrect).toBe(true)
  })

  it('constructs a valid EscapeRoom entity', () => {
    const room: EscapeRoom = {
      id: 'test-room',
      titleVi: 'Phòng Thử Nghiệm',
      titleEn: 'Test Chamber',
      synopsisVi: 'Căn phòng câu đố bí ẩn',
      theme: 'pyramid',
      difficulty: 'beginner',
      durationSeconds: 300,
      badgeIcon: '🏛️',
      targetPhonics: 'Digraphs',
      masterCipherWord: 'KEY',
      cipherHintVi: 'Chìa khóa mở cửa',
      hotspots: [],
    }

    expect(room.theme).toBe('pyramid')
    expect(room.durationSeconds).toBe(300)
    expect(room.masterCipherWord).toBe('KEY')
  })

  it('constructs a valid EscapeResult', () => {
    const res: EscapeResult = {
      roomId: 'test-room',
      keysEarned: 3,
      cluesSolved: 3,
      totalClues: 3,
      timeSpentSeconds: 120,
      isEscaped: true,
      expEarned: 150,
      completedAt: new Date().toISOString(),
    }

    expect(res.keysEarned).toBe(3)
    expect(res.isEscaped).toBe(true)
    expect(res.expEarned).toBe(150)
  })
})
