"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useOddOneOutGame } from "@/hooks/use-odd-one-out-game";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { useSpeech } from "@/hooks/useSpeech";
import { OddOneOutDifficulty, OddOneOutQuestion } from "@/types/odd-one-out";
import { getRandomChallenges } from "@/data/odd-one-out/challenges";
import {
  playCardClickSound,
  playCorrectSound,
  playWrongSound,
  playFiftyFiftySound,
  playClueSound,
  playLevelClearSound,
} from "@/lib/odd-one-out/sound";
import {
  OddOneOutHeader,
  WordCardGrid,
  OddOneOutControls,
  ExplanationBanner,
  OddOneOutGuideModal,
  OddOneOutResultDialog,
} from "./components";

export interface OddOneOutPageProps {
  initialQuestions?: OddOneOutQuestion[];
}

export default function OddOneOutPage({
  initialQuestions,
}: OddOneOutPageProps = {}) {
  const [difficulty, setDifficulty] = useState<OddOneOutDifficulty>("easy");
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [isResultDismissed, setIsResultDismissed] = useState(false);

  const {
    questions,
    currentIndex,
    currentQuestion,
    selectedId,
    eliminatedIds,
    isClueVisible,
    showThemeHint,
    isFiftyFiftyUsed,
    isAnswerChecked,
    currentResult,
    score,
    streak,
    bestStreak,
    hintsUsed,
    history,
    isCompleted,
    selectCard,
    checkAnswer,
    applyFiftyFifty,
    toggleClue,
    nextQuestion,
    resetGame,
  } = useOddOneOutGame({
    initialQuestions,
    difficulty,
    questionCount: 10,
  });

  const { speak, cancel } = useSpeech();
  const { recordQuestion, submitSession, resetSession } = useGameTracking({
    gameType: "odd-one-out",
    topic: difficulty,
    totalQuestions: questions.length,
  });

  const prevCompletedRef = useRef(false);

  // Completion trigger: fanfare sound and submitSession
  useEffect(() => {
    if (isCompleted && !prevCompletedRef.current) {
      playLevelClearSound();
      submitSession({
        score,
        totalQuestions: questions.length,
        topic: difficulty,
      });
    }
    prevCompletedRef.current = isCompleted;
  }, [isCompleted, questions.length, score, submitSession, difficulty]);

  const handleSpeakWord = useCallback(
    (word: string) => {
      cancel();
      speak(word);
    },
    [cancel, speak]
  );

  const handleSelectCard = useCallback(
    (id: string) => {
      selectCard(id);
      playCardClickSound();
    },
    [selectCard]
  );

  const handleCheckAnswer = useCallback(() => {
    const result = checkAnswer();
    if (!result) return;

    if (result.isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    recordQuestion({
      prompt: currentQuestion?.themeVi || currentQuestion?.themeEn || "Odd One Out",
      selectedAnswer: result.selectedItem.word,
      correctAnswer: result.oddItem.word,
      isCorrect: result.isCorrect,
    });
  }, [checkAnswer, currentQuestion, recordQuestion]);

  const handleApplyFiftyFifty = useCallback(() => {
    const eliminated = applyFiftyFifty();
    if (eliminated.length > 0) {
      playFiftyFiftySound();
    }
  }, [applyFiftyFifty]);

  const handleToggleClue = useCallback(() => {
    if (!isClueVisible) {
      playClueSound();
    }
    toggleClue();
  }, [isClueVisible, toggleClue]);

  const handleNextQuestion = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handleReplay = useCallback(() => {
    setIsResultDismissed(false);
    resetSession();
    resetGame(
      initialQuestions && initialQuestions.length > 0
        ? initialQuestions
        : getRandomChallenges(10, difficulty)
    );
  }, [initialQuestions, difficulty, resetSession, resetGame]);

  const handleChangeDifficulty = useCallback(
    (newDiff: OddOneOutDifficulty) => {
      setDifficulty(newDiff);
      setIsResultDismissed(false);
      resetSession();
      resetGame(getRandomChallenges(10, newDiff));
    },
    [resetSession, resetGame]
  );

  const isResultDialogOpen = isCompleted && !isResultDismissed;

  // Physical keyboard shortcuts: 1-4 to select cards, Enter to check / advance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard if modals or result dialog are open
      if (guideModalOpen || isResultDialogOpen) {
        return;
      }

      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (!isAnswerChecked && selectedId) {
          handleCheckAnswer();
        } else if (isAnswerChecked) {
          handleNextQuestion();
        }
      } else if (e.key >= "1" && e.key <= "4" && !isAnswerChecked) {
        const index = parseInt(e.key, 10) - 1;
        if (currentQuestion && currentQuestion.items[index]) {
          const item = currentQuestion.items[index];
          if (!eliminatedIds.includes(item.id)) {
            e.preventDefault();
            handleSelectCard(item.id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    guideModalOpen,
    isResultDialogOpen,
    isAnswerChecked,
    selectedId,
    currentQuestion,
    eliminatedIds,
    handleCheckAnswer,
    handleNextQuestion,
    handleSelectCard,
  ]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-between pb-8">
      {/* Game Header */}
      <OddOneOutHeader
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        difficulty={difficulty}
        score={score}
        streak={streak}
        onOpenGuide={() => setGuideModalOpen(true)}
        onChangeDifficulty={handleChangeDifficulty}
      />

      {/* Main Content Area */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col items-center justify-start px-3 py-4 sm:py-6 gap-4">
        {currentQuestion && (
          <>
            {/* Word Card Grid 2x2 */}
            <WordCardGrid
              items={currentQuestion.items}
              selectedId={selectedId}
              eliminatedIds={eliminatedIds}
              isAnswerChecked={isAnswerChecked}
              oddItemId={currentQuestion.items.find((i) => i.isOdd)?.id}
              onSelect={handleSelectCard}
              onSpeak={handleSpeakWord}
            />

            {/* Post-Answer Educational Explanation Banner */}
            <ExplanationBanner
              result={currentResult}
              isVisible={isAnswerChecked}
              onSpeakWord={handleSpeakWord}
            />

            {/* Gameplay Controls Bar */}
            <OddOneOutControls
              onCheckAnswer={handleCheckAnswer}
              onNextQuestion={handleNextQuestion}
              onApplyFiftyFifty={handleApplyFiftyFifty}
              onToggleClue={handleToggleClue}
              canCheck={selectedId !== null}
              isAnswerChecked={isAnswerChecked}
              isFiftyFiftyUsed={isFiftyFiftyUsed}
              showThemeHint={showThemeHint}
              clueText={currentQuestion.themeVi}
            />
          </>
        )}
      </div>

      {/* Guide Modal */}
      <OddOneOutGuideModal
        open={guideModalOpen}
        onOpenChange={setGuideModalOpen}
      />

      {/* Completion Result Dialog */}
      <OddOneOutResultDialog
        open={isResultDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsResultDismissed(true);
          }
        }}
        score={score}
        totalQuestions={questions.length}
        history={history}
        bestStreak={bestStreak}
        hintsUsed={hintsUsed}
        onReplay={handleReplay}
        onSpeakWord={handleSpeakWord}
      />
    </main>
  );
}
