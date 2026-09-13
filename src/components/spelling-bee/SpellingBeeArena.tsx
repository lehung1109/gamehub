// src/components/spelling-bee/SpellingBeeArena.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Volume2,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  Delete,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import type {
  SpellingBeeDivision,
  SpellingBeeResult,
  SpellingBeeWord,
} from '@/types/spelling-bee'
import {
  validateSpellingAttempt,
  calculateSpellingBeeScore,
} from '@/lib/spelling-bee-engine'
import { submitSpellingBeeScoreAction } from '@/app/actions/spelling-bee'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { useSpeech } from '@/hooks/useSpeech'
import { SpellingBeeTrophyModal } from './SpellingBeeTrophyModal'

interface SpellingBeeArenaProps {
  division: SpellingBeeDivision
  onCompleteTournament?: (result: SpellingBeeResult) => void
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

export function SpellingBeeArena({
  division,
  onCompleteTournament,
}: SpellingBeeArenaProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [spelledLetters, setSpelledLetters] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [wordsCorrect, setWordsCorrect] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [finalResult, setFinalResult] = useState<SpellingBeeResult | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [showSentence, setShowSentence] = useState(false)
  const [isSlowMode, setIsSlowMode] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)
  const { speak } = useSpeech({ rate: isSlowMode ? 0.75 : 0.95 })

  const currentWord: SpellingBeeWord =
    division.words[currentWordIndex] || division.words[0]

  // Initialize procedural audio synthesizer
  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  // Read word out loud when current word index changes
  useEffect(() => {
    if (currentWord?.word) {
      speak(currentWord.word)
    }
  }, [currentWordIndex, currentWord?.word, speak])

  const finishTournament = useCallback(
    (correctCount: number, mistakeCount: number) => {
      const summary = calculateSpellingBeeScore(
        division.id,
        division.tier,
        correctCount,
        division.words.length,
        mistakeCount,
        division.maxMistakes
      )
      setFinalResult(summary)
      setIsGameOver(true)
      submitSpellingBeeScoreAction(summary).catch((err) => {
        console.error('Failed to submit spelling bee score:', err)
      })
      onCompleteTournament?.(summary)
    },
    [division.id, division.tier, division.words.length, division.maxMistakes, onCompleteTournament]
  )

  const handleLetterClick = (letter: string) => {
    if (feedback || isGameOver) return
    if (spelledLetters.length < currentWord.word.length + 3) {
      setSpelledLetters((prev) => [...prev, letter])
    }
  }

  const handleDeleteLetter = () => {
    if (feedback || isGameOver) return
    setSpelledLetters((prev) => prev.slice(0, -1))
  }

  const handleClearLetters = () => {
    if (feedback || isGameOver) return
    setSpelledLetters([])
  }

  const handleSubmitSpelling = () => {
    if (feedback || isGameOver || spelledLetters.length === 0) return

    const enteredWord = spelledLetters.join('')
    const isCorrect = validateSpellingAttempt(enteredWord, currentWord.word)

    if (isCorrect) {
      setFeedback('CORRECT')
      synthRef.current?.playChime()
      const newCorrect = wordsCorrect + 1
      setWordsCorrect(newCorrect)
      setScore((s) => s + currentWord.points)

      setTimeout(() => {
        setFeedback(null)
        setSpelledLetters([])
        setShowHint(false)
        setShowSentence(false)

        if (currentWordIndex + 1 >= division.words.length) {
          finishTournament(newCorrect, mistakes)
        } else {
          setCurrentWordIndex((idx) => idx + 1)
        }
      }, 1200)
    } else {
      setFeedback('WRONG')
      synthRef.current?.playKick()
      const newMistakes = mistakes + 1
      setMistakes(newMistakes)

      setTimeout(() => {
        setFeedback(null)
        setSpelledLetters([])

        if (newMistakes >= division.maxMistakes) {
          finishTournament(wordsCorrect, newMistakes)
        } else if (currentWordIndex + 1 >= division.words.length) {
          finishTournament(wordsCorrect, newMistakes)
        } else {
          setCurrentWordIndex((idx) => idx + 1)
        }
      }, 1200)
    }
  }

  // Keyboard navigation support
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (feedback || isGameOver) return
      const key = e.key.toUpperCase()

      if (/^[A-Z]$/.test(key)) {
        handleLetterClick(key)
      } else if (e.key === 'Backspace') {
        handleDeleteLetter()
      } else if (e.key === 'Enter') {
        handleSubmitSpelling()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // Restart division
  const handleReplay = () => {
    setCurrentWordIndex(0)
    setSpelledLetters([])
    setMistakes(0)
    setWordsCorrect(0)
    setScore(0)
    setFeedback(null)
    setIsGameOver(false)
    setFinalResult(null)
    setShowHint(false)
    setShowSentence(false)
  }

  if (isGameOver && finalResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SpellingBeeTrophyModal
          divisionTitle={division.titleVi}
          result={finalResult}
          onReplay={handleReplay}
        />
      </div>
    )
  }

  const livesRemaining = Math.max(0, division.maxMistakes - mistakes)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/spelling-bee"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Về Sảnh Thi Đấu</span>
        </Link>

        {/* Lives & Score Counter */}
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-lg inline-flex items-center gap-1.5">
            <span>🐝</span>
            <span>Mạng: {livesRemaining}/{division.maxMistakes}</span>
          </span>

          <span className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-black text-lg">
            Điểm: {score}
          </span>
        </div>
      </div>

