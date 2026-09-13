import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  verifyParentAccessAction,
  getParentStudentDashboardAction,
  acknowledgeAnnouncementAction,
} from '@/app/actions/parent'
import * as adminSupabase from '@/lib/supabase/admin'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Parent Portal Server Actions', () => {
  let mockAdmin: {
    from: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockAdmin = {
      from: vi.fn(),
    }

    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockAdmin as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  describe('verifyParentAccessAction', () => {
    it('verifies access via valid token directly', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'spa-1',
                    student_id: 'stud-1',
                    access_token: 'valid-token-123',
                    access_pin: 'P-987654',
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return {}
      })

      const result = await verifyParentAccessAction({ token: 'valid-token-123' })
      expect(result.success).toBe(true)
      expect(result.token).toBe('valid-token-123')
    })

    it('returns error when token does not exist', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const result = await verifyParentAccessAction({ token: 'unknown-token' })
      expect(result.success).toBe(false)
      expect(result.error).toContain('Mã liên kết phụ huynh không tồn tại')
    })

    it('verifies access via classCode + studentName + accessPin', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'class-1', name: 'Lớp 3A', is_active: true },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'stud-1', name: 'Bé An', classroom_id: 'class-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'spa-1',
                    student_id: 'stud-1',
                    access_token: 'token-abc',
                    access_pin: 'P-123456',
                  },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }
        }
        return {}
      })

      const result = await verifyParentAccessAction({
        classCode: 'ABC123',
        studentName: 'Bé An',
        accessPin: 'P-123456',
      })

      expect(result.success).toBe(true)
      expect(result.token).toBe('token-abc')
    })

    it('returns error when classroom is inactive or missing', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const res = await verifyParentAccessAction({
        classCode: 'INACTIVE',
        studentName: 'Bé An',
        accessPin: 'P-123456',
      })
      expect(res.success).toBe(false)
      expect(res.error).toContain('Mã lớp không tồn tại hoặc không hoạt động')
    })

    it('returns error when student is not found in classroom', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'class-1', is_active: true },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockReturnValue({
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

      const res = await verifyParentAccessAction({
        classCode: 'CLASS1',
        studentName: 'Unknown Student',
        accessPin: 'P-123456',
      })
      expect(res.success).toBe(false)
      expect(res.error).toContain('Không tìm thấy học sinh trong lớp')
    })

    it('returns error when PIN does not match', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'class-1', name: 'Lớp 3A', is_active: true },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                ilike: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: 'stud-1', name: 'Bé An', classroom_id: 'class-1' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'spa-1',
                    student_id: 'stud-1',
                    access_token: 'token-abc',
                    access_pin: 'P-999999',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const result = await verifyParentAccessAction({
        classCode: 'ABC123',
        studentName: 'Bé An',
        accessPin: 'P-123456',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Mã bảo mật phụ huynh (PIN) không chính xác')
    })
  })

  describe('getParentStudentDashboardAction', () => {
    it('aggregates and returns student dashboard data including digest and announcements', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'spa-1',
                    student_id: 'stud-1',
                    classroom_id: 'class-1',
                    access_token: 'tok-1',
                    access_pin: 'P-111111',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'stud-1',
                    name: 'Bé Linh',
                    classroom_id: 'class-1',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'class-1',
                    name: 'Lớp 4B',
                    code: 'CLASS4B',
                    teacher_id: 'teacher-1',
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { display_name: 'Thầy Tuấn' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'game_sessions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: 'sess-1',
                      game_type: 'vocab',
                      score: 90,
                      total_questions: 10,
                      started_at: new Date(Date.now() - 300000).toISOString(),
                      completed_at: new Date().toISOString(),
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'student_gamification') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    streak_state: {
                      currentStreak: 6,
                      longestStreak: 10,
                      freezeCount: 1,
                    },
                    srs_deck: [
                      { box: 4 },
                      { box: 5 },
                      { box: 1 },
                    ],
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'student_certificates') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'cert-1',
                        title: 'Chiến Binh Từ Vựng',
                        certificate_type: 'vocab_master',
                        issued_at: new Date().toISOString(),
                        verification_code: 'GH-CERT-112233',
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'classroom_announcements') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                or: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'ann-1',
                        classroom_id: 'class-1',
                        teacher_id: 'teacher-1',
                        student_id: null,
                        title: 'Thông báo tuần mới',
                        content: 'Tuần này các bé luyện nghe nhé!',
                        category: 'announcement',
                        priority: 'normal',
                        created_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'announcement_acknowledgments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const result = await getParentStudentDashboardAction('tok-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.student.name).toBe('Bé Linh')
      expect(result.data?.student.teacherName).toBe('Thầy Tuấn')
      expect(result.data?.digest.streakDays).toBe(6)
      expect(result.data?.announcements).toHaveLength(1)
      expect(result.data?.announcements[0].acknowledged).toBe(false)
    })

    it('returns error when parent token is invalid or missing', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      const res = await getParentStudentDashboardAction('invalid-tok')
      expect(res.success).toBe(false)
      expect(res.error).toContain('Liên kết phụ huynh không tồn tại')
    })

    it('marks announcement as acknowledged if already acknowledged by student', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'student_parent_access') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'spa-1', student_id: 'stud-1', classroom_id: 'class-1', access_token: 'tok-1' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'stud-1', name: 'Bé Linh', classroom_id: 'class-1' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'classrooms') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: 'class-1', name: 'Lớp 4B', code: 'CLASS4B', teacher_id: 'teacher-1' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: { display_name: 'Thầy Tuấn' }, error: null }),
              }),
            }),
          }
        }
        if (table === 'game_sessions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }
        }
        if (table === 'student_gamification') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }
        }
        if (table === 'student_certificates') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
              }),
            }),
          }
        }
        if (table === 'classroom_announcements') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                or: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'ann-99',
                        classroom_id: 'class-1',
                        teacher_id: 'teacher-1',
                        student_id: null,
                        title: 'Test',
                        content: 'Test',
                        category: 'announcement',
                        priority: 'normal',
                        created_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'announcement_acknowledgments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [{ announcement_id: 'ann-99' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const res = await getParentStudentDashboardAction('tok-1')
      expect(res.success).toBe(true)
      expect(res.data?.announcements[0].acknowledged).toBe(true)
    })
  })

  describe('acknowledgeAnnouncementAction', () => {
    it('creates or updates announcement acknowledgment', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'announcement_acknowledgments') {
          return {
            upsert: vi.fn().mockResolvedValue({ error: null }),
          }
        }
        return {}
      })

      const res = await acknowledgeAnnouncementAction('ann-1', 'stud-1', 'Mẹ Linh')
      expect(res.success).toBe(true)
    })

    it('returns error when parameters are missing', async () => {
      const res = await acknowledgeAnnouncementAction('', '')
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })
  })
})
