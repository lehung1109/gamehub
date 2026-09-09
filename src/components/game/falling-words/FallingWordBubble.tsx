import React from "react";
import { FallingWord } from "@/types/falling-words";

interface FallingWordBubbleProps {
  word: FallingWord;
}

export const FallingWordBubble: React.FC<FallingWordBubbleProps> = ({ word }) => {
  const typedPart = word.word.slice(0, word.typedIndex);
  const remainingPart = word.word.slice(word.typedIndex);

  const leftPercent = 12.5 + word.lane * 25;

  let specialStyle = "border-slate-700 bg-slate-900/90 text-slate-100 shadow-lg";
  let badge: React.ReactNode = null;

  if (word.specialType === "double_score") {
    specialStyle = "border-amber-400 bg-amber-950/80 text-amber-100 shadow-amber-500/30";
    badge = <span className="text-base font-black text-amber-400 ml-1">2x⭐</span>;
  } else if (word.specialType === "heal_life") {
    specialStyle = "border-pink-400 bg-pink-950/80 text-pink-100 shadow-pink-500/30";
    badge = <span className="text-base font-black text-pink-400 ml-1">+1💖</span>;
  } else if (word.specialType === "slow_freeze") {
    specialStyle = "border-cyan-400 bg-cyan-950/80 text-cyan-100 shadow-cyan-500/30";
    badge = <span className="text-base font-black text-cyan-400 ml-1">❄️</span>;
  }

  const targetRing = word.isTargeted
    ? "ring-4 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-105"
    : "";

  return (
    <div
      data-testid={`falling-word-${word.id}`}
      style={{
        left: `${leftPercent}%`,
        top: `${word.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      className={`absolute transition-transform duration-75 flex flex-col items-center px-4 py-2.5 rounded-2xl border-2 backdrop-blur-md select-none pointer-events-none z-10 ${specialStyle} ${targetRing}`}
    >
      <div className="flex items-center gap-1.5 font-mono text-lg md:text-xl font-black tracking-wider">
        {word.emoji && <span className="text-xl mr-1">{word.emoji}</span>}
        <span className="text-emerald-400 font-black underline decoration-2 underline-offset-4">
          {typedPart}
        </span>
        <span className="text-slate-100">{remainingPart}</span>
        {badge}
      </div>

      <div className="text-base font-bold text-slate-300 mt-0.5 truncate max-w-[180px]">
        {word.clue}
      </div>
    </div>
  );
};
