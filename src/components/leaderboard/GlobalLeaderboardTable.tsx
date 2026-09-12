'use client'

import React from 'react'
import { Trophy, Star, Flame, Swords, Calendar, Globe, AlertCircle, Loader2 } from 'lucide-react'
import type { LeaderboardEntry } from '@/app/actions/leaderboards'
import { cn } from '@/lib/utils'

export interface GlobalLeaderboardTableProps {
  entries: LeaderboardEntry[]
  timeframe: 'weekly' | 'all'
  onTimeframeChange: (tf: 'weekly' | 'all') => void
  isLoading?: boolean
  errorMessage?: string | null
}

export function GlobalLeaderboardTable({
  entries,
  timeframe,
  onTimeframeChange,
  isLoading = false,
  errorMessage = null,
}: GlobalLeaderboardTableProps) {
  const top1 = entries.find((e) => e.rank === 1)
  const top2 = entries.find((e) => e.rank === 2)
  const top3 = entries.find((e) => e.rank === 3)
  const remainingEntries = entries.filter((e) => e.rank > 3)

  return (
    <div
      data-testid="global-leaderboard-table"
      className="w-full max-w-4xl mx-auto flex flex-col gap-6"
    >
      {/* Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <Globe className="size-4 text-indigo-500" />
          <span>Thời gian xếp hạng:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto p-1 bg-muted rounded-xl">
          <button
            type="button"
            data-testid="timeframe-weekly"
            onClick={() => onTimeframeChange('weekly')}
            className={cn(
              'flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              timeframe === 'weekly'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="size-3.5" />
            <span>Tuần này</span>
          </button>

          <button
            type="button"
            data-testid="timeframe-all"
            onClick={() => onTimeframeChange('all')}
            className={cn(
              'flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
              timeframe === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Trophy className="size-3.5" />
            <span>Toàn thời gian</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
          <p className="text-sm font-bold">Đang tải dữ liệu bảng vàng...</p>
        </div>
      ) : entries.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-3xl border border-border/80 text-center shadow-xs">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">
            🌍
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Chưa có dữ liệu bảng vàng
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {timeframe === 'weekly'
              ? 'Chưa có hoạt động học tập nào trong tuần này. Hãy là người đầu tiên tỏa sáng!'
              : 'Chưa có học sinh nào trên toàn trường có điểm. Hãy bắt đầu học bài ngay!'}
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {(top1 || top2 || top3) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-6 pb-2">
              {/* Rank 2 - Silver */}
              <div className="order-2 sm:order-1">
                {top2 && (
                  <GlobalPodiumCard
                    entry={top2}
                    rank={2}
                    medal="🥈"
                    label="Hạng 2"
                    testId="podium-rank-2"
                    cardBorder="border-slate-300 dark:border-slate-600"
                    bgGradient="from-slate-300/20 to-transparent"
                    heightClass="sm:min-h-[260px]"
                  />
                )}
              </div>

              {/* Rank 1 - Gold */}
              <div className="order-1 sm:order-2">
                {top1 && (
                  <GlobalPodiumCard
                    entry={top1}
                    rank={1}
                    medal="🥇"
                    label="Quán Quân"
                    testId="podium-rank-1"
                    cardBorder="border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/30"
                    bgGradient="from-amber-400/25 to-transparent"
                    heightClass="sm:min-h-[290px]"
                    isFirst
                  />
                )}
              </div>

              {/* Rank 3 - Bronze */}
              <div className="order-3 sm:order-3">
                {top3 && (
                  <GlobalPodiumCard
                    entry={top3}
                    rank={3}
                    medal="🥉"
                    label="Hạng 3"
                    testId="podium-rank-3"
                    cardBorder="border-amber-700 dark:border-amber-800"
                    bgGradient="from-amber-700/20 to-transparent"
                    heightClass="sm:min-h-[240px]"
                  />
                )}
              </div>
            </div>
          )}

          {/* Ranked List (Rank 4+) */}
          {remainingEntries.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-black text-muted-foreground uppercase tracking-wider px-2">
                Top 20 Toàn Trường
              </h4>
              <div className="flex flex-col gap-2">
                {remainingEntries.map((entry) => (
                  <GlobalLeaderboardRow
                    key={`global-row-${entry.rank}-${entry.studentName}`}
                    entry={entry}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface GlobalPodiumCardProps {
  entry: LeaderboardEntry
  rank: number
  medal: string
  label: string
  testId: string
  cardBorder: string
  bgGradient: string
  heightClass: string
  isFirst?: boolean
}

function GlobalPodiumCard({
  entry,
  rank,
  medal,
  label,
  testId,
  cardBorder,
  bgGradient,
  heightClass,
  isFirst = false,
}: GlobalPodiumCardProps) {
  return (
    <div
      data-testid={testId}
      data-rank={rank}
      className={cn(
        'relative rounded-3xl bg-card border p-5 flex flex-col items-center justify-between text-center shadow-lg transition-all',
        'bg-linear-to-b',
        bgGradient,
        cardBorder,
        heightClass,
        isFirst && 'shadow-amber-500/15 sm:-translate-y-2'
      )}
    >
      {/* Medal */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 border border-border shadow-xs text-xs font-black uppercase">
        <span>{medal}</span>
        <span>{label}</span>
      </div>

      {/* Avatar & Info */}
      <div className="my-3 flex flex-col items-center">
        <div
          className={cn(
            'size-16 sm:size-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl bg-muted shadow-md ring-4 ring-background',
            entry.frameClass || 'ring-border'
          )}
        >
          {entry.avatar || '🐼'}
        </div>
        <div className="mt-2 font-black text-base sm:text-lg text-foreground line-clamp-1">
          {entry.studentName}
        </div>
        {entry.titleName && (
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 line-clamp-1">
            ✨ {entry.titleName}
          </div>
        )}
        {entry.levelName && (
          <div className="text-xs font-medium text-muted-foreground mt-0.5">
            {entry.levelName}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="w-full pt-3 border-t border-border/60 flex items-center justify-around gap-2 text-xs font-bold">
        <div className="flex flex-col items-center" title="Tổng số sao">
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base">
            <Star className="size-4 fill-amber-400 text-amber-500" />
            <span>{entry.totalStars}</span>
          </div>
          <span className="text-muted-foreground text-xs">Sao</span>
        </div>

        <div className="flex flex-col items-center" title="Chuỗi ngày liên tục">
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-black text-sm sm:text-base">
            <Flame className="size-4 fill-orange-500 text-orange-500" />
            <span>{entry.currentStreak}</span>
          </div>
          <span className="text-muted-foreground text-xs">Chuỗi</span>
        </div>

        <div className="flex flex-col items-center" title="Số trận thắng 1v1">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-black text-sm sm:text-base">
            <Swords className="size-4 text-rose-500" />
            <span>{entry.duelWins}</span>
          </div>
          <span className="text-muted-foreground text-xs">Thắng</span>
        </div>
      </div>
    </div>
  )
}

function GlobalLeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      data-testid={`leaderboard-row-${entry.rank}`}
      className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-card border border-border hover:bg-accent/40 transition-colors shadow-xs gap-3"
    >
      {/* Rank & Student Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-8 sm:size-9 rounded-xl bg-muted/80 flex items-center justify-center font-black text-sm sm:text-base text-muted-foreground shrink-0">
          #{entry.rank}
        </div>

        <div
          className={cn(
            'size-10 sm:size-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl bg-muted shrink-0 ring-2',
            entry.frameClass || 'ring-border'
          )}
        >
          {entry.avatar || '🐼'}
        </div>

        <div className="min-w-0">
          <div className="font-bold text-sm sm:text-base text-foreground truncate">
            {entry.studentName}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {entry.titleName && (
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                ✨ {entry.titleName}
              </span>
            )}
            {entry.levelName && (
              <span className="truncate">{entry.levelName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black text-sm sm:text-base">
          <Star className="size-4 fill-amber-400 text-amber-500" />
          <span>{entry.totalStars}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-orange-600 dark:text-orange-400 font-bold text-xs sm:text-sm">
          <Flame className="size-4 fill-orange-500 text-orange-500" />
          <span>{entry.currentStreak}</span>
        </div>

        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm">
          <Swords className="size-4 text-rose-500" />
          <span>{entry.duelWins}</span>
        </div>
      </div>
    </div>
  )
}
