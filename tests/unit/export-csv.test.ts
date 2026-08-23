// tests/unit/export-csv.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  escapeCsvField,
  generateClassSessionsCsv,
  formatCsvDateVi,
  type CsvSessionRecord,
} from '@/lib/export-csv'
import { GET } from '@/app/api/export-csv/route'
import * as serverSupabase from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('CSV Generation Utility (src/lib/export-csv.ts)', () => {
  describe('escapeCsvField', () => {
    it('returns empty string for null or undefined', () => {
      expect(escapeCsvField(null)).toBe('')
      expect(escapeCsvField(undefined)).toBe('')
    })

    it('returns simple string without modifications if no special characters', () => {
      expect(escapeCsvField('Bé Lan')).toBe('Bé Lan')
      expect(escapeCsvField('listening')).toBe('listening')
      expect(escapeCsvField(10)).toBe('10')
      expect(escapeCsvField(0)).toBe('0')
    })

    it('wraps in double quotes and escapes existing quotes if string contains quotes', () => {
      expect(escapeCsvField('She said "Hello"')).toBe('"She said ""Hello"""')
    })

    it('wraps in double quotes if string contains comma', () => {
      expect(escapeCsvField('Lớp 1A, 2025')).toBe('"Lớp 1A, 2025"')
    })

    it('wraps in double quotes if string contains newline or carriage return', () => {
      expect(escapeCsvField('Line 1\nLine 2')).toBe('"Line 1\nLine 2"')
      expect(escapeCsvField('Line 1\r\nLine 2')).toBe('"Line 1\r\nLine 2"')
    })

    it('neutralizes CSV formula injection (=, +, -, @, \t, \r)', () => {
      expect(escapeCsvField('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)")
      expect(escapeCsvField('+1+2')).toBe("'+1+2")
      expect(escapeCsvField('-5+10')).toBe("'-5+10")
      expect(escapeCsvField('@cmd')).toBe("'@cmd")
      expect(escapeCsvField('\ttabbed')).toBe("'\ttabbed")
      expect(escapeCsvField('   =cmd')).toBe("'   =cmd")
    })

    it('preserves standalone dash placeholder without quote prefixing', () => {
      expect(escapeCsvField('-')).toBe('-')
    })
  })

  describe('formatCsvDateVi', () => {
    it('returns empty or "-" for null/empty/invalid date', () => {
      expect(formatCsvDateVi(null)).toBe('-')
      expect(formatCsvDateVi(undefined)).toBe('-')
      expect(formatCsvDateVi('')).toBe('-')
      expect(formatCsvDateVi('invalid-date')).toBe('-')
    })

    it('formats UTC ISO date into accurate UTC+7 Vietnam date and time', () => {
      // 2026-08-22 03:30:00 UTC = 2026-08-22 10:30:00 VN Time (UTC+7)
      const formatted = formatCsvDateVi('2026-08-22T03:30:00.000Z')
      expect(formatted).toBe('22/08/2026 10:30')
    })
  })

  describe('generateClassSessionsCsv', () => {
    it('prepends UTF-8 BOM (\uFEFF) for Excel Vietnamese character support (SC-006)', () => {
      const csv = generateClassSessionsCsv([])
      expect(csv.startsWith('\uFEFF')).toBe(true)
    })

    it('includes required header columns according to spec: Tên học sinh, Game, Chủ đề, Điểm, Tổng câu, Ngày chơi', () => {
      const csv = generateClassSessionsCsv([])
      const lines = csv.replace('\uFEFF', '').split('\r\n')
      expect(lines[0]).toBe('Tên học sinh,Game,Chủ đề,Điểm,Tổng câu,Ngày chơi')
    })

    it('generates correct CSV rows for populated student sessions', () => {
      const mockRecords: CsvSessionRecord[] = [
        {
          studentName: 'Nguyễn Văn A',
          gameName: 'Luyện nghe tiếng Anh',
          topic: 'Động vật hoang dã',
          score: 9,
          totalQuestions: 10,
          completedAt: '2026-08-22T10:00:00.000Z',
        },
        {
          studentName: 'Trần Thị B, "Bé ngoan"',
          gameName: 'Thẻ từ vựng',
          topic: 'Trái cây',
          score: null,
          totalQuestions: 8,
          completedAt: '2026-08-22T11:00:00.000Z',
        },
      ]

      const csv = generateClassSessionsCsv(mockRecords)
      expect(csv.startsWith('\uFEFF')).toBe(true)

      const lines = csv.replace('\uFEFF', '').split('\r\n')
      expect(lines.length).toBe(3) // Header + 2 rows

      // Row 1
      expect(lines[1]).toContain('Nguyễn Văn A')
      expect(lines[1]).toContain('Luyện nghe tiếng Anh')
      expect(lines[1]).toContain('Động vật hoang dã')
      expect(lines[1]).toContain('9')
      expect(lines[1]).toContain('10')

      // Row 2 - escaping quotes and commas
      expect(lines[2]).toContain('"Trần Thị B, ""Bé ngoan"""')
      expect(lines[2]).toContain('Thẻ từ vựng')
      expect(lines[2]).toContain('Trái cây')
      expect(lines[2]).toContain('-') // null score rendered as '-'
      expect(lines[2]).toContain('8')
    })
  })
})

describe('Export CSV API Route Contract (GET /api/export-csv)', () => {
  let mockSupabase: {
    auth: { getUser: ReturnType<typeof vi.fn> }
    from: ReturnType<typeof vi.fn>
  }
  let mockUser: { id: string; email: string } | null

  beforeEach(() => {
    vi.clearAllMocks()

    mockUser = { id: 'teacher-1', email: 'teacher@gamehub.local' }

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn(),
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>)
  })

  it('returns 401 Unauthorized when teacher is not logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const request = new Request('http://localhost:3000/api/export-csv?classId=cls-1')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.error).toMatch(/unauthorized|đăng nhập/i)
  })

  it('returns 400 Bad Request when classId parameter is missing or blank', async () => {
    const request = new Request('http://localhost:3000/api/export-csv')
    const response = await GET(request)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toMatch(/classid|mã lớp/i)
  })

  it('returns 404 Not Found when class does not exist or does not belong to the teacher (FR-014)', async () => {
    // Classroom query returns PGRST116 (not found) or empty
    const classroomSingleMock = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'Class not found' },
    })
    const classroomEqTeacherMock = vi.fn().mockReturnValue({ single: classroomSingleMock })
    const classroomEqIdMock = vi.fn().mockReturnValue({ eq: classroomEqTeacherMock })
    const classroomSelectMock = vi.fn().mockReturnValue({ eq: classroomEqIdMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return { select: classroomSelectMock }
      }
      return {}
    })

    const request = new Request('http://localhost:3000/api/export-csv?classId=cls-other-teacher')
    const response = await GET(request)

    expect(response.status).toBe(404)
    expect(classroomSelectMock).toHaveBeenCalled()
    expect(classroomEqIdMock).toHaveBeenCalledWith('id', 'cls-other-teacher')
    expect(classroomEqTeacherMock).toHaveBeenCalledWith('teacher_id', 'teacher-1')
  })

  it('successfully exports CSV for class with correct headers, UTF-8 BOM, and filename', async () => {
    // 1. Mock classroom lookup
    const classroomSingleMock = vi.fn().mockResolvedValue({
      data: {
        id: 'cls-1',
        name: 'Lớp 1A - Họa Mi',
        code: 'ABC123',
        teacher_id: 'teacher-1',
      },
      error: null,
    })
    const classroomEqTeacherMock = vi.fn().mockReturnValue({ single: classroomSingleMock })
    const classroomEqIdMock = vi.fn().mockReturnValue({ eq: classroomEqTeacherMock })
    const classroomSelectMock = vi.fn().mockReturnValue({ eq: classroomEqIdMock })

    // 2. Mock game_sessions query
    const mockSessions = [
      {
        id: 'sess-1',
        student_id: 'st-1',
        game_type: 'listening',
        topic: 'animals',
        score: 10,
        total_questions: 10,
        completed_at: '2026-08-22T10:00:00.000Z',
        students: { id: 'st-1', name: 'Bé Lan', classroom_id: 'cls-1' },
      },
      {
        id: 'sess-2',
        student_id: 'st-2',
        game_type: 'spelling',
        topic: 'fruits',
        score: 8,
        total_questions: 10,
        completed_at: '2026-08-22T10:15:00.000Z',
        students: { id: 'st-2', name: 'Bé Minh', classroom_id: 'cls-1' },
      },
    ]

    const sessionsLimitMock = vi.fn().mockResolvedValue({
      data: mockSessions,
      error: null,
    })
    const sessionsOrderMock = vi.fn().mockReturnValue({ limit: sessionsLimitMock })
    const sessionsEqClassMock = vi.fn().mockReturnValue({ order: sessionsOrderMock })
    const sessionsSelectMock = vi.fn().mockReturnValue({ eq: sessionsEqClassMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return { select: classroomSelectMock }
      }
      if (table === 'game_sessions') {
        return { select: sessionsSelectMock }
      }
      return {}
    })

    const request = new Request('http://localhost:3000/api/export-csv?classId=cls-1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(response.headers.get('Content-Disposition')).toContain('attachment;')
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    expect(buffer[0]).toBe(0xEF)
    expect(buffer[1]).toBe(0xBB)
    expect(buffer[2]).toBe(0xBF)

    const csvContent = buffer.toString('utf-8')
    expect(csvContent).toContain('Tên học sinh,Game,Chủ đề,Điểm,Tổng câu,Ngày chơi')
    expect(csvContent).toContain('Bé Lan')
    expect(csvContent).toContain('Bé Minh')
    expect(csvContent).toContain('Luyện nghe')
    expect(csvContent).toContain('Đánh vần')
  })

  it('filters sessions by timeframe when timeframe parameter (7d, 30d) is passed', async () => {
    // Mock classroom
    const classroomSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'cls-1', code: 'ABC123', name: 'Lớp 1A', teacher_id: 'teacher-1' },
            error: null,
          }),
        }),
      }),
    })

    // Mock sessions with gte filter
    const sessionsLimitMock = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })
    const sessionsOrderMock = vi.fn().mockReturnValue({ limit: sessionsLimitMock })
    const sessionsGteMock = vi.fn().mockReturnValue({ order: sessionsOrderMock })
    const sessionsEqClassMock = vi.fn().mockReturnValue({ gte: sessionsGteMock })
    const sessionsSelectMock = vi.fn().mockReturnValue({ eq: sessionsEqClassMock })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classroomSelectMock }
      if (table === 'game_sessions') return { select: sessionsSelectMock }
      return {}
    })

    const request = new Request('http://localhost:3000/api/export-csv?classId=cls-1&timeframe=7d')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(sessionsGteMock).toHaveBeenCalledWith('completed_at', expect.any(String))
  })

  it('returns 500 when database error occurs while fetching sessions', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Mock classroom success
    const classroomSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'cls-1', code: 'ABC123', name: 'Lớp 1A', teacher_id: 'teacher-1' },
            error: null,
          }),
        }),
      }),
    })

    // Mock sessions query error
    const sessionsSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
          }),
        }),
      }),
    })

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'classrooms') return { select: classroomSelectMock }
      if (table === 'game_sessions') return { select: sessionsSelectMock }
      return {}
    })

    const request = new Request('http://localhost:3000/api/export-csv?classId=cls-1')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toMatch(/lỗi|error/i)
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
