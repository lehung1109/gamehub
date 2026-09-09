"use client";

import React, { useEffect } from "react";
import { CrosswordWord } from "@/types/crossword";
import { CheckCircle2, X, Sparkles } from "lucide-react";
import { playWordSolvedSound } from "@/lib/crossword/sound";

export interface WordSolvedToastProps {
  word: CrosswordWord | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export const WordSolvedToast: React.FC<WordSolvedToastProps> = ({
  word,
  onDismiss,
  autoDismissMs = 2500,
}) => {
  useEffect(() => {
    if (!word) return;

    playWordSolvedSound();

    const timer = setTimeout(() => {
      onDismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [word, onDismiss, autoDismissMs]);

  if (!word) return null;

  const directionText = word.direction === "across" ? "Hàng ngang" : "Hàng dọc";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 border-2 border-emerald-500 text-slate-100 rounded-2xl shadow-2xl shadow-emerald-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-auto max-w-sm w-[90vw]"
    >
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
        <CheckCircle2 className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{directionText} #{word.number}</span>
        </div>
        <div className="text-sm font-black text-white truncate">
          Chính xác: <span className="text-emerald-300 font-mono tracking-wider">{word.word}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Đóng"
        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
