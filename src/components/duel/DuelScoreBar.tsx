'use client'

import React from 'react'
import { Flame, Swords } from 'lucide-react'

export interface DuelScoreBarPlayer {
  name: string
  avatar: string
  score: number
  streak: number
}

export interface DuelScoreBarProps {
  player1: DuelScoreBarPlayer
  player2?: DuelScoreBarPlayer | null
  currentRound: number
  totalRounds: number
}

export function DuelScoreBar({
  player1,
  player2,
  currentRound,
  totalRounds,
}: DuelScoreBarProps) {
  return (
    <div
      data-testid="duel-score-bar"
      className="w-full bg-card/80 backdrop-blur-md border-b border-border shadow-xs px-4 py-3 sm:px-6 sm:py-4 transition-all"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Player 1 (Left) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <div className="relative flex items-center justify-center size-11 sm:size-13 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500 text-2xl sm:text-3xl shrink-0 shadow-xs">
            <span>{player1.avatar || '🦊'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-foreground text-sm sm:text-base truncate max-w-[110px] sm:max-w-[160px]">
                {player1.name}
              </span>
              <span
                data-testid="player1-streak"
                className="inline-flex items-center"
              >
                {player1.streak > 1 ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black animate-pulse">
                    <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                    <span>🔥x{player1.streak}</span>
                  </span>
                ) : (
                  <span className="sr-only">0</span>
                )}
              </span>
            </div>
            <div
              data-testid="player1-score"
              className="text-lg sm:text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400"
            >
              {player1.score} <span className="text-xs sm:text-sm font-semibold text-muted-foreground">điểm</span>
            </div>
          </div>
        </div>

        {/* Center: Round info & VS */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted border border-border text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-wider">
            <Swords className="size-3.5 sm:size-4 text-rose-500" />
            <span>VS</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-foreground mt-1">
            Vòng {currentRound} / {totalRounds}
          </div>
        </div>

        {/* Player 2 (Right) */}
        <div className="flex items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0 text-right">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-end gap-1.5 flex-wrap">
              <span
                data-testid="player2-streak"
                className="inline-flex items-center"
              >
                {player2 && player2.streak > 1 ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black animate-pulse">
                    <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                    <span>🔥x{player2.streak}</span>
                  </span>
                ) : (
                  <span className="sr-only">0</span>
                )}
              </span>
              <span className="font-bold text-foreground text-sm sm:text-base truncate max-w-[110px] sm:max-w-[160px]">
                {player2 ? player2.name : 'Đang chờ...'}
              </span>
            </div>
            <div
              data-testid="player2-score"
              className="text-lg sm:text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400"
            >
              {player2 ? player2.score : 0} <span className="text-xs sm:text-sm font-semibold text-muted-foreground">điểm</span>
            </div>
          </div>
          <div className="relative flex items-center justify-center size-11 sm:size-13 rounded-2xl bg-rose-500/10 border-2 border-rose-500 text-2xl sm:text-3xl shrink-0 shadow-xs">
            <span>{player2 ? player2.avatar || '🐼' : '⏳'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
