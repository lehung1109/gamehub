// tests/unit/analytics.test.ts
import { describe, it, expect } from 'vitest'
import {
  calculateClassDifficultWords,
  filterDifficultWordsByGame,
  searchDifficultWords,
  sortDifficultWords,
  type RawSessionWithDetails,
} from '@/lib/analytics'

describe('Analytics - Class Difficult Words Calculation', () => {
  it('returns empty array when given empty sessions list', () => {
    const result = calculateClassDifficultWords([])
    expect(result).toEqual([])
  })

  it('returns empty array when all questions are answered correctly', () => {
    const mockSessions: RawSessionWithDetails[] = [
      {
        id: 'sess-1',
        student_id: 'st-1',
        game_type: 'listening',
        topic: 'animals',
        score: 2,
        total_questions: 2,
        session_details: [
          {
            id: 'd-1',
            prompt: 'cat',
            selected_answer: 'cat',
            correct_answer: 'cat',
            is_correct: true,
          },
          {
            id: 'd-2',
            prompt: 'dog',
            selected_answer: 'dog',
            correct_answer: 'dog',
            is_correct: true,
          },
        ],
      },
    ]

    const result = calculateClassDifficultWords(mockSessions)
    expect(result).toEqual([])
  })

  it('accurately calculates error rate and student counts for difficult words (Acceptance Scenario 1)', () => {
    // 10 students played Listening with prompt "giraffe" in topic "animals"
    // 7 got it wrong, 3 got it right
    const mockSessions: RawSessionWithDetails[] = []

    for (let i = 1; i <= 7; i++) {
      mockSessions.push({
        id: `sess-wrong-${i}`,
        student_id: `student-${i}`,
        game_type: 'listening',
        topic: 'animals',
        session_details: [
          {
            id: `d-w-${i}`,
            prompt: 'giraffe',
            selected_answer: 'elephant',
            correct_answer: 'giraffe',
            is_correct: false,
          },
        ],
      })
    }

    for (let i = 8; i <= 10; i++) {
      mockSessions.push({
        id: `sess-right-${i}`,
        student_id: `student-${i}`,
        game_type: 'listening',
        topic: 'animals',
        session_details: [
          {
            id: `d-r-${i}`,
            prompt: 'giraffe',
            selected_answer: 'giraffe',
            correct_answer: 'giraffe',
            is_correct: true,
          },
        ],
      })
    }

    const result = calculateClassDifficultWords(mockSessions)

    expect(result.length).toBe(1)
    const giraffe = result[0]
    expect(giraffe.prompt).toBe('giraffe')
    expect(giraffe.gameType).toBe('listening')
    expect(giraffe.gameLabel).toBe('Luyện nghe')
    expect(giraffe.topic).toBe('animals')
    expect(giraffe.incorrectCount).toBe(7)
    expect(giraffe.totalAttempts).toBe(10)
    expect(giraffe.incorrectStudentCount).toBe(7)
    expect(giraffe.totalStudentsAttempted).toBe(10)
    expect(giraffe.errorRatePercent).toBe(70)
    expect(giraffe.accuracyPercent).toBe(30)
  })

  it('aggregates across multiple sessions from the same student correctly', () => {
    // Student 1 attempted "apple" twice: failed once, succeeded once
    // Student 2 attempted "apple" once: failed once
    const mockSessions: RawSessionWithDetails[] = [
      {
        id: 'sess-1',
        student_id: 'st-1',
        game_type: 'spelling',
        topic: 'fruits',
        session_details: [
          {
            id: 'd-1',
            prompt: 'apple',
            selected_answer: 'aple',
            correct_answer: 'apple',
            is_correct: false,
          },
        ],
      },
      {
        id: 'sess-2',
        student_id: 'st-1',
        game_type: 'spelling',
        topic: 'fruits',
        session_details: [
          {
            id: 'd-2',
            prompt: 'apple',
            selected_answer: 'apple',
            correct_answer: 'apple',
            is_correct: true,
          },
        ],
      },
      {
        id: 'sess-3',
        student_id: 'st-2',
        game_type: 'spelling',
        topic: 'fruits',
        session_details: [
          {
            id: 'd-3',
            prompt: 'apple',
            selected_answer: 'aple',
            correct_answer: 'apple',
            is_correct: false,
          },
        ],
      },
    ]

    const result = calculateClassDifficultWords(mockSessions)
    expect(result.length).toBe(1)
    const apple = result[0]
    expect(apple.incorrectCount).toBe(2)
    expect(apple.totalAttempts).toBe(3)
    expect(apple.incorrectStudentCount).toBe(2) // st-1 and st-2 both failed at least once
    expect(apple.totalStudentsAttempted).toBe(2)
    expect(apple.errorRatePercent).toBe(67) // 2/3 = 66.67% -> 67%
  })

  it('sorts difficult words by error rate descending by default', () => {
    const mockSessions: RawSessionWithDetails[] = [
      {
        id: 'sess-1',
        student_id: 'st-1',
        game_type: 'listening',
        topic: 'animals',
        session_details: [
          // "cat": 1 fail / 4 attempts = 25% error
          { id: '1', prompt: 'cat', is_correct: false },
          { id: '2', prompt: 'cat', is_correct: true },
          { id: '3', prompt: 'cat', is_correct: true },
          { id: '4', prompt: 'cat', is_correct: true },
          // "dog": 3 fails / 4 attempts = 75% error
          { id: '5', prompt: 'dog', is_correct: false },
          { id: '6', prompt: 'dog', is_correct: false },
          { id: '7', prompt: 'dog', is_correct: false },
          { id: '8', prompt: 'dog', is_correct: true },
          // "bird": 2 fails / 2 attempts = 100% error
          { id: '9', prompt: 'bird', is_correct: false },
          { id: '10', prompt: 'bird', is_correct: false },
        ],
      },
    ]

    const result = calculateClassDifficultWords(mockSessions)
    expect(result.map((r) => r.prompt)).toEqual(['bird', 'dog', 'cat'])
    expect(result[0].errorRatePercent).toBe(100)
    expect(result[1].errorRatePercent).toBe(75)
    expect(result[2].errorRatePercent).toBe(25)
  })

  it('handles sessions with missing or empty session_details without crashing', () => {
    const mockSessions: RawSessionWithDetails[] = [
      {
        id: 'sess-1',
        student_id: 'st-1',
        game_type: 'flashcard',
        topic: 'general',
      },
      {
        id: 'sess-2',
        student_id: 'st-1',
        game_type: 'spelling',
        topic: 'colors',
        session_details: null as any,
      },
      {
        id: 'sess-3',
        student_id: 'st-2',
        game_type: 'spelling',
        topic: 'colors',
        session_details: [
          { id: 'd-1', prompt: 'blue', is_correct: false },
        ],
      },
    ]

    const result = calculateClassDifficultWords(mockSessions)
    expect(result.length).toBe(1)
    expect(result[0].prompt).toBe('blue')
  })

  it('enriches topic when first session has empty topic and subsequent session has topic', () => {
    const mockSessions: RawSessionWithDetails[] = [
      {
        id: 'sess-1',
        student_id: 'st-1',
        game_type: 'spelling',
        topic: '',
        session_details: [{ id: 'd-1', prompt: 'strawberry', is_correct: false }],
      },
      {
        id: 'sess-2',
        student_id: 'st-2',
        game_type: 'spelling',
        topic: 'fruits',
        session_details: [{ id: 'd-2', prompt: 'strawberry', is_correct: false }],
      },
    ]

    const result = calculateClassDifficultWords(mockSessions)
    expect(result.length).toBe(1)
    expect(result[0].prompt).toBe('strawberry')
    expect(result[0].topic).toBe('fruits')
  })
})

