import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useStudentSession,
  StudentSessionProvider,
} from '@/contexts/StudentSessionContext'
import * as studentProgressAction from '@/app/actions/student-progress'
import React from 'react'

vi.mock('@/app/actions/student-progress', () => ({
  getStudentProgress: vi.fn(),
}))

describe('StudentSessionContext Gamification & Progress', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <StudentSessionProvider>{children}</StudentSessionProvider>
  )

  it('initializes totalStars to 0 and level to Level 1 🐣', () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper })

    expect(result.current.totalStars).toBe(0)
    expect(result.current.levelInfo.currentLevel.level).toBe(1)
    expect(result.current.levelInfo.currentLevel.badge).toBe('🐣')
  })

  it('fetches totalStars upon joinClass and updates levelInfo', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 60,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'ABC123',
        studentName: 'Bé An',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(60)
    })

    expect(result.current.levelInfo.currentLevel.level).toBe(2)
    expect(result.current.levelInfo.currentLevel.badge).toBe('🐱')
    expect(studentProgressAction.getStudentProgress).toHaveBeenCalledWith({
      classCode: 'ABC123',
      studentName: 'Bé An',
    })
  })

  it('triggers level-up celebration when stars cause level to increase', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValueOnce({
      success: true,
      totalStars: 40,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'ABC123',
        studentName: 'Bé An',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(40)
    })
    expect(result.current.celebration.show).toBe(false)

    // Now student earns more stars to reach 160 (Level 3 🦁)
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValueOnce({
      success: true,
      totalStars: 160,
    })

    await act(async () => {
      await result.current.refreshProgress()
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(160)
      expect(result.current.celebration.show).toBe(true)
      expect(result.current.celebration.level?.level).toBe(3)
      expect(result.current.celebration.level?.badge).toBe('🦁')
    })

    // Dismiss celebration
    act(() => {
      result.current.dismissCelebration()
    })

    expect(result.current.celebration.show).toBe(false)
  })

  it('resets totalStars and celebration to default when clearSession is called', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 80,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'ABC123',
        studentName: 'Bé An',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(80)
    })

    act(() => {
      result.current.clearSession()
    })

    expect(result.current.totalStars).toBe(0)
    expect(result.current.levelInfo.currentLevel.level).toBe(1)
    expect(result.current.celebration.show).toBe(false)
    expect(result.current.celebration.level).toBeNull()
  })

  it('resets totalStars and celebration to default when skip is called', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 80,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'ABC123',
        studentName: 'Bé An',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(80)
    })

    act(() => {
      result.current.skip()
    })

    expect(result.current.totalStars).toBe(0)
    expect(result.current.levelInfo.currentLevel.level).toBe(1)
    expect(result.current.celebration.show).toBe(false)
    expect(result.current.celebration.level).toBeNull()
  })

  it('hydrates session from localStorage when sessionStorage is empty and auto-fetches stars', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 120,
    })

    const storedSession = {
      classCode: 'CLASS99',
      studentName: 'Bé Tôm',
      className: 'Lớp Chồi 1',
      classId: 'cls-99',
      isAnonymous: false,
    }
    localStorage.setItem('gamehub_student_session', JSON.stringify(storedSession))

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
      expect(result.current.session).toEqual({
        classCode: 'CLASS99',
        studentName: 'Bé Tôm',
        className: 'Lớp Chồi 1',
        classId: 'cls-99',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(120)
    })

    expect(result.current.levelInfo.currentLevel.level).toBe(2)
    expect(studentProgressAction.getStudentProgress).toHaveBeenCalledWith({
      classCode: 'CLASS99',
      studentName: 'Bé Tôm',
    })
  })

  it('US3: synchronizes cross-device student progress when joining with existing student credentials', async () => {
    // Simulate DB having 350 stars for this student from other devices
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 350,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'DEV_SYNC_1',
        studentName: 'Bé Gấu',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(350)
      expect(result.current.levelInfo.currentLevel.level).toBe(4) // 300+ stars = Level 4 🦄
      expect(result.current.levelInfo.currentLevel.badge).toBe('🦄')
    })
  })

  it('US3: correctly handles newly registered student with 0 previous game sessions', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 0,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'NEW_CLASS',
        studentName: 'Học Sinh Mới',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(0)
      expect(result.current.levelInfo.currentLevel.level).toBe(1)
      expect(result.current.levelInfo.currentLevel.badge).toBe('🐣')
      expect(result.current.isLoadingStars).toBe(false)
    })
  })

  it('US3: gracefully handles server action failure without crashing', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: false,
      totalStars: 0,
      error: 'Lỗi máy chủ',
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'ERR_CLASS',
        studentName: 'Bé Test',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(0)
      expect(result.current.levelInfo.currentLevel.level).toBe(1)
      expect(result.current.isLoadingStars).toBe(false)
    })
  })

  it('US3: ignores out-of-order in-flight responses when switching student credentials rapidly', async () => {
    let resolveFirst: (val: studentProgressAction.GetStudentProgressOutput) => void
    const firstPromise = new Promise<studentProgressAction.GetStudentProgressOutput>((resolve) => {
      resolveFirst = resolve
    })

    let resolveSecond: (val: studentProgressAction.GetStudentProgressOutput) => void
    const secondPromise = new Promise<studentProgressAction.GetStudentProgressOutput>((resolve) => {
      resolveSecond = resolve
    })

    vi.mocked(studentProgressAction.getStudentProgress)
      .mockImplementationOnce(() => firstPromise)
      .mockImplementationOnce(() => secondPromise)

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    // Join as Student 1
    act(() => {
      result.current.joinClass({
        classCode: 'CLASS1',
        studentName: 'Học sinh 1',
      })
    })

    // Immediately switch to Student 2
    act(() => {
      result.current.joinClass({
        classCode: 'CLASS1',
        studentName: 'Học sinh 2',
      })
    })

    // Resolve second request first (150 stars)
    await act(async () => {
      resolveSecond!({ success: true, totalStars: 150 })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(150)
    })

    // Resolve first request later (50 stars) - should be ignored
    await act(async () => {
      resolveFirst!({ success: true, totalStars: 50 })
    })

    // Should remain 150 stars
    expect(result.current.totalStars).toBe(150)
  })

  it('US3: synchronizes state when another tab updates localStorage (storage event)', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 220,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    const newSessionData = {
      classCode: 'TAB_SYNC',
      studentName: 'Bé Na',
      className: 'Lớp Lá',
      isAnonymous: false,
    }

    await act(async () => {
      // Simulate storage event from another tab
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'gamehub_student_session',
          newValue: JSON.stringify(newSessionData),
        })
      )
    })

    await waitFor(() => {
      expect(result.current.session).toEqual({
        classCode: 'TAB_SYNC',
        studentName: 'Bé Na',
        className: 'Lớp Lá',
      })
      expect(result.current.totalStars).toBe(220)
    })
  })

  it('US3: clears state when another tab clears localStorage (storage event with null)', async () => {
    vi.mocked(studentProgressAction.getStudentProgress).mockResolvedValue({
      success: true,
      totalStars: 50,
    })

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    await act(async () => {
      result.current.joinClass({
        classCode: 'TAB_CLEAR',
        studentName: 'Bé Nam',
      })
    })

    await waitFor(() => {
      expect(result.current.totalStars).toBe(50)
    })

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'gamehub_student_session',
          newValue: null,
        })
      )
    })

    await waitFor(() => {
      expect(result.current.session).toBeNull()
      expect(result.current.totalStars).toBe(0)
    })
  })
})


