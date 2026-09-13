import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getClassParentsListAction,
  createClassAnnouncementAction,
  deleteClassAnnouncementAction,
  regenerateStudentParentPinAction,
} from '@/app/actions/parent'
import * as serverSupabase from '@/lib/supabase/server'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Teacher Parent Management & Announcements Actions', () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
    from: ReturnType<typeof vi.fn>
  }
  let mockAdmin: {
    from: ReturnType<typeof vi.fn>
  }

  const mockTeacherUser = { id: 'teacher-user-1', email: 'teacher@test.com' }

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockTeacherUser },
          error: null,
        }),
      },
      from: vi.fn(),
    }

    mockAdmin = {
      from: vi.fn(),
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockAdmin as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  describe('getClassParentsListAction', () => {
    it('returns error if user is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const result = await getClassParentsListAction('class-1')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Bạn cần đăng nhập')
    })

    it('returns error if classroom does not belong to teacher', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      })

      const result = await getClassParentsListAction('class-1')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Không tìm thấy lớp học hoặc không có quyền truy cập')
    })

    it('returns list of student parent access info, creating missing ones automatically', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'class-1', name: 'Lớp 2A', code: 'LOP2A' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    { id: 'stud-1', name: 'Nguyễn Văn A', classroom_id: 'class-1' },
                    { id: 'stud-2', name: 'Trần Thị B', classroom_id: 'class-1' },
                  ],
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      // mockAdmin for student_parent_access query & insert
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'spa-1',
                    student_id: 'stud-1',
                    classroom_id: 'class-1',
                    access_pin: 'P-112233',
                    access_token: 'tok-112233',
                    parent_phone: '0912345678',
                    parent_name: 'Phụ huynh em A',
                    last_accessed_at: null,
                  },
                ],
                error: null,
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'spa-2',
                    student_id: 'stud-2',
                    classroom_id: 'class-1',
                    access_pin: 'P-445566',
                    access_token: 'tok-445566',
                    parent_phone: null,
                    parent_name: null,
                    last_accessed_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const result = await getClassParentsListAction('class-1')

      expect(result.success).toBe(true)
      expect(result.list).toHaveLength(2)
      expect(result.list?.[0].studentName).toBe('Nguyễn Văn A')
      expect(result.list?.[0].accessPin).toBe('P-112233')
      expect(result.list?.[1].studentName).toBe('Trần Thị B')
    })
  })

  describe('createClassAnnouncementAction', () => {
    it('creates announcement successfully for classroom', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'class-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'classroom_announcements') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'ann-1',
                    classroom_id: 'class-1',
                    teacher_id: 'teacher-user-1',
                    student_id: null,
                    title: 'Nhắc nhở ôn bài',
                    content: 'Kính mời phụ huynh nhắc các bé làm bài tập',
                    category: 'reminder',
                    priority: 'important',
                    created_at: '2026-09-13T10:00:00.000Z',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const result = await createClassAnnouncementAction({
        classroomId: 'class-1',
        title: 'Nhắc nhở ôn bài',
        content: 'Kính mời phụ huynh nhắc các bé làm bài tập',
        category: 'reminder',
        priority: 'important',
      })

      expect(result.success).toBe(true)
      expect(result.announcement?.title).toBe('Nhắc nhở ôn bài')
      expect(result.announcement?.category).toBe('reminder')
    })

    it('returns error if title or content is empty', async () => {
      const result = await createClassAnnouncementAction({
        classroomId: 'class-1',
        title: '',
        content: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Vui lòng nhập đầy đủ tiêu đề và nội dung')
    })
  })

  describe('deleteClassAnnouncementAction', () => {
    it('deletes announcement successfully', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classroom_announcements') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'ann-1', classroom_id: 'class-1', teacher_id: 'teacher-user-1' },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return {}
      })

      const res = await deleteClassAnnouncementAction('ann-1')
      expect(res.success).toBe(true)
    })
  })

  describe('regenerateStudentParentPinAction', () => {
    it('regenerates a new PIN and token for student parent access', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'class-1', name: 'Lớp 1A', code: 'LOP1A' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'stud-1', name: 'Bé Hùng', classroom_id: 'class-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        return {}
      })

      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'student_parent_access') {
          return {
            upsert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'spa-1',
                    student_id: 'stud-1',
                    classroom_id: 'class-1',
                    access_pin: 'P-998877',
                    access_token: 'tok-new-998877',
                    parent_phone: null,
                    parent_name: null,
                    last_accessed_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const res = await regenerateStudentParentPinAction('stud-1', 'class-1')
      expect(res.success).toBe(true)
      expect(res.accessInfo?.accessPin).toBe('P-998877')
      expect(res.accessInfo?.accessToken).toBe('tok-new-998877')
    })
  })
})
