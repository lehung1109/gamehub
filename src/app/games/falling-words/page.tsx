"use client";

import React, { useEffect, useRef } from "react";
import { useFallingWordsEngine } from "@/hooks/useFallingWordsEngine";
import { useSpeech } from "@/hooks/useSpeech";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { ArcadeHeader } from "@/components/game/falling-words/ArcadeHeader";
import { FallingWordsArena } from "@/components/game/falling-words/FallingWordsArena";
import { VirtualKeyboard } from "@/components/game/falling-words/VirtualKeyboard";
import { WordRainSummaryModal } from "@/components/game/falling-words/WordRainSummaryModal";

const emptySubscribe = () => () => {};

export default function FallingWordsPage() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
    topicId,
    fallingWords,
    score,
    combo,
    maxCombo,
    lives,
    timeLeft,
    bombsAvailable,
    isFrozen,
    isGameOver,
    isVictory,
    wordsPopped,
    lastPoppedWord,
    typeLetter,
    triggerBomb,
    updatePhysics,
    restartGame,
    setTopicId,
  } = useFallingWordsEngine();

  const { speak } = useSpeech();
  const { submitSession, resetSession } = useGameTracking({
    gameType: "falling-words",
  });
  const sessionSubmittedRef = useRef(false);

  useEffect(() => {
    if (lastPoppedWord) {
      speak(lastPoppedWord.word);
    }
  }, [lastPoppedWord, speak]);

  useEffect(() => {
    if (isGameOver) return;

    let lastTime = performance.now();
    let animId: number;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      updatePhysics(dt);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, updatePhysics]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        triggerBomb();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        typeLetter(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameOver, triggerBomb, typeLetter]);

  useEffect(() => {
    if (isGameOver && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      const sessionDetails = wordsPopped.map((w) => ({
        prompt: w.word,
        selectedAnswer: w.word,
        correctAnswer: w.word,
        isCorrect: true,
        timeTakenMs: 0,
        attempts: 1,
      }));

      submitSession({
        score: wordsPopped.length,
        totalQuestions: Math.max(wordsPopped.length, 1),
        topic: topicId,
        details: sessionDetails,
      }).catch((err) => console.error("Failed to submit falling-words session:", err));

      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("gamehub_falling_words_progress");
          const history = stored ? JSON.parse(stored) : [];
          history.push({
            date: new Date().toISOString(),
            score,
            topicId,
            wordsPopped: wordsPopped.length,
            maxCombo,
            isVictory,
          });
          localStorage.setItem("gamehub_falling_words_progress", JSON.stringify(history.slice(-20)));
        }
      } catch (err) {
        console.error("Failed to save progress to local storage:", err);
      }
    } else if (!isGameOver) {
      sessionSubmittedRef.current = false;
    }
  }, [isGameOver, score, wordsPopped, topicId, maxCombo, isVictory, submitSession]);

  const handleRestart = () => {
    resetSession();
    restartGame();
  };

  const handleTopicChange = (newTopicId: string) => {
    resetSession();
    setTopicId(newTopicId);
    restartGame(newTopicId);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-5xl h-[600px] bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 font-bold text-base">
          Đang tải Mưa Từ Vựng...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 select-none">
      <ArcadeHeader
        topicId={topicId}
        onTopicChange={handleTopicChange}
        lives={lives}
        timeLeft={timeLeft}
        score={score}
        combo={combo}
        bombsAvailable={bombsAvailable}
        onTriggerBomb={triggerBomb}
      />

      <div className="w-full max-w-5xl flex flex-col items-center">
        <FallingWordsArena fallingWords={fallingWords} isFrozen={isFrozen} />

        <VirtualKeyboard
          onKeyPress={typeLetter}
          onTriggerBomb={triggerBomb}
          bombsAvailable={bombsAvailable}
        />
      </div>

      <WordRainSummaryModal
        isOpen={isGameOver}
        isVictory={isVictory}
        score={score}
        combo={maxCombo}
        lives={lives}
        wordsPopped={wordsPopped}
        onRestart={handleRestart}
      />
    </div>
  );
}
