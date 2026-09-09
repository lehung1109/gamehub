"use client";

import React from "react";
import { CrosswordWord } from "@/types/crossword";
import { Volume2 } from "lucide-react";

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

  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
        isActive
          ? "bg-amber-500/20 border-amber-500/50 text-white shadow-md shadow-amber-500/10"
          : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isActive}
        aria-label={`Từ ${word.number}: ${word.clue}`}
        className="flex items-center gap-2.5 flex-1 min-h-[44px] text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
      >
        <span className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center font-mono font-bold text-base text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
          {word.number}
        </span>
        <div className="text-base font-medium">
          <span>{word.clue}</span>
          <span className="text-base text-slate-400 ml-1.5 font-mono">({word.word.length} chữ cái)</span>
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
