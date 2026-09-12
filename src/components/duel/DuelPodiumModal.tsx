'use client'

import React from 'react'
import { Trophy, RotateCcw, Home, Sparkles, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DuelPodiumPlayer {
  name: string
  avatar: string
  score: number
}

export interface DuelPodiumModalProps {
  isOpen: boolean
  winnerName: string | null
  isTie: boolean
  isWinner: boolean
  player1: DuelPodiumPlayer
  player2?: DuelPodiumPlayer | null
  onRematch: () => void
  onBackToHub: () => void
  isRematching?: boolean
}

export function DuelPodiumModal(props: DuelPodiumModalProps) {
  if (!props.isOpen) {
    return null
  }

  return <DuelPodiumModalContent {...props} />
}

function DuelPodiumModalContent({
  winnerName,
  isTie,
  isWinner,
  player1,
  player2,
  onRematch,
  onBackToHub,
  isRematching = false,
}: DuelPodiumModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duel-podium-title"
      data-testid="duel-podium-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 overflow-hidden text-card-foreground text-center">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 size-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 size-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Big Icon / Trophy */}
        <div className="relative mx-auto mb-4 flex items-center justify-center size-20 sm:size-24 rounded-3xl bg-linear-to-br from-amber-400 to-amber-600 text-white shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/20 animate-bounce duration-1000">
          {isTie ? <Award className="size-10 sm:size-12" /> : <Trophy className="size-10 sm:size-12" />}
        </div>

        {/* Title */}
        <h2
          id="duel-podium-title"
          className="text-xs sm:text-sm font-black text-amber-500 uppercase tracking-widest mb-1"
        >
          {isTie ? 'Kết quả bất phân thắng bại' : 'Trận đấu kết thúc'}
        </h2>

        {/* Winner Announcement */}
        <div
          data-testid="winner-announcement"
          className="text-2xl sm:text-4xl font-black text-foreground tracking-tight mb-6"
        >
          {isTie
            ? 'Hòa nhau! Cả hai bạn đều rất xuất sắc! 🤝'
            : isWinner
              ? `${winnerName} chiến thắng! 🏆`
              : `${winnerName || 'Đối thủ'} chiến thắng! 🏆`}
        </div>

        {/* Player Comparison Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          {/* Player 1 */}
          <div
            className={cn(
              'p-4 rounded-2xl border transition-all',
              !isTie && winnerName === player1.name
                ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20'
                : 'bg-muted/40 border-border'
            )}
          >
            <div className="text-3xl sm:text-4xl mb-2">{player1.avatar || '🦊'}</div>
            <div className="font-bold text-foreground text-sm sm:text-base truncate mb-1">
              {player1.name}
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {player1.score}
            </div>
            <div className="text-xs text-muted-foreground font-semibold">điểm</div>
          </div>

          {/* Player 2 */}
          <div
            className={cn(
              'p-4 rounded-2xl border transition-all',
              !isTie && player2 && winnerName === player2.name
                ? 'bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20'
                : 'bg-muted/40 border-border'
            )}
          >
            <div className="text-3xl sm:text-4xl mb-2">
              {player2 ? player2.avatar || '🐼' : '👤'}
            </div>
            <div className="font-bold text-foreground text-sm sm:text-base truncate mb-1">
              {player2 ? player2.name : 'Đối thủ'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
              {player2 ? player2.score : 0}
            </div>
            <div className="text-xs text-muted-foreground font-semibold">điểm</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            type="button"
            data-testid="rematch-button"
            onClick={onRematch}
            disabled={isRematching}
            className="w-full sm:flex-1 py-3 sm:py-3.5 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {isRematching ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="size-4 animate-spin" /> Đang tạo trận mới...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <RotateCcw className="size-4 sm:size-5" /> Tái đấu ngay
              </span>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            data-testid="back-to-hub-button"
            onClick={onBackToHub}
            className="w-full sm:flex-1 py-3 sm:py-3.5 rounded-2xl border-border hover:bg-muted font-black text-sm sm:text-base cursor-pointer"
          >
            <span className="flex items-center justify-center gap-2">
              <Home className="size-4 sm:size-5" /> Về Sảnh Đấu
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
