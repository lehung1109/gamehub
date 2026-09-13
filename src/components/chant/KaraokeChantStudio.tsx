// src/components/chant/KaraokeChantStudio.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  ArrowLeft,
  Music,
  Heart,
} from 'lucide-react'
import type { PhonicsChant, ChantPerformanceScore } from '@/types/phonics-chant'
import {
  calculateBeatIntervalMs,
  calculateRhythmScore,
  calculatePerformanceSummary,
} from '@/lib/phonics-chant-engine'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { submitChantPerformanceAction } from '@/app/actions/phonics-chant'
import { ChantCompletedModal } from './ChantCompletedModal'
import { useSpeech } from '@/hooks/useSpeech'

interface KaraokeChantStudioProps {
  chant: PhonicsChant
  onCompletePerformance?: (score: ChantPerformanceScore) => void
}

export function KaraokeChantStudio({
  chant,
  onCompletePerformance,
}: KaraokeChantStudioProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [perfectCount, setPerfectCount] = useState(0)
  const [greatCount, setGreatCount] = useState(0)
  const [goodCount, setGoodCount] = useState(0)
  const [missCount, setMissCount] = useState(0)
  const [rhythmFeedback, setRhythmFeedback] = useState<'PERFECT' | 'GREAT' | 'GOOD' | 'MISS' | null>(null)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState<ChantPerformanceScore | null>(null)

  const synthRef = useRef<SoundSynthesizer | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastBeatTimeRef = useRef<number>(0)

  const { speak } = useSpeech({ rate: 0.9 })
  const beatIntervalMs = calculateBeatIntervalMs(chant.bpm)

  // Initialize synth on client side
  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      void synthRef.current?.close()
    }
  }, [])

  const finishChant = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setIsRecordingVoice(false)

    const summary = calculatePerformanceSummary(
      chant.id,
      perfectCount,
      greatCount,
      goodCount,
      missCount,
      maxCombo,
      chant.totalBeats
    )
    setFinalScore(summary)
    setIsCompleted(true)
    submitChantPerformanceAction(summary).catch((err) => {
      console.error('Failed to submit chant performance:', err)
    })
    onCompletePerformance?.(summary)
  }, [chant.id, chant.totalBeats, perfectCount, greatCount, goodCount, missCount, maxCombo, onCompletePerformance])

  // Beat tick handler
  const handleBeatTick = useCallback(() => {
    setCurrentBeat((prev) => {
      const nextBeat = prev + 1
      lastBeatTimeRef.current = Date.now()

      // Procedural percussion beat
      if (synthRef.current) {
        if (nextBeat % 2 === 0) {
          synthRef.current.playKick()
        } else {
          synthRef.current.playWoodblock()
        }
      }

      if (nextBeat >= chant.totalBeats) {
        finishChant()
        return chant.totalBeats
      }
      return nextBeat
    })
  }, [chant.totalBeats, finishChant])

  // Play / Pause loop
  function handleTogglePlay() {
    if (isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsPlaying(false)
    } else {
      if (currentBeat >= chant.totalBeats) {
        setCurrentBeat(0)
        setCombo(0)
        setRhythmFeedback(null)
      }
      lastBeatTimeRef.current = Date.now()
      if (synthRef.current) {
        synthRef.current.playWoodblock()
      }
      setIsPlaying(true)
      timerRef.current = setInterval(handleBeatTick, beatIntervalMs)
    }
  }

  function handleReset() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setCurrentBeat(0)
    setCombo(0)
    setMaxCombo(0)
    setPerfectCount(0)
    setGreatCount(0)
    setGoodCount(0)
    setMissCount(0)
    setRhythmFeedback(null)
    setIsRecordingVoice(false)
    setIsCompleted(false)
    setFinalScore(null)
  }

  // Rhythm Tap Action (User claps or taps along)
  function handleRhythmTap() {
    const now = Date.now()
    const diff = lastBeatTimeRef.current > 0 ? now - lastBeatTimeRef.current : 0
    // Check timing difference to nearest beat interval
    const normalizedDiff = diff > beatIntervalMs / 2 ? diff - beatIntervalMs : diff
    const rating = calculateRhythmScore(normalizedDiff)

    setRhythmFeedback(rating)

    if (rating === 'PERFECT') {
      setPerfectCount((c) => c + 1)
      setCombo((c) => {
        const next = c + 1
        setMaxCombo((m) => Math.max(m, next))
        return next
      })
      synthRef.current?.playChime()
    } else if (rating === 'GREAT') {
      setGreatCount((c) => c + 1)
      setCombo((c) => {
        const next = c + 1
        setMaxCombo((m) => Math.max(m, next))
        return next
      })
      synthRef.current?.playSnare()
    } else if (rating === 'GOOD') {
      setGoodCount((c) => c + 1)
      setCombo((c) => {
        const next = c + 1
        setMaxCombo((m) => Math.max(m, next))
        return next
      })
    } else {
      setMissCount((c) => c + 1)
      setCombo(0)
    }
  }

  function handleListenSampleLine(text: string) {
    speak(text)
  }

  function handleToggleVoiceRecording() {
    setIsRecordingVoice((prev) => !prev)
  }

  if (isCompleted && finalScore) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <ChantCompletedModal
          chantTitle={chant.titleVi}
          score={finalScore}
          onReplay={handleReset}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
        <Link
          href="/chants"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Kho Bài Vè</span>
        </Link>

        <div className="text-center space-y-0.5">
          <span className="block text-base font-bold text-slate-500">
            Tiết tấu: {chant.bpm} BPM • Nhịp: {currentBeat}/{chant.totalBeats}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {chant.titleVi}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-950 font-black text-base inline-flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-600" />
            <span>Combo: {combo}x</span>
          </span>
        </div>
      </div>

      {/* Main Studio Console */}
      <div className="bg-white rounded-3xl border-4 border-slate-800 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Phonics & Rhythm Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{chant.badgeIcon}</span>
            <div>
              <span className="block text-base font-black text-indigo-950">
                Mục tiêu Phonics: {chant.phonicsTarget}
              </span>
              <span className="block text-base font-semibold text-slate-600">
                {chant.descriptionVi}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label={isPlaying ? 'Tạm dừng nhạc đệm' : 'Phát nhịp điệu bài vè'}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base inline-flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/25 transition-all"
            >
              {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
              <span>{isPlaying ? 'Tạm Dừng' : 'Phát Nhịp Điệu'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              aria-label="Đặt lại bài vè từ đầu"
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base cursor-pointer transition-all"
            >
              <RotateCcw className="size-5" />
            </button>
          </div>
        </div>

        {/* Visual Metronome Beat Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-base font-bold text-slate-500">
            <span>Metronome Beat</span>
            <span>{Math.round((currentBeat / chant.totalBeats) * 100)}%</span>
          </div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 p-2 bg-slate-100 rounded-2xl">
            {Array.from({ length: chant.totalBeats }).map((_, idx) => (
              <div
                key={idx}
                className={`h-4 rounded-lg transition-all duration-150 ${
                  idx === currentBeat
                    ? 'bg-indigo-600 scale-y-125 shadow-md'
                    : idx < currentBeat
                    ? 'bg-indigo-200'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Karaoke Lines Display */}
        <div className="space-y-4 py-2">
          {chant.lines.map((line) => (
            <div
              key={line.id}
              className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 space-y-2 relative"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Words with synchronized highlight */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  {line.words.map((w, wIdx) => {
                    const isActive =
                      currentBeat >= Math.floor(w.beatIndex) &&
                      currentBeat < Math.floor(w.beatIndex) + 1.5

                    return (
                      <span
                        key={wIdx}
                        className={`text-2xl sm:text-3xl font-black rounded-xl px-2 py-1 transition-all ${
                          isActive
                            ? 'bg-amber-300 text-slate-950 scale-110 shadow-md ring-2 ring-amber-400'
                            : 'text-slate-800'
                        }`}
                      >
                        {w.word}
                        {w.phonicsFocus && (
                          <span className="ml-1 text-base font-black px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 uppercase">
                            /{w.phonicsFocus}/
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>

                {/* Line Rehearsal Audio Button */}
                <button
                  type="button"
                  onClick={() => handleListenSampleLine(line.textEn)}
                  aria-label={`Nghe đọc mẫu câu ${line.textEn}`}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 font-bold text-base cursor-pointer shrink-0 shadow-xs"
                >
                  <Volume2 className="size-5" />
                </button>
              </div>

              <p className="text-base text-slate-600 font-bold italic pt-1">
                {line.textVi}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Rhythm Clapping & Voice Recording Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Rhythm Tap Button */}
          <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-200 flex flex-col justify-between items-center text-center space-y-4">
            <div className="space-y-1">
              <span className="block text-lg font-black text-amber-950">
                👏 Vỗ Tay Theo Nhịp (Tap Beat)
              </span>
              <span className="block text-base text-slate-600 font-semibold">
                Nhấn đúng lúc đèn chuyển màu để ghi điểm!
              </span>
            </div>

            {/* Rhythm feedback popup */}
            {rhythmFeedback && (
              <div
                className={`text-2xl font-black uppercase px-6 py-2 rounded-2xl animate-bounce ${
                  rhythmFeedback === 'PERFECT'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : rhythmFeedback === 'GREAT'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : rhythmFeedback === 'GOOD'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {rhythmFeedback === 'PERFECT' && '⭐ PERFECT!'}
                {rhythmFeedback === 'GREAT' && '✨ GREAT!'}
                {rhythmFeedback === 'GOOD' && '👍 GOOD!'}
                {rhythmFeedback === 'MISS' && '💨 MISS!'}
              </div>
            )}

            <button
              type="button"
              onClick={handleRhythmTap}
              aria-label="Vỗ tay gõ nhịp điệu"
              className="w-full py-5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xl shadow-lg shadow-amber-500/30 cursor-pointer transition-all flex items-center justify-center gap-3"
            >
              <Music className="size-6" />
              <span>GÕ NHỊP NGAY!</span>
            </button>
          </div>

          {/* Karaoke Voice Recording */}
          <div className="p-6 rounded-3xl bg-purple-50 border-2 border-purple-200 flex flex-col justify-between items-center text-center space-y-4">
            <div className="space-y-1">
              <span className="block text-lg font-black text-purple-950">
                🎙️ Phòng Thu Karaoke
              </span>
              <span className="block text-base text-slate-600 font-semibold">
                Bật micro và hát vè hòa cùng âm nhạc nhé!
              </span>
            </div>

            <div className="flex items-center gap-2 text-base font-bold text-purple-800">
              <Heart className="size-5 text-rose-500 fill-rose-500" />
              <span>
                {isRecordingVoice ? 'Đang thu giọng hát của em...' : 'Sẵn sàng thu âm'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleVoiceRecording}
              aria-label={isRecordingVoice ? 'Dừng thu âm karaoke' : 'Bắt đầu thu âm karaoke'}
              className={`w-full py-5 rounded-2xl font-black text-xl inline-flex items-center justify-center gap-3 cursor-pointer shadow-lg transition-all ${
                isRecordingVoice
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30'
              }`}
            >
              {isRecordingVoice ? <MicOff className="size-6" /> : <Mic className="size-6" />}
              <span>{isRecordingVoice ? 'DỪNG THU ÂM' : 'BẬT MICRO HÁT'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
