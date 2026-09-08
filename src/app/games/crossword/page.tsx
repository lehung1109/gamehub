"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCrosswordEngine } from "@/hooks/useCrosswordEngine";
import { useGameTracking } from "@/hooks/use-game-tracking";
import { CrosswordGrid } from "@/components/game/crossword/CrosswordGrid";
import { CluePanel } from "@/components/game/crossword/CluePanel";
import { HintBar } from "@/components/game/crossword/HintBar";
import { VirtualKeyboard } from "@/components/game/crossword/VirtualKeyboard";
import { CrosswordCompletionModal } from "@/components/game/crossword/CrosswordCompletionModal";

const TOPICS = [
  { id: "animals", name: "🐾 Động vật (Animals)" },
  { id: "fruits", name: "🍎 Trái cây (Fruits)" },
  { id: "school", name: "🎒 Trường học (School)" },
];

export default function CrosswordPage() {
  const {
    topicId,
    board,
    selectedCell,
    direction,
    activeWord,
    score,
    hintsUsed,
    isComplete,
    elapsedSeconds,
    typeLetter,
    handleBackspace,
    toggleDirection,
    selectCell,
    selectClue,
    revealLetter,
    revealWord,
    loadNewPuzzle,
  } = useCrosswordEngine();

  const { submitSession, resetSession } = useGameTracking({
    gameType: "crossword",
  });
  const sessionSubmittedRef = useRef(false);

  // Keyboard navigation on physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComplete) return;
      if ((e.target as HTMLElement)?.tagName === "SELECT") return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        typeLetter(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === " ") {
        e.preventDefault();
        toggleDirection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [typeLetter, handleBackspace, toggleDirection, isComplete]);

  // Submit session on completion
  useEffect(() => {
    if (isComplete && !sessionSubmittedRef.current) {
      sessionSubmittedRef.current = true;
      submitSession({
        score,
        totalQuestions: board.words.length,
      }).catch((err) => console.error("Failed to submit crossword session:", err));

      try {
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("gamehub_crossword_progress");
          const history = stored ? JSON.parse(stored) : [];
          history.push({
            date: new Date().toISOString(),
            score,
            topicId,
            elapsedSeconds,
            wordsCount: board.words.length,
          });
          localStorage.setItem("gamehub_crossword_progress", JSON.stringify(history.slice(-20)));
        }
      } catch (err) {
        console.error("Failed to save crossword progress:", err);
      }
    } else if (!isComplete) {
      sessionSubmittedRef.current = false;
    }
  }, [isComplete, score, board.words.length, topicId, elapsedSeconds, submitSession]);

  const handleNextPuzzle = () => {
    resetSession();
    loadNewPuzzle();
  };

  const calculatedStars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" /> GameHub
        </Link>

        {/* Topic Selector */}
        <select
          value={topicId}
          onChange={(e) => loadNewPuzzle(e.target.value)}
          aria-label="Chọn chủ đề ô chữ"
          className="bg-slate-900 border border-slate-700 text-slate-200 text-base font-bold rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-amber-500"
        >
          {TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-base font-mono font-bold text-slate-300">
            ⏱️ {Math.floor(elapsedSeconds / 60).toString().padStart(2, "0")}:
            {(elapsedSeconds % 60).toString().padStart(2, "0")}
          </div>

          <div className="bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-base font-black text-amber-400">
            ⭐ {score} ĐIỂM
          </div>

          <button
            type="button"
            onClick={() => loadNewPuzzle()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            title="Tạo đề ô chữ mới"
            aria-label="Tạo đề ô chữ mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Left Column: Grid + Hints + Virtual Keyboard */}
        <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
          <CrosswordGrid
            board={board}
            selectedCell={selectedCell}
            direction={direction}
            activeWord={activeWord}
            onSelectCell={selectCell}
          />

          <HintBar
            activeWord={activeWord}
            onRevealLetter={revealLetter}
            onRevealWord={revealWord}
            disabled={isComplete}
          />

          <VirtualKeyboard
            onKeyPress={typeLetter}
            onBackspace={handleBackspace}
            onToggleDirection={toggleDirection}
            direction={direction}
          />
        </div>

        {/* Right Column: Clue Panel */}
        <div className="w-full lg:flex-1">
          <CluePanel
            words={board.words}
            activeWordId={activeWord?.id || ""}
            onSelectWord={selectClue}
          />
        </div>
      </main>

      {/* Completion Modal */}
      <CrosswordCompletionModal
        isOpen={isComplete}
        score={score}
        stars={calculatedStars}
        elapsedSeconds={elapsedSeconds}
        hintsUsed={hintsUsed}
        onNextPuzzle={handleNextPuzzle}
      />
    </div>
  );
}
