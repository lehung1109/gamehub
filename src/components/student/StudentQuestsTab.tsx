'use client'

import React, { useState, useMemo } from 'react'
import {
  getOrGenerateQuests,
  claimQuestReward,
  saveStoredQuests,
} from '@/lib/quests'
import {
  getStoredStreak,
  saveStoredStreak,
  getTodayDateString,
} from '@/lib/streak'
import type { Quest } from '@/types/quests'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StudentQuestsTabProps {
  classCode?: string
  studentName?: string
  totalStars: number
  onStarsClaimed?: (stars: number) => void
}

export function StudentQuestsTab({
  classCode,
  studentName,
  totalStars,
  onStarsClaimed,
}: StudentQuestsTabProps) {
  const credKey = `${classCode || ''}_${studentName || ''}`
  const [prevCredKey, setPrevCredKey] = useState(credKey)
  const [quests, setQuests] = useState<Quest[]>(() =>
    getOrGenerateQuests(getTodayDateString(), classCode, studentName)
  )
  const [feedback, setFeedback] = useState<string | null>(null)

  if (credKey !== prevCredKey) {
    setPrevCredKey(credKey)
    setQuests(getOrGenerateQuests(getTodayDateString(), classCode, studentName))
  }

  const dailyQuests = useMemo(
    () => quests.filter((q) => q.period === 'daily'),
    [quests]
  )

  const weeklyQuest = useMemo(
    () => quests.find((q) => q.period === 'weekly'),
    [quests]
  )

  const completedDailyCount = useMemo(
    () => dailyQuests.filter((q) => q.isCompleted).length,
    [dailyQuests]
  )

  const claimableCount = useMemo(
    () => quests.filter((q) => q.isCompleted && !q.isClaimed).length,
    [quests]
  )

  const handleClaim = (questId: string) => {
    const result = claimQuestReward(quests, questId)
    if (result.claimedReward) {
      setQuests(result.updatedQuests)
      saveStoredQuests(classCode, studentName, result.updatedQuests)

      if (result.claimedReward.freeze > 0) {
        const streak = getStoredStreak(classCode, studentName)
        const updatedStreak = {
          ...streak,
          freezeCount: streak.freezeCount + result.claimedReward.freeze,
        }
        saveStoredStreak(classCode, studentName, updatedStreak)
      }

      if (result.claimedReward.stars > 0) {
        onStarsClaimed?.(result.claimedReward.stars)
      }

      const freezeBonus =
        result.claimedReward.freeze > 0
          ? ` và +${result.claimedReward.freeze} 🧊`
          : ''
      setFeedback(
        `Nhận thành công +${result.claimedReward.stars} ⭐${freezeBonus}!`
      )
    }
  }

  return (
    <div className="space-y-5">
      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 text-base font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Header Summary Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-yellow-100/80 dark:from-amber-950/60 dark:via-slate-900 dark:to-yellow-950/40 border-2 border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-2xl shadow-xs border border-amber-300 dark:border-amber-600 shrink-0">
            🎯
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Thử thách mỗi ngày
            </div>
            <h3 className="text-lg font-black text-foreground">
              Nhiệm vụ hôm nay
            </h3>
            <p className="text-base text-muted-foreground mt-0.5">
              Hoàn thành: {completedDailyCount} / 3 nhiệm vụ ngày
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {claimableCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700/50">
              <Sparkles className="size-4 text-amber-600 dark:text-amber-400 fill-amber-500 shrink-0" />
              <span className="text-sm font-black text-amber-950 dark:text-amber-100">
                Có {claimableCount} phần thưởng có thể nhận!
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700/50">
            <span className="text-sm font-black text-amber-950 dark:text-amber-100">
              {totalStars} ⭐
            </span>
          </div>
        </div>
      </div>

      {/* Daily Quests List */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
          Nhiệm vụ ngày
        </div>

        <div className="space-y-3">
          {dailyQuests.map((quest) => {
            const progressPercent = Math.min(
              100,
              Math.round((quest.current / quest.target) * 100)
            )

            return (
              <div
                key={quest.id}
                className={cn(
                  'p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  quest.isClaimed
                    ? 'bg-muted/20 border-border/80 opacity-70'
                    : quest.isCompleted
                    ? 'bg-gradient-to-r from-emerald-50/70 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-300 dark:border-emerald-700/60 shadow-xs'
                    : 'bg-card border-border shadow-xs'
                )}
              >
                {/* Left: Icon and Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={cn(
                      'size-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border',
                      quest.isCompleted && !quest.isClaimed
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-600'
                        : 'bg-muted/40 border-border'
                    )}
                  >
                    {quest.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-foreground truncate">
                        {quest.title}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                        +{quest.rewardStars} ⭐
                      </span>
                    </div>

                    <p className="text-base text-muted-foreground mt-0.5 leading-snug">
                      {quest.description}
                    </p>

                    {/* Progress Bar & Counter */}
                    <div className="mt-2.5 space-y-1 max-w-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                        <span>Tiến độ</span>
                        <span className="text-foreground">
                          {quest.current} / {quest.target}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={quest.current}
                        aria-valuemin={0}
                        aria-valuemax={quest.target}
                        className="w-full h-2.5 bg-muted rounded-full overflow-hidden"
                      >
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            quest.isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Action Button */}
                <div className="self-end sm:self-center shrink-0">
                  {quest.isClaimed ? (
                    <Button
                      disabled
                      variant="outline"
                      className="rounded-xl text-base font-bold text-muted-foreground cursor-not-allowed"
                    >
                      Đã nhận ✓
                    </Button>
                  ) : quest.isCompleted ? (
                    <Button
                      onClick={() => handleClaim(quest.id)}
                      className="rounded-xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Nhận thưởng
                    </Button>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                      className="rounded-xl text-base font-bold text-muted-foreground cursor-not-allowed"
                    >
                      Đang làm
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly Quest Section */}
      {weeklyQuest && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Nhiệm vụ tuần
          </div>

          <div
            className={cn(
              'p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4',
              weeklyQuest.isClaimed
                ? 'bg-muted/20 border-border/80 opacity-70'
                : weeklyQuest.isCompleted
                ? 'bg-gradient-to-r from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/20 border-indigo-300 dark:border-indigo-700/60 shadow-md'
                : 'bg-gradient-to-r from-slate-50 to-amber-50/40 dark:from-slate-900/60 dark:to-amber-950/20 border-amber-300/80 dark:border-amber-700/50 shadow-xs'
            )}
          >
            {/* Left: Icon & Details */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="size-12 rounded-2xl bg-gradient-to-tr from-amber-300 to-yellow-500 flex items-center justify-center text-2xl shadow-sm border border-amber-400 shrink-0">
                <Trophy className="size-6 text-amber-950" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-base text-foreground truncate">
                    {weeklyQuest.title}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                    +{weeklyQuest.rewardStars} ⭐
                  </span>
                  {weeklyQuest.rewardFreeze && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shrink-0">
                      +{weeklyQuest.rewardFreeze} 🧊
                    </span>
                  )}
                </div>

                <p className="text-base text-muted-foreground mt-0.5 leading-snug">
                  {weeklyQuest.description}
                </p>

                {/* Progress Bar & Counter */}
                <div className="mt-2.5 space-y-1 max-w-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>Tiến độ tuần</span>
                    <span className="text-foreground">
                      {weeklyQuest.current} / {weeklyQuest.target}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={weeklyQuest.current}
                    aria-valuemin={0}
                    aria-valuemax={weeklyQuest.target}
                    className="w-full h-2.5 bg-muted rounded-full overflow-hidden"
                  >
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        weeklyQuest.isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                      )}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (weeklyQuest.current / weeklyQuest.target) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Button */}
            <div className="self-end sm:self-center shrink-0">
              {weeklyQuest.isClaimed ? (
                <Button
                  disabled
                  variant="outline"
                  className="rounded-xl text-base font-bold text-muted-foreground cursor-not-allowed"
                >
                  Đã nhận ✓
                </Button>
              ) : weeklyQuest.isCompleted ? (
                <Button
                  onClick={() => handleClaim(weeklyQuest.id)}
                  className="rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Nhận thưởng
                </Button>
              ) : (
                <Button
                  disabled
                  variant="outline"
                  className="rounded-xl text-base font-bold text-muted-foreground cursor-not-allowed"
                >
                  Đang làm
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
