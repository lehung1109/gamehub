import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateStreakUpdate,
  getInitialStreakState,
  getStoredStreak,
  saveStoredStreak,
  getTodayDateString,
  getEffectiveStreak,
  getDayDifference,
  STREAK_MILESTONES,
} from '@/lib/streak'
import type { StreakState } from '@/types/streak'

describe('Daily Streak Engine (src/lib/streak.ts)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
  })

  describe('getInitialStreakState', () => {
    it('returns default initial state with 1 starting freeze', () => {
      const initial = getInitialStreakState()
      expect(initial).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: '',
        freezeCount: 1,
        totalActiveDays: 0,
        unlockedMilestones: [],
      })
    })
  })

  describe('calculateStreakUpdate', () => {
    it('should start with streak of 1 when playing for the first time', () => {
      const initial = getInitialStreakState()
      const result = calculateStreakUpdate(initial, '2026-09-12')

      expect(result.nextState.currentStreak).toBe(1)
      expect(result.nextState.longestStreak).toBe(1)
      expect(result.nextState.lastActiveDate).toBe('2026-09-12')
      expect(result.nextState.totalActiveDays).toBe(1)
      expect(result.nextState.freezeCount).toBe(1)
      expect(result.streakIncremented).toBe(true)
      expect(result.isNewDay).toBe(true)
      expect(result.freezeUsed).toBe(false)
      expect(result.milestoneBonusStars).toBe(0)
      expect(result.newMilestoneReached).toBeUndefined()
    })

    it('should not increment streak or active days on the same day', () => {
      const state: StreakState = {
        currentStreak: 2,
        longestStreak: 2,
        lastActiveDate: '2026-09-12',
        freezeCount: 1,
        totalActiveDays: 2,
        unlockedMilestones: [],
      }

      const result = calculateStreakUpdate(state, '2026-09-12')
      expect(result.nextState.currentStreak).toBe(2)
      expect(result.nextState.longestStreak).toBe(2)
      expect(result.nextState.totalActiveDays).toBe(2)
      expect(result.streakIncremented).toBe(false)
      expect(result.isNewDay).toBe(false)
      expect(result.freezeUsed).toBe(false)
      expect(result.milestoneBonusStars).toBe(0)
    })

    it('should not change streak if todayDateStr is before lastActiveDate', () => {
      const state: StreakState = {
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: '2026-09-15',
        freezeCount: 1,
        totalActiveDays: 5,
        unlockedMilestones: [3],
      }

      const result = calculateStreakUpdate(state, '2026-09-14')
      expect(result.nextState.currentStreak).toBe(3)
      expect(result.streakIncremented).toBe(false)
      expect(result.isNewDay).toBe(false)
      expect(result.freezeUsed).toBe(false)
    })

    it('should increment streak on consecutive day', () => {
      const state: StreakState = {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: '2026-09-12',
        freezeCount: 1,
        totalActiveDays: 1,
        unlockedMilestones: [],
      }

      const result = calculateStreakUpdate(state, '2026-09-13')
      expect(result.nextState.currentStreak).toBe(2)
      expect(result.nextState.longestStreak).toBe(2)
      expect(result.nextState.lastActiveDate).toBe('2026-09-13')
      expect(result.nextState.totalActiveDays).toBe(2)
      expect(result.streakIncremented).toBe(true)
      expect(result.isNewDay).toBe(true)
      expect(result.freezeUsed).toBe(false)
      expect(result.milestoneBonusStars).toBe(0)
    })

    it('should handle month and year boundaries correctly', () => {
      // Month boundary: Sept 30 -> Oct 1
      const state1: StreakState = {
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: '2026-09-30',
        freezeCount: 1,
        totalActiveDays: 5,
        unlockedMilestones: [3],
      }
      const result1 = calculateStreakUpdate(state1, '2026-10-01')
      expect(result1.nextState.currentStreak).toBe(6)
      expect(result1.streakIncremented).toBe(true)

      // Year boundary: Dec 31 -> Jan 1
      const state2: StreakState = {
        currentStreak: 10,
        longestStreak: 10,
        lastActiveDate: '2026-12-31',
        freezeCount: 1,
        totalActiveDays: 10,
        unlockedMilestones: [3, 7],
      }
      const result2 = calculateStreakUpdate(state2, '2027-01-01')
      expect(result2.nextState.currentStreak).toBe(11)
      expect(result2.streakIncremented).toBe(true)

      // Leap year boundary: Feb 28 -> Feb 29 (2028 is leap year)
      const state3: StreakState = {
        currentStreak: 2,
        longestStreak: 2,
        lastActiveDate: '2028-02-28',
        freezeCount: 1,
        totalActiveDays: 2,
        unlockedMilestones: [],
      }
      const result3 = calculateStreakUpdate(state3, '2028-02-29')
      expect(result3.nextState.currentStreak).toBe(3)
      expect(result3.streakIncremented).toBe(true)
    })

    describe('Streak Milestones', () => {
      it('awards +5 stars on day 3 milestone', () => {
        const state: StreakState = {
          currentStreak: 2,
          longestStreak: 2,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 2,
          unlockedMilestones: [],
        }

        const result = calculateStreakUpdate(state, '2026-09-13')
        expect(result.nextState.currentStreak).toBe(3)
        expect(result.nextState.longestStreak).toBe(3)
        expect(result.milestoneBonusStars).toBe(5)
        expect(result.newMilestoneReached).toBe(3)
        expect(result.nextState.unlockedMilestones).toContain(3)
      })

      it('awards +15 stars on day 7 milestone', () => {
        const state: StreakState = {
          currentStreak: 6,
          longestStreak: 6,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 6,
          unlockedMilestones: [3],
        }

        const result = calculateStreakUpdate(state, '2026-09-13')
        expect(result.nextState.currentStreak).toBe(7)
        expect(result.nextState.longestStreak).toBe(7)
        expect(result.milestoneBonusStars).toBe(15)
        expect(result.newMilestoneReached).toBe(7)
        expect(result.nextState.unlockedMilestones).toEqual([3, 7])
      })

      it('awards +30 stars on day 14 milestone', () => {
        const state: StreakState = {
          currentStreak: 13,
          longestStreak: 13,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 13,
          unlockedMilestones: [3, 7],
        }

        const result = calculateStreakUpdate(state, '2026-09-13')
        expect(result.nextState.currentStreak).toBe(14)
        expect(result.milestoneBonusStars).toBe(30)
        expect(result.newMilestoneReached).toBe(14)
        expect(result.nextState.unlockedMilestones).toEqual([3, 7, 14])
      })

      it('awards +100 stars on day 30 milestone', () => {
        const state: StreakState = {
          currentStreak: 29,
          longestStreak: 29,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 29,
          unlockedMilestones: [3, 7, 14],
        }

        const result = calculateStreakUpdate(state, '2026-09-13')
        expect(result.nextState.currentStreak).toBe(30)
        expect(result.milestoneBonusStars).toBe(100)
        expect(result.newMilestoneReached).toBe(30)
        expect(result.nextState.unlockedMilestones).toEqual([3, 7, 14, 30])
      })

      it('does not re-award bonus if milestone is already in unlockedMilestones', () => {
        const state: StreakState = {
          currentStreak: 2,
          longestStreak: 5,
          lastActiveDate: '2026-09-12',
          freezeCount: 1,
          totalActiveDays: 8,
          unlockedMilestones: [3], // Already unlocked earlier
        }

        const result = calculateStreakUpdate(state, '2026-09-13')
        expect(result.nextState.currentStreak).toBe(3)
        expect(result.milestoneBonusStars).toBe(0)
        expect(result.newMilestoneReached).toBeUndefined()
        expect(result.nextState.unlockedMilestones).toEqual([3])
      })
    })

    describe('Streak Freeze and Reset Logic', () => {
      it('should consume streak freeze if missed 1 day and freezeCount > 0', () => {
        const state: StreakState = {
          currentStreak: 5,
          longestStreak: 5,
          lastActiveDate: '2026-09-10',
          freezeCount: 1,
          totalActiveDays: 5,
          unlockedMilestones: [3],
        }

        // Missed Sept 11, playing on Sept 12 (diff 2 days)
        const result = calculateStreakUpdate(state, '2026-09-12')
        expect(result.freezeUsed).toBe(true)
        expect(result.nextState.freezeCount).toBe(0)
        expect(result.nextState.currentStreak).toBe(6)
        expect(result.nextState.longestStreak).toBe(6)
        expect(result.nextState.lastActiveDate).toBe('2026-09-12')
        expect(result.nextState.totalActiveDays).toBe(6)
        expect(result.streakIncremented).toBe(true)
        expect(result.isNewDay).toBe(true)
      })

      it('awards milestone reached via streak freeze', () => {
        const state: StreakState = {
          currentStreak: 6,
          longestStreak: 6,
          lastActiveDate: '2026-09-10',
          freezeCount: 2,
          totalActiveDays: 6,
          unlockedMilestones: [3],
        }

        // Missed Sept 11, playing on Sept 12 -> freeze used, streak becomes 7 (day 7 milestone)
        const result = calculateStreakUpdate(state, '2026-09-12')
        expect(result.freezeUsed).toBe(true)
        expect(result.nextState.freezeCount).toBe(1)
        expect(result.nextState.currentStreak).toBe(7)
        expect(result.milestoneBonusStars).toBe(15)
        expect(result.newMilestoneReached).toBe(7)
        expect(result.nextState.unlockedMilestones).toContain(7)
      })

      it('should reset streak to 1 if missed 1 day and freezeCount === 0', () => {
        const state: StreakState = {
          currentStreak: 5,
          longestStreak: 5,
          lastActiveDate: '2026-09-10',
          freezeCount: 0,
          totalActiveDays: 5,
          unlockedMilestones: [3],
        }

        const result = calculateStreakUpdate(state, '2026-09-12')
        expect(result.freezeUsed).toBe(false)
        expect(result.nextState.freezeCount).toBe(0)
        expect(result.nextState.currentStreak).toBe(1)
        expect(result.nextState.longestStreak).toBe(5) // Longest preserved
        expect(result.nextState.lastActiveDate).toBe('2026-09-12')
        expect(result.nextState.totalActiveDays).toBe(6)
        expect(result.streakIncremented).toBe(true)
        expect(result.isNewDay).toBe(true)
        expect(result.milestoneBonusStars).toBe(0)
      })

      it('should reset streak to 1 if missed 2 or more days even if freezeCount > 0', () => {
        const state: StreakState = {
          currentStreak: 8,
          longestStreak: 8,
          lastActiveDate: '2026-09-09',
          freezeCount: 2,
          totalActiveDays: 10,
          unlockedMilestones: [3, 7],
        }

        // Missed Sept 10 and Sept 11, playing Sept 12 (diff 3 days)
        const result = calculateStreakUpdate(state, '2026-09-12')
        expect(result.freezeUsed).toBe(false)
        expect(result.nextState.freezeCount).toBe(2) // Freeze NOT wasted for multi-day absence
        expect(result.nextState.currentStreak).toBe(1)
        expect(result.nextState.longestStreak).toBe(8)
        expect(result.nextState.lastActiveDate).toBe('2026-09-12')
        expect(result.nextState.totalActiveDays).toBe(11)
        expect(result.streakIncremented).toBe(true)
        expect(result.isNewDay).toBe(true)
      })

      it('preserves highest longestStreak when currentStreak resets', () => {
        const state: StreakState = {
          currentStreak: 12,
          longestStreak: 20,
          lastActiveDate: '2026-09-01',
          freezeCount: 0,
          totalActiveDays: 30,
          unlockedMilestones: [3, 7, 14],
        }

        const result = calculateStreakUpdate(state, '2026-09-12')
        expect(result.nextState.currentStreak).toBe(1)
        expect(result.nextState.longestStreak).toBe(20)
      })
    })
  })

  describe('Storage Persistence (getStoredStreak & saveStoredStreak)', () => {
    it('persists and retrieves streak from localStorage', () => {
      const state: StreakState = {
        currentStreak: 4,
        longestStreak: 4,
        lastActiveDate: '2026-09-12',
        freezeCount: 2,
        totalActiveDays: 4,
        unlockedMilestones: [3],
      }

      saveStoredStreak('CLASS1', 'Bé An', state)
      const loaded = getStoredStreak('CLASS1', 'Bé An')

      expect(loaded.currentStreak).toBe(4)
      expect(loaded.longestStreak).toBe(4)
      expect(loaded.lastActiveDate).toBe('2026-09-12')
      expect(loaded.freezeCount).toBe(2)
      expect(loaded.totalActiveDays).toBe(4)
      expect(loaded.unlockedMilestones).toEqual([3])
    })

    it('normalizes classCode and studentName for storage keys', () => {
      const state: StreakState = {
        currentStreak: 7,
        longestStreak: 7,
        lastActiveDate: '2026-09-12',
        freezeCount: 1,
        totalActiveDays: 7,
        unlockedMilestones: [3, 7],
      }

      // Save with spaces and mixed case
      saveStoredStreak(' class101  ', '  Nguyen Van A  ', state)

      // Retrieve with trimmed and lower/uppercase variants
      const loaded = getStoredStreak('CLASS101', 'nguyen van a')
      expect(loaded.currentStreak).toBe(7)
      expect(loaded.unlockedMilestones).toEqual([3, 7])
    })

    it('falls back to anon when classCode or studentName are empty/undefined', () => {
      const state: StreakState = {
        currentStreak: 3,
        longestStreak: 3,
        lastActiveDate: '2026-09-12',
        freezeCount: 1,
        totalActiveDays: 3,
        unlockedMilestones: [3],
      }

      saveStoredStreak(undefined, undefined, state)
      const loaded = getStoredStreak()
      expect(loaded.currentStreak).toBe(3)
    })

    it('returns initial state if storage is empty or contains malformed JSON', () => {
      const initial = getStoredStreak('EMPTY', 'student')
      expect(initial).toEqual(getInitialStreakState())

      // Malformed JSON test
      window.localStorage.setItem('gamehub_streak_v1_TEST_student', '{broken json')
      const loadedMalformed = getStoredStreak('TEST', 'student')
      expect(loadedMalformed).toEqual(getInitialStreakState())
    })

    it('falls back gracefully to in-memory store when localStorage throws', () => {
      const state: StreakState = {
        currentStreak: 10,
        longestStreak: 10,
        lastActiveDate: '2026-09-12',
        freezeCount: 3,
        totalActiveDays: 10,
        unlockedMilestones: [3, 7],
      }

      // Simulate localStorage throwing (e.g. quota exceeded or SecurityError)
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError')
      })

      saveStoredStreak('RESTRICTED', 'student1', state)
      const loaded = getStoredStreak('RESTRICTED', 'student1')

      expect(loaded.currentStreak).toBe(10)
      expect(loaded.freezeCount).toBe(3)

      setItemSpy.mockRestore()
      getItemSpy.mockRestore()
    })
  })

  describe('getTodayDateString', () => {
    it('formats a date as YYYY-MM-DD', () => {
      const d = new Date(2026, 8, 12) // Month 8 is September
      expect(getTodayDateString(d)).toBe('2026-09-12')
    })
  })

  describe('STREAK_MILESTONES catalog', () => {
    it('defines milestones for 3, 7, 14, 30 days with correct rewards', () => {
      expect(STREAK_MILESTONES).toEqual([
        { days: 3, bonusStars: 5 },
        { days: 7, bonusStars: 15 },
        { days: 14, bonusStars: 30 },
        { days: 30, bonusStars: 100 },
      ])
    })
  })

  describe('getDayDifference', () => {
    it('returns exact day difference between two dates', () => {
      expect(getDayDifference('2026-09-10', '2026-09-12')).toBe(2)
      expect(getDayDifference('2026-09-12', '2026-09-12')).toBe(0)
      expect(getDayDifference('2026-09-13', '2026-09-12')).toBe(-1)
    })

    it('returns null for invalid date inputs', () => {
      expect(getDayDifference('', '2026-09-12')).toBeNull()
      expect(getDayDifference('invalid', '2026-09-12')).toBeNull()
    })
  })

  describe('getEffectiveStreak', () => {
    it('returns streak of 0 if lastActiveDate is empty', () => {
      const state: StreakState = {
        currentStreak: 5,
        longestStreak: 5,
        lastActiveDate: '',
        freezeCount: 1,
        totalActiveDays: 5,
        unlockedMilestones: [],
      }
      expect(getEffectiveStreak(state, '2026-09-12').currentStreak).toBe(0)
    })

    it('retains currentStreak if active today or yesterday', () => {
      const stateToday: StreakState = {
        currentStreak: 4,
        longestStreak: 4,
        lastActiveDate: '2026-09-12',
        freezeCount: 1,
        totalActiveDays: 4,
        unlockedMilestones: [3],
      }
      expect(getEffectiveStreak(stateToday, '2026-09-12').currentStreak).toBe(4)

      const stateYesterday: StreakState = {
        ...stateToday,
        lastActiveDate: '2026-09-11',
      }
      expect(getEffectiveStreak(stateYesterday, '2026-09-12').currentStreak).toBe(4)
    })

    it('preserves currentStreak when missed 1 day and freezeCount > 0', () => {
      const state: StreakState = {
        currentStreak: 6,
        longestStreak: 6,
        lastActiveDate: '2026-09-10',
        freezeCount: 1,
        totalActiveDays: 6,
        unlockedMilestones: [3],
      }
      // Missed Sept 11, today is Sept 12
      expect(getEffectiveStreak(state, '2026-09-12').currentStreak).toBe(6)
    })

    it('returns 0 when missed 1 day and freezeCount === 0', () => {
      const state: StreakState = {
        currentStreak: 6,
        longestStreak: 6,
        lastActiveDate: '2026-09-10',
        freezeCount: 0,
        totalActiveDays: 6,
        unlockedMilestones: [3],
      }
      expect(getEffectiveStreak(state, '2026-09-12').currentStreak).toBe(0)
    })

    it('returns 0 when missed 2 or more days even with freezes remaining', () => {
      const state: StreakState = {
        currentStreak: 10,
        longestStreak: 10,
        lastActiveDate: '2026-09-08',
        freezeCount: 3,
        totalActiveDays: 10,
        unlockedMilestones: [3, 7],
      }
      // 4 days missed
      expect(getEffectiveStreak(state, '2026-09-12').currentStreak).toBe(0)
      // Longest streak and milestones are preserved
      expect(getEffectiveStreak(state, '2026-09-12').longestStreak).toBe(10)
    })
  })
})
