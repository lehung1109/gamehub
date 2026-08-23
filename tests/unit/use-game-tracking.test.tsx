// tests/unit/use-game-tracking.test.tsx
import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGameTracking } from '@/hooks/use-game-tracking'
import { StudentSessionProvider, STUDENT_SESSION_KEY } from '@/hooks/use-student-session'

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn().mockResolvedValue({
    success: true,
    totalStars: 0,
  }),
}))

describe('useGameTracking Hook', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    window.sessionStorage.clear()
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
})
