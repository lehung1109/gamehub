'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

export const STUDENT_SESSION_KEY = 'gamehub_student_session'

export interface StudentSession {
  classCode: string
  studentName: string
  className?: string
  classId?: string
}

export interface StoredStudentSession {
  classCode?: string
  studentName?: string
  className?: string
  classId?: string
  isAnonymous?: boolean
}

export interface StudentSessionContextValue {
  session: StudentSession | null
  isAnonymous: boolean
  isLoaded: boolean
  isOpen: boolean
  setOpen: (open: boolean) => void
  joinClass: (sessionData: StudentSession) => void
  skip: () => void
  clearSession: () => void
}

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null)

export function StudentSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StudentSession | null>(null)
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.sessionStorage.getItem(STUDENT_SESSION_KEY)
        if (raw) {
          const parsed: StoredStudentSession = JSON.parse(raw)
          if (parsed.isAnonymous) {
            setIsAnonymous(true)
            setSession(null)
            setIsOpen(false)
          } else if (parsed.classCode && parsed.studentName) {
            setSession({
              classCode: parsed.classCode,
              studentName: parsed.studentName,
              className: parsed.className,
              classId: parsed.classId,
            })
            setIsAnonymous(false)
            setIsOpen(false)
          } else {
            // Invalid data format
            setIsOpen(true)
          }
        } else {
          // Empty session, trigger popup
          setIsOpen(true)
        }
      }
    } catch (e) {
      console.warn('Failed to parse student session from sessionStorage:', e)
      setIsOpen(true)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const joinClass = useCallback((sessionData: StudentSession) => {
    setSession(sessionData)
    setIsAnonymous(false)
    setIsOpen(false)

    try {
      if (typeof window !== 'undefined') {
        const toStore: StoredStudentSession = {
          ...sessionData,
          isAnonymous: false,
        }
        window.sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(toStore))
      }
    } catch (e) {
      console.error('Failed to save student session:', e)
    }
  }, [])

  const skip = useCallback(() => {
    setSession(null)
    setIsAnonymous(true)
    setIsOpen(false)

    try {
      if (typeof window !== 'undefined') {
        const toStore: StoredStudentSession = {
          isAnonymous: true,
        }
        window.sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(toStore))
      }
    } catch (e) {
      console.error('Failed to save anonymous student session:', e)
    }
  }, [])

  const clearSession = useCallback(() => {
    setSession(null)
    setIsAnonymous(false)
    setIsOpen(true)

    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(STUDENT_SESSION_KEY)
      }
    } catch (e) {
      console.error('Failed to remove student session:', e)
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAnonymous,
      isLoaded,
      isOpen,
      setOpen: setIsOpen,
      joinClass,
      skip,
      clearSession,
    }),
    [session, isAnonymous, isLoaded, isOpen, joinClass, skip, clearSession]
  )

  return (
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  )
}

const defaultStudentSessionContext: StudentSessionContextValue = {
  session: null,
  isAnonymous: false,
  isLoaded: true,
  isOpen: false,
  setOpen: () => {},
  joinClass: () => {},
  skip: () => {},
  clearSession: () => {},
}

export function useStudentSession(): StudentSessionContextValue {
  const context = useContext(StudentSessionContext)
  if (!context) {
    return defaultStudentSessionContext
  }
  return context
}
