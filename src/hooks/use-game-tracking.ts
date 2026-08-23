'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { useStudentSession, StudentSession } from '@/hooks/use-student-session'
import type { SessionDetailPayload, TrackGamePayload } from '@/app/api/track/route'

export interface QuestionDetailInput {
  prompt: string
  selectedAnswer?: string
  correctAnswer?: string
  isCorrect: boolean
  timeTakenMs?: number
  attempts?: number
}

export interface UseGameTrackingOptions {
  gameType: string
  topic?: string
  configId?: string
  totalQuestions?: number
}

export interface SubmitSessionOptions {
  score?: number
  totalQuestions?: number
  topic?: string
  gameType?: string
  configId?: string
  details?: SessionDetailPayload[]
}

export interface UseGameTrackingReturn {
  isTracking: boolean
  isAnonymous: boolean
  session: StudentSession | null
  details: SessionDetailPayload[]
  recordQuestion: (detail: QuestionDetailInput) => void
  submitSession: (override?: SubmitSessionOptions) => Promise<boolean>
  resetSession: () => void
}

export function useGameTracking(options: UseGameTrackingOptions): UseGameTrackingReturn {
  const { session, isAnonymous, refreshProgress } = useStudentSession()
  const [details, setDetails] = useState<SessionDetailPayload[]>([])
  const detailsRef = useRef<SessionDetailPayload[]>([])
  const startedAtRef = useRef<string>(new Date().toISOString())
  const isSubmittingRef = useRef<boolean>(false)

  const isTracking = Boolean(
    session &&
      session.classCode &&
      session.studentName &&
      !isAnonymous
  )

  const recordQuestion = useCallback((detail: QuestionDetailInput) => {
    const formatted: SessionDetailPayload = {
      prompt: detail.prompt,
      selectedAnswer: detail.selectedAnswer,
      correctAnswer: detail.correctAnswer,
      isCorrect: detail.isCorrect,
      timeTakenMs: typeof detail.timeTakenMs === 'number' ? Math.max(0, detail.timeTakenMs) : 0,
      attempts: typeof detail.attempts === 'number' ? Math.max(1, detail.attempts) : 1,
    }

    detailsRef.current = [...detailsRef.current, formatted]
    setDetails((prev) => [...prev, formatted])
  }, [])

  const resetSession = useCallback(() => {
    detailsRef.current = []
    setDetails([])
    startedAtRef.current = new Date().toISOString()
    isSubmittingRef.current = false
  }, [])

  const { gameType, topic, configId, totalQuestions: optionsTotalQuestions } = options

  const submitSession = useCallback(
    async (override?: SubmitSessionOptions): Promise<boolean> => {
      if (!isTracking || !session || isSubmittingRef.current) {
        return false
      }

      isSubmittingRef.current = true

      try {
        const finalDetails = override?.details || detailsRef.current
        const finalGameType = override?.gameType || gameType
        const finalTopic = override?.topic || topic || 'general'
        const finalConfigId = override?.configId || configId

        let calculatedScore: number | undefined = undefined
        if (override?.score !== undefined) {
          calculatedScore = override.score
        } else if (finalDetails.length > 0) {
          calculatedScore = finalDetails.filter((d) => d.isCorrect).length
        }

        const calculatedTotalQuestions =
          override?.totalQuestions !== undefined
            ? override.totalQuestions
            : optionsTotalQuestions !== undefined
            ? optionsTotalQuestions
            : finalDetails.length

        const payload: TrackGamePayload = {
          classCode: session.classCode,
          studentName: session.studentName,
          gameType: finalGameType,
          topic: finalTopic,
          score: calculatedScore,
          totalQuestions: calculatedTotalQuestions,
          startedAt: startedAtRef.current,
          completedAt: new Date().toISOString(),
          configId: finalConfigId,
          details: finalDetails,
        }

        const response = await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          console.warn('[useGameTracking] Submit failed with status:', response.status)
          return false
        }

        // Trigger progress refresh in StudentSessionContext so totalStars and Level Up celebration update immediately
        try {
          await refreshProgress()
        } catch (refreshErr) {
          console.warn('[useGameTracking] Error refreshing student progress:', refreshErr)
        }

        return true
      } catch (err) {
        // Suppress visual errors to prevent gameplay disruption as specified in spec
        console.warn('[useGameTracking] Network error during session submission:', err)
        return false
      } finally {
        isSubmittingRef.current = false
      }
    },
    [isTracking, session, gameType, topic, configId, optionsTotalQuestions, refreshProgress]
  )

  return useMemo(
    () => ({
      isTracking,
      isAnonymous,
      session,
      details,
      recordQuestion,
      submitSession,
      resetSession,
    }),
    [isTracking, isAnonymous, session, details, recordQuestion, submitSession, resetSession]
  )
}
