// src/types/speaking.ts

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type SpeakingAccent = 'us' | 'uk' | 'neutral';

export type SpeakingHintLevel = 'starter' | 'natural' | 'expressive';

export type SpeakingRating = 'slow' | 'optimal' | 'fast';

export interface SpeakingPersona {
  id: string;
  name: string;
  avatar: string;
  role: string;
  accent: SpeakingAccent;
  toneVi: string;
}

export interface SpeakingScaffoldingHint {
  level: SpeakingHintLevel;
  textEn: string;
  textVi: string;
  phoneticHint?: string;
}

export interface SpeakingWordMatch {
  word: string;
  isMatch: boolean;
  score: number;
}

export interface SpeakingDialogueTurn {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  audioUrl?: string;
  accuracyScore?: number;
  wordBreakdown?: SpeakingWordMatch[];
  feedbackVi?: string;
  timestamp: string;
}

export interface SpeakingScenario {
  id: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  level: CEFRLevel;
  icon: string;
  targetTurns: number;
  persona: SpeakingPersona;
  initialMessage: string;
  initialHints: SpeakingScaffoldingHint[];
}

export interface SpeakingSessionResult {
  scenarioId: string;
  personaId: string;
  totalTurns: number;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  stars: 1 | 2 | 3;
  xpEarned: number;
  mispronouncedWords: string[];
  turns: SpeakingDialogueTurn[];
}

export interface SendSpeakingTurnInput {
  scenarioId: string;
  personaId: string;
  userMessage: string;
  turnHistory: Array<{ sender: 'tutor' | 'student'; text: string }>;
  elapsedMs?: number;
}

export interface SpeakingTurnResponse {
  success: boolean;
  tutorMessage?: string;
  tutorAudioText?: string;
  hints?: SpeakingScaffoldingHint[];
  wordBreakdown?: SpeakingWordMatch[];
  accuracyScore?: number;
  feedbackVi?: string;
  isCompleted?: boolean;
  error?: string;
}

export interface CompleteSpeakingSessionInput {
  studentId?: string;
  scenarioId: string;
  personaId: string;
  totalTurns: number;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  turns: SpeakingDialogueTurn[];
  mispronouncedWords: string[];
}
