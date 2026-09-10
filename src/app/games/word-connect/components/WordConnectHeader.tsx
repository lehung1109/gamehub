"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WordConnectHeaderProps {
  levelNumber: number;
  totalLevels: number;
  difficulty: "easy" | "medium" | "hard";
  theme?: string;
  score: number;
  onSelectLevel: (index: number) => void;
  onOpenGuide: () => void;
  className?: string;
}

const DIFFICULTY_CONFIG: Record<
  "easy" | "medium" | "hard",
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

export const WordConnectHeader: React.FC<WordConnectHeaderProps> = ({
  levelNumber,
  totalLevels,
  difficulty,
  theme,
  score,
  onSelectLevel,
  onOpenGuide,
  className,
}) => {
  const diffConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;

  return (
    <header
      data-testid="word-connect-header"
      className={cn(
        "w-full max-w-lg mx-auto flex flex-col gap-2 px-3 py-2 sm:py-3 select-none",
        "border-b border-slate-200 dark:border-slate-800",
        className
      )}
    >
      {/* Top row: Back link, Game Title, and Guide button */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label="Quay lại danh sách trò chơi"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Quay lại</span>
        </Link>

        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
            Word Connect
          </h1>
          {theme && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-xs">
              {theme}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenGuide}
            aria-label="Hướng dẫn cách chơi"
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
            title="Hướng dẫn cách chơi"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-bar: Level selector / info, Difficulty badge, Score display */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
        {/* Level selector dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="word-connect-level-select" className="sr-only">
            Chọn màn chơi
          </label>
          <select
            id="word-connect-level-select"
            aria-label="Chọn màn chơi"
            value={levelNumber - 1}
            onChange={(e) => onSelectLevel(Number(e.target.value))}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
          >
            {Array.from({ length: totalLevels }, (_, i) => (
              <option key={i} value={i}>
                Màn {i + 1} / {totalLevels}
              </option>
            ))}
          </select>

          {/* Difficulty Badge */}
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-black border uppercase tracking-wider",
              diffConfig.className
            )}
          >
            {diffConfig.label}
          </span>
        </div>

        {/* Score Counter */}
        <div
          data-testid="score-display"
          aria-label={`Điểm số: ${score}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 min-h-[44px]"
        >
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-extrabold text-amber-700 dark:text-amber-300 text-sm sm:text-base">
            {score}
          </span>
        </div>
      </div>
    </header>
  );
};
