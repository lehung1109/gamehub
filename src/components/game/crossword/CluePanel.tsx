"use client";

import React from "react";
import { CrosswordWord } from "@/types/crossword";
import { ClueItem } from "./ClueItem";
import { useSpeech } from "@/hooks/useSpeech";
import { ArrowRight, ArrowDown } from "lucide-react";

interface CluePanelProps {
  words: CrosswordWord[];
  activeWordId: string;
  onSelectWord: (wordId: string) => void;
}

export const CluePanel: React.FC<CluePanelProps> = ({
  words,
  activeWordId,
  onSelectWord,
}) => {
  const { speak } = useSpeech({ rate: 0.9, lang: "en-US" });
  const acrossWords = words.filter((w) => w.direction === "across");
  const downWords = words.filter((w) => w.direction === "down");

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-5 shadow-2xl max-h-[500px] overflow-y-auto">
      {/* Across */}
      <div>
        <div className="flex items-center gap-2 text-base font-bold text-amber-400 uppercase tracking-wider mb-2.5">
          <ArrowRight className="w-4 h-4" /> Hàng ngang (Across)
        </div>
        <div className="space-y-2">
          {acrossWords.map((word) => (
            <ClueItem
              key={word.id}
              word={word}
              isActive={activeWordId === word.id}
              onSelect={() => onSelectWord(word.id)}
              onSpeak={speak}
            />
          ))}
        </div>
      </div>

      {/* Down */}
      <div>
        <div className="flex items-center gap-2 text-base font-bold text-sky-400 uppercase tracking-wider mb-2.5">
          <ArrowDown className="w-4 h-4" /> Hàng dọc (Down)
        </div>
        <div className="space-y-2">
          {downWords.map((word) => (
            <ClueItem
              key={word.id}
              word={word}
              isActive={activeWordId === word.id}
              onSelect={() => onSelectWord(word.id)}
              onSpeak={speak}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
