import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateDailyQuests,
  generateWeeklyQuest,
  getWeekKey,
  getOrGenerateQuests,
  evaluateQuestProgress,
  recordQuestProgress,
  claimQuestReward,
  getStoredQuests,
  saveStoredQuests,
  getQuestStorageKey,
  parseQuests,
} from '@/lib/quests'
import type { Quest, QuestSessionInput } from '@/types/quests'

describe('Daily & Weekly Quests Engine (src/lib/quests.ts)', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
  })

  describe('generateDailyQuests', () => {
    it('generates 3 daily quests deterministically for a dateKey', () => {
      const dateKey = '2026-09-12' // Saturday
      const quests = generateDailyQuests(dateKey)

      expect(quests).toHaveLength(3)

      // Quest 1: Play games
      expect(quests[0]).toEqual({
        id: 'daily_play_games_2026-09-12',
        title: 'Chăm chỉ mỗi ngày',
        description: 'Hoàn thành 2 lượt chơi bất kỳ',
        icon: '🎮',
        type: 'play_games',
        target: 2,
        current: 0,
        rewardStars: 5,
        period: 'daily',
        isCompleted: false,
        isClaimed: false,
        dateKey: '2026-09-12',
      })

      // Quest 2: High score / Perfect score
      expect(quests[1]).toEqual({
        id: 'daily_high_score_2026-09-12',
        title: 'Bách phát bách trúng',
        description: 'Đạt điểm số từ 80% trở lên trong một ván chơi',
        icon: '🎯',
        type: 'perfect_score',
        target: 1,
        current: 0,
        rewardStars: 10,
        period: 'daily',
        isCompleted: false,
        isClaimed: false,
        dateKey: '2026-09-12',
      })

      // Quest 3: Category challenge (Saturday -> grammar)
      expect(quests[2]).toEqual({
        id: 'daily_category_2026-09-12',
        title: 'Thử thách trọng tâm',
        description: 'Thực hành ngữ pháp trong Tenses hoặc Parts of Speech',
        icon: '⭐',
        type: 'game_category',
        target: 1,
        current: 0,
        rewardStars: 10,
        period: 'daily',
        isCompleted: false,
        isClaimed: false,
        dateKey: '2026-09-12',
        categoryFilter: 'grammar',
      })
    })

    it('rotates category challenge correctly according to day of week', () => {
      // Sunday: 2026-09-13 (day 0) -> pronunciation
      const sunQuests = generateDailyQuests('2026-09-13')
      expect(sunQuests[2].categoryFilter).toBe('pronunciation')
      expect(sunQuests[2].description).toBe('Luyện phát âm chuẩn trong Pronunciation Lab')

      // Monday: 2026-09-14 (day 1) -> vocabulary
      const monQuests = generateDailyQuests('2026-09-14')
      expect(monQuests[2].categoryFilter).toBe('vocabulary')
      expect(monQuests[2].description).toBe('Chinh phục từ vựng trong Flashcard hoặc Wordle')

      // Tuesday: 2026-09-15 (day 2) -> grammar
      const tueQuests = generateDailyQuests('2026-09-15')
      expect(tueQuests[2].categoryFilter).toBe('grammar')
      expect(tueQuests[2].description).toBe('Thực hành ngữ pháp trong Tenses hoặc Parts of Speech')

      // Wednesday: 2026-09-16 (day 3) -> pronunciation
      const wedQuests = generateDailyQuests('2026-09-16')
      expect(wedQuests[2].categoryFilter).toBe('pronunciation')

      // Thursday: 2026-09-17 (day 4) -> vocabulary
      const thuQuests = generateDailyQuests('2026-09-17')
      expect(thuQuests[2].categoryFilter).toBe('vocabulary')

      // Friday: 2026-09-18 (day 5) -> grammar
      const friQuests = generateDailyQuests('2026-09-18')
      expect(friQuests[2].categoryFilter).toBe('grammar')

      // Saturday: 2026-09-19 (day 6) -> grammar
      const satQuests = generateDailyQuests('2026-09-19')
      expect(satQuests[2].categoryFilter).toBe('grammar')
    })
  })

  describe('generateWeeklyQuest', () => {
    it('generates weekly warrior quest for a weekKey', () => {
      const quest = generateWeeklyQuest('2026-W37')
      expect(quest).toEqual({
        id: 'weekly_warrior_2026-W37',
        title: 'Chiến binh tuần lễ',
        description: 'Hoàn thành 6 lượt chơi trong tuần',
        icon: '🏆',
        type: 'play_games',
        target: 6,
        current: 0,
        rewardStars: 35,
        rewardFreeze: 1,
        period: 'weekly',
        isCompleted: false,
        isClaimed: false,
        dateKey: '2026-W37',
      })
    })
  })

  describe('getWeekKey', () => {
    it('calculates ISO week string correctly from YYYY-MM-DD or Date', () => {
      // 2026-09-12 is in week 37
      expect(getWeekKey('2026-09-12')).toBe('2026-W37')
      expect(getWeekKey('2026-09-13')).toBe('2026-W37') // Sunday belongs to week 37 in ISO-8601
      expect(getWeekKey('2026-09-14')).toBe('2026-W38') // Monday starts week 38

      const dateObj = new Date(Date.UTC(2026, 8, 12))
      expect(getWeekKey(dateObj)).toBe('2026-W37')
    })
  })

  describe('getOrGenerateQuests', () => {
    it('generates initial daily and weekly quests if storage is empty', () => {
      const quests = getOrGenerateQuests('2026-09-12', 'CLASS_A', 'Alice')
      expect(quests).toHaveLength(4)
      expect(quests.filter(q => q.period === 'daily')).toHaveLength(3)
      expect(quests.filter(q => q.period === 'weekly')).toHaveLength(1)

      const weekly = quests.find(q => q.period === 'weekly')
      expect(weekly?.id).toBe('weekly_warrior_2026-W37')

      // Should be stored
      const stored = getStoredQuests('CLASS_A', 'Alice')
      expect(stored).toEqual(quests)
    })

    it('returns existing quests if dateKey and weekKey are unchanged', () => {
      // Seed storage with in-progress quests
      const initial = getOrGenerateQuests('2026-09-12', 'CLASS_A', 'Alice')
      initial[0].current = 1
      saveStoredQuests('CLASS_A', 'Alice', initial)

      const loaded = getOrGenerateQuests('2026-09-12', 'CLASS_A', 'Alice')
      expect(loaded[0].current).toBe(1)
    })

    it('refreshes daily quests on new day while preserving weekly quest progress in same week', () => {
      // Day 1: Saturday 2026-09-12 (Week 37)
      const day1Quests = getOrGenerateQuests('2026-09-12', 'CLASS_A', 'Alice')
      day1Quests[0].current = 2
      day1Quests[0].isCompleted = true
      // Weekly quest progress: 2 / 6
      const weeklyIdx = day1Quests.findIndex(q => q.period === 'weekly')
      day1Quests[weeklyIdx].current = 2
      saveStoredQuests('CLASS_A', 'Alice', day1Quests)

      // Day 2: Sunday 2026-09-13 (Still Week 37)
      const day2Quests = getOrGenerateQuests('2026-09-13', 'CLASS_A', 'Alice')
      expect(day2Quests).toHaveLength(4)

      // Daily quests should be fresh for 2026-09-13
      const dailyQuests = day2Quests.filter(q => q.period === 'daily')
      dailyQuests.forEach(q => {
        expect(q.dateKey).toBe('2026-09-13')
        expect(q.current).toBe(0)
        expect(q.isCompleted).toBe(false)
      })

      // Weekly quest should retain progress of 2
      const updatedWeekly = day2Quests.find(q => q.period === 'weekly')
      expect(updatedWeekly?.id).toBe('weekly_warrior_2026-W37')
      expect(updatedWeekly?.current).toBe(2)
      expect(updatedWeekly?.isCompleted).toBe(false)
    })

    it('refreshes both daily and weekly quests when entering a new week', () => {
      // Week 37: Sunday 2026-09-13
      const week37Quests = getOrGenerateQuests('2026-09-13', 'CLASS_A', 'Alice')
      const weeklyIdx = week37Quests.findIndex(q => q.period === 'weekly')
      week37Quests[weeklyIdx].current = 5
      saveStoredQuests('CLASS_A', 'Alice', week37Quests)

      // Week 38: Monday 2026-09-14
      const week38Quests = getOrGenerateQuests('2026-09-14', 'CLASS_A', 'Alice')
      expect(week38Quests).toHaveLength(4)

      const newWeekly = week38Quests.find(q => q.period === 'weekly')
      expect(newWeekly?.id).toBe('weekly_warrior_2026-W38')
      expect(newWeekly?.current).toBe(0)
      expect(newWeekly?.dateKey).toBe('2026-W38')
    })
  })

  describe('evaluateQuestProgress & recordQuestProgress', () => {
    it('updates play_games quests regardless of gameType', () => {
      const quests = generateDailyQuests('2026-09-12')
      const session: QuestSessionInput = {
        gameType: 'wordle',
        score: 70,
        starsEarned: 3,
      }

      const { updatedQuests, newlyCompleted } = evaluateQuestProgress(quests, session)
      const playQuest = updatedQuests.find(q => q.type === 'play_games')
      expect(playQuest?.current).toBe(1)
      expect(playQuest?.isCompleted).toBe(false)
      expect(newlyCompleted).toHaveLength(0)

      // Second play completes the quest (target = 2)
      const secondRun = evaluateQuestProgress(updatedQuests, session)
      const playQuest2 = secondRun.updatedQuests.find(q => q.type === 'play_games')
      expect(playQuest2?.current).toBe(2)
      expect(playQuest2?.isCompleted).toBe(true)
      expect(secondRun.newlyCompleted).toContainEqual(playQuest2)
    })

    it('updates perfect_score quest only if score >= 80', () => {
      const quests = generateDailyQuests('2026-09-12')

      // Score 79% does not increment
      const lowSession: QuestSessionInput = {
        gameType: 'tenses',
        score: 79,
        starsEarned: 2,
      }
      const lowResult = evaluateQuestProgress(quests, lowSession)
      const lowQuest = lowResult.updatedQuests.find(q => q.type === 'perfect_score')
      expect(lowQuest?.current).toBe(0)
      expect(lowQuest?.isCompleted).toBe(false)

      // Score 80% increments and completes
      const passSession: QuestSessionInput = {
        gameType: 'tenses',
        score: 80,
        starsEarned: 4,
      }
      const passResult = evaluateQuestProgress(quests, passSession)
      const passQuest = passResult.updatedQuests.find(q => q.type === 'perfect_score')
      expect(passQuest?.current).toBe(1)
      expect(passQuest?.isCompleted).toBe(true)
      expect(passResult.newlyCompleted).toContainEqual(passQuest)
    })

    describe('game_category matching', () => {
      it('matches pronunciation games', () => {
        const quest: Quest = {
          id: 'test_pronunciation',
          title: 'Luyện âm',
          description: 'desc',
          icon: '⭐',
          type: 'game_category',
          target: 1,
          current: 0,
          rewardStars: 10,
          period: 'daily',
          isCompleted: false,
          isClaimed: false,
          dateKey: '2026-09-13',
          categoryFilter: 'pronunciation',
        }

        // Non-matching game
        const res1 = evaluateQuestProgress([quest], { gameType: 'wordle', score: 90, starsEarned: 5 })
        expect(res1.updatedQuests[0].current).toBe(0)

        // Matching game
        const res2 = evaluateQuestProgress([quest], { gameType: 'pronunciation', score: 90, starsEarned: 5 })
        expect(res2.updatedQuests[0].current).toBe(1)
        expect(res2.updatedQuests[0].isCompleted).toBe(true)
      })

      it('matches vocabulary games', () => {
        const vocabGames = [
          'flashcard',
          'wordle',
          'word-search',
          'falling-words',
          'memory-match',
          'crossword',
          'word-connect',
          'odd-one-out',
          'vocab-defense',
          'hangman',
          'spelling',
          'numbers-colors',
          'alphabet',
        ]

        for (const game of vocabGames) {
          const quest: Quest = {
            id: `test_vocab_${game}`,
            title: 'Từ vựng',
            description: 'desc',
            icon: '⭐',
            type: 'game_category',
            target: 1,
            current: 0,
            rewardStars: 10,
            period: 'daily',
            isCompleted: false,
            isClaimed: false,
            dateKey: '2026-09-14',
            categoryFilter: 'vocabulary',
          }

          const res = evaluateQuestProgress([quest], { gameType: game, score: 85, starsEarned: 4 })
          expect(res.updatedQuests[0].current).toBe(1)
          expect(res.updatedQuests[0].isCompleted).toBe(true)
        }

        // Grammar game should not match vocabulary
        const quest: Quest = {
          id: 'test_vocab_mismatch',
          title: 'Từ vựng',
          description: 'desc',
          icon: '⭐',
          type: 'game_category',
          target: 1,
          current: 0,
          rewardStars: 10,
          period: 'daily',
          isCompleted: false,
          isClaimed: false,
          dateKey: '2026-09-14',
          categoryFilter: 'vocabulary',
        }
        const mismatchRes = evaluateQuestProgress([quest], { gameType: 'tenses', score: 95, starsEarned: 5 })
        expect(mismatchRes.updatedQuests[0].current).toBe(0)
      })

      it('matches grammar games (tenses, parts-of-speech, grammar-detective, sentences)', () => {
        const grammarGames = ['tenses', 'parts-of-speech', 'grammar-detective', 'sentences']

        for (const game of grammarGames) {
          const quest: Quest = {
            id: `test_grammar_${game}`,
            title: 'Ngữ pháp',
            description: 'desc',
            icon: '⭐',
            type: 'game_category',
            target: 1,
            current: 0,
            rewardStars: 10,
            period: 'daily',
            isCompleted: false,
            isClaimed: false,
            dateKey: '2026-09-12',
            categoryFilter: 'grammar',
          }

          const res = evaluateQuestProgress([quest], { gameType: game, score: 90, starsEarned: 5 })
          expect(res.updatedQuests[0].current).toBe(1)
          expect(res.updatedQuests[0].isCompleted).toBe(true)
        }

        // Vocab game should not match grammar
        const quest: Quest = {
          id: 'test_grammar_mismatch',
          title: 'Ngữ pháp',
          description: 'desc',
          icon: '⭐',
          type: 'game_category',
          target: 1,
          current: 0,
          rewardStars: 10,
          period: 'daily',
          isCompleted: false,
          isClaimed: false,
          dateKey: '2026-09-12',
          categoryFilter: 'grammar',
        }
        const mismatchRes = evaluateQuestProgress([quest], { gameType: 'wordle', score: 95, starsEarned: 5 })
        expect(mismatchRes.updatedQuests[0].current).toBe(0)
      })
    })

    it('updates earn_stars quests proportionally with starsEarned', () => {
      const quest: Quest = {
        id: 'test_stars',
        title: 'Tích lũy sao',
        description: 'Kiếm 10 sao',
        icon: '⭐',
        type: 'earn_stars',
        target: 10,
        current: 3,
        rewardStars: 15,
        period: 'daily',
        isCompleted: false,
        isClaimed: false,
        dateKey: '2026-09-12',
      }

      const res = evaluateQuestProgress([quest], { gameType: 'tenses', score: 90, starsEarned: 5 })
      expect(res.updatedQuests[0].current).toBe(8)
      expect(res.updatedQuests[0].isCompleted).toBe(false)

      const finalRes = evaluateQuestProgress(res.updatedQuests, { gameType: 'tenses', score: 100, starsEarned: 4 })
      expect(finalRes.updatedQuests[0].current).toBe(10) // capped at target
      expect(finalRes.updatedQuests[0].isCompleted).toBe(true)
      expect(finalRes.newlyCompleted).toHaveLength(1)
    })

    it('skips already completed quests without modifying or re-completing them', () => {
      const quest: Quest = {
        id: 'already_done',
        title: 'Xong rồi',
        description: 'desc',
        icon: '✅',
        type: 'play_games',
        target: 2,
        current: 2,
        rewardStars: 5,
        period: 'daily',
        isCompleted: true,
        isClaimed: false,
        dateKey: '2026-09-12',
      }

      const res = evaluateQuestProgress([quest], { gameType: 'wordle', score: 100, starsEarned: 5 })
      expect(res.updatedQuests[0].current).toBe(2)
      expect(res.newlyCompleted).toHaveLength(0)
    })

    it('recordQuestProgress is an alias of evaluateQuestProgress', () => {
      const quests = generateDailyQuests('2026-09-12')
      const session: QuestSessionInput = { gameType: 'wordle', score: 85, starsEarned: 3 }
      const res = recordQuestProgress(quests, session)
      expect(res.updatedQuests).toBeDefined()
    })
  })

  describe('claimQuestReward', () => {
    it('successfully claims a completed quest reward', () => {
      const quest: Quest = {
        id: 'quest_to_claim',
        title: 'Nhiệm vụ',
        description: 'desc',
        icon: '🎮',
        type: 'play_games',
        target: 2,
        current: 2,
        rewardStars: 5,
        period: 'daily',
        isCompleted: true,
        isClaimed: false,
        dateKey: '2026-09-12',
      }

      const result = claimQuestReward([quest], 'quest_to_claim')
      expect(result.error).toBeUndefined()
      expect(result.claimedReward).toEqual({ stars: 5, freeze: 0 })
      expect(result.updatedQuests[0].isClaimed).toBe(true)
    })

    it('successfully claims a weekly quest with freeze reward', () => {
      const weeklyQuest: Quest = {
        id: 'weekly_warrior_2026-W37',
        title: 'Chiến binh',
        description: 'desc',
        icon: '🏆',
        type: 'play_games',
        target: 6,
        current: 6,
        rewardStars: 35,
        rewardFreeze: 1,
        period: 'weekly',
        isCompleted: true,
        isClaimed: false,
        dateKey: '2026-W37',
      }

      const result = claimQuestReward([weeklyQuest], 'weekly_warrior_2026-W37')
      expect(result.error).toBeUndefined()
      expect(result.claimedReward).toEqual({ stars: 35, freeze: 1 })
      expect(result.updatedQuests[0].isClaimed).toBe(true)
    })

    it('returns error if quest is not found', () => {
      const quest: Quest = {
        id: 'quest_1',
        title: 'Quest 1',
        description: 'desc',
        icon: '🎮',
        type: 'play_games',
        target: 1,
        current: 1,
        rewardStars: 5,
        period: 'daily',
        isCompleted: true,
        isClaimed: false,
        dateKey: '2026-09-12',
      }

      const result = claimQuestReward([quest], 'non_existent_id')
      expect(result.claimedReward).toBeNull()
      expect(result.error).toBe('Quest not found')
      expect(result.updatedQuests).toEqual([quest])
    })

    it('returns error if quest is not completed yet', () => {
      const quest: Quest = {
        id: 'quest_incomplete',
        title: 'Quest Incomplete',
        description: 'desc',
        icon: '🎮',
        type: 'play_games',
        target: 2,
        current: 1,
        rewardStars: 5,
        period: 'daily',
        isCompleted: false,
        isClaimed: false,
        dateKey: '2026-09-12',
      }

      const result = claimQuestReward([quest], 'quest_incomplete')
      expect(result.claimedReward).toBeNull()
      expect(result.error).toBe('Quest is not completed yet')
      expect(result.updatedQuests[0].isClaimed).toBe(false)
    })

    it('returns error if quest was already claimed', () => {
      const quest: Quest = {
        id: 'quest_claimed',
        title: 'Quest Claimed',
        description: 'desc',
        icon: '🎮',
        type: 'play_games',
        target: 2,
        current: 2,
        rewardStars: 5,
        period: 'daily',
        isCompleted: true,
        isClaimed: true,
        dateKey: '2026-09-12',
      }

      const result = claimQuestReward([quest], 'quest_claimed')
      expect(result.claimedReward).toBeNull()
      expect(result.error).toBe('Quest reward has already been claimed')
    })
  })

  describe('Storage Persistence (getStoredQuests & saveStoredQuests)', () => {
    it('persists and retrieves quests from localStorage', () => {
      const quests = generateDailyQuests('2026-09-12')
      saveStoredQuests('CLASS1', 'Bé An', quests)

      const loaded = getStoredQuests('CLASS1', 'Bé An')
      expect(loaded).toEqual(quests)
    })

    it('normalizes classCode and studentName for storage keys', () => {
      const key = getQuestStorageKey(' class101  ', '  Nguyen Van A  ')
      expect(key).toBe('gamehub_quests_v1_CLASS101_nguyen van a')

      const quests = generateDailyQuests('2026-09-12')
      saveStoredQuests(' class101  ', '  Nguyen Van A  ', quests)

      const loaded = getStoredQuests('CLASS101', 'nguyen van a')
      expect(loaded).toEqual(quests)
    })

    it('falls back to anon when classCode or studentName are empty or undefined', () => {
      const key = getQuestStorageKey(undefined, undefined)
      expect(key).toBe('gamehub_quests_v1_ANON_anon')

      const quests = generateDailyQuests('2026-09-12')
      saveStoredQuests(undefined, undefined, quests)

      const loaded = getStoredQuests()
      expect(loaded).toEqual(quests)
    })

    it('returns empty array when storage is empty or malformed', () => {
      expect(getStoredQuests('EMPTY', 'student')).toEqual([])

      window.localStorage.setItem('gamehub_quests_v1_TEST_student', '{invalid json')
      expect(getStoredQuests('TEST', 'student')).toEqual([])
    })

    it('parseQuests safely returns array or empty array on bad JSON', () => {
      expect(parseQuests('invalid json')).toEqual([])
      expect(parseQuests('{"not": "an array"}')).toEqual([])
      expect(parseQuests('[{"id": "q1"}]')).toEqual([{ id: 'q1' }])
    })

    it('falls back to in-memory store when localStorage throws', () => {
      const quests = generateDailyQuests('2026-09-12')

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceeded')
      })
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError')
      })

      saveStoredQuests('RESTRICTED', 'student', quests)
      const loaded = getStoredQuests('RESTRICTED', 'student')
      expect(loaded).toEqual(quests)

      setItemSpy.mockRestore()
      getItemSpy.mockRestore()
    })
  })
})
