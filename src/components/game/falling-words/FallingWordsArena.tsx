import React from "react";
import { FallingWord } from "@/types/falling-words";
import { FallingWordBubble } from "./FallingWordBubble";

interface FallingWordsArenaProps {
  fallingWords: FallingWord[];
  isFrozen: boolean;
}

export const FallingWordsArena: React.FC<FallingWordsArenaProps> = ({
  fallingWords,
  isFrozen,
}) => {
  return (
    <div
      role="region"
      aria-label="Khu vực từ rơi"
      className="relative w-full h-[520px] md:h-[580px] bg-slate-950/90 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm select-none"
    >
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none divide-x divide-slate-800/40">
        <div className="h-full" />
        <div className="h-full" />
        <div className="h-full" />
        <div className="h-full" />
      </div>

      {isFrozen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-cyan-900/80 border border-cyan-400 text-cyan-200 px-4 py-1.5 rounded-full text-base font-black animate-pulse flex items-center gap-2">
          ❄️ ĐÓNG BĂNG THỜI GIAN
        </div>
      )}

      {fallingWords.map((word) => (
        <FallingWordBubble key={word.id} word={word} />
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-950/80 via-red-900/30 to-transparent border-t border-red-500/40 flex items-center justify-center pointer-events-none">
        <span className="text-base font-black tracking-widest text-red-400/90 uppercase animate-pulse">
          ⚠️ Danger Zone ⚠️
        </span>
      </div>
    </div>
  );
};
