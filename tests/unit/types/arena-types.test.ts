import { describe, it, expect } from 'vitest'
import type {
  ArenaQuestionType,
  ArenaQuestion,
  ArenaRealtimeEvent,
  ArenaSoundConfig,
  HardQuestionSummary,
} from '@/types/arena'

describe('Arena Types & Polymorphic Contracts', () => {
  it('supports multiple question formats: multiple_choice, true_false, and phonics_audio', () => {
    const mcQuestion: ArenaQuestion = {
      id: 'q1',
      question: 'What is the color of the sky?',
      options: ['Red', 'Blue', 'Green', 'Yellow'],
      correctAnswer: 'Blue',
      timeLimitSeconds: 15,
      points: 1000,
      questionType: 'multiple_choice',
    }

    const tfQuestion: ArenaQuestion = {
      id: 'q2',
      question: 'Water is dry.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      timeLimitSeconds: 10,
      points: 1000,
      questionType: 'true_false',
    }

    const audioQuestion: ArenaQuestion = {
      id: 'q3',
      question: 'Listen and pick the matching word',
      audioPromptUrl: '/audio/phonics/apple.mp3',
      options: ['Apple', 'Apricot', 'Application', 'Apology'],
      correctAnswer: 'Apple',
      timeLimitSeconds: 20,
      points: 1200,
      questionType: 'phonics_audio',
      pointsMultiplier: 1.2,
    }

    expect(mcQuestion.questionType).toBe('multiple_choice')
    expect(tfQuestion.questionType).toBe('true_false')
    expect(audioQuestion.questionType).toBe('phonics_audio')
    expect(audioQuestion.audioPromptUrl).toBeDefined()
    expect(audioQuestion.pointsMultiplier).toBe(1.2)
  })

  it('correctly structures Realtime Broadcast Events', () => {
    const roundStartEvent: ArenaRealtimeEvent = {
      type: 'ROUND_START',
      questionIndex: 0,
      question: {
        id: 'q1',
        question: 'Test',
        options: ['A', 'B'],
        correctAnswer: 'A',
        timeLimitSeconds: 15,
        points: 1000,
      },
      timeLimitSeconds: 15,
    }

    const answerEvent: ArenaRealtimeEvent = {
      type: 'ANSWER_SUBMITTED',
      questionIndex: 0,
      studentName: 'Bình Minh',
      optionIndex: 1,
    }

    const revealEvent: ArenaRealtimeEvent = {
      type: 'ROUND_REVEAL',
      questionIndex: 0,
      correctAnswer: 'A',
      explanation: 'Explanation test',
    }

    const kickEvent: ArenaRealtimeEvent = {
      type: 'PARTICIPANT_KICKED',
      studentName: 'TrollUser',
    }

    expect(roundStartEvent.type).toBe('ROUND_START')
    expect(answerEvent.type).toBe('ANSWER_SUBMITTED')
    expect(revealEvent.type).toBe('ROUND_REVEAL')
    expect(kickEvent.type).toBe('PARTICIPANT_KICKED')
  })

  it('validates ArenaSoundConfig interface', () => {
    const soundConfig: ArenaSoundConfig = {
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.9,
    }

    expect(soundConfig.soundEnabled).toBe(true)
    expect(soundConfig.musicVolume).toBe(0.7)
    expect(soundConfig.sfxVolume).toBe(0.9)
  })

  it('validates HardQuestionSummary interface for SRS remediation', () => {
    const summary: HardQuestionSummary = {
      questionId: 'q-difficult',
      questionText: 'Which animal barks?',
      incorrectRate: 0.65,
      totalAttempts: 20,
      incorrectCount: 13,
    }

    expect(summary.incorrectRate).toBeGreaterThan(0.4)
    expect(summary.totalAttempts).toBe(20)
  })
})
