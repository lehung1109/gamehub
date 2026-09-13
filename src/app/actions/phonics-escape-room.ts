// src/app/actions/phonics-escape-room.ts
'use server'

import { getEscapeRoomById } from '@/lib/phonics-escape-room-engine'
import type { EscapeRoom, EscapeResult } from '@/types/phonics-escape-room'

export interface EscapeActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves an escape room by its roomId
 */
export async function getEscapeRoomAction(
  roomId: string
): Promise<EscapeActionResult<EscapeRoom>> {
  if (!roomId || typeof roomId !== 'string') {
    return { success: false, error: 'Mã phòng thoát hiểm không hợp lệ.' }
  }

  const room = getEscapeRoomById(roomId.trim())
  if (!room) {
    return { success: false, error: 'Không tìm thấy phòng thoát hiểm này.' }
  }

  return { success: true, data: room }
}

/**
 * Validates and records escape room completion, awarding keys and EXP
 */
export async function submitEscapeScoreAction(
  result: EscapeResult
): Promise<
  EscapeActionResult<{
    keysEarned: number
    expAwarded: number
    isEscaped: boolean
  }>
> {
  if (!result || !result.roomId) {
    return { success: false, error: 'Dữ liệu kết quả thoát hiểm không hợp lệ.' }
  }

  const room = getEscapeRoomById(result.roomId)
  if (!room) {
    return { success: false, error: 'Phòng thoát hiểm không tồn tại.' }
  }

  const keysEarned = Math.max(0, Math.min(3, Math.round(result.keysEarned || 0)))
  const expAwarded = Math.max(0, Math.round(result.expEarned || 0))
  const isEscaped = Boolean(result.isEscaped)

  return {
    success: true,
    data: {
      keysEarned,
      expAwarded,
      isEscaped,
    },
  }
}
