"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { WordConnectWordInfo } from "@/types/word-connect";
import { cn } from "@/lib/utils";

export interface WordSlotRowProps {
  targetWord: WordConnectWordInfo;
  isSolved: boolean;
  revealedLetterIndices?: number[];
  onSpeakWord?: (word: string) => void;
  className?: string;
}

export function WordSlotRow({
  targetWord,
  isSolved,
  revealedLetterIndices = [],
  onSpeakWord,
  className,
}: WordSlotRowProps) {
  const letters = targetWord.word.split("");

  const handleRowClick = () => {
    if (isSolved && onSpeakWord) {
      onSpeakWord(targetWord.word);
    }
  };

  return (
    <div
      data-testid={`word-slot-row-${targetWord.word}`}
      onClick={handleRowClick}
      className={cn(
        "inline-flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl transition-all duration-300",
        isSolved && "cursor-pointer hover:opacity-95",
        className
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        {letters.map((char, index) => {
          const isRevealed = revealedLetterIndices.includes(index);
          const showChar = isSolved || isRevealed;

          return (
            <div
              key={index}
              data-testid={`slot-tile-${targetWord.word}-${index}`}
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-lg sm:text-xl uppercase select-none transition-all duration-300",
                isSolved
                  ? "bg-emerald-500 text-white font-black border-2 border-emerald-600 shadow-md animate-pop"
                  : isRevealed
                  ? "bg-amber-400 text-amber-950 font-black border-2 border-amber-500 shadow-sm"
                  : "border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50 shadow-inner"
              )}
            >
              {showChar ? char.toUpperCase() : ""}
            </div>
          );
        })}
      </div>

      {isSolved && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSpeakWord?.(targetWord.word);
          }}
          aria-label={`Phát âm từ ${targetWord.word}`}
          data-testid={`speak-word-${targetWord.word}`}
          className="ml-1 sm:ml-2 p-2 rounded-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 active:scale-95 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
