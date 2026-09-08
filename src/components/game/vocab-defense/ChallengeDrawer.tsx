"use client";

import React, { useEffect } from "react";
import { ChallengeQuestion } from "@/types/vocab-defense";
import { Volume2 } from "lucide-react";

interface ChallengeDrawerProps {
  question: ChallengeQuestion;
  onSelectAnswer: (index: number) => void;
  disabled: boolean;
}

export const ChallengeDrawer: React.FC<ChallengeDrawerProps> = ({
  question,
  onSelectAnswer,
  disabled,
}) => {
  const playAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.targetWord);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (question.type === "SHIELD") {
      playAudio();
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [question.id, question.type]);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              {question.type === "ATTACK" && "⚔️ Thử thách Từ vựng"}
              {question.type === "SHIELD" && "🛡️ Thử thách Luyện nghe"}
              {question.type === "ULTIMATE" && "⚡ Thử thách Ngữ pháp"}
            </span>
            {question.phonetic && (
              <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                {question.phonetic}
              </span>
            )}
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white mt-1">{question.prompt}</h2>
        </div>

        {question.type === "SHIELD" && (
          <button
            type="button"
            onClick={playAudio}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-sm font-bold transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Nghe lại âm thanh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAnswer(idx)}
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 transition-all text-left text-white font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="text-sm md:text-base">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
