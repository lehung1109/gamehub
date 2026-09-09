import React from "react";
import { LetterStatus } from "@/types/wordle";

export interface WordleTileProps {
  char?: string;
  status?: LetterStatus;
  index?: number;
  isRevealedHint?: boolean;
  isWinning?: boolean;
  isCurrentRow?: boolean;
  className?: string;
}

export const WordleTile: React.FC<WordleTileProps> = ({
  char = "",
  status,
  index = 0,
  isRevealedHint = false,
  isWinning = false,
  isCurrentRow = false,
  className = "",
}) => {
  const displayChar = char.toUpperCase();
  const isEvaluated = status === "correct" || status === "present" || status === "absent";
  const hasChar = displayChar.length > 0;

  // Compute status styles
  let statusClasses = "";
  if (isEvaluated) {
    switch (status) {
      case "correct":
        statusClasses = "bg-emerald-600 text-white border-2 border-emerald-600 shadow-sm";
        break;
      case "present":
        statusClasses = "bg-amber-500 text-white border-2 border-amber-500 shadow-sm";
        break;
      case "absent":
        statusClasses = "bg-slate-500 dark:bg-slate-700 text-white border-2 border-slate-500 dark:border-slate-700 shadow-sm";
        break;
    }
  } else if (isRevealedHint) {
    statusClasses =
      "border-2 border-dashed border-amber-400 dark:border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400";
  } else if (hasChar) {
    statusClasses =
      "border-2 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 animate-pop shadow-xs";
  } else {
    statusClasses =
      "border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500";
  }

  // Animation classes and delays
  let animClass = "";
  let animDelay = "";

  if (isWinning) {
    animClass = "animate-wordle-bounce";
    animDelay = `${index * 100}ms`;
  } else if (isEvaluated) {
    animClass = "animate-wordle-flip";
    animDelay = `${index * 150}ms`;
  }

  const computedStatus = status || (isRevealedHint ? "present" : hasChar ? "tbd" : "empty");

  return (
    <div
      data-testid={`wordle-tile-${index}`}
      data-char={displayChar}
      data-status={computedStatus}
      {...(isRevealedHint ? { "data-hint": "true" } : {})}
      style={animDelay ? { animationDelay: animDelay } : undefined}
      className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl md:text-3xl select-none transition-colors duration-200 ${statusClasses} ${animClass} ${className}`}
      aria-label={
        isRevealedHint
          ? `${displayChar}, gợi ý`
          : status === "correct"
          ? `${displayChar}, chính xác`
          : status === "present"
          ? `${displayChar}, vị trí khác`
          : status === "absent"
          ? `${displayChar}, không có`
          : displayChar || "Ô trống"
      }
    >
      {displayChar}
      {isRevealedHint && (
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900"
          title="Ký tự gợi ý"
        />
      )}
    </div>
  );
};
