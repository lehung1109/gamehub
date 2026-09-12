'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateDuelRoundScore, resolveDuelWinner } from '@/lib/duel-scoring'
import type {
  DuelState,
  DuelPlayer,
  DuelAnswer,
  DuelQuestion,
  DuelStatus,
  CreateDuelInput,
  JoinDuelInput,
  SubmitDuelAnswerInput,
} from '@/types/duels'
import type { Json } from '@/types/database'

import animalsWords from '@/data/words/animals.json'
import fruitsWords from '@/data/words/fruits.json'
import bodyPartsWords from '@/data/words/body-parts.json'
import familyWords from '@/data/words/family.json'
import schoolWords from '@/data/words/school.json'

interface WordItem {
  id: string
  english: string
  phonetic: string
  vietnamese: string
  emoji: string
  topicId: string
}

const ALL_WORDS: WordItem[] = [
  ...(animalsWords as WordItem[]),
  ...(fruitsWords as WordItem[]),
  ...(bodyPartsWords as WordItem[]),
  ...(familyWords as WordItem[]),
  ...(schoolWords as WordItem[]),
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function generateDuelCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function calculateStreakFromAnswers(answers: DuelAnswer[]): number {
  let streak = 0
  for (let i = answers.length - 1; i >= 0; i--) {
    if (answers[i].isCorrect) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function generateDuelQuestions(topic = 'mixed', count = 5): DuelQuestion[] {
  const normalizedTopic = topic.trim().toLowerCase()
  let topicPool: WordItem[] = []
  if (normalizedTopic !== 'mixed' && normalizedTopic !== '') {
    topicPool = ALL_WORDS.filter((w) => w.topicId.toLowerCase() === normalizedTopic)
  }
  const pool = topicPool.length >= 4 ? topicPool : ALL_WORDS
  const shuffledPool = shuffle(pool)
  const chosenWords = shuffledPool.slice(0, Math.min(count, shuffledPool.length))

  return chosenWords.map((target, idx) => {
    const potentialDistractors = ALL_WORDS.filter(
      (w) => w.vietnamese !== target.vietnamese && w.id !== target.id
    )
    const distractorItems = shuffle(potentialDistractors).slice(0, 3)
    const optionsSet = new Set<string>([target.vietnamese])
    for (const d of distractorItems) {
      optionsSet.add(d.vietnamese)
    }

    let fallbackIdx = 0
    while (optionsSet.size < 4 && fallbackIdx < ALL_WORDS.length) {
      optionsSet.add(ALL_WORDS[fallbackIdx].vietnamese)
      fallbackIdx++
    }

    const options = shuffle(Array.from(optionsSet))

    return {
      id: `dq-${idx + 1}-${target.id}`,
      prompt: `Từ "${target.english}" có nghĩa là gì?`,
      options,
      correctAnswer: target.vietnamese,
      explanationVi: `"${target.english}" ${target.phonetic || ''} có nghĩa là "${target.vietnamese}"`.trim(),
    }
  })
}

function mapRowToDuelState(row: Record<string, unknown>): DuelState {
  const p1Answers: DuelAnswer[] = Array.isArray(row.player1_answers)
    ? (row.player1_answers as DuelAnswer[])
    : []
  const p2Answers: DuelAnswer[] = Array.isArray(row.player2_answers)
    ? (row.player2_answers as DuelAnswer[])
    : []

  const player1: DuelPlayer = {
    name: row.player1_name as string,
    avatar: (row.player1_avatar as string) || '🦊',
    score: Number(row.player1_score) || 0,
    streak: calculateStreakFromAnswers(p1Answers),
  }

  const player2: DuelPlayer | undefined = row.player2_name
    ? {
        name: row.player2_name as string,
        avatar: (row.player2_avatar as string) || '🐼',
        score: Number(row.player2_score) || 0,
        streak: calculateStreakFromAnswers(p2Answers),
      }
    : undefined

  return {
    id: row.id as string,
    code: row.code as string,
    topic: (row.topic as string) || 'mixed',
    status: row.status as DuelStatus,
    player1,
    player2,
    player1Answers: p1Answers,
    player2Answers: p2Answers,
    currentQuestionIndex: Number(row.current_question_index) || 0,
    questions: Array.isArray(row.questions) ? (row.questions as DuelQuestion[]) : [],
    winnerName: (row.winner_name as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

/**
 * Creates a new PvP duel room.
 */
export async function createDuelRoomAction(
  payload: CreateDuelInput
): Promise<{ success: boolean; data?: DuelState; error?: string }> {
  try {
    const playerName = payload?.playerName?.trim()
    if (!playerName) {
      return { success: false, error: 'Tên người chơi không được để trống' }
    }

    const avatar = payload.avatar?.trim() || '🦊'
    const topic = payload.topic?.trim() || 'mixed'
    const questionCount = Math.min(20, Math.max(3, payload.questionCount || 5))

    const questions = generateDuelQuestions(topic, questionCount)
    const code = generateDuelCode()

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('pvp_duels')
      .insert({
        code,
        topic,
        questions: questions as unknown as Json,
        status: 'waiting',
        player1_name: playerName,
        player1_avatar: avatar,
        player1_score: 0,
        player1_answers: [] as unknown as Json,
        player2_name: null,
        player2_avatar: '🐼',
        player2_score: 0,
        player2_answers: [] as unknown as Json,
        current_question_index: 0,
        winner_name: null,
      })
      .select()
      .single()

    if (error || !data) {
      return { success: false, error: error?.message || 'Không thể tạo phòng thách đấu' }
    }

    revalidatePath('/duel')
    return { success: true, data: mapRowToDuelState(data as Record<string, unknown>) }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tạo phòng'
    return { success: false, error: message }
  }
}

/**
 * Joins an existing duel room as Player 2.
 */
export async function joinDuelRoomAction(
  payload: JoinDuelInput
): Promise<{ success: boolean; data?: DuelState; error?: string }> {
  try {
    const code = payload?.code?.trim().toUpperCase()
    if (!code || code.length !== 6) {
      return { success: false, error: 'Mã phòng không hợp lệ (cần 6 ký tự)' }
    }

    const playerName = payload?.playerName?.trim()
    if (!playerName) {
      return { success: false, error: 'Tên người chơi không được để trống' }
    }

    const avatar = payload.avatar?.trim() || '🐼'

    const supabase = createAdminClient()

    const { data: duel, error: fetchError } = await supabase
      .from('pvp_duels')
      .select('*')
      .eq('code', code)
      .single()

    if (fetchError || !duel) {
      return { success: false, error: 'Không tìm thấy phòng thách đấu' }
    }

    if (duel.status !== 'waiting') {
      return { success: false, error: 'Phòng thách đấu đã bắt đầu hoặc đã kết thúc' }
    }

    if (duel.player2_name) {
      return { success: false, error: 'Phòng đã đủ 2 người chơi' }
    }

    if (duel.player1_name.toLowerCase() === playerName.toLowerCase()) {
      return { success: false, error: 'Bạn đã là chủ phòng này' }
    }

    const { data: updatedDuel, error: updateError } = await supabase
      .from('pvp_duels')
      .update({
        player2_name: playerName,
        player2_avatar: avatar,
        status: 'ready',
      })
      .eq('id', duel.id)
      .select()
      .single()

    if (updateError || !updatedDuel) {
      return { success: false, error: updateError?.message || 'Không thể tham gia phòng' }
    }

    revalidatePath(`/duel/${code}`)
    return { success: true, data: mapRowToDuelState(updatedDuel as Record<string, unknown>) }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tham gia phòng'
    return { success: false, error: message }
  }
}

/**
 * Retrieves the current state of a duel room.
 */
export async function getDuelStateAction(
  code: string
): Promise<{ success: boolean; data?: DuelState; error?: string }> {
  try {
    const normalizedCode = code?.trim().toUpperCase()
    if (!normalizedCode) {
      return { success: false, error: 'Mã phòng không hợp lệ' }
    }

    const supabase = createAdminClient()

    let query = supabase.from('pvp_duels').select('*')
    if (normalizedCode.includes('-')) {
      query = query.eq('id', code.trim())
    } else {
      query = query.eq('code', normalizedCode)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return { success: false, error: 'Không tìm thấy phòng thách đấu' }
    }

    return { success: true, data: mapRowToDuelState(data as Record<string, unknown>) }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lấy trạng thái trận đấu'
    return { success: false, error: message }
  }
}

/**
 * Submits an answer for either player, updating scores, streaks, and advancing round when both answered.
 */
export async function submitDuelAnswerAction(
  payload: SubmitDuelAnswerInput
): Promise<{ success: boolean; data?: DuelState; error?: string }> {
  try {
    if (!payload?.duelId) {
      return { success: false, error: 'Mã trận đấu (duelId) không hợp lệ' }
    }
    if (payload.playerRole !== 'player1' && payload.playerRole !== 'player2') {
      return { success: false, error: 'playerRole không hợp lệ (phải là player1 hoặc player2)' }
    }
    if (payload.questionIndex === undefined || payload.questionIndex < 0) {
      return { success: false, error: 'questionIndex không hợp lệ' }
    }

    const supabase = createAdminClient()

    const { data: duel, error: fetchError } = await supabase
      .from('pvp_duels')
      .select('*')
      .eq('id', payload.duelId)
      .single()

    if (fetchError || !duel) {
      return { success: false, error: 'Không tìm thấy phòng thách đấu' }
    }

    if (duel.status === 'finished' || duel.status === 'cancelled') {
      return { success: false, error: 'Trận đấu đã kết thúc' }
    }

    const isP1 = payload.playerRole === 'player1'
    const rawPlayerAnswers = (isP1 ? duel.player1_answers : duel.player2_answers) as unknown
    const existingPlayerAnswers: DuelAnswer[] = Array.isArray(rawPlayerAnswers)
      ? (rawPlayerAnswers as DuelAnswer[])
      : []

    // If player already answered this question index, return current state (idempotent)
    const alreadyAnswered = existingPlayerAnswers.some((a) => a.questionIndex === payload.questionIndex)
    if (alreadyAnswered) {
      return { success: true, data: mapRowToDuelState(duel as Record<string, unknown>) }
    }

    const currentStreak = calculateStreakFromAnswers(existingPlayerAnswers)
    const pointsEarned = calculateDuelRoundScore(payload.isCorrect, payload.elapsedMs, currentStreak)

    const newAnswer: DuelAnswer = {
      questionIndex: payload.questionIndex,
      selectedOption: payload.selectedOption,
      isCorrect: payload.isCorrect,
      elapsedMs: payload.elapsedMs,
      pointsEarned,
    }

    const updatedPlayerAnswers = [...existingPlayerAnswers, newAnswer]
    const currentScore = Number(isP1 ? duel.player1_score : duel.player2_score) || 0
    const updatedScore = currentScore + pointsEarned

    const rawOpponentAnswers = (isP1 ? duel.player2_answers : duel.player1_answers) as unknown
    const opponentAnswers: DuelAnswer[] = Array.isArray(rawOpponentAnswers)
      ? (rawOpponentAnswers as DuelAnswer[])
      : []

    const opponentAnsweredCurrent = opponentAnswers.some((a) => a.questionIndex === payload.questionIndex)
    const questions = Array.isArray(duel.questions) ? (duel.questions as unknown as DuelQuestion[]) : []

    let nextStatus = duel.status === 'ready' || duel.status === 'waiting' ? 'in_progress' : duel.status
    let nextQuestionIndex = duel.current_question_index
    let winnerName = duel.winner_name

    if (opponentAnsweredCurrent) {
      if (payload.questionIndex + 1 < questions.length) {
        nextQuestionIndex = payload.questionIndex + 1
        nextStatus = 'in_progress'
      } else {
        nextStatus = 'finished'
        const p1FinalScore = isP1 ? updatedScore : Number(duel.player1_score) || 0
        const p2FinalScore = isP1 ? Number(duel.player2_score) || 0 : updatedScore
        const p1Name = duel.player1_name
        const p2Name = duel.player2_name || 'Đối thủ'
        const winnerResult = resolveDuelWinner(p1FinalScore, p2FinalScore, p1Name, p2Name)
        winnerName = winnerResult.winnerName
      }
    }

    const updateData: {
      status?: string
      current_question_index?: number
      updated_at?: string
      player1_answers?: Json
      player1_score?: number
      player2_answers?: Json
      player2_score?: number
      winner_name?: string | null
    } = {
      status: nextStatus,
      current_question_index: nextQuestionIndex,
      updated_at: new Date().toISOString(),
    }

    if (isP1) {
      updateData.player1_answers = updatedPlayerAnswers as unknown as Json
      updateData.player1_score = updatedScore
    } else {
      updateData.player2_answers = updatedPlayerAnswers as unknown as Json
      updateData.player2_score = updatedScore
    }

    if (nextStatus === 'finished') {
      updateData.winner_name = winnerName
    }

    const { data: updatedDuel, error: updateError } = await supabase
      .from('pvp_duels')
      .update(updateData)
      .eq('id', payload.duelId)
      .select()
      .single()

    if (updateError || !updatedDuel) {
      return { success: false, error: updateError?.message || 'Không thể lưu kết quả câu trả lời' }
    }

    revalidatePath(`/duel/${duel.code}`)
    return { success: true, data: mapRowToDuelState(updatedDuel as Record<string, unknown>) }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi nộp câu trả lời'
    return { success: false, error: message }
  }
}

/**
 * Creates a rematch duel copying previous match parameters.
 */
export async function createRematchAction(
  oldDuelId: string,
  playerName: string
): Promise<{ success: boolean; data?: DuelState; error?: string }> {
  try {
    const normalizedId = oldDuelId?.trim()
    if (!normalizedId) {
      return { success: false, error: 'Mã trận đấu (oldDuelId) không hợp lệ' }
    }

    const normalizedName = playerName?.trim()
    if (!normalizedName) {
      return { success: false, error: 'Tên người chơi không được để trống' }
    }

    const supabase = createAdminClient()

    const { data: oldDuel, error } = await supabase
      .from('pvp_duels')
      .select('*')
      .eq('id', normalizedId)
      .single()

    if (error || !oldDuel) {
      return { success: false, error: 'Không tìm thấy trận đấu cũ' }
    }

    let avatar = '🦊'
    if (oldDuel.player1_name.toLowerCase() === normalizedName.toLowerCase()) {
      avatar = oldDuel.player1_avatar || '🦊'
    } else if (
      oldDuel.player2_name &&
      oldDuel.player2_name.toLowerCase() === normalizedName.toLowerCase()
    ) {
      avatar = oldDuel.player2_avatar || '🐼'
    }

    const questionCount =
      Array.isArray(oldDuel.questions) && oldDuel.questions.length > 0
        ? oldDuel.questions.length
        : 5

    return createDuelRoomAction({
      playerName: normalizedName,
      avatar,
      topic: oldDuel.topic,
      questionCount,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tạo trận đấu lại'
    return { success: false, error: message }
  }
}
