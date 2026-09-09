"use client";

import React from "react";
import { CrosswordWord } from "@/types/crossword";
import { Volume2, Check } from "lucide-react";

interface ClueItemProps {
  word: CrosswordWord;
  isActive: boolean;
  onSelect: () => void;
  onSpeak: (text: string) => void;
}

export const ClueItem: React.FC<ClueItemProps> = ({ word, isActive, onSelect, onSpeak }) => {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(word.word);
  };

  const isSolved = Boolean(word.isSolved);

  return (
    <div
      data-solved={isSolved}
      className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
        isActive && isSolved
          ? "bg-emerald-500/25 border-emerald-400 text-white shadow-md shadow-emerald-500/10"
          : isActive
          ? "bg-amber-500/20 border-amber-500/50 text-white shadow-md shadow-amber-500/10"
          : isSolved
          ? "bg-emerald-950/25 border-emerald-500/40 text-emerald-200/90 hover:bg-emerald-950/40 hover:border-emerald-500/60"
          : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isActive}
        aria-label={`Từ ${word.number}: ${word.clue}${isSolved ? " (Đã giải)" : ""}`}
        className="flex items-center gap-2.5 flex-1 min-h-[44px] text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
      >
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-base transition-colors ${
            isSolved
              ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
              : "bg-slate-700 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950"
          }`}
        >
          {word.number}
        </span>
        <div className="text-base font-medium flex flex-wrap items-center">
          <span className={isSolved ? "text-slate-200" : ""}>{word.clue}</span>
          <span className="text-base text-slate-400 ml-1.5 font-mono">({word.word.length} chữ cái)</span>
          {isSolved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md ml-2 border border-emerald-500/30">
              <Check className="w-3 h-3" /> Đã xong
            </span>
          )}
        </div>
      </button>

      <button
        type="button"
        aria-label={`Phát âm từ số ${word.number}`}
        onClick={handleSpeak}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg bg-slate-700/60 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        <Volume2 className="w-5 h-5" />
      </button>
    </div>
  );
};
