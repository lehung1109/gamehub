import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createAssignment,
  getClassAssignments,
  getStudentAssignments,
  deleteAssignment,
} from '@/app/actions/assignments'
import * as adminSupabase from '@/lib/supabase/admin'
import * as serverSupabase from '@/lib/supabase/server'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

function createMockQueryBuilder(data: unknown = null, error: unknown = null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data, error })),
    then: <TResult1 = { data: unknown; error: unknown }, TResult2 = never>(
      onfulfilled?: ((value: { data: unknown; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) => Promise.resolve({ data, error }).then(onfulfilled, onrejected),
  }
  return builder
}

describe('Assignments Server Actions', () => {
  let mockSupabase: { from: ReturnType<typeof vi.fn> }
  let mockServerSupabase: { auth: { getUser: ReturnType<typeof vi.fn> } }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
    mockServerSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'teacher-123', email: 'teacher@example.com' } },
          error: null,
        }),
      },
    }
    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockServerSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
  })

  describe('createAssignment', () => {
    it('rejects invalid input (missing title, invalid dueDate, missing classroomId, title too long)', async () => {
      // Missing classroomId
      const resMissingClass = await createAssignment({
        classroomId: '',
        title: 'Bài tập 1',
        gameType: 'match-pairs',
        dueDate: '2026-10-01T23:59:59Z',
      })
      expect(resMissingClass.success).toBe(false)
      expect(resMissingClass.error).toMatch(/lớp học/i)

      // Missing title
      const resMissingTitle = await createAssignment({
        classroomId: 'cls-1',
        title: '   ',
        gameType: 'match-pairs',
        dueDate: '2026-10-01T23:59:59Z',
      })
      expect(resMissingTitle.success).toBe(false)
      expect(resMissingTitle.error).toMatch(/tiêu đề/i)

      // Title exceeding 200 characters
      const resLongTitle = await createAssignment({
        classroomId: 'cls-1',
        title: 'A'.repeat(201),
        gameType: 'match-pairs',
        dueDate: '2026-10-01T23:59:59Z',
      })
      expect(resLongTitle.success).toBe(false)
      expect(resLongTitle.error).toMatch(/200 ký tự/i)

      // Missing gameType
      const resMissingGameType = await createAssignment({
        classroomId: 'cls-1',
        title: 'Bài tập 1',
        gameType: '',
        dueDate: '2026-10-01T23:59:59Z',
      })
      expect(resMissingGameType.success).toBe(false)
      expect(resMissingGameType.error).toMatch(/trò chơi/i)

      // Invalid dueDate
      const resInvalidDueDate = await createAssignment({
        classroomId: 'cls-1',
        title: 'Bài tập 1',
        gameType: 'match-pairs',
        dueDate: 'not-a-date',
      })
      expect(resInvalidDueDate.success).toBe(false)
      expect(resInvalidDueDate.error).toMatch(/hạn nộp/i)
    })

    it('rejects if teacher is not authenticated', async () => {
      mockServerSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const res = await createAssignment({
        classroomId: 'cls-1',
        title: 'Bài tập 1',
        gameType: 'match-pairs',
        dueDate: '2026-12-31T23:59:59.000Z',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('rejects if teacher does not own the classroom', async () => {
      const classroomBuilder = createMockQueryBuilder(null, { message: 'Not found' })
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        return createMockQueryBuilder(null)
      })

      const res = await createAssignment({
        classroomId: 'cls-unowned',
        title: 'Bài tập 1',
        gameType: 'match-pairs',
        dueDate: '2026-12-31T23:59:59.000Z',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không có quyền/i)
    })

    it('succeeds with valid input', async () => {
      const mockCreatedAssignment = {
        id: 'asg-1',
        classroom_id: 'cls-1',
        title: 'Luyện tập từ vựng',
        description: 'Hoàn thành 80 điểm',
        game_type: 'match-pairs',
        topic: 'Animals',
        config_id: null,
        target_score: 80,
        due_date: '2026-12-31T23:59:59.000Z',
        is_active: true,
        created_at: '2026-09-11T10:00:00.000Z',
      }

      const classroomBuilder = createMockQueryBuilder({ id: 'cls-1', teacher_id: 'teacher-123' }, null)
      const assignmentBuilder = createMockQueryBuilder(mockCreatedAssignment, null)
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'assignments') return assignmentBuilder
        return createMockQueryBuilder(null)
      })

      const res = await createAssignment({
        classroomId: 'cls-1',
        title: 'Luyện tập từ vựng',
        description: 'Hoàn thành 80 điểm',
        gameType: 'match-pairs',
        topic: 'Animals',
        targetScore: 80,
        dueDate: '2026-12-31T23:59:59.000Z',
      })

      expect(res.success).toBe(true)
      expect(res.data).toEqual(mockCreatedAssignment)
      expect(mockSupabase.from).toHaveBeenCalledWith('assignments')
      expect(assignmentBuilder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          classroom_id: 'cls-1',
          title: 'Luyện tập từ vựng',
          game_type: 'match-pairs',
          topic: 'Animals',
          target_score: 80,
          is_active: true,
        })
      )
    })
  })

  describe('getClassAssignments', () => {
    it('rejects if teacher is not authenticated', async () => {
      mockServerSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const res = await getClassAssignments('cls-1')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('rejects if teacher does not own classroom', async () => {
      const classroomBuilder = createMockQueryBuilder(null, { message: 'Not found' })
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getClassAssignments('cls-unowned')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không có quyền/i)
    })

    it('returns assignments with progress counts', async () => {
      const mockAssignments = [
        {
          id: 'asg-1',
          classroom_id: 'cls-1',
          title: 'Bài tập 1: Match Pairs',
          game_type: 'match-pairs',
          topic: 'Animals',
          config_id: null,
          target_score: 50,
          due_date: '2026-12-31T23:59:59.000Z',
          is_active: true,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'asg-2',
          classroom_id: 'cls-1',
          title: 'Bài tập 2: Memory Game',
          game_type: 'memory',
          topic: 'Colors',
          config_id: null,
          target_score: 100,
          due_date: '2026-12-31T23:59:59.000Z',
          is_active: true,
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ]

      const mockStudents = [{ id: 'std-1' }, { id: 'std-2' }, { id: 'std-3' }]

      const mockSessions = [
        {
          student_id: 'std-1',
          game_type: 'match-pairs',
          topic: 'Animals',
          score: 60,
          config_id: null,
        },
        {
          student_id: 'std-2',
          game_type: 'match-pairs',
          topic: 'Animals',
          score: 40, // Below target 50
          config_id: null,
        },
        {
          student_id: 'std-3',
          game_type: 'match-pairs',
          topic: 'Animals',
          score: 80,
          config_id: null,
        },
        {
          student_id: 'std-2',
          game_type: 'memory',
          topic: 'Colors',
          score: 100,
          config_id: null,
        },
      ]

      const classroomBuilder = createMockQueryBuilder({ id: 'cls-1', teacher_id: 'teacher-123' }, null)
      const assignmentsBuilder = createMockQueryBuilder(mockAssignments, null)
      const studentsBuilder = createMockQueryBuilder(mockStudents, null)
      const sessionsBuilder = createMockQueryBuilder(mockSessions, null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'assignments') return assignmentsBuilder
        if (table === 'students') return studentsBuilder
        if (table === 'game_sessions') return sessionsBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getClassAssignments('cls-1')

      expect(res.success).toBe(true)
      expect(res.data).toHaveLength(2)

      // asg-1 completed by std-1 (60 >= 50) and std-3 (80 >= 50). std-2 scored 40 (< 50).
      expect(res.data?.[0]).toMatchObject({
        id: 'asg-1',
        completedCount: 2,
        totalStudentsCount: 3,
      })

      // asg-2 completed by std-2 (100 >= 100).
      expect(res.data?.[1]).toMatchObject({
        id: 'asg-2',
        completedCount: 1,
        totalStudentsCount: 3,
      })
    })

    it('handles empty classroom with 0 students and 0 assignments', async () => {
      const classroomBuilder = createMockQueryBuilder({ id: 'cls-empty', teacher_id: 'teacher-123' }, null)
      const assignmentsBuilder = createMockQueryBuilder([], null)
      const studentsBuilder = createMockQueryBuilder([], null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'assignments') return assignmentsBuilder
        if (table === 'students') return studentsBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getClassAssignments('cls-empty')
      expect(res.success).toBe(true)
      expect(res.data).toEqual([])
    })

    it('does not count pre-existing sessions from before assignment creation towards completedCount', async () => {
      const mockAssignments = [
        {
          id: 'asg-today',
          classroom_id: 'cls-1',
          title: 'Bài tập mới',
          game_type: 'match-pairs',
          topic: 'Animals',
          config_id: null,
          target_score: 50,
          due_date: '2026-12-31T23:59:59.000Z',
          is_active: true,
          created_at: '2026-09-11T12:00:00.000Z',
        },
      ]
      const mockStudents = [{ id: 'std-1' }]
      const mockSessions = [
        {
          student_id: 'std-1',
          game_type: 'match-pairs',
          topic: 'Animals',
          score: 100,
          config_id: null,
          started_at: '2026-09-01T08:00:00.000Z',
          completed_at: '2026-09-01T08:05:00.000Z',
        },
      ]

      const classroomBuilder = createMockQueryBuilder({ id: 'cls-1', teacher_id: 'teacher-123' }, null)
      const assignmentsBuilder = createMockQueryBuilder(mockAssignments, null)
      const studentsBuilder = createMockQueryBuilder(mockStudents, null)
      const sessionsBuilder = createMockQueryBuilder(mockSessions, null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'assignments') return assignmentsBuilder
        if (table === 'students') return studentsBuilder
        if (table === 'game_sessions') return sessionsBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getClassAssignments('cls-1')
      expect(res.success).toBe(true)
      expect(res.data?.[0].completedCount).toBe(0)
    })
  })

  describe('getStudentAssignments', () => {
    it("computes 'completed', 'pending', and 'overdue' statuses correctly", async () => {
      const futureDate = new Date(Date.now() + 86400000 * 2).toISOString()
      const pastDate = new Date(Date.now() - 86400000 * 2).toISOString()

      const mockClassroom = { id: 'cls-1', is_active: true }
      const mockStudent = [{ id: 'std-1', name: 'Bé Linh' }]

      const mockAssignments = [
        {
          id: 'asg-completed',
          classroom_id: 'cls-1',
          title: 'Bài tập 1 (Đã hoàn thành)',
          game_type: 'match-pairs',
          topic: 'Animals',
          config_id: null,
          target_score: 50,
          due_date: futureDate,
          is_active: true,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'asg-pending',
          classroom_id: 'cls-1',
          title: 'Bài tập 2 (Chưa làm, còn hạn)',
          game_type: 'word-scramble',
          topic: 'Food',
          config_id: null,
          target_score: 80,
          due_date: futureDate,
          is_active: true,
          created_at: '2026-09-01T00:00:00.000Z',
        },
        {
          id: 'asg-overdue',
          classroom_id: 'cls-1',
          title: 'Bài tập 3 (Quá hạn)',
          game_type: 'flashcards',
          topic: 'Math',
          config_id: null,
          target_score: 70,
          due_date: pastDate,
          is_active: true,
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ]

      const mockSessions = [
        {
          id: 'sess-1',
          student_id: 'std-1',
          game_type: 'match-pairs',
          topic: 'Animals',
          score: 85,
          config_id: null,
          completed_at: '2026-09-10T12:00:00.000Z',
        },
        {
          id: 'sess-2',
          student_id: 'std-1',
          game_type: 'flashcards',
          topic: 'Math',
          score: 30, // < 70
          config_id: null,
          completed_at: '2026-09-08T12:00:00.000Z',
        },
      ]

      const classroomBuilder = createMockQueryBuilder(mockClassroom, null)
      const studentBuilder = createMockQueryBuilder(mockStudent, null)
      const assignmentsBuilder = createMockQueryBuilder(mockAssignments, null)
      const sessionsBuilder = createMockQueryBuilder(mockSessions, null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'students') return studentBuilder
        if (table === 'assignments') return assignmentsBuilder
        if (table === 'game_sessions') return sessionsBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getStudentAssignments('ABC123', 'Bé Linh')

      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      const items = res.data!
      expect(items).toHaveLength(3)

      const completed = items.find((i) => i.id === 'asg-completed')
      expect(completed?.status).toBe('completed')
      expect(completed?.studentScore).toBe(85)
      expect(completed?.completedAt).toBe('2026-09-10T12:00:00.000Z')

      const pending = items.find((i) => i.id === 'asg-pending')
      expect(pending?.status).toBe('pending')

      const overdue = items.find((i) => i.id === 'asg-overdue')
      expect(overdue?.status).toBe('overdue')
      expect(overdue?.studentScore).toBe(30)
    })

    it('does not count game sessions that took place before the assignment was created', async () => {
      const mockClassroom = { id: 'cls-1', code: 'ABC123', is_active: true }
      const mockStudent = [{ id: 'std-1', name: 'Bé Linh' }]
      const mockAssignments = [
        {
          id: 'asg-new',
          classroom_id: 'cls-1',
          title: 'Bài tập mới giao hôm nay',
          game_type: 'spelling',
          topic: 'Animals',
          config_id: null,
          target_score: 80,
          due_date: '2026-12-31T23:59:59.000Z',
          is_active: true,
          created_at: '2026-09-11T10:00:00.000Z',
        },
      ]

      const mockSessions = [
        {
          id: 'sess-ancient',
          game_type: 'spelling',
          topic: 'Animals',
          score: 100, // Perfect score, but from 10 days ago!
          config_id: null,
          started_at: '2026-09-01T10:00:00.000Z',
          completed_at: '2026-09-01T10:05:00.000Z',
        },
      ]

      const classroomBuilder = createMockQueryBuilder(mockClassroom, null)
      const studentBuilder = createMockQueryBuilder(mockStudent, null)
      const assignmentsBuilder = createMockQueryBuilder(mockAssignments, null)
      const sessionsBuilder = createMockQueryBuilder(mockSessions, null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'students') return studentBuilder
        if (table === 'assignments') return assignmentsBuilder
        if (table === 'game_sessions') return sessionsBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getStudentAssignments('ABC123', 'Bé Linh')
      expect(res.success).toBe(true)
      expect(res.data).toHaveLength(1)
      expect(res.data?.[0].status).toBe('pending')
      expect(res.data?.[0].completedAt).toBeUndefined()
    })

    it('fails if classroom does not exist or is inactive', async () => {
      const classroomBuilder = createMockQueryBuilder(null, { message: 'Not found' })
      mockSupabase.from.mockReturnValue(classroomBuilder)

      const res = await getStudentAssignments('WRONG1', 'Bé Linh')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/lớp học/i)
    })

    it('safely handles NaN and non-numeric scores without propagating NaN', async () => {
      const mockClassroom = { id: 'cls-1', code: 'ABC123', is_active: true }
      const mockStudent = [{ id: 'std-1', name: 'Bé Linh' }]
      const mockAssignments = [
        {
          id: 'asg-1',
          classroom_id: 'cls-1',
          title: 'Bài tập 1',
          game_type: 'match-pairs',
          topic: '',
          config_id: null,
          target_score: 50,
          due_date: new Date(Date.now() + 86400000).toISOString(),
          is_active: true,
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ]

      const mockSessions = [
        {
          id: 'sess-nan',
          student_id: 'std-1',
          game_type: 'match-pairs',
          topic: '',
          score: NaN,
          config_id: null,
          completed_at: '2026-09-10T12:00:00.000Z',
        },
        {
          id: 'sess-valid',
          student_id: 'std-1',
          game_type: 'match-pairs',
          topic: '',
          score: 80,
          config_id: null,
          completed_at: '2026-09-11T12:00:00.000Z',
        },
      ]

      const classroomBuilder = createMockQueryBuilder(mockClassroom, null)
      const studentBuilder = createMockQueryBuilder(mockStudent, null)
      const assignmentsBuilder = createMockQueryBuilder(mockAssignments, null)
      const sessionsBuilder = createMockQueryBuilder(mockSessions, null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'students') return studentBuilder
        if (table === 'assignments') return assignmentsBuilder
        if (table === 'game_sessions') return sessionsBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getStudentAssignments('ABC123', 'Bé Linh')
      expect(res.success).toBe(true)
      expect(res.data?.[0].studentScore).toBe(80)
      expect(isNaN(res.data?.[0].studentScore as number)).toBe(false)
      expect(res.data?.[0].status).toBe('completed')
    })

    it('picks the latest completedAt among multiple qualifying sessions regardless of array order', async () => {
      const mockClassroom = { id: 'cls-1', code: 'ABC123', is_active: true }
      const mockStudent = [{ id: 'std-1', name: 'Bé Linh' }]
      const mockAssignments = [
        {
          id: 'asg-1',
          classroom_id: 'cls-1',
          title: 'Bài tập 1',
          game_type: 'match-pairs',
          topic: '',
          config_id: null,
          target_score: 50,
          due_date: new Date(Date.now() + 86400000).toISOString(),
          is_active: true,
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ]

      // Sessions in arbitrary order: older session is second in array
      const mockSessions = [
        {
          id: 'sess-newer',
          student_id: 'std-1',
          game_type: 'match-pairs',
          topic: '',
          score: 90,
          config_id: null,
          completed_at: '2026-09-12T10:00:00.000Z',
        },
        {
          id: 'sess-older',
          student_id: 'std-1',
          game_type: 'match-pairs',
          topic: '',
          score: 70,
          config_id: null,
          completed_at: '2026-09-10T10:00:00.000Z',
        },
      ]

      const classroomBuilder = createMockQueryBuilder(mockClassroom, null)
      const studentBuilder = createMockQueryBuilder(mockStudent, null)
      const assignmentsBuilder = createMockQueryBuilder(mockAssignments, null)
      const sessionsBuilder = createMockQueryBuilder(mockSessions, null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return classroomBuilder
        if (table === 'students') return studentBuilder
        if (table === 'assignments') return assignmentsBuilder
        if (table === 'game_sessions') return sessionsBuilder
        return createMockQueryBuilder(null)
      })

      const res = await getStudentAssignments('ABC123', 'Bé Linh')
      expect(res.success).toBe(true)
      expect(res.data?.[0].completedAt).toBe('2026-09-12T10:00:00.000Z')
    })
  })

  describe('deleteAssignment', () => {
    it('rejects if teacher is not authenticated', async () => {
      mockServerSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      const res = await deleteAssignment('asg-1')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('rejects if assignment is not found', async () => {
      const assignmentBuilder = createMockQueryBuilder(null, { message: 'Not found' })
      mockSupabase.from.mockReturnValue(assignmentBuilder)

      const res = await deleteAssignment('asg-missing')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không tìm thấy/i)
    })

    it('rejects if teacher does not own the assignment classroom', async () => {
      const assignmentBuilder = createMockQueryBuilder({ id: 'asg-1', classroom_id: 'cls-unowned' }, null)
      const classroomBuilder = createMockQueryBuilder(null, { message: 'Not owned' })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'assignments') return assignmentBuilder
        if (table === 'classrooms') return classroomBuilder
        return createMockQueryBuilder(null)
      })

      const res = await deleteAssignment('asg-1')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không có quyền/i)
    })

    it('removes/deactivates assignment successfully when teacher is verified', async () => {
      const assignmentBuilder = createMockQueryBuilder({ id: 'asg-1', classroom_id: 'cls-1', is_active: false }, null)
      const classroomBuilder = createMockQueryBuilder({ id: 'cls-1', teacher_id: 'teacher-123' }, null)

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'assignments') return assignmentBuilder
        if (table === 'classrooms') return classroomBuilder
        return createMockQueryBuilder(null)
      })

      const res = await deleteAssignment('asg-1')
      expect(res.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('assignments')
      expect(assignmentBuilder.update).toHaveBeenCalledWith({ is_active: false })
      expect(assignmentBuilder.eq).toHaveBeenCalledWith('id', 'asg-1')
    })

    it('rejects empty assignmentId', async () => {
      const res = await deleteAssignment('')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/bài tập/i)
    })
  })
})
