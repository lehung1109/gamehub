export interface HangmanWord {
  id: string;
  word: string; // Uppercase
  clue: string;
  phonetic?: string;
  emoji?: string;
}

export interface HangmanRoundHistory {
  word: HangmanWord;
  solved: boolean;
  mistakes: number;
  score: number;
}

export type KeyStatus = "default" | "correct" | "incorrect";

export interface HangmanState {
  topicId: string;
  wordList: HangmanWord[];
  currentIndex: number;
  currentWord: HangmanWord | null;
  guessedLetters: Set<string>;
  mistakesCount: number;
  maxMistakes: number;
  hintUsed: boolean;
  score: number;
  wordStatus: "playing" | "won" | "lost";
  isRoundComplete: boolean;
  history: HangmanRoundHistory[];
}
