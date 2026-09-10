"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Volume2, Share2, ArrowRight, Check, Sparkles } from "lucide-react";
import { WordleTargetWord } from "@/types/wordle";
import { evaluateWordleGuess } from "@/lib/wordle/evaluator";

export interface WordleResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: "won" | "lost";
  targetWord: WordleTargetWord;
  guesses: string[];
  stars: number;
  hintsUsed: { audio: boolean; meaning: boolean; letter: boolean };
  onNextWord: () => void;
  onPronounce: () => void;
}

const PART_OF_SPEECH_MAP: Record<string, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
};

export const WordleResultDialog: React.FC<WordleResultDialogProps> = ({
  open,
  onOpenChange,
  status,
  targetWord,
  guesses,
  stars,
  hintsUsed,
  onNextWord,
  onPronounce,
}) => {
  const [copied, setCopied] = useState(false);

  const isWon = status === "won";

  // Calculate XP based on stars and hint deductions
  const calculateXp = (): number => {
    if (!isWon) return 10; // Participation XP
    const base = stars === 3 ? 100 : stars === 2 ? 75 : 50;
    let multiplier = 1.0;
    if (hintsUsed.meaning) multiplier -= 0.1;
    if (hintsUsed.letter) multiplier -= 0.2;
    return Math.max(10, Math.round(base * multiplier));
  };

  const xpEarned = calculateXp();

  // Generate Emoji Share Grid
  const generateShareText = (): string => {
    const grid = guesses
      .map((guess) => {
        const evaluation = evaluateWordleGuess(guess, targetWord.word);
        return evaluation
          .map((item) => {
            if (item.status === "correct") return "🟩";
            if (item.status === "present") return "🟨";
            return "⬛";
          })
          .join("");
      })
      .join("\n");

    const attemptsLabel = isWon ? `${guesses.length}/6` : "X/6";
    const starsLabel = "⭐".repeat(stars) || "0⭐";

    return `GameHub Wordle Master (${targetWord.length} chữ)\nLượt: ${attemptsLabel} | ${starsLabel} | +${xpEarned} XP\n\n${grid}\n\nChơi ngay trên GameHub!`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignore clipboard error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="wordle-result-dialog"
        showCloseButton={false}
        className="sm:max-w-md bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-center overflow-hidden"
      >
        {/* Simple lightweight CSS Confetti particles for victory */}
        {isWon && (
          <div
            data-testid="confetti-container"
            className="absolute inset-0 pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-xs sm:text-base animate-bounce"
                style={{
                  top: `${((i * 19) % 80)}%`,
                  left: `${(i / 18) * 100}%`,
                  animationDelay: `${(i % 5) * 0.15}s`,
                  animationDuration: `${1 + (i % 5) * 0.3}s`,
                }}
              >
                {["🎉", "✨", "⭐", "🎊", "🌟"][i % 5]}
              </span>
            ))}
          </div>
        )}

        <DialogHeader className="items-center text-center gap-1.5 relative z-10">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${
              isWon
                ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-white"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {isWon ? "🏆" : "💡"}
          </div>

          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isWon ? "Xuất sắc! Bạn đã thắng!" : "Hết lượt đoán rồi!"}
          </DialogTitle>

          <DialogDescription className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {isWon
              ? `Bạn đã tìm ra từ mục tiêu sau ${guesses.length} lượt đoán.`
              : `Rất tiếc! Đừng nản lòng, hãy ghi nhớ từ vựng dưới đây nhé.`}
          </DialogDescription>
        </DialogHeader>

        {/* Stars and XP Display */}
        <div className="flex items-center justify-center gap-6 my-3 py-2 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          {/* Stars */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((starIdx) => {
              const active = isWon && starIdx <= stars;
              return (
                <Star
                  key={starIdx}
                  className={`w-7 h-7 transition-all ${
                    active
                      ? "text-amber-400 fill-amber-400 scale-110 drop-shadow"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              );
            })}
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-1 font-black text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-lg">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Target Word Vocabulary Card */}
        <div className="my-2 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left relative">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-2xl font-black tracking-wider text-emerald-800 dark:text-emerald-300">
                {targetWord.word}
              </span>
              {targetWord.phonetic && (
                <span className="ml-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {targetWord.phonetic}
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onPronounce}
              aria-label={`Phát âm từ ${targetWord.word}`}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              title="Nghe lại phát âm"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-2 text-sm">
            <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 mr-2">
              {PART_OF_SPEECH_MAP[targetWord.partOfSpeech] || targetWord.partOfSpeech}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {targetWord.vietnameseMeaning}
            </span>
          </div>

          {targetWord.exampleSentence && (
            <p className="mt-2 text-xs italic text-slate-600 dark:text-slate-400 border-t border-emerald-200/50 dark:border-emerald-800/40 pt-2">
              &ldquo;{targetWord.exampleSentence}&rdquo;
            </p>
          )}
        </div>

        {/* Dialog Actions */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleShare}
            className="flex-1 rounded-2xl min-h-[46px] font-bold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ kết quả</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            onClick={onNextWord}
            className="flex-1 rounded-2xl min-h-[46px] font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 gap-2"
          >
            <span>Từ tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
