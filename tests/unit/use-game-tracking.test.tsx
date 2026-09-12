// tests/unit/use-game-tracking.test.tsx
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGameTracking } from '@/hooks/use-game-tracking'
import { StudentSessionProvider, STUDENT_SESSION_KEY } from '@/hooks/use-student-session'
import { getStoredStreak, getTodayDateString } from '@/lib/streak'
import { getStoredQuests } from '@/lib/quests'
import { syncStudentGamificationState } from '@/app/actions/student-gamification'
import { getStoredSrsDeck } from '@/lib/srs-storage'
import { syncSrsDeckAction } from '@/app/actions/srs'

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn().mockResolvedValue({
    success: true,
    totalStars: 0,
  }),
}))

vi.mock('@/app/actions/srs', () => ({
  syncSrsDeckAction: vi.fn().mockResolvedValue({
    success: true,
  }),
}))

vi.mock('@/app/actions/student-gamification', () => ({
  getStudentGamificationProfile: vi.fn().mockResolvedValue({
    success: false,
  }),
  syncStudentGamificationState: vi.fn().mockResolvedValue({
    success: true,
  }),
  purchaseShopItemAction: vi.fn().mockResolvedValue({
    success: true,
  }),
  equipShopItemAction: vi.fn().mockResolvedValue({
    success: true,
  }),
  claimQuestRewardAction: vi.fn().mockResolvedValue({
    success: true,
  }),
}))

vi.mock('@/app/actions/roadmap', () => ({
  getStudentRoadmapProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { totalStars: 0, completedNodeIds: [], nodesProgress: {} },
  }),
  syncLocalRoadmapProgressAction: vi.fn().mockResolvedValue({
    success: true,
    syncedCount: 0,
  }),
}))

