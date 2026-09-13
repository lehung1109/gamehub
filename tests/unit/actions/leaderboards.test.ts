// tests/unit/actions/leaderboards.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getClassLeaderboardAction,
  getGlobalLeaderboardAction,
} from '@/app/actions/leaderboards'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('Leaderboard Server Actions', () => {
  let mockSupabase: {
    from: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  describe('getClassLeaderboardAction', () => {
    it('rejects empty or whitespace-only classCode', async () => {
      const res1 = await getClassLeaderboardAction('')
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/mã lớp/i)

      const res2 = await getClassLeaderboardAction('   ')
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/mã lớp/i)
    })

    it('returns error when classroom is not found or inactive', async () => {
      // 1. Not found
      const singleNotFound = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      const eqNotFound = vi.fn().mockReturnValue({ single: singleNotFound })
      const selectNotFound = vi.fn().mockReturnValue({ eq: eqNotFound })
      mockSupabase.from.mockReturnValue({ select: selectNotFound })

      const res1 = await getClassLeaderboardAction('INVALID')
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/mã lớp không hợp lệ|không hoạt động/i)

      // 2. Inactive classroom
      const singleInactive = vi.fn().mockResolvedValue({
        data: { id: 'c-inactive', name: 'Lớp Cũ', is_active: false },
        error: null,
      })
      const eqInactive = vi.fn().mockReturnValue({ single: singleInactive })
      const selectInactive = vi.fn().mockReturnValue({ eq: eqInactive })
      mockSupabase.from.mockReturnValue({ select: selectInactive })

      const res2 = await getClassLeaderboardAction('INACTIVE')
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/mã lớp không hợp lệ|không hoạt động/i)
    })

    it('returns empty array when classroom has no students', async () => {
      const classSingle = vi.fn().mockResolvedValue({
        data: { id: 'c1', name: 'Lớp 3A', is_active: true },
        error: null,
      })
      const classEq = vi.fn().mockReturnValue({ single: classSingle })
      const classSelect = vi.fn().mockReturnValue({ eq: classEq })

      const studentsEq = vi.fn().mockResolvedValue({ data: [], error: null })
      const studentsSelect = vi.fn().mockReturnValue({ eq: studentsEq })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelect }
        if (table === 'students') return { select: studentsSelect }
        return { select: vi.fn() }
      })

      const res = await getClassLeaderboardAction('LOP3A')
      expect(res.success).toBe(true)
      expect(res.data).toEqual([])
    })

    it('correctly aggregates stars, streaks, duel wins, shop cosmetics, and ranks students', async () => {
      const classSingle = vi.fn().mockResolvedValue({
        data: { id: 'c1', name: 'Lớp 4A', is_active: true },
        error: null,
      })
      const classEq = vi.fn().mockReturnValue({ single: classSingle })
      const classSelect = vi.fn().mockReturnValue({ eq: classEq })

      const mockStudents = [
        { id: 's1', name: 'Alice' },
        { id: 's2', name: 'Bob' },
        { id: 's3', name: 'Charlie' },
      ]
      const studentsEq = vi.fn().mockResolvedValue({ data: mockStudents, error: null })
      const studentsSelect = vi.fn().mockReturnValue({ eq: studentsEq })

      // Game sessions:
      // Alice: 120 + 30 = 150 stars
      // Bob: 200 stars
      // Charlie: 50 stars
      const mockSessions = [
        { student_id: 's1', score: 120 },
        { student_id: 's1', score: 30 },
        { student_id: 's2', score: 200 },
        { student_id: 's3', score: 50 },
      ]
      const sessionsIn = vi.fn().mockResolvedValue({ data: mockSessions, error: null })
      const sessionsSelect = vi.fn().mockReturnValue({ in: sessionsIn })

      // Gamification:
      // Alice: streak 5, bonusStars 50 (Total 150 + 50 = 200 stars), equipped frame_gold, title_speed
      // Bob: streak 2, bonusStars 0 (Total 200 stars), tie with Alice on stars!
      // Charlie: streak 0, bonusStars 10 (Total 60 stars)
      const mockGamification = [
        {
          student_id: 's1',
          streak_state: { currentStreak: 5 },
          inventory: {
            bonusStars: 50,
            equippedFrameId: 'frame_gold',
            equippedTitleId: 'title_speed',
          },
        },
        {
          student_id: 's2',
          streak_state: { currentStreak: 2 },
          inventory: { bonusStars: 0 },
        },
        {
          student_id: 's3',
          streak_state: JSON.stringify({ currentStreak: 0 }),
          inventory: JSON.stringify({ bonusStars: 10 }),
        },
      ]
      const gamificationIn = vi.fn().mockResolvedValue({ data: mockGamification, error: null })
      const gamificationSelect = vi.fn().mockReturnValue({ in: gamificationIn })

      // PvP Duels:
      // Bob has 3 duel wins, avatar 🐼
      // Alice has 1 duel win, avatar 🦊
      // Charlie has 0 wins
      const mockDuels = [
        {
          winner_name: 'Bob',
          player1_name: 'Bob',
          player1_avatar: '🐼',
          player2_name: 'Alice',
          player2_avatar: '🦊',
        },
        {
          winner_name: 'Bob',
          player1_name: 'Bob',
          player1_avatar: '🐼',
          player2_name: 'David',
          player2_avatar: '🦁',
        },
        {
          winner_name: 'Bob',
          player1_name: 'Charlie',
          player1_avatar: '🐯',
          player2_name: 'Bob',
          player2_avatar: '🐼',
        },
        {
          winner_name: 'Alice',
          player1_name: 'Alice',
          player1_avatar: '🦊',
          player2_name: 'Charlie',
          player2_avatar: '🐯',
        },
      ]
      const duelsEq = vi.fn().mockResolvedValue({ data: mockDuels, error: null })
      const duelsSelect = vi.fn().mockReturnValue({ eq: duelsEq })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelect }
        if (table === 'students') return { select: studentsSelect }
        if (table === 'game_sessions') return { select: sessionsSelect }
        if (table === 'student_gamification') return { select: gamificationSelect }
        if (table === 'pvp_duels') return { select: duelsSelect }
        return { select: vi.fn() }
      })

      const res = await getClassLeaderboardAction('LOP4A')

      expect(res.success).toBe(true)
      expect(res.data).toHaveLength(3)

      // Both Alice and Bob have 200 totalStars.
      // Tie-breaker: Bob has 3 duel wins vs Alice with 1 duel win -> Bob is rank 1!
      const [first, second, third] = res.data!

      expect(first).toMatchObject({
        rank: 1,
        studentName: 'Bob',
        avatar: '🐼',
        totalStars: 200,
        currentStreak: 2,
        duelWins: 3,
        levelName: 'Chinh phục', // 200 stars >= 150 threshold
      })

      expect(second).toMatchObject({
        rank: 2,
        studentName: 'Alice',
        avatar: '🦊',
        totalStars: 200,
        currentStreak: 5,
        duelWins: 1,
        levelName: 'Chinh phục',
        frameClass: expect.stringContaining('ring-amber-400'),
        titleName: 'Thần Tốc Độ',
      })

      expect(third).toMatchObject({
        rank: 3,
        studentName: 'Charlie',
        totalStars: 60, // 50 + 10 bonus
        currentStreak: 0,
        duelWins: 0,
        levelName: 'Khám phá', // 60 stars >= 50 threshold
      })
    })

    it('handles database error when querying students', async () => {
      const classSingle = vi.fn().mockResolvedValue({
        data: { id: 'c1', name: 'Lớp 4B', is_active: true },
        error: null,
      })
      const classEq = vi.fn().mockReturnValue({ single: classSingle })
      const classSelect = vi.fn().mockReturnValue({ eq: classEq })

      const studentsEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to query students' },
      })
      const studentsSelect = vi.fn().mockReturnValue({ eq: studentsEq })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelect }
        if (table === 'students') return { select: studentsSelect }
        return { select: vi.fn() }
      })

      const res = await getClassLeaderboardAction('LOP4B')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/lỗi khi tải danh sách học sinh/i)
    })
  })

  describe('getGlobalLeaderboardAction', () => {
    it('returns empty array when no students exist in database', async () => {
      const studentsSelect = vi.fn().mockResolvedValue({ data: [], error: null })
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'students') return { select: studentsSelect }
        return { select: vi.fn() }
      })

      const res = await getGlobalLeaderboardAction()
      expect(res.success).toBe(true)
      expect(res.data).toEqual([])
    })

    it('returns top 20 platform-wide learners ranked with duel wins and gamification info', async () => {
      // Create 25 mock students
      const mockStudents = Array.from({ length: 25 }, (_, i) => ({
        id: `s-${i + 1}`,
        name: `Student ${i + 1}`,
      }))
      const studentsSelect = vi.fn().mockResolvedValue({ data: mockStudents, error: null })

      // Scores: Student 1 has highest score (500), down to Student 25 (20)
      const mockSessions = mockStudents.map((s, idx) => ({
        student_id: s.id,
        score: (25 - idx) * 20, // 500, 480, ..., 20
        started_at: '2026-09-10T10:00:00Z',
      }))
      const sessionsSelect = vi.fn().mockResolvedValue({ data: mockSessions, error: null })

      const mockGamification = [
        {
          student_id: 's-1',
          streak_state: { currentStreak: 10 },
          inventory: {
            equippedFrameId: 'frame_neon',
            equippedTitleId: 'title_master',
            bonusStars: 20,
          },
        },
      ]
      const gamificationSelect = vi.fn().mockResolvedValue({ data: mockGamification, error: null })

      const mockDuels = [
        {
          winner_name: 'Student 1',
          player1_name: 'Student 1',
          player1_avatar: '🦁',
          player2_name: 'Student 2',
          player2_avatar: '🐼',
        },
      ]
      const duelsEq = vi.fn().mockResolvedValue({ data: mockDuels, error: null })
      const duelsSelect = vi.fn().mockReturnValue({ eq: duelsEq })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'students') return { select: studentsSelect }
        if (table === 'game_sessions') return { select: sessionsSelect }
        if (table === 'student_gamification') return { select: gamificationSelect }
        if (table === 'pvp_duels') return { select: duelsSelect }
        return { select: vi.fn() }
      })

      const res = await getGlobalLeaderboardAction('all')
      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      // Caps at top 20
      expect(res.data).toHaveLength(20)

      const topStudent = res.data![0]
      expect(topStudent.rank).toBe(1)
      expect(topStudent.studentName).toBe('Student 1')
      expect(topStudent.avatar).toBe('🦁')
      expect(topStudent.totalStars).toBe(520) // 500 + 20 bonus
      expect(topStudent.currentStreak).toBe(10)
      expect(topStudent.duelWins).toBe(1)
      expect(topStudent.levelName).toBe('Huyền thoại') // >= 500
      expect(topStudent.frameClass).toContain('ring-cyan-400')
      expect(topStudent.titleName).toBe('Bậc Thầy Tiếng Anh')

      // 20th student rank should be 20
      expect(res.data![19].rank).toBe(20)
    })

    it('filters sessions by date range when timeframe is weekly', async () => {
      const mockStudents = [{ id: 's-1', name: 'WeeklyStar' }]
      const studentsSelect = vi.fn().mockResolvedValue({ data: mockStudents, error: null })

      const gteMock = vi.fn().mockResolvedValue({
        data: [{ student_id: 's-1', score: 80, started_at: new Date().toISOString() }],
        error: null,
      })
      const sessionsSelect = vi.fn().mockReturnValue({ gte: gteMock })

      const gamificationSelect = vi.fn().mockResolvedValue({ data: [], error: null })
      const duelsEq = vi.fn().mockResolvedValue({ data: [], error: null })
      const duelsSelect = vi.fn().mockReturnValue({ eq: duelsEq })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'students') return { select: studentsSelect }
        if (table === 'game_sessions') return { select: sessionsSelect }
        if (table === 'student_gamification') return { select: gamificationSelect }
        if (table === 'pvp_duels') return { select: duelsSelect }
        return { select: vi.fn() }
      })

      const res = await getGlobalLeaderboardAction('weekly')
      expect(res.success).toBe(true)
      expect(sessionsSelect).toHaveBeenCalled()
      expect(gteMock).toHaveBeenCalledWith('started_at', expect.any(String))
      expect(res.data).toHaveLength(1)
      expect(res.data![0].totalStars).toBe(80)
    })
  })
})
