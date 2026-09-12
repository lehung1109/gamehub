'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  RotateCcw,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Volume2,
} from 'lucide-react'
import type {
  SpeakingScenario,
  SpeakingSessionResult,
} from '@/types/speaking'
import { SpeakButton } from '@/components/games/SpeakButton'
import { cn } from '@/lib/utils'

export interface SpeakingPodiumModalProps {
  isOpen: boolean
  result: SpeakingSessionResult
  scenario: SpeakingScenario
  onRestart: () => void
  onBackToHub: () => void
  onAddToMistakes?: (words: string[]) => void
}

export function SpeakingPodiumModal({
  isOpen,
  result,
  scenario,
  onRestart,
  onBackToHub,
  onAddToMistakes,
}: SpeakingPodiumModalProps) {
  const [addedResultId, setAddedResultId] = useState<string | null>(null)
  const currentResultId = `${result.scenarioId}-${result.overallScore}-${result.mispronouncedWords?.join(',')}`
  const isAddedToMistakes = addedResultId === currentResultId

  // Handle escape key to dismiss
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBackToHub()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onBackToHub])

  if (!isOpen) return null

  const handleAddMistakesClick = () => {
    if (!result.mispronouncedWords || result.mispronouncedWords.length === 0) return
    onAddToMistakes?.(result.mispronouncedWords)
    setAddedResultId(currentResultId)
  }

  const hasMistakes = Boolean(
    result.mispronouncedWords && result.mispronouncedWords.length > 0
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onBackToHub}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="podium-modal-title"
        data-testid="speaking-podium-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border-2 border-border shadow-2xl p-6 sm:p-8 space-y-6 text-foreground animate-in zoom-in-95 duration-300"
      >
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-base font-black">
            <Sparkles className="size-5 text-amber-500 fill-current" />
            <span>Hoàn thành xuất sắc!</span>
          </div>

          <h2
            id="podium-modal-title"
            className="text-2xl sm:text-3xl font-black text-foreground"
          >
            Kết quả luyện nói cùng {scenario.persona.name}
          </h2>

          <p className="text-base text-muted-foreground font-medium">
            {scenario.titleVi} • {scenario.titleEn}
          </p>
        </div>

        {/* Animated Star Rating Podium */}
        <div
          data-testid="star-rating"
          aria-label={`${result.stars} trên 3 sao`}
          className="flex items-center justify-center gap-4 py-2"
        >
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= result.stars
            return (
              <div
                key={starIndex}
                className={cn(
                  'size-18 sm:size-22 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl transition-all duration-500 shadow-md select-none',
                  isEarned
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 text-amber-500 scale-105 animate-bounce [animation-iteration-count:1]'
                    : 'bg-muted/40 border-2 border-border text-muted-foreground/30 grayscale'
                )}
              >
                <span>⭐</span>
              </div>
            )
          })}
        </div>

        {/* Metric Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Overall score badge */}
          <div
            data-testid="overall-score-badge"
            className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/60 flex flex-col items-center justify-center text-center shadow-xs"
          >
            <span className="text-base font-bold text-amber-800 dark:text-amber-300">
              Tổng điểm
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {result.overallScore}%
            </span>
          </div>

          {/* Pronunciation score badge */}
          <div
            data-testid="pronunciation-score-badge"
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800/60 flex flex-col items-center justify-center text-center shadow-xs"
          >
            <span className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              Phát âm
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {result.pronunciationScore}%
            </span>
          </div>

          {/* Fluency score badge */}
          <div
            data-testid="fluency-score-badge"
            className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-800/60 flex flex-col items-center justify-center text-center shadow-xs"
          >
            <span className="text-base font-bold text-blue-800 dark:text-blue-300">
              Lưu loát
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {result.fluencyScore}%
            </span>
          </div>

          {/* XP earned badge */}
          <div
            data-testid="xp-earned-badge"
            className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-300 dark:border-purple-800/60 flex flex-col items-center justify-center text-center shadow-xs"
          >
            <span className="text-base font-bold text-purple-800 dark:text-purple-300">
              Kinh nghiệm
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
              +{result.xpEarned} XP
            </span>
          </div>
        </div>

        {/* Mispronounced Words & Mistake Notebook Section */}
        {hasMistakes ? (
          <div className="p-5 rounded-2xl bg-muted/40 border-2 border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <h4 className="text-base font-black text-foreground">
                  Từ vựng cần cải thiện ({result.mispronouncedWords.length})
                </h4>
              </div>

              {!isAddedToMistakes ? (
                <button
                  type="button"
                  data-testid="add-to-mistakes-button"
                  onClick={handleAddMistakesClick}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-base font-bold transition-all shadow-xs cursor-pointer"
                >
                  <BookOpen className="size-5 shrink-0" />
                  <span>Lưu vào sổ tay từ khó</span>
                </button>
              ) : (
                <div
                  data-testid="added-to-mistakes-feedback"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-base font-bold animate-in fade-in duration-200"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Đã lưu vào sổ tay từ khó!</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {result.mispronouncedWords.map((word) => (
                <div
                  key={word}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card border border-border shadow-2xs text-base font-bold text-foreground"
                >
                  <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                    {word}
                  </span>
                  <SpeakButton
                    text={word}
                    size="sm"
                    className="size-9 min-w-9 min-h-9 p-0"
                    ariaLabel={`Nghe phát âm từ ${word}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800/40 text-center space-y-1">
            <p className="text-base font-black text-emerald-800 dark:text-emerald-300">
              Tuyệt vời! Không có từ nào bị phát âm sai! 🎉
            </p>
            <p className="text-base text-emerald-700 dark:text-emerald-400">
              Bạn đã nói các câu rất chuẩn xác và rõ ràng.
            </p>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            data-testid="back-to-hub-button"
            onClick={onBackToHub}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-secondary/80 hover:bg-secondary active:scale-95 text-foreground border border-border text-base font-black transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="size-5" />
            <span>Về danh sách kịch bản</span>
          </button>

          <button
            type="button"
            data-testid="restart-button"
            onClick={onRestart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-base font-black transition-all shadow-md cursor-pointer"
          >
            <RotateCcw className="size-5" />
            <span>Luyện lại</span>
          </button>
        </div>
      </div>
    </div>
  )
}
