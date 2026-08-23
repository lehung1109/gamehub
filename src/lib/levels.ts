export interface LevelInfo {
  level: number
  threshold: number
  badge: string
  title: string
}

export interface LevelProgress {
  currentLevel: LevelInfo
  nextLevel: LevelInfo | null
  starsToNext: number
  progressToNext: number
}

export const LEVELS: LevelInfo[] = [
  { level: 1, threshold: 0, badge: '🐣', title: 'Tập sự' },
  { level: 2, threshold: 50, badge: '🐱', title: 'Khám phá' },
  { level: 3, threshold: 150, badge: '🦁', title: 'Chinh phục' },
  { level: 4, threshold: 300, badge: '🦄', title: 'Ngôi sao' },
  { level: 5, threshold: 500, badge: '👑', title: 'Huyền thoại' },
]

/**
 * Calculates the highest LevelInfo reached for a given total stars.
 */
export function calculateLevel(totalStars: number): LevelInfo {
  const stars =
    typeof totalStars === 'number' && Number.isFinite(totalStars) ? Math.max(0, totalStars) : 0
  
  let currentLevel = LEVELS[0]
  for (const level of LEVELS) {
    if (stars >= level.threshold) {
      currentLevel = level
    } else {
      break
    }
  }
  return currentLevel
}

/**
 * Returns detailed progress information (current level, next level, stars remaining, percentage).
 */
export function getLevelInfo(totalStars: number): LevelProgress {
  const stars =
    typeof totalStars === 'number' && Number.isFinite(totalStars) ? Math.max(0, totalStars) : 0
  const currentLevel = calculateLevel(stars)
  const currentIndex = LEVELS.findIndex((l) => l.level === currentLevel.level)
  const nextLevel = currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      starsToNext: 0,
      progressToNext: 100,
    }
  }

  const range = nextLevel.threshold - currentLevel.threshold
  const currentInRange = stars - currentLevel.threshold
  const progressToNext = range > 0 ? Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100))) : 100
  const starsToNext = Math.max(0, nextLevel.threshold - stars)

  return {
    currentLevel,
    nextLevel,
    starsToNext,
    progressToNext,
  }
}
