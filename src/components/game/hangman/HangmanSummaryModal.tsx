import React from "react";
import { Star, Volume2, RotateCcw } from "lucide-react";
import { HangmanRoundHistory } from "@/types/hangman";
import { useSpeech } from "@/hooks/useSpeech";
import { calculateRoundStars } from "@/lib/hangman/hangman-utils";

interface HangmanSummaryModalProps {
  isOpen: boolean;
  score: number;
  history: HangmanRoundHistory[];
  onRestart: () => void;
}

export const HangmanSummaryModal: React.FC<HangmanSummaryModalProps> = ({
  isOpen,
  score,
  history,
  onRestart,
}) => {
  const { speak } = useSpeech();

  if (!isOpen) return null;

  const solvedCount = history.filter((h) => h.solved).length;
  const stars = calculateRoundStars(score, solvedCount, history.length || 5);

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
          {solvedCount >= 3
            ? "🎉 Giải Cứu Thành Công!"
            : "🪂 Hoàn Thành Thử Thách!"}
        </h2>

        <p className="text-base text-slate-300 mb-6">
          {solvedCount === 5
            ? "Xuất sắc! Bạn đã giải cứu nhà thám hiểm qua toàn bộ 5 từ vựng!"
            : `Bạn đã đoán đúng ${solvedCount}/5 từ. Cố gắng bảo toàn nhiều bóng bay hơn nhé!`}
        </p>

        {/* Stars */}
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

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div>
            <div className="text-base text-slate-400 font-bold">Tổng điểm</div>
            <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
              {score}
            </div>
          </div>
          <div>
            <div className="text-base text-slate-400 font-bold">Từ đoán đúng</div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
              {solvedCount}/{history.length || 5}
            </div>
          </div>
        </div>

        {/* Word Review List */}
        {history.length > 0 && (
          <div className="w-full mb-6 text-left">
            <h3 className="text-base font-black text-slate-300 mb-2">
              📖 Ôn tập từ vựng ({history.length} từ)
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-base"
                >
                  <div className="flex items-center gap-2">
                    {item.word.emoji && <span className="text-lg">{item.word.emoji}</span>}
                    <span className="font-bold text-white font-mono text-base">
                      {item.word.word}
                    </span>
                    {item.word.phonetic && (
                      <span className="text-slate-400 text-base">
                        {item.word.phonetic}
                      </span>
                    )}
                    <span className="text-slate-300 text-base">
                      — {item.word.clue}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => speak(item.word.word)}
                    aria-label={`Phát âm ${item.word.word}`}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Play Again Button */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer min-h-[44px]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Thử thách vòng mới</span>
        </button>
      </div>
    </div>
  );
};
