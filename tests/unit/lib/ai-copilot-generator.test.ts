import { describe, it, expect } from 'vitest'
import {
  generateArenaQuestionsFromPrompt,
  generateRemediationLessonPlan,
} from '@/lib/ai-copilot-generator'

describe('AI Classroom Co-Pilot Generator', () => {
  describe('generateArenaQuestionsFromPrompt', () => {
    it('generates polymorphic questions from a teacher prompt', () => {
      const payload = generateArenaQuestionsFromPrompt({
        prompt: 'Tạo 6 câu trắc nghiệm về Animals cho học sinh lớp 3',
        gradeLevel: 'grade-3',
        questionCount: 6,
      })

      expect(payload.title).toMatch(/Animal/i)
      expect(payload.questions).toHaveLength(6)

      // Verify question types include multiple_choice, true_false, and phonics_audio
      const types = payload.questions.map((q) => q.questionType)
      expect(types).toContain('multiple_choice')
      expect(types).toContain('true_false')
      expect(types).toContain('phonics_audio')

      // Verify each question has valid fields
      payload.questions.forEach((q) => {
        expect(q.id).toBeDefined()
        expect(q.question).toBeDefined()
        expect(q.options.length).toBeGreaterThanOrEqual(2)
        expect(q.options).toContain(q.correctAnswer)
        expect(q.timeLimitSeconds).toBeGreaterThanOrEqual(10)
      })
    })

    it('infers grade level and topic from prompt when not explicitly provided', () => {
      const payload = generateArenaQuestionsFromPrompt({
        prompt: 'Đấu trường 5 câu School Supplies lớp 4',
      })

      expect(payload.gradeLevel).toBe('grade-4')
      expect(payload.topic).toBe('school')
      expect(payload.questions.length).toBe(5)
    })

    it('safely handles generic prompts with default primary topics', () => {
      const payload = generateArenaQuestionsFromPrompt({
        prompt: 'Khởi động đầu giờ trắc nghiệm nhanh',
      })

      expect(payload.questions.length).toBeGreaterThanOrEqual(3)
      expect(payload.title).toBeDefined()
    })
  })

  describe('generateRemediationLessonPlan', () => {
    it('creates a 15-minute structured remediation lesson plan with tongue-twister and script', () => {
      const plan = generateRemediationLessonPlan('pronunciation', 'grade-3', ['/s/', '/k/'])

      expect(plan.durationMinutes).toBe(15)
      expect(plan.focusPhonemes).toContain('/s/')
      expect(plan.focusPhonemes).toContain('/k/')
      expect(plan.warmUpTongueTwister).toBeDefined()
      expect(plan.interactiveActivity).toBeDefined()
      expect(plan.recommendedGames.length).toBeGreaterThan(0)
      expect(plan.teacherScriptVi).toMatch(/Chào cả lớp|Thầy|Cô/i)
    })
  })
})
