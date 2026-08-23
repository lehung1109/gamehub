import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getStudentProgress } from '@/app/actions/student-progress'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('getStudentProgress Server Action', () => {
  let mockSupabase: { from: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(mockSupabase as any)
  })

  it('fails if classCode is missing or whitespace', async () => {
    const res1 = await getStudentProgress({ classCode: '', studentName: 'Bé Linh' })
    expect(res1.success).toBe(false)
    expect(res1.error).toMatch(/mã lớp/i)

    const res2 = await getStudentProgress({ classCode: '   ', studentName: 'Bé Linh' })
    expect(res2.success).toBe(false)
  })

  it('fails if studentName is missing or whitespace', async () => {
    const res = await getStudentProgress({ classCode: 'ABC123', studentName: '  ' })
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/tên/i)
  })

  it('fails if classroom does not exist or is inactive', async () => {
    const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const eqMock = vi.fn().mockReturnValue({ single: singleMock })
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

    mockSupabase.from.mockReturnValue({ select: selectMock })

    const res = await getStudentProgress({ classCode: 'WRONG1', studentName: 'Bé Linh' })
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/lớp học/i)
  })

  it('returns totalStars: 0 with success: true if student has no record in database yet', async () => {
    const mockClass = { id: 'c1', is_active: true }
    const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const classEqMock = vi.fn().mockReturnValue({ single: classSingleMock })
    const classSelectMock = vi.fn().mockReturnValue({ eq: classEqMock })

    const studentLimitMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const studentEqNameMock = vi.fn().mockReturnValue({ limit: studentLimitMock })
    const studentEqClassMock = vi.fn().mockReturnValue({ eq: studentEqNameMock })
    const studentSelectMock = vi.fn().mockReturnValue({ eq: studentEqClassMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classSelectMock }
      if (table === 'students') return { select: studentSelectMock }
      return { select: vi.fn() }
    })

    const res = await getStudentProgress({ classCode: 'ABC123', studentName: 'Bé Mới' })
    expect(res.success).toBe(true)
    expect(res.totalStars).toBe(0)
  })

  it('calculates totalStars by summing all scores from game_sessions', async () => {
    const mockClass = { id: 'c1', is_active: true }
    const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const classEqMock = vi.fn().mockReturnValue({ single: classSingleMock })
    const classSelectMock = vi.fn().mockReturnValue({ eq: classEqMock })

    const studentLimitMock = vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null })
    const studentEqNameMock = vi.fn().mockReturnValue({ limit: studentLimitMock })
    const studentEqClassMock = vi.fn().mockReturnValue({ eq: studentEqNameMock })
    const studentSelectMock = vi.fn().mockReturnValue({ eq: studentEqClassMock })

    const sessionsEqMock = vi.fn().mockResolvedValue({
      data: [{ score: 10 }, { score: 5 }, { score: null }, { score: 15 }],
      error: null,
    })
    const sessionsSelectMock = vi.fn().mockReturnValue({ eq: sessionsEqMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classSelectMock }
      if (table === 'students') return { select: studentSelectMock }
      if (table === 'game_sessions') return { select: sessionsSelectMock }
      return { select: vi.fn() }
    })

    const res = await getStudentProgress({ classCode: 'ABC123', studentName: 'Bé Linh' })
    expect(res.success).toBe(true)
    expect(res.totalStars).toBe(30) // 10 + 5 + 0 + 15
  })

  it('handles database error when fetching game_sessions', async () => {
    const mockClass = { id: 'c1', is_active: true }
    const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
    const classEqMock = vi.fn().mockReturnValue({ single: classSingleMock })
    const classSelectMock = vi.fn().mockReturnValue({ eq: classEqMock })

    const studentLimitMock = vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null })
    const studentEqNameMock = vi.fn().mockReturnValue({ limit: studentLimitMock })
    const studentEqClassMock = vi.fn().mockReturnValue({ eq: studentEqNameMock })
    const studentSelectMock = vi.fn().mockReturnValue({ eq: studentEqClassMock })

    const sessionsEqMock = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database connection failure' },
    })
    const sessionsSelectMock = vi.fn().mockReturnValue({ eq: sessionsEqMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classSelectMock }
      if (table === 'students') return { select: studentSelectMock }
      if (table === 'game_sessions') return { select: sessionsSelectMock }
      return { select: vi.fn() }
    })

    const res = await getStudentProgress({ classCode: 'ABC123', studentName: 'Bé Linh' })
    expect(res.success).toBe(false)
    expect(res.error).toBeDefined()
  })
})
