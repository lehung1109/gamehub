// tests/unit/actions/configs.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CreateConfigInput } from '@/types/config'

const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockRevalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
    })),
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
})
