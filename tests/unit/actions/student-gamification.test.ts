import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getStudentGamificationProfile,
  syncStudentGamificationState,
  purchaseShopItemAction,
  equipShopItemAction,
  claimQuestRewardAction,
} from '@/app/actions/student-gamification'
import * as adminSupabase from '@/lib/supabase/admin'
import type { Quest } from '@/types/quests'
import type { StudentInventory } from '@/types/shop'
import type { StreakState } from '@/types/streak'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

describe('student-gamification server actions', () => {
  let mockSupabase: { from: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = {
      from: vi.fn(),
    }
    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockSupabase as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
  })

  describe('Input Validation', () => {
    it('returns error when classCode or studentName is missing for getStudentGamificationProfile', async () => {
      const res1 = await getStudentGamificationProfile({ classCode: '', studentName: '' })
      expect(res1.success).toBe(false)
      expect(res1.error).toBeDefined()

      const res2 = await getStudentGamificationProfile({ classCode: 'CLASS1', studentName: '   ' })
      expect(res2.success).toBe(false)
      expect(res2.error).toMatch(/tên học sinh/i)
    })

    it('returns error when classCode or studentName is missing for syncStudentGamificationState', async () => {
      const res = await syncStudentGamificationState({ classCode: '  ', studentName: 'Alice' })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/mã lớp/i)
    })

    it('rejects purchase when item does not exist', async () => {
      const res = await purchaseShopItemAction({
        classCode: 'TEST01',
        studentName: 'Alice',
        itemId: 'invalid_item_id_xyz',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không tồn tại/i)
    })

    it('rejects purchase when classCode or studentName is missing', async () => {
      const res = await purchaseShopItemAction({
        classCode: '',
        studentName: 'Alice',
        itemId: 'frame_gold',
      })
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('rejects equip when classCode or studentName is missing', async () => {
      const res = await equipShopItemAction({
        classCode: '',
        studentName: '',
        itemId: 'frame_gold',
        category: 'frame',
      })
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })

    it('rejects claim quest reward when classCode or studentName is missing', async () => {
      const res = await claimQuestRewardAction({
        classCode: '',
        studentName: '',
        questId: 'quest_test',
      })
      expect(res.success).toBe(false)
      expect(res.error).toBeDefined()
    })
  })

  describe('Classroom and Student Verification', () => {
    it('fails if classroom does not exist or is inactive', async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
      const eqMock = vi.fn().mockReturnValue({ single: singleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })

      mockSupabase.from.mockReturnValue({ select: selectMock })

      const res = await getStudentGamificationProfile({
        classCode: 'INACTIVE_OR_NONEXISTENT',
        studentName: 'Alice',
      })
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/lớp học/i)
    })
  })

  describe('getStudentGamificationProfile', () => {
    it('creates student and default gamification record if student is new', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSingleMock = vi.fn().mockResolvedValue({ data: mockClass, error: null })
      const classEqMock = vi.fn().mockReturnValue({ single: classSingleMock })
      const classSelectMock = vi.fn().mockReturnValue({ eq: classEqMock })

      // Students lookup returns empty, so insert new student
      const studentLimitMock = vi.fn().mockResolvedValue({ data: [], error: null })
      const studentEqNameMock = vi.fn().mockReturnValue({ limit: studentLimitMock })
      const studentEqClassMock = vi.fn().mockReturnValue({ eq: studentEqNameMock })
      const studentSelectMock = vi.fn().mockReturnValue({ eq: studentEqClassMock })

      const studentInsertSingleMock = vi.fn().mockResolvedValue({ data: { id: 'new-student-id' }, error: null })
      const studentInsertSelectMock = vi.fn().mockReturnValue({ single: studentInsertSingleMock })
      const studentInsertMock = vi.fn().mockReturnValue({ select: studentInsertSelectMock })

      // Game sessions
      const sessionsEqMock = vi.fn().mockResolvedValue({ data: [], error: null })
      const sessionsSelectMock = vi.fn().mockReturnValue({ eq: sessionsEqMock })

      // Student gamification lookup returns empty, insert default
      const gamSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const gamEqMock = vi.fn().mockReturnValue({ maybeSingle: gamSingleMock })
      const gamSelectMock = vi.fn().mockReturnValue({ eq: gamEqMock })

      const defaultGamRow = {
        id: 'gam-1',
        student_id: 'new-student-id',
        streak_state: {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: '',
          freezeCount: 1,
          totalActiveDays: 0,
          unlockedMilestones: [],
        },
        inventory: {
          ownedItemIds: [],
          equippedFrameId: null,
          equippedTitleId: null,
          spentStars: 0,
          bonusStars: 0,
        },
        quests: [],
      }

      const gamInsertSingleMock = vi.fn().mockResolvedValue({ data: defaultGamRow, error: null })
      const gamInsertSelectMock = vi.fn().mockReturnValue({ single: gamInsertSingleMock })
      const gamInsertMock = vi.fn().mockReturnValue({ select: gamInsertSelectMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock, insert: studentInsertMock }
        if (table === 'game_sessions') return { select: sessionsSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock, insert: gamInsertMock }
        return { select: vi.fn() }
      })

      const res = await getStudentGamificationProfile({
        classCode: 'CLASS1',
        studentName: 'New Kid',
      })

      expect(res.success).toBe(true)
      expect(res.data).toBeDefined()
      expect(res.data?.studentId).toBe('new-student-id')
      expect(res.data?.totalStars).toBe(0)
      expect(res.data?.effectiveStars).toBe(0)
      expect(res.data?.streakState.freezeCount).toBe(1)
      expect(res.data?.inventory.ownedItemIds).toEqual([])
      expect(res.data?.quests).toEqual([])
    })

    it('returns existing profile and computes effectiveStars correctly', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      // Total session stars = 100
      const sessionsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [{ score: 60 }, { score: 40 }],
          error: null,
        }),
      })

      const existingStreak: StreakState = {
        currentStreak: 5,
        longestStreak: 7,
        lastActiveDate: '2026-09-12',
        freezeCount: 2,
        totalActiveDays: 10,
        unlockedMilestones: [3],
      }
      const existingInventory: StudentInventory = {
        ownedItemIds: ['frame_gold'],
        equippedFrameId: 'frame_gold',
        equippedTitleId: null,
        spentStars: 30,
        bonusStars: 10,
      }
      const existingQuests: Quest[] = [
        {
          id: 'daily_play_games_2026-09-12',
          title: 'Chăm chỉ',
          description: 'Chơi 2 game',
          icon: '🎮',
          type: 'play_games',
          target: 2,
          current: 1,
          rewardStars: 5,
          isCompleted: false,
          isClaimed: false,
          period: 'daily',
          dateKey: '2026-09-12',
        },
      ]

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: existingStreak,
              inventory: existingInventory,
              quests: existingQuests,
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'game_sessions') return { select: sessionsSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock }
        return { select: vi.fn() }
      })

      const res = await getStudentGamificationProfile({
        classCode: 'CLASS1',
        studentName: 'Alice',
      })

      expect(res.success).toBe(true)
      expect(res.data?.studentId).toBe('s1')
      expect(res.data?.totalStars).toBe(100)
      // effectiveStars = totalStars (100) - spentStars (30) + bonusStars (10) = 80
      expect(res.data?.effectiveStars).toBe(80)
      expect(res.data?.streakState.currentStreak).toBe(5)
      expect(res.data?.inventory.equippedFrameId).toBe('frame_gold')
      expect(res.data?.quests).toHaveLength(1)
    })
  })

  describe('syncStudentGamificationState', () => {
    it('updates gamification row when it already exists', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamMaybeSingleMock = vi.fn().mockResolvedValue({ data: { id: 'gam-1' }, error: null })
      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle: gamMaybeSingleMock }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') {
          return { select: gamSelectMock, update: gamUpdateMock }
        }
        return { select: vi.fn() }
      })

      const newStreak: StreakState = {
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: '2026-09-12',
        freezeCount: 1,
        totalActiveDays: 3,
        unlockedMilestones: [3],
      }

      const res = await syncStudentGamificationState({
        classCode: 'CLASS1',
        studentName: 'Alice',
        streakState: newStreak,
      })

      expect(res.success).toBe(true)
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          streak_state: newStreak,
        })
      )
      expect(gamUpdateEqMock).toHaveBeenCalledWith('student_id', 's1')
    })
  })

  describe('purchaseShopItemAction', () => {
    it('fails when student has insufficient stars', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      // Total session stars = 10, item cost for frame_gold is 30
      const sessionsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ score: 10 }], error: null }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: { freezeCount: 1 },
              inventory: { ownedItemIds: [], spentStars: 0, bonusStars: 0 },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'game_sessions') return { select: sessionsSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock }
        return { select: vi.fn() }
      })

      const res = await purchaseShopItemAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        itemId: 'frame_gold',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/không đủ sao/i)
    })

    it('fails when student already owns cosmetic item', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const sessionsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ score: 100 }], error: null }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: { freezeCount: 1 },
              inventory: { ownedItemIds: ['frame_gold'], spentStars: 30, bonusStars: 0 },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'game_sessions') return { select: sessionsSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock }
        return { select: vi.fn() }
      })

      const res = await purchaseShopItemAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        itemId: 'frame_gold',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/sở hữu/i)
    })

    it('successfully purchases item, updates inventory and remaining stars in DB', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      // Total session stars = 50, cost is 30
      const sessionsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ score: 50 }], error: null }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: { freezeCount: 1 },
              inventory: { ownedItemIds: [], spentStars: 0, bonusStars: 0 },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'game_sessions') return { select: sessionsSelectMock }
        if (table === 'student_gamification') {
          return { select: gamSelectMock, update: gamUpdateMock }
        }
        return { select: vi.fn() }
      })

      const res = await purchaseShopItemAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        itemId: 'frame_gold',
      })

      expect(res.success).toBe(true)
      expect(res.inventory?.ownedItemIds).toContain('frame_gold')
      expect(res.inventory?.spentStars).toBe(30)
      expect(res.remainingStars).toBe(20) // 50 - 30
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            ownedItemIds: ['frame_gold'],
            spentStars: 30,
          }),
        })
      )
    })

    it('purchasing streak_freeze increments freezeCount in streak_state', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const sessionsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ score: 50 }], error: null }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: { freezeCount: 1, currentStreak: 3 },
              inventory: { ownedItemIds: [], spentStars: 0, bonusStars: 0 },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'game_sessions') return { select: sessionsSelectMock }
        if (table === 'student_gamification') {
          return { select: gamSelectMock, update: gamUpdateMock }
        }
        return { select: vi.fn() }
      })

      const res = await purchaseShopItemAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        itemId: 'streak_freeze',
      })

      expect(res.success).toBe(true)
      expect(res.inventory?.spentStars).toBe(25)
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          streak_state: expect.objectContaining({
            freezeCount: 2,
          }),
        })
      )
    })
  })

  describe('equipShopItemAction', () => {
    it('fails if student does not own the item', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: {},
              inventory: { ownedItemIds: [], equippedFrameId: null, equippedTitleId: null },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock }
        return { select: vi.fn() }
      })

      const res = await equipShopItemAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        itemId: 'frame_gold',
        category: 'frame',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/sở hữu/i)
    })

    it('equips item if owned and not currently equipped', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: {},
              inventory: {
                ownedItemIds: ['frame_gold'],
                equippedFrameId: null,
                equippedTitleId: null,
              },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') {
          return { select: gamSelectMock, update: gamUpdateMock }
        }
        return { select: vi.fn() }
      })

      const res = await equipShopItemAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        itemId: 'frame_gold',
        category: 'frame',
      })

      expect(res.success).toBe(true)
      expect(res.inventory?.equippedFrameId).toBe('frame_gold')
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            equippedFrameId: 'frame_gold',
          }),
        })
      )
    })

    it('unequips item if already equipped (toggle behavior)', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: {},
              inventory: {
                ownedItemIds: ['frame_gold'],
                equippedFrameId: 'frame_gold',
                equippedTitleId: null,
              },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') {
          return { select: gamSelectMock, update: gamUpdateMock }
        }
        return { select: vi.fn() }
      })

      const res = await equipShopItemAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        itemId: 'frame_gold',
        category: 'frame',
      })

      expect(res.success).toBe(true)
      expect(res.inventory?.equippedFrameId).toBeNull()
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          inventory: expect.objectContaining({
            equippedFrameId: null,
          }),
        })
      )
    })
  })

  describe('claimQuestRewardAction', () => {
    it('fails if quest not found in student quests', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: {},
              inventory: { bonusStars: 0 },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock }
        return { select: vi.fn() }
      })

      const res = await claimQuestRewardAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        questId: 'nonexistent_quest',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/quest/i)
    })

    it('claims reward for completed quest, updates bonusStars and marks isClaimed in DB', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const completedQuest: Quest = {
        id: 'quest_1',
        title: 'Chăm chỉ',
        description: 'Chơi 2 game',
        icon: '🎮',
        type: 'play_games',
        target: 2,
        current: 2,
        rewardStars: 15,
        isCompleted: true,
        isClaimed: false,
        period: 'daily',
        dateKey: '2026-09-12',
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: { freezeCount: 1 },
              inventory: { bonusStars: 5, spentStars: 0, ownedItemIds: [] },
              quests: [completedQuest],
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') {
          return { select: gamSelectMock, update: gamUpdateMock }
        }
        return { select: vi.fn() }
      })

      const res = await claimQuestRewardAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        questId: 'quest_1',
      })

      expect(res.success).toBe(true)
      expect(res.bonusStars).toBe(20) // 5 + 15
      expect(res.quests?.[0].isClaimed).toBe(true)
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          quests: [expect.objectContaining({ id: 'quest_1', isClaimed: true })],
          inventory: expect.objectContaining({ bonusStars: 20 }),
        })
      )
    })

    it('claims reward with freeze bonus and updates streak_state.freezeCount', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })

      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })

      const weeklyQuestWithFreeze: Quest = {
        id: 'weekly_quest_1',
        title: 'Chiến binh',
        description: 'Chơi 6 game',
        icon: '🏆',
        type: 'play_games',
        target: 6,
        current: 6,
        rewardStars: 35,
        rewardFreeze: 1,
        isCompleted: true,
        isClaimed: false,
        period: 'weekly',
        dateKey: '2026-W37',
      }

      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: { freezeCount: 1 },
              inventory: { bonusStars: 10, spentStars: 0, ownedItemIds: [] },
              quests: [weeklyQuestWithFreeze],
            },
            error: null,
          }),
        }),
      })

      const gamUpdateEqMock = vi.fn().mockResolvedValue({ error: null })
      const gamUpdateMock = vi.fn().mockReturnValue({ eq: gamUpdateEqMock })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'student_gamification') {
          return { select: gamSelectMock, update: gamUpdateMock }
        }
        return { select: vi.fn() }
      })

      const res = await claimQuestRewardAction({
        classCode: 'CLASS1',
        studentName: 'Alice',
        questId: 'weekly_quest_1',
      })

      expect(res.success).toBe(true)
      expect(res.bonusStars).toBe(45) // 10 + 35
      expect(gamUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          streak_state: expect.objectContaining({ freezeCount: 2 }),
          inventory: expect.objectContaining({ bonusStars: 45 }),
        })
      )
    })
  })

  describe('Positional arguments calling convention', () => {
    it('supports calling getStudentGamificationProfile with positional arguments', async () => {
      const mockClass = { id: 'c1', is_active: true }
      const classSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockClass, error: null }) }),
      })
      const studentSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [{ id: 's1' }], error: null }),
          }),
        }),
      })
      const sessionsSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [{ score: 20 }], error: null }),
      })
      const gamSelectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: 'gam-1',
              student_id: 's1',
              streak_state: { currentStreak: 2 },
              inventory: { ownedItemIds: [], spentStars: 0, bonusStars: 0 },
              quests: [],
            },
            error: null,
          }),
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'classrooms') return { select: classSelectMock }
        if (table === 'students') return { select: studentSelectMock }
        if (table === 'game_sessions') return { select: sessionsSelectMock }
        if (table === 'student_gamification') return { select: gamSelectMock }
        return { select: vi.fn() }
      })

      const res = await getStudentGamificationProfile('CLASS1', 'Alice')
      expect(res.success).toBe(true)
      expect(res.data?.studentId).toBe('s1')
      expect(res.data?.totalStars).toBe(20)
    })
  })
})

