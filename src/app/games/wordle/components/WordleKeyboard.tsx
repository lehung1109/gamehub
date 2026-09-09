import React, { useEffect } from "react";
import { LetterStatus } from "@/types/wordle";

export interface WordleKeyboardProps {
  onKeyPress: (char: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyStatus?: Record<string, LetterStatus>;
  disabled?: boolean;
  enablePhysicalKeyboard?: boolean;
  className?: string;
}

const ROW_1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW_2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
const ROW_3 = ["Z", "X", "C", "V", "B", "N", "M"];

export const WordleKeyboard: React.FC<WordleKeyboardProps> = ({
  onKeyPress,
  onEnter,
  onBackspace,
  keyStatus = {},
  disabled = false,
  enablePhysicalKeyboard = true,
  className = "",
}) => {
  // Listen for physical keyboard events
  useEffect(() => {
    if (!enablePhysicalKeyboard || disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onEnter();
      } else if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        onBackspace();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        onKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enablePhysicalKeyboard, disabled, onEnter, onBackspace, onKeyPress]);

  const getKeyColorClass = (char: string) => {
    const status = keyStatus[char];
    if (status === "correct") {
      return "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-700";
    }
    if (status === "present") {
      return "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white border-amber-600";
    }
    if (status === "absent") {
      return "bg-slate-500 dark:bg-slate-700 hover:bg-slate-600 dark:hover:bg-slate-600 active:bg-slate-700 text-white border-slate-600 dark:border-slate-800";
    }
    return "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:bg-slate-300 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700";
  };

  const renderKey = (char: string) => {
    const colorClass = getKeyColorClass(char);
    return (
      <button
        key={char}
        type="button"
        disabled={disabled}
        onClick={() => onKeyPress(char)}
        data-key={char}
        data-status={keyStatus[char] || "empty"}
        className={`flex-1 min-w-[32px] sm:min-w-[38px] md:min-w-[44px] max-w-[48px] min-h-[44px] h-12 md:h-14 rounded-lg md:rounded-xl font-bold text-sm sm:text-base md:text-lg flex items-center justify-center select-none touch-manipulation transition-colors border-b-2 btn-3d disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${colorClass}`}
        aria-label={char}
      >
        {char}
      </button>
    );
  };

  return (
    <div
      data-testid="wordle-keyboard"
      className={`w-full max-w-lg mx-auto flex flex-col items-center gap-1.5 sm:gap-2 px-2 select-none touch-manipulation ${className}`}
      role="group"
      aria-label="Bàn phím ảo Wordle"
    >
      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
        {ROW_1.map(renderKey)}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full px-2 sm:px-4">
        {ROW_2.map(renderKey)}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
        {/* Enter Key */}
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          data-key="ENTER"
          aria-label="ENTER"
          className="min-w-[56px] sm:min-w-[64px] md:min-w-[72px] min-h-[44px] h-12 md:h-14 px-2 sm:px-3 rounded-lg md:rounded-xl font-bold text-xs sm:text-sm md:text-base flex items-center justify-center select-none touch-manipulation transition-colors bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 active:bg-slate-400 text-slate-900 dark:text-white border-b-2 border-slate-400 dark:border-slate-800 btn-3d disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          ENTER
        </button>

        {ROW_3.map(renderKey)}

        {/* Backspace Key */}
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          data-key="BACKSPACE"
          aria-label="Backspace"
          className="min-w-[56px] sm:min-w-[64px] md:min-w-[72px] min-h-[44px] h-12 md:h-14 px-2 sm:px-3 rounded-lg md:rounded-xl font-bold text-base sm:text-lg md:text-xl flex items-center justify-center select-none touch-manipulation transition-colors bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 active:bg-slate-400 text-slate-900 dark:text-white border-b-2 border-slate-400 dark:border-slate-800 btn-3d disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          ⌫
        </button>
      </div>
    </div>
  );
};
