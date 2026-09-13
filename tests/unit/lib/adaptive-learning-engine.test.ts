// tests/unit/lib/adaptive-learning-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  SKILL_NODE_CATALOG,
  calculateDdaMultiplier,
  estimateCefrLevel,
  evaluateStudentSkillProfile,
  generateAdaptiveDailyPlan,
  generateClassDiagnosticSummary,
} from '@/lib/adaptive-learning-engine'

describe('Adaptive Learning Engine & DDA Calculator', () => {
  it('contains comprehensive skill catalog spanning 4 domains', () => {
    expect(SKILL_NODE_CATALOG.length).toBeGreaterThanOrEqual(10)
    const domains = new Set(SKILL_NODE_CATALOG.map((n) => n.domain))
    expect(domains.has('phonics')).toBe(true)
    expect(domains.has('vocabulary')).toBe(true)
    expect(domains.has('grammar')).toBe(true)
    expect(domains.has('listening')).toBe(true)
  })

  it('calculates DDA multiplier accurately based on performance', () => {
    expect(calculateDdaMultiplier(90)).toBe(1.2)
    expect(calculateDdaMultiplier(85)).toBe(1.2)
    expect(calculateDdaMultiplier(75)).toBe(1.0)
    expect(calculateDdaMultiplier(60)).toBe(1.0)
    expect(calculateDdaMultiplier(55)).toBe(0.8)
    expect(calculateDdaMultiplier(30)).toBe(0.8)
  })

  it('estimates CEFR levels based on mastery score', () => {
    expect(estimateCefrLevel(95)).toBe('A2.2')
    expect(estimateCefrLevel(82)).toBe('A2.1')
    expect(estimateCefrLevel(74)).toBe('A1.2')
    expect(estimateCefrLevel(58)).toBe('A1.1')
    expect(estimateCefrLevel(40)).toBe('Pre-A1')
  })

  it('evaluates student profile accurately identifying weak and strong nodes', () => {
    const attempts = [
      // ending sounds (3 correct, 7 incorrect -> 30%)
      { skillId: 'ph-ending-sounds', isCorrect: false },
      { skillId: 'ph-ending-sounds', isCorrect: false },
      { skillId: 'ph-ending-sounds', isCorrect: false },
      { skillId: 'ph-ending-sounds', isCorrect: true },
      // vocabulary basics (9 correct, 1 incorrect -> 90%)
      { skillId: 'voc-everyday-basics', isCorrect: true },
      { skillId: 'voc-everyday-basics', isCorrect: true },
      { skillId: 'voc-everyday-basics', isCorrect: true },
      { skillId: 'voc-everyday-basics', isCorrect: true },
    ]

    const profile = evaluateStudentSkillProfile('stu-001', 'Nguyễn Văn An', attempts)

    expect(profile.studentId).toBe('stu-001')
    expect(profile.studentName).toBe('Nguyễn Văn An')
    expect(profile.weakNodes.some((n) => n.id === 'ph-ending-sounds')).toBe(true)
    expect(profile.strongNodes.some((n) => n.id === 'voc-everyday-basics')).toBe(true)
  })

  it('generates tailored 3-step Daily Power Pack targeting weak nodes', () => {
    const profile = evaluateStudentSkillProfile('stu-002', 'Lê Mai', [
      { skillId: 'ph-ending-sounds', isCorrect: false },
    ])

    const plan = generateAdaptiveDailyPlan(profile, '2026-09-13')

    expect(plan.studentId).toBe('stu-002')
    expect(plan.date).toBe('2026-09-13')
    expect(plan.steps).toHaveLength(3)

    expect(plan.steps[0].stepNumber).toBe(1)
    expect(plan.steps[0].type).toBe('warm_up')
    expect(plan.steps[0].targetGameId).toBe('pronunciation')

    expect(plan.steps[1].stepNumber).toBe(2)
    expect(plan.steps[1].type).toBe('core_drill')

    expect(plan.steps[2].stepNumber).toBe(3)
    expect(plan.steps[2].type).toBe('boss_challenge')
    expect(plan.totalExpReward).toBe(60)
  })

  it('aggregates multiple student profiles into class diagnostic summary with tiers', () => {
    const p1 = evaluateStudentSkillProfile('stu-1', 'Học sinh Giỏi', [
      { skillId: 'ph-ending-sounds', isCorrect: true },
      { skillId: 'voc-everyday-basics', isCorrect: true },
      { skillId: 'grm-word-order', isCorrect: true },
    ])
    // Artificially boost p1 mastery
    p1.overallMastery = 88

    const p2 = evaluateStudentSkillProfile('stu-2', 'Học sinh Cần Cố Gắng', [
      { skillId: 'ph-ending-sounds', isCorrect: false },
      { skillId: 'grm-word-order', isCorrect: false },
    ])
    p2.overallMastery = 45

    const summary = generateClassDiagnosticSummary([p1, p2], 'class-1', 'Lớp 3A')

    expect(summary.classId).toBe('class-1')
    expect(summary.studentCount).toBe(2)
    expect(summary.studentRows[0].tier).toBe('advanced')
    expect(summary.studentRows[1].tier).toBe('support')
    expect(summary.weakSkillFrequencies.length).toBeGreaterThan(0)
  })
})
