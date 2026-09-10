"use client";

import React from "react";
import { Shuffle, Lightbulb, Delete, RotateCcw, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WordConnectControlsProps {
  currentInput: string;
  onShuffle: () => void;
  onApplyHint: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onSubmit: () => void;
  bonusWordsCount?: number;
  onOpenBonusModal?: () => void;
  disabled?: boolean;
  errorShake?: boolean;
  className?: string;
}

export function WordConnectControls({
  currentInput,
  onShuffle,
  onApplyHint,
  onClear,
  onBackspace,
  onSubmit,
  bonusWordsCount = 0,
  onOpenBonusModal,
  disabled = false,
  errorShake = false,
  className,
}: WordConnectControlsProps) {
  const isInputEmpty = !currentInput || currentInput.trim().length === 0;

  return (
    <div
      data-testid="word-connect-controls"
      className={cn("w-full flex flex-col items-center gap-3 select-none", className)}
    >
      {/* Current word input pill display */}
      <div
        data-testid="current-input-display"
        className={cn(
          "min-w-[140px] h-12 min-h-[48px] px-6 py-2 rounded-full flex items-center justify-center",
          "text-xl sm:text-2xl font-black uppercase tracking-widest transition-all duration-200",
          errorShake
            ? "animate-shake bg-red-100 text-red-700 border-2 border-red-400 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700"
            : isInputEmpty
            ? "bg-slate-100/70 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700"
            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-2 border-amber-400 dark:border-amber-500 shadow-md"
        )}
      >
        {isInputEmpty ? <span className="opacity-40 font-mono tracking-normal">•••</span> : currentInput}
      </div>

      {/* Action controls row */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {/* Shuffle Button */}
        <button
          type="button"
          data-testid="shuffle-button"
          aria-label="Xáo trộn chữ cái"
          disabled={disabled}
          onClick={onShuffle}
          className={cn(
            "min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm",
            "transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Hint Button */}
        <button
          type="button"
          data-testid="hint-button"
          aria-label="Gợi ý chữ cái"
          disabled={disabled}
          onClick={onApplyHint}
          className={cn(
            "min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
            "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50",
            "border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-sm",
            "transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <Lightbulb className="w-5 h-5" />
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          data-testid="backspace-button"
          aria-label="Xóa chữ cái vừa chọn"
          disabled={disabled || isInputEmpty}
          onClick={onBackspace}
          className={cn(
            "min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm",
            "transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400",
            (disabled || isInputEmpty) && "opacity-40 cursor-not-allowed pointer-events-none"
          )}
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Clear Button */}
        <button
          type="button"
          data-testid="clear-button"
          aria-label="Xóa toàn bộ chữ đã chọn"
          disabled={disabled || isInputEmpty}
          onClick={onClear}
          className={cn(
            "min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
            "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700",
            "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm",
            "transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400",
            (disabled || isInputEmpty) && "opacity-40 cursor-not-allowed pointer-events-none"
          )}
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Submit Button */}
        <button
          type="button"
          data-testid="submit-button"
          aria-label="Gửi từ"
          disabled={disabled || isInputEmpty}
          onClick={onSubmit}
          className={cn(
            "min-w-[44px] min-h-[44px] w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center",
            "bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 shadow-md",
            "transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400",
            (disabled || isInputEmpty) && "opacity-40 cursor-not-allowed pointer-events-none"
          )}
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Bonus Jar Button */}
        {(onOpenBonusModal || bonusWordsCount !== undefined) && (
          <button
            type="button"
            data-testid="bonus-jar-button"
            aria-label="Hũ từ thưởng"
            disabled={disabled}
            onClick={onOpenBonusModal}
            className={cn(
              "min-w-[44px] min-h-[44px] px-3.5 h-11 sm:h-12 rounded-full flex items-center justify-center gap-1.5",
              "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50",
              "border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-sm",
              "transition-all active:scale-95 cursor-pointer font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-400",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{bonusWordsCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}
