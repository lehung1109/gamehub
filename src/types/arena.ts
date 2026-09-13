// src/types/arena.ts

export type ArenaStatus =
  | 'lobby'
  | 'in_progress'
  | 'reveal'
  | 'leaderboard'
  | 'finished'
  | 'cancelled'

export type ArenaQuestionType = 'multiple_choice' | 'true_false' | 'phonics_audio'

export interface ArenaQuestion {
  id: string
  question: string
  options: string[] // 4 options for Kahoot-style tiles, or 2 for True/False
  correctAnswer: string
  explanation?: string
  timeLimitSeconds: number // Default 15s
  points: number // Default 1000
  questionType?: ArenaQuestionType
  audioPromptUrl?: string
  pointsMultiplier?: number
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

export type ArenaRealtimeEvent =
  | {
      type: 'ROUND_START'
      questionIndex: number
      question: ArenaQuestion
      timeLimitSeconds: number
    }
  | {
      type: 'ANSWER_SUBMITTED'
      questionIndex: number
      studentName: string
      optionIndex: number
    }
  | {
      type: 'ROUND_REVEAL'
      questionIndex: number
      correctAnswer: string
      explanation?: string
    }
  | {
      type: 'LEADERBOARD_UPDATE'
      topParticipants: LiveArenaParticipant[]
    }
  | {
      type: 'ARENA_FINISHED'
      podium: Array<{
        rank: number
        studentName: string
        avatar: string
        score: number
        starsAwarded: number
        medalEmoji: string
      }>
    }
  | {
      type: 'PARTICIPANT_JOINED'
      participant: LiveArenaParticipant
    }
  | {
      type: 'PARTICIPANT_KICKED'
      studentName: string
    }

export interface ArenaSoundConfig {
  soundEnabled: boolean
  musicVolume: number
  sfxVolume: number
}

export interface HardQuestionSummary {
  questionId: string
  questionText: string
  incorrectRate: number
  totalAttempts: number
  incorrectCount: number
}
