// tests/unit/actions/class-dashboard.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClassDashboardAction } from '@/app/actions/classes'
import * as serverSupabase from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('getClassDashboardAction', () => {
  let mockSupabase: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'teacher-123', email: 'teacher@example.com' } },
          error: null,
        }),
      },
      from: vi.fn(),
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase)
  })

  it('returns error if user is unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Unauthorized'),
    })

    const res = await getClassDashboardAction('class-1')
    expect(res.error).toMatch(/đăng nhập/i)
  })

  it('returns error if classId is invalid or empty', async () => {
    const res = await getClassDashboardAction('')
    expect(res.error).toMatch(/hợp lệ/i)
  })

  it('returns error if class is not found or does not belong to teacher', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const eqTeacherMock = vi.fn().mockReturnValue({ single: singleMock })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTeacherMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqIdMock })

    mockSupabase.from.mockReturnValue({ select: selectMock })

    const res = await getClassDashboardAction('non-existent-class')
    expect(res.error).toMatch(/không tìm thấy/i)
  })

  it('returns empty stats for a class with 0 students and 0 sessions', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    // Mock classroom fetch
    const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const classEqTeacherMock = vi.fn().mockReturnValue({ single: classSingleMock })
    const classEqIdMock = vi.fn().mockReturnValue({ eq: classEqTeacherMock })
    const classSelectMock = vi.fn().mockReturnValue({ eq: classEqIdMock })

    // Mock students fetch
    const studentsEqMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const studentsSelectMock = vi.fn().mockReturnValue({ eq: studentsEqMock })

    // Mock sessions fetch
    const sessionsOrderMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const sessionsGteMock = vi.fn().mockReturnValue({ order: sessionsOrderMock })
    const sessionsEqMock = vi.fn().mockReturnValue({
      order: sessionsOrderMock,
      gte: sessionsGteMock,
    })
    const sessionsSelectMock = vi.fn().mockReturnValue({ eq: sessionsEqMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return { select: classSelectMock }
      }
      if (table === 'students') {
        return { select: studentsSelectMock }
      }
      if (table === 'game_sessions') {
        return { select: sessionsSelectMock }
      }
      return { select: vi.fn() }
    })

    const res = await getClassDashboardAction('class-1', 'all')

    expect(res.error).toBeUndefined()
    expect(res.data).toBeDefined()
    expect(res.data?.classroom.name).toBe('Lớp 1A')
    expect(res.data?.totalStudents).toBe(0)
    expect(res.data?.totalSessions).toBe(0)
    expect(res.data?.overallAvgScorePercent).toBe(0)
    expect(res.data?.mostPlayedGame).toBeNull()
    expect(res.data?.gameStats).toEqual([])
    expect(res.data?.students).toEqual([])
    expect(res.data?.recentSessions).toEqual([])
  })

  it('aggregates statistics correctly across multiple students, game types, and sessions', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    const mockStudents = [
      { id: 's1', classroom_id: 'class-1', name: 'Bé Lan', created_at: '2026-08-21T00:00:00Z' },
      { id: 's2', classroom_id: 'class-1', name: 'Bé Minh', created_at: '2026-08-21T00:00:00Z' },
    ]

    const mockSessions = [
      {
        id: 'sess-1',
        student_id: 's1',
        game_type: 'listening',
        topic: 'animals',
        score: 8,
        total_questions: 10,
        completed_at: '2026-08-22T10:00:00Z',
        started_at: '2026-08-22T09:55:00Z',
        students: { id: 's1', name: 'Bé Lan', classroom_id: 'class-1' },
      },
      {
        id: 'sess-2',
        student_id: 's1',
        game_type: 'listening',
        topic: 'colors',
        score: 10,
        total_questions: 10,
        completed_at: '2026-08-22T11:00:00Z',
        started_at: '2026-08-22T10:55:00Z',
        students: { id: 's1', name: 'Bé Lan', classroom_id: 'class-1' },
      },
      {
        id: 'sess-3',
        student_id: 's2',
        game_type: 'spelling',
        topic: 'animals',
        score: 6,
        total_questions: 10,
        completed_at: '2026-08-22T12:00:00Z',
        started_at: '2026-08-22T11:55:00Z',
        students: { id: 's2', name: 'Bé Minh', classroom_id: 'class-1' },
      },
    ]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: mockClass, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'students') {
        return {
          select: () => ({
            eq: vi.fn().mockResolvedValue({ data: mockStudents, error: null }),
          }),
        }
      }
      if (table === 'game_sessions') {
        return {
          select: () => ({
            eq: () => ({
              order: vi.fn().mockResolvedValue({ data: mockSessions, error: null }),
              gte: () => ({
                order: vi.fn().mockResolvedValue({ data: mockSessions, error: null }),
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const res = await getClassDashboardAction('class-1', 'all')

    expect(res.error).toBeUndefined()
    expect(res.data).toBeDefined()
    expect(res.data?.totalStudents).toBe(2)
    expect(res.data?.totalSessions).toBe(3)
    // Avg score: (8/10 + 10/10 + 6/10) / 3 = (80 + 100 + 60) / 3 = 80%
    expect(res.data?.overallAvgScorePercent).toBe(80)

    // Most played game: listening (2 sessions) vs spelling (1 session)
    expect(res.data?.mostPlayedGame?.gameType).toBe('listening')
    expect(res.data?.mostPlayedGame?.sessionCount).toBe(2)

    // Game stats breakdown
    const listeningStat = res.data?.gameStats.find((g) => g.gameType === 'listening')
    expect(listeningStat).toBeDefined()
    expect(listeningStat?.sessionCount).toBe(2)
    expect(listeningStat?.avgScorePercent).toBe(90) // (80 + 100) / 2 = 90%

    const spellingStat = res.data?.gameStats.find((g) => g.gameType === 'spelling')
    expect(spellingStat).toBeDefined()
    expect(spellingStat?.sessionCount).toBe(1)
    expect(spellingStat?.avgScorePercent).toBe(60)

    // Students breakdown
    expect(res.data?.students.length).toBe(2)
    const lan = res.data?.students.find((s) => s.name === 'Bé Lan')
    expect(lan?.sessionCount).toBe(2)
    expect(lan?.avgScorePercent).toBe(90)

    const minh = res.data?.students.find((s) => s.name === 'Bé Minh')
    expect(minh?.sessionCount).toBe(1)
    expect(minh?.avgScorePercent).toBe(60)

    // Recent sessions
    expect(res.data?.recentSessions.length).toBe(3)
    expect(res.data?.recentSessions[0].studentName).toBe('Bé Lan')
  })

  it('filters by timeframe (7d and 30d)', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    const gteMock = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
    const eqMock = vi.fn().mockReturnValue({
      gte: gteMock,
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: mockClass, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'students') {
        return {
          select: () => ({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }
      }
      if (table === 'game_sessions') {
        return {
          select: () => ({
            eq: eqMock,
          }),
        }
      }
      return { select: vi.fn() }
    })

    await getClassDashboardAction('class-1', '7d')
    expect(gteMock).toHaveBeenCalledWith('completed_at', expect.any(String))
  })

  it('handles non-scored sessions (score: null) gracefully without distorting average score', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    const mockStudents = [
      { id: 's1', classroom_id: 'class-1', name: 'Bé Lan', created_at: '2026-08-21T00:00:00Z' },
    ]

    const mockSessions = [
      {
        id: 'sess-1',
        student_id: 's1',
        game_type: 'listening',
        topic: 'animals',
        score: 10,
        total_questions: 10,
        completed_at: '2026-08-22T10:00:00Z',
        started_at: '2026-08-22T09:55:00Z',
        students: { id: 's1', name: 'Bé Lan', classroom_id: 'class-1' },
      },
      {
        // Non-scored flashcard session
        id: 'sess-2',
        student_id: 's1',
        game_type: 'flashcard',
        topic: 'colors',
        score: null,
        total_questions: 15,
        completed_at: '2026-08-22T11:00:00Z',
        started_at: '2026-08-22T10:55:00Z',
        students: { id: 's1', name: 'Bé Lan', classroom_id: 'class-1' },
      },
    ]

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: mockClass, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'students') {
        return {
          select: () => ({
            eq: vi.fn().mockResolvedValue({ data: mockStudents, error: null }),
          }),
        }
      }
      if (table === 'game_sessions') {
        return {
          select: () => ({
            eq: () => ({
              order: vi.fn().mockResolvedValue({ data: mockSessions, error: null }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const res = await getClassDashboardAction('class-1', 'all')
    expect(res.data?.totalSessions).toBe(2)
    // Overall average score should be 100% (from the 10/10 listening session), NOT 50%
    expect(res.data?.overallAvgScorePercent).toBe(100)

    const flashcardStat = res.data?.gameStats.find((g) => g.gameType === 'flashcard')
    expect(flashcardStat?.sessionCount).toBe(1)
    expect(flashcardStat?.avgScorePercent).toBe(0)
  })
})
