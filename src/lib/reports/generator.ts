// src/lib/reports/generator.ts

import type { CertificateTemplate, CertificateType } from '@/types/certificates'
import type { SkillPerformance, SrsBoxMetrics } from '@/types/reports'

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/**
 * Generate an uppercase high-entropy verification code for student certificates
 * e.g. GH-CERT-7X8K2M
 */
export function generateCertificateVerificationCode(): string {
  let randomPart = ''
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length)
    randomPart += ALPHABET[randomIndex]
  }
  return `GH-CERT-${randomPart}`
}

/**
 * Returns available certificate award templates
 */
export function getCertificateTemplates(): CertificateTemplate[] {
  return [
    {
      type: 'vocab_master',
      defaultTitle: 'Chiến Binh Từ Vựng Xuất Sắc',
      defaultAchievementText:
        'Đã rèn luyện bền bỉ và ghi nhớ từ vựng tiếng Anh với độ chính xác và thành tích vượt trội.',
      badgeEmoji: '📚',
      badgeLabel: 'Vocabulary Master',
      accentColor: 'emerald',
    },
    {
      type: 'streak_champion',
      defaultTitle: 'Ngôi Sao Chăm Chỉ Kiên Trì',
      defaultAchievementText:
        'Đã liên tục duy trì chuỗi ngày học tập và nỗ lực rèn luyện tiếng Anh không ngừng nghỉ.',
      badgeEmoji: '🔥',
      badgeLabel: 'Streak Champion',
      accentColor: 'amber',
    },
    {
      type: 'arena_victor',
      defaultTitle: 'Bậc Thầy Đấu Trường Trực Tiếp',
      defaultAchievementText:
        'Đã xuất sắc đạt vị trí dẫn đầu và chiến thắng thuyết phục trong các trận Đấu Trường Trực Tiếp.',
      badgeEmoji: '⚔️',
      badgeLabel: 'Arena Victor',
      accentColor: 'rose',
    },
    {
      type: 'course_completion',
      defaultTitle: 'Chứng Nhận Hoàn Thành Khóa Học',
      defaultAchievementText:
        'Đã xuất sắc hoàn thành toàn diện các chuyên đề rèn luyện tiếng Anh tiểu học cùng GameHub.',
      badgeEmoji: '🎓',
      badgeLabel: 'Course Graduate',
      accentColor: 'indigo',
    },
    {
      type: 'custom',
      defaultTitle: 'Giấy Khen Danh Dự',
      defaultAchievementText:
        'Đã có sự tiến bộ vượt bậc và thái độ học tập tích cực đáng khen ngợi trong lớp học.',
      badgeEmoji: '🌟',
      badgeLabel: 'Honor Award',
      accentColor: 'purple',
    },
  ]
}

const GAME_SKILL_MAP: Record<string, { key: string; label: string }> = {
  // Vocabulary
  vocab: { key: 'vocabulary', label: 'Từ Vựng' },
  flashcards: { key: 'vocabulary', label: 'Từ Vựng' },
  'falling-words': { key: 'vocabulary', label: 'Từ Vựng' },
  'word-connect': { key: 'vocabulary', label: 'Từ Vựng' },
  'word-search': { key: 'vocabulary', label: 'Từ Vựng' },
  'vocab-defense': { key: 'vocabulary', label: 'Từ Vựng' },
  wordle: { key: 'vocabulary', label: 'Từ Vựng' },
  'odd-one-out': { key: 'vocabulary', label: 'Từ Vựng' },

  // Grammar
  'grammar-detective': { key: 'grammar', label: 'Ngữ Pháp' },
  sentences: { key: 'grammar', label: 'Ngữ Pháp' },
  'present-simple': { key: 'grammar', label: 'Ngữ Pháp' },
  tenses: { key: 'grammar', label: 'Ngữ Pháp' },
  'parts-of-speech': { key: 'grammar', label: 'Ngữ Pháp' },

  // Pronunciation
  pronunciation: { key: 'pronunciation', label: 'Phát Âm & Nói' },
  speaking: { key: 'pronunciation', label: 'Phát Âm & Nói' },
  roleplay: { key: 'pronunciation', label: 'Phát Âm & Nói' },

  // Spelling
  spelling: { key: 'spelling', label: 'Chính Tả' },
  'alphabet-quiz': { key: 'spelling', label: 'Chính Tả' },
  typing: { key: 'spelling', label: 'Chính Tả' },

  // Reading
  reading: { key: 'reading', label: 'Đọc Hiểu' },
  crossword: { key: 'reading', label: 'Đọc Hiểu' },

  // Listening
  listening: { key: 'listening', label: 'Luyện Nghe' },
  'numbers-colors': { key: 'listening', label: 'Luyện Nghe' },
}

