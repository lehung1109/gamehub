"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Trophy, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { OddOneOutDifficulty } from "@/types/odd-one-out";

export interface OddOneOutHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  difficulty: OddOneOutDifficulty;
  score: number;
  streak: number;
  onOpenGuide: () => void;
  onChangeDifficulty?: (difficulty: OddOneOutDifficulty) => void;
  className?: string;
}

const DIFFICULTY_CONFIG: Record<
  OddOneOutDifficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "Dễ",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  },
  medium: {
    label: "Vừa",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  },
  hard: {
    label: "Khó",
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800",
  },
};

export const OddOneOutHeader: React.FC<OddOneOutHeaderProps> = ({
  currentIndex,
  totalQuestions,
  difficulty,
  score,
  streak,
  onOpenGuide,
  onChangeDifficulty,
  className,
}) => {
  const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentIndex + 1) / (totalQuestions || 1)) * 100)
  );

  return (
    <header
      data-testid="odd-one-out-header"
      className={cn(
        "w-full max-w-2xl mx-auto flex flex-col gap-2 px-3 py-2 sm:py-3 select-none",
        "border-b border-slate-200 dark:border-slate-800",
        className
      )}
    >
      {/* Top row: Back link, Game Title, and Guide button */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Quay lại danh sách trò chơi"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            Odd One Out
          </h1>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Truy Tìm Kẻ Lạc Loài
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenGuide}
          aria-label="Hướng dẫn cách chơi"
          className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
          title="Hướng dẫn cách chơi"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Sub-bar: Question progress, Difficulty selector/badge, Streak & Score */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
        {/* Progress and Difficulty */}
        <div className="flex items-center gap-2">
          <span
            data-testid="question-progress"
            aria-label={`Câu hỏi ${currentIndex + 1} trên ${totalQuestions}`}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 min-h-[44px] flex items-center"
          >
            Câu {currentIndex + 1} / {totalQuestions}
          </span>

          {onChangeDifficulty ? (
            <select
              aria-label="Chọn độ khó"
              value={difficulty}
              onChange={(e) =>
                onChangeDifficulty(e.target.value as OddOneOutDifficulty)
              }
              className={cn(
                "px-2.5 py-1 rounded-xl text-xs font-black border uppercase tracking-wider min-h-[44px] bg-white dark:bg-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400",
                diffConfig.className
              )}
            >
              <option value="easy">Dễ</option>
              <option value="medium">Vừa</option>
              <option value="hard">Khó</option>
            </select>
          ) : (
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-black border uppercase tracking-wider",
                diffConfig.className
              )}
            >
              {diffConfig.label}
            </span>
          )}
        </div>

        {/* Streak & Score Counter */}
        <div className="flex items-center gap-2">
          {/* Combo Streak Badge */}
          <div
            data-testid="streak-badge"
            aria-label={`Chuỗi combo: ${streak}`}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-xl border font-bold min-h-[44px]",
              streak > 0
                ? "bg-orange-50 text-orange-600 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800"
                : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
            )}
          >
            <Flame
              className={cn(
                "w-4 h-4",
                streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-400"
              )}
            />
            <span className="font-extrabold">{streak}</span>
          </div>

          {/* Score Display */}
          <div
            data-testid="score-display"
            aria-label={`Điểm số: ${score}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700 min-h-[44px]"
          >
            <Trophy className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300 text-sm sm:text-base">
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
};
