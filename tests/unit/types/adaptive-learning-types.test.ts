// tests/unit/types/adaptive-learning-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  SkillDomain,
  CefrLevel,
  SkillNode,
  StudentDiagnosticProfile,
  AdaptiveDailyPlan,
  ClassDiagnosticSummary,
} from '@/types/adaptive-learning'

describe('Adaptive Learning Types Contract', () => {
  it('validates SkillDomain and CefrLevel unions', () => {
    const domains: SkillDomain[] = ['phonics', 'vocabulary', 'grammar', 'listening']
    expect(domains).toHaveLength(4)

    const levels: CefrLevel[] = ['Pre-A1', 'A1.1', 'A1.2', 'A2.1', 'A2.2']
    expect(levels).toHaveLength(5)
  })

  it('validates SkillNode structure', () => {
    const node: SkillNode = {
      id: 'ph-ending-sounds',
      domain: 'phonics',
      nameVi: 'Bật âm đuôi /s/, /k/, /t/',
      descriptionVi: 'Phát âm chuẩn xác phụ âm cuối từ',
      targetGameId: 'pronunciation',
      targetTopicId: 'minimal-pairs',
      defaultThreshold: 70,
    }

    expect(node.id).toBe('ph-ending-sounds')
    expect(node.domain).toBe('phonics')
    expect(node.defaultThreshold).toBe(70)
  })

  it('validates StudentDiagnosticProfile model', () => {
    const profile: StudentDiagnosticProfile = {
      studentId: 'stu-1',
      studentName: 'Bé Lan',
      domainScores: {
        phonics: 65,
        vocabulary: 90,
        grammar: 75,
        listening: 80,
      },
      weakNodes: [
        {
          id: 'ph-ending-sounds',
          domain: 'phonics',
          nameVi: 'Bật âm đuôi',
          descriptionVi: 'Luyện âm đuôi',
          targetGameId: 'pronunciation',
          defaultThreshold: 70,
        },
      ],
      strongNodes: [],
      estimatedCefrLevel: 'A1.1',
      ddaMultiplier: 1.0,
      overallMastery: 77,
    }

    expect(profile.studentId).toBe('stu-1')
    expect(profile.domainScores.vocabulary).toBe(90)
    expect(profile.estimatedCefrLevel).toBe('A1.1')
  })

  it('validates AdaptiveDailyPlan and ClassDiagnosticSummary models', () => {
    const plan: AdaptiveDailyPlan = {
      id: 'plan-2026-09-13',
      date: '2026-09-13',
      studentId: 'stu-1',
      steps: [
        {
          stepNumber: 1,
          type: 'warm_up',
          titleVi: 'Khởi động phát âm',
          descriptionVi: 'Luyện 5 âm đuôi',
          targetGameId: 'pronunciation',
          targetUrl: '/games/pronunciation',
          expReward: 10,
          isCompleted: false,
        },
        {
          stepNumber: 2,
          type: 'core_drill',
          titleVi: 'Ghép câu thông minh',
          descriptionVi: 'Hoàn thành 5 câu ghép',
          targetGameId: 'sentences',
          targetUrl: '/games/sentences',
          expReward: 20,
          isCompleted: false,
        },
        {
          stepNumber: 3,
          type: 'boss_challenge',
          titleVi: 'Thử thách tốc độ',
          descriptionVi: 'Trả lời đúng 3 câu liên tiếp',
          targetGameId: 'falling-words',
          targetUrl: '/games/falling-words',
          expReward: 30,
          isCompleted: false,
        },
      ],
      totalExpReward: 60,
      isFullyCompleted: false,
    }

    expect(plan.steps).toHaveLength(3)
    expect(plan.totalExpReward).toBe(60)

    const classSummary: ClassDiagnosticSummary = {
      classId: 'class-3a',
      className: 'Lớp 3A',
      studentCount: 30,
      domainAverages: {
        phonics: 68,
        vocabulary: 84,
        grammar: 72,
        listening: 79,
      },
      weakSkillFrequencies: [
        { skillId: 'ph-ending-sounds', skillNameVi: 'Bật âm đuôi', count: 18 },
      ],
      studentRows: [
        {
          studentId: 'stu-1',
          studentName: 'Bé Lan',
          overallScore: 77,
          tier: 'target',
          domainScores: {
            phonics: 65,
            vocabulary: 90,
            grammar: 75,
            listening: 80,
          },
          primaryWeakSkill: 'Bật âm đuôi',
        },
      ],
    }

    expect(classSummary.studentCount).toBe(30)
    expect(classSummary.weakSkillFrequencies[0].count).toBe(18)
  })
})
