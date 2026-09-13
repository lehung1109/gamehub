// src/types/adaptive-learning.ts

export type SkillDomain = 'phonics' | 'vocabulary' | 'grammar' | 'listening'

export type CefrLevel = 'Pre-A1' | 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2'

export type SkillMasteryStatus = 'mastered' | 'progressing' | 'needs_attention'

export interface SkillNode {
  id: string
  domain: SkillDomain
  nameVi: string
  descriptionVi: string
  targetGameId: string
  targetTopicId?: string
  defaultThreshold: number
}

export interface StudentSkillMastery {
  skillId: string
  score: number
  accuracyPercentage: number
  totalAttempts: number
  status: SkillMasteryStatus
  lastPracticedAt?: string
}

export interface StudentDiagnosticProfile {
  studentId: string
  studentName: string
  domainScores: Record<SkillDomain, number>
  weakNodes: SkillNode[]
  strongNodes: SkillNode[]
  estimatedCefrLevel: CefrLevel
  ddaMultiplier: number
  overallMastery: number
}

export type AdaptiveStepType = 'warm_up' | 'core_drill' | 'boss_challenge'

export interface AdaptiveDailyPackStep {
  stepNumber: 1 | 2 | 3
  type: AdaptiveStepType
  titleVi: string
  descriptionVi: string
  targetGameId: string
  targetUrl: string
  targetTopic?: string
  expReward: number
  isCompleted: boolean
}

export interface AdaptiveDailyPlan {
  id: string
  date: string
  studentId: string
  steps: AdaptiveDailyPackStep[]
  totalExpReward: number
  isFullyCompleted: boolean
}

export type StudentTier = 'support' | 'target' | 'advanced'

export interface StudentDiagnosticRow {
  studentId: string
  studentName: string
  overallScore: number
  tier: StudentTier
  domainScores: Record<SkillDomain, number>
  primaryWeakSkill: string
}

export interface ClassDiagnosticSummary {
  classId: string
  className: string
  studentCount: number
  domainAverages: Record<SkillDomain, number>
  weakSkillFrequencies: Array<{ skillId: string; skillNameVi: string; count: number }>
  studentRows: StudentDiagnosticRow[]
}
