import { BadgeDefinition, UnlockedBadge, StudentStatsInput } from '@/types/badges'

export const BADGES_CATALOG: BadgeDefinition[] = [
  {
    id: 'first_step',
    title: 'Bước đầu tiên',
    description: 'Hoàn thành lượt chơi đầu tiên',
    icon: '👟',
    category: 'milestone',
  },
  {
    id: 'vocab_explorer',
    title: 'Nhà thám hiểm',
    description: 'Trải nghiệm từ 3 trò chơi khác nhau',
    icon: '📚',
    category: 'exploration',
  },
  {
    id: 'sharp_shooter',
    title: 'Bách phát bách trúng',
    description: 'Đạt điểm số tuyệt đối 100% trong một lượt chơi',
    icon: '🎯',
    category: 'accuracy',
  },
  {
    id: 'speed_demon',
    title: 'Tay gõ cừ khôi',
    description: 'Hoàn thành lượt luyện gõ từ vựng',
    icon: '⌨️',
    category: 'exploration',
  },
  {
    id: 'detective_master',
    title: 'Thám tử đại tài',
    description: 'Phá thành công vụ án ngữ pháp',
    icon: '🕵️',
    category: 'accuracy',
  },
  {
    id: 'workplace_pro',
    title: 'Chuyên gia công sở',
    description: 'Hoàn thành một bài học Parts of Speech',
    icon: '💼',
    category: 'milestone',
  },
  {
    id: 'super_star',
    title: 'Ngôi sao sáng',
    description: 'Tích lũy đạt từ 50 sao trở lên',
    icon: '⭐',
    category: 'milestone',
  },
  {
    id: 'champion',
    title: 'Chiến binh bảng vàng',
    description: 'Lọt vào Top 3 bảng xếp hạng của lớp học',
    icon: '🏆',
    category: 'honor',
  },
]

export function getBadgeDefinitions(): BadgeDefinition[] {
  return [...BADGES_CATALOG]
}

export function evaluateBadges(
  stats: StudentStatsInput,
  currentlyUnlocked: UnlockedBadge[] = []
): { allUnlocked: UnlockedBadge[]; newlyUnlocked: BadgeDefinition[] } {
  const allUnlocked: UnlockedBadge[] = [...currentlyUnlocked]
  const newlyUnlocked: BadgeDefinition[] = []
  const unlockedIds = new Set(currentlyUnlocked.map((b) => b.badgeId))

  for (const badge of BADGES_CATALOG) {
    let satisfied = false

    switch (badge.id) {
      case 'first_step':
        satisfied = (stats.totalSessions ?? 0) >= 1
        break
      case 'vocab_explorer':
        satisfied = new Set((stats.uniqueGameTypes ?? []).filter(Boolean)).size >= 3
        break
      case 'sharp_shooter':
        satisfied = Boolean(stats.hasPerfectGame)
        break
      case 'speed_demon':
        satisfied = Boolean(stats.hasTypingGame)
        break
      case 'detective_master':
        satisfied = Boolean(stats.hasDetectiveCase)
        break
      case 'workplace_pro':
        satisfied = Boolean(stats.hasCompletedPosStage)
        break
      case 'super_star':
        satisfied = (stats.totalStars ?? 0) >= 50
        break
      case 'champion':
        satisfied =
          typeof stats.rankInClass === 'number' &&
          stats.rankInClass > 0 &&
          stats.rankInClass <= 3
        break
    }

    if (satisfied && !unlockedIds.has(badge.id)) {
      const now = new Date().toISOString()
      const newUnlocked: UnlockedBadge = {
        badgeId: badge.id,
        unlockedAt: now,
      }
      allUnlocked.push(newUnlocked)
      newlyUnlocked.push(badge)
      unlockedIds.add(badge.id)
    }
  }

  return { allUnlocked, newlyUnlocked }
}

const inMemoryBadgesStorage = new Map<string, string>()

function getStorageKey(classCode?: string, studentName?: string): string {
  const code = (classCode || 'anon').trim().toUpperCase() || 'ANON'
  const student = (studentName || 'anon').trim().toLowerCase() || 'anon'
  return `gamehub_badges_v1_${code}_${student}`
}

function parseUnlockedBadges(raw: string): UnlockedBadge[] {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is UnlockedBadge =>
          Boolean(item && typeof item.badgeId === 'string' && typeof item.unlockedAt === 'string')
      )
    }
  } catch {
    // Ignore invalid JSON
  }
  return []
}

export function getStoredBadges(classCode?: string, studentName?: string): UnlockedBadge[] {
  const key = getStorageKey(classCode, studentName)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        return parseUnlockedBadges(raw)
      }
      return []
    }
  } catch {
    // LocalStorage failed or was restricted, fallback to in-memory
  }

  const memRaw = inMemoryBadgesStorage.get(key)
  return memRaw ? parseUnlockedBadges(memRaw) : []
}

export function saveStoredBadges(
  classCode: string | undefined,
  studentName: string | undefined,
  badges: UnlockedBadge[]
): void {
  const key = getStorageKey(classCode, studentName)
  const data = JSON.stringify(badges)

  inMemoryBadgesStorage.set(key, data)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, data)
    }
  } catch {
    // LocalStorage write failed, fallback in-memory is already updated
  }
}
