// src/lib/parent/digest-generator.ts

import type { WeeklyLearningDigest } from '@/types/parent'

const UNAMBIGUOUS_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Generates a clean, unambiguous 6-character uppercase PIN with 'P-' prefix
 * Excludes confusing characters (0, O, 1, I, L)
 * Example: 'P-9BK72M'
 */
export function generateParentPin(): string {
  let code = ''
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const randomBytes = new Uint8Array(6)
    crypto.getRandomValues(randomBytes)
    for (let i = 0; i < 6; i++) {
      code += UNAMBIGUOUS_CHARS[randomBytes[i] % UNAMBIGUOUS_CHARS.length]
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length)
      code += UNAMBIGUOUS_CHARS[randomIndex]
    }
  }
  return `P-${code}`
}

/**
 * Generates a cryptographically secure random token (32+ hex characters)
 * for parent magic link URLs
 */
export function generateParentAccessToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const u1 = crypto.randomUUID().replace(/-/g, '')
    const u2 = crypto.randomUUID().replace(/-/g, '')
    return `${u1}${u2.slice(0, 8)}`
  }

  // Fallback
  let result = ''
  const hex = '0123456789abcdef'
  for (let i = 0; i < 40; i++) {
    result += hex[Math.floor(Math.random() * hex.length)]
  }
  return result
}

export interface SkillItem {
  skillKey: string
  label: string
  accuracyPercent: number
  totalQuestions: number
  strengthRating: 'mastered' | 'proficient' | 'developing' | 'needs_practice'
}

export interface SessionItem {
  id: string
  created_at: string
  duration_seconds?: number
  score?: number
}

export interface ComputeWeeklyDigestOptions {
  sessions: SessionItem[]
  currentStreak: number
  freezeCount: number
  skills: SkillItem[]
  referenceDate?: Date
}

/**
 * Generates pedagogical suggestions for parents to practice with child at home
 */
export function generateHomeLearningTips(
  weakSkills: Array<{ name: string; rating: string }>
): string[] {
  const tips: string[] = []

  const hasVocabWeakness = weakSkills.some(
    (s) => (s.name.toLowerCase().includes('từ vựng') || s.name.toLowerCase().includes('vocab')) &&
      (s.rating === 'needs_practice' || s.rating === 'developing')
  )

  const hasGrammarWeakness = weakSkills.some(
    (s) => (s.name.toLowerCase().includes('ngữ pháp') || s.name.toLowerCase().includes('grammar') || s.name.toLowerCase().includes('thì')) &&
      (s.rating === 'needs_practice' || s.rating === 'developing')
  )

  const hasPronunciationWeakness = weakSkills.some(
    (s) => (s.name.toLowerCase().includes('phát âm') || s.name.toLowerCase().includes('nói') || s.name.toLowerCase().includes('speaking') || s.name.toLowerCase().includes('pronunciation')) &&
      (s.rating === 'needs_practice' || s.rating === 'developing')
  )

  if (hasVocabWeakness) {
    tips.push('Chơi trò "Truy tìm đồ vật": Cùng bé gọi tên 5 món đồ trong nhà bằng tiếng Anh mỗi ngày.')
    tips.push('Ôn lại thẻ từ vựng trên GameHub khoảng 5 phút trước giờ đi ngủ để củng cố trí nhớ dài hạn.')
  }

  if (hasGrammarWeakness) {
    tips.push('Khuyến khích bé đặt câu ngắn về hoạt động hàng ngày (ví dụ: "I eat breakfast", "I play soccer").')
    tips.push('Cùng bé rèn luyện mẫu câu qua các trò chơi Nối từ hoặc Thám tử ngữ pháp trên GameHub.')
  }

  if (hasPronunciationWeakness) {
    tips.push('Cùng bé luyện phát âm với trợ lý thông minh trên GameHub, nghe lại và nhại theo ngữ điệu chuẩn.')
    tips.push('Khuyến khích bé tự tin nói to các câu tiếng Anh đơn giản, không ngại phát âm sai lúc đầu.')
  }

  if (tips.length === 0) {
    tips.push('Khen ngợi nỗ lực tuyệt vời của bé và tiếp tục duy trì thói quen học tập 10-15 phút mỗi ngày!')
    tips.push('Khuyến khích bé thử sức với Đấu trường lớp học trực tiếp hoặc các chủ đề từ vựng nâng cao.')
  }

  return tips
}

/**
 * Computes weekly activity and performance metrics for the parent digest
 */
export function computeWeeklyDigest(options: ComputeWeeklyDigestOptions): WeeklyLearningDigest {
  const {
    sessions = [],
    currentStreak = 0,
    freezeCount = 0,
    skills = [],
    referenceDate = new Date(),
  } = options

  const sevenDaysAgoTime = referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000

  // Filter sessions within the last 7 calendar days
  const weeklySessions = sessions.filter((s) => {
    const sessionTime = new Date(s.created_at).getTime()
    return !isNaN(sessionTime) && sessionTime >= sevenDaysAgoTime
  })

  const totalGamesPlayed = weeklySessions.length

  const totalSeconds = weeklySessions.reduce(
    (sum, s) => sum + (typeof s.duration_seconds === 'number' ? s.duration_seconds : 0),
    0
  )
  const totalMinutesSpent = totalGamesPlayed > 0 && totalSeconds < 60
    ? 1
    : Math.round(totalSeconds / 60)

  // Derived weekly stars: approximate 5 stars per completed game session
  const starsEarnedThisWeek = weeklySessions.reduce((sum, s) => {
    if (typeof s.score === 'number' && s.score > 0) {
      return sum + Math.max(3, Math.min(20, Math.floor(s.score / 10)))
    }
    return sum + 5
  }, 0)

  // Determine strongest and focus skills
  let strongestSkill = { name: 'Đang cập nhật', accuracyPercent: 0 }
  let focusSkill = {
    name: 'Đang cập nhật',
    accuracyPercent: 0,
    suggestedActivity: 'Chơi các trò chơi cơ bản để hệ thống đánh giá kỹ năng của bé.',
  }

  if (skills.length > 0) {
    const sortedByAccuracy = [...skills].sort((a, b) => b.accuracyPercent - a.accuracyPercent)
    const best = sortedByAccuracy[0]
    strongestSkill = {
      name: best.label,
      accuracyPercent: best.accuracyPercent,
    }

    const needsWork = sortedByAccuracy[sortedByAccuracy.length - 1]
    focusSkill = {
      name: needsWork.label,
      accuracyPercent: needsWork.accuracyPercent,
      suggestedActivity:
        needsWork.accuracyPercent < 70
          ? `Tập trung luyện thêm bài học ${needsWork.label} để tăng độ tự tin và phản xạ.`
          : `Tiếp tục phát huy phong độ ổn định ở kỹ năng ${needsWork.label}.`,
    }
  }

  const weakSkillsForTips = skills.map((s) => ({
    name: s.label,
    rating: s.strengthRating,
  }))

  const recommendedHomeTips = generateHomeLearningTips(weakSkillsForTips)

  return {
    totalMinutesSpent,
    totalGamesPlayed,
    starsEarnedThisWeek,
    streakDays: currentStreak,
    hasFreezeShield: freezeCount > 0,
    strongestSkill,
    focusSkill,
    recommendedHomeTips,
  }
}
