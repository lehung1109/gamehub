"use client";

import React from "react";
import { Shield, Zap, Heart, Sparkles } from "lucide-react";

interface HeroCardProps {
  hp: number;
  maxHp: number;
  energy: number;
  shield: number;
  potionsLeft: number;
  onConsumePotion: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  hp,
  maxHp,
  energy,
  shield,
  potionsLeft,
  onConsumePotion,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  return (
    <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            🛡️
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Word Knight</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Lv. 1 Realm Defender
            </span>
          </div>
        </div>

        {shield > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold animate-pulse">
            <Shield className="w-3.5 h-3.5" /> +{shield} Shield
          </div>
        )}
      </div>

      {/* HP Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="flex items-center gap-1 text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-rose-500" /> HP
          </span>
          <span className="text-slate-300">
            {hp} / {maxHp}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Energy / Ultimate Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="flex items-center gap-1 text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> Energy
          </span>
          <span className="text-slate-300">{energy} / 100</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              energy >= 100
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md shadow-amber-400/50 animate-pulse"
                : "bg-gradient-to-r from-amber-600 to-amber-400"
            }`}
            style={{ width: `${energy}%` }}
          />
        </div>
      </div>

      {/* Potion Button */}
      <button
        type="button"
        disabled={potionsLeft <= 0 || hp >= maxHp}
        onClick={onConsumePotion}
        className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
          potionsLeft > 0 && hp < maxHp
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer"
            : "bg-slate-800/40 border-slate-700 text-slate-500 cursor-not-allowed"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" /> Dùng Potion Hồi Máu (+40 HP) ({potionsLeft} còn lại)
      </button>
    </div>
  );
};
