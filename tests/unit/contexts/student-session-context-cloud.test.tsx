import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StudentSessionProvider, useStudentSession } from '@/contexts/StudentSessionContext'
import * as gamificationActions from '@/app/actions/student-gamification'
import { saveStoredInventory } from '@/lib/shop'
import { saveStoredStreak as saveStreakToStore } from '@/lib/streak'
import { saveStoredQuests as saveQuestsToStore } from '@/lib/quests'
import type { Quest } from '@/types/quests'

vi.mock('@/app/actions/student-gamification', () => ({
  getStudentGamificationProfile: vi.fn(),
  syncStudentGamificationState: vi.fn(),
  purchaseShopItemAction: vi.fn(),
  equipShopItemAction: vi.fn(),
  claimQuestRewardAction: vi.fn(),
}))

describe('StudentSessionContext Cloud Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StudentSessionProvider>{children}</StudentSessionProvider>
  )

  it('exposes gamification properties and methods on the context', () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper })

    expect(result.current.streakState).toBeDefined()
    expect(result.current.inventory).toBeDefined()
    expect(result.current.quests).toBeDefined()
    expect(typeof result.current.refreshGamification).toBe('function')
    expect(typeof result.current.syncGamification).toBe('function')
    expect(typeof result.current.buyShopItem).toBe('function')
    expect(typeof result.current.toggleEquipItem).toBe('function')
    expect(typeof result.current.claimQuest).toBe('function')
  })

  it('loads cloud gamification profile and syncs to local storage when student joins', async () => {
    vi.mocked(gamificationActions.getStudentGamificationProfile).mockResolvedValue({
      success: true,
      data: {
        studentId: 'stud-1',
        totalStars: 50,
        effectiveStars: 40,
        streakState: {
          currentStreak: 7,
          longestStreak: 10,
          lastActiveDate: '2026-09-12',
          freezeCount: 2,
          totalActiveDays: 15,
          unlockedMilestones: [3, 7],
        },
        inventory: {
          ownedItemIds: ['frame_gold'],
          equippedFrameId: 'frame_gold',
          equippedTitleId: null,
          spentStars: 30,
          bonusStars: 20,
        },
        quests: [],
      },
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'CLASS1',
        studentName: 'Bé An',
      })
    })

    await waitFor(() => {
      expect(result.current.streakState.currentStreak).toBe(7)
      expect(result.current.inventory.equippedFrameId).toBe('frame_gold')
    })
  })

  it('hydrates immediately from local cache with 0ms delay before cloud responds', async () => {
    saveStoredInventory('CLASS1', 'Bé Bình', {
      ownedItemIds: ['frame_neon'],
      equippedFrameId: 'frame_neon',
      equippedTitleId: null,
      spentStars: 40,
      bonusStars: 10,
    })
    saveStreakToStore('CLASS1', 'Bé Bình', {
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: '2026-09-12',
      freezeCount: 1,
      totalActiveDays: 4,
      unlockedMilestones: [3],
    })

    let resolveCloud: (value: gamificationActions.GetStudentGamificationProfileOutput) => void
    const cloudPromise = new Promise<gamificationActions.GetStudentGamificationProfileOutput>((resolve) => {
      resolveCloud = resolve
    })
    vi.mocked(gamificationActions.getStudentGamificationProfile).mockReturnValue(
      cloudPromise
    )

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    act(() => {
      result.current.joinClass({
        classCode: 'CLASS1',
        studentName: 'Bé Bình',
      })
    })

    // Immediate local cache availability
    expect(result.current.inventory.equippedFrameId).toBe('frame_neon')
    expect(result.current.streakState.currentStreak).toBe(3)

    // Resolve cloud later with updated streak
    await act(async () => {
      resolveCloud!({
        success: true,
        data: {
          studentId: 'stud-2',
          totalStars: 100,
          effectiveStars: 70,
          streakState: {
            currentStreak: 8,
            longestStreak: 8,
            lastActiveDate: '2026-09-12',
            freezeCount: 2,
            totalActiveDays: 10,
            unlockedMilestones: [3, 7],
          },
          inventory: {
            ownedItemIds: ['frame_neon', 'frame_gold'],
            equippedFrameId: 'frame_gold',
            equippedTitleId: null,
            spentStars: 70,
            bonusStars: 40,
          },
          quests: [],
        },
      })
    })

    await waitFor(() => {
      expect(result.current.streakState.currentStreak).toBe(8)
      expect(result.current.inventory.equippedFrameId).toBe('frame_gold')
      expect(result.current.inventory.ownedItemIds).toContain('frame_gold')
      expect(result.current.inventory.ownedItemIds).toContain('frame_neon')
    })
  })

  it('reconciles local items and preserves higher local streak when migrating to cloud', async () => {
    // Local has higher streak and an item not yet on cloud
    saveStoredInventory('CLASS_SYNC', 'Bé Cúc', {
      ownedItemIds: ['frame_fire'],
      equippedFrameId: 'frame_fire',
      equippedTitleId: null,
      spentStars: 50,
      bonusStars: 20,
    })
    saveStreakToStore('CLASS_SYNC', 'Bé Cúc', {
      currentStreak: 9,
      longestStreak: 9,
      lastActiveDate: '2026-09-12',
      freezeCount: 2,
      totalActiveDays: 12,
      unlockedMilestones: [3, 7],
    })

    vi.mocked(gamificationActions.getStudentGamificationProfile).mockResolvedValue({
      success: true,
      data: {
        studentId: 'stud-3',
        totalStars: 100,
        effectiveStars: 100,
        streakState: {
          currentStreak: 4, // Cloud is lower
          longestStreak: 4,
          lastActiveDate: '2026-09-10',
          freezeCount: 1,
          totalActiveDays: 5,
          unlockedMilestones: [3],
        },
        inventory: {
          ownedItemIds: ['frame_gold'], // Cloud has gold, local has fire
          equippedFrameId: 'frame_gold',
          equippedTitleId: null,
          spentStars: 30,
          bonusStars: 0,
        },
        quests: [],
      },
    })
    vi.mocked(gamificationActions.syncStudentGamificationState).mockResolvedValue({
      success: true,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'CLASS_SYNC',
        studentName: 'Bé Cúc',
      })
    })

    await waitFor(() => {
      // Reconciled should have union of items: both frame_gold and frame_fire
      expect(result.current.inventory.ownedItemIds).toContain('frame_gold')
      expect(result.current.inventory.ownedItemIds).toContain('frame_fire')
      // Higher streak 9 preserved
      expect(result.current.streakState.currentStreak).toBe(9)
      // syncStudentGamificationState should be triggered to update cloud
      expect(gamificationActions.syncStudentGamificationState).toHaveBeenCalled()
    })
  })

  it('performs buyShopItem optimistically and syncs with cloud', async () => {
    vi.mocked(gamificationActions.getStudentGamificationProfile).mockResolvedValue({
      success: true,
      data: {
        studentId: 'stud-4',
        totalStars: 100,
        effectiveStars: 100,
        streakState: {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 1,
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
      },
    })

    vi.mocked(gamificationActions.purchaseShopItemAction).mockResolvedValue({
      success: true,
      inventory: {
        ownedItemIds: ['frame_gold'],
        equippedFrameId: null,
        equippedTitleId: null,
        spentStars: 30,
        bonusStars: 0,
      },
      remainingStars: 70,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'CLASS_BUY',
        studentName: 'Bé Dũng',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(100)
    })

    let buyResult: { success: boolean; error?: string } | undefined
    await act(async () => {
      buyResult = await result.current.buyShopItem('frame_gold')
    })

    expect(buyResult?.success).toBe(true)
    expect(result.current.inventory.ownedItemIds).toContain('frame_gold')
    expect(result.current.totalStars).toBe(70)
    expect(gamificationActions.purchaseShopItemAction).toHaveBeenCalledWith({
      classCode: 'CLASS_BUY',
      studentName: 'Bé Dũng',
      itemId: 'frame_gold',
    })
  })

  it('performs toggleEquipItem for frame and title', async () => {
    vi.mocked(gamificationActions.getStudentGamificationProfile).mockResolvedValue({
      success: true,
      data: {
        studentId: 'stud-5',
        totalStars: 100,
        effectiveStars: 100,
        streakState: {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 1,
          unlockedMilestones: [],
        },
        inventory: {
          ownedItemIds: ['frame_gold', 'title_speed'],
          equippedFrameId: null,
          equippedTitleId: null,
          spentStars: 50,
          bonusStars: 0,
        },
        quests: [],
      },
    })

    vi.mocked(gamificationActions.equipShopItemAction).mockResolvedValue({
      success: true,
      inventory: {
        ownedItemIds: ['frame_gold', 'title_speed'],
        equippedFrameId: 'frame_gold',
        equippedTitleId: null,
        spentStars: 50,
        bonusStars: 0,
      },
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'CLASS_EQUIP',
        studentName: 'Bé Giang',
      })
    })

    await waitFor(() => {
      expect(result.current.inventory.ownedItemIds).toContain('frame_gold')
    })

    await act(async () => {
      const res = await result.current.toggleEquipItem('frame_gold', 'frame')
      expect(res.success).toBe(true)
    })

    expect(result.current.inventory.equippedFrameId).toBe('frame_gold')
    expect(gamificationActions.equipShopItemAction).toHaveBeenCalledWith({
      classCode: 'CLASS_EQUIP',
      studentName: 'Bé Giang',
      itemId: 'frame_gold',
      category: 'frame',
    })
  })

  it('claims completed quest and updates stars and inventory', async () => {
    const mockQuest: Quest = {
      id: 'quest-daily-1',
      title: 'Chơi 3 ván game',
      description: 'Hoàn thành 3 ván game bất kỳ',
      icon: '🎮',
      period: 'daily',
      type: 'play_games',
      target: 3,
      current: 3,
      rewardStars: 15,
      rewardFreeze: 1,
      isCompleted: true,
      isClaimed: false,
      dateKey: '2026-09-12',
    }

    vi.mocked(gamificationActions.getStudentGamificationProfile).mockResolvedValue({
      success: true,
      data: {
        studentId: 'stud-6',
        totalStars: 50,
        effectiveStars: 50,
        streakState: {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 1,
          unlockedMilestones: [],
        },
        inventory: {
          ownedItemIds: [],
          equippedFrameId: null,
          equippedTitleId: null,
          spentStars: 0,
          bonusStars: 0,
        },
        quests: [mockQuest],
      },
    })

    vi.mocked(gamificationActions.claimQuestRewardAction).mockResolvedValue({
      success: true,
      quests: [{ ...mockQuest, isClaimed: true }],
      bonusStars: 15,
      inventory: {
        ownedItemIds: [],
        equippedFrameId: null,
        equippedTitleId: null,
        spentStars: 0,
        bonusStars: 15,
      },
      streakState: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: '2026-09-12',
        freezeCount: 2,
        totalActiveDays: 1,
        unlockedMilestones: [],
      },
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'CLASS_QUEST',
        studentName: 'Bé Hoa',
      })
    })

    await waitFor(() => {
      expect(result.current.quests.length).toBe(1)
    })

    await act(async () => {
      const claimRes = await result.current.claimQuest('quest-daily-1')
      expect(claimRes.success).toBe(true)
    })

    expect(result.current.quests[0].isClaimed).toBe(true)
    expect(result.current.totalStars).toBe(65)
    expect(result.current.streakState.freezeCount).toBe(2)
  })

  it('handles anonymous mode cleanly without invoking server actions', async () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper })

    act(() => {
      result.current.skip()
    })

    expect(result.current.isAnonymous).toBe(true)
    expect(result.current.session).toBeNull()

    // anonymous actions should not call server actions
    await act(async () => {
      await result.current.buyShopItem('frame_gold')
    })
    expect(gamificationActions.purchaseShopItemAction).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.toggleEquipItem('frame_gold', 'frame')
    })
    expect(gamificationActions.equipShopItemAction).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.claimQuest('any_quest_id')
    })
    expect(gamificationActions.claimQuestRewardAction).not.toHaveBeenCalled()
  })

  it('preserves local quests not yet on cloud and syncs local quest progress', async () => {
    const localDailyQuest: Quest = {
      id: 'quest-local-1',
      title: 'Học từ vựng mới',
      description: 'Chơi flashcard',
      icon: '📚',
      period: 'daily',
      type: 'play_games',
      target: 2,
      current: 1,
      rewardStars: 10,
      rewardFreeze: 0,
      isCompleted: false,
      isClaimed: false,
      dateKey: '2026-09-12',
    }

    const localSharedQuest: Quest = {
      id: 'quest-shared-1',
      title: 'Đạt điểm tối đa',
      description: 'Đạt 80+ điểm',
      icon: '⭐',
      period: 'daily',
      type: 'perfect_score',
      target: 1,
      current: 1,
      rewardStars: 20,
      rewardFreeze: 1,
      isCompleted: true,
      isClaimed: false,
      dateKey: '2026-09-12',
    }

    saveQuestsToStore('CLASS_Q_SYNC', 'Bé Mai', [localDailyQuest, localSharedQuest])

    const cloudSharedQuest: Quest = {
      ...localSharedQuest,
      current: 0,
      isCompleted: false,
    }

    vi.mocked(gamificationActions.getStudentGamificationProfile).mockResolvedValue({
      success: true,
      data: {
        studentId: 'stud-7',
        totalStars: 50,
        effectiveStars: 50,
        streakState: {
          currentStreak: 2,
          longestStreak: 2,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 2,
          unlockedMilestones: [],
        },
        inventory: {
          ownedItemIds: [],
          equippedFrameId: null,
          equippedTitleId: null,
          spentStars: 0,
          bonusStars: 0,
        },
        quests: [cloudSharedQuest],
      },
    })

    vi.mocked(gamificationActions.syncStudentGamificationState).mockResolvedValue({
      success: true,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'CLASS_Q_SYNC',
        studentName: 'Bé Mai',
      })
    })

    await waitFor(() => {
      expect(result.current.quests.length).toBe(2)
      const shared = result.current.quests.find((q) => q.id === 'quest-shared-1')
      expect(shared?.isCompleted).toBe(true)
      const localOnly = result.current.quests.find((q) => q.id === 'quest-local-1')
      expect(localOnly).toBeDefined()
      expect(gamificationActions.syncStudentGamificationState).toHaveBeenCalled()
    })
  })
})
