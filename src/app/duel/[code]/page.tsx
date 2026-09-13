'use client'

import React, { use, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Sparkles,
} from 'lucide-react'
import { useStudentSession } from '@/contexts/StudentSessionContext'
import {
  getDuelStateAction,
  submitDuelAnswerAction,
  createRematchAction,
} from '@/app/actions/duels'
import { DuelScoreBar } from '@/components/duel/DuelScoreBar'
import { DuelQuestionCard } from '@/components/duel/DuelQuestionCard'
import { DuelPodiumModal } from '@/components/duel/DuelPodiumModal'
import { Button } from '@/components/ui/button'
import type { DuelState, DuelQuestion, DuelAnswer } from '@/types/duels'

const QUESTION_TIME_LIMIT_SECONDS = 10
const POLLING_INTERVAL_MS = 1200

export default function DuelArenaPage({
  params,
}: {
  params: Promise<{ code: string }> | { code: string }
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <Loader2 className="size-10 animate-spin text-indigo-500 mb-4" />
          <p className="text-base font-bold text-muted-foreground">
            Đang kết nối phòng đấu...
          </p>
        </div>
      }
    >
      <DuelArenaInner params={params} />
    </React.Suspense>
  )
}

function DuelArenaInner({
  params,
}: {
  params: Promise<{ code: string }> | { code: string }
}) {
  // Safe unwrap params for both Next.js 16 Promise params and synchronous tests
  const resolvedParams =
    typeof (params as { then?: unknown })?.then === 'function'
      ? use(params as Promise<{ code: string }>)
      : (params as { code: string })

  const rawCode = resolvedParams.code
  const code = (rawCode || '').trim().toUpperCase()

  const router = useRouter()
  const searchParams = useSearchParams()
  const { session } = useStudentSession()

  const studentName =
    session?.studentName || (session as { name?: string } | null)?.name || ''

  // Arena states
  const [duel, setDuel] = useState<DuelState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Question & Timer states
  const [timeRemaining, setTimeRemaining] = useState<number>(QUESTION_TIME_LIMIT_SECONDS)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [showResult, setShowResult] = useState<boolean>(false)
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState<boolean>(false)

  // Ready Countdown (3 -> 2 -> 1 -> GO)
  const [readyCountdown, setReadyCountdown] = useState<number>(3)

  // Rematch loading state
  const [isRematching, setIsRematching] = useState<boolean>(false)
  const [rematchError, setRematchError] = useState<string | null>(null)

  // Refs for timer and synchronization
  const questionStartTimeRef = useRef<number>(0)
  const hasAutoSubmittedRef = useRef<boolean>(false)
  const currentQuestionIdxRef = useRef<number>(0)
  const duelRef = useRef<DuelState | null>(null)

  useEffect(() => {
    duelRef.current = duel
  }, [duel])

  // Determine current player role
  const playerRole: 'player1' | 'player2' = React.useMemo(() => {
    const roleParam = searchParams?.get('role')
    if (roleParam === 'player2') return 'player2'
    if (roleParam === 'player1') return 'player1'

    if (!duel) return 'player1'

    if (studentName) {
      if (duel.player1.name.toLowerCase() === studentName.toLowerCase()) {
        return 'player1'
      }
      if (
        duel.player2?.name &&
        duel.player2.name.toLowerCase() === studentName.toLowerCase()
      ) {
        return 'player2'
      }
    }

    return 'player1'
  }, [duel, studentName, searchParams])

  // Initial fetch and background polling loop
  useEffect(() => {
    let isMounted = true

    const loadInitial = async () => {
      if (!code) return
      try {
        const res = await getDuelStateAction(code)
        if (!isMounted) return
        if (res.success && res.data) {
          setDuel(res.data)
          setErrorMessage(null)
          questionStartTimeRef.current = Date.now()
        } else if (!duelRef.current) {
          setErrorMessage(res.error || 'Không tìm thấy phòng thách đấu')
        }
      } catch (err: unknown) {
        if (!isMounted) return
        if (!duelRef.current) {
          setErrorMessage(
            err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tải trận đấu'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitial()

    const intervalId = setInterval(async () => {
      const currentStatus = duelRef.current?.status
      if (
        !currentStatus ||
        currentStatus === 'waiting' ||
        currentStatus === 'ready' ||
        currentStatus === 'in_progress'
      ) {
        if (!code) return
        try {
          const res = await getDuelStateAction(code)
          if (!isMounted) return
          if (res.success && res.data) {
            const updated = res.data
            setDuel(updated)
            setErrorMessage(null)

            if (updated.currentQuestionIndex !== currentQuestionIdxRef.current) {
              currentQuestionIdxRef.current = updated.currentQuestionIndex
              setTimeRemaining(QUESTION_TIME_LIMIT_SECONDS)
              setSelectedOptionIndex(null)
              setShowResult(false)
              hasAutoSubmittedRef.current = false
              questionStartTimeRef.current = Date.now()
            }
          }
        } catch {
          // Ignore background polling errors
        }
      }
    }, POLLING_INTERVAL_MS)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [code])

  // Handle Ready status countdown
  useEffect(() => {
    if (duel?.status !== 'ready') return

    const timer = setInterval(() => {
      setReadyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [duel?.status])

  // Current question data
  const currentQuestionIndex = duel?.currentQuestionIndex ?? 0
  const questions: DuelQuestion[] = duel?.questions ?? []
  const currentQuestion: DuelQuestion | undefined = questions[currentQuestionIndex]

  // Derived answer state (avoids cascading re-renders in useEffect)
  const myAnswers: DuelAnswer[] =
    playerRole === 'player1'
      ? duel?.player1Answers || []
      : duel?.player2Answers || []

  const existingAnswer = myAnswers.find(
    (a) => a.questionIndex === currentQuestionIndex
  )

  const effectiveSelectedOptionIndex =
    selectedOptionIndex !== null
      ? selectedOptionIndex
      : existingAnswer && existingAnswer.selectedOption && currentQuestion
        ? currentQuestion.options.indexOf(existingAnswer.selectedOption)
        : null

  const effectiveShowResult = showResult || Boolean(existingAnswer)

  // Submit Answer handler
  const handleSubmitAnswer = useCallback(
    async (optionIndex: number | null, isTimeout = false) => {
      if (!duel || !currentQuestion || isSubmittingAnswer) return

      const startTime = questionStartTimeRef.current || Date.now()
      const elapsedMs = Math.min(
        10000,
        Math.max(200, Date.now() - startTime)
      )

      let isCorrect = false
      let selectedOption: string | undefined = undefined

      if (optionIndex !== null && currentQuestion.options[optionIndex]) {
        selectedOption = currentQuestion.options[optionIndex]
        isCorrect = selectedOption === currentQuestion.correctAnswer
      }

      setSelectedOptionIndex(optionIndex)
      setShowResult(true)
      setIsSubmittingAnswer(true)

      try {
        const res = await submitDuelAnswerAction({
          duelId: duel.id,
          playerRole,
          questionIndex: currentQuestionIndex,
          isCorrect,
          elapsedMs: isTimeout ? 10000 : elapsedMs,
          selectedOption,
        })

        if (res.success && res.data) {
          setDuel(res.data)
        }
      } catch (err) {
        console.error('Failed to submit duel answer:', err)
      } finally {
        setIsSubmittingAnswer(false)
      }
    },
    [duel, currentQuestion, isSubmittingAnswer, playerRole, currentQuestionIndex]
  )

  // Question Timer Countdown
  useEffect(() => {
    if (
      duel?.status !== 'in_progress' &&
      !(duel?.status === 'ready' && readyCountdown === 0)
    ) {
      return
    }

    if (effectiveShowResult || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!hasAutoSubmittedRef.current && effectiveSelectedOptionIndex === null) {
            hasAutoSubmittedRef.current = true
            handleSubmitAnswer(null, true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [
    duel?.status,
    readyCountdown,
    effectiveShowResult,
    timeRemaining,
    effectiveSelectedOptionIndex,
    handleSubmitAnswer,
  ])

  // Copy room code
  const handleCopyCode = () => {
    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Rematch handler
  const handleRematch = async () => {
    if (!duel) return
    setIsRematching(true)
    setRematchError(null)

    try {
      const myName =
        studentName ||
        (playerRole === 'player1' ? duel.player1.name : duel.player2?.name) ||
        'Player'

      const res = await createRematchAction(duel.id, myName)
      if (res.success && res.data?.code) {
        router.push(`/duel/${res.data.code}`)
      } else {
        setRematchError(res.error || 'Không thể tạo trận đấu lại')
      }
    } catch (err: unknown) {
      setRematchError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
    } finally {
      setIsRematching(false)
    }
  }

  // Back to Hub handler
  const handleBackToHub = () => {
    router.push('/duel')
  }

  // Loading state
  if (isLoading && !duel) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="size-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-base font-bold text-muted-foreground">
          Đang kết nối phòng đấu...
        </p>
      </div>
    )
  }

  // Error / Not found state
  if (errorMessage || !duel) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="size-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black mb-2">Không thể tải phòng</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm">
          {errorMessage || 'Phòng thách đấu không tồn tại hoặc đã bị hủy.'}
        </p>
        <Button
          onClick={handleBackToHub}
          className="rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <ArrowLeft className="size-4 mr-2" /> Về sảnh đấu
        </Button>
      </div>
    )
  }

  // 1. Status: Waiting Room
  if (duel.status === 'waiting') {
    return (
      <div
        data-testid="duel-waiting-room"
        className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6"
      >
        <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 text-center text-card-foreground overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute -top-16 -right-16 size-40 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 size-40 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

          {/* Top badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-black uppercase tracking-wider mb-4">
            <Users className="size-4" /> Phòng Thách Đấu
          </div>

          <h1 className="text-xl sm:text-2xl font-black mb-2">
            Đang đợi đối thủ vào phòng...
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            Hãy chia sẻ mã bên dưới cho bạn bè để cùng tranh tài!
          </p>

          {/* Room Code Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-muted/50 border border-border mb-6">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              Mã phòng (Room Code)
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-indigo-600 dark:text-indigo-400 mb-3">
              {duel.code}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="rounded-xl border-border font-bold text-xs sm:text-sm"
            >
              {copied ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-4" /> Đã sao chép!
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="size-4" /> Sao chép mã
                </span>
              )}
            </Button>
          </div>

          {/* Player 1 Card */}
          <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 mb-6">
            <span className="text-3xl">{duel.player1.avatar || '🦊'}</span>
            <div className="text-left">
              <div className="text-xs text-muted-foreground font-semibold">Chủ phòng</div>
              <div className="text-sm font-black text-foreground">{duel.player1.name}</div>
            </div>
          </div>

          {/* Back button */}
          <Button
            type="button"
            variant="ghost"
            onClick={handleBackToHub}
            className="rounded-2xl text-muted-foreground hover:text-foreground text-xs sm:text-sm font-semibold"
          >
            <ArrowLeft className="size-4 mr-1.5" /> Hủy & Về sảnh
          </Button>
        </div>
      </div>
    )
  }

  // 2. Status: Ready Overlay
  const showReadyOverlay = duel.status === 'ready' && readyCountdown > 0

  // 3. Status: Finished Podium Modal
  const isFinished = duel.status === 'finished'
  const isTie = !duel.winnerName || duel.winnerName === 'Hòa'
  const isWinner = Boolean(
    duel.winnerName &&
      studentName &&
      duel.winnerName.toLowerCase() === studentName.toLowerCase()
  )

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      {/* Ready Overlay */}
      {showReadyOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="text-center">
            <div className="text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-widest mb-2">
              Đối thủ đã sẵn sàng!
            </div>
            <div className="text-7xl sm:text-9xl font-black text-white animate-ping duration-700 mb-4">
              {readyCountdown}
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              Chuẩn bị tranh tài!
            </div>
          </div>
        </div>
      )}

      {/* Score Bar at Top */}
      <DuelScoreBar
        player1={duel.player1}
        player2={duel.player2}
        currentRound={currentQuestionIndex + 1}
        totalRounds={questions.length || 1}
      />

      {/* Arena Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col items-center justify-center">
        {currentQuestion ? (
          <DuelQuestionCard
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeRemainingSeconds={timeRemaining}
            selectedOptionIndex={effectiveSelectedOptionIndex}
            onSelectOption={(idx) => handleSubmitAnswer(idx, false)}
            disabled={isSubmittingAnswer || effectiveShowResult}
            showResult={effectiveShowResult}
          />
        ) : (
          <div className="text-center p-6 text-muted-foreground font-bold">
            Đang chuẩn bị câu hỏi tiếp theo...
          </div>
        )}

        {/* Answer Waiting Message */}
        {effectiveShowResult && !isFinished && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border text-xs sm:text-sm font-bold text-muted-foreground animate-pulse">
            <Sparkles className="size-4 text-amber-500" />
            <span>Đang đợi đối thủ hoặc chuyển sang câu hỏi kế tiếp...</span>
          </div>
        )}
      </main>

      {/* Post-Duel Podium Modal */}
      <DuelPodiumModal
        isOpen={isFinished}
        winnerName={duel.winnerName || null}
        isTie={isTie}
        isWinner={isWinner}
        player1={duel.player1}
        player2={duel.player2}
        onRematch={handleRematch}
        onBackToHub={handleBackToHub}
        isRematching={isRematching}
        rematchError={rematchError}
      />
    </div>
  )
}
