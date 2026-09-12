'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidGameId, getDefaultSettings, validateGameSettings } from '@/lib/game-config-schema'
import {
  generateAiVocabulary,
  generateAiReading,
  generateAiGrammar,
} from '@/lib/ai-generator'
import type {
  AiGenerateVocabInput,
  AiGenerateReadingInput,
  AiGenerateGrammarInput,
  PublishAiContentInput,
  AiGeneratedVocabItem,
  AiGeneratedReadingPassage,
  AiGeneratedGrammarItem,
} from '@/types/ai-generator'
import { CEFR_LEVELS } from '@/types/word-bank'

interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  configId?: string
  gameId?: string
}

/**
 * Generate AI vocabulary items
 */
export async function generateAiVocabularyAction(
  input: AiGenerateVocabInput
): Promise<ActionResponse<AiGeneratedVocabItem[]>> {
  try {
    if (!input.topic || !input.topic.trim()) {
      return { success: false, error: 'Vui lòng nhập chủ đề từ vựng' }
    }

    if (!CEFR_LEVELS.includes(input.cefrLevel)) {
      return { success: false, error: `Cấp độ CEFR không hợp lệ: ${input.cefrLevel}` }
    }

    const count = Math.min(Math.max(input.count || 5, 1), 30)

    const items = await generateAiVocabulary({
      topic: input.topic.trim(),
      cefrLevel: input.cefrLevel,
      count,
      customPrompt: input.customPrompt?.trim(),
    })

    return {
      success: true,
      data: items,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo từ vựng bằng AI',
    }
  }
}

/**
 * Generate AI reading passage with comprehension questions
 */
export async function generateAiReadingAction(
  input: AiGenerateReadingInput
): Promise<ActionResponse<AiGeneratedReadingPassage>> {
  try {
    if (!input.topic || !input.topic.trim()) {
      return { success: false, error: 'Vui lòng nhập chủ đề bài đọc' }
    }

    if (!CEFR_LEVELS.includes(input.cefrLevel)) {
      return { success: false, error: `Cấp độ CEFR không hợp lệ: ${input.cefrLevel}` }
    }

    const questionCount = Math.min(Math.max(input.questionCount || 3, 1), 10)

    const passage = await generateAiReading({
      topic: input.topic.trim(),
      cefrLevel: input.cefrLevel,
      questionCount,
      customPrompt: input.customPrompt?.trim(),
    })

    return {
      success: true,
      data: passage,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo bài đọc bằng AI',
    }
  }
}

/**
 * Generate AI grammar detective items
 */
export async function generateAiGrammarAction(
  input: AiGenerateGrammarInput = {}
): Promise<ActionResponse<AiGeneratedGrammarItem[]>> {
  try {
    const count = Math.min(Math.max(input.count || 4, 1), 20)

    const items = await generateAiGrammar({
      topic: input.topic?.trim(),
      focusRule: input.focusRule?.trim(),
      count,
      customPrompt: input.customPrompt?.trim(),
    })

    return {
      success: true,
      data: items,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tạo câu hỏi ngữ pháp bằng AI',
    }
  }
}

/**
 * Publish generated AI content directly into Game Configs & optionally Word Bank
 */
export async function publishAiContentToGameConfigAction(
  input: PublishAiContentInput
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để xuất cấu hình game' }
    }

    if (!input.name || !input.name.trim()) {
      return { success: false, error: 'Vui lòng nhập tên cấu hình game' }
    }

    const trimmedName = input.name.trim()
    if (trimmedName.length > 200) {
      return { success: false, error: 'Tên cấu hình không được vượt quá 200 ký tự' }
    }

    if (!input.gameId || !isValidGameId(input.gameId)) {
      return { success: false, error: 'Game không hợp lệ hoặc chưa được hỗ trợ' }
    }

    // 1. Optionally save vocab items to word_bank
    if (input.saveToWordBank && Array.isArray(input.vocabItems) && input.vocabItems.length > 0) {
      const records = input.vocabItems.map((item) => ({
        english: item.english.trim(),
        vietnamese: item.vietnamese.trim(),
        phonetic: item.phonetic?.trim() || null,
        part_of_speech: item.partOfSpeech || 'noun',
        cefr_level: item.cefrLevel || 'A1',
        topic: item.topic?.trim().toLowerCase() || 'general',
        emoji: item.emoji?.trim() || null,
        example_sentence: item.exampleSentence?.trim() || null,
        example_translation: item.exampleTranslation?.trim() || null,
        distractors: Array.isArray(item.distractors) ? item.distractors : [],
        created_by: user.id,
        is_system: false,
      }))

      const { error: wordBankError } = await supabase.from('word_bank').insert(records)
      if (wordBankError) {
        console.warn('Failed to save to word bank during publishing:', wordBankError.message)
      }
    }

    // 2. Prepare target game settings
    const defaultSettings = getDefaultSettings(input.gameId)
    const settings: Record<string, unknown> = { ...defaultSettings }

    if (input.vocabItems && input.vocabItems.length > 0) {
      const primaryTopic = input.vocabItems[0].topic.trim().toLowerCase()
      if ('topics' in settings) {
        settings.topics = [primaryTopic]
      }
      if ('wordTopics' in settings) {
        settings.wordTopics = [primaryTopic]
      }
      if ('categories' in settings) {
        settings.categories = [primaryTopic]
      }
      if ('wordLimit' in settings) {
        settings.wordLimit = Math.min(input.vocabItems.length, 30)
      }
    }

    const validation = validateGameSettings(input.gameId, settings)
    const finalSettings = validation.valid ? validation.data : settings

    // 3. Insert into game_configs
    const { data, error } = await (supabase as unknown as {
      from: (table: string) => {
        insert: (record: unknown) => {
          select: () => {
            single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }>
          }
        }
      }
    })
      .from('game_configs')
      .insert({
        user_id: user.id,
        game_id: input.gameId,
        name: trimmedName,
        settings: finalSettings,
        is_active: true,
      })
      .select()
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Không thể tạo cấu hình game' }
    }

    revalidatePath(`/admin/games/${input.gameId}`)
    revalidatePath('/admin/dashboard')

    return {
      success: true,
      configId: data.id,
      gameId: input.gameId,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi xuất cấu hình game',
    }
  }
}
