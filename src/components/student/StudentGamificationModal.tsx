'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getClassLeaderboard, LeaderboardEntry } from '@/app/actions/class-leaderboard'
import { getBadgeDefinitions, getStoredBadges } from '@/lib/badges'
import { LEVELS, LevelProgress } from '@/lib/levels'
import { UnlockedBadge } from '@/types/badges'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  X,
  Star,
  Trophy,
  Lock,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { StudentAssignmentsTab } from '@/components/student/StudentAssignmentsTab'

export interface StudentGamificationModalProps {
  isOpen: boolean
  onClose: () => void
  classCode: string
  studentName: string
  totalStars: number
  levelInfo: LevelProgress
  initialTab?: 'leaderboard' | 'badges' | 'levels' | 'assignments'
}

type TabType = 'leaderboard' | 'badges' | 'levels' | 'assignments'

export function StudentGamificationModal({
  isOpen,
  onClose,
  classCode,
  studentName,
  totalStars,
  levelInfo,
  initialTab = 'leaderboard',
}: StudentGamificationModalProps) {
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab)
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false)
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)

  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true)
    setActiveTab(initialTab)
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false)
  }

  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab)
    setActiveTab(initialTab)
  }

  // Load badges from persistent storage
  const unlockedBadges: UnlockedBadge[] = useMemo(() => {
    if (!isOpen) return []
    return getStoredBadges(classCode, studentName)
  }, [isOpen, classCode, studentName])

  const [reloadKey, setReloadKey] = useState(0)

  // Fetch leaderboard entries
  const handleRetry = useCallback(() => {
    setIsLoadingLeaderboard(true)
    setLeaderboardError(null)
    setReloadKey((k) => k + 1)
  }, [])

  // When modal is opened or activeTab is leaderboard, fetch leaderboard
  useEffect(() => {
    let isCancelled = false

    if (isOpen && activeTab === 'leaderboard' && classCode) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          setIsLoadingLeaderboard(true)
          setLeaderboardError(null)
        }
      })

      getClassLeaderboard({
        classCode,
        studentName,
      })
        .then((res) => {
          if (isCancelled) return
          if (res.success) {
            setLeaderboardEntries(res.entries || [])
          } else {
            setLeaderboardError(res.error || 'Không thể tải bảng xếp hạng')
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setLeaderboardError('Đã xảy ra lỗi khi kết nối máy chủ')
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingLeaderboard(false)
          }
        })
    }

    return () => {
      isCancelled = true
    }
  }, [isOpen, activeTab, classCode, studentName, reloadKey])

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const allBadges = useMemo(() => getBadgeDefinitions(), [])
  const unlockedCount = useMemo(() => {
    const ids = new Set(unlockedBadges.map((b) => b.badgeId))
    return allBadges.filter((b) => ids.has(b.id)).length
  }, [allBadges, unlockedBadges])

  if (!isOpen) return null

  // Podium entries
  const rank1 = leaderboardEntries.find((e) => e.rank === 1)
  const rank2 = leaderboardEntries.find((e) => e.rank === 2)
  const rank3 = leaderboardEntries.find((e) => e.rank === 3)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gamification-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-card text-card-foreground border-2 border-amber-300/60 dark:border-amber-700/60 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-amber-50/50 dark:bg-amber-950/20">
          <div className="min-w-0">
            <h2
              id="gamification-modal-title"
              className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2"
            >
              <span>🏆</span>
              <span>Bảng Vàng & Thành Tích</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {`${studentName} • Lớp ${classCode}`}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          aria-label="Gamification tabs"
          className="flex border-b border-border bg-muted/40 p-1.5 gap-1.5"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'leaderboard'}
            aria-controls="panel-leaderboard"
            data-testid="tab-leaderboard"
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all select-none',
              activeTab === 'leaderboard'
                ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <span>🏆</span>
            <span>Bảng xếp hạng</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'badges'}
            aria-controls="panel-badges"
            data-testid="tab-badges"
            onClick={() => setActiveTab('badges')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all select-none',
              activeTab === 'badges'
                ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <span>🎖️</span>
            <span>Huy hiệu</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'levels'}
            aria-controls="panel-levels"
            data-testid="tab-levels"
            onClick={() => setActiveTab('levels')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all select-none',
              activeTab === 'levels'
                ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <span>🌟</span>
            <span>Cấp độ</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'assignments'}
            aria-controls="panel-assignments"
            data-testid="tab-assignments"
            onClick={() => setActiveTab('assignments')}
            className={cn(
              'flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all select-none',
              activeTab === 'assignments'
                ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            )}
          >
            <span>📝</span>
            <span>Bài tập</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div id="panel-leaderboard" role="tabpanel" className="space-y-4">
              {isLoadingLeaderboard ? (
                <div
                  role="status"
                  aria-label="Đang tải dữ liệu..."
                  className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                >
                  <Loader2 className="size-8 animate-spin text-amber-500 mb-2" />
                  <p className="text-sm font-medium">Đang tải bảng xếp hạng...</p>
                </div>
              ) : leaderboardError ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <AlertCircle className="size-10 text-red-500 mb-2" />
                  <p className="text-sm font-bold text-foreground mb-1">{leaderboardError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="mt-3 rounded-xl"
                  >
                    Thử lại
                  </Button>
                </div>
              ) : leaderboardEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Trophy className="size-12 text-amber-500/40 mb-3" />
                  <p className="font-bold text-base text-foreground mb-1">
                    Chưa có dữ liệu bảng xếp hạng
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                    Hãy chơi các trò chơi từ vựng và ngữ pháp để ghi danh lên bảng vàng nhé!
                  </p>
                </div>
              ) : (
                <>
                  {/* Top 3 Podium */}
                  {(rank1 || rank2 || rank3) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 items-end">
                      {/* Rank 2 - Silver */}
                      {rank2 && (
                        <div className="order-2 sm:order-1 flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-800/40 border-2 border-slate-300 dark:border-slate-600 text-center shadow-xs">
                          <span className="text-2xl mb-1">🥈</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            Hạng 2
                          </span>
                          <span className="text-sm font-bold text-foreground truncate max-w-full">
                            {rank2.studentName}
                          </span>
                          {rank2.isCurrentStudent && (
                            <span className="text-xs px-2 py-0.5 mt-0.5 rounded-full font-bold bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100">
                              (Bạn)
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {rank2.levelBadge} {rank2.levelTitle}
                          </span>
                          <div className="flex items-center gap-1 mt-1 text-xs font-black text-amber-600 dark:text-amber-400">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span>{rank2.totalStars} sao</span>
                          </div>
                        </div>
                      )}

                      {/* Rank 1 - Gold */}
                      {rank1 && (
                        <div className="order-1 sm:order-2 flex flex-col items-center p-4 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-200/80 dark:from-amber-950/70 dark:to-amber-900/40 border-2 border-amber-400 dark:border-amber-600 text-center shadow-md scale-100 sm:scale-105 z-10">
                          <span className="text-3xl mb-1">🥇</span>
                          <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Hạng 1
                          </span>
                          <span className="text-base font-black text-foreground truncate max-w-full">
                            {rank1.studentName}
                          </span>
                          {rank1.isCurrentStudent && (
                            <span className="text-xs px-2 py-0.5 mt-0.5 rounded-full font-bold bg-amber-300 dark:bg-amber-700 text-amber-950 dark:text-amber-100">
                              (Bạn)
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {rank1.levelBadge} {rank1.levelTitle}
                          </span>
                          <div className="flex items-center gap-1 mt-1.5 text-sm font-black text-amber-600 dark:text-amber-400">
                            <Star className="size-4 fill-amber-500 text-amber-500" />
                            <span>{rank1.totalStars} sao</span>
                          </div>
                        </div>
                      )}

                      {/* Rank 3 - Bronze */}
                      {rank3 && (
                        <div className="order-3 sm:order-3 flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-orange-100/70 to-orange-200/60 dark:from-amber-950/40 dark:to-stone-900/40 border-2 border-amber-600/30 dark:border-amber-700/40 text-center shadow-xs">
                          <span className="text-2xl mb-1">🥉</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">
                            Hạng 3
                          </span>
                          <span className="text-sm font-bold text-foreground truncate max-w-full">
                            {rank3.studentName}
                          </span>
                          {rank3.isCurrentStudent && (
                            <span className="text-xs px-2 py-0.5 mt-0.5 rounded-full font-bold bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100">
                              (Bạn)
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {rank3.levelBadge} {rank3.levelTitle}
                          </span>
                          <div className="flex items-center gap-1 mt-1 text-xs font-black text-amber-600 dark:text-amber-400">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span>{rank3.totalStars} sao</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Full List of Ranks */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                      Danh sách xếp hạng
                    </div>
                    <div className="space-y-1.5">
                      {leaderboardEntries.map((entry) => (
                        <div
                          key={entry.studentId}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-xl border transition-colors',
                            entry.isCurrentStudent
                              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600/60 shadow-xs'
                              : 'bg-background/80 dark:bg-slate-950/40 border-border hover:bg-muted/40'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-black text-sm w-7 text-center shrink-0">
                              {entry.rank === 1
                                ? '🥇'
                                : entry.rank === 2
                                ? '🥈'
                                : entry.rank === 3
                                ? '🥉'
                                : `#${entry.rank}`}
                            </span>
                            <span className="text-lg shrink-0">{entry.levelBadge}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground truncate">
                                  {entry.studentName}
                                </span>
                                {entry.isCurrentStudent && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 shrink-0">
                                    (Bạn)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {entry.levelTitle} • {entry.sessionsCount} lượt chơi
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 font-black text-sm text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                            <Star className="size-4 fill-amber-500 text-amber-500" />
                            <span>{entry.totalStars} sao</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: BADGES */}
          {activeTab === 'badges' && (
            <div id="panel-badges" role="tabpanel" className="space-y-4">
              {/* Badge Counter */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎖️</span>
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    Bộ sưu tập huy hiệu
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-300">
                  Đã đạt được {unlockedCount} / {allBadges.length} huy hiệu
                </div>
              </div>

              {/* Grid of Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allBadges.map((badge) => {
                  const unlocked = unlockedBadges.find((u) => u.badgeId === badge.id)
                  const isUnlocked = Boolean(unlocked)

                  return (
                    <div
                      key={badge.id}
                      className={cn(
                        'p-3.5 rounded-2xl border flex items-start gap-3 transition-all',
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-50/90 to-yellow-50/60 dark:from-amber-950/40 dark:to-yellow-950/20 border-amber-300 dark:border-amber-600/50 shadow-xs'
                          : 'opacity-60 bg-muted/30 dark:bg-slate-900/30 border-dashed border-border'
                      )}
                    >
                      <div
                        className={cn(
                          'size-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border',
                          isUnlocked
                            ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-300 dark:border-amber-600 shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        )}
                      >
                        {badge.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-bold text-sm text-foreground truncate">
                            {badge.title}
                          </h4>
                          {isUnlocked ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                              Đã mở khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                              <Lock className="size-3" />
                              Chưa mở khóa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LEVELS */}
          {activeTab === 'levels' && (
            <div id="panel-levels" role="tabpanel" className="space-y-4">
              {/* Current Level Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-yellow-100/80 dark:from-amber-950/60 dark:via-slate-900 dark:to-yellow-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-2xl shadow-xs border border-amber-300 dark:border-amber-600">
                    {levelInfo.currentLevel.badge}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      Cấp hiện tại
                    </div>
                    <div className="text-base font-black text-foreground">
                      {`Cấp ${levelInfo.currentLevel.level}: ${levelInfo.currentLevel.title}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-amber-200/80 dark:bg-amber-900/60 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/50">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-black text-amber-950 dark:text-amber-100">
                    {`${totalStars} sao`}
                  </span>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="p-4 rounded-2xl border border-border bg-card">
                {levelInfo.nextLevel ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">
                        {`Tiến trình lên Cấp ${levelInfo.nextLevel.level} (${levelInfo.nextLevel.title} ${levelInfo.nextLevel.badge})`}
                      </span>
                      <span className="font-black text-amber-600 dark:text-amber-400">
                        {`${levelInfo.progressToNext}%`}
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={levelInfo.progressToNext}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="w-full h-3 bg-muted rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${levelInfo.progressToNext}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {`Cần thêm ${levelInfo.starsToNext} sao để lên ${levelInfo.nextLevel.title}`}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <Sparkles className="size-5" />
                    <span>Đã đạt cấp tối đa! Chúc mừng bạn đã đứng trên đỉnh vinh quang!</span>
                  </div>
                )}
              </div>

              {/* Roadmap of all 5 Levels */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                  Hành trình cấp độ (1 - 5)
                </div>
                <div className="space-y-2">
                  {LEVELS.map((lvl) => {
                    const isCurrent = lvl.level === levelInfo.currentLevel.level
                    const isUnlocked = totalStars >= lvl.threshold

                    return (
                      <div
                        key={lvl.level}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-xl border transition-all',
                          isCurrent
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                            : isUnlocked
                            ? 'bg-card border-border/80'
                            : 'opacity-60 bg-muted/20 border-dashed border-border'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lvl.badge}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">
                                {`Cấp ${lvl.level}: ${lvl.title}`}
                              </span>
                              {isCurrent && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-amber-100">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {`Yêu cầu: ${lvl.threshold} sao`}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="size-3.5" />
                              Đã mở khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              <Lock className="size-3.5" />
                              Chưa mở khóa
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div id="panel-assignments" role="tabpanel" className="space-y-4">
              <StudentAssignmentsTab
                classCode={classCode}
                studentName={studentName}
                onCloseModal={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
