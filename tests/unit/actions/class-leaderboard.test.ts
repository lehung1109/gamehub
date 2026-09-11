import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClassLeaderboard } from '@/app/actions/class-leaderboard'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('getClassLeaderboard Server Action', () => {
  let mockSupabase: { from: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  it('returns error if classCode is empty or invalid', async () => {
    const res1 = await getClassLeaderboard({ classCode: '' })
    expect(res1.success).toBe(false)
    expect(res1.entries).toEqual([])
    expect(res1.error).toBe('Mã lớp không được để trống')

    const res2 = await getClassLeaderboard({ classCode: '   ' })
    expect(res2.success).toBe(false)
    expect(res2.entries).toEqual([])
    expect(res2.error).toBe('Mã lớp không được để trống')

    // @ts-expect-error - testing invalid input
    const res3 = await getClassLeaderboard({})
    expect(res3.success).toBe(false)
    expect(res3.entries).toEqual([])
    expect(res3.error).toBe('Mã lớp không được để trống')
  })

  it('returns error if classroom is inactive or not found', async () => {
    // 1. Classroom not found
    const singleNotFound = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const eqNotFound = vi.fn().mockReturnValue({ single: singleNotFound })
    const selectNotFound = vi.fn().mockReturnValue({ eq: eqNotFound })

    mockSupabase.from.mockReturnValue({ select: selectNotFound })

    const resNotFound = await getClassLeaderboard({ classCode: 'NOTFOUND' })
    expect(resNotFound.success).toBe(false)
    expect(resNotFound.entries).toEqual([])
    expect(resNotFound.error).toBe('Mã lớp không hợp lệ hoặc lớp học không hoạt động')

    // 2. Classroom inactive
    const singleInactive = vi.fn().mockResolvedValue({
      data: { id: 'c-inactive', name: 'Lớp Cũ', is_active: false },
      error: null,
    })
    const eqInactive = vi.fn().mockReturnValue({ single: singleInactive })
    const selectInactive = vi.fn().mockReturnValue({ eq: eqInactive })

    mockSupabase.from.mockReturnValue({ select: selectInactive })

    const resInactive = await getClassLeaderboard({ classCode: 'INACTIVE' })
    expect(resInactive.success).toBe(false)
    expect(resInactive.entries).toEqual([])
    expect(resInactive.error).toBe('Mã lớp không hợp lệ hoặc lớp học không hoạt động')
  })

  it('returns empty entries if classroom has no students', async () => {
    const mockClass = { id: 'c1', name: 'Lớp 3A', is_active: true }
    const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const classEqMock = vi.fn().mockReturnValue({ single: classSingleMock })
    const classSelectMock = vi.fn().mockReturnValue({ eq: classEqMock })

    const studentsEqMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const studentsSelectMock = vi.fn().mockReturnValue({ eq: studentsEqMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classSelectMock }
      if (table === 'students') return { select: studentsSelectMock }
      return { select: vi.fn() }
    })

    const res = await getClassLeaderboard({ classCode: 'lop3a' })

    expect(res.success).toBe(true)
    expect(res.classroomName).toBe('Lớp 3A')
    expect(res.classCode).toBe('LOP3A')
    expect(res.entries).toEqual([])
    expect(res.currentStudentRank).toBeNull()
  })

  it('calculates ranks and sorts students correctly by stars descending, assigns level info', async () => {
    const mockClass = { id: 'c1', name: 'Lớp 3B', is_active: true }
    const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const classEqMock = vi.fn().mockReturnValue({ single: classSingleMock })
    const classSelectMock = vi.fn().mockReturnValue({ eq: classEqMock })

    const mockStudents = [
      { id: 's1', name: 'Zack', created_at: '2026-01-01' },
      { id: 's2', name: 'Bob', created_at: '2026-01-02' },
      { id: 's3', name: 'Alice', created_at: '2026-01-03' },
      { id: 's4', name: 'Charlie', created_at: '2026-01-04' },
    ]
    const studentsEqMock = vi.fn().mockResolvedValue({ data: mockStudents, error: null })
    const studentsSelectMock = vi.fn().mockReturnValue({ eq: studentsEqMock })

    const mockSessions = [
      // Bob: totalStars = 150 (Level 3), sessionsCount = 2
      { student_id: 's2', score: 100 },
      { student_id: 's2', score: 50 },

      // Charlie: totalStars = 80 (Level 2), sessionsCount = 3 (includes a 0 score and negative/invalid score)
      { student_id: 's4', score: 80 },
      { student_id: 's4', score: 0 },
      { student_id: 's4', score: -10 },

      // Alice: totalStars = 80 (Level 2), sessionsCount = 2
      { student_id: 's3', score: 40 },
      { student_id: 's3', score: 40 },

      // Zack: totalStars = 80 (Level 2), sessionsCount = 2 (same stars & sessions as Alice, but Zack > Alice alphabetically)
      { student_id: 's1', score: 80 },
      { student_id: 's1', score: null },
    ]

    const sessionsInMock = vi.fn().mockResolvedValue({ data: mockSessions, error: null })
    const sessionsSelectMock = vi.fn().mockReturnValue({ in: sessionsInMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classSelectMock }
      if (table === 'students') return { select: studentsSelectMock }
      if (table === 'game_sessions') return { select: sessionsSelectMock }
      return { select: vi.fn() }
    })

    const res = await getClassLeaderboard({ classCode: 'LOP3B' })

    expect(res.success).toBe(true)
    expect(res.classroomName).toBe('Lớp 3B')
    expect(res.classCode).toBe('LOP3B')
    expect(res.entries).toHaveLength(4)

    // Expected order:
    // 1. Bob: 150 stars (Level 3: 🦁 Chinh phục), 2 sessions
    // 2. Charlie: 80 stars, 3 sessions
    // 3. Alice: 80 stars, 2 sessions
    // 4. Zack: 80 stars, 2 sessions (Alice wins tie-break against Zack alphabetically)

    expect(res.entries[0]).toMatchObject({
      rank: 1,
      studentId: 's2',
      studentName: 'Bob',
      totalStars: 150,
      sessionsCount: 2,
      level: 3,
      levelBadge: '🦁',
      levelTitle: 'Chinh phục',
      isCurrentStudent: false,
    })

    expect(res.entries[1]).toMatchObject({
      rank: 2,
      studentId: 's4',
      studentName: 'Charlie',
      totalStars: 80,
      sessionsCount: 3,
      level: 2,
      levelBadge: '🐱',
      levelTitle: 'Khám phá',
      isCurrentStudent: false,
    })

    expect(res.entries[2]).toMatchObject({
      rank: 3,
      studentId: 's3',
      studentName: 'Alice',
      totalStars: 80,
      sessionsCount: 2,
      level: 2,
      levelBadge: '🐱',
      levelTitle: 'Khám phá',
      isCurrentStudent: false,
    })

    expect(res.entries[3]).toMatchObject({
      rank: 4,
      studentId: 's1',
      studentName: 'Zack',
      totalStars: 80,
      sessionsCount: 2,
      level: 2,
      levelBadge: '🐱',
      levelTitle: 'Khám phá',
      isCurrentStudent: false,
    })
  })

  it('correctly identifies isCurrentStudent and currentStudentRank when studentName matches', async () => {
    const mockClass = { id: 'c1', name: 'Lớp 3C', is_active: true }
    const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const classEqMock = vi.fn().mockReturnValue({ single: classSingleMock })
    const classSelectMock = vi.fn().mockReturnValue({ eq: classEqMock })

    const mockStudents = [
      { id: 's1', name: 'Bé Linh', created_at: '2026-01-01' },
      { id: 's2', name: 'Bé An', created_at: '2026-01-02' },
    ]
    const studentsEqMock = vi.fn().mockResolvedValue({ data: mockStudents, error: null })
    const studentsSelectMock = vi.fn().mockReturnValue({ eq: studentsEqMock })

    const mockSessions = [
      { student_id: 's1', score: 200 }, // Rank 1
      { student_id: 's2', score: 100 }, // Rank 2
    ]
    const sessionsInMock = vi.fn().mockResolvedValue({ data: mockSessions, error: null })
    const sessionsSelectMock = vi.fn().mockReturnValue({ in: sessionsInMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classSelectMock }
      if (table === 'students') return { select: studentsSelectMock }
      if (table === 'game_sessions') return { select: sessionsSelectMock }
      return { select: vi.fn() }
    })

    // Case 1: Match case-insensitively with whitespace
    const resMatched = await getClassLeaderboard({
      classCode: 'LOP3C',
      studentName: '  bé an  ',
    })

    expect(resMatched.success).toBe(true)
    expect(resMatched.currentStudentRank).toBe(2)
    expect(resMatched.entries[0].isCurrentStudent).toBe(false)
    expect(resMatched.entries[1].isCurrentStudent).toBe(true)

    // Case 2: No match
    const resNoMatch = await getClassLeaderboard({
      classCode: 'LOP3C',
      studentName: 'Bé Khác',
    })

    expect(resNoMatch.success).toBe(true)
    expect(resNoMatch.currentStudentRank).toBeNull()
    expect(resNoMatch.entries.every((e) => !e.isCurrentStudent)).toBe(true)
  })
})
