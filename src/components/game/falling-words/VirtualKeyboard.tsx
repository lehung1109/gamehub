"use client";

import React from "react";
import { Bomb } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onTriggerBomb: () => void;
  bombsAvailable: number;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onTriggerBomb,
  bombsAvailable,
}) => {
  return (
    <div
      role="region"
      aria-label="Bàn phím ảo"
      className="w-full max-w-2xl mt-4 flex flex-col gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md select-none"
    >
      {ROWS.map((row, rIndex) => (
        <div key={rIndex} className="flex justify-center gap-1.5 w-full">
          {row.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => onKeyPress(char)}
              aria-label={char}
              className="flex-1 min-w-[28px] max-w-[48px] h-11 md:h-12 min-h-[44px] bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 active:scale-95 text-slate-100 font-mono font-bold text-base md:text-lg rounded-xl border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm"
            >
              {char}
            </button>
          ))}
        </div>
      ))}

      <div className="flex justify-center mt-1">
        <button
          type="button"
          onClick={onTriggerBomb}
          disabled={bombsAvailable === 0}
          aria-label="Phím cách Bom tổng"
          className={`w-full max-w-sm h-11 md:h-12 min-h-[44px] rounded-xl font-bold text-base flex items-center justify-center gap-2 border transition-all ${
            bombsAvailable > 0
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-md cursor-pointer"
              : "bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed"
          }`}
        >
          <Bomb className="w-5 h-5" />
          <span>BOM TOÀN MÀN HÌNH (SPACE)</span>
        </button>
      </div>
    </div>
  );
};
