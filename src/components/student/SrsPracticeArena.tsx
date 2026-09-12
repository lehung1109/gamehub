'use client'

import React, { useState } from 'react'
import type { SrsCard, SrsReviewInput } from '@/types/srs'
import { applyReviewToCard } from '@/lib/srs'
import { getStoredSrsDeck, saveStoredSrsDeck } from '@/lib/srs-storage'
import { recordBonusStars } from '@/lib/shop'
import { submitSrsReviewBatchAction } from '@/app/actions/srs'
import { SpeakButton } from '@/components/games/SpeakButton'
import { Button } from '@/components/ui/button'
import {
  X,
  RotateCw,
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SrsPracticeArenaProps {
  cards: SrsCard[]
  classCode?: string
  studentName?: string
  isAnonymous?: boolean
  onComplete: (earnedStars: number) => void
  onClose: () => void
}

const BOX_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: {
    bg: 'bg-red-100 dark:bg-red-950/60',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-800',
  },
  2: {
    bg: 'bg-orange-100 dark:bg-orange-950/60',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-800',
  },
  3: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-800',
  },
  4: {
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-800',
  },
  5: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
}

export function SrsPracticeArena({
  cards,
  classCode,
  studentName,
  isAnonymous = false,
  onComplete,
  onClose,
}: SrsPracticeArenaProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviews, setReviews] = useState<SrsReviewInput[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [stats, setStats] = useState({
    totalReviewed: 0,
    masteredCount: 0,
    earnedStars: 0,
  })

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h3 className="text-lg font-bold text-foreground">
          Không có thẻ nào cần ôn tập!
        </h3>
        <p className="text-sm text-muted-foreground">
          Bạn đã ôn tập xong tất cả các từ vựng đến hạn hôm nay.
        </p>
        <Button onClick={onClose} variant="outline" className="rounded-xl">
          Quay lại Sổ tay
        </Button>
      </div>
    )
  }

  const currentCard = cards[currentIndex]
  const totalCards = cards.length
  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100)
  const boxStyle = BOX_COLORS[currentCard?.box || 1] || BOX_COLORS[1]

  const handleFlip = () => {
    setIsFlipped((prev) => !prev)
  }

  const handleRate = async (rating: 'hard' | 'good' | 'easy') => {
    const currentReview: SrsReviewInput = {
      cardId: currentCard.id,
      rating,
    }
    const updatedReviews = [...reviews, currentReview]
    setReviews(updatedReviews)

    if (currentIndex + 1 < totalCards) {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
    } else {
      // Last card -> submit batch
      await finalizeSession(updatedReviews)
    }
  }

  const finalizeSession = async (finalReviews: SrsReviewInput[]) => {
    setIsSubmitting(true)
    let totalEarnedStars = 0
    let newlyMasteredCount = 0

    const useServer = !isAnonymous && Boolean(classCode?.trim()) && Boolean(studentName?.trim())

    if (useServer) {
      try {
        const res = await submitSrsReviewBatchAction({
          classCode: classCode!.trim(),
          studentName: studentName!.trim(),
          reviews: finalReviews,
        })

        if (res.success && res.updatedCards) {
          totalEarnedStars = res.earnedStars || 0
          newlyMasteredCount = res.updatedCards.filter(
            (c) =>
              c.isMastered &&
              c.box === 5 &&
              !cards.find((orig) => orig.id === c.id)?.isMastered
          ).length

          // Sync localStorage
          const localDeck = getStoredSrsDeck(classCode, studentName)
          const updatedMap = new Map(res.updatedCards.map((c) => [c.id, c]))
          const merged = localDeck.map((c) => updatedMap.get(c.id) || c)
          res.updatedCards.forEach((c) => {
            if (!merged.some((m) => m.id === c.id)) {
              merged.push(c)
            }
          })
          saveStoredSrsDeck(classCode, studentName, merged)
          if (totalEarnedStars > 0) {
            recordBonusStars(classCode, studentName, totalEarnedStars)
          }
        } else {
          // Fallback to local calculation on server failure
          const localResult = applyReviewsLocally(finalReviews)
          totalEarnedStars = localResult.earnedStars
          newlyMasteredCount = localResult.masteredCount
        }
      } catch {
        const localResult = applyReviewsLocally(finalReviews)
        totalEarnedStars = localResult.earnedStars
        newlyMasteredCount = localResult.masteredCount
      }
    } else {
      // Anonymous / Guest mode
      const localResult = applyReviewsLocally(finalReviews)
      totalEarnedStars = localResult.earnedStars
      newlyMasteredCount = localResult.masteredCount
    }

    setStats({
      totalReviewed: finalReviews.length,
      masteredCount: newlyMasteredCount,
      earnedStars: totalEarnedStars,
    })
    setIsSubmitting(false)
    setIsCompleted(true)
  }

  const applyReviewsLocally = (reviewsList: SrsReviewInput[]) => {
    const currentDeck = getStoredSrsDeck(classCode, studentName)
    const cardMap = new Map(currentDeck.map((c) => [c.id, c]))
    let totalStars = 0
    let mastered = 0

    for (const rev of reviewsList) {
      const card = cardMap.get(rev.cardId)
      if (card) {
        const result = applyReviewToCard(card, rev.rating)
        cardMap.set(rev.cardId, result.updatedCard)
        totalStars += result.earnedStars
        if (result.newlyMastered) {
          mastered += 1
        }
      }
    }

    const updatedDeck = Array.from(cardMap.values())
    saveStoredSrsDeck(classCode, studentName, updatedDeck)

    if (totalStars > 0) {
      recordBonusStars(classCode, studentName, totalStars)
    }

    return {
      earnedStars: totalStars,
      masteredCount: mastered,
    }
  }

  // Render Completion Screen
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="size-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl shadow-lg border-2 border-amber-300 animate-bounce">
          <Trophy className="size-10 text-amber-950" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-foreground">
            🎉 Hoàn thành ôn tập!
          </h3>
          <p className="text-sm text-muted-foreground">
            Bạn đã nỗ lực rất tuyệt vời để củng cố các từ vựng này.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Đã ôn tập
            </span>
            <span className="text-xl font-black text-foreground mt-1">
              {stats.totalReviewed}
            </span>
            <span className="text-xs text-muted-foreground">từ vựng</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/60 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase">
              Thành thạo mới
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.masteredCount}
            </span>
            <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
              lên Hộp 5
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase">
              Sao thưởng
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              +{stats.earnedStars} ⭐
            </span>
            <span className="text-xs text-amber-700/80 dark:text-amber-400/80">
              {stats.earnedStars > 0 ? '+3 sao / từ thành thạo' : 'Tiếp tục phát huy!'}
            </span>
          </div>
        </div>

        <Button
          onClick={() => onComplete(stats.earnedStars)}
          className="w-full max-w-md rounded-2xl py-6 text-base font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg cursor-pointer active:scale-95 transition-all"
        >
          <span>Hoàn tất</span>
          <Sparkles className="size-5 ml-2 fill-current" />
        </Button>
      </div>
    )
  }

  // Render Active Review Arena
  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-black text-foreground">
            Luyện tập Sổ tay
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Thẻ {currentIndex + 1} / {totalCards}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Thoát ôn tập"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalCards}
        className="w-full h-2 bg-muted rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Flashcard Area */}
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            handleFlip()
          }
        }}
        aria-label={isFlipped ? 'Mặt sau của thẻ' : 'Mặt trước của thẻ'}
        className={cn(
          'relative min-h-[260px] sm:min-h-[300px] p-6 sm:p-8 rounded-3xl border-2 cursor-pointer select-none transition-all flex flex-col justify-between shadow-md',
          isFlipped
            ? 'bg-gradient-to-br from-card via-card/95 to-amber-50/30 dark:to-amber-950/20 border-amber-400 dark:border-amber-600/80'
            : 'bg-card border-border hover:border-amber-300 dark:hover:border-amber-700/60'
        )}
      >
        {/* Card Top Details */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs px-2.5 py-1 rounded-xl font-bold border',
                boxStyle.bg,
                boxStyle.text,
                boxStyle.border
              )}
            >
              Hộp {currentCard.box}
            </span>
            {currentCard.topic && (
              <span className="text-xs px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                {currentCard.topic}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCw className="size-3.5" />
            <span>{isFlipped ? 'Đang mở đáp án' : 'Nhấn để lật thẻ'}</span>
          </div>
        </div>

        {/* Card Center Content */}
        {!isFlipped ? (
          /* FRONT OF CARD */
          <div className="my-auto py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-3xl sm:text-4xl font-black text-foreground tracking-wide">
              {currentCard.prompt}
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={currentCard.prompt} size="icon" />
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <HelpCircle className="size-3.5" />
              <span>Hãy nhớ lại nghĩa của từ trước khi lật thẻ</span>
            </p>
          </div>
        ) : (
          /* BACK OF CARD */
          <div className="my-auto py-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="text-lg sm:text-xl font-semibold text-muted-foreground">
              {currentCard.prompt}
            </div>

            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {currentCard.correctAnswer}
            </div>

            {currentCard.selectedAnswer && (
              <div className="text-xs text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900">
                Lần trước bạn chọn: <strong>{currentCard.selectedAnswer}</strong>
              </div>
            )}

            <div onClick={(e) => e.stopPropagation()}>
              <SpeakButton
                text={currentCard.prompt}
                size="icon"
              />
            </div>
          </div>
        )}

        {/* Card Footer Hint */}
        <div className="flex items-center justify-center text-xs text-muted-foreground pt-2 border-t border-border/40">
          {!isFlipped ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleFlip()
              }}
              className="rounded-xl border-amber-300 dark:border-amber-700/60 font-bold text-xs"
            >
              <RotateCw className="size-3.5 mr-1.5" />
              Xem đáp án
            </Button>
          ) : (
            <span className="text-muted-foreground">
              Đánh giá mức độ ghi nhớ của bạn bên dưới:
            </span>
          )}
        </div>
      </div>

      {/* Leitner 3-Button Evaluation (Only active on Back of card) */}
      {isFlipped && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Hard Rating */}
            <Button
              disabled={isSubmitting}
              onClick={() => handleRate('hard')}
              className="flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-sm sm:text-base font-black flex items-center gap-1">
                <span>Khó</span>
                <span>🔴</span>
              </span>
              <span className="text-xs font-semibold text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Về Hộp 1
              </span>
            </Button>

            {/* Good Rating */}
            <Button
              disabled={isSubmitting}
              onClick={() => handleRate('good')}
              className="flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-2 border-amber-300 dark:border-amber-800 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-sm sm:text-base font-black flex items-center gap-1">
                <span>Nhớ tốt</span>
                <span>🟡</span>
              </span>
              <span className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/80 mt-0.5">
                +1 Hộp
              </span>
            </Button>

            {/* Easy Rating */}
            <Button
              disabled={isSubmitting}
              onClick={() => handleRate('easy')}
              className="flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-sm sm:text-base font-black flex items-center gap-1">
                <span>Rất dễ</span>
                <span>🟢</span>
              </span>
              <span className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                +2 Hộp
              </span>
            </Button>
          </div>

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-1">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Đang lưu tiến trình ôn tập...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
