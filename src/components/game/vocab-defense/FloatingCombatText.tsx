"use client";

import React from "react";

interface FloatingCombatTextProps {
  feedback: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  } | null;
}

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none text-center animate-bounce">
      <div
        className={`px-5 py-2.5 rounded-2xl font-black text-xl md:text-2xl shadow-2xl border ${
          feedback.isCorrect
            ? "bg-emerald-500/90 text-white border-emerald-300 shadow-emerald-500/50"
            : "bg-rose-600/90 text-white border-rose-400 shadow-rose-600/50"
        }`}
      >
        {feedback.text}
      </div>
    </div>
  );
};
