export type BattleState =
  | "STAGE_INTRO"
  | "PLAYER_TURN"
  | "CHALLENGE_ACTIVE"
  | "RESOLVING_ACTION"
  | "CHECK_HEALTH"
  | "WAVE_TRANSITION"
  | "VICTORY"
  | "DEFEAT";

export type SkillType = "ATTACK" | "SHIELD" | "ULTIMATE";

export interface ChallengeQuestion {
  id: string;
  type: SkillType;
  prompt: string;
  targetWord: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  phonetic?: string;
  emoji?: string;
}

export interface MonsterConfig {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  damage: number;
  avatar: string;
  color: string;
}

export interface MissedQuestionReview {
  question: ChallengeQuestion;
  selectedAnswer: string;
  correctAnswer: string;
  timestamp: number;
}
