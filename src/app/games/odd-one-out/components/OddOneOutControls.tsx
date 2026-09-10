"use client";

import React from "react";
import { Scissors, Lightbulb, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface OddOneOutControlsProps {
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  onApplyFiftyFifty: () => void;
  onToggleClue: () => void;
  canCheck: boolean;
  isAnswerChecked: boolean;
  isFiftyFiftyUsed: boolean;
  showThemeHint: boolean;
  clueText?: string;
  disabled?: boolean;
  className?: string;
}

export function OddOneOutControls({
  onCheckAnswer,
  onNextQuestion,
  onApplyFiftyFifty,
  onToggleClue,
  canCheck,
  isAnswerChecked,
  isFiftyFiftyUsed,
  showThemeHint,
  clueText,
  disabled = false,
  className,
}: OddOneOutControlsProps) {
  return (
    <div
      data-testid="odd-one-out-controls"
      className={cn(
        "w-full max-w-2xl mx-auto flex flex-col gap-3 sm:gap-4",
        className
      )}
    >
      {/* Theme Clue Display Box */}
      {showThemeHint && clueText && (
        <div
          data-testid="theme-clue-content"
          className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl text-amber-900 dark:text-amber-200 text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1"
        >
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Gợi ý chủ đề: {clueText}</span>
        </div>
      )}

      {/* Action Row: Hint Aids & Main Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* Hint Aids Group */}
        <div className="flex items-center gap-2">
          {/* 50/50 Elimination Hint Button */}
          <Button
            type="button"
            variant="outline"
            data-testid="fifty-fifty-btn"
            aria-label="Trợ giúp 50/50"
            disabled={disabled || isFiftyFiftyUsed || isAnswerChecked}
            onClick={onApplyFiftyFifty}
            className={cn(
              "flex-1 sm:flex-initial h-11 min-h-[44px] min-w-[44px] px-3.5 text-sm font-medium border-border hover:bg-muted active:scale-95 transition-all cursor-pointer",
              isFiftyFiftyUsed && "opacity-50 cursor-not-allowed bg-muted"
            )}
          >
            <Scissors className="w-4 h-4 mr-1.5 stroke-[2.2] text-indigo-500" />
            <span>50/50</span>
            {isFiftyFiftyUsed && (
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                (Đã dùng)
              </span>
            )}
          </Button>

          {/* Theme Clue Hint Button */}
          <Button
            type="button"
            variant="outline"
            data-testid="theme-clue-btn"
            aria-label="Gợi ý chủ đề"
            aria-expanded={showThemeHint}
            disabled={disabled || isAnswerChecked}
            onClick={onToggleClue}
            className={cn(
              "flex-1 sm:flex-initial h-11 min-h-[44px] min-w-[44px] px-3.5 text-sm font-medium border-border hover:bg-muted active:scale-95 transition-all cursor-pointer",
              showThemeHint &&
                "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-600"
            )}
          >
            <Lightbulb
              className={cn(
                "w-4 h-4 mr-1.5 stroke-[2.2]",
                showThemeHint
                  ? "text-amber-500 fill-amber-400"
                  : "text-amber-500"
              )}
            />
            <span>Gợi ý</span>
          </Button>
        </div>

        {/* Primary Action Button: Check Answer or Next Question */}
        <div className="w-full sm:w-auto">
          {!isAnswerChecked ? (
            <Button
              type="button"
              data-testid="check-answer-btn"
              aria-label="Kiểm tra đáp án"
              disabled={!canCheck || disabled}
              onClick={onCheckAnswer}
              className="w-full sm:w-auto h-11 min-h-[44px] min-w-[44px] px-6 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              <span>Kiểm tra đáp án</span>
            </Button>
          ) : (
            <Button
              type="button"
              data-testid="next-question-btn"
              aria-label="Câu hỏi tiếp theo"
              disabled={disabled}
              onClick={onNextQuestion}
              className="w-full sm:w-auto h-11 min-h-[44px] min-w-[44px] px-6 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