interface RawSessionInput {
  gameType: string
  score: number | null
  totalQuestions: number | null
}

/**
 * Categorize student sessions into educational skill domains
 */
export function computeStudentSkillBreakdown(
  sessions: RawSessionInput[]
): SkillPerformance[] {
  if (!sessions || sessions.length === 0) return []

  const buckets: Record<
    string,
    {
      key: string
      label: string
      sessionCount: number
      totalQuestions: number
      totalCorrect: number
    }
  > = {}

  for (const sess of sessions) {
    const skillMeta = GAME_SKILL_MAP[sess.gameType] || {
      key: 'other',
      label: 'Kỹ Năng Khác',
    }

    if (!buckets[skillMeta.key]) {
      buckets[skillMeta.key] = {
        key: skillMeta.key,
        label: skillMeta.label,
        sessionCount: 0,
        totalQuestions: 0,
        totalCorrect: 0,
      }
    }

    const item = buckets[skillMeta.key]
    item.sessionCount += 1
    const totalQ = Math.max(0, sess.totalQuestions || 0)
    const scoreVal = Math.max(0, sess.score || 0)
    item.totalQuestions += totalQ
    item.totalCorrect += Math.min(totalQ, scoreVal)
  }

  return Object.values(buckets).map((b) => {
    const accuracy =
      b.totalQuestions > 0 ? Math.round((b.totalCorrect / b.totalQuestions) * 100) : 0

    let rating: SkillPerformance['strengthRating'] = 'needs_practice'
    if (accuracy >= 85) rating = 'mastered'
    else if (accuracy >= 70) rating = 'proficient'
    else if (accuracy >= 50) rating = 'developing'

    return {
      skillKey: b.key,
      label: b.label,
      sessionCount: b.sessionCount,
      totalQuestions: b.totalQuestions,
      totalCorrect: b.totalCorrect,
      accuracyPercent: accuracy,
      strengthRating: rating,
    }
  })
}

interface RawSrsCardInput {
  box: number
  isMastered?: boolean
}

/**
 * Calculate SRS Leitner box metrics & mastery rate
 */
export function computeSrsMetrics(cards: RawSrsCardInput[]): SrsBoxMetrics {
  if (!cards || cards.length === 0) {
    return {
      totalCards: 0,
      box1: 0,
      box2: 0,
      box3: 0,
      box4: 0,
      box5: 0,
      masteredCount: 0,
      masteryRatePercent: 0,
    }
  }

  let box1 = 0
  let box2 = 0
  let box3 = 0
  let box4 = 0
  let box5 = 0

  for (const card of cards) {
    const b = card.box || 1
    if (b === 1) box1++
    else if (b === 2) box2++
    else if (b === 3) box3++
    else if (b === 4) box4++
    else if (b >= 5) box5++
  }

  const masteredCount = box4 + box5
  const totalCards = cards.length
  const masteryRatePercent =
    totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0

  return {
    totalCards,
    box1,
    box2,
    box3,
    box4,
    box5,
    masteredCount,
    masteryRatePercent,
  }
}

/**
 * Generate encouraging pedagogical commentary in Vietnamese
 */
export function generateAutomatedTeacherRemark(input: {
  studentName: string
  overallAccuracy: number
  topSkill: string
  streakDays: number
  masteredWords: number
}): string {
  const { studentName, overallAccuracy, topSkill, streakDays, masteredWords } = input

  if (overallAccuracy >= 85) {
    return `${studentName} có tinh thần học tập rất tích cực và đạt kết quả xuất sắc trong học kỳ này! Em thể hiện vượt trội ở mảng ${topSkill} với độ chính xác đạt ${overallAccuracy}%. Chuỗi học ${streakDays} ngày và ${masteredWords} từ vựng làm chủ chứng minh sự kiên trì tuyệt vời của em.`
  }

  if (overallAccuracy >= 70) {
    return `${studentName} học tập chăm chỉ và tiến bộ rõ rệt, đặc biệt phát huy tốt ở phần ${topSkill}. Với ${masteredWords} từ vựng đã ghi nhớ sâu, em hãy tiếp tục rèn luyện hàng ngày để bứt phá đạt điểm số tối đa nhé!`
  }

  return `${studentName} đã có nhiều cố gắng trong việc hoàn thành các bài học và thử thách tiếng Anh. Em có tiềm năng tốt ở mảng ${topSkill}. Hãy tiếp tục ôn tập Sổ tay từ khó thường xuyên để cải thiện độ chính xác hơn nữa nhé!`
}
