"use client";

import React from "react";
import { Timer } from "lucide-react";

interface TurnTimerBarProps {
  timer: number;
  maxTimer?: number;
}

export const TurnTimerBar: React.FC<TurnTimerBarProps> = ({ timer, maxTimer = 20 }) => {
  const percent = Math.max(0, Math.min(100, (timer / maxTimer) * 100));

  const getColor = () => {
    if (percent > 50) return "from-emerald-400 to-green-500";
    if (percent > 25) return "from-amber-400 to-yellow-500";
    return "from-rose-500 to-red-600 animate-pulse";
  };

  return (
    <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur px-4 py-2 rounded-xl border border-slate-800">
      <Timer className={`w-4 h-4 ${percent <= 25 ? "text-rose-400 animate-spin" : "text-amber-400"}`} />
      <div
        role="progressbar"
        aria-label="Turn countdown timer"
        aria-valuenow={timer}
        aria-valuemin={0}
        aria-valuemax={maxTimer}
        className="flex-1 w-32 md:w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700"
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-slate-300 w-6 text-right">{timer}s</span>
    </div>
  );
};
