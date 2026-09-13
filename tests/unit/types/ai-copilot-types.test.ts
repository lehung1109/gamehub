import { describe, it, expect } from 'vitest'
import type {
  PhonemeStatus,
  PhonemeBreakdown,
  PhonemeAssessmentResult,
  CopilotLessonPlan,
  GenerateArenaPromptInput,
  GeneratedArenaPayload,
} from '@/types/ai-copilot'

describe('AI Co-Pilot & Phoneme Types', () => {
  it('validates PhonemeBreakdown and status union', () => {
    const status: PhonemeStatus = 'omitted'
    const breakdown: PhonemeBreakdown = {
      phoneme: 'k',
      ipa: '/k/',
      type: 'consonant',
      status,
      score: 0,
      tipVi: 'Bật âm đuôi /k/ rõ ràng ở cuối từ.',
    }

    expect(breakdown.phoneme).toBe('k')
    expect(breakdown.status).toBe('omitted')
    expect(breakdown.score).toBe(0)
  })

  it('validates PhonemeAssessmentResult structure', () => {
    const result: PhonemeAssessmentResult = {
      targetWord: 'like',
      transcribedText: 'lai',
      accuracy: 65,
      stars: 1,
      isPassed: false,
      hasDroppedFinalSound: true,
      phonemes: [
        { phoneme: 'l', ipa: '/l/', type: 'consonant', status: 'perfect', score: 100 },
        { phoneme: 'i_e', ipa: '/aɪ/', type: 'vowel', status: 'perfect', score: 95 },
        { phoneme: 'k', ipa: '/k/', type: 'consonant', status: 'omitted', score: 0, tipVi: 'Nhớ bật âm đuôi /k/' },
      ],
      overallFeedbackVi: 'Bạn phát âm nguyên âm rất tốt nhưng chưa có âm kết thúc.',
      remediationAdviceVi: 'Hãy luyện tập bật hơi âm /k/ nhẹ ở cuống họng.',
    }

    expect(result.targetWord).toBe('like')
    expect(result.hasDroppedFinalSound).toBe(true)
    expect(result.phonemes).toHaveLength(3)
  })

  it('validates CopilotLessonPlan structure', () => {
    const plan: CopilotLessonPlan = {
      id: 'plan-1',
      title: 'Khắc phục lỗi nuốt âm đuôi /s/ và /k/',
      targetGrade: 'grade-3',
      durationMinutes: 15,
      focusPhonemes: ['/s/', '/k/'],
      warmUpTongueTwister: 'Six slippery snakes slithered silently.',
      interactiveActivity: 'Trò chơi chuyền bóng bật âm đuôi nhanh.',
      recommendedGames: ['pronunciation', 'flashcard'],
      teacherScriptVi: 'Chào cả lớp! Hôm nay chúng mình sẽ cùng làm thợ săn âm đuôi...',
    }

    expect(plan.durationMinutes).toBe(15)
    expect(plan.focusPhonemes).toContain('/s/')
  })

  it('validates GenerateArenaPromptInput and GeneratedArenaPayload', () => {
    const input: GenerateArenaPromptInput = {
      prompt: 'Tạo 5 câu về Animal Habitats',
      gradeLevel: 'grade-4',
      questionCount: 5,
    }

    const payload: GeneratedArenaPayload = {
      title: 'Đấu Trường Động Vật',
      topic: 'animals',
      gradeLevel: 'grade-4',
      questions: [
        {
          id: 'q1',
          question: 'Where do polar bears live?',
          options: ['Arctic', 'Desert', 'Jungle', 'Ocean'],
          correctAnswer: 'Arctic',
          timeLimitSeconds: 15,
          points: 1000,
          questionType: 'multiple_choice',
        },
      ],
    }

    expect(input.questionCount).toBe(5)
    expect(payload.questions[0].correctAnswer).toBe('Arctic')
  })
})
