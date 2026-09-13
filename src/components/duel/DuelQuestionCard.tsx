'use client'

import React from 'react'
import { Clock, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import type { DuelQuestion } from '@/types/duels'
import { cn } from '@/lib/utils'

export interface DuelQuestionCardProps {
  question: DuelQuestion
  questionIndex: number
  totalQuestions: number
  timeRemainingSeconds: number
  selectedOptionIndex: number | null
  onSelectOption: (optionIndex: number) => void
  disabled?: boolean
  showResult?: boolean
}

export function DuelQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  timeRemainingSeconds,
  selectedOptionIndex,
  onSelectOption,
  disabled = false,
  showResult = false,
}: DuelQuestionCardProps) {
  const isTimeUp = timeRemainingSeconds <= 0
  const isOptionDisabled = disabled || selectedOptionIndex !== null || isTimeUp

  // Timer color states
  const getTimerStyles = () => {
    if (timeRemainingSeconds > 5) {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    }
    if (timeRemainingSeconds > 2) {
      return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    }
    return 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse'
  }

  return (
    <div
      data-testid="duel-question-card"
      className="w-full max-w-2xl mx-auto rounded-3xl bg-card border border-border shadow-xl p-5 sm:p-8 relative overflow-hidden transition-all text-card-foreground"
    >
      {/* Top Header: Question Index & Timer */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <span className="px-3 py-1.5 rounded-full bg-muted border border-border text-xs sm:text-sm font-bold text-muted-foreground">
          Câu hỏi {questionIndex + 1} / {totalQuestions}
        </span>

        <div
          data-testid="duel-timer"
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border font-black text-sm sm:text-base transition-colors',
            getTimerStyles()
          )}
        >
          <Clock className="size-4 shrink-0" />
          <span>{Math.max(0, timeRemainingSeconds)}s</span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="text-center py-4 mb-6">
        <h2 className="text-xl sm:text-3xl font-black tracking-tight text-foreground leading-snug">
          {question.prompt}
        </h2>
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionIndex === index
          const isCorrect = option === question.correctAnswer
          const isWrongSelected = isSelected && !isCorrect

          let optionStyle = 'bg-muted/40 border-border hover:bg-muted/80 text-foreground'

          if (showResult) {
            if (isCorrect) {
              optionStyle =
                'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
            } else if (isWrongSelected) {
              optionStyle =
                'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30'
            } else {
              optionStyle = 'opacity-40 bg-muted/20 border-border text-muted-foreground'
            }
          } else if (isSelected) {
            optionStyle =
              'bg-indigo-500/15 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30 font-black'
          }

          return (
            <button
              key={index}
              type="button"
              data-testid={`duel-option-${index}`}
              disabled={isOptionDisabled}
              onClick={() => onSelectOption(index)}
              className={cn(
                'w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left font-bold text-sm sm:text-base transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed',
                optionStyle
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center size-7 rounded-xl bg-background border border-border text-xs font-black text-muted-foreground">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="break-words">{option}</span>
              </div>

              {showResult && isCorrect && (
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
              )}
              {showResult && isWrongSelected && (
                <XCircle className="size-5 text-rose-600 dark:text-rose-400 shrink-0 ml-2" />
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation Banner when showResult */}
      {showResult && question.explanationVi && (
        <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-200 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Lightbulb className="size-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Giải thích: </span>
            <span>{question.explanationVi}</span>
          </div>
        </div>
      )}
    </div>
  )
}
