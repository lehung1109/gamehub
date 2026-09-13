// src/types/ai-copilot.ts

import type { ArenaQuestion } from '@/types/arena'

export type PhonemeStatus = 'perfect' | 'near' | 'incorrect' | 'omitted'

export interface PhonemeBreakdown {
  phoneme: string
  ipa: string
  type: 'vowel' | 'consonant' | 'cluster'
  status: PhonemeStatus
  score: number // 0 to 100
  tipVi?: string
}

export interface PhonemeAssessmentResult {
  targetWord: string
  transcribedText: string
  accuracy: number // 0 to 100
  stars: 1 | 2 | 3
  isPassed: boolean
  hasDroppedFinalSound: boolean
  phonemes: PhonemeBreakdown[]
  overallFeedbackVi: string
  remediationAdviceVi: string
}

export interface CopilotLessonPlan {
  id: string
  title: string
  targetGrade: string
  durationMinutes: number
  focusPhonemes: string[]
  warmUpTongueTwister: string
  interactiveActivity: string
  recommendedGames: string[]
  teacherScriptVi: string
}

export interface GenerateArenaPromptInput {
  prompt: string
  gradeLevel?: 'grade-1' | 'grade-2' | 'grade-3' | 'grade-4' | 'grade-5'
  questionCount?: number
}

export interface GeneratedArenaPayload {
  title: string
  topic: string
  gradeLevel: string
  questions: ArenaQuestion[]
}
