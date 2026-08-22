// tests/unit/actions/student-dashboard.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStudentDashboardAction } from '@/app/actions/classes'
import * as serverSupabase from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('getStudentDashboardAction', () => {
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

    const res = await getStudentDashboardAction('class-1', 'student-1')
    expect(res.error).toMatch(/đăng nhập/i)
  })

  it('returns error if classId or studentId is missing or empty', async () => {
    const res1 = await getStudentDashboardAction('', 'student-1')
    expect(res1.error).toMatch(/hợp lệ/i)

    const res2 = await getStudentDashboardAction('class-1', '')
    expect(res2.error).toMatch(/hợp lệ/i)
  })

  it('returns error if class is not found or does not belong to teacher', async () => {
    const singleClassMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const eqTeacherMock = vi.fn().mockReturnValue({ single: singleClassMock })
    const eqIdMock = vi.fn().mockReturnValue({ eq: eqTeacherMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqIdMock })

    mockSupabase.from.mockReturnValue({ select: selectMock })

    const res = await getStudentDashboardAction('non-existent-class', 'student-1')
    expect(res.error).toMatch(/không tìm thấy thông tin lớp học/i)
  })

  it('returns error if student is not found or does not belong to class', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

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
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
              }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const res = await getStudentDashboardAction('class-1', 'non-existent-student')
    expect(res.error).toMatch(/không tìm thấy thông tin học sinh/i)
  })

  it('returns empty metrics for a student with 0 sessions', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    const mockStudent = {
      id: 'student-1',
      classroom_id: 'class-1',
      name: 'Bé Minh',
      created_at: '2026-08-21T00:00:00Z',
    }

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
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: mockStudent, error: null }),
              }),
            }),
          }),
        }
      }
      if (table === 'game_sessions') {
        return {
          select: () => ({
            eq: () => ({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }
      }
      return { select: vi.fn() }
    })

    const res = await getStudentDashboardAction('class-1', 'student-1', 'all')
    expect(res.error).toBeUndefined()
    expect(res.data).toBeDefined()
    expect(res.data?.student.name).toBe('Bé Minh')
    expect(res.data?.classroom.name).toBe('Lớp 1A')
    expect(res.data?.totalSessions).toBe(0)
    expect(res.data?.avgScorePercent).toBe(0)
    expect(res.data?.mostPlayedGame).toBeNull()
    expect(res.data?.sessions).toEqual([])
    expect(res.data?.difficultWords).toEqual([])
  })

  it('aggregates sessions and computes top difficult/missed words correctly', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    const mockStudent = {
      id: 'student-1',
      classroom_id: 'class-1',
      name: 'Bé Minh',
      created_at: '2026-08-21T00:00:00Z',
    }

    const mockSessions = [
      {
        id: 'sess-1',
        student_id: 'student-1',
        game_type: 'listening',
        topic: 'animals',
        score: 7,
        total_questions: 10,
        completed_at: '2026-08-22T10:00:00Z',
        started_at: '2026-08-22T09:55:00Z',
        session_details: [
          {
            id: 'd-1',
            session_id: 'sess-1',
            prompt: 'giraffe',
            selected_answer: 'elephant',
            correct_answer: 'giraffe',
            is_correct: false,
            time_taken_ms: 3200,
            attempts: 1,
          },
          {
            id: 'd-2',
            session_id: 'sess-1',
            prompt: 'monkey',
            selected_answer: 'monkey',
            correct_answer: 'monkey',
            is_correct: true,
            time_taken_ms: 1500,
            attempts: 1,
          },
          {
            id: 'd-3',
            session_id: 'sess-1',
            prompt: 'tiger',
            selected_answer: 'lion',
            correct_answer: 'tiger',
            is_correct: false,
            time_taken_ms: 4000,
            attempts: 1,
          },
        ],
      },
      {
        id: 'sess-2',
        student_id: 'student-1',
        game_type: 'listening',
        topic: 'animals',
        score: 8,
        total_questions: 10,
        completed_at: '2026-08-22T11:00:00Z',
        started_at: '2026-08-22T10:55:00Z',
        session_details: [
          {
            id: 'd-4',
            session_id: 'sess-2',
            prompt: 'giraffe',
            selected_answer: 'zebra',
            correct_answer: 'giraffe',
            is_correct: false,
            time_taken_ms: 2900,
            attempts: 1,
          },
          {
            id: 'd-5',
            session_id: 'sess-2',
            prompt: 'elephant',
            selected_answer: 'elephant',
            correct_answer: 'elephant',
            is_correct: true,
            time_taken_ms: 1800,
            attempts: 1,
          },
        ],
      },
      {
        id: 'sess-3',
        student_id: 'student-1',
        game_type: 'spelling',
        topic: 'colors',
        score: 9,
        total_questions: 10,
        completed_at: '2026-08-22T12:00:00Z',
        started_at: '2026-08-22T11:55:00Z',
        session_details: [
          {
            id: 'd-6',
            session_id: 'sess-3',
            prompt: 'yellow',
            selected_answer: 'yelow',
            correct_answer: 'yellow',
            is_correct: false,
            time_taken_ms: 5000,
            attempts: 2,
          },
        ],
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
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: mockStudent, error: null }),
              }),
            }),
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

    const res = await getStudentDashboardAction('class-1', 'student-1', 'all')

    expect(res.error).toBeUndefined()
    expect(res.data).toBeDefined()
    expect(res.data?.totalSessions).toBe(3)
    // Avg score: (70% + 80% + 90%) / 3 = 80%
    expect(res.data?.avgScorePercent).toBe(80)

    // Most played game: listening (2 sessions)
    expect(res.data?.mostPlayedGame?.gameType).toBe('listening')
    expect(res.data?.mostPlayedGame?.sessionCount).toBe(2)

    // Sessions count and details
    expect(res.data?.sessions.length).toBe(3)
    expect(res.data?.sessions[0].details.length).toBe(3)

    // Difficult words ranking: 'giraffe' failed 2 times, 'tiger' 1 time, 'yellow' 1 time
    expect(res.data?.difficultWords.length).toBe(3)
    expect(res.data?.difficultWords[0].prompt).toBe('giraffe')
    expect(res.data?.difficultWords[0].incorrectCount).toBe(2)
    expect(res.data?.difficultWords[0].totalAttempts).toBe(2)
    expect(res.data?.difficultWords[0].accuracyPercent).toBe(0)
  })

  it('filters sessions by timeframe (7d and 30d)', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    const mockStudent = {
      id: 'student-1',
      classroom_id: 'class-1',
      name: 'Bé Minh',
      created_at: '2026-08-21T00:00:00Z',
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
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: mockStudent, error: null }),
              }),
            }),
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

    await getStudentDashboardAction('class-1', 'student-1', '7d')
    expect(gteMock).toHaveBeenCalledWith('completed_at', expect.any(String))
  })

  it('normalizes prompt casing and spaces when aggregating difficult words across sessions', async () => {
    const mockClass = {
      id: 'class-1',
      teacher_id: 'teacher-123',
      name: 'Lớp 1A',
      code: 'ABC123',
      is_active: true,
      created_at: '2026-08-20T00:00:00Z',
    }

    const mockStudent = {
      id: 'student-1',
      classroom_id: 'class-1',
      name: 'Bé Minh',
      created_at: '2026-08-21T00:00:00Z',
    }

    const mockSessions = [
      {
        id: 'sess-1',
        student_id: 'student-1',
        game_type: 'listening',
        topic: 'animals',
        score: 8,
        total_questions: 10,
        completed_at: '2026-08-22T10:00:00Z',
        started_at: '2026-08-22T09:55:00Z',
        session_details: [
          {
            id: 'd-1',
            session_id: 'sess-1',
            prompt: 'GIRAFFE ',
            selected_answer: 'elephant',
            correct_answer: 'giraffe',
            is_correct: false,
            time_taken_ms: 3000,
            attempts: 1,
          },
        ],
      },
      {
        id: 'sess-2',
        student_id: 'student-1',
        game_type: 'listening',
        topic: 'animals',
        score: 9,
        total_questions: 10,
        completed_at: '2026-08-22T11:00:00Z',
        started_at: '2026-08-22T10:55:00Z',
        session_details: [
          {
            id: 'd-2',
            session_id: 'sess-2',
            prompt: 'giraffe',
            selected_answer: 'zebra',
            correct_answer: 'giraffe',
            is_correct: false,
            time_taken_ms: 2500,
            attempts: 1,
          },
        ],
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
            eq: () => ({
              eq: () => ({
                single: vi.fn().mockResolvedValue({ data: mockStudent, error: null }),
              }),
            }),
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

    const res = await getStudentDashboardAction('class-1', 'student-1', 'all')
    expect(res.data?.difficultWords.length).toBe(1)
    expect(res.data?.difficultWords[0].incorrectCount).toBe(2)
    expect(res.data?.difficultWords[0].totalAttempts).toBe(2)
  })
})

