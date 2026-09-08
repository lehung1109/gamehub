"use client";

import React from "react";
import { MonsterConfig } from "@/types/vocab-defense";
import { Swords, Flame } from "lucide-react";

interface MonsterCardProps {
  monster: MonsterConfig;
  hp: number;
}

export const MonsterCard: React.FC<MonsterCardProps> = ({ monster, hp }) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / monster.maxHp) * 100));
  const isEnraged = hp < monster.maxHp * 0.3;

  return (
    <div className="flex-1 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${monster.color} flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-105`}
          >
            {monster.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white">{monster.name}</h3>
              {isEnraged && (
                <span className="flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse">
                  <Flame className="w-3 h-3" /> ENRAGED
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400 font-medium">{monster.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <Swords className="w-3.5 h-3.5" /> {monster.damage} DMG
        </div>
      </div>

      {/* Monster HP Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs font-bold mb-1">
          <span className="text-rose-400">Enemy Health</span>
          <span className="text-slate-300">
            {hp} / {monster.maxHp}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Enemy Health"
          aria-valuenow={hp}
          aria-valuemin={0}
          aria-valuemax={monster.maxHp}
          className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isEnraged
                ? "bg-gradient-to-r from-red-600 to-rose-500 animate-pulse"
                : "bg-gradient-to-r from-purple-500 to-rose-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
