"use client";

import React, { useState } from "react";
import { Volume2, Lightbulb, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WordleTargetWord } from "@/types/wordle";

export interface WordleHintsBarProps {
  hintsUsed: { audio: boolean; meaning: boolean; letter: boolean };
  onAudioHint: () => void;
  onMeaningHint: () => void;
  onLetterHint: () => void;
  targetWord: WordleTargetWord;
  gameStatus: "playing" | "won" | "lost";
  isSpeaking?: boolean;
}

const PART_OF_SPEECH_MAP: Record<string, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
};

export const WordleHintsBar: React.FC<WordleHintsBarProps> = ({
  hintsUsed,
  onAudioHint,
  onMeaningHint,
  onLetterHint,
  targetWord,
  gameStatus,
  isSpeaking = false,
}) => {
  const [showMeaningCard, setShowMeaningCard] = useState(hintsUsed.meaning);

  const isGameOver = gameStatus !== "playing";

  const handleToggleMeaning = () => {
    if (!hintsUsed.meaning) {
      onMeaningHint();
    }
    setShowMeaningCard((prev) => !prev);
  };

  // Sync state if hint used from parent
  React.useEffect(() => {
    if (hintsUsed.meaning) {
      setShowMeaningCard(true);
    }
  }, [hintsUsed.meaning]);

  return (
    <section aria-label="Gợi ý trợ giúp" className="w-full max-w-lg mx-auto flex flex-col gap-2 my-1 px-2">
      <div className="flex items-center justify-between gap-2">
        {/* Tier 1: Audio pronunciation */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAudioHint}
          disabled={isGameOver}
          aria-label="Nghe phát âm từ mục tiêu"
          className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
            isSpeaking
              ? "bg-emerald-100 text-emerald-700 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse"
              : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-slate-800"
          }`}
          title="Nghe phát âm chuẩn (Miễn phí)"
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-bounce" : ""}`} />
          <span>Nghe</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-semibold hidden xs:inline-block">
            0đ
          </span>
        </Button>

        {/* Tier 2: Meaning & Part of Speech */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleToggleMeaning}
          disabled={isGameOver}
          aria-label="Gợi ý nghĩa tiếng Việt"
          className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
            hintsUsed.meaning
              ? "bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200"
              : "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-slate-800"
          }`}
          title="Xem gợi ý nghĩa từ vựng (-10% XP)"
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Gợi ý</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-semibold hidden xs:inline-block">
            -10%
          </span>
        </Button>

        {/* Tier 3: Reveal 1 Letter */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLetterHint}
          disabled={isGameOver || hintsUsed.letter}
          aria-label="Tiết lộ 1 chữ cái"
          className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
            hintsUsed.letter
              ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400"
              : "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 dark:hover:bg-slate-800"
          }`}
          title={
            hintsUsed.letter
              ? "Đã sử dụng gợi ý tiết lộ chữ (tối đa 1 lần)"
              : "Tiết lộ ngẫu nhiên 1 chữ cái (-20% XP)"
          }
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span>Tiết lộ</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 font-semibold hidden xs:inline-block">
            -20%
          </span>
        </Button>
      </div>

      {/* Meaning revealed banner/card */}
      {(hintsUsed.meaning || showMeaningCard) && (
        <div
          data-testid="wordle-meaning-banner"
          className="p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                {PART_OF_SPEECH_MAP[targetWord.partOfSpeech] || targetWord.partOfSpeech}:
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {targetWord.vietnameseMeaning}
              </span>
              {targetWord.phonetic && (
                <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                  {targetWord.phonetic}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 italic">
              {targetWord.exampleSentence}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
