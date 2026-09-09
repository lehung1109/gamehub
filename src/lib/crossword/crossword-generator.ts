import { CrosswordBoard, CrosswordCell, CrosswordWord, Direction } from "@/types/crossword";
import animalsData from "@/data/words/animals.json";
import fruitsData from "@/data/words/fruits.json";
import schoolData from "@/data/words/school.json";

interface RawWord {
  id: string;
  english: string;
  vietnamese: string;
  phonetic?: string;
  emoji?: string;
  topicId: string;
}

const TOPIC_POOLS: Record<string, RawWord[]> = {
  animals: animalsData as RawWord[],
  fruits: fruitsData as RawWord[],
  school: schoolData as RawWord[],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateSingleBoard(topicId = "animals", targetWordCount = 5): CrosswordBoard {
  const pool = TOPIC_POOLS[topicId] || animalsData;
  const filteredWords = pool
    .map((w) => ({
      ...w,
      cleanWord: w.english.trim().toUpperCase().replace(/[^A-Z]/g, ""),
    }))
    .filter((w) => w.cleanWord.length >= 3 && w.cleanWord.length <= 8);

  const GRID_SIZE = 10;
  const grid: CrosswordCell[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => ({
      row: r,
      col: c,
      char: "",
      userChar: "",
      isBlocked: true,
    }))
  );

  const placedWords: CrosswordWord[] = [];
  const shuffledCandidates = shuffle(filteredWords);

  // 1. Place seed word horizontally in the center
  const seed = shuffledCandidates[0];
  const seedWord = seed.cleanWord;
  const startRow = Math.floor(GRID_SIZE / 2) - 1;
  const startCol = Math.max(0, Math.floor((GRID_SIZE - seedWord.length) / 2));

  for (let i = 0; i < seedWord.length; i++) {
    grid[startRow][startCol + i].char = seedWord[i];
    grid[startRow][startCol + i].isBlocked = false;
    grid[startRow][startCol + i].acrossWordId = seed.id;
  }

  placedWords.push({
    id: seed.id,
    word: seedWord,
    clue: seed.vietnamese,
    phonetic: seed.phonetic,
    emoji: seed.emoji,
    direction: "across",
    startRow,
    startCol,
    number: 1,
    isSolved: false,
    isRevealed: false,
  });

  // 2. Try placing remaining candidates intersecting with existing words
  for (let cIdx = 1; cIdx < shuffledCandidates.length; cIdx++) {
    if (placedWords.length >= targetWordCount) break;
    const candidate = shuffledCandidates[cIdx];
    const candidateStr = candidate.cleanWord;

    let placed = false;
    for (const existing of placedWords) {
      if (placed) break;
      const targetDir: Direction = existing.direction === "across" ? "down" : "across";

      // Find intersection letters
      for (let ePos = 0; ePos < existing.word.length; ePos++) {
        if (placed) break;
        const targetChar = existing.word[ePos];
        const cPos = candidateStr.indexOf(targetChar);
        if (cPos === -1) continue;

        // Calculate start position
        const intersectRow = existing.direction === "across" ? existing.startRow : existing.startRow + ePos;
        const intersectCol = existing.direction === "across" ? existing.startCol + ePos : existing.startCol;

        const candidateStartRow = targetDir === "down" ? intersectRow - cPos : intersectRow;
        const candidateStartCol = targetDir === "across" ? intersectCol - cPos : intersectCol;

        // Bounding check
        if (candidateStartRow < 0 || candidateStartCol < 0) continue;
        if (targetDir === "down" && candidateStartRow + candidateStr.length > GRID_SIZE) continue;
        if (targetDir === "across" && candidateStartCol + candidateStr.length > GRID_SIZE) continue;

        // Collision & spacing check
        let valid = true;

        // Boundary spacing: cells immediately before and after must not be unblocked letters
        if (targetDir === "across") {
          const beforeCol = candidateStartCol - 1;
          const afterCol = candidateStartCol + candidateStr.length;
          if (beforeCol >= 0 && !grid[candidateStartRow][beforeCol].isBlocked) {
            valid = false;
          }
          if (afterCol < GRID_SIZE && !grid[candidateStartRow][afterCol].isBlocked) {
            valid = false;
          }
        } else {
          const beforeRow = candidateStartRow - 1;
          const afterRow = candidateStartRow + candidateStr.length;
          if (beforeRow >= 0 && !grid[beforeRow][candidateStartCol].isBlocked) {
            valid = false;
          }
          if (afterRow < GRID_SIZE && !grid[afterRow][candidateStartCol].isBlocked) {
            valid = false;
          }
        }

        if (valid) {
          for (let i = 0; i < candidateStr.length; i++) {
            const r = targetDir === "down" ? candidateStartRow + i : candidateStartRow;
            const c = targetDir === "across" ? candidateStartCol + i : candidateStartCol;
            const cell = grid[r][c];

            // Can overlap ONLY if character matches and direction not already occupied
            if (!cell.isBlocked) {
              if (cell.char !== candidateStr[i]) {
                valid = false;
                break;
              }
              if (targetDir === "across" && cell.acrossWordId) {
                valid = false;
                break;
              }
              if (targetDir === "down" && cell.downWordId) {
                valid = false;
                break;
              }
            }
          }
        }

        if (valid) {
          // Place candidate
          for (let i = 0; i < candidateStr.length; i++) {
            const r = targetDir === "down" ? candidateStartRow + i : candidateStartRow;
            const c = targetDir === "across" ? candidateStartCol + i : candidateStartCol;
            grid[r][c].char = candidateStr[i];
            grid[r][c].isBlocked = false;
            if (targetDir === "across") grid[r][c].acrossWordId = candidate.id;
            else grid[r][c].downWordId = candidate.id;
          }

          placedWords.push({
            id: candidate.id,
            word: candidateStr,
            clue: candidate.vietnamese,
            phonetic: candidate.phonetic,
            emoji: candidate.emoji,
            direction: targetDir,
            startRow: candidateStartRow,
            startCol: candidateStartCol,
            number: 1, // updated below
            isSolved: false,
            isRevealed: false,
          });
          placed = true;
        }
      }
    }
  }

  // 3. Assign clue numbers row-by-row, column-by-column
  let nextNumber = 1;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const startingWords = placedWords.filter((w) => w.startRow === r && w.startCol === c);
      if (startingWords.length > 0) {
        grid[r][c].clueNumber = nextNumber;
        for (const w of startingWords) {
          w.number = nextNumber;
        }
        nextNumber++;
      }
    }
  }

  // Sort words ascending by clue number
  placedWords.sort((a, b) => a.number - b.number);

  return {
    rows: GRID_SIZE,
    cols: GRID_SIZE,
    grid,
    words: placedWords,
    topicId,
  };
}

export function generateCrosswordBoard(topicId = "animals", targetWordCount = 5): CrosswordBoard {
  const minRequired = Math.min(targetWordCount, 4);
  let bestBoard: CrosswordBoard | null = null;

  for (let attempt = 0; attempt < 50; attempt++) {
    const board = generateSingleBoard(topicId, targetWordCount);
    if (board.words.length >= minRequired) {
      return board;
    }
    if (!bestBoard || board.words.length > bestBoard.words.length) {
      bestBoard = board;
    }
  }

  return bestBoard ?? generateSingleBoard(topicId, targetWordCount);
}
