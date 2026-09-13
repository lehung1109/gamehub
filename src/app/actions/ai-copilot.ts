// src/app/actions/ai-copilot.ts

'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  GenerateArenaPromptInput,
  GeneratedArenaPayload,
  CopilotLessonPlan,
  PhonemeAssessmentResult,
} from '@/types/ai-copilot'
import {
  generateArenaQuestionsFromPrompt,
  generateRemediationLessonPlan,
} from '@/lib/ai-copilot-generator'
import { evaluatePhonemePronunciation } from '@/lib/phoneme-evaluator'

interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Generates Live Arena questions from a teacher's natural language prompt
 */
export async function generateArenaFromPromptAction(
  input: GenerateArenaPromptInput
): Promise<ActionResponse<GeneratedArenaPayload>> {
  try {
    if (!input || !input.prompt || !input.prompt.trim()) {
      return { success: false, error: 'Vui lòng nhập yêu cầu đề bài' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để sử dụng Trợ lý AI' }
    }

    const payload = generateArenaQuestionsFromPrompt(input)
    return { success: true, data: payload }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo câu hỏi đấu trường',
    }
  }
}

/**
 * Synthesizes a 15-minute targeted remediation lesson plan for struggling phonemes
 */
export async function generateRemediationPlanAction(
  topic: string,
  gradeLevel: string,
  targetPhonemes?: string[]
): Promise<ActionResponse<CopilotLessonPlan>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để tạo giáo án can thiệp' }
    }

    const plan = generateRemediationLessonPlan(topic, gradeLevel, targetPhonemes)
    return { success: true, data: plan }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo giáo án',
    }
  }
}

/**
 * Granular phoneme-level pronunciation assessment
 */
export async function assessPhonemePronunciationAction(
  targetWord: string,
  spokenText: string
): Promise<ActionResponse<PhonemeAssessmentResult>> {
  try {
    if (!targetWord || !targetWord.trim()) {
      return { success: false, error: 'Từ mẫu không hợp lệ' }
    }

    const result = evaluatePhonemePronunciation(targetWord, spokenText || '')
    return { success: true, data: result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi đánh giá phát âm',
    }
  }
}
