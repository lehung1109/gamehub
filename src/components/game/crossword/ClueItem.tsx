"use client";

import React from "react";
import { CrosswordWord } from "@/types/crossword";
import { useSpeech } from "@/hooks/useSpeech";
import { Volume2 } from "lucide-react";

interface ClueItemProps {
  word: CrosswordWord;
  isActive: boolean;
  onSelect: () => void;
  onSpeak?: (text: string) => void;
}

export const ClueItem: React.FC<ClueItemProps> = ({ word, isActive, onSelect, onSpeak }) => {
  const defaultSpeech = useSpeech({ rate: 0.9, lang: "en-US" });

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSpeak) {
      onSpeak(word.word);
    } else {
      defaultSpeech.speak(word.word);
    }
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
        aria-selected={isActive}
        aria-label={`Từ ${word.number}: ${word.clue}`}
        className="flex items-center gap-2.5 flex-1 text-left cursor-pointer focus:outline-none"
      >
        <span className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
          {word.number}
        </span>
        <div className="text-sm md:text-base font-medium">
          <span>{word.clue}</span>
          <span className="text-xs text-slate-400 ml-1.5 font-mono">({word.word.length} chữ cái)</span>
        </div>
      </button>

      <button
        type="button"
        aria-label={`Phát âm từ số ${word.number}`}
        onClick={handleSpeak}
        className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        <Volume2 className="w-4 h-4" />
      </button>
    </div>
  );
};
