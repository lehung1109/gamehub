'use client'

import React, { useState } from 'react'
import { Star, Flame, Swords, Search, AlertCircle, Loader2 } from 'lucide-react'
import type { LeaderboardEntry } from '@/app/actions/leaderboards'
import { cn } from '@/lib/utils'

export interface ClassLeaderboardTableProps {
  entries: LeaderboardEntry[]
  classCode?: string
  isLoading?: boolean
  errorMessage?: string | null
  onSearchClass?: (code: string) => void
}

export function ClassLeaderboardTable({
  entries,
  classCode = '',
  isLoading = false,
  errorMessage = null,
  onSearchClass,
}: ClassLeaderboardTableProps) {
  const [prevClassCode, setPrevClassCode] = useState(classCode)
  const [inputCode, setInputCode] = useState(classCode)

  if (prevClassCode !== classCode) {
    setPrevClassCode(classCode)
    setInputCode(classCode)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearchClass && inputCode.trim()) {
      onSearchClass(inputCode.trim().toUpperCase())
    }
  }

  const top1 = entries.find((e) => e.rank === 1)
  const top2 = entries.find((e) => e.rank === 2)
  const top3 = entries.find((e) => e.rank === 3)
  const remainingEntries = entries.filter((e) => e.rank > 3)

  return (
    <div
      data-testid="class-leaderboard-table"
      className="w-full max-w-4xl mx-auto flex flex-col gap-6"
    >
      {/* Class Code Search Bar */}
      {onSearchClass && (
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              data-testid="class-code-input"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Nhập mã lớp học (ví dụ: LOP123)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-input text-foreground text-sm font-semibold uppercase placeholder:normal-case placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="size-4" />
            <span>Tìm</span>
          </button>
        </form>
      )}

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
          <p className="text-sm font-bold">Đang tải dữ liệu bảng xếp hạng...</p>
        </div>
      ) : entries.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-3xl border border-border/80 text-center shadow-xs">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">
            🏫
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Chưa có dữ liệu bảng xếp hạng
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Chưa có học sinh nào trong lớp này hoặc lớp học chưa có hoạt động tích sao. Hãy học bài và tham gia đấu trường để ghi tên lên bảng vàng!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {(top1 || top2 || top3) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-6 pb-2">
              {/* Rank 2 - Silver (Left on desktop) */}
              <div className="order-2 sm:order-1">
                {top2 && (
                  <PodiumCard
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

              {/* Rank 1 - Gold (Center, elevated) */}
              <div className="order-1 sm:order-2">
                {top1 && (
                  <PodiumCard
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

              {/* Rank 3 - Bronze (Right on desktop) */}
              <div className="order-3 sm:order-3">
                {top3 && (
                  <PodiumCard
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
                Danh sách xếp hạng
              </h4>
              <div className="flex flex-col gap-2">
                {remainingEntries.map((entry) => (
                  <LeaderboardRow key={`row-${entry.rank}-${entry.studentName}`} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface PodiumCardProps {
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

function PodiumCard({
  entry,
  rank,
  medal,
  label,
  testId,
  cardBorder,
  bgGradient,
  heightClass,
  isFirst = false,
}: PodiumCardProps) {
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
      {/* Medal / Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 border border-border shadow-xs text-xs font-black uppercase">
        <span>{medal}</span>
        <span>{label}</span>
      </div>

      {/* Avatar & Cosmetics */}
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

      {/* Metrics (Stars, Streak, Duel Wins) */}
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

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
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
