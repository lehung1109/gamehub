// src/components/cinema/PhonicsCinemaPlayer.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Volume2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Film,
} from 'lucide-react'
import type {
  CinemaEpisode,
  CinemaResult,
  CinemaScene,
} from '@/types/phonics-cinema'
import {
  validatePromptAnswer,
  calculateCinemaScore,
} from '@/lib/phonics-cinema-engine'
import { submitCinemaScoreAction } from '@/app/actions/phonics-cinema'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { useSpeech } from '@/hooks/useSpeech'
import { CinemaPopcornModal } from './CinemaPopcornModal'

interface PhonicsCinemaPlayerProps {
  episode: CinemaEpisode
  onCompleteMovie?: (result: CinemaResult) => void
}

export function PhonicsCinemaPlayer({
  episode,
  onCompleteMovie,
}: PhonicsCinemaPlayerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isMovieFinished, setIsMovieFinished] = useState(false)
  const [finalResult, setFinalResult] = useState<CinemaResult | null>(null)
  const [popcornScore, setPopcornScore] = useState(0)
  const [correctPromptsCount, setCorrectPromptsCount] = useState(0)

  // Interactive challenge state
  const [isPausedForPrompt, setIsPausedForPrompt] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [promptFeedback, setPromptFeedback] = useState<'CORRECT' | 'WRONG' | null>(null)
  const [answeredPromptIds, setAnsweredPromptIds] = useState<Set<string>>(new Set())

  const synthRef = useRef<SoundSynthesizer | null>(null)
  const { speak } = useSpeech({ rate: 0.9 })

  const currentScene: CinemaScene =
    episode.scenes[currentSceneIndex] || episode.scenes[0]

  // Calculate total prompts and max popcorn
  const totalPrompts = episode.scenes.filter((s) => s.interactivePrompt).length
  const maxPossiblePopcorn = episode.scenes.reduce(
    (acc, s) => acc + (s.interactivePrompt?.popcornReward || 0),
    0
  )

  // Initialize audio synth
  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const finishMovie = useCallback(
    (correctCount: number, currentPopcorn: number) => {
      const summary = calculateCinemaScore(
        episode.id,
        correctCount,
        totalPrompts,
        currentPopcorn,
        maxPossiblePopcorn
      )
      setFinalResult(summary)
      setIsMovieFinished(true)
      submitCinemaScoreAction(summary).catch((err) => {
        console.error('Failed to submit cinema score:', err)
      })
      onCompleteMovie?.(summary)
    },
    [episode.id, totalPrompts, maxPossiblePopcorn, onCompleteMovie]
  )

  // Read narration on scene entry
  useEffect(() => {
    if (currentScene?.narrationEn) {
      speak(currentScene.narrationEn)
    }

    // Check if current scene has an unanswered prompt
    let timer: ReturnType<typeof setTimeout> | undefined
    if (currentScene?.interactivePrompt && !answeredPromptIds.has(currentScene.interactivePrompt.id)) {
      timer = setTimeout(() => {
        setIsPausedForPrompt(true)
      }, 1500)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [currentSceneIndex, currentScene?.narrationEn, currentScene?.interactivePrompt, answeredPromptIds, speak])

  const handleNextScene = () => {
    if (isPausedForPrompt) return

    if (currentSceneIndex + 1 >= episode.scenes.length) {
      finishMovie(correctPromptsCount, popcornScore)
    } else {
      setCurrentSceneIndex((idx) => idx + 1)
      setSelectedOptionId(null)
      setPromptFeedback(null)
      setIsPausedForPrompt(false)
    }
  }

  const handleOptionSelect = (optionId: string) => {
    if (!currentScene.interactivePrompt || promptFeedback) return

    setSelectedOptionId(optionId)
    const isCorrect = validatePromptAnswer(currentScene.interactivePrompt, optionId)

    if (isCorrect) {
      setPromptFeedback('CORRECT')
      synthRef.current?.playChime()

      const newCorrectCount = correctPromptsCount + 1
      const newPopcorn = popcornScore + currentScene.interactivePrompt.popcornReward

      setCorrectPromptsCount(newCorrectCount)
      setPopcornScore(newPopcorn)

      setTimeout(() => {
        setAnsweredPromptIds((prev) => new Set([...prev, currentScene.interactivePrompt!.id]))
        setPromptFeedback(null)
        setIsPausedForPrompt(false)
        if (currentSceneIndex + 1 >= episode.scenes.length) {
          finishMovie(newCorrectCount, newPopcorn)
        } else {
          setCurrentSceneIndex((idx) => idx + 1)
          setSelectedOptionId(null)
        }
      }, 1500)
    } else {
      setPromptFeedback('WRONG')
      synthRef.current?.playKick()

      setTimeout(() => {
        setPromptFeedback(null)
        setSelectedOptionId(null)
      }, 1200)
    }
  }

  const handleReplayMovie = () => {
    setCurrentSceneIndex(0)
    setIsMovieFinished(false)
    setFinalResult(null)
    setPopcornScore(0)
    setCorrectPromptsCount(0)
    setIsPausedForPrompt(false)
    setSelectedOptionId(null)
    setPromptFeedback(null)
    setAnsweredPromptIds(new Set())
  }

  if (isMovieFinished && finalResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CinemaPopcornModal
          episodeTitle={episode.titleVi}
          result={finalResult}
          onReplay={handleReplayMovie}
        />
      </div>
    )
  }

  const getBackgroundGradient = (theme: CinemaScene['backgroundTheme']) => {
    switch (theme) {
      case 'jungle':
        return 'from-emerald-800 via-teal-900 to-green-950'
      case 'wizard-lab':
        return 'from-purple-900 via-indigo-950 to-slate-950'
      case 'starry-sky':
        return 'from-indigo-950 via-slate-900 to-sky-950'
    }
  }

  const getCharacterAnimClass = (anim: CinemaScene['characterAnimation']) => {
    switch (anim) {
      case 'bounce':
        return 'animate-bounce'
      case 'fly':
        return 'animate-pulse'
      case 'wiggle':
        return 'animate-spin duration-1000'
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/cinema"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Về Rạp Chiếu Phim</span>
        </Link>

        {/* Popcorn Score Display */}
        <div className="flex items-center gap-3">
          <span className="px-5 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-lg inline-flex items-center gap-2">
            <span>🍿</span>
            <span>Bắp Rang: {popcornScore}</span>
          </span>

          <span className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-lg">
            Cảnh: {currentSceneIndex + 1}/{episode.scenes.length}
          </span>
        </div>
      </div>

      {/* Main Animated Cinema Screen */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl bg-black">
        {/* Stage Playfield Canvas */}
        <div
          className={`h-72 sm:h-96 w-full bg-linear-to-b ${getBackgroundGradient(
            currentScene.backgroundTheme
          )} relative flex items-center justify-center overflow-hidden p-6`}
        >
          {/* Decorative Stars / Sparkles in backdrop */}
          <div className="absolute inset-0 opacity-25 pointer-events-none flex justify-between p-8 text-2xl select-none">
            <span>✨</span>
            <span>⭐</span>
            <span>✨</span>
          </div>

          {/* Animated Cartoon Character */}
          <div
            className={`text-8xl sm:text-9xl transition-all duration-500 drop-shadow-2xl select-none ${getCharacterAnimClass(
              currentScene.characterAnimation
            )}`}
          >
            {currentScene.characterEmoji}
          </div>

          {/* Interactive Pause Prompt Overlay */}
          {isPausedForPrompt && currentScene.interactivePrompt && (
            <div
              role="dialog"
              aria-label="Thử thách tương tác rạp chiếu phim"
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20 animate-in zoom-in-95 duration-200"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-base uppercase tracking-wider">
                <Sparkles className="size-5" />
                <span>Thử Thách Tiếp Tục Phim (+{currentScene.interactivePrompt.popcornReward} 🍿)</span>
              </div>

              <div className="space-y-1 max-w-xl">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {currentScene.interactivePrompt.questionVi}
                </h3>
                <p className="text-base text-amber-200 font-semibold">
                  {currentScene.interactivePrompt.questionEn}
                </p>
              </div>

              {/* Options Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 max-w-lg">
                {currentScene.interactivePrompt.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleOptionSelect(opt.id)}
                    className={`px-5 py-3.5 rounded-2xl font-black text-lg inline-flex items-center gap-2.5 cursor-pointer shadow-lg transition-all ${
                      selectedOptionId === opt.id
                        ? promptFeedback === 'CORRECT'
                          ? 'bg-emerald-500 text-white scale-105'
                          : 'bg-rose-500 text-white animate-shake'
                        : 'bg-white hover:bg-amber-100 text-slate-950 hover:scale-102'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>

              {/* Feedback toast inside prompt */}
              {promptFeedback === 'CORRECT' && (
                <p className="text-lg font-black text-emerald-300 animate-bounce pt-1">
                  🌟 {currentScene.interactivePrompt.explanationVi}
                </p>
              )}
              {promptFeedback === 'WRONG' && (
                <p className="text-lg font-black text-rose-300 animate-pulse pt-1">
                  ❌ Chưa đúng rồi, bé hãy thử lại nhé!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Subtitle & Narration Track */}
        <div className="bg-slate-900 border-t-2 border-slate-800 p-6 space-y-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <span className="block text-base font-bold text-amber-400">
                {currentScene.titleVi}
              </span>
              <p className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                &quot;{currentScene.narrationEn}&quot;
              </p>
              <p className="text-base font-medium text-slate-300">
                {currentScene.narrationVi}
              </p>
            </div>

            <button
              type="button"
              onClick={() => speak(currentScene.narrationEn)}
              aria-label="Nghe lại lời kể tiếng Anh"
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer shrink-0 transition-all"
            >
              <Volume2 className="size-6" />
            </button>
          </div>

          {/* Bottom Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-base font-bold text-slate-400">
              <Film className="size-5 text-amber-400" />
              <span>{episode.titleVi}</span>
            </div>

            <button
              type="button"
              onClick={handleNextScene}
              disabled={isPausedForPrompt}
              aria-label="Chuyển sang cảnh tiếp theo"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-base sm:text-lg inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>{currentSceneIndex + 1 >= episode.scenes.length ? 'Xem Kết Quả' : 'Cảnh Tiếp Theo'}</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