describe('Analytics - Helper Functions (Filter, Search, Sort)', () => {
  const sampleItems = [
    {
      prompt: 'giraffe',
      gameType: 'listening',
      gameLabel: 'Luyện nghe',
      topic: 'animals',
      incorrectCount: 7,
      totalAttempts: 10,
      incorrectStudentCount: 7,
      totalStudentsAttempted: 10,
      errorRatePercent: 70,
      accuracyPercent: 30,
    },
    {
      prompt: 'banana',
      gameType: 'spelling',
      gameLabel: 'Đánh vần',
      topic: 'fruits',
      incorrectCount: 9,
      totalAttempts: 10,
      incorrectStudentCount: 9,
      totalStudentsAttempted: 10,
      errorRatePercent: 90,
      accuracyPercent: 10,
    },
    {
      prompt: 'watermelon',
      gameType: 'spelling',
      gameLabel: 'Đánh vần',
      topic: 'fruits',
      incorrectCount: 3,
      totalAttempts: 10,
      incorrectStudentCount: 3,
      totalStudentsAttempted: 10,
      errorRatePercent: 30,
      accuracyPercent: 70,
    },
  ]

  it('filters by game type correctly (Acceptance Scenario 2)', () => {
    const all = filterDifficultWordsByGame(sampleItems, 'all')
    expect(all.length).toBe(3)

    const spellingOnly = filterDifficultWordsByGame(sampleItems, 'spelling')
    expect(spellingOnly.length).toBe(2)
    expect(spellingOnly.every((i) => i.gameType === 'spelling')).toBe(true)

    const listeningOnly = filterDifficultWordsByGame(sampleItems, 'listening')
    expect(listeningOnly.length).toBe(1)
    expect(listeningOnly[0].prompt).toBe('giraffe')
  })

  it('searches by keyword across prompt and topic', () => {
    const byPrompt = searchDifficultWords(sampleItems, 'gir')
    expect(byPrompt.length).toBe(1)
    expect(byPrompt[0].prompt).toBe('giraffe')

    const byTopic = searchDifficultWords(sampleItems, 'fruits')
    expect(byTopic.length).toBe(2)

    const caseInsensitive = searchDifficultWords(sampleItems, 'BANANA')
    expect(caseInsensitive.length).toBe(1)
  })

  it('sorts by error rate, incorrect count, and student count', () => {
    const byErrorRate = sortDifficultWords(sampleItems, 'errorRate')
    expect(byErrorRate.map((i) => i.prompt)).toEqual(['banana', 'giraffe', 'watermelon'])

    const byIncorrectCount = sortDifficultWords(sampleItems, 'incorrectCount')
    expect(byIncorrectCount.map((i) => i.prompt)).toEqual(['banana', 'giraffe', 'watermelon'])

    const byStudentCount = sortDifficultWords(sampleItems, 'studentCount')
    expect(byStudentCount.map((i) => i.prompt)).toEqual(['banana', 'giraffe', 'watermelon'])
  })
})
