'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type {
  LiveArena,
  LiveArenaParticipant,
  ArenaQuestion,
  ArenaStatus,
  CreateArenaInput,
  JoinArenaInput,
  SubmitArenaAnswerInput,
} from '@/types/arena'
import type { Database, Json } from '@/types/database'
import { calculateAnswerScore, calculatePodiumRewards, sortArenaLeaderboard } from '@/lib/arena/scoring'

interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
  arena?: LiveArena
  participants?: LiveArenaParticipant[]
  participant?: LiveArenaParticipant
  isCorrect?: boolean
  pointsEarned?: number
  newStreak?: number
  totalScore?: number
  correctAnswer?: string
  podium?: Array<{
    rank: number
    studentName: string
    avatar: string
    score: number
    starsAwarded: number
    medalEmoji: string
  }>
}

function mapRowToArena(row: Record<string, unknown>): LiveArena {
  return {
    id: row.id as string,
    pinCode: row.pin_code as string,
    title: row.title as string,
    teacherId: (row.teacher_id as string) || null,
    gameId: (row.game_id as string) || 'flashcard',
    configId: (row.config_id as string) || null,
    questions: Array.isArray(row.questions) ? (row.questions as ArenaQuestion[]) : [],
    status: (row.status as ArenaStatus) || 'lobby',
    currentQuestionIndex: Number(row.current_question_index) || 0,
    roundStartedAt: (row.round_started_at as string) || null,
    isActive: Boolean(row.is_active),
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  }
}

function mapRowToParticipant(row: Record<string, unknown>): LiveArenaParticipant {
  return {
    id: row.id as string,
    arenaId: row.arena_id as string,
    studentName: row.student_name as string,
    classCode: (row.class_code as string) || null,
    avatar: (row.avatar as string) || '🦊',
    score: Number(row.score) || 0,
    streak: Number(row.streak) || 0,
    answers: Array.isArray(row.answers) ? (row.answers as LiveArenaParticipant['answers']) : [],
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
  }
}

function generatePinCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Creates a new Live Arena session for a teacher
 */
export async function createLiveArenaAction(
  input: CreateArenaInput
): Promise<ActionResponse<LiveArena>> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, error: 'Dữ liệu tạo phòng không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để tạo phòng thi đấu trực tiếp' }
    }

    if (!input.title || !input.title.trim()) {
      return { success: false, error: 'Vui lòng nhập tiêu đề phòng đấu' }
    }

    if (!Array.isArray(input.questions) || input.questions.length === 0) {
      return { success: false, error: 'Cần ít nhất 1 câu hỏi để tạo phòng thi đấu' }
    }

    const pinCode = generatePinCode()

    const newArenaRecord = {
      pin_code: pinCode,
      title: input.title.trim(),
      teacher_id: user.id,
      game_id: input.gameId || 'flashcard',
      config_id: input.configId || null,
      questions: input.questions as unknown as Json,
      status: 'lobby',
      current_question_index: 0,
      round_started_at: null,
      is_active: true,
    }

    const { data, error } = await supabase
      .from('live_arenas')
      .insert(newArenaRecord)
      .select('*')
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Không thể tạo phòng đấu' }
    }

    return {
      success: true,
      data: mapRowToArena(data as Record<string, unknown>),
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo phòng đấu',
    }
  }
}

/**
 * Fetches Live Arena details and active participants by 6-digit PIN
 */
export async function getLiveArenaByPinAction(
  pinCode: string
): Promise<ActionResponse<LiveArena>> {
  try {
    if (!pinCode || !pinCode.trim()) {
      return { success: false, error: 'Mã PIN không hợp lệ' }
    }

    const supabase = await createClient()

    const { data: arenaData, error: arenaError } = await supabase
      .from('live_arenas')
      .select('*')
      .eq('pin_code', pinCode.trim())
      .single()

    if (arenaError || !arenaData) {
      return { success: false, error: 'Phòng thi đấu không tồn tại hoặc đã kết thúc' }
    }

    const arena = mapRowToArena(arenaData as Record<string, unknown>)

    const { data: partData } = await supabase
      .from('live_arena_participants')
      .select('*')
      .eq('arena_id', arena.id)
      .order('score', { ascending: false })

    const rawParticipants = (partData || []).map((row) =>
      mapRowToParticipant(row as Record<string, unknown>)
    )
    const participants = sortArenaLeaderboard(rawParticipants)

    return {
      success: true,
      arena,
      participants,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tải thông tin phòng đấu',
    }
  }
}

