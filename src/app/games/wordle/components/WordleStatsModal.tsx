"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WordleStats } from "@/types/wordle";

export interface WordleStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: WordleStats;
}

export const WordleStatsModal: React.FC<WordleStatsModalProps> = ({
  open,
  onOpenChange,
  stats,
}) => {
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  // Find max count in distribution to calculate proportional bar widths
  const counts = Object.values(stats.guessDistribution || {});
  const maxCount = Math.max(1, ...counts);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="wordle-stats-modal"
        className="sm:max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl"
      >
        <DialogHeader className="items-center text-center gap-1">
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Thống Kê Trò Chơi
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Thành tích Wordle của bạn trên GameHub
          </DialogDescription>
        </DialogHeader>

        {/* 4 Summary Metric Boxes */}
        <div className="grid grid-cols-4 gap-2 my-3 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {stats.played}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Số ván
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {winRate}%
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Thắng
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="text-xl sm:text-2xl font-black text-amber-500">
              {stats.currentStreak}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Chuỗi hiện tại
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
              {stats.maxStreak}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Chuỗi kỷ lục
            </div>
          </div>
        </div>

        {/* Guess Distribution Bar Chart */}
        <div className="my-2">
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Phân bố lượt đoán
          </h4>
          <div className="space-y-1.5 font-mono text-xs sm:text-sm">
            {[1, 2, 3, 4, 5, 6].map((attempt) => {
              const count = stats.guessDistribution?.[attempt] || 0;
              const widthPct = Math.max(7, Math.round((count / maxCount) * 100));

              return (
                <div key={attempt} className="flex items-center gap-2">
                  <span className="w-3 text-right font-bold text-slate-700 dark:text-slate-300">
                    {attempt}
                  </span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden h-6 flex items-center">
                    <div
                      className={`h-full flex items-center justify-end px-2 text-white font-bold text-xs transition-all duration-500 ${
                        count > 0 ? "bg-emerald-600" : "bg-slate-400/50"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="mt-3">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl min-h-[44px] font-bold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