describe('useGameTracking Hook', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    window.sessionStorage.clear()
    window.localStorage.clear()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  const createWrapper = (sessionData?: {
    classCode: string
    studentName: string
    className?: string
    isAnonymous?: boolean
  }) => {
    if (sessionData) {
      window.sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(sessionData))
    }

    const TestWrapper = ({ children }: { children: React.ReactNode }) => (
      <StudentSessionProvider>{children}</StudentSessionProvider>
    )
    TestWrapper.displayName = 'TestWrapper'
    return TestWrapper
  }

  it('initializes with isTracking false when no student session exists', () => {
    const { result } = renderHook(
      () => useGameTracking({ gameType: 'listening', topic: 'animals' }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isTracking).toBe(false)
    expect(result.current.session).toBeNull()
    expect(result.current.details).toEqual([])
  })

  it('initializes with isTracking false when student is playing anonymously', () => {
    const { result } = renderHook(
      () => useGameTracking({ gameType: 'listening', topic: 'animals' }),
      { wrapper: createWrapper({ classCode: '', studentName: '', isAnonymous: true }) }
    )

    expect(result.current.isTracking).toBe(false)
    expect(result.current.isAnonymous).toBe(true)
  })

  it('initializes with isTracking true when a valid student session exists', async () => {
    const { result } = renderHook(
      () => useGameTracking({ gameType: 'listening', topic: 'animals', configId: 'cfg-1' }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
          className: 'Lớp 1A',
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    expect(result.current.session).toEqual(
      expect.objectContaining({
        classCode: 'ABC123',
        studentName: 'Bé Linh',
      })
    )
  })

  it('records question answers into details array', async () => {
    const { result } = renderHook(
      () => useGameTracking({ gameType: 'listening', topic: 'animals' }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    act(() => {
      result.current.recordQuestion({
        prompt: 'cat',
        selectedAnswer: 'cat',
        correctAnswer: 'cat',
        isCorrect: true,
        timeTakenMs: 1200,
        attempts: 1,
      })
    })

    expect(result.current.details).toHaveLength(1)
    expect(result.current.details[0]).toEqual({
      prompt: 'cat',
      selectedAnswer: 'cat',
      correctAnswer: 'cat',
      isCorrect: true,
      timeTakenMs: 1200,
      attempts: 1,
    })

    act(() => {
      result.current.recordQuestion({
        prompt: 'dog',
        selectedAnswer: 'bird',
        correctAnswer: 'dog',
        isCorrect: false,
        timeTakenMs: 2500,
      })
    })

    expect(result.current.details).toHaveLength(2)
    expect(result.current.details[1].isCorrect).toBe(false)
  })

  it('submits game session to /api/track with accumulated questions and calculates score', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-1' }),
    })
    global.fetch = mockFetch

    const { result } = renderHook(
      () =>
        useGameTracking({
          gameType: 'listening',
          topic: 'animals',
          configId: 'cfg-abc',
        }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
        }),
      }
    )

    act(() => {
      result.current.recordQuestion({
        prompt: 'cat',
        selectedAnswer: 'cat',
        correctAnswer: 'cat',
        isCorrect: true,
        timeTakenMs: 1000,
      })
      result.current.recordQuestion({
        prompt: 'dog',
        selectedAnswer: 'cat',
        correctAnswer: 'dog',
        isCorrect: false,
        timeTakenMs: 2000,
      })
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/track',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })
    )

    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(sentBody).toEqual(
      expect.objectContaining({
        classCode: 'ABC123',
        studentName: 'Bé Linh',
        gameType: 'listening',
        topic: 'animals',
        score: 1, // 1 correct out of 2
        totalQuestions: 2,
        configId: 'cfg-abc',
        details: expect.arrayContaining([
          expect.objectContaining({ prompt: 'cat', isCorrect: true }),
          expect.objectContaining({ prompt: 'dog', isCorrect: false }),
        ]),
      })
    )
    expect(sentBody.startedAt).toBeDefined()
    expect(sentBody.completedAt).toBeDefined()
  })

  it('allows overriding score, totalQuestions, topic, and gameType on submitSession', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-override' }),
    })
    global.fetch = mockFetch

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'spelling', topic: 'fruits' }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Minh',
        }),
      }
    )

    await act(async () => {
      await result.current.submitSession({
        score: 5,
        totalQuestions: 5,
        topic: 'school',
        details: [
          {
            prompt: 'pen',
            selectedAnswer: 'pen',
            correctAnswer: 'pen',
            isCorrect: true,
            timeTakenMs: 3000,
          },
        ],
      })
    })

    const sentBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(sentBody.score).toBe(5)
    expect(sentBody.totalQuestions).toBe(5)
    expect(sentBody.topic).toBe('school')
    expect(sentBody.details).toHaveLength(1)
  })

  it('does NOT call fetch if isTracking is false', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'listening', topic: 'animals' }),
      { wrapper: createWrapper() }
    )

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('handles network error silently without throwing an exception', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network offline'))
    global.fetch = mockFetch

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'listening', topic: 'animals' }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
        }),
      }
    )

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(false)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('resets details and timer on resetSession', async () => {
    const { result } = renderHook(
      () => useGameTracking({ gameType: 'listening', topic: 'animals' }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    act(() => {
      result.current.recordQuestion({
        prompt: 'apple',
        isCorrect: true,
        timeTakenMs: 1000,
      })
    })

    expect(result.current.details).toHaveLength(1)

    act(() => {
      result.current.resetSession()
    })

    expect(result.current.details).toHaveLength(0)
  })

  it('triggers progress refresh in StudentSessionContext upon successful submit', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-success' }),
    })
    global.fetch = mockFetch

    const studentProgressAction = await import('@/app/actions/student-progress')
    const getProgressSpy = vi.spyOn(studentProgressAction, 'getStudentProgress')
    getProgressSpy.mockResolvedValue({
      success: true,
      totalStars: 50,
    })

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'flashcard', topic: 'animals' }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
        }),
      }
    )

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 5, totalQuestions: 5 })
    })

    expect(success).toBe(true)
    expect(getProgressSpy).toHaveBeenCalled()
  })

  it('sanitizes score and totalQuestions to non-negative integers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-sanitized' }),
    })
    global.fetch = mockFetch

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'typing', topic: 'general' }),
      {
        wrapper: createWrapper({
          classCode: 'ABC123',
          studentName: 'Bé Linh',
        }),
      }
    )

    await act(async () => {
      await result.current.submitSession({ score: -5.4, totalQuestions: 9.7 })
    })

    expect(mockFetch).toHaveBeenCalled()
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(callBody.score).toBe(0) // Math.max(0, Math.round(-5.4)) = 0
    expect(callBody.totalQuestions).toBe(10) // Math.max(0, Math.round(9.7)) = 10
  })

  it('submitSession updates daily streak in storage upon completion', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-streak' }),
    })
    global.fetch = mockFetch

    const classCode = 'CLASS_STREAK'
    const studentName = 'Bé Hoa'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'flashcard', topic: 'animals' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    const streakBefore = getStoredStreak(classCode, studentName)
    expect(streakBefore.currentStreak).toBe(0)

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 5, totalQuestions: 5 })
    })

    expect(success).toBe(true)

    const streakAfter = getStoredStreak(classCode, studentName)
    expect(streakAfter.currentStreak).toBe(1)
    expect(streakAfter.totalActiveDays).toBe(1)
    expect(streakAfter.lastActiveDate).toBe(getTodayDateString())
  })

  it('submitSession updates quest progress in storage upon completion', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-quests' }),
    })
    global.fetch = mockFetch

    const classCode = 'CLASS_QUESTS'
    const studentName = 'Bé Nam'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'wordle', topic: 'vocab' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 5, totalQuestions: 5 })
    })

    expect(success).toBe(true)

    const questsAfter = getStoredQuests(classCode, studentName)
    expect(questsAfter.length).toBeGreaterThan(0)

    const playQuest = questsAfter.find((q) => q.type === 'play_games' && q.period === 'daily')
    expect(playQuest).toBeDefined()
    expect(playQuest?.current).toBe(1)

    const perfectScoreQuest = questsAfter.find((q) => q.type === 'perfect_score')
    expect(perfectScoreQuest).toBeDefined()
    expect(perfectScoreQuest?.current).toBe(1)
    expect(perfectScoreQuest?.isCompleted).toBe(true)
  })

  it('submitSession updates streak and quests for anonymous sessions without calling /api/track', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'flashcard', topic: 'animals' }),
      {
        wrapper: createWrapper({
          classCode: '',
          studentName: '',
          isAnonymous: true,
        }),
      }
    )

    expect(result.current.isAnonymous).toBe(true)
    expect(result.current.isTracking).toBe(false)

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 4, totalQuestions: 5 })
    })

    expect(success).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()

    const anonStreak = getStoredStreak()
    expect(anonStreak.currentStreak).toBe(1)

    const anonQuests = getStoredQuests()
    const playQuest = anonQuests.find((q) => q.type === 'play_games' && q.period === 'daily')
    expect(playQuest?.current).toBe(1)
  })

  it('dispatches cloud gamification sync with updated streak, quests, and inventory on session completion in classroom mode', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-sync' }),
    })
    global.fetch = mockFetch

    const classCode = 'CLASS_SYNC'
    const studentName = 'Bé An'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'quiz', topic: 'science' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 10, totalQuestions: 10 })
    })

    expect(success).toBe(true)
    expect(syncStudentGamificationState).toHaveBeenCalledTimes(1)
    expect(syncStudentGamificationState).toHaveBeenCalledWith(
      expect.objectContaining({
        classCode,
        studentName,
        streakState: expect.objectContaining({
          currentStreak: 1,
          totalActiveDays: 1,
        }),
        quests: expect.any(Array),
        inventory: expect.any(Object),
      })
    )
  })

  it('does NOT call syncStudentGamificationState in anonymous mode upon session submit', async () => {
    const { result } = renderHook(
      () => useGameTracking({ gameType: 'quiz', topic: 'science' }),
      {
        wrapper: createWrapper({
          classCode: '',
          studentName: '',
          isAnonymous: true,
        }),
      }
    )

    expect(result.current.isAnonymous).toBe(true)

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 5, totalQuestions: 5 })
    })

    expect(success).toBe(true)
    expect(syncStudentGamificationState).not.toHaveBeenCalled()
  })

  it('does not block submitSession if syncStudentGamificationState rejects', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-sync-fail' }),
    })
    global.fetch = mockFetch

    vi.mocked(syncStudentGamificationState).mockRejectedValueOnce(new Error('Cloud sync offline'))

    const classCode = 'CLASS_SYNC_FAIL'
    const studentName = 'Bé Binh'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'quiz', topic: 'science' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 8, totalQuestions: 10 })
    })

    expect(success).toBe(true)
    expect(syncStudentGamificationState).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      '[useGameTracking] Error syncing gamification state to cloud:',
      expect.any(Error)
    )
    warnSpy.mockRestore()
  })

  it('does NOT invoke syncStudentGamificationState if /api/track fails with non-200 status', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Database error' }),
    })
    global.fetch = mockFetch

    const classCode = 'CLASS_TRACK_FAIL'
    const studentName = 'Bé Chi'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'quiz', topic: 'science' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 5, totalQuestions: 5 })
    })

    expect(success).toBe(false)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(syncStudentGamificationState).not.toHaveBeenCalled()
  })

  it('invokes syncStudentGamificationState strictly after /api/track completes successfully', async () => {
    const callOrder: string[] = []
    const mockFetch = vi.fn().mockImplementation(async () => {
      callOrder.push('fetch_track')
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, sessionId: 'sess-order' }),
      }
    })
    global.fetch = mockFetch

    vi.mocked(syncStudentGamificationState).mockImplementation(async () => {
      callOrder.push('sync_gamification')
      return { success: true }
    })

    const classCode = 'CLASS_ORDER'
    const studentName = 'Bé Dan'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'quiz', topic: 'science' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession({ score: 7, totalQuestions: 10 })
    })

    expect(success).toBe(true)
    expect(callOrder).toEqual(['fetch_track', 'sync_gamification'])
  })

  it('ingests wrong answers into local SRS deck and syncs to cloud on successful session submission', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-srs' }),
    })
    global.fetch = mockFetch

    const classCode = 'CLASS_SRS'
    const studentName = 'Bé Lan'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'vocab', topic: 'animals' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    act(() => {
      result.current.recordQuestion({
        prompt: 'cat',
        correctAnswer: 'con mèo',
        selectedAnswer: 'con mèo',
        isCorrect: true,
      })
      result.current.recordQuestion({
        prompt: 'dog',
        correctAnswer: 'con chó',
        selectedAnswer: 'con chim',
        isCorrect: false,
      })
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(true)

    // Check local deck
    const storedDeck = getStoredSrsDeck(classCode, studentName)
    expect(storedDeck).toHaveLength(1)
    expect(storedDeck[0]).toEqual(
      expect.objectContaining({
        prompt: 'dog',
        correctAnswer: 'con chó',
        selectedAnswer: 'con chim',
        gameType: 'vocab',
        topic: 'animals',
        box: 1,
        mistakeCount: 1,
        isMastered: false,
      })
    )

    // Check cloud sync action
    expect(syncSrsDeckAction).toHaveBeenCalledTimes(1)
    expect(syncSrsDeckAction).toHaveBeenCalledWith({
      classCode,
      studentName,
      deck: storedDeck,
    })
  })

  it('updates local SRS deck for anonymous session without calling syncSrsDeckAction', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'vocab', topic: 'fruits' }),
      {
        wrapper: createWrapper({
          classCode: '',
          studentName: '',
          isAnonymous: true,
        }),
      }
    )

    expect(result.current.isAnonymous).toBe(true)

    act(() => {
      result.current.recordQuestion({
        prompt: 'banana',
        correctAnswer: 'quả chuối',
        selectedAnswer: 'quả táo',
        isCorrect: false,
      })
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(syncSrsDeckAction).not.toHaveBeenCalled()

    const anonDeck = getStoredSrsDeck()
    expect(anonDeck).toHaveLength(1)
    expect(anonDeck[0].prompt).toBe('banana')
  })

  it('does not ingest or sync SRS deck when all questions are correct', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-perfect' }),
    })
    global.fetch = mockFetch

    const classCode = 'CLASS_PERFECT'
    const studentName = 'Bé Mai'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'vocab', topic: 'fruits' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    act(() => {
      result.current.recordQuestion({
        prompt: 'apple',
        correctAnswer: 'quả táo',
        selectedAnswer: 'quả táo',
        isCorrect: true,
      })
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(true)
    expect(getStoredSrsDeck(classCode, studentName)).toHaveLength(0)
    expect(syncSrsDeckAction).not.toHaveBeenCalled()
  })

  it('does not block submitSession if syncSrsDeckAction rejects', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, sessionId: 'sess-srs-fail' }),
    })
    global.fetch = mockFetch

    vi.mocked(syncSrsDeckAction).mockRejectedValueOnce(new Error('Network offline'))

    const classCode = 'CLASS_SRS_REJECT'
    const studentName = 'Bé Phong'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'vocab', topic: 'fruits' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    act(() => {
      result.current.recordQuestion({
        prompt: 'orange',
        correctAnswer: 'quả cam',
        selectedAnswer: 'quả chanh',
        isCorrect: false,
      })
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(true)
    expect(syncSrsDeckAction).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      '[useGameTracking] Error syncing SRS deck to cloud:',
      expect.any(Error)
    )
    warnSpy.mockRestore()
  })

  it('does NOT sync SRS deck to cloud if /api/track fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'Server error' }),
    })
    global.fetch = mockFetch

    const classCode = 'CLASS_SRS_TRACK_FAIL'
    const studentName = 'Bé Quang'

    const { result } = renderHook(
      () => useGameTracking({ gameType: 'vocab', topic: 'fruits' }),
      {
        wrapper: createWrapper({
          classCode,
          studentName,
        }),
      }
    )

    await waitFor(() => {
      expect(result.current.isTracking).toBe(true)
    })

    act(() => {
      result.current.recordQuestion({
        prompt: 'grape',
        correctAnswer: 'quả nho',
        selectedAnswer: 'quả chuối',
        isCorrect: false,
      })
    })

    let success: boolean | undefined
    await act(async () => {
      success = await result.current.submitSession()
    })

    expect(success).toBe(false)
    expect(syncSrsDeckAction).not.toHaveBeenCalled()
  })
})

