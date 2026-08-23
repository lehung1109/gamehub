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
})
