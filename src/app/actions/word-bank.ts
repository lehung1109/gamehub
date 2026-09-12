'use server'

import { createClient } from '@/lib/supabase/server'
import {
  type WordBankItem,
  type WordBankFilterInput,
  type CreateWordBankInput,
  type CefrLevel,
  type PartOfSpeech,
  CEFR_LEVELS,
  PARTS_OF_SPEECH,
} from '@/types/word-bank'

interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  total?: number
  page?: number
  pageSize?: number
  count?: number
}

function mapRowToItem(row: Record<string, unknown>): WordBankItem {
  return {
    id: row.id as string,
    english: row.english as string,
    vietnamese: row.vietnamese as string,
    phonetic: (row.phonetic as string) || null,
    partOfSpeech: (row.part_of_speech as PartOfSpeech) || 'noun',
    cefrLevel: (row.cefr_level as CefrLevel) || 'A1',
    topic: (row.topic as string) || 'general',
    emoji: (row.emoji as string) || null,
    exampleSentence: (row.example_sentence as string) || null,
    exampleTranslation: (row.example_translation as string) || null,
    distractors: Array.isArray(row.distractors) ? (row.distractors as string[]) : [],
    createdBy: (row.created_by as string) || null,
    isSystem: Boolean(row.is_system),
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  }
}

/**
 * Fetch words from Word Bank with filtering and pagination
 */
export async function getWordBankWordsAction(
  filter: WordBankFilterInput = {}
): Promise<ActionResponse<WordBankItem[]>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để xem Ngân hàng từ vựng' }
    }

    const page = filter.page && filter.page > 0 ? filter.page : 1
    const pageSize = filter.pageSize && filter.pageSize > 0 ? filter.pageSize : 20
    const offset = (page - 1) * pageSize

    let query = supabase
      .from('word_bank')
      .select('*', { count: 'exact' })

    if (filter.search && filter.search.trim()) {
      const term = filter.search.trim()
      query = query.or(`english.ilike.%${term}%,vietnamese.ilike.%${term}%`)
    }

    if (filter.topic && filter.topic !== 'all' && filter.topic.trim()) {
      query = query.eq('topic', filter.topic.trim().toLowerCase())
    }

    if (filter.cefrLevel && filter.cefrLevel !== 'all') {
      query = query.eq('cefr_level', filter.cefrLevel)
    }

    if (filter.partOfSpeech && filter.partOfSpeech !== 'all') {
      query = query.eq('part_of_speech', filter.partOfSpeech)
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1)

    const { data, count, error } = await query

    if (error) {
      return { success: false, error: error.message }
    }

    const items = (data || []).map((row) => mapRowToItem(row as Record<string, unknown>))

    return {
      success: true,
      data: items,
      total: count ?? items.length,
      page,
      pageSize,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi tải từ vựng',
    }
  }
}

/**
 * Create a new single word in Word Bank
 */
export async function createWordBankWordAction(
  input: CreateWordBankInput
): Promise<ActionResponse<WordBankItem>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để thêm từ vựng' }
    }

    if (!input.english || !input.english.trim()) {
      return { success: false, error: 'Vui lòng nhập từ tiếng Anh' }
    }

    if (!input.vietnamese || !input.vietnamese.trim()) {
      return { success: false, error: 'Vui lòng nhập nghĩa tiếng Việt' }
    }

    const cefrLevel = input.cefrLevel || 'A1'
    if (!CEFR_LEVELS.includes(cefrLevel)) {
      return { success: false, error: `Cấp độ CEFR không hợp lệ: ${cefrLevel}` }
    }

    const partOfSpeech = input.partOfSpeech || 'noun'
    if (!PARTS_OF_SPEECH.includes(partOfSpeech)) {
      return { success: false, error: `Từ loại không hợp lệ: ${partOfSpeech}` }
    }

    const newRecord = {
      english: input.english.trim(),
      vietnamese: input.vietnamese.trim(),
      phonetic: input.phonetic?.trim() || null,
      part_of_speech: partOfSpeech,
      cefr_level: cefrLevel,
      topic: input.topic?.trim().toLowerCase() || 'general',
      emoji: input.emoji?.trim() || null,
      example_sentence: input.exampleSentence?.trim() || null,
      example_translation: input.exampleTranslation?.trim() || null,
      distractors: Array.isArray(input.distractors) ? input.distractors : [],
      created_by: user.id,
      is_system: false,
    }

    const { data, error } = await supabase
      .from('word_bank')
      .insert(newRecord)
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: mapRowToItem(data as Record<string, unknown>),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo từ vựng',
    }
  }
}

/**
 * Bulk create words in Word Bank
 */
export async function bulkCreateWordBankWordsAction(
  words: CreateWordBankInput[]
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để thêm từ vựng' }
    }

    if (!Array.isArray(words) || words.length === 0) {
      return { success: false, error: 'Danh sách từ vựng không được để trống' }
    }

    if (words.length > 50) {
      return { success: false, error: 'Chỉ được thêm tối đa 50 từ trong một lần tạo' }
    }

    const records = words.map((input) => {
      const cefrLevel = input.cefrLevel && CEFR_LEVELS.includes(input.cefrLevel) ? input.cefrLevel : 'A1'
      const partOfSpeech = input.partOfSpeech && PARTS_OF_SPEECH.includes(input.partOfSpeech)
        ? input.partOfSpeech
        : 'noun'

      return {
        english: input.english.trim(),
        vietnamese: input.vietnamese.trim(),
        phonetic: input.phonetic?.trim() || null,
        part_of_speech: partOfSpeech,
        cefr_level: cefrLevel,
        topic: input.topic?.trim().toLowerCase() || 'general',
        emoji: input.emoji?.trim() || null,
        example_sentence: input.exampleSentence?.trim() || null,
        example_translation: input.exampleTranslation?.trim() || null,
        distractors: Array.isArray(input.distractors) ? input.distractors : [],
        created_by: user.id,
        is_system: false,
      }
    })

    const { error } = await supabase.from('word_bank').insert(records)

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      count: records.length,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi thêm từ hàng loạt',
    }
  }
}

/**
 * Delete a word from Word Bank
 */
export async function deleteWordBankWordAction(
  wordId: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để xoá từ vựng' }
    }

    if (!wordId || !wordId.trim()) {
      return { success: false, error: 'ID từ vựng không hợp lệ' }
    }

    const { error } = await supabase
      .from('word_bank')
      .delete()
      .eq('id', wordId.trim())
      .eq('created_by', user.id)
      .eq('is_system', false)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi xoá từ vựng',
    }
  }
}
