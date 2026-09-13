// src/components/admin/arena/TeacherArenaHost.tsx

'use client'

import React, { useState, useEffect, useTransition, useMemo } from 'react'
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
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  UserX,
} from 'lucide-react'
import type { LiveArena, LiveArenaParticipant } from '@/types/arena'
import {
  advanceArenaStateAction,
  finalizeArenaAction,
  getLiveArenaByIdAction,
  kickParticipantAction,
} from '@/app/actions/arena'
import { ArenaPodium } from './ArenaPodium'
import { sortArenaLeaderboard } from '@/lib/arena/scoring'
import { generateArenaQrSvg } from '@/lib/arena/qr-generator'
import { arenaSound } from '@/lib/arena/sound-engine'

interface TeacherArenaHostProps {
  initialArena: LiveArena
  initialParticipants: LiveArenaParticipant[]
}

const KAHOOT_COLORS = [
  { bg: 'bg-rose-500', barBg: 'bg-rose-500', text: 'text-white', label: 'Tam Giác', icon: Triangle },
  { bg: 'bg-blue-500', barBg: 'bg-blue-500', text: 'text-white', label: 'Hình Thoi', icon: Diamond },
  { bg: 'bg-amber-400', barBg: 'bg-amber-400', text: 'text-slate-900', label: 'Hình Tròn', icon: Circle },
  { bg: 'bg-emerald-500', barBg: 'bg-emerald-500', text: 'text-white', label: 'Hình Vuông', icon: Square },
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(arenaSound.isMuted())

  // Dynamic QR Code SVG for student join URL
  const qrSvg = useMemo(() => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gamehub.vn'
      const joinUrl = `${origin}/arena/${arena.pinCode}`
      return generateArenaQrSvg(joinUrl, { size: 240, margin: 2 })
    } catch {
      return ''
    }
  }, [arena.pinCode])

  // Toggle fullscreen mode
  function toggleFullscreen() {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Toggle sound mute
  function toggleMute() {
    const nextMuted = !isMuted
    arenaSound.setMuted(nextMuted)
    setIsMuted(nextMuted)
  }

  // Sound triggers: Lobby groove
  useEffect(() => {
    if (arena.status === 'lobby' && !isMuted) {
      arenaSound.playLobbyGroove()
    } else {
      arenaSound.stopLobbyGroove()
    }

    return () => {
      arenaSound.stopLobbyGroove()
    }
  }, [arena.status, isMuted])

  // Sound triggers: countdown tension
  useEffect(() => {
    if (arena.status === 'in_progress' && timeLeft > 0 && !isMuted) {
      arenaSound.playCountdownTension(timeLeft)
    }
  }, [arena.status, timeLeft, isMuted])

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

  // Compute live answer counts per option
  const answerCounts = useMemo(() => {
    const counts = [0, 0, 0, 0]
    if (!currentQuestion) return counts

    participants.forEach((p) => {
      const ans = p.answers.find((a) => a.questionIndex === arena.currentQuestionIndex)
      if (ans) {
        const optIdx = currentQuestion.options.indexOf(ans.selectedOption)
        if (optIdx >= 0 && optIdx < 4) {
          counts[optIdx]++
        }
      }
    })
    return counts
  }, [participants, arena.currentQuestionIndex, currentQuestion])

  const totalAnswered = useMemo(() => {
    return answerCounts.reduce((acc, c) => acc + c, 0)
  }, [answerCounts])

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
    if (!isMuted) {
      arenaSound.playRevealDrumroll()
    }
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
    if (!isMuted) {
      arenaSound.playPodiumCelebration()
    }
    startTransition(async () => {
      const res = await finalizeArenaAction(arena.id)
      if (res.success) {
        setArena((prev) => ({ ...prev, status: 'finished' }))
      }
    })
  }

  async function handleKickParticipant(studentName: string) {
    setParticipants((prev) => prev.filter((p) => p.studentName !== studentName))
    await kickParticipantAction(arena.id, studentName)
  }

  // 1. Finished Podium Mode
  if (arena.status === 'finished') {
    return <ArenaPodium participants={participants} arenaId={arena.id} />
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 px-4">
      {/* Smartboard Broadcast Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span className="px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-base font-bold border border-indigo-500/30">
              Live Classroom Arena
            </span>
            <span className="text-base text-slate-300 capitalize font-medium">
              Trạng thái: {arena.status}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{arena.title}</h1>
        </div>

        {/* Big Game PIN Badge & Quick Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center">
            <span className="text-base uppercase font-bold text-slate-200 block tracking-wider">
              Vào game: <strong className="text-white">/arena</strong>
            </span>
            <span className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-amber-300">
              {arena.pinCode}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toàn màn hình"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
              title="Toàn màn hình máy chiếu"
            >
              {isFullscreen ? <Minimize2 className="size-6" /> : <Maximize2 className="size-6" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label="Âm thanh"
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="size-6 text-rose-400" /> : <Volume2 className="size-6 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Lobby View with Dynamic SVG QR Code */}
      {arena.status === 'lobby' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-8 text-center">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="size-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Users className="size-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Sảnh Chờ ({participants.length} bạn đã vào)
            </h2>
            <p className="text-base text-slate-600">
              Quét mã QR bên dưới bằng máy tính bảng/điện thoại hoặc truy cập{' '}
              <strong className="text-indigo-600 font-bold">/arena</strong> và nhập PIN{' '}
              <strong className="font-mono text-slate-900 font-black">{arena.pinCode}</strong>.
            </p>
          </div>

          {/* QR Code & Join Prompt Area */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-200">
            {qrSvg && (
              <div
                data-testid="arena-qr-code"
                className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center [&>svg]:w-52 [&>svg]:h-52"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            )}

            <div className="space-y-3 text-left max-w-sm">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-base font-bold text-slate-500 uppercase tracking-wider block">
                  Mã phòng đấu
                </span>
                <span className="text-4xl font-black font-mono text-indigo-600 tracking-wider">
                  {arena.pinCode}
                </span>
              </div>
              <p className="text-base text-slate-600">
                Khi học sinh đã vào đủ, bấm nút bắt đầu để mở câu hỏi đầu tiên!
              </p>
            </div>
          </div>

          {/* Participant Avatar Grid with Kick Controls */}
          <div className="min-h-[160px] p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            {participants.length === 0 ? (
              <p className="text-base text-slate-500 py-8 italic font-medium">
                Đang chờ học sinh quét mã QR hoặc nhập PIN...
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-xs animate-in zoom-in-90 duration-200"
                  >
                    <span className="text-3xl">{p.avatar}</span>
                    <span className="text-base font-bold text-slate-800">{p.studentName}</span>
                    <button
                      type="button"
                      data-testid={`kick-participant-${p.studentName}`}
                      onClick={() => handleKickParticipant(p.studentName)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Mời ra khỏi phòng"
                      aria-label={`Mời ${p.studentName} ra khỏi phòng`}
                    >
                      <UserX className="size-5" />
                    </button>
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
              className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-600/25 inline-flex items-center gap-3 cursor-pointer transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-6 animate-spin" /> : <Play className="size-6" />}
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
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-base font-bold">
                Câu {arena.currentQuestionIndex + 1} / {arena.questions.length}
              </span>
              <span className="text-2xl font-mono font-black text-rose-600 bg-rose-50 px-5 py-1.5 rounded-xl">
                {timeLeft}s
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 max-w-3xl mx-auto leading-relaxed">
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
                  className={`min-h-[110px] p-6 rounded-3xl font-bold text-xl sm:text-2xl flex items-center gap-4 shadow-md ${color.bg} ${color.text}`}
                >
                  <div className="size-12 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
                    <Icon className="size-7" />
                  </div>
                  <span className="flex-1 break-words">{opt}</span>
                </div>
              )
            })}
          </div>

          {/* Live Response Histogram */}
          <div
            data-testid="response-histogram"
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Thống kê phản hồi trực tiếp ({totalAnswered} / {participants.length} đã nộp)
              </h3>
            </div>
            <div className="grid grid-cols-4 gap-3 items-end h-28 pt-2">
              {KAHOOT_COLORS.map((color, idx) => {
                const count = answerCounts[idx] || 0
                const percent = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-base font-bold text-slate-700">{count} ({percent}%)</span>
                    <div className="w-full bg-slate-100 rounded-xl h-16 flex items-end overflow-hidden">
                      <div
                        className={`w-full ${color.barBg} transition-all duration-300 rounded-b-xl`}
                        style={{ height: `${Math.max(10, percent)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Host Control Bar */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleReveal}
              disabled={isPending}
              className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md inline-flex items-center gap-3 cursor-pointer"
            >
              {isPending && <Loader2 className="size-5 animate-spin" />}
              <span>Hiện đáp án (Reveal)</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Reveal Mode */}
      {arena.status === 'reveal' && currentQuestion && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-6">
          <div className="space-y-3">
            <span className="text-base font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block">
              ✓ Đáp án chính xác
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {currentQuestion.correctAnswer}
            </h2>
            {currentQuestion.explanation && (
              <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto italic">
                {currentQuestion.explanation}
              </p>
            )}
          </div>

          {/* Response distribution on reveal */}
          <div
            data-testid="response-histogram"
            className="bg-slate-50 rounded-2xl p-6 max-w-xl mx-auto space-y-3 text-left"
          >
            <h4 className="text-base font-bold text-slate-700">Tỉ lệ lựa chọn của cả lớp:</h4>
            <div className="space-y-2">
              {currentQuestion.options.map((opt, idx) => {
                const color = KAHOOT_COLORS[idx % KAHOOT_COLORS.length]
                const count = answerCounts[idx] || 0
                const percent = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0
                const isCorrect = opt.trim() === currentQuestion.correctAnswer.trim()
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-base font-bold text-slate-800">
                      <span>{opt} {isCorrect ? '✓' : ''}</span>
                      <span>{count} bạn ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${color.barBg} transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={handleShowLeaderboard}
              disabled={isPending}
              className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-md inline-flex items-center gap-3 cursor-pointer"
            >
              {isPending && <Loader2 className="size-6 animate-spin" />}
              <span>Xem Bảng Xếp Hạng</span>
              <ArrowRight className="size-6" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Leaderboard Mode */}
      {arena.status === 'leaderboard' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="size-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Trophy className="size-7" />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Bảng Xếp Hạng Tạm Thời</h2>
            <p className="text-base text-slate-600">Top 5 thí sinh xuất sắc nhất vòng đấu này</p>
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            {sortArenaLeaderboard(participants)
              .slice(0, 5)
              .map((p, idx) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="size-8 rounded-full bg-slate-200 text-slate-800 font-bold text-base flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-3xl">{p.avatar}</span>
                    <span className="text-lg font-bold text-slate-800">{p.studentName}</span>
                    {p.streak > 1 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-base font-bold flex items-center gap-1">
                        <Flame className="size-4 text-amber-600 fill-amber-600" />
                        x{p.streak}
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-black text-indigo-950">{p.score} pts</span>
                </div>
              ))}
          </div>

          <div className="flex items-center justify-center pt-3">
            {isLastQuestion ? (
              <button
                type="button"
                onClick={handleFinalize}
                disabled={isPending}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-black text-lg shadow-lg shadow-amber-500/25 inline-flex items-center gap-3 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <Sparkles className="size-6" />
                )}
                <span>Lên Bục Trao Giải (Podium)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                disabled={isPending}
                className="px-10 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-md inline-flex items-center gap-3 cursor-pointer"
              >
                {isPending && <Loader2 className="size-6 animate-spin" />}
                <span>Câu hỏi tiếp theo</span>
                <ArrowRight className="size-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
