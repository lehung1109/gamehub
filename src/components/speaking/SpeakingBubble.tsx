'use client'

import React from 'react'
import type { SpeakingDialogueTurn, SpeakingPersona, SpeakingWordMatch } from '@/types/speaking'
import { Volume2, Sparkles } from 'lucide-react'

export interface SpeakingBubbleProps {
  turn: SpeakingDialogueTurn
  persona: SpeakingPersona
  onPlayAudio?: (text: string) => void
}

function getWordScoreClasses(score: number): string {
  if (score >= 80) {
    return 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/60'
  }
  if (score >= 50) {
    return 'text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-950/60'
  }
  return 'text-rose-700 bg-rose-100 border-rose-300 dark:text-rose-300 dark:bg-rose-950/60'
}

export function SpeakingBubble({ turn, persona, onPlayAudio }: SpeakingBubbleProps) {
  const isTutor = turn.sender === 'tutor'

  return (
    <div
      data-testid={`turn-${turn.sender}`}
      className={`flex items-start gap-3.5 my-3 ${
        isTutor ? 'flex-row justify-start' : 'flex-row-reverse justify-start'
      }`}
    >
      {/* Sender Avatar */}
      <div
        className={`size-11 sm:size-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm border ${
          isTutor
            ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700'
            : 'bg-sky-100 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700'
        }`}
        aria-hidden="true"
      >
        <span>{isTutor ? persona.avatar : '🎒'}</span>
      </div>

      {/* Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${
          isTutor ? 'items-start text-left' : 'items-end text-right'
        }`}
      >
        {/* Name and Meta Header */}
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-base font-bold text-foreground">
            {isTutor ? persona.name : 'Bạn'}
          </span>
          {turn.accuracyScore !== undefined && (
            <span
              data-testid="turn-accuracy-score"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-base font-black bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs"
            >
              <Sparkles className="size-4" />
              <span>{turn.accuracyScore}%</span>
            </span>
          )}
        </div>

        {/* Bubble Body */}
        <div
          className={`relative rounded-3xl p-4 sm:p-5 shadow-sm border-2 transition-all ${
            isTutor
              ? 'rounded-tl-xs bg-card border-amber-200 dark:border-amber-800/80 text-foreground'
              : 'rounded-tr-xs bg-linear-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40 border-sky-300 dark:border-sky-700 text-foreground'
          }`}
        >
          {/* Spoken Text or Word Breakdown */}
          {turn.wordBreakdown && turn.wordBreakdown.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-base leading-relaxed items-center">
              {turn.wordBreakdown.map((item: SpeakingWordMatch, idx: number) => (
                <span
                  key={`${item.word}-${idx}`}
                  className={`inline-block px-2 py-0.5 rounded-xl font-bold border ${getWordScoreClasses(
                    item.score
                  )}`}
                  title={`Điểm: ${item.score}%`}
                >
                  {item.word}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-base sm:text-lg font-medium leading-relaxed">
              {turn.text}
            </p>
          )}

          {/* Vietnamese Feedback Toast/Callout */}
          {turn.feedbackVi && (
            <div className="mt-3 pt-3 border-t border-border/60 flex items-start gap-2 text-left bg-amber-50/60 dark:bg-amber-950/30 -mx-2 px-3 py-2 rounded-2xl border border-amber-200/60 dark:border-amber-800/50">
              <span className="text-lg shrink-0">💡</span>
              <p className="text-base font-medium text-amber-900 dark:text-amber-200">
                {turn.feedbackVi}
              </p>
            </div>
          )}

          {/* Audio Replay Button */}
          {onPlayAudio && (
            <div
              className={`mt-2 flex ${
                isTutor ? 'justify-start' : 'justify-end'
              }`}
            >
              <button
                type="button"
                data-testid={`replay-audio-${turn.id}`}
                onClick={() => onPlayAudio(turn.text)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-secondary/80 hover:bg-secondary text-secondary-foreground text-base font-bold hover:scale-105 active:scale-95 transition-all shadow-2xs border border-border"
                aria-label={`Nghe lại giọng nói ${isTutor ? persona.name : 'của bạn'}`}
              >
                <Volume2 className="size-4" />
                <span>Nghe lại</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
