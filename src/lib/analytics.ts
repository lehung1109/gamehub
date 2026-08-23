// src/lib/analytics.ts
import type { ClassDifficultWordItem } from '@/app/actions/classes'

export const GAME_LABELS: Record<string, string> = {
  listening: 'Luyện nghe',
  spelling: 'Đánh vần',
  flashcard: 'Thẻ từ vựng',
  alphabet: 'Bảng chữ cái',
  'numbers-colors': 'Số đếm & Màu sắc',
  sentences: 'Ghép câu',
}

export function getGameLabel(gameType: string): string {
  return GAME_LABELS[gameType] || gameType.charAt(0).toUpperCase() + gameType.slice(1)
}

export interface RawSessionDetail {
  id?: string
  session_id?: string
  prompt?: string | null
  selected_answer?: string | null
  correct_answer?: string | null
  is_correct?: boolean | null
  time_taken_ms?: number | null
  attempts?: number | null
}

export interface RawSessionWithDetails {
  id?: string
  student_id?: string
  game_type?: string | null
  topic?: string | null
  score?: number | null
  total_questions?: number | null
  started_at?: string | null
  completed_at?: string | null
  session_details?: RawSessionDetail[] | null
  students?: { id: string; name: string; classroom_id: string } | null
}

/**
 * Calculates aggregated difficult words/questions across all students in a classroom.
 * Groups by gameType + normalized prompt.
 * Returns items where incorrectCount > 0, sorted by errorRatePercent desc and incorrectCount desc.
 */
export function calculateClassDifficultWords(
  sessions: RawSessionWithDetails[]
): ClassDifficultWordItem[] {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return []
  }

  // Key -> Aggregation accumulator
  const wordStatsMap = new Map<
    string,
    {
      prompt: string
      gameType: string
      gameLabel: string
      topic: string
      incorrectCount: number
      totalAttempts: number
      studentsAttempted: Set<string>
      studentsFailed: Set<string>
    }
  >()

  for (const session of sessions) {
    const studentId = session.student_id || 'unknown'
    const gameType = session.game_type || 'unspecified'
    const topic = session.topic || ''
    const gameLabel = getGameLabel(gameType)
    const details = session.session_details

    if (!Array.isArray(details) || details.length === 0) {
      continue
    }

    for (const detail of details) {
      const rawPrompt = (detail.prompt || '').trim()
      if (!rawPrompt) {
        continue
      }

      // Grouping key: gameType + lowercase prompt
      const groupKey = `${gameType.toLowerCase()}:::${rawPrompt.toLowerCase()}`
      const isCorrect = Boolean(detail.is_correct)

      if (!wordStatsMap.has(groupKey)) {
        wordStatsMap.set(groupKey, {
          prompt: rawPrompt,
          gameType,
          gameLabel,
          topic,
          incorrectCount: 0,
          totalAttempts: 0,
          studentsAttempted: new Set<string>(),
          studentsFailed: new Set<string>(),
        })
      }

      const stat = wordStatsMap.get(groupKey)!
      // If previous session had empty topic and current session has topic, enrich it
      if (!stat.topic && topic) {
        stat.topic = topic
      }
      stat.totalAttempts++
      stat.studentsAttempted.add(studentId)

      if (!isCorrect) {
        stat.incorrectCount++
        stat.studentsFailed.add(studentId)
      }
    }
  }

  // Convert map to array, filter to only those with mistakes, and calculate percentages
  const difficultWords: ClassDifficultWordItem[] = Array.from(wordStatsMap.values())
    .filter((stat) => stat.incorrectCount > 0)
    .map((stat) => {
      const errorRatePercent =
        stat.totalAttempts > 0
          ? Math.round((stat.incorrectCount / stat.totalAttempts) * 100)
          : 0
      const accuracyPercent = 100 - errorRatePercent

      return {
        prompt: stat.prompt,
        gameType: stat.gameType,
        gameLabel: stat.gameLabel,
        topic: stat.topic,
        incorrectCount: stat.incorrectCount,
        totalAttempts: stat.totalAttempts,
        incorrectStudentCount: stat.studentsFailed.size,
        totalStudentsAttempted: stat.studentsAttempted.size,
        errorRatePercent,
        accuracyPercent,
      }
    })
    .sort(
      (a, b) =>
        b.errorRatePercent - a.errorRatePercent ||
        b.incorrectCount - a.incorrectCount ||
        a.prompt.localeCompare(b.prompt)
    )

  return difficultWords
}

/**
 * Filter difficult words list by gameType ('all' returns all items).
 */
export function filterDifficultWordsByGame(
  items: ClassDifficultWordItem[],
  gameType: string
): ClassDifficultWordItem[] {
  if (!items || !Array.isArray(items)) return []
  if (!gameType || gameType === 'all') return items
  const cleanFilter = gameType.trim().toLowerCase()
  return items.filter((item) => item.gameType && item.gameType.toLowerCase() === cleanFilter)
}

/**
 * Filter difficult words by keyword search in prompt or topic.
 */
export function searchDifficultWords(
  items: ClassDifficultWordItem[],
  query: string
): ClassDifficultWordItem[] {
  if (!items || !Array.isArray(items)) return []
  if (!query || !query.trim()) return items
  const normalizedQuery = query.trim().toLowerCase()

  return items.filter(
    (item) =>
      (item.prompt && item.prompt.toLowerCase().includes(normalizedQuery)) ||
      (item.topic && item.topic.toLowerCase().includes(normalizedQuery)) ||
      (item.gameLabel && item.gameLabel.toLowerCase().includes(normalizedQuery))
  )
}

/**
 * Sort difficult words by selected criteria.
 */
export function sortDifficultWords(
  items: ClassDifficultWordItem[],
  sortBy: 'errorRate' | 'incorrectCount' | 'studentCount'
): ClassDifficultWordItem[] {
  if (!items || !Array.isArray(items)) return []
  const cloned = [...items]

  switch (sortBy) {
    case 'errorRate':
      return cloned.sort(
        (a, b) =>
          b.errorRatePercent - a.errorRatePercent ||
          b.incorrectCount - a.incorrectCount ||
          a.prompt.localeCompare(b.prompt)
      )
    case 'incorrectCount':
      return cloned.sort(
        (a, b) =>
          b.incorrectCount - a.incorrectCount ||
          b.errorRatePercent - a.errorRatePercent ||
          a.prompt.localeCompare(b.prompt)
      )
    case 'studentCount':
      return cloned.sort(
        (a, b) =>
          b.incorrectStudentCount - a.incorrectStudentCount ||
          b.errorRatePercent - a.errorRatePercent ||
          a.prompt.localeCompare(b.prompt)
      )
    default:
      return cloned
  }
}
