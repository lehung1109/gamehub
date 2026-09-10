"use client";

import React from "react";
import { CheckCircle2, XCircle, Volume2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { OddOneOutAnswerResult } from "@/types/odd-one-out";

export interface ExplanationBannerProps {
  result: OddOneOutAnswerResult | null;
  isVisible: boolean;
  onSpeakWord?: (word: string) => void;
  className?: string;
}

export function ExplanationBanner({
  result,
  isVisible,
  onSpeakWord,
  className,
}: ExplanationBannerProps) {
  if (!isVisible || !result) {
    return null;
  }

  const { isCorrect, oddItem, explanationVi, explanationEn } = result;

  return (
    <aside
      aria-label="Giải thích kết quả"
      data-testid="explanation-banner"
      className={cn(
        "w-full max-w-2xl mx-auto rounded-2xl border-2 p-4 sm:p-5 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
        isCorrect
          ? "bg-emerald-50 border-emerald-500 text-emerald-950 dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-emerald-100"
          : "bg-rose-50 border-rose-500 text-rose-950 dark:bg-rose-950/60 dark:border-rose-500 dark:text-rose-100",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-300">
              <XCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
          )}
          <span className="font-extrabold text-base sm:text-lg">
            {isCorrect ? "Chính xác! / Correct!" : "Chưa chính xác! / Not quite!"}
          </span>
        </div>

        {onSpeakWord && (
          <button
            type="button"
            aria-label={`Nghe phát âm ${oddItem.word}`}
            onClick={() => onSpeakWord(oddItem.word)}
            className={cn(
              "min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full p-2.5 transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <Volume2 className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 mt-1 shrink-0 opacity-75" />
          <p className="text-sm sm:text-base font-semibold leading-relaxed">
            {explanationVi}
          </p>
        </div>

        <div className="pl-6 text-xs sm:text-sm italic opacity-85 leading-relaxed">
          {explanationEn}
        </div>
      </div>
    </aside>
  );
}
