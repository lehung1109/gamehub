"use client";

import React from "react";
import { WordConnectWordInfo } from "@/types/word-connect";
import { WordSlotRow } from "./WordSlotRow";
import { cn } from "@/lib/utils";

export interface WordSlotsBoardProps {
  targetWords: WordConnectWordInfo[];
  solvedWords: string[];
  revealedHints: Record<string, number[]>;
  onSpeakWord?: (word: string) => void;
  className?: string;
}

export function WordSlotsBoard({
  targetWords,
  solvedWords,
  revealedHints,
  onSpeakWord,
  className,
}: WordSlotsBoardProps) {
  const solvedUpperSet = new Set(solvedWords.map((w) => w.toUpperCase()));

  return (
    <div
      data-testid="word-slots-board"
      className={cn(
        "w-full flex flex-col items-center justify-center gap-2 sm:gap-3 py-3 px-2 sm:px-4 max-w-lg mx-auto min-h-[160px]",
        className
      )}
    >
      {targetWords.map((tw) => {
        const isSolved = solvedUpperSet.has(tw.word.toUpperCase());
        const hints = revealedHints[tw.word] || revealedHints[tw.word.toUpperCase()] || [];

        return (
          <WordSlotRow
            key={tw.word}
            targetWord={tw}
            isSolved={isSolved}
            revealedLetterIndices={hints}
            onSpeakWord={onSpeakWord}
          />
        );
      })}
    </div>
  );
}
