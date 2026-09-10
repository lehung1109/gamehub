"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SemanticWordItem } from "@/types/odd-one-out";

export interface SemanticWordCardProps {
  item: SemanticWordItem;
  index: number;
  isSelected: boolean;
  isEliminated: boolean;
  isAnswerChecked: boolean;
  isOddItem?: boolean;
  onSelect: (id: string) => void;
  onSpeak?: (word: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SemanticWordCard({
  item,
  index,
  isSelected,
  isEliminated,
  isAnswerChecked,
  isOddItem,
  onSelect,
  onSpeak,
  disabled = false,
  className,
}: SemanticWordCardProps) {
  const isOdd = isOddItem !== undefined ? isOddItem : item.isOdd;
  const isIncorrectSelection = isAnswerChecked && isSelected && !isOdd;
  const isCorrectOdd = isAnswerChecked && isOdd;

  const isInteractive = !disabled && !isEliminated && !isAnswerChecked;

  const handleClick = () => {
    if (!isInteractive) return;
    onSelect(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isInteractive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(item.id);
    }
  };

  const handleSpeakClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isEliminated) return;
    onSpeak?.(item.word);
  };

  return (
    <div
      role="button"
      tabIndex={isInteractive ? 0 : -1}
      aria-pressed={isSelected}
      aria-disabled={!isInteractive}
      data-testid={`semantic-card-${item.id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 select-none shadow-sm outline-none text-left",
        // Interactive normal state
        isInteractive &&
          "cursor-pointer bg-card border-border hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-indigo-500",
        // Selected state before evaluation
        isSelected &&
          !isAnswerChecked &&
          "ring-4 ring-indigo-500 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-400 dark:ring-indigo-400 shadow-md",
        // Eliminated state (50/50)
        isEliminated &&
          "opacity-35 line-through pointer-events-none scale-95 grayscale bg-muted/60 border-dashed border-muted-foreground/30 cursor-not-allowed",
        // Post-answer evaluation states
        isAnswerChecked &&
          (isCorrectOdd
            ? "bg-emerald-50 border-emerald-500 dark:bg-emerald-950/60 dark:border-emerald-400 shadow-md"
            : isIncorrectSelection
            ? "bg-rose-50 border-rose-500 dark:bg-rose-950/60 dark:border-rose-400 animate-shake shadow-md"
            : "opacity-60 bg-card border-border cursor-default"),
        disabled && !isEliminated && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Top Header: Shortcut badge and Audio Speaker Button */}
      <div className="flex items-center justify-between w-full mb-3">
        <span
          className={cn(
            "inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-md border",
            isSelected && !isAnswerChecked
              ? "bg-indigo-600 text-white border-indigo-600"
              : isCorrectOdd
              ? "bg-emerald-600 text-white border-emerald-600"
              : isIncorrectSelection
              ? "bg-rose-600 text-white border-rose-600"
              : "bg-muted text-muted-foreground border-border"
          )}
        >
          [{index + 1}]
        </span>

        {/* Audio speaker button with accessible min 44px touch target */}
        <button
          type="button"
          aria-label={`Nghe phát âm ${item.word}`}
          onClick={handleSpeakClick}
          disabled={disabled || isEliminated}
          className={cn(
            "min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-full p-2.5 transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isEliminated && "pointer-events-none opacity-40 cursor-not-allowed"
          )}
        >
          <Volume2 className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Center Content: Large Emoji & English Word */}
      <div className="flex flex-col items-center text-center my-2">
        <span
          className="text-5xl sm:text-6xl mb-2 transition-transform duration-200 group-hover:scale-105"
          role="img"
          aria-label={item.word}
        >
          {item.emoji}
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {item.word}
        </h3>
        <span className="text-xs sm:text-sm font-mono text-muted-foreground mt-0.5">
          {item.phonetic}
        </span>
      </div>

      {/* Bottom Footer: Meaning and Part of Speech */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/60 w-full">
        <p className="text-sm sm:text-base font-medium text-foreground truncate">
          {item.vietnameseMeaning}
        </p>
        <Badge
          variant="secondary"
          className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 shrink-0"
        >
          {item.partOfSpeech}
        </Badge>
      </div>
    </div>
  );
}
