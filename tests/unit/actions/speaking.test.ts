// tests/unit/actions/speaking.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sendSpeakingTurnAction,
  completeSpeakingSessionAction,
  getStudentSpeakingStatsAction,
} from '@/app/actions/speaking'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('Speaking Server Actions', () => {
  let mockSupabase: {
    from: ReturnType<typeof vi.fn>
  }
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.GEMINI_API_KEY

    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('sendSpeakingTurnAction', () => {
    it('returns error if userMessage is empty or whitespace', async () => {
      const res1 = await sendSpeakingTurnAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        userMessage: '   ',
        turnHistory: [],
      })
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/tin nhắn|message/i)

      const res2 = await sendSpeakingTurnAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        userMessage: '',
        turnHistory: [],
      })
      expect(res2.success).toBe(false)
      expect(res2.error).toBeDefined()
    })

    it('returns error if scenarioId is missing or not found', async () => {
      const res1 = await sendSpeakingTurnAction({
        scenarioId: '',
        personaId: 'barista-emma',
        userMessage: 'Hello',
        turnHistory: [],
      })
      expect(res1.success).toBe(false)

      const res2 = await sendSpeakingTurnAction({
        scenarioId: 'non-existent-scenario-id',
        personaId: 'barista-emma',
        userMessage: 'Hello',
        turnHistory: [],
      })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/không tìm thấy|not found/i)
    })

    it('processes turn with offline pedagogical fallback when GEMINI_API_KEY is not set', async () => {
      delete process.env.GEMINI_API_KEY

      const res = await sendSpeakingTurnAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        userMessage: 'A hot coffee, please.',
        turnHistory: [
          {
            sender: 'tutor',
            text: 'Hello! Welcome to Sunshine Café. What would you like to order today?',
          },
        ],
        elapsedMs: 2500,
      })

      expect(res.success).toBe(true)
      expect(res.tutorMessage).toBeDefined()
      expect(typeof res.tutorMessage).toBe('string')
      expect(res.tutorAudioText).toBe(res.tutorMessage)
      expect(res.hints).toBeDefined()
      expect(Array.isArray(res.hints)).toBe(true)
      expect(res.hints?.length).toBe(3)
      expect(res.hints?.map((h) => h.level)).toEqual(['starter', 'natural', 'expressive'])
      expect(res.accuracyScore).toBeGreaterThanOrEqual(80)
      expect(res.wordBreakdown).toBeDefined()
      expect(res.feedbackVi).toBeDefined()
      expect(res.isCompleted).toBe(false)
    })

    it('evaluates pronunciation against best matching hint or userMessage', async () => {
      const res = await sendSpeakingTurnAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        userMessage: 'A hot coffee please',
        turnHistory: [],
        elapsedMs: 2000,
      })

      expect(res.success).toBe(true)
      expect(res.accuracyScore).toBe(100)
      expect(res.wordBreakdown?.length).toBeGreaterThan(0)
      expect(res.wordBreakdown?.every((w) => w.isMatch)).toBe(true)
    })

    it('calls Gemini API when GEMINI_API_KEY is present and returns tutor response & hints', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key'

      const mockGeminiResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    tutorMessage: 'Great choice! Would you like that with sugar?',
                    hints: [
                      {
                        level: 'starter',
                        textEn: 'Yes, please.',
                        textVi: 'Vâng, làm ơn.',
                        phoneticHint: '/jes pliːz/',
                      },
                      {
                        level: 'natural',
                        textEn: 'Just a little bit of sugar, please.',
                        textVi: 'Cho mình một chút đường thôi nhé.',
                        phoneticHint: '/dʒʌst ə ˈlɪtl bɪt əv ˈʃʊɡər pliːz/',
                      },
                      {
                        level: 'expressive',
                        textEn: 'No sugar for me, I prefer it black and bold!',
                        textVi: 'Không đường nhé, mình thích cà phê đen đậm vị hơn!',
                        phoneticHint: '/nəʊ ˈʃʊɡər fɔː miː/',
                      },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockGeminiResponse,
      })
      global.fetch = mockFetch

      const res = await sendSpeakingTurnAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        userMessage: 'A hot coffee, please.',
        turnHistory: [
          {
            sender: 'tutor',
            text: 'Hello! Welcome to Sunshine Café. What would you like to order today?',
          },
        ],
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(res.success).toBe(true)
      expect(res.tutorMessage).toBe('Great choice! Would you like that with sugar?')
      expect(res.hints?.[0].textEn).toBe('Yes, please.')
      expect(res.hints?.[2].level).toBe('expressive')
    })

    it('gracefully falls back to offline engine when Gemini API call throws or fails', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key'

      const mockFetch = vi.fn().mockRejectedValue(new Error('Gemini API network timeout'))
      global.fetch = mockFetch

      const res = await sendSpeakingTurnAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        userMessage: 'A hot coffee, please.',
        turnHistory: [
          {
            sender: 'tutor',
            text: 'Hello! Welcome to Sunshine Café. What would you like to order today?',
          },
        ],
      })

      expect(res.success).toBe(true)
      expect(res.tutorMessage).toBeDefined()
      expect(res.hints?.length).toBe(3)
    })

    it('sets isCompleted to true when target turns reached', async () => {
      // ordering-cafe has targetTurns = 4.
      // With 3 prior student turns (and 4 prior tutor turns, total 7 turns in history),
      // current turn is the 4th student turn.
      const turnHistory = [
        { sender: 'tutor' as const, text: 'Hello!' },
        { sender: 'student' as const, text: 'Hi' },
        { sender: 'tutor' as const, text: 'What would you like?' },
        { sender: 'student' as const, text: 'A latte please' },
        { sender: 'tutor' as const, text: 'What size?' },
        { sender: 'student' as const, text: 'Medium size' },
        { sender: 'tutor' as const, text: 'Anything else?' },
      ]

      const res = await sendSpeakingTurnAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        userMessage: 'No thank you, that is all.',
        turnHistory,
      })

      expect(res.success).toBe(true)
      expect(res.isCompleted).toBe(true)
    })
  })

  describe('completeSpeakingSessionAction', () => {
    it('handles guest session without studentId and does not call DB', async () => {
      const res = await completeSpeakingSessionAction({
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        totalTurns: 4,
        overallScore: 92,
        pronunciationScore: 88,
        fluencyScore: 95,
        turns: [
          {
            id: 'turn-1',
            sender: 'student',
            text: 'A hot coffee, please.',
            accuracyScore: 90,
            timestamp: new Date().toISOString(),
          },
        ],
        mispronouncedWords: ['coffee'],
      })

      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.stars).toBe(3) // >= 85 and >= 80
      expect(res.data?.xpEarned).toBe(115) // 3 * 25 + 4 * 10 = 75 + 40 = 115
      expect(res.data?.scenarioId).toBe('ordering-cafe')
      expect(res.data?.mispronouncedWords).toEqual(['coffee'])
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('persists session and updates student gamification when studentId is present', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              inventory: { bonusStars: 10, xp: 50 },
            },
            error: null,
          }),
        }),
      })
      const gamUpdateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'student_speaking_sessions') {
          return {
            insert: insertMock,
          }
        }
        if (table === 'student_gamification') {
          return {
            select: gamSelectMock,
            update: gamUpdateMock,
          }
        }
        return {}
      })

      const res = await completeSpeakingSessionAction({
        studentId: 'student-uuid-123',
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        totalTurns: 4,
        overallScore: 75,
        pronunciationScore: 70,
        fluencyScore: 80,
        turns: [],
        mispronouncedWords: [],
      })

      expect(res.success).toBe(true)
      expect(res.data?.stars).toBe(2) // 75 overall -> 2 stars
      expect(insertMock).toHaveBeenCalledTimes(1)
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          student_id: 'student-uuid-123',
          scenario_id: 'ordering-cafe',
          stars: 2,
        })
      )
      expect(gamUpdateMock).toHaveBeenCalledTimes(1)
    })

    it('returns error when database insert fails', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'student_speaking_sessions') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'DB connection error' },
            }),
          }
        }
        return {}
      })

      const res = await completeSpeakingSessionAction({
        studentId: 'student-uuid-123',
        scenarioId: 'ordering-cafe',
        personaId: 'barista-emma',
        totalTurns: 4,
        overallScore: 80,
        pronunciationScore: 80,
        fluencyScore: 80,
        turns: [],
        mispronouncedWords: [],
      })

      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })
  })

  describe('getStudentSpeakingStatsAction', () => {
    it('returns default stats if studentId is missing or empty', async () => {
      const res = await getStudentSpeakingStatsAction()
      expect(res.success).toBe(true)
      expect(res.data).toEqual({
        totalSessions: 0,
        totalMinutes: 0,
        averageAccuracy: 0,
        totalStars: 0,
      })
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('returns aggregates from student_speaking_sessions when sessions exist', async () => {
      const mockSessions = [
        { total_turns: 4, pronunciation_score: 80, stars: 2 },
        { total_turns: 6, pronunciation_score: 90, stars: 3 },
      ]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'student_speaking_sessions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: mockSessions,
                error: null,
              }),
            }),
          }
        }
        return {}
      })

      const res = await getStudentSpeakingStatsAction('student-123')
      expect(res.success).toBe(true)
      expect(res.data).toEqual({
        totalSessions: 2,
        totalMinutes: 5, // 10 total turns * 0.5 = 5 minutes
        averageAccuracy: 85, // (80 + 90) / 2 = 85
        totalStars: 5, // 2 + 3 = 5
      })
    })

    it('returns defaults if student has no sessions or DB query errors', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'student_speaking_sessions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Table not found' },
              }),
            }),
          }
        }
        return {}
      })

      const res = await getStudentSpeakingStatsAction('student-123')
      expect(res.success).toBe(true)
      expect(res.data).toEqual({
        totalSessions: 0,
        totalMinutes: 0,
        averageAccuracy: 0,
        totalStars: 0,
      })
    })
  })
})
