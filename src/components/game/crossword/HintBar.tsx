"use client";

import React from "react";
import { Lightbulb, BookOpen, Volume2 } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";

interface HintBarProps {
  activeWord: { word: string } | null;
  onRevealLetter: () => void;
  onRevealWord: () => void;
  disabled: boolean;
}

export const HintBar: React.FC<HintBarProps> = ({
  activeWord,
  onRevealLetter,
  onRevealWord,
  disabled,
}) => {
  const { speak } = useSpeech({ rate: 0.9, lang: "en-US" });

  const handleSpeak = () => {
    if (activeWord) speak(activeWord.word);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
      <button
        type="button"
        disabled={disabled || !activeWord}
        onClick={handleSpeak}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-sm md:text-base font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Volume2 className="w-4 h-4" /> Nghe Từ (Miễn phí)
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={onRevealLetter}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-sm md:text-base font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lightbulb className="w-4 h-4" /> Gợi ý 1 chữ (-10đ)
      </button>

      <button
        type="button"
        disabled={disabled || !activeWord}
        onClick={onRevealWord}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-sm md:text-base font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BookOpen className="w-4 h-4" /> Mở cả từ (-30đ)
      </button>
    </div>
  );
};
