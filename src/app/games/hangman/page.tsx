"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useHangmanEngine } from "@/hooks/useHangmanEngine";
import { useSpeech } from "@/hooks/useSpeech";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { HangmanHeader } from "@/components/game/hangman/HangmanHeader";
import { BalloonStage } from "@/components/game/hangman/BalloonStage";
import { WordDisplay } from "@/components/game/hangman/WordDisplay";
import { HangmanKeyboard } from "@/components/game/hangman/HangmanKeyboard";
import { HangmanSummaryModal } from "@/components/game/hangman/HangmanSummaryModal";

const emptySubscribe = () => () => {};

export default function HangmanPage() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
    topicId,
    currentIndex,
    totalWords,
    currentWord,
    guessedLetters,
    mistakesCount,
    maxMistakes,
    hintUsed,
    score,
    wordStatus,
    isRoundComplete,
    history,
    guessLetter,
    useHint,
    nextWord,
    restartRound,
    setTopicId,
  } = useHangmanEngine();

  const { speak } = useSpeech();
  const { submitSession, resetSession } = useGameTracking({
    gameType: "hangman",
  });
  const sessionSubmittedRef = useRef(false);

  // Automatically pronounce word when won
  useEffect(() => {
    if (wordStatus === "won" && currentWord) {
      speak(currentWord.word);
    }
  }, [wordStatus, currentWord, speak]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (wordStatus !== "playing") return;
      if (["INPUT", "SELECT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        guessLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wordStatus, guessLetter]);

  // Submit session tracking on round complete
  useEffect(() => {
    if (isRoundComplete && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      const sessionDetails = history.map((item) => ({
        prompt: item.word.word,
        selectedAnswer: item.solved ? item.word.word : undefined,
        correctAnswer: item.word.word,
        isCorrect: item.solved,
        timeTakenMs: 0,
        attempts: item.mistakes + 1,
      }));

      submitSession({
        score,
        totalQuestions: totalWords,
        topic: topicId,
        details: sessionDetails,
      }).catch((err) => console.error("Failed to submit hangman session:", err));

      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("gamehub_hangman_progress");
          const records = stored ? JSON.parse(stored) : [];
          records.push({
            date: new Date().toISOString(),
            score,
            topicId,
            solvedCount: history.filter((h) => h.solved).length,
            totalWords,
          });
          localStorage.setItem("gamehub_hangman_progress", JSON.stringify(records.slice(-20)));
        }
      } catch (err) {
        console.error("Failed to save progress to local storage:", err);
      }
    } else if (!isRoundComplete) {
      sessionSubmittedRef.current = false;
    }
  }, [isRoundComplete, score, totalWords, topicId, history, submitSession]);

  const currentWordLetters = useMemo(() => {
    return new Set(currentWord?.word.split("") || []);
  }, [currentWord]);

  const handleRestart = () => {
    resetSession();
    restartRound();
  };

  const handleTopicChange = (newTopicId: string) => {
    resetSession();
    setTopicId(newTopicId);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-4xl h-[600px] bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 font-bold text-base">
          Đang tải Giải Cứu Nhà Thám Hiểm...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 select-none">
      <HangmanHeader
        topicId={topicId}
        onTopicChange={handleTopicChange}
        currentIndex={currentIndex}
        totalWords={totalWords}
        score={score}
        hintUsed={hintUsed}
        onUseHint={useHint}
        wordStatus={wordStatus}
        onNextWord={nextWord}
      />

      <div className="w-full max-w-4xl flex flex-col items-center">
        <BalloonStage
          mistakesCount={mistakesCount}
          maxMistakes={maxMistakes}
          wordStatus={wordStatus}
        />

        {currentWord && (
          <WordDisplay
            word={currentWord}
            guessedLetters={guessedLetters}
            wordStatus={wordStatus}
          />
        )}

        <HangmanKeyboard
          guessedLetters={guessedLetters}
          currentWordLetters={currentWordLetters}
          onKeyPress={guessLetter}
          disabled={wordStatus !== "playing"}
        />
      </div>

      <HangmanSummaryModal
        isOpen={isRoundComplete}
        score={score}
        history={history}
        onRestart={handleRestart}
      />
    </div>
  );
}
