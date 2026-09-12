// src/types/duels.ts

export type DuelStatus =
  | 'waiting'
  | 'ready'
  | 'in_progress'
  | 'finished'
  | 'cancelled'

export interface DuelQuestion {
  id: string
  prompt: string
  options: string[]
  correctAnswer: string
  explanationVi?: string
}

export interface DuelPlayer {
  name: string
  avatar: string
  score: number
  streak: number
}

export interface DuelAnswer {
  questionIndex: number
  selectedOption?: string
  isCorrect: boolean
  elapsedMs: number
  pointsEarned: number
}

export interface DuelScoreResult {
  pointsEarned: number
  newStreak: number
  isCorrect: boolean
}

export interface DuelWinnerResult {
  winnerName: string | null
  isTie: boolean
}

export interface DuelState {
  id: string
  code: string
  topic: string
  status: DuelStatus
  player1: DuelPlayer
  player2?: DuelPlayer
  player1Answers?: DuelAnswer[]
  player2Answers?: DuelAnswer[]
  currentQuestionIndex: number
  questions: DuelQuestion[]
  winnerName?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateDuelInput {
  playerName: string
  avatar: string
  topic?: string
  questionCount?: number
}

export interface JoinDuelInput {
  code: string
  playerName: string
  avatar: string
}

export interface SubmitDuelAnswerInput {
  duelId: string
  playerRole: 'player1' | 'player2'
  questionIndex: number
  isCorrect: boolean
  elapsedMs: number
  selectedOption?: string
}
