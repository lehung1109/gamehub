// src/lib/phonics-escape-room-engine.ts

import { ESCAPE_ROOMS } from '@/data/escape-room/rooms'
import type {
  EscapeRoom,
  EscapeClueHotspot,
  EscapeResult,
} from '@/types/phonics-escape-room'

/**
 * Returns all available escape rooms
 */
export function getAllEscapeRooms(): EscapeRoom[] {
  return ESCAPE_ROOMS
}

/**
 * Returns an escape room by its unique id
 */
export function getEscapeRoomById(id: string): EscapeRoom | undefined {
  return ESCAPE_ROOMS.find((r) => r.id === id)
}

/**
 * Validates whether the selected option matches the correct answer in the hotspot
 */
export function validateClueAnswer(
  hotspot: EscapeClueHotspot,
  optionId: string
): boolean {
  const selectedOption = hotspot.options.find((opt) => opt.id === optionId)
  return Boolean(selectedOption?.isCorrect)
}

/**
 * Validates the student's entered master password against the room's secret word
 */
export function validateMasterCode(
  room: EscapeRoom,
  enteredCode: string
): boolean {
  const normalizedExpected = room.masterCipherWord.trim().toUpperCase()
  const normalizedInput = enteredCode.trim().toUpperCase()
  return normalizedExpected === normalizedInput
}

/**
 * Calculates escape score, keys earned (1-3), and EXP
 */
export function calculateEscapeScore(
  roomId: string,
  cluesSolved: number,
  totalClues: number,
  isEscaped: boolean,
  timeSpentSeconds: number
): EscapeResult {
  let keysEarned = 1
  if (isEscaped && cluesSolved === totalClues) {
    keysEarned = 3
  } else if (isEscaped && cluesSolved >= Math.ceil(totalClues / 2)) {
    keysEarned = 2
  } else if (isEscaped) {
    keysEarned = 1
  } else {
    keysEarned = 0
  }

  // Calculate EXP
  const baseExp = isEscaped ? 100 : 30
  const cluesBonus = cluesSolved * 25
  const speedBonus = isEscaped && timeSpentSeconds < 180 ? 30 : 0
  const expEarned = baseExp + cluesBonus + speedBonus

  return {
    roomId,
    keysEarned,
    cluesSolved,
    totalClues,
    timeSpentSeconds,
    isEscaped,
    expEarned,
    completedAt: new Date().toISOString(),
  }
}
