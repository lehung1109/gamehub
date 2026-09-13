import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCommunityConfigsAction,
  shareConfigToCommunityAction,
  cloneCommunityConfigAction,
  toggleLikeCommunityConfigAction,
  deleteCommunityConfigAction,
} from '@/app/actions/community'
import * as serverSupabase from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Community Server Actions', () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
    from: ReturnType<typeof vi.fn>
  }

  const mockUser = {
    id: 'teacher-uuid-1',
    email: 'teacher@gamehub.vn',
    user_metadata: { full_name: 'Cô Mai Phương' },
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: vi.fn(),
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
  })

  describe('getCommunityConfigsAction', () => {
    it('fetches community configs with default pagination and newest sorting', async () => {
      const mockRows = [
        {
          id: 'comm-1',
          config_id: 'cfg-1',
          author_id: 'teacher-uuid-1',
          author_name: 'Cô Mai Phương',
          title: 'Fruits & Veggies Quiz',
          description: 'Fun beginner vocabulary game',
          game_id: 'flashcard',
          cefr_level: 'A1',
          topic: 'fruits',
          tags: ['food', 'a1'],
          settings: { timer: 30 },
          likes_count: 5,
          clone_count: 2,
          created_at: '2026-09-13T10:00:00Z',
          updated_at: '2026-09-13T10:00:00Z',
        },
      ]

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: mockRows, count: 1, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await getCommunityConfigsAction()

      expect(res.success).toBe(true)
      expect(res.total).toBe(1)
      expect(res.data).toHaveLength(1)
      expect(res.data?.[0]).toEqual({
        id: 'comm-1',
        configId: 'cfg-1',
        authorId: 'teacher-uuid-1',
        authorName: 'Cô Mai Phương',
        title: 'Fruits & Veggies Quiz',
        description: 'Fun beginner vocabulary game',
        gameId: 'flashcard',
        cefrLevel: 'A1',
        topic: 'fruits',
        tags: ['food', 'a1'],
        settings: { timer: 30 },
        likesCount: 5,
        cloneCount: 2,
        createdAt: '2026-09-13T10:00:00Z',
        updatedAt: '2026-09-13T10:00:00Z',
        isLikedByMe: false,
      })
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 11)
    })

    it('applies filters for gameId, cefrLevel, search keyword, and sorts by popular', async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await getCommunityConfigsAction({
        gameId: 'word-match',
        cefrLevel: 'B1',
        topic: 'science',
        search: 'space',
        sortBy: 'popular',
        page: 2,
        pageSize: 10,
      })

      expect(res.success).toBe(true)
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('game_id', 'word-match')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('cefr_level', 'B1')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('topic', 'science')
      expect(mockQueryBuilder.or).toHaveBeenCalledWith(
        'title.ilike.%space%,description.ilike.%space%,topic.ilike.%space%'
      )
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('likes_count', { ascending: false })
      expect(mockQueryBuilder.range).toHaveBeenCalledWith(10, 19)
    })

    it('handles database query error gracefully', async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: null, count: 0, error: { message: 'Database failure' } }),
      }

      mockSupabase.from.mockReturnValue(mockQueryBuilder)

      const res = await getCommunityConfigsAction()
      expect(res.success).toBe(false)
      expect(res.error).toBe('Database failure')
    })
  })

  describe('shareConfigToCommunityAction', () => {
    it('returns error if user is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const res = await shareConfigToCommunityAction({
        configId: 'cfg-1',
        title: 'Space Words',
        cefrLevel: 'A1',
        topic: 'space',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('returns error on missing title or configId', async () => {
      const res1 = await shareConfigToCommunityAction({
        configId: '',
        title: 'Valid title',
        cefrLevel: 'A1',
        topic: 'space',
      })
      expect(res1.success).toBe(false)
      expect(res1.error).toMatch(/bắt buộc/i)

      const res2 = await shareConfigToCommunityAction({
        configId: 'cfg-1',
        title: '   ',
        cefrLevel: 'A1',
        topic: 'space',
      })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/tiêu đề/i)
    })

    it('returns error if source game config does not exist or user is not owner', async () => {
      const mockConfigQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      }

      mockSupabase.from.mockReturnValue(mockConfigQuery)

      const res = await shareConfigToCommunityAction({
        configId: 'cfg-999',
        title: 'Valid Title',
        cefrLevel: 'A1',
        topic: 'animals',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không tìm thấy/i)
    })

    it('successfully publishes config to community library and revalidates path', async () => {
      const mockSourceConfig = {
        id: 'cfg-1',
        user_id: 'teacher-uuid-1',
        game_id: 'flashcard',
        settings: { words: [{ en: 'Sun', vi: 'Mặt trời' }] },
      }

      const mockPublishedRow = {
        id: 'comm-new-1',
        config_id: 'cfg-1',
        author_id: 'teacher-uuid-1',
        author_name: 'Cô Mai Phương',
        title: 'Học từ vựng Mặt trời & Hệ mặt trời',
        description: 'Bài học flashcard cho bé',
        game_id: 'flashcard',
        cefr_level: 'A2',
        topic: 'space',
        tags: ['solar', 'kids'],
        settings: mockSourceConfig.settings,
        likes_count: 0,
        clone_count: 0,
        created_at: '2026-09-13T10:30:00Z',
        updated_at: '2026-09-13T10:30:00Z',
      }

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'game_configs') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockSourceConfig, error: null }),
          }
        }
        if (tableName === 'community_shared_configs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockPublishedRow, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      const res = await shareConfigToCommunityAction({
        configId: 'cfg-1',
        title: 'Học từ vựng Mặt trời & Hệ mặt trời',
        description: 'Bài học flashcard cho bé',
        cefrLevel: 'A2',
        topic: 'space',
        tags: ['solar', 'kids'],
      })

      expect(res.success).toBe(true)
      expect(res.data?.id).toBe('comm-new-1')
      expect(res.data?.authorName).toBe('Cô Mai Phương')
      expect(res.data?.cefrLevel).toBe('A2')
      expect(revalidatePath).toHaveBeenCalledWith('/admin/community')
    })
  })

  describe('cloneCommunityConfigAction', () => {
    it('returns error if user is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const res = await cloneCommunityConfigAction('comm-1')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('returns error if community config not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Shared config not found' } }),
      })

      const res = await cloneCommunityConfigAction('comm-not-found')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không tìm thấy/i)
    })

    it('clones community config into teacher game_configs and increments clone_count', async () => {
      const mockSharedConfig = {
        id: 'comm-1',
        title: 'Weather Pack',
        description: 'Sunny, rainy, cloudy words',
        game_id: 'word-match',
        settings: { pairs: [] },
        clone_count: 4,
      }

      const mockNewGameConfig = {
        id: 'new-cloned-cfg-123',
        user_id: 'teacher-uuid-1',
        game_id: 'word-match',
        name: 'Weather Pack (Bản sao)',
      }

      let updatePayload: Record<string, unknown> | null = null

      mockSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'community_shared_configs') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockSharedConfig, error: null }),
            update: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
              updatePayload = payload
              return {
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }
            }),
          }
        }
        if (tableName === 'game_configs') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockNewGameConfig, error: null }),
              }),
            }),
          }
        }
        return {}
      })

      const res = await cloneCommunityConfigAction('comm-1')

      expect(res.success).toBe(true)
      expect(res.data?.newConfigId).toBe('new-cloned-cfg-123')
      expect(updatePayload).toEqual({ clone_count: 5 })
      expect(revalidatePath).toHaveBeenCalledWith('/admin/community')
      expect(revalidatePath).toHaveBeenCalledWith('/admin/games/word-match')
    })
  })

  describe('toggleLikeCommunityConfigAction', () => {
    it('increments like count when currently not liked', async () => {
      const mockShared = {
        id: 'comm-1',
        likes_count: 3,
      }

      let updatePayload: Record<string, unknown> | null = null

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockShared, error: null }),
        update: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
          updatePayload = payload
          return {
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }),
      })

      const res = await toggleLikeCommunityConfigAction('comm-1', false)

      expect(res.success).toBe(true)
      expect(res.data?.likesCount).toBe(4)
      expect(res.data?.isLiked).toBe(true)
      expect(updatePayload).toEqual({ likes_count: 4 })
    })

    it('decrements like count when currently liked without going below 0', async () => {
      const mockShared = {
        id: 'comm-1',
        likes_count: 1,
      }

      let updatePayload: Record<string, unknown> | null = null

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockShared, error: null }),
        update: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
          updatePayload = payload
          return {
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }),
      })

      const res = await toggleLikeCommunityConfigAction('comm-1', true)

      expect(res.success).toBe(true)
      expect(res.data?.likesCount).toBe(0)
      expect(res.data?.isLiked).toBe(false)
      expect(updatePayload).toEqual({ likes_count: 0 })
    })
  })

  describe('deleteCommunityConfigAction', () => {
    it('returns error if user is not author', async () => {
      const mockShared = {
        id: 'comm-1',
        author_id: 'different-teacher-999',
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockShared, error: null }),
      })

      const res = await deleteCommunityConfigAction('comm-1')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/quyền/i)
    })

    it('successfully deletes shared config and revalidates path', async () => {
      const mockShared = {
        id: 'comm-1',
        author_id: 'teacher-uuid-1',
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockShared, error: null }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      const res = await deleteCommunityConfigAction('comm-1')
      expect(res.success).toBe(true)
      expect(revalidatePath).toHaveBeenCalledWith('/admin/community')
    })
  })
})
