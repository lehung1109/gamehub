"use client";

import React from "react";
import { CrosswordCell } from "@/types/crossword";

interface CrosswordCellItemProps {
  cell: CrosswordCell;
  isSelected: boolean;
  isInActiveWord: boolean;
  isSolved?: boolean;
  onSelect: () => void;
}

export const CrosswordCellItem: React.FC<CrosswordCellItemProps> = ({
  cell,
  isSelected,
  isInActiveWord,
  isSolved = false,
  onSelect,
}) => {
  if (cell.isBlocked) {
    return <div className="w-full aspect-square bg-slate-950/80 rounded-lg border border-slate-900" />;
  }

  const isRevealed = cell.isRevealed;

  return (
    <button
      type="button"
      data-testid={`cell-${cell.row}-${cell.col}`}
      onClick={onSelect}
      aria-pressed={isSelected}
      data-selected={isSelected}
      data-solved={isSolved}
      aria-label={`Row ${cell.row + 1}, Column ${cell.col + 1}${cell.clueNumber ? `, Clue ${cell.clueNumber}` : ""}${cell.userChar ? `, ${cell.userChar}` : ""}${isSolved ? ", Solved" : ""}`}
      className={`relative w-full aspect-square flex items-center justify-center font-black text-lg md:text-xl rounded-lg border transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
        isSelected
          ? "bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 scale-105 z-10"
          : isInActiveWord && isSolved
          ? "bg-emerald-600/40 text-emerald-100 border-emerald-400 shadow-sm shadow-emerald-500/20"
          : isInActiveWord
          ? "bg-indigo-600/30 text-white border-indigo-500/60"
          : isSolved
          ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"
          : "bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500"
      }`}
    >
      {cell.clueNumber && (
        <span
          className={`absolute top-0.5 left-1 text-base font-mono font-bold leading-none ${
            isSelected ? "text-slate-950" : "text-slate-400"
          }`}
        >
          {cell.clueNumber}
        </span>
      )}
      <span className={isRevealed && !isSelected ? "text-amber-300" : ""}>{cell.userChar}</span>
    </button>
  );
};
