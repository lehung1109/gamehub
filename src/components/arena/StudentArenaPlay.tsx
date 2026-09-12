// src/components/arena/StudentArenaPlay.tsx

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Timer,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Triangle,
  Square,
  Circle,
  Diamond,
} from 'lucide-react'
import type { LiveArena } from '@/types/arena'
import { submitArenaAnswerAction, getLiveArenaByPinAction } from '@/app/actions/arena'

interface StudentArenaPlayProps {
  initialArena: LiveArena
  studentName: string
  avatar: string
}

interface AnswerResult {
  isCorrect: boolean
  pointsEarned: number
  newStreak: number
  totalScore: number
  correctAnswer: string
}

const KAHOOT_COLORS = [
  { bg: 'bg-rose-500 hover:bg-rose-600', text: 'text-white', icon: Triangle },
  { bg: 'bg-blue-500 hover:bg-blue-600', text: 'text-white', icon: Diamond },
  { bg: 'bg-amber-400 hover:bg-amber-500', text: 'text-slate-900', icon: Circle },
  { bg: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-white', icon: Square },
]

export function StudentArenaPlay({
  initialArena,
  studentName,
  avatar,
}: StudentArenaPlayProps) {
  const [arena, setArena] = useState<LiveArena>(initialArena)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)

  const lastQuestionIndexRef = useRef<number>(initialArena.currentQuestionIndex)

  // Polling / sync state with server
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getLiveArenaByPinAction(arena.pinCode)
      if (res.success && res.arena) {
        setArena(res.arena)

        // If question index changed, reset student round state
        if (res.arena.currentQuestionIndex !== lastQuestionIndexRef.current) {
          lastQuestionIndexRef.current = res.arena.currentQuestionIndex
          setSelectedOption(null)
          setHasSubmitted(false)
          setAnswerResult(null)
          const q = res.arena.questions[res.arena.currentQuestionIndex]
          setTimeLeft(q?.timeLimitSeconds || 15)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [arena.pinCode])

  // Countdown timer for active question
  useEffect(() => {
    if (arena.status !== 'in_progress' || hasSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [arena.status, hasSubmitted])

  const currentQuestion = arena.questions[arena.currentQuestionIndex]

  async function handleOptionSelect(option: string) {
    if (hasSubmitted || arena.status !== 'in_progress' || !currentQuestion) return

    setSelectedOption(option)
    setHasSubmitted(true)
    const timeLimit = currentQuestion.timeLimitSeconds || 15
    const responseTimeMs = Math.max(0, (timeLimit - timeLeft) * 1000)

    try {
      const res = await submitArenaAnswerAction({
        arenaId: arena.id,
        studentName,
        questionIndex: arena.currentQuestionIndex,
        selectedOption: option,
        responseTimeMs,
      })

      if (res.success) {
        setAnswerResult({
          isCorrect: Boolean(res.isCorrect),
          pointsEarned: res.pointsEarned || 0,
          newStreak: res.newStreak || 0,
          totalScore: res.totalScore || score,
          correctAnswer: res.correctAnswer || currentQuestion.correctAnswer,
        })
        if (res.pointsEarned) {
          setScore((s) => s + (res.pointsEarned || 0))
        }
        if (typeof res.newStreak === 'number') {
          setStreak(res.newStreak)
        }
      }
    } catch (err) {
      console.error('Failed to submit arena answer:', err)
    }
  }

  // 1. Lobby Waiting Screen
  if (arena.status === 'lobby') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-100 space-y-6">
          <div className="size-20 rounded-3xl bg-indigo-50 text-4xl flex items-center justify-center mx-auto shadow-inner">
            {avatar}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">{studentName}</h2>
            <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
              ✓ Đã vào phòng đấu
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Phòng:</span>
              <span className="font-mono font-bold text-slate-800">{arena.pinCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Nội dung:</span>
              <span className="font-bold text-slate-800 truncate max-w-[200px]">{arena.title}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 animate-pulse flex items-center justify-center gap-1.5">
            <Timer className="size-4 text-indigo-500" />
            <span>Đang chờ thầy cô bắt đầu trận đấu...</span>
          </div>
        </div>
      </div>
    )
  }

  // 2. Finished Podium Screen
  if (arena.status === 'finished') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
          <div className="size-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Trophy className="size-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Kết thúc trận đấu!</h2>
            <p className="text-sm text-slate-600">
              Chúc mừng <strong className="text-indigo-600">{studentName}</strong> đã hoàn thành xuất sắc thử thách!
            </p>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-700 font-medium">Điểm số chung cuộc:</span>
              <span className="text-lg font-black text-indigo-950">{score} điểm</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-indigo-200/50">
              <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                <Sparkles className="size-3.5 text-amber-500" /> Phần thưởng Sao:
              </span>
              <span className="text-sm font-bold text-amber-800">+10 Sao ⭐</span>
            </div>
          </div>

          <Link
            href="/"
            className="w-full py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Về trang chủ</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    )
  }

  // 3. In-Game Round Screen
  return (
    <div className="max-w-2xl mx-auto space-y-4 py-4 px-4">
      {/* Top Bar: Student Name, Score, Streak, Timer */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{avatar}</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">{studentName}</h3>
            <span className="text-xs text-indigo-600 font-bold">{score} pts</span>
          </div>
        </div>

        {streak > 1 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold animate-bounce">
            <Flame className="size-3.5 text-amber-500 fill-amber-500" />
            <span>x{streak} Streak!</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl font-mono font-bold text-sm text-slate-700">
          <Timer className="size-4 text-indigo-600" />
          <span>{timeLeft}s</span>
        </div>
      </div>

      {/* Question Prompt Card */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Câu hỏi {arena.currentQuestionIndex + 1} / {arena.questions.length}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>
      )}

      {/* Answer Tiles */}
      {currentQuestion && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const color = KAHOOT_COLORS[idx % KAHOOT_COLORS.length]
            const Icon = color.icon
            const isSelected = selectedOption === option

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleOptionSelect(option)}
                disabled={hasSubmitted || timeLeft === 0}
                className={`min-h-[90px] p-5 rounded-2xl font-bold text-base flex items-center gap-3 transition-all cursor-pointer shadow-md ${
                  color.bg
                } ${color.text} ${
                  isSelected ? 'ring-4 ring-white ring-offset-2 scale-102' : ''
                } ${hasSubmitted ? 'opacity-80' : 'hover:scale-101 active:scale-98'}`}
              >
                <div className="size-9 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
                  <Icon className="size-5" />
                </div>
                <span className="text-left flex-1 break-words">{option}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Immediate Result / Reveal Feedback Banner */}
      {hasSubmitted && answerResult && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md animate-in fade-in zoom-in-95 duration-200 ${
            answerResult.isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {answerResult.isCorrect ? (
            <CheckCircle2 className="size-7 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="size-7 text-rose-600 shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold">
              {answerResult.isCorrect ? 'Chính xác!' : 'Chưa đúng rồi!'}
            </h4>
            <p className="text-xs opacity-90">
              {answerResult.isCorrect
                ? `+${answerResult.pointsEarned} điểm!`
                : `Đáp án đúng là: ${answerResult.correctAnswer}`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
