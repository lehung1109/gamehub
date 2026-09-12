// src/components/admin/arena/TeacherArenaHost.tsx

'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  Users,
  Play,
  ArrowRight,
  Sparkles,
  Flame,
  Trophy,
  Loader2,
  Triangle,
  Square,
  Circle,
  Diamond,
} from 'lucide-react'
import type { LiveArena, LiveArenaParticipant } from '@/types/arena'
import {
  advanceArenaStateAction,
  finalizeArenaAction,
  getLiveArenaByIdAction,
} from '@/app/actions/arena'
import { ArenaPodium } from './ArenaPodium'
import { sortArenaLeaderboard } from '@/lib/arena/scoring'

interface TeacherArenaHostProps {
  initialArena: LiveArena
  initialParticipants: LiveArenaParticipant[]
}

const KAHOOT_COLORS = [
  { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-white', icon: Triangle },
  { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white', icon: Diamond },
  { bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-slate-900', icon: Circle },
  { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white', icon: Square },
]

export function TeacherArenaHost({
  initialArena,
  initialParticipants,
}: TeacherArenaHostProps) {
  const [arena, setArena] = useState<LiveArena>(initialArena)
  const [participants, setParticipants] = useState<LiveArenaParticipant[]>(initialParticipants)
  const initialLimit = initialArena.questions[initialArena.currentQuestionIndex]?.timeLimitSeconds || 15
  const [timeLeft, setTimeLeft] = useState(initialLimit)
  const [isPending, startTransition] = useTransition()

  // Polling participant join updates & answer counts
  useEffect(() => {
    if (arena.status === 'finished') return

    const interval = setInterval(async () => {
      const res = await getLiveArenaByIdAction(arena.id)
      if (res.success && res.arena && res.participants) {
        setArena(res.arena)
        setParticipants(res.participants)
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [arena.id, arena.status])

  // Question countdown in_progress
  useEffect(() => {
    if (arena.status !== 'in_progress') return

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
  }, [arena.status, arena.currentQuestionIndex])

  const currentQuestion = arena.questions[arena.currentQuestionIndex]
  const isLastQuestion = arena.currentQuestionIndex >= arena.questions.length - 1

  function handleStartBattle() {
    const q0 = arena.questions[0]
    setTimeLeft(q0?.timeLimitSeconds || 15)
    startTransition(async () => {
      const res = await advanceArenaStateAction(arena.id, 'in_progress', 0)
      if (res.success) {
        setArena((prev) => ({ ...prev, status: 'in_progress', currentQuestionIndex: 0 }))
      }
    })
  }

  function handleReveal() {
    startTransition(async () => {
      const res = await advanceArenaStateAction(arena.id, 'reveal')
      if (res.success) {
        setArena((prev) => ({ ...prev, status: 'reveal' }))
      }
    })
  }

  function handleShowLeaderboard() {
    startTransition(async () => {
      const res = await advanceArenaStateAction(arena.id, 'leaderboard')
      if (res.success) {
        setArena((prev) => ({ ...prev, status: 'leaderboard' }))
      }
    })
  }

  function handleNextQuestion() {
    const nextIdx = arena.currentQuestionIndex + 1
    const nextQ = arena.questions[nextIdx]
    setTimeLeft(nextQ?.timeLimitSeconds || 15)
    startTransition(async () => {
      const res = await advanceArenaStateAction(arena.id, 'in_progress', nextIdx)
      if (res.success) {
        setArena((prev) => ({
          ...prev,
          status: 'in_progress',
          currentQuestionIndex: nextIdx,
        }))
      }
    })
  }

  function handleFinalize() {
    startTransition(async () => {
      const res = await finalizeArenaAction(arena.id)
      if (res.success) {
        setArena((prev) => ({ ...prev, status: 'finished' }))
      }
    })
  }

  // 1. Finished Podium Mode
  if (arena.status === 'finished') {
    return <ArenaPodium participants={participants} />
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 px-4">
      {/* Smartboard Broadcast Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              Live Classroom Arena
            </span>
            <span className="text-xs text-slate-400 capitalize">Trạng thái: {arena.status}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{arena.title}</h1>
        </div>

        {/* Big Game PIN Badge for Student Screen Joining */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-4 text-center">
          <div>
            <span className="text-xs uppercase font-bold text-slate-300 block tracking-wider">
              Vào game: <strong className="text-white">/arena</strong>
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-300">
              {arena.pinCode}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Lobby View */}
      {arena.status === 'lobby' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-2">
            <div className="size-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Users className="size-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Sảnh Chờ ({participants.length} bạn đã vào)
            </h2>
            <p className="text-xs text-slate-500">
              Học sinh truy cập <strong className="text-indigo-600">/arena</strong> và nhập mã PIN{' '}
              <strong className="font-mono text-slate-800">{arena.pinCode}</strong> để tham gia.
            </p>
          </div>

          {/* Participant Avatar Grid */}
          <div className="min-h-[160px] p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            {participants.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 italic">
                Đang chờ học sinh quét mã hoặc nhập PIN...
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-xs animate-in zoom-in-90 duration-200"
                  >
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="text-sm font-bold text-slate-800">{p.studentName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartBattle}
              disabled={isPending}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5" />}
              <span>Bắt đầu trận đấu</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. In-Progress Question Mode */}
      {arena.status === 'in_progress' && currentQuestion && (
        <div className="space-y-6">
          {/* Question Display Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg text-center space-y-4">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                Câu {arena.currentQuestionIndex + 1} / {arena.questions.length}
              </span>
              <span className="text-xl font-mono font-black text-rose-600 bg-rose-50 px-4 py-1 rounded-xl">
                {timeLeft}s
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 max-w-3xl mx-auto leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* 4 Colored Option Tiles on Big Screen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, idx) => {
              const color = KAHOOT_COLORS[idx % KAHOOT_COLORS.length]
              const Icon = color.icon
              return (
                <div
                  key={idx}
                  className={`min-h-[110px] p-6 rounded-3xl font-bold text-lg sm:text-xl flex items-center gap-4 shadow-md ${color.bg} ${color.text}`}
                >
                  <div className="size-10 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
                    <Icon className="size-6" />
                  </div>
                  <span className="flex-1 break-words">{opt}</span>
                </div>
              )
            })}
          </div>

          {/* Host Control Bar */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleReveal}
              disabled={isPending}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              <span>Hiện đáp án (Reveal)</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Reveal Mode */}
      {arena.status === 'reveal' && currentQuestion && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block">
              ✓ Đáp án chính xác
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {currentQuestion.correctAnswer}
            </h2>
            {currentQuestion.explanation && (
              <p className="text-sm text-slate-500 max-w-lg mx-auto italic">
                {currentQuestion.explanation}
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={handleShowLeaderboard}
              disabled={isPending}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              {isPending && <Loader2 className="size-5 animate-spin" />}
              <span>Xem Bảng Xếp Hạng</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Leaderboard Mode */}
      {arena.status === 'leaderboard' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="text-center space-y-1">
            <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Trophy className="size-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Bảng Xếp Hạng Tạm Thời</h2>
            <p className="text-xs text-slate-500">Top 5 thí sinh xuất sắc nhất vòng đấu này</p>
          </div>

          <div className="max-w-xl mx-auto space-y-2.5">
            {sortArenaLeaderboard(participants)
              .slice(0, 5)
              .map((p, idx) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-2xl">{p.avatar}</span>
                    <span className="text-base font-bold text-slate-800">{p.studentName}</span>
                    {p.streak > 1 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                        <Flame className="size-3 text-amber-600 fill-amber-600" />
                        x{p.streak}
                      </span>
                    )}
                  </div>
                  <span className="text-base font-black text-indigo-950">{p.score} pts</span>
                </div>
              ))}
          </div>

          <div className="flex items-center justify-center pt-2">
            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={isPending}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-black text-base shadow-lg shadow-amber-500/25 inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Sparkles className="size-5" />
                )}
                <span>Lên Bục Trao Giải (Podium)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={isPending}
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                {isPending && <Loader2 className="size-5 animate-spin" />}
                <span>Câu hỏi tiếp theo</span>
                <ArrowRight className="size-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
