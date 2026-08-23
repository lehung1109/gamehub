// tests/unit/actions/classes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createClassAction,
  getClassesAction,
  updateClassAction,
  deactivateClassAction,
  activateClassAction,
} from '@/app/actions/classes'
import * as serverSupabase from '@/lib/supabase/server'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Class Server Actions', () => {
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

  describe('createClassAction', () => {
    it('returns error if user is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      })

      const res = await createClassAction({ name: 'Lớp 1A' })
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('validates class name is non-empty', async () => {
      const res1 = await createClassAction({ name: '' })
      expect(res1.error).toMatch(/tên lớp/i)

      const res2 = await createClassAction({ name: '   ' })
      expect(res2.error).toMatch(/tên lớp/i)
    })

    it('validates class name max length of 200 chars', async () => {
      const longName = 'A'.repeat(201)
      const res = await createClassAction({ name: longName })
      expect(res.error).toMatch(/200 ký tự/i)
    })

    it('creates a new class with generated code and teacher_id', async () => {
      const mockClass = {
        id: 'cls-1',
        teacher_id: 'teacher-123',
        name: 'Lớp 1A - 2025',
        code: 'ABC123',
        is_active: true,
        created_at: new Date().toISOString(),
      }

      const singleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const insertMock = vi.fn().mockReturnValue({ select: selectMock })

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      })

      const res = await createClassAction({ name: 'Lớp 1A - 2025' })

      expect(res.data).toEqual(mockClass)
      expect(mockSupabase.from).toHaveBeenCalledWith('classrooms')
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          teacher_id: 'teacher-123',
          name: 'Lớp 1A - 2025',
          is_active: true,
          code: expect.stringMatching(/^[A-Z0-9]{6}$/),
        })
      )
    })

    it('returns database error if insert fails', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database constraint failed' },
      })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const insertMock = vi.fn().mockReturnValue({ select: selectMock })

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      })

      const res = await createClassAction({ name: 'Lớp 1A' })
      expect(res.error).toBe('Database constraint failed')
    })
  })

  describe('getClassesAction', () => {
    it('returns error if user is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      })

      const res = await getClassesAction()
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('fetches classes for current teacher with student count', async () => {
      const mockClasses = [
        {
          id: 'cls-1',
          teacher_id: 'teacher-123',
          name: 'Lớp 1A',
          code: 'ABC123',
          is_active: true,
          created_at: '2026-08-22T00:00:00Z',
          students: [{ count: 12 }],
        },
      ]

      const orderMock = vi.fn().mockResolvedValue({ data: mockClasses, error: null })
      const eqMock = vi.fn().mockReturnValue({ order: orderMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

      mockSupabase.from.mockReturnValue({
        select: selectMock,
      })

      const res = await getClassesAction()

      expect(res.data).toBeDefined()
      expect(res.data?.[0].name).toBe('Lớp 1A')
      expect(res.data?.[0].student_count).toBe(12)
    })
  })

  describe('updateClassAction', () => {
    it('returns error if unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      })

      const res = await updateClassAction('cls-1', { name: 'New Name' })
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('validates name if provided', async () => {
      const res = await updateClassAction('cls-1', { name: '' })
      expect(res.error).toMatch(/tên lớp/i)
    })

    it('updates class name and active status correctly', async () => {
      const updatedClass = {
        id: 'cls-1',
        teacher_id: 'teacher-123',
        name: 'Lớp 1B Mới',
        code: 'ABC123',
        is_active: false,
        created_at: '2026-08-22T00:00:00Z',
      }

      const singleMock = vi.fn().mockResolvedValue({ data: updatedClass, error: null })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const eqTeacherMock = vi.fn().mockReturnValue({ select: selectMock })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTeacherMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })

      mockSupabase.from.mockReturnValue({
        update: updateMock,
      })

      const res = await updateClassAction('cls-1', {
        name: 'Lớp 1B Mới',
        is_active: false,
      })

      expect(res.data).toEqual(updatedClass)
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Lớp 1B Mới',
          is_active: false,
        })
      )
    })
  })

  describe('deactivateClassAction & activateClassAction', () => {
    it('deactivates class by setting is_active to false', async () => {
      const updatedClass = {
        id: 'cls-1',
        teacher_id: 'teacher-123',
        name: 'Lớp 1A',
        code: 'ABC123',
        is_active: false,
      }

      const singleMock = vi.fn().mockResolvedValue({ data: updatedClass, error: null })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const eqTeacherMock = vi.fn().mockReturnValue({ select: selectMock })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTeacherMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })

      mockSupabase.from.mockReturnValue({
        update: updateMock,
      })

      const res = await deactivateClassAction('cls-1')
      expect(res.data?.is_active).toBe(false)
    })

    it('activates class by setting is_active to true', async () => {
      const updatedClass = {
        id: 'cls-1',
        teacher_id: 'teacher-123',
        name: 'Lớp 1A',
        code: 'ABC123',
        is_active: true,
      }

      const singleMock = vi.fn().mockResolvedValue({ data: updatedClass, error: null })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const eqTeacherMock = vi.fn().mockReturnValue({ select: selectMock })
      const eqIdMock = vi.fn().mockReturnValue({ eq: eqTeacherMock })
      const updateMock = vi.fn().mockReturnValue({ eq: eqIdMock })

      mockSupabase.from.mockReturnValue({
        update: updateMock,
      })

      const res = await activateClassAction('cls-1')
      expect(res.data?.is_active).toBe(true)
    })
  })
})
