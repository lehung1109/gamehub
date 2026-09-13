'use client';

import React from 'react';
import Link from 'next/link';
import { Star, RotateCcw, MapPin, Sparkles, AlertCircle } from 'lucide-react';

export interface RoadmapResultBannerProps {
  stars: number;
  isNewUnlock: boolean;
  nextNodeTitle?: string;
  onReplay?: () => void;
  onBackToRoadmap?: () => void;
}

export const RoadmapResultBanner: React.FC<RoadmapResultBannerProps> = ({
  stars,
  isNewUnlock,
  nextNodeTitle,
  onReplay,
  onBackToRoadmap,
}) => {
  const isPassed = stars >= 1;
  const isPerfect = stars === 3;

  return (
    <div
      data-testid="roadmap-result-banner"
      className="relative overflow-hidden rounded-3xl border-2 border-amber-300/60 dark:border-amber-500/40 bg-linear-to-b from-amber-50/90 via-white to-amber-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/90 p-5 sm:p-6 shadow-xl text-center backdrop-blur-xs"
    >
      {/* Lightweight confetti & particle celebration for 3 stars */}
      {isPerfect && (
        <div
          data-testid="confetti-container"
          className="absolute inset-0 pointer-events-none overflow-hidden select-none"
          aria-hidden="true"
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-sm sm:text-base animate-bounce"
              style={{
                top: `${(i * 17) % 85}%`,
                left: `${(i / 16) * 100}%`,
                animationDelay: `${(i % 4) * 0.2}s`,
                animationDuration: `${1.2 + (i % 3) * 0.4}s`,
              }}
            >
              {['🎉', '⭐', '✨', '🌟', '🎊'][i % 5]}
            </span>
          ))}
        </div>
      )}

      {/* Header Badge */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-2">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
            isPassed
              ? 'bg-linear-to-tr from-amber-400 to-yellow-300 text-amber-950 dark:text-amber-900'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {isPerfect ? '🏆' : isPassed ? '🌟' : '💪'}
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {isPerfect
            ? 'Xuất sắc! Đạt 3 sao tuyệt đối'
            : isPassed
            ? 'Hoàn thành chặng học!'
            : 'Cần cố gắng thêm một chút!'}
        </h3>

        {/* Star Rating Display */}
        <div
          data-testid="stars-earned"
          className="flex items-center justify-center gap-2 my-2 py-2 px-4 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-xs border border-amber-200 dark:border-slate-700"
        >
          {[1, 2, 3].map((starNum) => {
            const isFilled = starNum <= stars;
            return (
              <Star
                key={starNum}
                data-testid={`result-star-${starNum}`}
                className={`w-8 h-8 transition-transform duration-300 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow-sm'
                    : 'fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600 scale-95'
                }`}
              />
            );
          })}
        </div>

        {/* Feedback / Unlock Notification */}
        {isPassed && isNewUnlock && (
          <div
            data-testid="new-unlock-banner"
            className="w-full max-w-sm mx-auto my-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-300"
          >
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-sm font-semibold text-center">
              <span>Đã mở khóa chặng tiếp theo! </span>
              {nextNodeTitle && (
                <span className="font-bold underline underline-offset-2">{nextNodeTitle}</span>
              )}
            </div>
          </div>
        )}

        {!isPassed && (
          <div className="w-full max-w-sm mx-auto my-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm font-medium">
              Cần đạt tối thiểu 60% để vượt qua chặng này
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3 w-full max-w-md">
          {onReplay && (
            <button
              type="button"
              data-testid="replay-button"
              onClick={onReplay}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs hover:scale-102 active:scale-98 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại</span>
            </button>
          )}

          {onBackToRoadmap ? (
            <button
              type="button"
              data-testid="back-to-roadmap-button"
              onClick={onBackToRoadmap}
              className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition hover:scale-102 active:scale-98 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Về bản đồ lộ trình</span>
            </button>
          ) : (
            <Link
              href="/roadmap"
              data-testid="back-to-roadmap-button"
              className="flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition hover:scale-102 active:scale-98"
            >
              <MapPin className="w-4 h-4" />
              <span>Về bản đồ lộ trình</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
