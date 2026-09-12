// src/types/arena.ts

export type ArenaStatus =
  | 'lobby'
  | 'in_progress'
  | 'reveal'
  | 'leaderboard'
  | 'finished'
  | 'cancelled'

export interface ArenaQuestion {
  id: string
  question: string
  options: string[] // 4 options for Kahoot-style tiles
  correctAnswer: string
  explanation?: string
  timeLimitSeconds: number // Default 15s
  points: number // Default 1000
}

export interface ArenaParticipantAnswer {
  questionIndex: number
  selectedOption: string
  isCorrect: boolean
  responseTimeMs: number
  pointsEarned: number
}

export interface LiveArenaParticipant {
  id: string
  arenaId: string
  studentName: string
  classCode?: string | null
  avatar: string
  score: number
  streak: number
  answers: ArenaParticipantAnswer[]
  createdAt: string
  updatedAt: string
}

export interface LiveArena {
  id: string
  pinCode: string
  title: string
  teacherId?: string | null
  gameId: string
  configId?: string | null
  questions: ArenaQuestion[]
  status: ArenaStatus
  currentQuestionIndex: number
  roundStartedAt?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateArenaInput {
  title: string
  gameId: string
  configId?: string | null
  questions: ArenaQuestion[]
}

export interface JoinArenaInput {
  pinCode: string
  studentName: string
  avatar?: string
  classCode?: string
}

export interface SubmitArenaAnswerInput {
  arenaId: string
  studentName: string
  questionIndex: number
  selectedOption: string
  responseTimeMs: number
}
