import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useStudentSession,
  StudentSessionProvider,
  STUDENT_SESSION_KEY,
} from '@/hooks/use-student-session'
import { getStudentProgress } from '@/app/actions/student-progress'
import React from 'react'

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn().mockResolvedValue({
    success: true,
    totalStars: 0,
  }),
}))

describe('useStudentSession Hook', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    vi.mocked(getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 0,
    })
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StudentSessionProvider>{children}</StudentSessionProvider>
  )

  it('initializes with empty session and opens popup when sessionStorage is empty', () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper })

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.session).toBeNull()
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.isOpen).toBe(true)
  })

  it('saves session and closes popup when joinClass is called', async () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'ABC123',
        studentName: 'Minh',
        className: 'Lớp 1A',
        classId: 'cls-123',
      })
    })

    await waitFor(() => {
      expect(result.current.isLoadingStars).toBe(false)
    })

    expect(result.current.session).toEqual({
      classCode: 'ABC123',
      studentName: 'Minh',
      className: 'Lớp 1A',
      classId: 'cls-123',
    })
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.isOpen).toBe(false)

    // Check sessionStorage
    const stored = JSON.parse(sessionStorage.getItem(STUDENT_SESSION_KEY) || '{}')
    expect(stored).toEqual({
      classCode: 'ABC123',
      studentName: 'Minh',
      className: 'Lớp 1A',
      classId: 'cls-123',
      isAnonymous: false,
    })
  })

  it('sets isAnonymous to true and closes popup when skip is called', () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper })

    act(() => {
      result.current.skip()
    })

    expect(result.current.session).toBeNull()
    expect(result.current.isAnonymous).toBe(true)
    expect(result.current.isOpen).toBe(false)

    const stored = JSON.parse(sessionStorage.getItem(STUDENT_SESSION_KEY) || '{}')
    expect(stored).toEqual({
      isAnonymous: true,
    })
  })

  it('loads existing student session from sessionStorage on mount without opening popup', async () => {
    const existingSession = {
      classCode: 'XYZ789',
      studentName: 'Linh',
      className: 'Lớp 2B',
      classId: 'cls-456',
      isAnonymous: false,
    }
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(existingSession))

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
      expect(result.current.isLoadingStars).toBe(false)
    })

    expect(result.current.session).toEqual({
      classCode: 'XYZ789',
      studentName: 'Linh',
      className: 'Lớp 2B',
      classId: 'cls-456',
    })
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.isOpen).toBe(false)
  })

  it('loads existing anonymous state from sessionStorage on mount without opening popup', () => {
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify({ isAnonymous: true }))

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.session).toBeNull()
    expect(result.current.isAnonymous).toBe(true)
    expect(result.current.isOpen).toBe(false)
  })

  it('clears session and resets state when clearSession is called', async () => {
    sessionStorage.setItem(
      STUDENT_SESSION_KEY,
      JSON.stringify({
        classCode: 'ABC123',
        studentName: 'Minh',
        isAnonymous: false,
      })
    )

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
      expect(result.current.isLoadingStars).toBe(false)
    })

    act(() => {
      result.current.clearSession()
    })

    expect(result.current.session).toBeNull()
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.isOpen).toBe(true)
    expect(sessionStorage.getItem(STUDENT_SESSION_KEY)).toBeNull()
  })

  it('allows manually toggling popup open state with setOpen', () => {
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify({ isAnonymous: true }))

    const { result } = renderHook(() => useStudentSession(), { wrapper })
    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.setOpen(true)
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('handles corrupted sessionStorage data gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    sessionStorage.setItem(STUDENT_SESSION_KEY, 'invalid-json{{{')

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.session).toBeNull()
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.isOpen).toBe(true)
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('fetches totalStars and levelInfo when student session is present', async () => {
    vi.mocked(getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 25,
    })

    const existingSession = {
      classCode: 'ABC123',
      studentName: 'Linh',
      isAnonymous: false,
    }
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(existingSession))

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(25)
    })

    expect(result.current.levelInfo.currentLevel.level).toBe(1)
  })

  it('triggers level-up celebration when refreshProgress detects higher level', async () => {
    vi.mocked(getStudentProgress).mockResolvedValueOnce({
      success: true,
      totalStars: 10,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'ABC123',
        studentName: 'Linh',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(10)
    })
    expect(result.current.levelInfo.currentLevel.level).toBe(1)
    expect(result.current.celebration.show).toBe(false)

    // Now student earns stars up to 55 (Level 2)
    vi.mocked(getStudentProgress).mockResolvedValueOnce({
      success: true,
      totalStars: 55,
    })

    await act(async () => {
      await result.current.refreshProgress()
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(55)
      expect(result.current.levelInfo.currentLevel.level).toBe(2)
      expect(result.current.celebration.show).toBe(true)
      expect(result.current.celebration.level?.level).toBe(2)
      expect(result.current.celebration.level?.badge).toBe('🐱')
    })

    // Dismiss celebration
    act(() => {
      result.current.dismissCelebration()
    })

    expect(result.current.celebration.show).toBe(false)
    expect(result.current.celebration.level).toBeNull()
  })
})
