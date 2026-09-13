// src/app/actions/guilds.ts
'use server'

import {
  getAllGuilds,
  getGuildById,
  getGuildByCode,
  contributeExpToGuild,
  addMemberToGuild,
  addCheerToGuild,
} from '@/lib/guild-engine'
import type { StudentGuild } from '@/types/guild'

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetch list of all active guilds.
 */
export async function getAllGuildsAction(): Promise<ActionResult<StudentGuild[]>> {
  const guilds = getAllGuilds()
  return { success: true, data: guilds }
}

/**
 * Fetch detailed state for a specific guild by ID.
 */
export async function getGuildDetailsAction(guildId: string): Promise<ActionResult<StudentGuild>> {
  if (!guildId || typeof guildId !== 'string') {
    return { success: false, error: 'Mã bang hội không hợp lệ.' }
  }

  const guild = getGuildById(guildId.trim())
  if (!guild) {
    return { success: false, error: 'Không tìm thấy thông tin bang hội này.' }
  }

  return { success: true, data: guild }
}

/**
 * Join a guild using a 6-character clan code (e.g. "DRAGON-99").
 */
export async function joinGuildByCodeAction(
  studentId: string,
  studentName: string,
  code: string
): Promise<ActionResult<StudentGuild>> {
  if (!code || typeof code !== 'string') {
    return { success: false, error: 'Vui lòng nhập mã bang hội.' }
  }
  if (!studentId || !studentName) {
    return { success: false, error: 'Thông tin học sinh không hợp lệ.' }
  }

  const guild = getGuildByCode(code)
  if (!guild) {
    return { success: false, error: 'Mã bang hội không tồn tại. Em hãy kiểm tra lại nhé!' }
  }

  const updated = addMemberToGuild(guild, {
    studentId: studentId.trim(),
    studentName: studentName.trim(),
  })

  return { success: true, data: updated }
}

/**
 * Contribute learning EXP to the guild and apply damage to the weekly boss raid.
 */
export async function contributeGuildExpAction(
  guildId: string,
  studentId: string,
  exp: number
): Promise<ActionResult<{ currentExp: number; bossHp: number; isBossDefeated: boolean }>> {
  if (!guildId || !studentId) {
    return { success: false, error: 'Thông tin đóng góp không hợp lệ.' }
  }

  const guild = getGuildById(guildId)
  if (!guild) {
    return { success: false, error: 'Bang hội không tồn tại.' }
  }

  const safeExp = Math.max(0, Math.round(exp || 0))
  const updated = contributeExpToGuild(guild, studentId, safeExp)

  return {
    success: true,
    data: {
      currentExp: updated.currentExp,
      bossHp: updated.activeBossRaid.currentHp,
      isBossDefeated: updated.activeBossRaid.isDefeated,
    },
  }
}

/**
 * Post an encouraging cheer sticker/message to the guild cheer wall.
 */
export async function postGuildCheerAction(
  guildId: string,
  senderName: string,
  messageVi: string,
  stickerKey = 'cheer-star'
): Promise<ActionResult<StudentGuild>> {
  if (!guildId || !senderName || !messageVi) {
    return { success: false, error: 'Nội dung lời cổ vũ không được để trống.' }
  }

  const guild = getGuildById(guildId)
  if (!guild) {
    return { success: false, error: 'Bang hội không tồn tại.' }
  }

  const updated = addCheerToGuild(guild, {
    senderName: senderName.trim(),
    messageVi: messageVi.trim(),
    stickerKey,
  })

  return { success: true, data: updated }
}
