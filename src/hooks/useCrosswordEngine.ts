import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CrosswordBoard, CrosswordCell, CrosswordWord, Direction } from "@/types/crossword";
import { generateCrosswordBoard } from "@/lib/crossword/crossword-generator";

function evaluateBoardState(
  grid: CrosswordCell[][],
  words: CrosswordWord[]
): { nextWords: CrosswordWord[]; isCompleted: boolean } {
  let allFilledAndCorrect = true;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (!cell.isBlocked) {
        if (cell.userChar !== cell.char) {
          allFilledAndCorrect = false;
        }
      }
    }
  }

  const nextWords = words.map((w) => {
    let isWordSolved = true;
    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === "across" ? w.startRow : w.startRow + i;
      const c = w.direction === "across" ? w.startCol + i : w.startCol;
      const cell = grid[r]?.[c];
      if (!cell || cell.userChar !== w.word[i]) {
        isWordSolved = false;
        break;
      }
    }
    return w.isSolved === isWordSolved ? w : { ...w, isSolved: isWordSolved };
  });

  return { nextWords, isCompleted: allFilledAndCorrect };
}

export function useCrosswordEngine(initialTopicId = "animals") {
  const [topicId, setTopicId] = useState(initialTopicId);
  const [board, setBoard] = useState<CrosswordBoard>(() => generateCrosswordBoard(initialTopicId));
  const [direction, setDirection] = useState<Direction>(() => board.words[0]?.direction || "across");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>(() => {
    const firstWord = board.words[0];
    return { row: firstWord.startRow, col: firstWord.startCol };
  });

  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wordsRevealed, setWordsRevealed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeWord = useMemo(() => {
    const currentCell = board.grid[selectedCell.row]?.[selectedCell.col];
    if (!currentCell || currentCell.isBlocked) return board.words[0];

    const wordId = direction === "across" ? currentCell.acrossWordId : currentCell.downWordId;
    if (wordId) {
      const found = board.words.find((w) => w.id === wordId);
      if (found) return found;
    }
    return (
      board.words.find((w) => w.id === currentCell.acrossWordId || w.id === currentCell.downWordId) ||
      board.words[0]
    );
  }, [board, selectedCell, direction]);

  const selectCell = useCallback(
    (row: number, col: number) => {
      const cell = board.grid[row]?.[col];
      if (!cell || cell.isBlocked) return;

      if (selectedCell.row === row && selectedCell.col === col) {
        // Toggle direction if cell has both across and down words
        if (cell.acrossWordId && cell.downWordId) {
          setDirection((prev) => (prev === "across" ? "down" : "across"));
        }
      } else {
        setSelectedCell({ row, col });
        if (direction === "across" && !cell.acrossWordId && cell.downWordId) {
          setDirection("down");
        } else if (direction === "down" && !cell.downWordId && cell.acrossWordId) {
          setDirection("across");
        }
      }
    },
    [board.grid, selectedCell, direction]
  );

  const selectClue = useCallback(
    (wordId: string) => {
      const word = board.words.find((w) => w.id === wordId);
      if (word) {
        setSelectedCell({ row: word.startRow, col: word.startCol });
        setDirection(word.direction);
      }
    },
    [board.words]
  );

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === "across" ? "down" : "across"));
  }, []);

  const typeLetter = useCallback(
    (char: string) => {
      if (isComplete) return;
      const upperChar = char.toUpperCase().slice(0, 1);
      if (!/^[A-Z]$/.test(upperChar)) return;

      const { row, col } = selectedCell;
      const currentCell = board.grid[row]?.[col];
      if (!currentCell || currentCell.isBlocked) return;

      // Guard: do not overwrite revealed hint letters
      if (!currentCell.isRevealed) {
        const nextGrid = board.grid.map((r) => r.map((c) => ({ ...c })));
        nextGrid[row][col].userChar = upperChar;
        const { nextWords, isCompleted } = evaluateBoardState(nextGrid, board.words);
        setBoard({ ...board, grid: nextGrid, words: nextWords });

        if (isCompleted) {
          setIsComplete(true);
          setScore((prev) => prev + board.words.length * 100);
        }
      }

      // Advance cursor in current direction
      const nextRow = direction === "down" ? row + 1 : row;
      const nextCol = direction === "across" ? col + 1 : col;

      if (
        nextRow < board.rows &&
        nextCol < board.cols &&
        !board.grid[nextRow][nextCol].isBlocked
      ) {
        setSelectedCell({ row: nextRow, col: nextCol });
      }
    },
    [board, selectedCell, direction, isComplete]
  );

  const handleBackspace = useCallback(() => {
    if (isComplete) return;
    const { row, col } = selectedCell;
    const currentCell = board.grid[row]?.[col];
    if (!currentCell || currentCell.isBlocked) return;

    if (!currentCell.isRevealed && currentCell.userChar !== "") {
      const nextGrid = board.grid.map((r) => r.map((c) => ({ ...c })));
      nextGrid[row][col].userChar = "";
      const { nextWords } = evaluateBoardState(nextGrid, board.words);
      setBoard({ ...board, grid: nextGrid, words: nextWords });
    } else {
      // Step back to previous unblocked cell
      const prevRow = direction === "down" ? row - 1 : row;
      const prevCol = direction === "across" ? col - 1 : col;

      if (
        prevRow >= 0 &&
        prevCol >= 0 &&
        !board.grid[prevRow][prevCol].isBlocked
      ) {
        setSelectedCell({ row: prevRow, col: prevCol });
        if (!board.grid[prevRow][prevCol].isRevealed) {
          const nextGrid = board.grid.map((r) => r.map((c) => ({ ...c })));
          nextGrid[prevRow][prevCol].userChar = "";
          const { nextWords } = evaluateBoardState(nextGrid, board.words);
          setBoard({ ...board, grid: nextGrid, words: nextWords });
        }
      }
    }
  }, [board, selectedCell, direction, isComplete]);

  const moveCursor = useCallback(
    (deltaRow: number, deltaCol: number) => {
      let r = selectedCell.row + deltaRow;
      let c = selectedCell.col + deltaCol;
      while (r >= 0 && r < board.rows && c >= 0 && c < board.cols) {
        if (!board.grid[r][c].isBlocked) {
          setSelectedCell({ row: r, col: c });
          break;
        }
        r += deltaRow;
        c += deltaCol;
      }
    },
    [board, selectedCell]
  );

  const revealLetter = useCallback(() => {
    if (isComplete) return;
    const { row, col } = selectedCell;
    const cell = board.grid[row]?.[col];
    if (!cell || cell.isBlocked || cell.isRevealed) return;

    const nextGrid = board.grid.map((r) => r.map((c) => ({ ...c })));
    nextGrid[row][col].userChar = cell.char;
    nextGrid[row][col].isRevealed = true;
    const { nextWords, isCompleted } = evaluateBoardState(nextGrid, board.words);

    setBoard({ ...board, grid: nextGrid, words: nextWords });
    setHintsUsed((prev) => prev + 1);
    setScore((prev) => prev - 10 + (isCompleted ? board.words.length * 100 : 0));
    if (isCompleted) {
      setIsComplete(true);
    }
  }, [board, selectedCell, isComplete]);

  const revealWord = useCallback(
    (targetWord?: CrosswordWord) => {
      if (isComplete) return;
      const wordToReveal = targetWord || activeWord;
      if (!wordToReveal) return;

      const wordInBoard = board.words.find((w) => w.id === wordToReveal.id);
      if (wordToReveal.isRevealed || wordInBoard?.isRevealed) return;

      // Check if all cells for that word already have userChar === char
      let allLettersMatch = true;
      for (let i = 0; i < wordToReveal.word.length; i++) {
        const r = wordToReveal.direction === "across" ? wordToReveal.startRow : wordToReveal.startRow + i;
        const c = wordToReveal.direction === "across" ? wordToReveal.startCol + i : wordToReveal.startCol;
        const cell = board.grid[r]?.[c];
        if (!cell || cell.userChar !== wordToReveal.word[i]) {
          allLettersMatch = false;
          break;
        }
      }
      if (allLettersMatch) return;

      const nextGrid = board.grid.map((r) => r.map((c) => ({ ...c })));
      for (let i = 0; i < wordToReveal.word.length; i++) {
        const r = wordToReveal.direction === "across" ? wordToReveal.startRow : wordToReveal.startRow + i;
        const c = wordToReveal.direction === "across" ? wordToReveal.startCol + i : wordToReveal.startCol;
        nextGrid[r][c].userChar = wordToReveal.word[i];
        nextGrid[r][c].isRevealed = true;
      }
      const updatedWords = board.words.map((w) =>
        w.id === wordToReveal.id ? { ...w, isRevealed: true, isSolved: true } : w
      );
      const { nextWords, isCompleted } = evaluateBoardState(nextGrid, updatedWords);

      setBoard({ ...board, grid: nextGrid, words: nextWords });
      setWordsRevealed((prev) => prev + 1);
      setScore((prev) => prev - 30 + (isCompleted ? board.words.length * 100 : 0));
      if (isCompleted) {
        setIsComplete(true);
      }
    },
    [activeWord, board, isComplete]
  );

  const loadNewPuzzle = useCallback((newTopicId?: string) => {
    const targetTopic = newTopicId || topicId;
    if (newTopicId) setTopicId(newTopicId);
    const newBoard = generateCrosswordBoard(targetTopic);
    setBoard(newBoard);
    const firstWord = newBoard.words[0];
    setSelectedCell({ row: firstWord.startRow, col: firstWord.startCol });
    setDirection(firstWord?.direction || "across");
    setScore(0);
    setHintsUsed(0);
    setWordsRevealed(0);
    setIsComplete(false);
    setElapsedSeconds(0);
  }, [topicId]);

  // Timer
  useEffect(() => {
    if (!isComplete) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isComplete]);

  return {
    topicId,
    board,
    selectedCell,
    direction,
    activeWord,
    score,
    hintsUsed,
    wordsRevealed,
    isComplete,
    elapsedSeconds,
    typeLetter,
    handleBackspace,
    moveCursor,
    toggleDirection,
    selectCell,
    selectClue,
    revealLetter,
    revealWord,
    loadNewPuzzle,
  };
}
