// tests/unit/tracking-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/track/route'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('Tracking API Route Contract (POST /api/track)', () => {
  let mockAdminSupabase: any

  const validPayload = {
    classCode: 'ABC123',
    studentName: 'Bé Linh',
    gameType: 'listening',
    topic: 'animals',
    score: 8,
    totalQuestions: 10,
    startedAt: '2026-08-22T10:00:00.000Z',
    completedAt: '2026-08-22T10:05:00.000Z',
    configId: 'cfg-1',
    details: [
      {
        prompt: 'cat',
        selectedAnswer: 'cat',
        correctAnswer: 'cat',
        isCorrect: true,
        timeTakenMs: 1500,
        attempts: 1,
      },
      {
        prompt: 'dog',
        selectedAnswer: 'bird',
        correctAnswer: 'dog',
        isCorrect: false,
        timeTakenMs: 3000,
        attempts: 1,
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockAdminSupabase = {
      from: vi.fn(),
    }

    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(mockAdminSupabase)
  })

  it('records a game session and details successfully for a new student', async () => {
    // Mock classroom lookup
    const classroomSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'cls-1', code: 'ABC123', is_active: true, name: 'Lớp 1A' },
      error: null,
    })
    const classroomEqMock = vi.fn().mockReturnValue({ single: classroomSingleMock })
    const classroomSelectMock = vi.fn().mockReturnValue({ eq: classroomEqMock })

    // Mock student lookup (not found initially -> create new)
    const studentLookupLimitMock = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })
    const studentLookupEqNameMock = vi.fn().mockReturnValue({ limit: studentLookupLimitMock })
    const studentLookupEqClassMock = vi.fn().mockReturnValue({ eq: studentLookupEqNameMock })
    const studentLookupSelectMock = vi.fn().mockReturnValue({ eq: studentLookupEqClassMock })

    // Mock student insert
    const studentInsertSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'student-new-1', classroom_id: 'cls-1', name: 'Bé Linh' },
      error: null,
    })
    const studentInsertSelectMock = vi.fn().mockReturnValue({ single: studentInsertSingleMock })
    const studentInsertMock = vi.fn().mockReturnValue({ select: studentInsertSelectMock })

    // Mock game_sessions insert
    const sessionSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'session-1', student_id: 'student-new-1', game_type: 'listening' },
      error: null,
    })
    const sessionSelectMock = vi.fn().mockReturnValue({ single: sessionSingleMock })
    const sessionInsertMock = vi.fn().mockReturnValue({ select: sessionSelectMock })

    // Mock session_details insert
    const detailsInsertMock = vi.fn().mockResolvedValue({
      data: [{ id: 'd-1' }, { id: 'd-2' }],
      error: null,
    })

    mockAdminSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return { select: classroomSelectMock }
      }
      if (table === 'students') {
        return {
          select: studentLookupSelectMock,
          insert: studentInsertMock,
        }
      }
      if (table === 'game_sessions') {
        return { insert: sessionInsertMock }
      }
      if (table === 'session_details') {
        return { insert: detailsInsertMock }
      }
      return {}
    })

    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.sessionId).toBe('session-1')

    // Verify classroom was queried with uppercase code
    expect(classroomSelectMock).toHaveBeenCalledWith('id, code, is_active, name')
    expect(classroomEqMock).toHaveBeenCalledWith('code', 'ABC123')

    // Verify student was inserted with trimmed name
    expect(studentInsertMock).toHaveBeenCalledWith({
      classroom_id: 'cls-1',
      name: 'Bé Linh',
    })

    // Verify session insert
    expect(sessionInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 'student-new-1',
        game_type: 'listening',
        topic: 'animals',
        score: 8,
        total_questions: 10,
        started_at: '2026-08-22T10:00:00.000Z',
        completed_at: '2026-08-22T10:05:00.000Z',
        config_id: 'cfg-1',
      })
    )

    // Verify details insert
    expect(detailsInsertMock).toHaveBeenCalledWith([
      {
        session_id: 'session-1',
        prompt: 'cat',
        selected_answer: 'cat',
        correct_answer: 'cat',
        is_correct: true,
        time_taken_ms: 1500,
        attempts: 1,
      },
      {
        session_id: 'session-1',
        prompt: 'dog',
        selected_answer: 'bird',
        correct_answer: 'dog',
        is_correct: false,
        time_taken_ms: 3000,
        attempts: 1,
      },
    ])
  })

  it('reuses existing student record if found', async () => {
    // Classroom found
    const classroomSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'cls-1', code: 'ABC123', is_active: true },
      error: null,
    })
    const classroomSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ single: classroomSingleMock }),
    })

    // Student found
    const studentLookupLimitMock = vi.fn().mockResolvedValue({
      data: [{ id: 'existing-student-99', classroom_id: 'cls-1', name: 'Bé Linh' }],
      error: null,
    })
    const studentSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ limit: studentLookupLimitMock }),
      }),
    })

    const studentInsertMock = vi.fn()

    // Session insert
    const sessionInsertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'session-99' }, error: null }),
      }),
    })

    // Details insert
    const detailsInsertMock = vi.fn().mockResolvedValue({ data: [], error: null })

    mockAdminSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classroomSelectMock }
      if (table === 'students') {
        return {
          select: studentSelectMock,
          insert: studentInsertMock,
        }
      }
      if (table === 'game_sessions') return { insert: sessionInsertMock }
      if (table === 'session_details') return { insert: detailsInsertMock }
      return {}
    })

    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.sessionId).toBe('session-99')
    expect(studentInsertMock).not.toHaveBeenCalled()
    expect(sessionInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: 'existing-student-99' })
    )
  })

  it('handles games without scoring or configId (like flashcard)', async () => {
    const flashcardPayload = {
      classCode: 'ABC123',
      studentName: 'Bé Linh',
      gameType: 'flashcard',
      topic: 'fruits',
      totalQuestions: 5,
      startedAt: '2026-08-22T10:00:00.000Z',
      completedAt: '2026-08-22T10:02:00.000Z',
      details: [
        {
          prompt: 'apple',
          isCorrect: true,
          timeTakenMs: 2000,
        },
      ],
    }

    const classroomSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'cls-1', code: 'ABC123', is_active: true },
          error: null,
        }),
      }),
    })

    const studentSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'student-1', classroom_id: 'cls-1', name: 'Bé Linh' }],
            error: null,
          }),
        }),
      }),
    })

    const sessionInsertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'session-fc-1' }, error: null }),
      }),
    })

    const detailsInsertMock = vi.fn().mockResolvedValue({ data: [], error: null })

    mockAdminSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classroomSelectMock }
      if (table === 'students') return { select: studentSelectMock }
      if (table === 'game_sessions') return { insert: sessionInsertMock }
      if (table === 'session_details') return { insert: detailsInsertMock }
      return {}
    })

    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flashcardPayload),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.sessionId).toBe('session-fc-1')
    expect(sessionInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        score: null,
        config_id: null,
      })
    )
  })

  it('returns 400 Bad Request when required fields are missing or invalid', async () => {
    const invalidPayloads = [
      {},
      { classCode: '' },
      { classCode: 'ABC123', studentName: '' },
      { classCode: 'ABC123', studentName: 'Bé' }, // missing gameType, topic, etc.
      { ...validPayload, totalQuestions: -1 },
      { ...validPayload, score: 3.14 }, // float score
      { ...validPayload, startedAt: 'invalid-date' },
      { ...validPayload, completedAt: 'invalid-date' },
      { ...validPayload, details: 'not-an-array' },
      { ...validPayload, details: [{ prompt: '' }] },
      { ...validPayload, details: [{ prompt: 'Dog', isCorrect: true, timeTakenMs: -5 }] },
      { ...validPayload, details: [{ prompt: 'a'.repeat(501), isCorrect: true, timeTakenMs: 100 }] },
      { ...validPayload, details: Array(201).fill({ prompt: 'Dog', isCorrect: true, timeTakenMs: 100 }) },
    ]

    for (const payload of invalidPayloads) {
      const request = new Request('http://localhost:3000/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const response = await POST(request)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json.error).toBe('Invalid request payload')
      expect(Array.isArray(json.details)).toBe(true)
      expect(json.details.length).toBeGreaterThan(0)
    }
  })

  it('returns 404 Not Found when class code does not exist or is inactive', async () => {
    // Non-existent class
    const classroomSingleNotFound = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    })
    mockAdminSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: classroomSingleNotFound }),
      }),
    })

    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.error).toBe('Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍')

    // Inactive class
    const classroomSingleInactive = vi.fn().mockResolvedValue({
      data: { id: 'cls-inactive', code: 'ABC123', is_active: false },
      error: null,
    })
    mockAdminSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: classroomSingleInactive }),
      }),
    })

    const responseInactive = await POST(
      new Request('http://localhost:3000/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload),
      })
    )
    const jsonInactive = await responseInactive.json()

    expect(responseInactive.status).toBe(404)
    expect(jsonInactive.error).toBe('Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍')
  })

  it('returns 500 Internal Server Error when database insertion fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Classroom found
    const classroomSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'cls-1', code: 'ABC123', is_active: true },
      error: null,
    })
    const classroomSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({ single: classroomSingleMock }),
    })

    // Student found
    const studentSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [{ id: 'student-1', classroom_id: 'cls-1', name: 'Bé Linh' }],
            error: null,
          }),
        }),
      }),
    })

    // Session insert fails
    const sessionInsertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      }),
    })

    mockAdminSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classroomSelectMock }
      if (table === 'students') return { select: studentSelectMock }
      if (table === 'game_sessions') return { insert: sessionInsertMock }
      return {}
    })

    const request = new Request('http://localhost:3000/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Internal server error')
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