      {/* Main Spelling Bee Stage Box */}
      <div className="bg-linear-to-b from-amber-50 via-amber-100/40 to-indigo-50 rounded-3xl border-4 border-amber-400 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Division Title & Progress */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-200 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{division.badgeEmoji}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
                {division.titleVi}
              </h1>
              <span className="block text-base font-bold text-slate-600">
                {division.titleEn}
              </span>
            </div>
          </div>

          <span className="px-4 py-1.5 rounded-full bg-white text-slate-800 font-black text-base border-2 border-amber-300 shadow-xs">
            Từ số: {currentWordIndex + 1}/{division.words.length}
          </span>
        </div>

        {/* Word Clues Audio Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => speak(currentWord.word)}
            aria-label="Nghe phát âm từ vựng"
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg inline-flex items-center gap-2.5 cursor-pointer shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Volume2 className="size-6" />
            <span>Nghe Phát Âm</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSlowMode((prev) => !prev)}
            aria-label="Chuyển chế độ đọc chậm hoặc bình thường"
            className={`px-4 py-3.5 rounded-2xl font-black text-base inline-flex items-center gap-2 cursor-pointer transition-all ${
              isSlowMode
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-amber-300'
            }`}
          >
            <span>🐢</span>
            <span>{isSlowMode ? 'Đang Đọc Chậm (0.75x)' : 'Đọc Chậm'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSentence((prev) => !prev)
              if (!showSentence) speak(currentWord.exampleSentence)
            }}
            aria-label="Xem và nghe câu ví dụ ngữ cảnh"
            className="px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-black text-base border-2 border-amber-300 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <BookOpen className="size-5 text-indigo-600" />
            <span>Câu Ví Dụ</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            aria-label="Xem gợi ý ngữ âm và nghĩa tiếng Việt"
            className="px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-black text-base border-2 border-amber-300 inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <HelpCircle className="size-5 text-amber-600" />
            <span>Gợi Ý Nghĩa & IPA</span>
          </button>
        </div>

        {/* Dynamic Clue Boxes */}
        {showHint && (
          <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 space-y-1 text-center animate-in fade-in-50 duration-200">
            <span className="block text-lg font-black text-indigo-700">
              Ngữ âm: {currentWord.phonicsSound} • Nghĩa: {currentWord.translationVi}
            </span>
            <p className="text-base text-slate-600 font-semibold">
              {currentWord.definitionVi}
            </p>
          </div>
        )}

        {showSentence && (
          <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200 text-center space-y-1 animate-in fade-in-50 duration-200">
            <span className="block text-base font-bold text-indigo-900">
              Câu ngữ cảnh:
            </span>
            <p className="text-lg font-black text-indigo-950 italic">
              &quot;{currentWord.exampleSentence}&quot;
            </p>
          </div>
        )}

        {/* Current Spelled Letters Slot Board */}
        <div className="py-6 px-4 bg-white rounded-3xl border-4 border-slate-800 shadow-inner text-center space-y-3 relative">
          {/* Feedback Overlay */}
          {feedback && (
            <div
              className={`absolute inset-0 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black uppercase tracking-wider backdrop-blur-xs z-10 animate-in zoom-in-95 duration-150 ${
                feedback === 'CORRECT'
                  ? 'bg-emerald-500/30 text-emerald-800'
                  : 'bg-rose-500/30 text-rose-800'
              }`}
            >
              {feedback === 'CORRECT'
                ? '🌟 CHÍNH XÁC! (+150)'
                : `❌ CHƯA ĐÚNG! (Đáp án: ${currentWord.word})`}
            </div>
          )}

          <span className="block text-base font-bold text-slate-500">
            CÁC CHỮ CÁI BÉ ĐÃ ĐÁNH VẦN ({spelledLetters.length}/{currentWord.word.length}):
          </span>

          <div className="flex flex-wrap items-center justify-center gap-2 min-h-16">
            {Array.from({ length: currentWord.word.length }).map((_, i) => {
              const letter = spelledLetters[i]
              return (
                <div
                  key={i}
                  data-testid={`spelling-letter-slot-${i}`}
                  className={`size-14 sm:size-16 rounded-2xl border-3 flex items-center justify-center text-3xl sm:text-4xl font-black transition-all ${
                    letter
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-md scale-105'
                      : 'border-slate-300 bg-slate-50 text-slate-400 border-dashed'
                  }`}
                >
                  {letter || ''}
                </div>
              )
            })}
          </div>
        </div>

        {/* High-Contrast Kid-Friendly Virtual Keyboard */}
        <div className="space-y-2 pt-2">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center items-center gap-1.5 sm:gap-2">
              {row.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => handleLetterClick(letter)}
                  aria-label={`Chữ cái ${letter}`}
                  className="size-11 sm:size-14 rounded-xl sm:rounded-2xl bg-white hover:bg-amber-100 active:bg-amber-200 text-slate-900 border-2 border-slate-300 hover:border-amber-400 font-black text-xl sm:text-2xl shadow-sm transition-all cursor-pointer select-none"
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}

          {/* Special Action Row: Clear, Delete, Submit */}
          <div className="flex justify-center items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleClearLetters}
              aria-label="Xóa tất cả các chữ cái đã nhập"
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-base inline-flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="size-5" />
              <span>Nhập Lại</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteLetter}
              aria-label="Xóa một chữ cái cuối"
              className="px-5 py-3 rounded-2xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-black text-base inline-flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Delete className="size-5" />
              <span>Xóa Chữ</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitSpelling}
              disabled={spelledLetters.length === 0}
              aria-label="Xác nhận gửi từ đánh vần"
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-lg inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-102 transition-all"
            >
              <CheckCircle2 className="size-6" />
              <span>Kiểm Tra</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
