"use client";

import React from "react";
import { MonsterConfig } from "@/types/vocab-defense";
import { HeroCard } from "./HeroCard";
import { MonsterCard } from "./MonsterCard";
import { FloatingCombatText } from "./FloatingCombatText";

interface BattleArenaProps {
  heroHp: number;
  maxHeroHp: number;
  heroEnergy: number;
  heroShield: number;
  potionsLeft: number;
  currentMonster: MonsterConfig;
  currentMonsterHp: number;
  combatFeedback: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  } | null;
  onConsumePotion: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  heroHp,
  maxHeroHp,
  heroEnergy,
  heroShield,
  potionsLeft,
  currentMonster,
  currentMonsterHp,
  combatFeedback,
  onConsumePotion,
}) => {
  return (
    <div className="relative w-full rounded-3xl bg-slate-950/60 p-4 md:p-6 border border-slate-800/80 shadow-2xl backdrop-blur-md">
      <FloatingCombatText feedback={combatFeedback} />

      <div className="flex flex-col lg:flex-row items-center gap-6 justify-between">
        <HeroCard
          hp={heroHp}
          maxHp={maxHeroHp}
          energy={heroEnergy}
          shield={heroShield}
          potionsLeft={potionsLeft}
          onConsumePotion={onConsumePotion}
        />

        <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-xs">
            VS
          </div>
        </div>

        <MonsterCard monster={currentMonster} hp={currentMonsterHp} />
      </div>
    </div>
  );
};
