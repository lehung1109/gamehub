"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, BarChart2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WordleHeaderProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  wordLength: 4 | 5 | 6;
  onSelectWordLength: (length: 4 | 5 | 6) => void;
  onOpenStats: () => void;
  onOpenGuide: () => void;
}

const CATEGORIES = [
  { id: "all", label: "Tất cả chủ đề" },
  { id: "animals", label: "🐾 Động vật" },
  { id: "school", label: "🎒 Trường học" },
  { id: "technology", label: "💻 Công nghệ" },
  { id: "daily-life", label: "☀️ Cuộc sống" },
  { id: "fruits", label: "🍎 Trái cây" },
  { id: "workplace", label: "💼 Công sở" },
];

export const WordleHeader: React.FC<WordleHeaderProps> = ({
  selectedCategory,
  onSelectCategory,
  wordLength,
  onSelectWordLength,
  onOpenStats,
  onOpenGuide,
}) => {
  return (
    <header className="w-full max-w-lg mx-auto flex flex-col gap-2.5 px-2 py-2 sm:py-3 border-b border-slate-200 dark:border-slate-800">
      {/* Top bar: Back, Title, Action icons */}
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-h-[40px]"
          aria-label="Quay lại danh sách trò chơi"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Link>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
          Wordle Master
        </h1>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenStats}
            aria-label="Thống kê"
            className="w-10 h-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Xem thống kê"
          >
            <BarChart2 className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenGuide}
            aria-label="Hướng dẫn cách chơi"
            className="w-10 h-10 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Hướng dẫn cách chơi"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Controls row: Category selector & Word length toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs sm:text-sm">
        {/* Category selector dropdown */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="wordle-category-select" className="sr-only">
            Chọn chủ đề từ vựng
          </label>
          <select
            id="wordle-category-select"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm min-h-[36px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Word length segmented pills: 4, 5, 6 */}
        <div
          className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700"
          role="radiogroup"
          aria-label="Độ dài từ"
        >
          {([4, 5, 6] as const).map((len) => {
            const isSelected = wordLength === len;
            return (
              <button
                key={len}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectWordLength(len)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs sm:text-sm transition-all min-h-[32px] cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {len} Chữ
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
