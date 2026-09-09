"use client";

import React from "react";
import { Trophy, Star, RotateCcw, Clock } from "lucide-react";

export interface CrosswordCompletionModalProps {
  isOpen: boolean;
  score: number;
  stars: number;
  elapsedSeconds: number;
  hintsUsed: number;
  onNextPuzzle: () => void;
}

export const CrosswordCompletionModal: React.FC<CrosswordCompletionModalProps> = ({
  isOpen,
  score,
  stars,
  elapsedSeconds,
  hintsUsed: _hintsUsed,
  onNextPuzzle,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crossword-modal-title"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 mb-4">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 id="crossword-modal-title" className="text-2xl md:text-3xl font-black text-white">
          HOÀN THÀNH Ô CHỮ!
        </h2>
        <p className="text-slate-400 text-base mt-1">Xuất sắc! Bạn đã giải thành công tất cả các từ.</p>

        {/* Stars */}
        <div className="flex items-center gap-2 my-4">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-8 h-8 ${
                starIdx <= stars
                  ? "text-amber-400 fill-amber-400 filter drop-shadow-md"
                  : "text-slate-700 fill-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full my-4">
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-base text-slate-400 font-bold block">Tổng Điểm</span>
            <span className="text-xl font-black text-white">{score}</span>
          </div>
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-base text-slate-400 font-bold flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-sky-400" /> Thời gian
            </span>
            <span className="text-xl font-black text-sky-400 font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextPuzzle}
          className="mt-4 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold flex items-center justify-center gap-2 text-base shadow-xl shadow-amber-500/20 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" /> Lưới Tiếp Theo
        </button>
      </div>
    </div>
  );
};
