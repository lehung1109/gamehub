export type LetterStatus = "correct" | "present" | "absent" | "empty" | "tbd";

export interface EvaluatedLetter {
  char: string;
  status: LetterStatus;
}

export type EvaluatedRow = EvaluatedLetter[];

export interface WordleTargetWord {
  id: string;
  word: string;
  length: 4 | 5 | 6;
  category: "animals" | "school" | "technology" | "daily-life" | "fruits" | "workplace";
  vietnameseMeaning: string;
  phonetic: string;
  partOfSpeech: "noun" | "verb" | "adjective";
  exampleSentence: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface WordleStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>; // 1 -> count, 2 -> count, ... 6 -> count
}
