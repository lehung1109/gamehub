'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Star, Trophy, Award, Lock, Sparkles, Crown, ArrowRight } from 'lucide-react';
import type { RoadmapNode, StudentNodeProgress } from '@/types/roadmap';

export interface RoadmapNodeModalProps {
  node: RoadmapNode | null;
  progress?: StudentNodeProgress;
  isUnlocked: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function RoadmapNodeModal({
  node,
  progress,
  isUnlocked,
  isOpen,
  onClose,
}: RoadmapNodeModalProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !node) return null;

  const stars = progress?.stars ?? 0;
  const highScore = progress?.highScore ?? 0;
  const attempts = progress?.attempts ?? 0;
  const isCompleted = Boolean(progress?.isCompleted && stars > 0);
  const isBoss = node.isBossCheckpoint;
  const playUrl = `${node.gameRoute}?roadmapNode=${node.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-modal-title"
    >
      <div
        data-testid="roadmap-node-modal"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background decorative glow */}
        <div
          className={`absolute -top-12 -right-12 size-36 rounded-full blur-2xl pointer-events-none opacity-40 ${
            isBoss ? 'bg-amber-500' : isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
          }`}
        />

        {/* Header with badge & Close button */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            {isBoss ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300">
                <Crown className="size-3.5 fill-amber-500 text-amber-500" />
                <span>Thử Thách Trùm</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span>Chặng {node.order}</span>
              </span>
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {node.gameType}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-5">
          <h2
            id="roadmap-modal-title"
            className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-1"
          >
            {node.titleVi}
          </h2>
          {node.titleEn && (
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {node.titleEn}
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {node.descriptionVi || node.descriptionEn}
          </p>
        </div>

        {/* Progress & High Score Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-4">
          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-200 dark:divide-slate-700">
            <div>
              <div className="text-xs text-muted-foreground font-semibold mb-1">Sao đạt được</div>
              <div className="flex items-center justify-center gap-0.5">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    className={`size-4 ${
                      s <= stars
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-semibold mb-1">Điểm cao nhất</div>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                <Trophy className="size-3.5 text-amber-500" />
                <span>{highScore}%</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground font-semibold mb-1">Số lần chơi</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">
                {attempts}
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 mb-6 text-xs sm:text-sm">
          <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <Sparkles className="size-4 text-amber-600" />
            <span>Phần thưởng hoàn thành:</span>
          </span>
          <div className="flex items-center gap-3 font-extrabold text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-1">
              <Award className="size-3.5 text-indigo-500" />
              +{node.xpReward} XP
            </span>
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-500" />
              +{node.bonusStars} Sao
            </span>
          </div>
        </div>

        {/* Lock alert notice if not unlocked */}
        {!isUnlocked && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 mb-5 text-xs text-rose-800 dark:text-rose-300">
            <Lock className="size-4 shrink-0 mt-0.5" />
            <p>
              Chặng này chưa được mở khóa. Hãy hoàn thành các chặng trước đạt tối thiểu 1 sao để tiếp tục hành trình!
            </p>
          </div>
        )}

        {/* Action CTA Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          {isUnlocked ? (
            <Link
              href={playUrl}
              className={`flex-[2] py-3 px-5 rounded-2xl text-sm font-black text-white text-center flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                isBoss
                  ? 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/30'
                  : 'bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30'
              }`}
            >
              <span>{isBoss ? 'Bắt đầu Đấu Trùm' : isCompleted ? 'Chơi lại' : 'Chơi ngay'}</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex-[2] py-3 px-5 rounded-2xl text-sm font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="size-4" />
              <span>Chưa mở khóa</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoadmapNodeModal;
