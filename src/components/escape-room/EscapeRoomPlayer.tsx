// src/components/escape-room/EscapeRoomPlayer.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Pause,
  Play,
  KeyRound,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react'
import type {
  EscapeRoom,
  EscapeClueHotspot,
  EscapeResult,
} from '@/types/phonics-escape-room'
import {
  calculateEscapeScore,
} from '@/lib/phonics-escape-room-engine'
import { submitEscapeScoreAction } from '@/app/actions/phonics-escape-room'
import { EscapeClueModal } from './EscapeClueModal'
import { EscapeCipherKeypad } from './EscapeCipherKeypad'
import { EscapeCertificateModal } from './EscapeCertificateModal'

interface EscapeRoomPlayerProps {
  room: EscapeRoom
  onCompleteEscape?: (result: EscapeResult) => void
}

export function EscapeRoomPlayer({
  room,
  onCompleteEscape,
}: EscapeRoomPlayerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(room.durationSeconds)
  const [isPaused, setIsPaused] = useState(false)
  const [solvedHotspotIds, setSolvedHotspotIds] = useState<Set<string>>(new Set())
  const [unlockedCipherChars, setUnlockedCipherChars] = useState<string[]>([])
  const [activeHotspot, setActiveHotspot] = useState<EscapeClueHotspot | null>(null)
  const [isCipherKeypadOpen, setIsCipherKeypadOpen] = useState(false)
  const [isEscaped, setIsEscaped] = useState(false)
  const [escapeResult, setEscapeResult] = useState<EscapeResult | null>(null)

  const timeSpentSeconds = room.durationSeconds - remainingSeconds

  const finishEscape = useCallback(
    (escaped: boolean) => {
      const summary = calculateEscapeScore(
        room.id,
        solvedHotspotIds.size,
        room.hotspots.length,
        escaped,
        timeSpentSeconds
      )
      setEscapeResult(summary)
      setIsEscaped(escaped)
      submitEscapeScoreAction(summary).catch((err) => {
        console.error('Failed to submit escape room score:', err)
      })
      onCompleteEscape?.(summary)
    },
    [room.id, solvedHotspotIds.size, room.hotspots.length, timeSpentSeconds, onCompleteEscape]
  )

  // Timer Countdown Effect
  useEffect(() => {
    if (isPaused || isEscaped || remainingSeconds <= 0) return

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, isEscaped, remainingSeconds])

  // Handle timeout
  useEffect(() => {
    if (remainingSeconds === 0 && !isEscaped && !escapeResult) {
      finishEscape(false)
    }
  }, [remainingSeconds, isEscaped, escapeResult, finishEscape])

  const handleSolveClue = (unlockedChar: string) => {
    if (activeHotspot) {
      setSolvedHotspotIds((prev) => new Set([...prev, activeHotspot.id]))
      if (!unlockedCipherChars.includes(unlockedChar)) {
        setUnlockedCipherChars((prev) => [...prev, unlockedChar])
      }
    }
    setActiveHotspot(null)
  }

  const handleUnlockSuccess = () => {
    setIsCipherKeypadOpen(false)
    finishEscape(true)
  }

  const handleReplay = () => {
    setRemainingSeconds(room.durationSeconds)
    setIsPaused(false)
    setSolvedHotspotIds(new Set())
    setUnlockedCipherChars([])
    setActiveHotspot(null)
    setIsCipherKeypadOpen(false)
    setIsEscaped(false)
    setEscapeResult(null)
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Theme-specific styles
  const themeBackgroundMap: Record<string, string> = {
    pyramid: 'from-amber-950 via-yellow-950 to-stone-950 border-amber-600/50',
    library: 'from-indigo-950 via-purple-950 to-slate-950 border-purple-600/50',
    'space-lab': 'from-cyan-950 via-slate-950 to-blue-950 border-cyan-600/50',
  }

  const bgStyle = themeBackgroundMap[room.theme] || themeBackgroundMap.pyramid

  if (escapeResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EscapeCertificateModal
          roomTitle={room.titleVi}
          result={escapeResult}
          onReplay={handleReplay}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/escape-room"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Về Sảnh Thoát Hiểm</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {/* Countdown Clock */}
          <div
            className={`px-4 py-2 rounded-2xl border font-black text-lg inline-flex items-center gap-2 ${
              remainingSeconds <= 60
                ? 'bg-rose-100 border-rose-300 text-rose-950 animate-pulse'
                : 'bg-amber-100 border-amber-300 text-amber-950'
            }`}
          >
            <Clock className="size-5 text-amber-700" />
            <span>Thời Gian: {formatTimer(remainingSeconds)}</span>
          </div>

          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? 'Tiếp tục đếm giờ' : 'Tạm dừng đếm giờ'}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer transition-colors"
          >
            {isPaused ? <Play className="size-5" /> : <Pause className="size-5" />}
          </button>

          {/* Clues Count */}
          <span className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-lg inline-flex items-center gap-2">
            <span>🔍 Manh Mối:</span>
            <span>
              {solvedHotspotIds.size}/{room.hotspots.length}
            </span>
          </span>
        </div>
      </div>

      {/* Main Thematic Room Canvas */}
      <div
        className={`relative w-full h-[460px] sm:h-[540px] rounded-3xl overflow-hidden border-4 shadow-2xl bg-linear-to-b ${bgStyle}`}
      >
        {/* Ambient Room Header Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 pointer-events-auto">
            <h1 className="text-xl sm:text-2xl font-black text-amber-300">
              {room.titleVi}
            </h1>
            <p className="text-base text-slate-300 font-medium">
              Mục tiêu: {room.targetPhonics}
            </p>
          </div>
        </div>

        {/* Master Escape Vault Door (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsCipherKeypadOpen(true)}
            aria-label="Mở ổ khóa mật mã cửa chính"
            className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/90 border-4 border-amber-400 hover:border-amber-300 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer transition-all"
          >
            <div className="p-4 rounded-2xl bg-amber-400/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Lock className="size-12 sm:size-16" />
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-400 pt-2">
              CỬA THOÁT HIỂM
            </span>
            <span className="text-base font-bold text-slate-300">
              Bấm để nhập mật mã 4 chữ cái
            </span>
          </button>
        </div>

        {/* Interactive Hot-spots Pins */}
        {room.hotspots.map((hs) => {
          const isSolved = solvedHotspotIds.has(hs.id)
          return (
            <div
              key={hs.id}
              style={{ left: `${hs.positionX}%`, top: `${hs.positionY}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            >
              <button
                type="button"
                onClick={() => setActiveHotspot(hs)}
                aria-label={`Khám phá manh mối ${hs.titleVi}`}
                className={`group flex items-center gap-2 p-3 sm:p-3.5 rounded-2xl font-black text-base cursor-pointer shadow-lg transition-all hover:scale-110 active:scale-95 ${
                  isSolved
                    ? 'bg-emerald-600/95 text-white border-2 border-emerald-400 shadow-emerald-600/30'
                    : 'bg-slate-900/95 text-amber-300 border-2 border-amber-400 hover:bg-slate-800 animate-pulse'
                }`}
              >
                <span className="text-2xl">{hs.icon}</span>
                <span className="hidden sm:inline">{hs.titleVi}</span>
                {isSolved ? (
                  <CheckCircle2 className="size-5 text-emerald-200" />
                ) : (
                  <Sparkles className="size-5 text-amber-400" />
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Detective Clue Notebook Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 text-lg font-black">
            <span>📓 Sổ Tay Mật Mã Thám Tử</span>
          </div>
          <p className="text-base text-slate-300 font-medium">
            Thu thập đủ các mảnh ghép để giải mã từ khóa mở cửa:
          </p>
        </div>

        {/* Collected Char Badges */}
        <div className="flex items-center gap-2.5">
          {Array.from({ length: room.masterCipherWord.length }).map((_, idx) => {
            const char = unlockedCipherChars[idx]
            return (
              <div
                key={idx}
                className={`size-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all ${
                  char
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-800 border-2 border-dashed border-slate-600 text-slate-500'
                }`}
              >
                {char || '?'}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsCipherKeypadOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base sm:text-lg inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 transition-all"
        >
          <KeyRound className="size-5" />
          <span>Mở Khóa Cửa</span>
        </button>
      </div>

      {/* Clue Inspection Modal */}
      {activeHotspot && (
        <EscapeClueModal
          hotspot={activeHotspot}
          isSolved={solvedHotspotIds.has(activeHotspot.id)}
          onSolveClue={handleSolveClue}
          onClose={() => setActiveHotspot(null)}
        />
      )}

      {/* Master Cipher Keypad Modal */}
      {isCipherKeypadOpen && (
        <EscapeCipherKeypad
          masterCipherWord={room.masterCipherWord}
          cipherHintVi={room.cipherHintVi}
          unlockedChars={new Set(unlockedCipherChars)}
          onUnlockSuccess={handleUnlockSuccess}
          onClose={() => setIsCipherKeypadOpen(false)}
        />
      )}
    </div>
  )
}