/**
 * Fetches Live Arena details and active participants by arena UUID
 */
export async function getLiveArenaByIdAction(
  arenaId: string
): Promise<ActionResponse<LiveArena>> {
  try {
    if (!arenaId || !arenaId.trim()) {
      return { success: false, error: 'Mã phòng đấu không hợp lệ' }
    }

    const supabase = await createClient()

    const { data: arenaData, error: arenaError } = await supabase
      .from('live_arenas')
      .select('*')
      .eq('id', arenaId.trim())
      .single()

    if (arenaError || !arenaData) {
      return { success: false, error: 'Phòng thi đấu không tồn tại' }
    }

    const arena = mapRowToArena(arenaData as Record<string, unknown>)

    const { data: partData } = await supabase
      .from('live_arena_participants')
      .select('*')
      .eq('arena_id', arena.id)
      .order('score', { ascending: false })

    const rawParticipants = (partData || []).map((row) =>
      mapRowToParticipant(row as Record<string, unknown>)
    )
    const participants = sortArenaLeaderboard(rawParticipants)

    return {
      success: true,
      arena,
      participants,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tải phòng đấu',
    }
  }
}

/**
 * Joins a student into an active Live Arena session
 */
export async function joinLiveArenaAction(
  input: JoinArenaInput
): Promise<ActionResponse<LiveArenaParticipant>> {
  try {
    if (!input || typeof input !== 'object') {
      return { success: false, error: 'Dữ liệu không hợp lệ' }
    }

    if (!input.pinCode || !input.pinCode.trim()) {
      return { success: false, error: 'Vui lòng nhập mã PIN phòng' }
    }

    if (!input.studentName || !input.studentName.trim()) {
      return { success: false, error: 'Vui lòng nhập tên học sinh' }
    }

    const trimmedName = input.studentName.trim()
    if (trimmedName.length > 50) {
      return { success: false, error: 'Tên học sinh tối đa 50 ký tự' }
    }

    const supabase = await createClient()

    // 1. Verify arena exists
    const { data: arenaData, error: arenaError } = await supabase
      .from('live_arenas')
      .select('*')
      .eq('pin_code', input.pinCode.trim())
      .single()

    if (arenaError || !arenaData) {
      return { success: false, error: 'Không tìm thấy phòng thi đấu với mã PIN này' }
    }

    const arena = mapRowToArena(arenaData as Record<string, unknown>)

    // 2. Upsert participant in the arena
    const participantRecord = {
      arena_id: arena.id,
      student_name: trimmedName,
      class_code: input.classCode?.trim() || null,
      avatar: input.avatar?.trim() || '🦊',
      score: 0,
      streak: 0,
      answers: [],
    }

    const { data, error } = await supabase
      .from('live_arena_participants')
      .upsert(participantRecord, { onConflict: 'arena_id,student_name' })
      .select('*')
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Không thể tham gia phòng thi đấu' }
    }

    return {
      success: true,
      participant: mapRowToParticipant(data as Record<string, unknown>),
      arena,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi hệ thống khi tham gia phòng',
    }
  }
}

/**
 * Submits an answer for the current round and calculates speed decay points
 */
