"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Swords, Sparkles } from "lucide-react";
import { useBattleEngine } from "@/hooks/useBattleEngine";
import { BattleArena } from "@/components/game/vocab-defense/BattleArena";
import { TurnTimerBar } from "@/components/game/vocab-defense/TurnTimerBar";
import { ActionDock } from "@/components/game/vocab-defense/ActionDock";
import { ChallengeDrawer } from "@/components/game/vocab-defense/ChallengeDrawer";
import { FeedbackOverlay } from "@/components/game/vocab-defense/FeedbackOverlay";
import { BattleReviewModal } from "@/components/game/vocab-defense/BattleReviewModal";

export default function VocabDefenseGamePage() {
  const {
    battleState,
    heroHp,
    maxHeroHp,
    heroEnergy,
    heroShield,
    potionsLeft,
    currentWaveIndex,
    currentMonster,
    currentMonsterHp,
    activeChallenge,
    turnTimer,
    score,
    comboStreak,
    missedQuestions,
    combatFeedback,
    skipIntro,
    selectSkill,
    submitAnswer,
    consumePotion,
    restartGame,
  } = useBattleEngine();

  const isIntro = battleState === "STAGE_INTRO";
  const isResolving = battleState === "RESOLVING_ACTION";
  const isGameOver = battleState === "VICTORY" || battleState === "DEFEAT";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> GameHub
        </Link>

        <div className="flex items-center gap-3">
          {comboStreak > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> {comboStreak}x COMBO!
            </div>
          )}
          <TurnTimerBar timer={turnTimer} />
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col gap-6">
        {isIntro && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-bold">
              <Swords className="w-4 h-4" /> Chuẩn bị chiến đấu đợt {currentWaveIndex + 1}/4!
            </div>
            <button
              type="button"
              onClick={skipIntro}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
            >
              Vào Trận Ngay
            </button>
          </div>
        )}

        {/* Arena */}
        <BattleArena
          heroHp={heroHp}
          maxHeroHp={maxHeroHp}
          heroEnergy={heroEnergy}
          heroShield={heroShield}
          potionsLeft={potionsLeft}
          currentMonster={currentMonster}
          currentMonsterHp={currentMonsterHp}
          combatFeedback={combatFeedback}
          onConsumePotion={consumePotion}
        />

        {/* Feedback info when resolving */}
        {combatFeedback && (
          <FeedbackOverlay
            isCorrect={combatFeedback.isCorrect}
            explanation={combatFeedback.explanation}
          />
        )}

        {/* Dynamic Controls */}
        {activeChallenge ? (
          <ChallengeDrawer
            question={activeChallenge}
            onSelectAnswer={submitAnswer}
            disabled={isResolving}
          />
        ) : (
          <ActionDock
            heroEnergy={heroEnergy}
            onSelectSkill={selectSkill}
            disabled={isIntro || isResolving}
          />
        )}
      </main>

      {/* Post Battle Modal */}
      <BattleReviewModal
        isOpen={isGameOver}
        isVictory={battleState === "VICTORY"}
        score={score}
        stars={comboStreak >= 5 ? 3 : 2}
        missedQuestions={missedQuestions}
        onPlayAgain={restartGame}
      />
    </div>
  );
}
