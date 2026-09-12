'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Database, Json } from '@/types/database'
import type {
  SrsCard,
  SrsReviewInput,
  MistakeDeckSummary,
} from '@/types/srs'
import type { StudentInventory } from '@/types/shop'
import {
  applyReviewToCard,
  getDeckSummary,
  ingestSessionMistakes,
  type SessionMistakeItem,
} from '@/lib/srs'
import { getInitialInventory, parseInventory } from '@/lib/shop'
import { getInitialStreakState } from '@/lib/streak'

export interface GetStudentSrsDeckInput {
  classCode: string
  studentName: string
}

export interface GetStudentSrsDeckOutput {
  success: boolean
  deck?: SrsCard[]
  summary?: MistakeDeckSummary
  error?: string
}

export interface SubmitSrsReviewBatchInput {
  classCode: string
  studentName: string
  reviews: SrsReviewInput[]
}

export interface SubmitSrsReviewBatchOutput {
  success: boolean
  updatedCards?: SrsCard[]
  earnedStars?: number
  summary?: MistakeDeckSummary
  error?: string
}

export interface SyncSrsDeckInput {
  classCode: string
  studentName: string
  deck: SrsCard[]
}

export interface SyncSrsDeckOutput {
  success: boolean
  error?: string
}

/**
 * Safely parses and sanitizes raw SRS deck data into valid SrsCard array.
 */
function parseDbSrsDeck(raw: unknown): SrsCard[] {
  if (!raw) return []
  let list: unknown = raw
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(list)) return []

  const validCards: SrsCard[] = []
  const seenIds = new Set<string>()

  for (const item of list) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as Record<string, unknown>).id === 'string' &&
      ((item as Record<string, unknown>).id as string).trim().length > 0 &&
      typeof (item as Record<string, unknown>).prompt === 'string' &&
      ((item as Record<string, unknown>).prompt as string).trim().length > 0 &&
      typeof (item as Record<string, unknown>).correctAnswer === 'string' &&
      ((item as Record<string, unknown>).correctAnswer as string).trim().length > 0
    ) {
      const record = item as Record<string, unknown>
      const id = (record.id as string).trim()

      if (seenIds.has(id)) {
        continue
      }
      seenIds.add(id)

      const rawBox = record.box
      const box =
        typeof rawBox === 'number' && !isNaN(rawBox) && rawBox >= 1 && rawBox <= 5
          ? Math.floor(rawBox)
          : 1

      const mistakeCount =
        typeof record.mistakeCount === 'number' && !isNaN(record.mistakeCount)
          ? Math.max(0, Math.floor(record.mistakeCount))
          : 1

      const successCount =
        typeof record.successCount === 'number' && !isNaN(record.successCount)
          ? Math.max(0, Math.floor(record.successCount))
          : 0

      const isMastered =
        typeof record.isMastered === 'boolean'
          ? record.isMastered
          : box === 5

      const isValidDate = (d: unknown): boolean =>
        typeof d === 'string' && !Number.isNaN(Date.parse(d))

      const lastReviewedAt = isValidDate(record.lastReviewedAt)
        ? (record.lastReviewedAt as string)
        : null

      const nextReviewAt = isValidDate(record.nextReviewAt)
        ? (record.nextReviewAt as string)
        : new Date().toISOString()

      validCards.push({
        id,
        prompt: (record.prompt as string).trim(),
        correctAnswer: (record.correctAnswer as string).trim(),
        selectedAnswer:
          typeof record.selectedAnswer === 'string' ? record.selectedAnswer : null,
        gameType:
          typeof record.gameType === 'string' && record.gameType.trim().length > 0
            ? record.gameType.trim()
            : 'general',
        topic:
          typeof record.topic === 'string' && record.topic.trim().length > 0
            ? record.topic.trim()
            : undefined,
        box,
        lastReviewedAt,
        nextReviewAt,
        mistakeCount,
        successCount,
        isMastered,
      })
    }
  }

  return validCards
}

function parseDbInventory(raw: unknown): StudentInventory {
  if (!raw) return getInitialInventory()
  if (typeof raw === 'string') return parseInventory(raw)
  if (typeof raw === 'object') return parseInventory(JSON.stringify(raw))
  return getInitialInventory()
}

