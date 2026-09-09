import React from "react";

export interface HangmanKeyboardProps {
  guessedLetters: Set<string>;
  currentWordLetters: Set<string>;
  onKeyPress: (key: string) => void;
  disabled: boolean;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const HangmanKeyboard: React.FC<HangmanKeyboardProps> = ({
  guessedLetters,
  currentWordLetters,
  onKeyPress,
  disabled,
}) => {
  return (
    <div
      role="region"
      aria-label="Bàn phím chữ cái"
      className="w-full max-w-2xl mt-2 flex flex-col gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md select-none"
    >
      {ROWS.map((row, rIndex) => (
        <div key={rIndex} className="flex justify-center gap-1.5 w-full">
          {row.map((char) => {
            const isGuessed = guessedLetters.has(char);
            const isCorrect = currentWordLetters.has(char);

            let keyStyle =
              "bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 cursor-pointer shadow-sm active:scale-95";

            if (isGuessed && isCorrect) {
              keyStyle = "bg-emerald-600 text-white border-emerald-500 cursor-not-allowed opacity-90";
            } else if (isGuessed && !isCorrect) {
              keyStyle = "bg-red-950/80 text-red-400 border-red-900/50 cursor-not-allowed opacity-40";
            } else if (disabled) {
              keyStyle = "bg-slate-800/50 text-slate-600 border-slate-800 cursor-not-allowed";
            }

            return (
              <button
                key={char}
                type="button"
                onClick={() => onKeyPress(char)}
                disabled={isGuessed || disabled}
                aria-label={char}
                className={`flex-1 min-w-[28px] max-w-[48px] h-11 md:h-12 min-h-[44px] font-mono font-bold text-base md:text-lg rounded-xl border flex items-center justify-center transition-all ${keyStyle}`}
              >
                {char}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
