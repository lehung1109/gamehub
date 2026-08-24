"use client";

import React from "react";
import { Letter } from "@/types";
import { cn } from "@/lib/utils";

export interface LetterGridProps {
  letters: Letter[];
  selectedLetter?: string | null;
  onSelectLetter?: (letter: Letter) => void;
  correctLetter?: string | null;
  wrongLetter?: string | null;
  disabled?: boolean;
  className?: string;
}

export function LetterGrid({
  letters,
  selectedLetter,
  onSelectLetter,
  correctLetter,
  wrongLetter,
  disabled = false,
  className,
}: LetterGridProps) {
  return (
    <div
      role="region"
      aria-label="Bảng chữ cái A-Z"
      className={cn(
        "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 2xl:grid-cols-13 gap-2.5 sm:gap-3.5 w-full",
        className
      )}
    >
      {letters.map((item) => {
        const isSelected = selectedLetter === item.letter;
        const isCorrect = correctLetter === item.letter;
        const isWrong = wrongLetter === item.letter;

        return (
          <button
            key={item.letter}
            type="button"
            disabled={disabled}
            aria-label={`Chữ ${item.letter} - ${item.exampleWord}`}
            aria-pressed={isSelected}
            onClick={() => onSelectLetter?.(item)}
            className={cn(
              "relative flex flex-col items-center justify-center p-2 sm:p-3 min-h-[64px] sm:min-h-[76px] rounded-2xl border-3 font-extrabold transition-all duration-150 select-none shadow-sm cursor-pointer",
              "hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50",
              // Default state
              !isSelected && !isCorrect && !isWrong && "bg-card text-foreground border-border hover:border-primary/60 hover:bg-primary/5",
              // Selected state
              isSelected && !isCorrect && !isWrong && "bg-primary text-primary-foreground border-primary shadow-md scale-105 ring-4 ring-primary/30",
              // Correct state
              isCorrect && "bg-emerald-700 text-white border-emerald-800 shadow-md ring-4 ring-emerald-300 dark:ring-emerald-800 scale-105",
              // Wrong state
              isWrong && "bg-rose-600 text-white border-rose-700 shadow-md ring-4 ring-rose-300 dark:ring-rose-800",
              // Disabled state
              disabled && "opacity-60 cursor-not-allowed hover:scale-100 active:scale-100"
            )}
          >
            <span className="text-2xl sm:text-3xl tracking-tight leading-none">
              {item.letter}
            </span>
            <span className="text-xs sm:text-sm mt-0.5 opacity-90 leading-tight">
              {item.exampleEmoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