/**
 * Verification helper: checks classroom active status and finds or creates student.
 */
async function verifyAndGetStudent(
  classCode: unknown,
  studentName: unknown,
  supabase: ReturnType<typeof createAdminClient>
): Promise<{ studentId?: string; classroomId?: string; error?: string }> {
  if (!classCode || typeof classCode !== 'string' || !classCode.trim()) {
    return { error: 'Mã lớp không được để trống' }
  }
  if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
    return { error: 'Tên học sinh không được để trống' }
  }

  const cleanCode = classCode.trim().toUpperCase()
  const cleanName = studentName.trim()
  if (cleanName.length > 100) {
    return { error: 'Tên học sinh không được vượt quá 100 ký tự' }
  }

  const { data: classroom, error: classError } = await supabase
    .from('classrooms')
    .select('id, is_active')
    .eq('code', cleanCode)
    .single()

  if (classError || !classroom || !classroom.is_active) {
    return { error: 'Mã lớp không hợp lệ hoặc lớp học không hoạt động' }
  }

  const { data: existingStudents, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('classroom_id', classroom.id)
    .eq('name', cleanName)
    .limit(1)

  if (studentError) {
    console.error('[srs] Error querying student:', studentError)
    return { error: 'Lỗi khi tra cứu thông tin học sinh' }
  }

  let studentId = existingStudents?.[0]?.id

  if (!studentId) {
    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        classroom_id: classroom.id,
        name: cleanName,
      })
      .select('id')
      .single()

    if (insertError || !newStudent) {
      // Retry in case student was inserted concurrently
      const { data: retryStudents } = await supabase
        .from('students')
        .select('id')
        .eq('classroom_id', classroom.id)
        .eq('name', cleanName)
        .limit(1)

      if (retryStudents?.[0]?.id) {
        studentId = retryStudents[0].id
      } else {
        console.error('[srs] Error creating student:', insertError)
        return { error: 'Không thể tạo bản ghi học sinh' }
      }
    } else {
      studentId = newStudent.id
    }
  }

  return { studentId, classroomId: classroom.id }
}

/**
 * 1. Retrieves the student's SRS mistake deck.
 * Automatically backfills from historical session_details if srs_deck is empty.
 */
