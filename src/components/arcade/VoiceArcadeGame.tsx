// src/components/arcade/VoiceArcadeGame.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Mic,
  MicOff,
  Sparkles,
  ArrowLeft,
  Flame,
  Volume2,
  Zap,
} from 'lucide-react'
import type { ArcadeStage, ArcadeGameResult, ArcadeWordTarget } from '@/types/voice-arcade'
import { evaluateSpokenWord, calculateArcadeScore } from '@/lib/voice-arcade-engine'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeech } from '@/hooks/useSpeech'
import { ArcadeGameOverModal } from './ArcadeGameOverModal'

interface VoiceArcadeGameProps {
  stage: ArcadeStage
  onCompleteGame?: (result: ArcadeGameResult) => void
}

export function VoiceArcadeGame({ stage, onCompleteGame }: VoiceArcadeGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [wordsHit, setWordsHit] = useState(0)
  const [wordsMissed, setWordsMissed] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [feedbackEffect, setFeedbackEffect] = useState<'HIT' | 'MISS' | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [finalResult, setFinalResult] = useState<ArcadeGameResult | null>(null)

  const synthRef = useRef<SoundSynthesizer | null>(null)
  const { speak } = useSpeech({ rate: 0.9 })

  const currentTarget: ArcadeWordTarget = stage.words[currentWordIndex] || stage.words[0]

  // Initialize sound synthesizer
  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const finishGame = useCallback(
    (hits: number, misses: number, highestCombo: number) => {
      const summary = calculateArcadeScore(
        stage.id,
        stage.gameMode,
        hits,
        misses,
        highestCombo,
        currentTarget.scoreValue
      )
      setFinalResult(summary)
      setIsGameOver(true)
      onCompleteGame?.(summary)
    },
    [stage.id, stage.gameMode, currentTarget.scoreValue, onCompleteGame]
  )

  // Trigger hit reaction
  const handleWordSuccess = useCallback(() => {
    setIsJumping(true)
    setFeedbackEffect('HIT')
    synthRef.current?.playChime()

    const newHitCount = wordsHit + 1
    const newCombo = combo + 1
    const newMaxCombo = Math.max(maxCombo, newCombo)

    setWordsHit(newHitCount)
    setCombo(newCombo)
    setMaxCombo(newMaxCombo)
    setScore((s) => s + currentTarget.scoreValue + newCombo * 50)

    setTimeout(() => {
      setIsJumping(false)
      setFeedbackEffect(null)

      if (currentWordIndex + 1 >= stage.words.length) {
        finishGame(newHitCount, wordsMissed, newMaxCombo)
      } else {
        setCurrentWordIndex((i) => i + 1)
      }
    }, 1000)
  }, [wordsHit, combo, maxCombo, currentTarget.scoreValue, currentWordIndex, stage.words.length, wordsMissed, finishGame])

  // Trigger miss reaction
  const handleWordMiss = useCallback(() => {
    setFeedbackEffect('MISS')
    synthRef.current?.playKick()

    const newMissCount = wordsMissed + 1
    setWordsMissed(newMissCount)
    setCombo(0)

    setTimeout(() => {
      setFeedbackEffect(null)
      if (currentWordIndex + 1 >= stage.words.length) {
        finishGame(wordsHit, newMissCount, maxCombo)
      } else {
        setCurrentWordIndex((i) => i + 1)
      }
    }, 1000)
  }, [wordsMissed, wordsHit, maxCombo, currentWordIndex, stage.words.length, finishGame])

  // Speech Recognition hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isSpeechRecSupported,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: true,
    interimResults: true,
  })

  // Evaluate speech transcript whenever it updates
  useEffect(() => {
    if (!transcript || isJumping) return

    const matched = evaluateSpokenWord(transcript, currentTarget.word)
    if (matched) {
      handleWordSuccess()
    }
  }, [transcript, currentTarget.word, isJumping, handleWordSuccess])

  function handleListenSample() {
    speak(currentTarget.word)
  }

  function handleReplayGame() {
    setCurrentWordIndex(0)
    setScore(0)
    setCombo(0)
    setMaxCombo(0)
    setWordsHit(0)
    setWordsMissed(0)
    setIsJumping(false)
    setFeedbackEffect(null)
    setIsGameOver(false)
    setFinalResult(null)
  }

  if (isGameOver && finalResult) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <ArcadeGameOverModal
          stageTitle={stage.titleVi}
          result={finalResult}
          onReplay={handleReplayGame}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Navigation & Score HUD */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
        <Link
          href="/games/voice-arcade"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Khu Trò Chơi</span>
        </Link>

        {/* Score & Combo HUD */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-lg">
            Điểm: {score}
          </span>
          <span className="px-4 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-lg inline-flex items-center gap-1.5">
            <Flame className="size-5 text-amber-600" />
            <span>Combo: {combo}x</span>
          </span>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="bg-linear-to-b from-sky-100 via-indigo-50 to-emerald-50 rounded-3xl border-4 border-slate-800 shadow-2xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
        {/* Game Stage Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{stage.badgeIcon}</span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                {stage.titleEn}
              </h2>
              <span className="block text-base font-bold text-indigo-600">
                {stage.titleVi} • Mục tiêu: {stage.targetPhonics}
              </span>
            </div>
          </div>

          <span className="px-4 py-1.5 rounded-full bg-white text-slate-800 font-black text-base border-2 border-slate-200 shadow-xs">
            Tiến độ: {currentWordIndex + 1}/{stage.words.length}
          </span>
        </div>

        {/* Playfield Canvas / Arena Simulation */}
        <div className="relative h-64 sm:h-72 bg-linear-to-b from-sky-200 to-indigo-100 rounded-3xl border-3 border-slate-800 overflow-hidden flex flex-col justify-between p-6">
          {/* Target Word Floating Banner */}
          <div className="flex items-center justify-center">
            <div className="px-8 py-4 bg-white rounded-3xl border-4 border-amber-400 shadow-xl text-center space-y-1 animate-pulse">
              <span className="block text-base font-bold text-slate-500">
                HÔ TO TỪ NÀY VÀO MICRO:
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">{currentTarget.icon}</span>
                <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-wider">
                  {currentTarget.word}
                </span>
                <button
                  type="button"
                  onClick={handleListenSample}
                  aria-label={`Nghe phát âm từ ${currentTarget.word}`}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold text-base cursor-pointer"
                >
                  <Volume2 className="size-6" />
                </button>
              </div>
              <span className="block text-base font-bold text-indigo-600">
                {currentTarget.phonicsSound} • {currentTarget.translationVi}
              </span>
            </div>
          </div>

          {/* Feedback Splash Effect */}
          {feedbackEffect && (
            <div
              className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl font-black uppercase tracking-wider backdrop-blur-xs animate-in zoom-in-75 duration-150 z-20 ${
                feedbackEffect === 'HIT'
                  ? 'bg-emerald-500/30 text-emerald-800 drop-shadow-md'
                  : 'bg-rose-500/30 text-rose-800 drop-shadow-md'
              }`}
            >
              {feedbackEffect === 'HIT' ? '⭐ SUPER JUMP! (+100)' : '💨 CỐ LÊN NHÉ!'}
            </div>
          )}

          {/* Character Action Track */}
          <div className="flex items-end justify-between border-b-4 border-emerald-600 pb-2 relative z-10">
            {/* Player Character */}
            <div
              className={`text-6xl sm:text-7xl transition-all duration-300 ${
                isJumping ? '-translate-y-24 scale-110' : 'translate-y-0'
              }`}
            >
              {stage.gameMode === 'runner' ? '🐰' : stage.gameMode === 'blaster' ? '🚀' : '🛸'}
            </div>

            {/* Target Hurdle / Asteroid */}
            <div className="flex items-center gap-3">
              <span className="text-6xl animate-bounce">
                {stage.gameMode === 'runner' ? '🥕' : '☄️'}
              </span>
            </div>
          </div>
        </div>

        {/* Voice Controller Bar & Fallback Buttons */}
        <div className="p-6 rounded-3xl bg-white border-3 border-slate-800 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-950 font-black text-lg">
                <Mic className="size-6 text-indigo-600" />
                <span>Micro Điều Khiển Giọng Nói</span>
              </div>
              <p className="text-base text-slate-600 font-semibold">
                {isListening
                  ? 'Micro đang lắng nghe! Hãy nói to từ hiển thị phía trên để kích hoạt hành động!'
                  : 'Nhấn nút Bật Micro hoặc dùng phím thử nghiệm bên dưới.'}
              </p>
            </div>

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              aria-label={isListening ? 'Tắt micro điều khiển' : 'Bật micro điều khiển'}
              className={`px-6 py-4 rounded-2xl font-black text-lg inline-flex items-center gap-3 cursor-pointer shadow-lg transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
              }`}
            >
              {isListening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
              <span>{isListening ? 'DỪNG MICRO' : 'BẬT MICRO ĐIỀU KHIỂN'}</span>
            </button>
          </div>

          {/* Quick Voice Simulation Buttons for testing / non-mic environments */}
          <div className="pt-2 border-t-2 border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-base font-bold text-slate-500">
              Thử nghiệm giọng nói nhanh:
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWordSuccess}
                aria-label={`Phát âm đúng từ ${currentTarget.word}`}
                className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black text-base inline-flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Zap className="size-4 text-emerald-600" />
                <span>Nói đúng: &ldquo;{currentTarget.word}&rdquo;</span>
              </button>

              <button
                type="button"
                onClick={handleWordMiss}
                aria-label="Bỏ lỡ từ hiện tại"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-base cursor-pointer transition-all"
              >
                <span>Bỏ qua</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
