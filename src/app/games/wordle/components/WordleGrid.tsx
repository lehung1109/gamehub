import React from "react";
import { WordleRow } from "./WordleRow";

export interface WordleGridProps {
  wordLength?: number;
  maxAttempts?: number;
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  isShaking?: boolean;
  isWinning?: boolean;
  gameStatus?: "playing" | "won" | "lost";
  revealedPositions?: Record<number, string>;
  className?: string;
}

export const WordleGrid: React.FC<WordleGridProps> = ({
  wordLength = 5,
  maxAttempts = 6,
  guesses = [],
  currentGuess = "",
  targetWord = "",
  isShaking = false,
  isWinning = false,
  gameStatus = "playing",
  revealedPositions = {},
  className = "",
}) => {
  const actualWordLength = wordLength || targetWord?.length || 5;
  const isGameWon = isWinning || gameStatus === "won";

  return (
    <div
      data-testid="wordle-grid"
      className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2 select-none ${className}`}
      role="region"
      aria-label="Lưới ô chữ Wordle"
    >
      {Array.from({ length: maxAttempts }, (_, rowIndex) => {
        const isCompleted = rowIndex < guesses.length;
        const isCurrent =
          (gameStatus === "playing" || !gameStatus) && rowIndex === guesses.length;
        const guess = isCompleted ? guesses[rowIndex] : undefined;
        const isRowWinning = isGameWon && rowIndex === guesses.length - 1;

        return (
          <WordleRow
            key={rowIndex}
            rowIndex={rowIndex}
            wordLength={actualWordLength}
            guess={guess}
            currentGuess={isCurrent ? currentGuess : ""}
            targetWord={targetWord}
            isCurrentRow={isCurrent}
            isShaking={isCurrent && isShaking}
            isWinning={isRowWinning}
            revealedPositions={isCurrent ? revealedPositions : undefined}
          />
        );
      })}
    </div>
  );
};
