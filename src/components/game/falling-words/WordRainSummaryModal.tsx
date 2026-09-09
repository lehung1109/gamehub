"use client";

import React from "react";
import { Star, Volume2, RotateCcw } from "lucide-react";
import { PoppedWordSummary } from "@/types/falling-words";
import { useSpeech } from "@/hooks/useSpeech";

export interface WordRainSummaryModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  combo: number;
  lives: number;
  wordsPopped: PoppedWordSummary[];
  onRestart: () => void;
}

export const WordRainSummaryModal: React.FC<WordRainSummaryModalProps> = ({
  isOpen,
  isVictory,
  score,
  combo,
  lives,
  wordsPopped,
  onRestart,
}) => {
  const { speak } = useSpeech();

  if (!isOpen) return null;

  const stars =
    score >= 1200 && lives >= 3 ? 3 : score >= 700 && lives >= 1 ? 2 : score > 0 ? 1 : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center">
        <h2
          id="summary-title"
          className="text-2xl md:text-3xl font-black text-white mb-2"
        >
          {isVictory ? "🎉 Hoàn Thành Thử Thách!" : "💥 Hết Mạng!"}
        </h2>

        <p className="text-base text-slate-300 mb-6">
          {isVictory
            ? "Tuyệt vời! Bạn đã vượt qua cơn mưa từ vựng 60 giây!"
            : "Bạn đã chiến đấu hết mình! Hãy thử lại để đạt điểm cao hơn nhé."}
        </p>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-10 h-10 ${
                starIndex <= stars
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="w-full grid grid-cols-3 gap-3 mb-6 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="text-base text-slate-400 font-bold">Điểm số</div>
            <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
              {score}
            </div>
          </div>
          <div>
            <div className="text-base text-slate-400 font-bold">Max Combo</div>
            <div className="text-xl md:text-2xl font-black text-amber-400 font-mono">
              {combo}x
            </div>
          </div>
          <div>
            <div className="text-base text-slate-400 font-bold">Đã gõ</div>
            <div className="text-xl md:text-2xl font-black text-white font-mono">
              {wordsPopped.length}
            </div>
          </div>
        </div>

        {wordsPopped.length > 0 && (
          <div className="w-full mb-6 text-left">
            <h3 className="text-base font-black text-slate-300 mb-2">
              📖 Từ vựng đã bắn trúng ({wordsPopped.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {wordsPopped.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-base"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.emoji && <span className="text-lg">{item.emoji}</span>}
                    <span className="font-bold text-white font-mono">
                      {item.word}
                    </span>
                    {item.phonetic && (
                      <span className="text-slate-400 text-base">
                        {item.phonetic}
                      </span>
                    )}
                    <span className="text-slate-300 text-base">
                      — {item.clue}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(item.word)}
                    aria-label={`Phát âm ${item.word}`}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer min-h-[44px]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Chơi lại ngay</span>
        </button>
      </div>
    </div>
  );
};
