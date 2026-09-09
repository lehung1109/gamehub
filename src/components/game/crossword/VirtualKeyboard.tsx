"use client";

import React from "react";
import { Direction } from "@/types/crossword";
import { Delete, RotateCcw } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
  direction: Direction;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onToggleDirection,
  direction,
}) => {
  return (
    <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-3 shadow-xl flex flex-col gap-1.5 select-none touch-manipulation">
      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex justify-center gap-1 md:gap-1.5">
          {rIdx === 2 && (
            <button
              type="button"
              onClick={onToggleDirection}
              aria-label={`Đổi hướng: hiện tại ${direction === "across" ? "Hàng ngang" : "Hàng dọc"}`}
              className="px-2.5 py-2.5 min-h-[44px] rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-base font-bold flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> {direction === "across" ? "Ngang" : "Dọc"}
            </button>
          )}

          {row.map((char) => (
            <button
              key={char}
              type="button"
              aria-label={char}
              onClick={() => onKeyPress(char)}
              className="w-8 md:w-10 h-11 md:h-12 min-h-[44px] rounded-lg bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 font-bold text-base md:text-lg flex items-center justify-center border border-slate-700 transition-colors shadow-sm cursor-pointer"
            >
              {char}
            </button>
          ))}

          {rIdx === 2 && (
            <button
              type="button"
              aria-label="Xóa ký tự"
              onClick={onBackspace}
              className="px-3 py-2.5 min-h-[44px] rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-base font-bold flex items-center justify-center border border-rose-500/40 transition-colors cursor-pointer"
            >
              <Delete className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