export async function submitArenaAnswerAction(
  input: SubmitArenaAnswerInput
): Promise<ActionResponse<void>> {
  try {
    if (
      !input ||
      typeof input !== 'object' ||
      !input.arenaId ||
      !input.studentName ||
      typeof input.questionIndex !== 'number' ||
      input.questionIndex < 0 ||
      input.selectedOption === undefined
    ) {
      return { success: false, error: 'Dữ liệu nộp bài không hợp lệ' }
    }

    const supabase = await createClient()

    // 1. Fetch arena question
    const { data: arenaData, error: arenaError } = await supabase
      .from('live_arenas')
      .select('*')
      .eq('id', input.arenaId)
      .single()

    if (arenaError || !arenaData) {
      return { success: false, error: 'Phòng đấu không tồn tại' }
    }

    const arena = mapRowToArena(arenaData as Record<string, unknown>)
    const currentQuestion = arena.questions[input.questionIndex]
    if (!currentQuestion) {
      return { success: false, error: 'Câu hỏi không hợp lệ' }
    }

    // 2. Fetch participant
    const { data: partData, error: partError } = await supabase
      .from('live_arena_participants')
      .select('*')
      .eq('arena_id', input.arenaId)
      .eq('student_name', input.studentName)
      .single()

    if (partError || !partData) {
      return { success: false, error: 'Không tìm thấy thông tin thí sinh trong phòng' }
    }

    const participant = mapRowToParticipant(partData as Record<string, unknown>)

    // Prevent duplicate answer submissions for the same round
    const alreadyAnswered = participant.answers.some(
      (ans) => ans.questionIndex === input.questionIndex
    )
    if (alreadyAnswered) {
      return { success: false, error: 'Bạn đã nộp đáp án cho câu hỏi này rồi' }
    }

    // 3. Evaluate answer correctness & speed decay points
    const isCorrect = input.selectedOption.trim() === currentQuestion.correctAnswer.trim()
    const scoringResult = calculateAnswerScore({
      isCorrect,
      responseTimeMs: input.responseTimeMs,
      timeLimitSeconds: currentQuestion.timeLimitSeconds || 15,
      currentStreak: participant.streak,
    })

    const updatedAnswers = [
      ...participant.answers,
      {
        questionIndex: input.questionIndex,
        selectedOption: input.selectedOption,
        isCorrect,
        responseTimeMs: input.responseTimeMs,
        pointsEarned: scoringResult.pointsEarned,
      },
    ]

    const newTotalScore = participant.score + scoringResult.pointsEarned

    // 4. Update participant in DB
    const { error: updateError } = await supabase
      .from('live_arena_participants')
      .update({
        score: newTotalScore,
        streak: scoringResult.newStreak,
        answers: updatedAnswers as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participant.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return {
      success: true,
      isCorrect,
      pointsEarned: scoringResult.pointsEarned,
      newStreak: scoringResult.newStreak,
      totalScore: newTotalScore,
      correctAnswer: currentQuestion.correctAnswer,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi nộp câu trả lời',
    }
  }
}

/**
 * Host teacher advances arena state (lobby -> in_progress -> reveal -> leaderboard -> finished)
 */
export async function advanceArenaStateAction(
  arenaId: string,
  status: ArenaStatus,
  nextQuestionIndex?: number
): Promise<ActionResponse<void>> {
  try {
    if (!arenaId || typeof arenaId !== 'string' || !arenaId.trim() || !status) {
      return { success: false, error: 'Thông tin phòng đấu không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để điều khiển phòng đấu' }
    }

    const { data: arenaData, error: findError } = await supabase
      .from('live_arenas')
      .select('*')
      .eq('id', arenaId)
      .single()

    if (findError || !arenaData) {
      return { success: false, error: 'Phòng đấu không tồn tại' }
    }

    const updatePayload: Database['public']['Tables']['live_arenas']['Update'] = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (typeof nextQuestionIndex === 'number') {
      updatePayload.current_question_index = nextQuestionIndex
    }

    if (status === 'in_progress') {
      updatePayload.round_started_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('live_arenas')
      .update(updatePayload)
      .eq('id', arenaId)
      .eq('teacher_id', user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath(`/admin/arena/${arenaId}`)

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái phòng',
    }
  }
}

/**
 * Finalizes the arena match and calculates podium winners with star bonuses
 */
export async function finalizeArenaAction(
  arenaId: string
): Promise<ActionResponse<void>> {
  try {
    if (!arenaId || typeof arenaId !== 'string' || !arenaId.trim()) {
      return { success: false, error: 'Mã phòng đấu không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để kết thúc phòng đấu' }
    }

    // 1. Update arena status to finished
    const { error: finishError } = await supabase
      .from('live_arenas')
      .update({
        status: 'finished',
        updated_at: new Date().toISOString(),
      })
      .eq('id', arenaId)
      .eq('teacher_id', user.id)

    if (finishError) {
      return { success: false, error: finishError.message }
    }

    // 2. Fetch sorted participants
    const { data: partData } = await supabase
      .from('live_arena_participants')
      .select('*')
      .eq('arena_id', arenaId)
      .order('score', { ascending: false })

    const participants = (partData || []).map((row) =>
      mapRowToParticipant(row as Record<string, unknown>)
    )

    const podium = participants.map((p, idx) => {
      const rank = idx + 1
      const rewards = calculatePodiumRewards(rank)
      return {
        rank,
        studentName: p.studentName,
        avatar: p.avatar,
        score: p.score,
        starsAwarded: rewards.stars,
        medalEmoji: rewards.medalEmoji,
      }
    })

    revalidatePath(`/admin/arena/${arenaId}`)

    return {
      success: true,
      podium,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Lỗi khi tổng kết phòng đấu',
    }
  }
}
