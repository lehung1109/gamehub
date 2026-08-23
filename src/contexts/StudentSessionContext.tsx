'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { getStudentProgress } from '@/app/actions/student-progress'
import { getLevelInfo, LevelInfo, LevelProgress } from '@/lib/levels'

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

export interface LevelUpCelebration {
  show: boolean
  level: LevelInfo | null
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

  // Gamification properties
  totalStars: number
  levelInfo: LevelProgress
  isLoadingStars: boolean
  refreshProgress: () => Promise<void>
  celebration: LevelUpCelebration
  dismissCelebration: () => void
}

function getInitialState(): {
  session: StudentSession | null
  isAnonymous: boolean
  isOpen: boolean
} {
  if (typeof window === 'undefined') {
    return { session: null, isAnonymous: false, isOpen: false }
  }

  try {
    const raw = window.sessionStorage.getItem(STUDENT_SESSION_KEY)
    if (raw) {
      const parsed: StoredStudentSession = JSON.parse(raw)
      if (parsed.isAnonymous) {
        return { session: null, isAnonymous: true, isOpen: false }
      }
      if (parsed.classCode && parsed.studentName) {
        return {
          session: {
            classCode: parsed.classCode,
            studentName: parsed.studentName,
            className: parsed.className,
            classId: parsed.classId,
          },
          isAnonymous: false,
          isOpen: false,
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse student session from sessionStorage:', e)
  }

  return { session: null, isAnonymous: false, isOpen: true }
}

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null)

export function StudentSessionProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState(getInitialState)
  const [session, setSession] = useState<StudentSession | null>(initial.session)
  const [isAnonymous, setIsAnonymous] = useState<boolean>(initial.isAnonymous)
  const [isLoaded] = useState<boolean>(() => typeof window !== 'undefined')
  const [isOpen, setIsOpen] = useState<boolean>(initial.isOpen)

  // Gamification state
  const [totalStars, setTotalStars] = useState<number>(0)
  const [isLoadingStars, setIsLoadingStars] = useState<boolean>(false)
  const [celebration, setCelebration] = useState<LevelUpCelebration>({
    show: false,
    level: null,
  })

  const prevLevelRef = useRef<number>(1)
  const hasInitializedStarsRef = useRef<boolean>(false)

  // Calculate current level info
  const levelInfo = useMemo(() => getLevelInfo(totalStars), [totalStars])

  // Auto-fetch progress whenever session credentials change
  useEffect(() => {
    if (session?.classCode && session?.studentName) {
      let isCancelled = false
      hasInitializedStarsRef.current = false

      getStudentProgress({
        classCode: session.classCode,
        studentName: session.studentName,
      })
        .then((res) => {
          if (isCancelled) return
          if (res && res.success && typeof res.totalStars === 'number') {
            const newStars = res.totalStars
            const newLevelProgress = getLevelInfo(newStars)

            if (hasInitializedStarsRef.current && newLevelProgress.currentLevel.level > prevLevelRef.current) {
              setCelebration({
                show: true,
                level: newLevelProgress.currentLevel,
              })
            }
            prevLevelRef.current = newLevelProgress.currentLevel.level
            hasInitializedStarsRef.current = true
            setTotalStars(newStars)
          }
        })
        .catch((err) => {
          console.warn('[StudentSessionContext] Failed to fetch student progress:', err)
        })

      return () => {
        isCancelled = true
      }
    } else {
      queueMicrotask(() => {
        setTotalStars(0)
        prevLevelRef.current = 1
        hasInitializedStarsRef.current = false
      })
    }
  }, [session?.classCode, session?.studentName])

  // Explicit manual progress refresh
  const refreshProgress = useCallback(async () => {
    if (!session?.classCode || !session?.studentName) {
      setTotalStars(0)
      return
    }

    const currentSession = session

    try {
      setIsLoadingStars(true)
      const res = await getStudentProgress({
        classCode: session.classCode,
        studentName: session.studentName,
      })

      if (currentSession.classCode !== session.classCode || currentSession.studentName !== session.studentName) {
        return
      }

      if (res && res.success && typeof res.totalStars === 'number') {
        const newStars = res.totalStars
        const newLevelProgress = getLevelInfo(newStars)

        if (hasInitializedStarsRef.current && newLevelProgress.currentLevel.level > prevLevelRef.current) {
          setCelebration({
            show: true,
            level: newLevelProgress.currentLevel,
          })
        }
        prevLevelRef.current = newLevelProgress.currentLevel.level
        hasInitializedStarsRef.current = true
        setTotalStars(newStars)
      }
    } catch (err) {
      console.warn('[StudentSessionContext] Failed to fetch student progress:', err)
    } finally {
      setIsLoadingStars(false)
    }
  }, [session])

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
    setTotalStars(0)

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
    setTotalStars(0)
    prevLevelRef.current = 1

    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(STUDENT_SESSION_KEY)
      }
    } catch (e) {
      console.error('Failed to remove student session:', e)
    }
  }, [])

  const dismissCelebration = useCallback(() => {
    setCelebration({ show: false, level: null })
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
      totalStars,
      levelInfo,
      isLoadingStars,
      refreshProgress,
      celebration,
      dismissCelebration,
    }),
    [
      session,
      isAnonymous,
      isLoaded,
      isOpen,
      joinClass,
      skip,
      clearSession,
      totalStars,
      levelInfo,
      isLoadingStars,
      refreshProgress,
      celebration,
      dismissCelebration,
    ]
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
  totalStars: 0,
  levelInfo: getLevelInfo(0),
  isLoadingStars: false,
  refreshProgress: async () => {},
  celebration: { show: false, level: null },
  dismissCelebration: () => {},
}

export function useStudentSession(): StudentSessionContextValue {
  const context = useContext(StudentSessionContext)
  if (!context) {
    return defaultStudentSessionContext
  }
  return context
}
