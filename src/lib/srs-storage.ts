import type { SrsCard } from '@/types/srs'

// In-memory storage map fallback for SSR or restricted environments
const inMemorySrsStorage = new Map<string, string>()

/**
 * Returns the storage key for a student's SRS mistake deck.
 */
export function getSrsStorageKey(classCode?: string, studentName?: string): string {
  const code = (classCode?.trim() || 'anon').toUpperCase()
  const student = (studentName?.trim() || 'anon').toLowerCase()
  return `gamehub_srs_deck_v1_${code}_${student}`
}

/**
 * Safely parses raw JSON into an array of SrsCard items, sanitizing
 * and validating mandatory fields while filtering duplicates.
 */
export function parseSrsDeckJson(raw: string): SrsCard[] {
  if (!raw || typeof raw !== 'string') return []

  try {
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []

    const validCards: SrsCard[] = []
    const seenIds = new Set<string>()

    for (const item of list) {
      if (
        item &&
        typeof item === 'object' &&
        typeof (item as Record<string, unknown>).id === 'string' &&
        ((item as Record<string, unknown>).id as string).trim().length > 0 &&
        typeof (item as Record<string, unknown>).prompt === 'string' &&
        ((item as Record<string, unknown>).prompt as string).trim().length > 0 &&
        typeof (item as Record<string, unknown>).correctAnswer === 'string' &&
        ((item as Record<string, unknown>).correctAnswer as string).trim().length > 0
      ) {
        const record = item as Record<string, unknown>
        const id = (record.id as string).trim()

        if (seenIds.has(id)) {
          continue
        }
        seenIds.add(id)

        const rawBox = record.box
        const box =
          typeof rawBox === 'number' && !isNaN(rawBox) && rawBox >= 1 && rawBox <= 5
            ? Math.floor(rawBox)
            : 1

        const mistakeCount =
          typeof record.mistakeCount === 'number' && !isNaN(record.mistakeCount)
            ? Math.max(0, Math.floor(record.mistakeCount))
            : 1

        const successCount =
          typeof record.successCount === 'number' && !isNaN(record.successCount)
            ? Math.max(0, Math.floor(record.successCount))
            : 0

        const isMastered =
          typeof record.isMastered === 'boolean'
            ? record.isMastered
            : box === 5

        const isValidDate = (d: unknown): boolean =>
          typeof d === 'string' && !Number.isNaN(Date.parse(d))

        const lastReviewedAt = isValidDate(record.lastReviewedAt)
          ? (record.lastReviewedAt as string)
          : null

        const nextReviewAt = isValidDate(record.nextReviewAt)
          ? (record.nextReviewAt as string)
          : new Date().toISOString()

        validCards.push({
          id,
          prompt: (record.prompt as string).trim(),
          correctAnswer: (record.correctAnswer as string).trim(),
          selectedAnswer:
            typeof record.selectedAnswer === 'string' ? record.selectedAnswer : null,
          gameType:
            typeof record.gameType === 'string' && record.gameType.trim().length > 0
              ? record.gameType.trim()
              : 'general',
          topic:
            typeof record.topic === 'string' && record.topic.trim().length > 0
              ? record.topic.trim()
              : undefined,
          box,
          lastReviewedAt,
          nextReviewAt,
          mistakeCount,
          successCount,
          isMastered,
        })
      }
    }

    return validCards
  } catch {
    return []
  }
}

/**
 * Retrieves stored SRS mistake deck with dual fallback (localStorage + in-memory Map).
 */
export function getStoredSrsDeck(classCode?: string, studentName?: string): SrsCard[] {
  const key = getSrsStorageKey(classCode, studentName)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        return parseSrsDeckJson(raw)
      }
      return []
    }
  } catch {
    // LocalStorage failed or was restricted, fallback to in-memory store
  }

  const memRaw = inMemorySrsStorage.get(key)
  return memRaw ? parseSrsDeckJson(memRaw) : []
}

/**
 * Saves SRS mistake deck to localStorage and in-memory Map.
 */
export function saveStoredSrsDeck(
  classCode: string | undefined,
  studentName: string | undefined,
  deck: SrsCard[]
): void {
  const key = getSrsStorageKey(classCode, studentName)
  const data = JSON.stringify(deck)

  inMemorySrsStorage.set(key, data)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, data)
    }
  } catch {
    // LocalStorage write failed, in-memory store is already updated
  }
}