export async function getStudentSrsDeckAction(
  inputOrClassCode: GetStudentSrsDeckInput | string,
  maybeStudentName?: string
): Promise<GetStudentSrsDeckOutput> {
  try {
    const classCode =
      typeof inputOrClassCode === 'object' && inputOrClassCode !== null
        ? inputOrClassCode.classCode
        : inputOrClassCode
    const studentName =
      typeof inputOrClassCode === 'object' && inputOrClassCode !== null
        ? inputOrClassCode.studentName
        : maybeStudentName

    const supabase = createAdminClient()
    const verification = await verifyAndGetStudent(classCode, studentName, supabase)
    if (verification.error || !verification.studentId) {
      return { success: false, error: verification.error }
    }

    const { studentId } = verification

    const { data: gamRow, error: gamError } = await supabase
      .from('student_gamification')
      .select('id, srs_deck')
      .eq('student_id', studentId)
      .maybeSingle()

    if (gamError) {
      console.error('[getStudentSrsDeckAction] Error querying gamification:', gamError)
      return { success: false, error: 'Lỗi khi tra cứu dữ liệu bộ thẻ' }
    }

    const existingDeck = parseDbSrsDeck(gamRow?.srs_deck)

    if (existingDeck.length > 0) {
      return {
        success: true,
        deck: existingDeck,
        summary: getDeckSummary(existingDeck),
      }
    }

    // srs_deck is empty or null -> run historical backfill
    const { data: detailsData, error: detailsError } = await supabase
      .from('session_details')
      .select('prompt, correct_answer, selected_answer, game_sessions!inner(student_id, game_type, topic)')
      .eq('game_sessions.student_id', studentId)
      .eq('is_correct', false)
      .limit(100)

    if (detailsError) {
      console.error('[getStudentSrsDeckAction] Error querying historical mistakes:', detailsError)
    }

    const mistakes: SessionMistakeItem[] = []
    if (detailsData && !detailsError) {
      for (const row of detailsData) {
        if (row.prompt && row.correct_answer) {
          const session = Array.isArray(row.game_sessions)
            ? row.game_sessions[0]
            : row.game_sessions

          mistakes.push({
            prompt: row.prompt,
            correctAnswer: row.correct_answer,
            selectedAnswer: row.selected_answer,
            gameType: (session as Record<string, unknown>)?.game_type as string || 'general',
            topic: ((session as Record<string, unknown>)?.topic as string) || undefined,
          })
        }
      }
    }

    const backfilledDeck = ingestSessionMistakes([], mistakes)

    if (gamRow) {
      const { error: updateError } = await supabase
        .from('student_gamification')
        .update({ srs_deck: backfilledDeck as unknown as Json })
        .eq('student_id', studentId)

      if (updateError) {
        console.error('[getStudentSrsDeckAction] Error saving backfilled deck:', updateError)
      }
    } else {
      const { error: insertError } = await supabase
        .from('student_gamification')
        .insert({
          student_id: studentId,
          streak_state: getInitialStreakState() as unknown as Json,
          inventory: getInitialInventory() as unknown as Json,
          quests: [] as unknown as Json,
          srs_deck: backfilledDeck as unknown as Json,
        })

      if (insertError) {
        console.error(
          '[getStudentSrsDeckAction] Error inserting gamification row with backfilled deck:',
          insertError
        )
      }
    }

    return {
      success: true,
      deck: backfilledDeck,
      summary: getDeckSummary(backfilledDeck),
    }
  } catch (err) {
    console.error('[getStudentSrsDeckAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}

/**
 * 2. Submits a batch of SRS reviews, calculates star bonuses for mastered cards,
 * and updates student_gamification (srs_deck and inventory.bonusStars).
 */
export async function submitSrsReviewBatchAction(
  inputOrClassCode: SubmitSrsReviewBatchInput | string,
  maybeStudentName?: string,
  maybeReviews?: SrsReviewInput[]
): Promise<SubmitSrsReviewBatchOutput> {
  try {
    let classCode: string
    let studentName: string
    let reviews: SrsReviewInput[]

    if (typeof inputOrClassCode === 'object' && inputOrClassCode !== null) {
      classCode = inputOrClassCode.classCode
      studentName = inputOrClassCode.studentName
      reviews = inputOrClassCode.reviews
    } else {
      classCode = inputOrClassCode
      studentName = maybeStudentName || ''
      reviews = maybeReviews || []
    }

    if (!Array.isArray(reviews)) {
      return { success: false, error: 'Danh sách đánh giá không hợp lệ' }
    }

    const supabase = createAdminClient()
    const verification = await verifyAndGetStudent(classCode, studentName, supabase)
    if (verification.error || !verification.studentId) {
      return { success: false, error: verification.error }
    }

    const { studentId } = verification

    const { data: gamRow, error: gamError } = await supabase
      .from('student_gamification')
      .select('id, inventory, srs_deck')
      .eq('student_id', studentId)
      .maybeSingle()

    if (gamError) {
      console.error('[submitSrsReviewBatchAction] Error querying gamification:', gamError)
      return { success: false, error: 'Lỗi khi tra cứu dữ liệu gamification' }
    }

    const inventory = parseDbInventory(gamRow?.inventory)
    const deck = parseDbSrsDeck(gamRow?.srs_deck)

    let totalEarnedStars = 0
    const updatedCards: SrsCard[] = []
    const cardIndexMap = new Map<string, number>()
    deck.forEach((card, index) => cardIndexMap.set(card.id, index))

    for (const rev of reviews) {
      if (!rev || !rev.cardId || !['hard', 'good', 'easy'].includes(rev.rating)) {
        continue
      }
      const idx = cardIndexMap.get(rev.cardId)
      if (idx !== undefined) {
        const result = applyReviewToCard(deck[idx], rev.rating)
        deck[idx] = result.updatedCard
        totalEarnedStars += result.earnedStars
        updatedCards.push(result.updatedCard)
      }
    }

    const updatePayload: Database['public']['Tables']['student_gamification']['Update'] = {
      srs_deck: deck as unknown as Json,
    }

    if (totalEarnedStars > 0) {
      const updatedInventory: StudentInventory = {
        ...inventory,
        bonusStars: (inventory.bonusStars || 0) + totalEarnedStars,
      }
      updatePayload.inventory = updatedInventory as unknown as Json
    }

    if (gamRow) {
      const { error: updateError } = await supabase
        .from('student_gamification')
        .update(updatePayload)
        .eq('student_id', studentId)

      if (updateError) {
        console.error('[submitSrsReviewBatchAction] Update error:', updateError)
        return { success: false, error: 'Lỗi cập nhật tiến trình ôn tập' }
      }
    } else {
      const insertPayload: Database['public']['Tables']['student_gamification']['Insert'] = {
        student_id: studentId,
        streak_state: getInitialStreakState() as unknown as Json,
        inventory: (updatePayload.inventory ?? inventory) as unknown as Json,
        quests: [] as unknown as Json,
        srs_deck: deck as unknown as Json,
      }

      const { error: insertError } = await supabase
        .from('student_gamification')
        .insert(insertPayload)

      if (insertError) {
        console.error('[submitSrsReviewBatchAction] Insert error:', insertError)
        return { success: false, error: 'Lỗi khởi tạo tiến trình ôn tập' }
      }
    }

    return {
      success: true,
      updatedCards,
      earnedStars: totalEarnedStars,
      summary: getDeckSummary(deck),
    }
  } catch (err) {
    console.error('[submitSrsReviewBatchAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}

/**
 * 3. Synchronizes and saves the full SRS mistake deck for client reconciliation.
 */
export async function syncSrsDeckAction(
  inputOrClassCode: SyncSrsDeckInput | string,
  maybeStudentName?: string,
  maybeDeck?: SrsCard[]
): Promise<SyncSrsDeckOutput> {
  try {
    let classCode: string
    let studentName: string
    let deck: SrsCard[]

    if (typeof inputOrClassCode === 'object' && inputOrClassCode !== null) {
      classCode = inputOrClassCode.classCode
      studentName = inputOrClassCode.studentName
      deck = inputOrClassCode.deck
    } else {
      classCode = inputOrClassCode
      studentName = maybeStudentName || ''
      deck = maybeDeck || []
    }

    if (!Array.isArray(deck)) {
      return { success: false, error: 'Dữ liệu bộ thẻ không hợp lệ' }
    }

    const supabase = createAdminClient()
    const verification = await verifyAndGetStudent(classCode, studentName, supabase)
    if (verification.error || !verification.studentId) {
      return { success: false, error: verification.error }
    }

    const { studentId } = verification
    const sanitizedDeck = parseDbSrsDeck(deck)

    const { data: existingRow, error: checkError } = await supabase
      .from('student_gamification')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle()

    if (checkError) {
      console.error('[syncSrsDeckAction] Error checking existing row:', checkError)
      return { success: false, error: 'Lỗi kiểm tra dữ liệu bộ thẻ' }
    }

    if (existingRow) {
      const { error: updateError } = await supabase
        .from('student_gamification')
        .update({ srs_deck: sanitizedDeck as unknown as Json })
        .eq('student_id', studentId)

      if (updateError) {
        console.error('[syncSrsDeckAction] Update error:', updateError)
        return { success: false, error: 'Không thể cập nhật bộ thẻ' }
      }
    } else {
      const { error: insertError } = await supabase
        .from('student_gamification')
        .insert({
          student_id: studentId,
          streak_state: getInitialStreakState() as unknown as Json,
          inventory: getInitialInventory() as unknown as Json,
          quests: [] as unknown as Json,
          srs_deck: sanitizedDeck as unknown as Json,
        })

      if (insertError) {
        console.error('[syncSrsDeckAction] Insert error:', insertError)
        return { success: false, error: 'Không thể khởi tạo bộ thẻ' }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[syncSrsDeckAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}
