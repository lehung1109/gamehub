import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useStudentSession,
  StudentSessionProvider,
  STUDENT_SESSION_KEY,
} from '@/hooks/use-student-session'
import React from 'react'

describe('useStudentSession Hook', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
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

  it('saves session and closes popup when joinClass is called', () => {
    const { result } = renderHook(() => useStudentSession(), { wrapper })

    act(() => {
      result.current.joinClass({
        classCode: 'ABC123',
        studentName: 'Minh',
        className: 'Lớp 1A',
        classId: 'cls-123',
      })
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

  it('loads existing student session from sessionStorage on mount without opening popup', () => {
    const existingSession = {
      classCode: 'XYZ789',
      studentName: 'Linh',
      className: 'Lớp 2B',
      classId: 'cls-456',
      isAnonymous: false,
    }
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(existingSession))

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    expect(result.current.isLoaded).toBe(true)
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

  it('clears session and resets state when clearSession is called', () => {
    sessionStorage.setItem(
      STUDENT_SESSION_KEY,
      JSON.stringify({
        classCode: 'ABC123',
        studentName: 'Minh',
        isAnonymous: false,
      })
    )

    const { result } = renderHook(() => useStudentSession(), { wrapper })

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
    sessionStorage.setItem(STUDENT_SESSION_KEY, 'invalid-json{{{')

    const { result } = renderHook(() => useStudentSession(), { wrapper })

    expect(result.current.isLoaded).toBe(true)
    expect(result.current.session).toBeNull()
    expect(result.current.isAnonymous).toBe(false)
    expect(result.current.isOpen).toBe(true)
  })
})
