import React from "react";
import { HangmanWord } from "@/types/hangman";

interface WordDisplayProps {
  word: HangmanWord;
  guessedLetters: Set<string>;
  wordStatus: "playing" | "won" | "lost";
}

export const WordDisplay: React.FC<WordDisplayProps> = ({
  word,
  guessedLetters,
  wordStatus,
}) => {
  return (
    <div
      role="region"
      aria-label={`Từ gồm ${word.word.length} chữ cái`}
      className="w-full max-w-2xl flex flex-col items-center gap-3 my-4"
    >
      {/* Letter Slot Boxes */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {word.word.split("").map((letter, index) => {
          const isGuessed = guessedLetters.has(letter);
          const showAnswer = wordStatus === "lost";

          return (
            <div
              key={index}
              data-testid="letter-slot"
              className={`w-12 h-14 md:w-14 md:h-16 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-xl md:text-2xl shadow-md select-none transition-all ${
                isGuessed
                  ? "bg-slate-800 border-emerald-500 text-emerald-400"
                  : showAnswer
                  ? "bg-amber-950/70 border-amber-400 text-amber-300"
                  : "bg-slate-900/90 border-slate-700 text-transparent"
              }`}
            >
              {isGuessed ? letter : showAnswer ? letter : "_"}
            </div>
          );
        })}
      </div>

      {/* Clue Banner */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-base font-bold text-slate-200">
        {word.emoji && <span className="text-xl">{word.emoji}</span>}
        <span>Gợi ý nghĩa:</span>
        <span className="text-emerald-400 font-extrabold">{word.clue}</span>
        {word.phonetic && (
          <span className="text-slate-400 font-mono text-base">
            ({word.phonetic})
          </span>
        )}
      </div>
    </div>
  );
};
