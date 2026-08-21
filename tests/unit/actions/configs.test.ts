// tests/unit/actions/configs.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CreateConfigInput, UpdateConfigInput } from '@/types/config'

const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockRevalidatePath = vi.fn()

const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
  delete: mockDelete,
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

describe('Configs Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createConfig', () => {
    it('returns error when input is invalid or null', async () => {
      const { createConfig } = await import('@/app/actions/configs')
      const result = await createConfig(null as unknown as CreateConfigInput)
      expect(result).toEqual({ error: 'Dữ liệu đầu vào không hợp lệ' })
    })

    it('returns error when user is unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const { createConfig } = await import('@/app/actions/configs')

      const input: CreateConfigInput = {
        gameId: 'flashcard',
        name: 'Bài học 1',
        settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
      }

      const result = await createConfig(input)
      expect(result).toEqual({ error: 'Bạn cần đăng nhập để thực hiện thao tác này' })
    })

    it('returns error when name is empty', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { createConfig } = await import('@/app/actions/configs')

      const input: CreateConfigInput = {
        gameId: 'flashcard',
        name: '   ',
        settings: { topics: ['animals'] },
      }

      const result = await createConfig(input)
      expect(result).toEqual({ error: 'Tên cấu hình là bắt buộc' })
    })

    it('returns error when name exceeds 200 characters', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { createConfig } = await import('@/app/actions/configs')

      const input: CreateConfigInput = {
        gameId: 'flashcard',
        name: 'a'.repeat(201),
        settings: { topics: ['animals'] },
      }

      const result = await createConfig(input)
      expect(result).toEqual({ error: 'Tên cấu hình không được vượt quá 200 ký tự' })
    })

    it('returns error when gameId is invalid', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { createConfig } = await import('@/app/actions/configs')

      const input: CreateConfigInput = {
        gameId: 'invalid-game-id',
        name: 'Bài học 1',
        settings: {},
      }

      const result = await createConfig(input)
      expect(result).toEqual({ error: 'Game không hợp lệ' })
    })

    it('returns error when database insertion fails', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database insert failed' } }),
        }),
      })

      const { createConfig } = await import('@/app/actions/configs')
      const input: CreateConfigInput = {
        gameId: 'flashcard',
        name: 'Bài học 1',
        settings: {},
      }

      const result = await createConfig(input)
      expect(result).toEqual({ error: 'Database insert failed' })
    })

    it('creates config successfully with validated settings and triggers revalidatePath', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const insertedRow = {
        id: 'cfg-123',
        user_id: 'admin-1',
        game_id: 'flashcard',
        name: 'Flashcard Lớp 1',
        settings: { topics: ['animals'], wordLimit: 10, autoSpeak: true },
        share_slug: null,
        is_active: true,
        created_at: '2026-08-21T00:00:00Z',
        updated_at: '2026-08-21T00:00:00Z',
      }

      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: insertedRow, error: null }),
        }),
      })

      const { createConfig } = await import('@/app/actions/configs')

      const input: CreateConfigInput = {
        gameId: 'flashcard',
        name: '  Flashcard Lớp 1  ',
        settings: { topics: ['animals'], wordLimit: 10, autoSpeak: true },
      }

      const result = await createConfig(input)
      expect(result).toEqual({ data: insertedRow })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/games/flashcard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/dashboard')
    })
  })

  describe('getConfigsByGame', () => {
    it('returns error when user is unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const { getConfigsByGame } = await import('@/app/actions/configs')

      const result = await getConfigsByGame('flashcard')
      expect(result).toEqual({ error: 'Bạn cần đăng nhập để thực hiện thao tác này' })
    })

    it('returns error when gameId is invalid', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { getConfigsByGame } = await import('@/app/actions/configs')

      const result = await getConfigsByGame('not-a-game')
      expect(result).toEqual({ error: 'Game không hợp lệ' })
    })

    it('returns database error message if select query fails', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const eqIsActive = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Connection timeout' } }),
      })
      const eqGameId = vi.fn().mockReturnValue({ eq: eqIsActive })
      const eqUserId = vi.fn().mockReturnValue({ eq: eqGameId })
      mockSelect.mockReturnValue({ eq: eqUserId })

      const { getConfigsByGame } = await import('@/app/actions/configs')
      const result = await getConfigsByGame('flashcard')

      expect(result).toEqual({ error: 'Connection timeout' })
    })

    it('returns config list on success', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const configList = [
        {
          id: 'cfg-1',
          game_id: 'flashcard',
          name: 'Bộ từ vựng 1',
          settings: {},
          share_slug: 'abc123xyz0',
          is_active: true,
        },
      ]

      const eqIsActive = vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: configList, error: null }),
      })
      const eqGameId = vi.fn().mockReturnValue({ eq: eqIsActive })
      const eqUserId = vi.fn().mockReturnValue({ eq: eqGameId })
      mockSelect.mockReturnValue({ eq: eqUserId })

      const { getConfigsByGame } = await import('@/app/actions/configs')
      const result = await getConfigsByGame('flashcard')

      expect(result).toEqual({ data: configList })
    })
  })

  describe('getConfigById', () => {
    it('returns error when user is unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const { getConfigById } = await import('@/app/actions/configs')

      const result = await getConfigById('cfg-123')
      expect(result).toEqual({ error: 'Bạn cần đăng nhập để thực hiện thao tác này' })
    })

    it('returns error when configId is invalid or empty', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { getConfigById } = await import('@/app/actions/configs')

      const result = await getConfigById('   ')
      expect(result).toEqual({ error: 'ID cấu hình không hợp lệ' })
    })

    it('returns error when config is not found', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const eqUserId = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
      })
      const eqId = vi.fn().mockReturnValue({ eq: eqUserId })
      mockSelect.mockReturnValue({ eq: eqId })

      const { getConfigById } = await import('@/app/actions/configs')
      const result = await getConfigById('cfg-nonexistent')

      expect(result).toEqual({ error: 'Không tìm thấy cấu hình' })
    })

    it('returns config data on success', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const configData = {
        id: 'cfg-123',
        user_id: 'admin-1',
        game_id: 'flashcard',
        name: 'Flashcard Demo',
        settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
        share_slug: null,
        is_active: true,
      }

      const eqUserId = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: configData, error: null }),
      })
      const eqId = vi.fn().mockReturnValue({ eq: eqUserId })
      mockSelect.mockReturnValue({ eq: eqId })

      const { getConfigById } = await import('@/app/actions/configs')
      const result = await getConfigById('cfg-123')

      expect(result).toEqual({ data: configData })
    })
  })

  describe('updateConfig', () => {
    it('returns error when user is unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const { updateConfig } = await import('@/app/actions/configs')

      const result = await updateConfig('cfg-123', { name: 'New Name' })
      expect(result).toEqual({ error: 'Bạn cần đăng nhập để thực hiện thao tác này' })
    })

    it('returns error when configId is invalid', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { updateConfig } = await import('@/app/actions/configs')

      const result = await updateConfig('   ', { name: 'New Name' })
      expect(result).toEqual({ error: 'ID cấu hình không hợp lệ' })
    })

    it('returns error when name is empty string', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { updateConfig } = await import('@/app/actions/configs')

      const result = await updateConfig('cfg-123', { name: '   ' })
      expect(result).toEqual({ error: 'Tên cấu hình không được để trống' })
    })

    it('returns error when name exceeds 200 chars', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { updateConfig } = await import('@/app/actions/configs')

      const result = await updateConfig('cfg-123', { name: 'a'.repeat(201) })
      expect(result).toEqual({ error: 'Tên cấu hình không được vượt quá 200 ký tự' })
    })

    it('returns error if existing config is not found or not owned by user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const eqUserId = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })
      const eqId = vi.fn().mockReturnValue({ eq: eqUserId })
      mockSelect.mockReturnValue({ eq: eqId })

      const { updateConfig } = await import('@/app/actions/configs')
      const result = await updateConfig('cfg-not-found', { name: 'Updated Name' })

      expect(result).toEqual({ error: 'Không tìm thấy cấu hình hoặc bạn không có quyền chỉnh sửa' })
    })

    it('returns error when settings validation fails', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const existingConfig = {
        id: 'cfg-123',
        user_id: 'admin-1',
        game_id: 'flashcard',
        name: 'Old Name',
        settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
      }

      const eqUserId = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: existingConfig, error: null }),
      })
      const eqId = vi.fn().mockReturnValue({ eq: eqUserId })
      mockSelect.mockReturnValue({ eq: eqId })

      const { updateConfig } = await import('@/app/actions/configs')
      const result = await updateConfig('cfg-123', {
        settings: 'not-an-object' as unknown as Record<string, unknown>,
      })

      expect(result.error).toBeDefined()
      expect(result.error).toContain('JSON object')
    })

    it('updates config successfully and calls revalidatePath for affected pages', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const existingConfig = {
        id: 'cfg-123',
        user_id: 'admin-1',
        game_id: 'flashcard',
        name: 'Old Name',
        settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
      }

      // First query: fetch existing
      const eqUserIdSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: existingConfig, error: null }),
      })
      const eqIdSelect = vi.fn().mockReturnValue({ eq: eqUserIdSelect })
      mockSelect.mockReturnValue({ eq: eqIdSelect })

      const updatedRow = {
        ...existingConfig,
        name: 'New Flashcard Name',
        settings: { topics: ['fruits'], wordLimit: 10, autoSpeak: false },
        updated_at: '2026-08-21T12:00:00Z',
      }

      // Update query
      const singleUpdate = vi.fn().mockResolvedValue({ data: updatedRow, error: null })
      const selectUpdate = vi.fn().mockReturnValue({ single: singleUpdate })
      const eqUserIdUpdate = vi.fn().mockReturnValue({ select: selectUpdate })
      const eqIdUpdate = vi.fn().mockReturnValue({ eq: eqUserIdUpdate })
      mockUpdate.mockReturnValue({ eq: eqIdUpdate })

      const { updateConfig } = await import('@/app/actions/configs')
      const input: UpdateConfigInput = {
        name: '  New Flashcard Name  ',
        settings: { topics: ['fruits'], wordLimit: 10, autoSpeak: false },
      }

      const result = await updateConfig('cfg-123', input)

      expect(result).toEqual({ data: updatedRow })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/games/flashcard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/configs/cfg-123')
    })
  })

  describe('deleteConfig', () => {
    it('returns error when user is unauthenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const { deleteConfig } = await import('@/app/actions/configs')

      const result = await deleteConfig('cfg-123')
      expect(result).toEqual({ error: 'Bạn cần đăng nhập để thực hiện thao tác này' })
    })

    it('returns error when configId is invalid', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })
      const { deleteConfig } = await import('@/app/actions/configs')

      const result = await deleteConfig('   ')
      expect(result).toEqual({ error: 'ID cấu hình không hợp lệ' })
    })

    it('returns error when config to delete does not exist or belongs to another user', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const eqUserId = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })
      const eqId = vi.fn().mockReturnValue({ eq: eqUserId })
      mockSelect.mockReturnValue({ eq: eqId })

      const { deleteConfig } = await import('@/app/actions/configs')
      const result = await deleteConfig('cfg-nonexistent')

      expect(result).toEqual({ error: 'Không tìm thấy cấu hình hoặc bạn không có quyền xóa' })
    })

    it('deletes config successfully and revalidates dashboard and game paths', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'admin-1', email: 'teacher@school.edu' } },
      })

      const existingConfig = {
        id: 'cfg-123',
        game_id: 'flashcard',
      }

      const eqUserIdSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: existingConfig, error: null }),
      })
      const eqIdSelect = vi.fn().mockReturnValue({ eq: eqUserIdSelect })
      mockSelect.mockReturnValue({ eq: eqIdSelect })

      const eqUserIdDelete = vi.fn().mockResolvedValue({ error: null })
      const eqIdDelete = vi.fn().mockReturnValue({ eq: eqUserIdDelete })
      mockDelete.mockReturnValue({ eq: eqIdDelete })

      const { deleteConfig } = await import('@/app/actions/configs')
      const result = await deleteConfig('cfg-123')

      expect(result).toEqual({ success: true })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/games/flashcard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/dashboard')
    })
  })
})
