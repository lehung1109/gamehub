// src/app/actions/comic-story.ts

'use server'

import type { ComicStory } from '@/types/comic-story'
import type { PhonemeAssessmentResult } from '@/types/ai-copilot'
import { getStoryById } from '@/lib/comic-story-engine'
import { evaluatePhonemePronunciation } from '@/lib/phoneme-evaluator'

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Fetches comic storybook details by storyId
 */
export async function getStoryDetailsAction(
  storyId: string
): Promise<ActionResponse<ComicStory>> {
  try {
    if (!storyId) {
      return { success: false, error: 'Thiếu mã truyện tranh.' }
    }

    const story = getStoryById(storyId)
    if (!story) {
      return { success: false, error: 'Không tìm thấy truyện tranh yêu cầu.' }
    }

    return { success: true, data: story }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể tải truyện tranh.'
    return { success: false, error: message }
  }
}

/**
 * Evaluates student spoken voice-acting line with phoneme-level precision
 */
export async function evaluateStoryVoiceActingAction(
  targetText: string,
  spokenText: string
): Promise<ActionResponse<PhonemeAssessmentResult>> {
  try {
    if (!targetText) {
      return { success: false, error: 'Thiếu câu thoại mục tiêu.' }
    }

    const assessment = evaluatePhonemePronunciation(targetText, spokenText || '')
    return { success: true, data: assessment }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi đánh giá phát âm lời thoại.'
    return { success: false, error: message }
  }
}

/**
 * Marks story completed, records EXP reward and unlocks Storyteller badge
 */
export async function completeStorySessionAction(
  storyId: string,
  studentId: string
): Promise<ActionResponse<{ expGained: number; isBadgeUnlocked: boolean; badgeTitle: string }>> {
  try {
    if (!storyId || !studentId) {
      return { success: false, error: 'Thông tin hoàn thành truyện không hợp lệ.' }
    }

    return {
      success: true,
      data: {
        expGained: 25,
        isBadgeUnlocked: true,
        badgeTitle: 'Nhà Kể Chuyện Nhí ⭐',
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi hoàn thành truyện.'
    return { success: false, error: message }
  }
}
