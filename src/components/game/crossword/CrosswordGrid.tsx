"use client";

import React from "react";
import { CrosswordBoard, CrosswordWord, Direction } from "@/types/crossword";
import { CrosswordCellItem } from "./CrosswordCellItem";

interface CrosswordGridProps {
  board: CrosswordBoard;
  selectedCell: { row: number; col: number };
  direction?: Direction;
  activeWord: CrosswordWord | null;
  onSelectCell: (row: number, col: number) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  board,
  selectedCell,
  activeWord,
  onSelectCell,
}) => {
  const isCellInActiveWord = (r: number, c: number) => {
    if (!activeWord) return false;
    if (activeWord.direction === "across") {
      return (
        r === activeWord.startRow &&
        c >= activeWord.startCol &&
        c < activeWord.startCol + activeWord.word.length
      );
    }
    return (
      c === activeWord.startCol &&
      r >= activeWord.startRow &&
      r < activeWord.startRow + activeWord.word.length
    );
  };

  const solvedWordIds = React.useMemo(() => {
    return new Set(board.words.filter((w) => w.isSolved).map((w) => w.id));
  }, [board.words]);

  const isCellSolved = (cell: (typeof board.grid)[0][0]) => {
    return Boolean(
      (cell.acrossWordId && solvedWordIds.has(cell.acrossWordId)) ||
      (cell.downWordId && solvedWordIds.has(cell.downWordId))
    );
  };

  return (
    <div className="w-full max-w-lg aspect-square bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-3 md:p-4 shadow-2xl flex flex-col justify-center">
      <div
        role="region"
        aria-label="Crossword grid"
        className="grid gap-1.5 w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${board.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${board.rows}, minmax(0, 1fr))`,
        }}
      >
        {board.grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <CrosswordCellItem
              key={`${rIdx}-${cIdx}`}
              cell={cell}
              isSelected={selectedCell.row === rIdx && selectedCell.col === cIdx}
              isInActiveWord={isCellInActiveWord(rIdx, cIdx)}
              isSolved={isCellSolved(cell)}
              onSelect={() => onSelectCell(rIdx, cIdx)}
            />
          ))
        )}
      </div>
    </div>
  );
};
