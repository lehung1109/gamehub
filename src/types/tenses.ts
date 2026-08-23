/**
 * Tense Module Data & Service Contract
 * Feature: 006-workplace-tense-practice
 * 
 * Standalone, decoupled types for workplace English tense practice.
 */

export type TenseGroup = "present" | "past" | "future";
export type TenseStatus = "active" | "coming_soon";
export type TenseLevel = "A1-A2 (Beginner)" | "B1-B2 (Intermediate)" | "C1-C2 (Advanced)";
export type WorkplaceContextType = "email" | "meeting" | "routine" | "report" | "chat";
export type StageType = "conjugation" | "errorHunting" | "sentenceBuilding";

export interface TenseMetadata {
  id: string;
  slug: string;
  name: string;
  vietnameseName: string;
  group: TenseGroup;
  status: TenseStatus;
  level: TenseLevel;
  badge?: string;
  description: string;
  estimatedMinutes: number;
  challengeCount: number;
}

export interface RuleFormula {
  label: string;
  structure: string;
  example: string;
  vietnameseTranslation: string;
}

export interface GrammarRuleCard {
  id: string;
  category: "to-be" | "action-verbs" | "spelling-rules" | "adverbs-frequency" | "workplace-usage";
  titleVi: string;
  titleEn: string;
  summaryVi: string;
  formulas?: RuleFormula[];
  rulesList?: Array<{
    ruleVi: string;
    condition: string;
    examples: Array<{
      en: string;
      vi: string;
      note?: string;
    }>;
  }>;
  workplaceTips?: string[];
}

export interface ConjugationItem {
  id: string;
  contextType: WorkplaceContextType;
  scenarioVi: string;
  sender?: string;
  recipient?: string;
  subject?: string;
  textBefore: string;
  baseVerb: string;
  textAfter: string;
  correctAnswer: string;
  acceptableAlternatives?: string[];
  options: string[];
  explanation: {
    ruleVi: string;
    detailedAnalysisVi: string;
  };
}

export interface ErrorTokenOption {
  value: string;
  label: string;
  isCorrect: boolean;
}

export interface ErrorHunterItem {
  id: string;
  scenarioVi: string;
  tokens: string[];
  errorTokenIndex: number;
  correctToken: string;
  options: ErrorTokenOption[];
  fullCorrectSentence: string;
  vietnameseMeaning: string;
  explanation: {
    whyWrongVi: string;
    workplaceImpactVi: string;
  };
}

export interface SentenceBuilderToken {
  id: string;
  text: string;
}

export interface SentenceBuilderItem {
  id: string;
  scenarioVi: string;
  vietnameseMeaning: string;
  scrambledTokens: SentenceBuilderToken[];
  correctTokenOrder: string[];
  fullSentenceEn: string;
  grammarTip: {
    titleVi: string;
    tipVi: string;
  };
}

export interface TenseChallenges {
  conjugation: ConjugationItem[];
  errorHunting: ErrorHunterItem[];
  sentenceBuilding: SentenceBuilderItem[];
}

export interface TenseModuleData {
  metadata: TenseMetadata;
  quickRules: GrammarRuleCard[];
  challenges: TenseChallenges;
}

export interface StageProgress {
  score: number;
  total: number;
  passed: boolean;
  completedAt?: string;
}

export interface TenseUserProgressRecord {
  tenseId: string;
  completed: boolean;
  stageScores: {
    conjugation: StageProgress;
    errorHunting: StageProgress;
    sentenceBuilding: StageProgress;
  };
  totalScore: number;
  maxPossibleScore: number;
  accuracyPercentage: number;
  lastStudiedAt: string;
}

export type TensesProgressMap = Record<string, TenseUserProgressRecord>;

/**
 * Storage Service Contract for Local Progress Persistence
 */
export interface ITenseProgressStorage {
  getProgress(tenseId: string): TenseUserProgressRecord | null;
  getAllProgress(): TensesProgressMap;
  saveStageProgress(
    tenseId: string,
    stage: StageType,
    score: number,
    total: number
  ): TenseUserProgressRecord;
  resetProgress(tenseId: string): void;
}
