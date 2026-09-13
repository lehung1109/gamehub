// src/lib/phonics-time-engine.ts

import { HISTORICAL_ERAS, HISTORICAL_RELICS } from '@/data/time/relics'
import type {
  TimeTravelEraDefinition,
  TimeTravelEraId,
  TimeRelic,
  TimeTravelerRank,
  TimeProgress,
} from '@/types/phonics-time'

export function getAllEras(): TimeTravelEraDefinition[] {
  return HISTORICAL_ERAS
}

export function getEraById(id: TimeTravelEraId): TimeTravelEraDefinition | undefined {
  return HISTORICAL_ERAS.find((era) => era.id === id)
}

export function getAllRelics(): TimeRelic[] {
  return HISTORICAL_RELICS
}

export function getRelicById(id: string): TimeRelic | undefined {
  return HISTORICAL_RELICS.find((relic) => relic.id === id)
}

export function getRelicsByEra(eraId: TimeTravelEraId): TimeRelic[] {
  return HISTORICAL_RELICS.filter((relic) => relic.eraId === eraId)
}

export function calculateTimeTravelerRank(completedCount: number): TimeTravelerRank {
  if (completedCount >= 9) {
    return 'time_space_master'
  }
  if (completedCount >= 4) {
    return 'chrono_voyager'
  }
  return 'novice_nomad'
}

export function getDefaultTimeProgress(): TimeProgress {
  return {
    completedRelicIds: [],
    currentEra: 'ancient_egypt',
    chronoOrbs: 0,
    travelerRank: 'novice_nomad',
    lastPlayedAt: new Date().toISOString(),
  }
}

export function completeTimeRelic(progress: TimeProgress, relicId: string): TimeProgress {
  if (progress.completedRelicIds.includes(relicId)) {
    return progress
  }

  const newCompleted = [...progress.completedRelicIds, relicId]
  const newOrbs = progress.chronoOrbs + 50
  const newRank = calculateTimeTravelerRank(newCompleted.length)

  return {
    ...progress,
    completedRelicIds: newCompleted,
    chronoOrbs: newOrbs,
    travelerRank: newRank,
    lastPlayedAt: new Date().toISOString(),
  }
}
