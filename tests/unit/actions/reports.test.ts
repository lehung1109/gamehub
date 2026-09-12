// tests/unit/actions/reports.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getStudentDetailedReportAction,
  issueStudentCertificateAction,
  verifyCertificateAction,
} from '@/app/actions/reports'
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

describe('Student Progress Reports & Certificate Actions', () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
    from: ReturnType<typeof vi.fn>
  }
  let mockAdminSupabase: {
    from: ReturnType<typeof vi.fn>
  }
  const mockTeacher = { id: 'teacher-101', email: 'teacher@test.com' }

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockTeacher }, error: null }),
      },
      from: vi.fn(),
    }

    mockAdminSupabase = {
      from: vi.fn(),
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockAdminSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  describe('issueStudentCertificateAction', () => {
    it('creates and returns a new certificate with unique verification code', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'cert-1',
              student_id: 'student-1',
              classroom_id: 'class-1',
              certificate_type: 'vocab_master',
              title: 'Chiến Binh Từ Vựng Xuất Sắc',
              recipient_name: 'Bé Lan',
              achievement_text: 'Thành thạo 100 từ vựng',
              teacher_name: 'Cô Mai',
              teacher_note: 'Rất chăm chỉ',
              verification_code: 'GH-CERT-ABC123',
              issued_at: '2026-09-12T20:00:00Z',
              created_at: '2026-09-12T20:00:00Z',
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'student_certificates') {
          return { insert: mockInsert }
        }
        return {}
      })

      const res = await issueStudentCertificateAction({
        studentId: 'student-1',
        classroomId: 'class-1',
        certificateType: 'vocab_master',
        title: 'Chiến Binh Từ Vựng Xuất Sắc',
        recipientName: 'Bé Lan',
        achievementText: 'Thành thạo 100 từ vựng',
        teacherName: 'Cô Mai',
        teacherNote: 'Rất chăm chỉ',
      })

      expect(res.success).toBe(true)
      expect(res.certificate?.id).toBe('cert-1')
      expect(res.certificate?.verificationCode).toBe('GH-CERT-ABC123')
      expect(mockInsert).toHaveBeenCalled()
    })

    it('rejects issuance when teacher is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

      const res = await issueStudentCertificateAction({
        studentId: 'student-1',
        classroomId: 'class-1',
        certificateType: 'vocab_master',
        title: 'Chiến Binh Từ Vựng Xuất Sắc',
        recipientName: 'Bé Lan',
        achievementText: 'Thành thạo 100 từ vựng',
        teacherName: 'Cô Mai',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })
  })

  describe('verifyCertificateAction', () => {
    it('returns certificate details and validity when code exists', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'cert-1',
          student_id: 'student-1',
          classroom_id: 'class-1',
          certificate_type: 'vocab_master',
          title: 'Chiến Binh Từ Vựng Xuất Sắc',
          recipient_name: 'Bé Lan',
          achievement_text: 'Thành thạo 100 từ vựng',
          teacher_name: 'Cô Mai',
          teacher_note: null,
          verification_code: 'GH-CERT-ABC123',
          issued_at: '2026-09-12T20:00:00Z',
          created_at: '2026-09-12T20:00:00Z',
          classrooms: { name: 'Lớp 3A' },
        },
        error: null,
      })

      mockAdminSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      })

      const res = await verifyCertificateAction('GH-CERT-ABC123')
      expect(res.success).toBe(true)
      expect(res.isValid).toBe(true)
      expect(res.certificate?.recipientName).toBe('Bé Lan')
      expect(res.classroomName).toBe('Lớp 3A')
    })

    it('returns invalid status when code is not found', async () => {
      mockAdminSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      })

      const res = await verifyCertificateAction('GH-CERT-INVALID')
      expect(res.success).toBe(false)
      expect(res.isValid).toBe(false)
    })
  })

  describe('getStudentDetailedReportAction', () => {
    it('aggregates sessions, streak, SRS deck, and certificates into a detailed report', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'students') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'student-1', name: 'Bé Lan', classroom_id: 'class-1' },
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
                single: vi.fn().mockResolvedValue({
                  data: { id: 'class-1', name: 'Lớp 3A', code: 'CLASS3A' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'game_sessions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [
                  { game_type: 'vocab', score: 10, total_questions: 10 },
                  { game_type: 'grammar-detective', score: 8, total_questions: 10 },
                ],
                error: null,
              }),
            }),
          }
        }
        if (table === 'student_gamification') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    streak_state: { currentStreak: 5, longestStreak: 7, totalActiveDays: 10 },
                    inventory: { equippedFrameId: 'gold_frame', equippedTitleId: 'vocab_champ' },
                    srs_deck: [
                      { prompt: 'apple', correctAnswer: 'quả táo', box: 4 },
                      { prompt: 'banana', correctAnswer: 'quả chuối', box: 2, mistakeCount: 3 },
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
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }
        }
        return {}
      })

      const res = await getStudentDetailedReportAction('class-1', 'student-1')
      expect(res.success).toBe(true)
      expect(res.report).toBeDefined()
      expect(res.report?.studentName).toBe('Bé Lan')
      expect(res.report?.classroomName).toBe('Lớp 3A')
      expect(res.report?.currentStreak).toBe(5)
      expect(res.report?.skills.length).toBeGreaterThan(0)
      expect(res.report?.srsMetrics.totalCards).toBe(2)
      expect(res.report?.automatedTeacherRemark).toBeDefined()
    })
  })
})
