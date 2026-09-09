import React from "react";
import { evaluateWordleGuess } from "@/lib/wordle/evaluator";
import { EvaluatedLetter } from "@/types/wordle";
import { WordleTile } from "./WordleTile";

export interface WordleRowProps {
  rowIndex: number;
  wordLength?: number;
  guess?: string;
  currentGuess?: string;
  targetWord: string;
  isCurrentRow?: boolean;
  isShaking?: boolean;
  isWinning?: boolean;
  revealedPositions?: Record<number, string>;
  className?: string;
}

export const WordleRow: React.FC<WordleRowProps> = ({
  rowIndex,
  wordLength = 5,
  guess,
  currentGuess = "",
  targetWord,
  isCurrentRow = false,
  isShaking = false,
  isWinning = false,
  revealedPositions = {},
  className = "",
}) => {
  const length = wordLength || targetWord?.length || 5;

  let evaluatedTiles: Array<{
    char: string;
    status?: EvaluatedLetter["status"];
    isRevealedHint?: boolean;
  }> = [];

  if (guess) {
    const evaluation = evaluateWordleGuess(guess, targetWord);
    evaluatedTiles = Array.from({ length }, (_, i) => ({
      char: evaluation[i]?.char ?? "",
      status: evaluation[i]?.status ?? "absent",
      isRevealedHint: false,
    }));
  } else if (isCurrentRow) {
    evaluatedTiles = Array.from({ length }, (_, i) => {
      if (i < currentGuess.length) {
        return {
          char: currentGuess[i],
          status: undefined,
          isRevealedHint: false,
        };
      }
      if (revealedPositions[i]) {
        return {
          char: revealedPositions[i],
          status: undefined,
          isRevealedHint: true,
        };
      }
      return {
        char: "",
        status: "empty",
        isRevealedHint: false,
      };
    });
  } else {
    evaluatedTiles = Array.from({ length }, () => ({
      char: "",
      status: "empty",
      isRevealedHint: false,
    }));
  }

  const shakeClass = isCurrentRow && isShaking ? "animate-shake" : "";

  return (
    <div
      data-testid={`wordle-row-${rowIndex}`}
      role="group"
      aria-label={`Hàng ${rowIndex + 1}`}
      className={`flex items-center justify-center gap-1.5 sm:gap-2 ${shakeClass} ${className}`}
    >
      {evaluatedTiles.map((tile, colIndex) => (
        <WordleTile
          key={colIndex}
          index={colIndex}
          char={tile.char}
          status={tile.status}
          isRevealedHint={tile.isRevealedHint}
          isWinning={isWinning}
          isCurrentRow={isCurrentRow}
        />
      ))}
    </div>
  );
};
