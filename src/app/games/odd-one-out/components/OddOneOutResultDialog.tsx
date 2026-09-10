"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Star, RotateCcw, Volume2, ArrowLeft, Flame, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OddOneOutAnswerResult } from "@/types/odd-one-out";

export interface OddOneOutResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  totalQuestions: number;
  history: OddOneOutAnswerResult[];
  bestStreak: number;
  hintsUsed: number;
  onReplay: () => void;
  onSpeakWord?: (word: string) => void;
  className?: string;
}

export const OddOneOutResultDialog: React.FC<OddOneOutResultDialogProps> = ({
  open,
  onOpenChange,
  score,
  totalQuestions,
  history,
  bestStreak,
  hintsUsed,
  onReplay,
  onSpeakWord,
}) => {
  const correctCount = history.filter((h) => h.isCorrect).length;
  const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;
  const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="odd-one-out-result-dialog"
        className="sm:max-w-xl bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader className="flex flex-col items-center text-center gap-1">
          {/* Trophy Header Icon */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-2">
            <Trophy className="w-8 h-8" />
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            HOÀN THÀNH MÀN CHƠI!
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Bạn đã hoàn thành xuất sắc {totalQuestions} câu hỏi phân loại ngữ nghĩa!
          </DialogDescription>

          {/* 1-3 Stars */}
          <div className="flex items-center gap-2 my-2">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300 ${
                  starIdx <= stars
                    ? "text-amber-400 fill-amber-400 filter drop-shadow-md scale-105"
                    : "text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-800"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        {/* Level Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full my-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
              Tổng điểm
            </span>
            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
              {score}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
              Đúng
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {correctCount} / {totalQuestions}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Chuỗi cao nhất
            </span>
            <span className="text-lg font-black text-orange-600 dark:text-orange-400">
              {bestStreak}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              Gợi ý dùng
            </span>
            <span className="text-lg font-black text-slate-700 dark:text-slate-300">
              {hintsUsed}
            </span>
          </div>
        </div>

        {/* Vocabulary Review Cards List */}
        <div className="w-full my-2 space-y-2">
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            Xem lại từ vựng ({history.length}):
          </h4>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {history.map((h, idx) => (
              <div
                key={`${h.oddItem.id}-${idx}`}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-left transition-all"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg sm:text-xl" role="img" aria-label={h.oddItem.word}>
                      {h.oddItem.emoji}
                    </span>
                    <span className="text-base sm:text-lg font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase">
                      {h.oddItem.word}
                    </span>
                    {h.oddItem.phonetic && (
                      <span className="text-xs text-slate-400 font-mono">
                        {h.oddItem.phonetic}
                      </span>
                    )}
                    {h.oddItem.partOfSpeech && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                        {h.oddItem.partOfSpeech}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                        h.isCorrect
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300"
                      }`}
                    >
                      {h.isCorrect ? "Đúng" : "Sai"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {h.oddItem.vietnameseMeaning}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {h.explanationVi}
                  </p>
                </div>

                {/* Pronunciation speaker button */}
                {onSpeakWord && (
                  <button
                    type="button"
                    onClick={() => onSpeakWord(h.oddItem.word)}
                    aria-label={`Phát âm từ ${h.oddItem.word}`}
                    className="min-h-[44px] min-w-[44px] w-11 h-11 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    title={`Phát âm từ ${h.oddItem.word}`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Link
            href="/games"
            className="flex-1 inline-flex items-center justify-center rounded-2xl min-h-[44px] font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Về danh sách trò chơi</span>
          </Link>

          <Button
            type="button"
            onClick={onReplay}
            className="flex-1 rounded-2xl min-h-[44px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Chơi lại</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
