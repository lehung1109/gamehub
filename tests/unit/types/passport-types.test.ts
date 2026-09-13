// tests/unit/types/passport-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  StampCategory,
  PassportStamp,
  VoicePortfolioItem,
  GraduationCertificate,
  StudentPassport,
} from '@/types/passport'

describe('Passport Types & Contracts', () => {
  it('validates StampCategory enum values', () => {
    const categories: StampCategory[] = ['games', 'speaking', 'stories', 'chants', 'guilds']
    expect(categories).toHaveLength(5)
  })

  it('validates PassportStamp structure', () => {
    const stamp: PassportStamp = {
      id: 'stamp-comic-master',
      category: 'stories',
      titleVi: 'Ngôi Sao Lồng Tiếng',
      titleEn: 'Comic Voice Actor Star',
      icon: '📖',
      isUnlocked: true,
      unlockedAt: '2026-09-13T10:00:00Z',
      criteriaVi: 'Hoàn thành lồng tiếng 3 tập truyện tranh tương tác',
    }

    expect(stamp.id).toBe('stamp-comic-master')
    expect(stamp.isUnlocked).toBe(true)
    expect(stamp.category).toBe('stories')
  })

  it('validates VoicePortfolioItem structure', () => {
    const item: VoicePortfolioItem = {
      id: 'voice-1',
      titleVi: 'Lồng tiếng Chú Mèo Miu Miu',
      type: 'story-dialogue',
      audioSampleText: 'I see a big cat.',
      accuracyPercent: 95,
      recordedAt: '2026-09-13T10:30:00Z',
      durationSeconds: 3.5,
    }

    expect(item.accuracyPercent).toBe(95)
    expect(item.type).toBe('story-dialogue')
  })

  it('validates GraduationCertificate structure', () => {
    const cert: GraduationCertificate = {
      certificateId: 'GRAD-2026-9988',
      studentName: 'Bé Tuệ Minh',
      cefrLevelAchieved: 'A1',
      totalStars: 48,
      totalExp: 2450,
      completedQuestsCount: 15,
      teacherCommendation: 'Phát âm tự tin, ngữ điệu bài vè xuất sắc!',
      issueDate: '2026-09-13',
    }

    expect(cert.cefrLevelAchieved).toBe('A1')
    expect(cert.totalStars).toBe(48)
  })

  it('validates StudentPassport complete model', () => {
    const passport: StudentPassport = {
      studentId: 'std-101',
      studentName: 'Bé Tuệ Minh',
      avatar: '🦄',
      gradeLevel: 'Lớp 1',
      stamps: [],
      voiceRecordings: [],
      shareToken: 'PASSPORT-TOKEN-77',
    }

    expect(passport.studentId).toBe('std-101')
    expect(passport.shareToken).toBe('PASSPORT-TOKEN-77')
  })
})
