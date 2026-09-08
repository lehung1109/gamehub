"use client";

import React, { useEffect } from "react";
import { MissedQuestionReview } from "@/types/vocab-defense";
import { Trophy, Skull, Star, RotateCcw, Volume2, BookOpen } from "lucide-react";

export interface BattleReviewModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  stars: number;
  missedQuestions: MissedQuestionReview[];
  onPlayAgain: () => void;
}

export const BattleReviewModal: React.FC<BattleReviewModalProps> = ({
  isOpen,
  isVictory,
  score,
  stars,
  missedQuestions,
  onPlayAgain,
}) => {
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const playAudio = (word: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center max-h-[90vh] overflow-y-auto"
      >
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl ${
            isVictory
              ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-amber-500/20"
              : "bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-500/20"
          }`}
        >
          {isVictory ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
        </div>

        <h2 id="review-modal-title" className="text-2xl md:text-3xl font-black text-white">
          {isVictory ? "VICTORY!" : "DEFEAT"}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isVictory
            ? "Chúc mừng bạn đã bảo vệ vương quốc thành công!"
            : "Đừng nản lòng! Hãy ôn lại các câu hỏi và thử lại nhé!"}
        </p>

        {/* Stars */}
        {isVictory && (
          <div className="flex items-center gap-2 my-4">
            {[1, 2, 3].map((starIndex) => (
              <Star
                key={starIndex}
                className={`w-8 h-8 ${
                  starIndex <= stars
                    ? "text-amber-400 fill-amber-400 filter drop-shadow-md"
                    : "text-slate-700 fill-slate-800"
                }`}
              />
            ))}
          </div>
        )}

        {/* Score & XP */}
        <div className="grid grid-cols-2 gap-4 w-full my-4">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-bold block">Tổng Điểm</span>
            <span className="text-2xl font-black text-white">{score}</span>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 font-bold block">XP Nhận Được</span>
            <span className="text-2xl font-black text-amber-400">+{Math.round(score / 5)} XP</span>
          </div>
        </div>

        {/* Missed Questions Review */}
        {missedQuestions.length > 0 && (
          <div className="w-full text-left my-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Ôn tập {missedQuestions.length} câu đã sai:
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {missedQuestions.map((item, idx) => (
                <div
                  key={item.question.id ? `${item.question.id}-${idx}` : idx}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-white mb-1">
                    <span>{item.question.targetWord}</span>
                    <button
                      type="button"
                      aria-label={`Phát âm ${item.question.targetWord}`}
                      onClick={() => playAudio(item.question.targetWord)}
                      className="p-1 rounded bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-400">{item.question.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-5 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold flex items-center justify-center gap-2 text-sm shadow-xl shadow-amber-500/20 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Chơi Lại
        </button>
      </div>
    </div>
  );
};
