'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import type { SrsCard, MistakeDeckSummary } from '@/types/srs'
import { getDueCards, getDeckSummary } from '@/lib/srs'
import { getStoredSrsDeck, saveStoredSrsDeck } from '@/lib/srs-storage'
import { getStudentSrsDeckAction } from '@/app/actions/srs'
import { SrsPracticeArena } from '@/components/student/SrsPracticeArena'
import { SpeakButton } from '@/components/games/SpeakButton'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MistakeNotebookTabProps {
  classCode?: string
  studentName?: string
  onStarsEarned?: (stars: number) => void
  isAnonymous?: boolean
}

type FilterType = 'all' | 'due' | 'learning' | 'mastered'

const BOX_LABELS: Record<number, { text: string; badgeClass: string }> = {
  1: {
    text: 'Hộp 1',
    badgeClass:
      'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  },
  2: {
    text: 'Hộp 2',
    badgeClass:
      'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  },
  3: {
    text: 'Hộp 3',
    badgeClass:
      'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  4: {
    text: 'Hộp 4',
    badgeClass:
      'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  5: {
    text: 'Hộp 5 (Thành thạo)',
    badgeClass:
      'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
}

export function MistakeNotebookTab({
  classCode,
  studentName,
  onStarsEarned,
  isAnonymous = false,
}: MistakeNotebookTabProps) {
  const [deck, setDeck] = useState<SrsCard[]>(() =>
    getStoredSrsDeck(classCode, studentName)
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [isPracticing, setIsPracticing] = useState<boolean>(false)

  // Fetch SRS deck from server if classroom student, else fallback to localStorage
  const loadDeck = useCallback(() => {
    const useServer =
      !isAnonymous && Boolean(classCode?.trim()) && Boolean(studentName?.trim())

    if (useServer) {
      setIsLoading(true)
      getStudentSrsDeckAction({
        classCode: classCode!.trim(),
        studentName: studentName!.trim(),
      })
        .then((res) => {
          if (res.success && res.deck) {
            setDeck(res.deck)
            saveStoredSrsDeck(classCode, studentName, res.deck)
          } else {
            setDeck(getStoredSrsDeck(classCode, studentName))
          }
        })
        .catch(() => {
          setDeck(getStoredSrsDeck(classCode, studentName))
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setDeck(getStoredSrsDeck(classCode, studentName))
    }
  }, [classCode, studentName, isAnonymous])

  useEffect(() => {
    let isCancelled = false
    const useServer =
      !isAnonymous && Boolean(classCode?.trim()) && Boolean(studentName?.trim())

    if (useServer) {
      getStudentSrsDeckAction({
        classCode: classCode!.trim(),
        studentName: studentName!.trim(),
      })
        .then((res) => {
          if (isCancelled) return
          if (res.success && res.deck) {
            setDeck(res.deck)
            saveStoredSrsDeck(classCode, studentName, res.deck)
          } else {
            setDeck(getStoredSrsDeck(classCode, studentName))
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setDeck(getStoredSrsDeck(classCode, studentName))
          }
        })
    }
    return () => {
      isCancelled = true
    }
  }, [classCode, studentName, isAnonymous])

  const dueCards = useMemo(() => getDueCards(deck), [deck])
  const dueCardIdSet = useMemo(
    () => new Set(dueCards.map((c) => c.id)),
    [dueCards]
  )
  const summary: MistakeDeckSummary = useMemo(() => getDeckSummary(deck), [deck])

  // Filtered Cards
  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return deck.filter((card) => {
      // Search matching
      if (query) {
        const matchPrompt = card.prompt.toLowerCase().includes(query)
        const matchAnswer = card.correctAnswer.toLowerCase().includes(query)
        const matchTopic = card.topic?.toLowerCase().includes(query) || false
        if (!matchPrompt && !matchAnswer && !matchTopic) {
          return false
        }
      }

      // Filter matching
      if (filter === 'due') {
        return dueCardIdSet.has(card.id)
      }
      if (filter === 'learning') {
        return card.box <= 2
      }
      if (filter === 'mastered') {
        return card.isMastered || card.box >= 5
      }

      return true
    })
  }, [deck, searchQuery, filter, dueCardIdSet])

  const handlePracticeComplete = (earnedStars: number) => {
    setIsPracticing(false)
    loadDeck()
    onStarsEarned?.(earnedStars)
  }

  // If user is currently practicing inside the arena
  if (isPracticing) {
    const cardsToPractice = dueCards.length > 0 ? dueCards : deck
    return (
      <SrsPracticeArena
        cards={cardsToPractice}
        classCode={classCode}
        studentName={studentName}
        isAnonymous={isAnonymous}
        onComplete={handlePracticeComplete}
        onClose={() => setIsPracticing(false)}
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards Summary */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {/* KPI 1: Total Mistakes */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-card border-2 border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
            <BookOpen className="size-4 shrink-0 text-amber-500" />
            <span className="truncate">Tổng số lỗi</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-foreground">
              {summary.totalCards}
            </span>
            <span className="text-xs text-muted-foreground">từ</span>
          </div>
        </div>

        {/* KPI 2: Due Today */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-950/40 dark:to-yellow-950/20 border-2 border-amber-300 dark:border-amber-700/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Calendar className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate">Cần ôn hôm nay</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
              {summary.dueCount}
            </span>
            <span className="text-xs text-amber-700/80 dark:text-amber-400/80">
              từ
            </span>
          </div>
        </div>

        {/* KPI 3: Mastered */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border-2 border-emerald-300 dark:border-emerald-700/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate">Đã thành thạo</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.masteredCount}
            </span>
            <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
              từ
            </span>
          </div>
        </div>
      </div>

      {/* Action Banner: Luyện tập ngay */}
      {deck.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-yellow-100/80 dark:from-amber-950/60 dark:via-slate-900 dark:to-yellow-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-amber-600 dark:text-amber-400 fill-amber-500 shrink-0" />
              <h3 className="text-base font-black text-foreground">
                Ôn tập ngắt quãng (Leitner SRS)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {dueCards.length > 0
                ? `Bạn có ${dueCards.length} từ vựng cần củng cố lại hôm nay. Nhận +3 ⭐ khi thành thạo thẻ!`
                : 'Tất cả các từ vựng đã được ôn tập đúng hạn! Bạn có thể luyện tập thêm nếu muốn.'}
            </p>
          </div>

          <Button
            onClick={() => setIsPracticing(true)}
            className="rounded-xl px-5 py-5 text-sm sm:text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>
              {dueCards.length > 0
                ? `Luyện tập ngay (${dueCards.length} từ)`
                : 'Luyện tập ngay'}
            </span>
            <Sparkles className="size-4 ml-1.5 fill-current" />
          </Button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ vựng, nghĩa tiếng Việt..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
            />
          </div>

          {/* Filter Tabs */}
          <div
            role="tablist"
            aria-label="Lọc danh sách thẻ"
            className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border overflow-x-auto"
          >
            <button
              role="button"
              aria-pressed={filter === 'all'}
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none shrink-0 cursor-pointer',
                filter === 'all'
                  ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Tất cả ({deck.length})
            </button>

            <button
              role="button"
              aria-pressed={filter === 'due'}
              onClick={() => setFilter('due')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none shrink-0 cursor-pointer',
                filter === 'due'
                  ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Cần ôn ({summary.dueCount})
            </button>

            <button
              role="button"
              aria-pressed={filter === 'learning'}
              onClick={() => setFilter('learning')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none shrink-0 cursor-pointer',
                filter === 'learning'
                  ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Đang học ({summary.learningCount})
            </button>

            <button
              role="button"
              aria-pressed={filter === 'mastered'}
              onClick={() => setFilter('mastered')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all select-none shrink-0 cursor-pointer',
                filter === 'mastered'
                  ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Thành thạo ({summary.masteredCount})
            </button>
          </div>
        </div>
      </div>

      {/* Cards List or Empty State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-amber-500 mb-2" />
          <p className="text-sm font-medium">Đang tải danh sách từ sai...</p>
        </div>
      ) : deck.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-border rounded-3xl bg-card/40 space-y-3">
          <div className="size-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-3xl">
            🎉
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-foreground">
              Chưa có từ sai nào trong Sổ tay!
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              Khi bạn trả lời chưa chính xác trong các trò chơi, từ vựng sẽ tự
              động được ghi lại vào đây để cùng bạn ôn luyện.
            </p>
          </div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border rounded-2xl bg-card/20 space-y-2">
          <p className="text-sm font-bold text-foreground">
            Không tìm thấy từ vựng phù hợp
          </p>
          <p className="text-xs text-muted-foreground">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setFilter('all')
            }}
            className="rounded-xl mt-2 text-xs"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredCards.map((card) => {
            const boxConfig = BOX_LABELS[card.box] || BOX_LABELS[1]
            const isDue = dueCardIdSet.has(card.id)

            return (
              <div
                key={card.id}
                className={cn(
                  'p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs',
                  card.isMastered
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-300/80 dark:border-emerald-800/40'
                    : isDue
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60'
                    : 'bg-card border-border'
                )}
              >
                {/* Left: Card details and audio */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="pt-0.5 shrink-0">
                    <SpeakButton text={card.prompt} size="sm" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black text-foreground">
                        {card.prompt}
                      </span>

                      <span
                        className={cn(
                          'text-[11px] px-2 py-0.5 rounded-md font-bold border shrink-0',
                          boxConfig.badgeClass
                        )}
                      >
                        {boxConfig.text}
                      </span>

                      {isDue && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shrink-0">
                          Cần ôn
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-foreground">
                      <span className="text-muted-foreground mr-1">Đáp án đúng:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {card.correctAnswer}
                      </strong>
                    </div>

                    {card.selectedAnswer && (
                      <div className="text-xs text-rose-600 dark:text-rose-400">
                        <span className="text-muted-foreground mr-1">
                          Lần trước bạn chọn:
                        </span>
                        <strong>{card.selectedAnswer}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Meta stats */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60 shrink-0 text-xs text-muted-foreground gap-1">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {card.mistakeCount} lần sai
                  </span>
                  {card.topic && (
                    <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground">
                      {card.topic}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
