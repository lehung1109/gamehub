import React from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb, ArrowRight } from "lucide-react";

export interface HangmanHeaderProps {
  topicId: string;
  onTopicChange: (id: string) => void;
  currentIndex: number;
  totalWords: number;
  score: number;
  hintUsed: boolean;
  onUseHint: () => void;
  wordStatus: "playing" | "won" | "lost";
  onNextWord: () => void;
}

const TOPICS = [
  { id: "animals", name: "🐾 Động vật" },
  { id: "fruits", name: "🍎 Trái cây" },
  { id: "school", name: "🎒 Trường học" },
  { id: "family", name: "👨‍👩‍👧‍👦 Gia đình" },
  { id: "body-parts", name: "🦶 Cơ thể" },
];

export const HangmanHeader: React.FC<HangmanHeaderProps> = ({
  topicId,
  onTopicChange,
  currentIndex,
  totalWords,
  score,
  hintUsed,
  onUseHint,
  wordStatus,
  onNextWord,
}) => {
  return (
    <header className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-3xl backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-slate-300 hover:text-white transition-colors bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" /> GameHub
        </Link>

        <select
          value={topicId}
          onChange={(e) => onTopicChange(e.target.value)}
          aria-label="Chọn chủ đề"
          className="bg-slate-800 text-base font-bold text-slate-200 border border-slate-700 rounded-2xl px-3 py-2 min-h-[44px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        {/* Word progress indicator */}
        <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">🎯</span>
          <span className="font-mono text-base md:text-lg font-black text-white">
            Từ {currentIndex + 1}/{totalWords}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">🏆</span>
          <span className="font-mono text-base md:text-lg font-black text-amber-400">
            {score}
          </span>
        </div>

        {/* Hint button or Next word button */}
        {wordStatus === "playing" ? (
          <button
            type="button"
            onClick={onUseHint}
            disabled={hintUsed}
            aria-label="Gợi ý 1 chữ cái (-100 điểm)"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-base min-h-[44px] border transition-all ${
              hintUsed
                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 cursor-pointer"
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span>Gợi ý (-100đ)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextWord}
            aria-label="Từ tiếp theo"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-base min-h-[44px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer animate-pulse"
          >
            <span>Từ tiếp theo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
