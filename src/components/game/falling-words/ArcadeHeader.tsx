"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Bomb, Heart } from "lucide-react";

interface ArcadeHeaderProps {
  topicId: string;
  onTopicChange: (topicId: string) => void;
  lives: number;
  timeLeft: number;
  score: number;
  combo: number;
  bombsAvailable: number;
  onTriggerBomb: () => void;
}

const TOPICS = [
  { id: "animals", name: "🐾 Động vật" },
  { id: "fruits", name: "🍎 Trái cây" },
  { id: "school", name: "🎒 Trường học" },
  { id: "family", name: "👨‍👩‍👧‍👦 Gia đình" },
  { id: "body-parts", name: "🦶 Cơ thể" },
];

export const ArcadeHeader: React.FC<ArcadeHeaderProps> = ({
  topicId,
  onTopicChange,
  lives,
  timeLeft,
  score,
  combo,
  bombsAvailable,
  onTriggerBomb,
}) => {
  return (
    <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-3xl backdrop-blur-md">
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
            <option key={t.id} value={t.id} className="text-base font-medium bg-slate-900 text-slate-200">
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <div
          aria-label={`Số mạng còn lại: ${lives}`}
          className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]"
        >
          {[1, 2, 3].map((i) => (
            <Heart
              key={i}
              className={`w-6 h-6 ${
                i <= lives ? "text-rose-500 fill-rose-500 animate-pulse" : "text-slate-700"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">⏱️</span>
          <span
            className={`font-mono text-base md:text-lg font-black ${
              timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-emerald-400"
            }`}
          >
            {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-amber-400 font-bold">⚡</span>
          <span className="font-mono text-base md:text-lg font-black text-amber-400">
            {combo}x
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-2 rounded-2xl min-h-[44px]">
          <span className="text-base text-slate-400 font-bold">🏆</span>
          <span className="font-mono text-base md:text-lg font-black text-white">
            {score}
          </span>
        </div>

        <button
          type="button"
          onClick={onTriggerBomb}
          disabled={bombsAvailable === 0}
          aria-label="Kích hoạt Bom"
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-base min-h-[44px] border transition-all ${
            bombsAvailable > 0
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30 cursor-pointer animate-bounce"
              : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
          }`}
        >
          <Bomb className="w-5 h-5" />
          <span>BOM ({bombsAvailable})</span>
        </button>
      </div>
    </header>
  );
};
