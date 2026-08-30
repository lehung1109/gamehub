import { GrammarRuleCard, ErrorHunterItem, AttemptItem, StageProgress } from "./tenses";
export type { GrammarRuleCard, ErrorHunterItem, AttemptItem, StageProgress };

export type PartsOfSpeechStatus = "active" | "coming_soon";
export type PartsOfSpeechStageType = "wordFamily" | "fillInBlank" | "errorHunting";

export interface PartsOfSpeechMetadata {
  id: string;
  slug: string;
  name: string;
  vietnameseName: string;
  status: PartsOfSpeechStatus;
  description: string;
  estimatedMinutes: number;
}

export interface WordFamilyItem {
  id: string;
  baseWord: string;
  targetWord: string;
  options: string[];
  explanationVi: string;
}

export interface FillInBlankItem {
  id: string;
  contextType: "email" | "chat" | "report";
  textBefore: string;
  textAfter: string;
  correctAnswer: string;
  options: string[];
  explanationVi: string;
}

export interface PartsOfSpeechChallenges {
  wordFamily: WordFamilyItem[];
  fillInBlank: FillInBlankItem[];
  errorHunting: ErrorHunterItem[];
}

export interface PartsOfSpeechModuleData {
  metadata: PartsOfSpeechMetadata;
  quickRules: GrammarRuleCard[];
  challenges: PartsOfSpeechChallenges;
}

export interface PartsOfSpeechProgressRecord {
  lessonId: string;
  completed: boolean;
  stageScores: {
    wordFamily: StageProgress;
    fillInBlank: StageProgress;
    errorHunting: StageProgress;
  };
  totalScore: number;
  maxPossibleScore: number;
  accuracyPercentage: number;
  lastStudiedAt: string;
}

export type PartsOfSpeechProgressMap = Record<string, PartsOfSpeechProgressRecord>;

export interface IPartsOfSpeechProgressStorage {
  getProgress(lessonId: string): PartsOfSpeechProgressRecord | null;
  getAllProgress(): PartsOfSpeechProgressMap;
  saveStageProgress(
    lessonId: string,
    stage: PartsOfSpeechStageType,
    score: number,
    total: number,
    attemptHistory?: AttemptItem[]
  ): PartsOfSpeechProgressRecord;
  resetProgress(lessonId: string): void;
}
