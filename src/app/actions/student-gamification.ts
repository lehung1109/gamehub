'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { Database, Json } from '@/types/database'
import type { StreakState } from '@/types/streak'
import type { StudentInventory } from '@/types/shop'
import type { Quest } from '@/types/quests'
import {
  getShopItemById,
  purchaseShopItem,
  equipShopItem,
  unequipShopItem,
  getInitialInventory,
  parseInventory,
} from '@/lib/shop'
import { claimQuestReward, parseQuests } from '@/lib/quests'
import { getInitialStreakState, parseStreakState } from '@/lib/streak'

type StudentGamificationUpdate = Database['public']['Tables']['student_gamification']['Update']
type StudentGamificationInsert = Database['public']['Tables']['student_gamification']['Insert']

export interface CloudStudentProfile {
  studentId: string
  totalStars: number
  effectiveStars: number
  streakState: StreakState
  inventory: StudentInventory
  quests: Quest[]
}

export interface GetStudentGamificationProfileInput {
  classCode: string
  studentName: string
}

export interface GetStudentGamificationProfileOutput {
  success: boolean
  data?: CloudStudentProfile
  error?: string
}

export interface SyncStudentGamificationInput {
  classCode: string
  studentName: string
  streakState?: StreakState
  inventory?: StudentInventory
  quests?: Quest[]
}

export interface SyncStudentGamificationOutput {
  success: boolean
  error?: string
}

export interface PurchaseShopItemInput {
  classCode: string
  studentName: string
  itemId: string
}

export interface PurchaseShopItemOutput {
  success: boolean
  inventory?: StudentInventory
  streakState?: StreakState
  remainingStars?: number
  error?: string
}

export interface EquipShopItemInput {
  classCode: string
  studentName: string
  itemId: string
  category: 'frame' | 'title'
}

export interface EquipShopItemOutput {
  success: boolean
  inventory?: StudentInventory
  error?: string
}

export interface ClaimQuestRewardInput {
  classCode: string
  studentName: string
  questId: string
}

export interface ClaimQuestRewardOutput {
  success: boolean
  quests?: Quest[]
  bonusStars?: number
  inventory?: StudentInventory
  streakState?: StreakState
  error?: string
}

function parseDbStreakState(raw: unknown): StreakState {
  if (!raw) return getInitialStreakState()
  if (typeof raw === 'string') return parseStreakState(raw)
  if (typeof raw === 'object') return parseStreakState(JSON.stringify(raw))
  return getInitialStreakState()
}

function parseDbInventory(raw: unknown): StudentInventory {
  if (!raw) return getInitialInventory()
  if (typeof raw === 'string') return parseInventory(raw)
  if (typeof raw === 'object') return parseInventory(JSON.stringify(raw))
  return getInitialInventory()
}

function parseDbQuests(raw: unknown): Quest[] {
  if (!raw) return []
  if (typeof raw === 'string') return parseQuests(raw)
  if (Array.isArray(raw)) return raw as Quest[]
  return []
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
    console.error('[student-gamification] Error querying student:', studentError)
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
        console.error('[student-gamification] Error creating student:', insertError)
        return { error: 'Không thể tạo bản ghi học sinh' }
      }
    } else {
      studentId = newStudent.id
    }
  }

  return { studentId, classroomId: classroom.id }
}

/**
 * Calculates raw total stars for a student by summing scores from game_sessions.
 */
async function calculateStudentTotalStars(
  supabase: ReturnType<typeof createAdminClient>,
  studentId: string
): Promise<number> {
  const { data: sessions, error: sessionsError } = await supabase
    .from('game_sessions')
    .select('score')
    .eq('student_id', studentId)

  if (sessionsError) {
    console.error('[student-gamification] Error querying game_sessions:', sessionsError)
    throw new Error('Lỗi khi tính điểm học sinh')
  }

  return (sessions || []).reduce((acc, sess) => {
    const scoreNum = typeof sess.score === 'number' && !isNaN(sess.score) ? sess.score : 0
    return acc + Math.max(0, scoreNum)
  }, 0)
}

/**
 * Retrieves or inserts default student_gamification row.
 */
async function getOrCreateGamificationRow(
  supabase: ReturnType<typeof createAdminClient>,
  studentId: string
): Promise<{
  id: string
  streakState: StreakState
  inventory: StudentInventory
  quests: Quest[]
}> {
  const { data: row, error: selectError } = await supabase
    .from('student_gamification')
    .select('id, streak_state, inventory, quests')
    .eq('student_id', studentId)
    .maybeSingle()

  if (selectError) {
    console.error('[student-gamification] Error querying student_gamification:', selectError)
    throw new Error('Lỗi khi tra cứu dữ liệu gamification')
  }

  if (row) {
    return {
      id: row.id,
      streakState: parseDbStreakState(row.streak_state),
      inventory: parseDbInventory(row.inventory),
      quests: parseDbQuests(row.quests),
    }
  }

  const initialStreak = getInitialStreakState()
  const initialInv = getInitialInventory()
  const initialQuests: Quest[] = []

  const insertPayload: StudentGamificationInsert = {
    student_id: studentId,
    streak_state: initialStreak as unknown as Json,
    inventory: initialInv as unknown as Json,
    quests: initialQuests as unknown as Json,
  }

  const { data: newRow, error: insertError } = await supabase
    .from('student_gamification')
    .insert(insertPayload)
    .select('id, streak_state, inventory, quests')
    .single()

  if (insertError || !newRow) {
    const { data: retryRow } = await supabase
      .from('student_gamification')
      .select('id, streak_state, inventory, quests')
      .eq('student_id', studentId)
      .maybeSingle()

    if (retryRow) {
      return {
        id: retryRow.id,
        streakState: parseDbStreakState(retryRow.streak_state),
        inventory: parseDbInventory(retryRow.inventory),
        quests: parseDbQuests(retryRow.quests),
      }
    }

    console.error('[student-gamification] Error inserting student_gamification:', insertError)
    throw new Error('Lỗi khi tạo dữ liệu gamification')
  }

  return {
    id: newRow.id,
    streakState: parseDbStreakState(newRow.streak_state),
    inventory: parseDbInventory(newRow.inventory),
    quests: parseDbQuests(newRow.quests),
  }
}

/**
 * 1. Fetch complete student profile with calculated totalStars and effectiveStars.
 */
export async function getStudentGamificationProfile(
  inputOrClassCode: GetStudentGamificationProfileInput | string,
  maybeStudentName?: string
): Promise<GetStudentGamificationProfileOutput> {
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
    const [totalStars, gamification] = await Promise.all([
      calculateStudentTotalStars(supabase, studentId),
      getOrCreateGamificationRow(supabase, studentId),
    ])

    const spentStars = gamification.inventory.spentStars || 0
    const bonusStars = gamification.inventory.bonusStars || 0
    const effectiveStars = Math.max(0, totalStars - spentStars + bonusStars)

    return {
      success: true,
      data: {
        studentId,
        totalStars,
        effectiveStars,
        streakState: gamification.streakState,
        inventory: gamification.inventory,
        quests: gamification.quests,
      },
    }
  } catch (err) {
    console.error('[getStudentGamificationProfile] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}

/**
 * 2. Sync / Upsert student gamification state (streaks, inventory, quests).
 */
export async function syncStudentGamificationState(
  inputOrClassCode: SyncStudentGamificationInput | string,
  maybeStudentName?: string,
  maybePayload?: {
    streakState?: StreakState
    inventory?: StudentInventory
    quests?: Quest[]
  }
): Promise<SyncStudentGamificationOutput> {
  try {
    let classCode: string
    let studentName: string
    let streakState: StreakState | undefined
    let inventory: StudentInventory | undefined
    let quests: Quest[] | undefined

    if (typeof inputOrClassCode === 'object' && inputOrClassCode !== null) {
      classCode = inputOrClassCode.classCode
      studentName = inputOrClassCode.studentName
      streakState = inputOrClassCode.streakState
      inventory = inputOrClassCode.inventory
      quests = inputOrClassCode.quests
    } else {
      classCode = inputOrClassCode
      studentName = maybeStudentName || ''
      streakState = maybePayload?.streakState
      inventory = maybePayload?.inventory
      quests = maybePayload?.quests
    }

    const supabase = createAdminClient()
    const verification = await verifyAndGetStudent(classCode, studentName, supabase)
    if (verification.error || !verification.studentId) {
      return { success: false, error: verification.error }
    }

    const { studentId } = verification

    const { data: existingRow, error: checkError } = await supabase
      .from('student_gamification')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle()

    if (checkError) {
      console.error('[syncStudentGamificationState] Error checking existing row:', checkError)
      return { success: false, error: 'Lỗi kiểm tra dữ liệu gamification' }
    }

    if (existingRow) {
      const updateData: StudentGamificationUpdate = {}
      if (streakState !== undefined) {
        updateData.streak_state = streakState as unknown as Json
      }
      if (inventory !== undefined) {
        updateData.inventory = inventory as unknown as Json
      }
      if (quests !== undefined) {
        updateData.quests = quests as unknown as Json
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('student_gamification')
          .update(updateData)
          .eq('student_id', studentId)

        if (updateError) {
          console.error('[syncStudentGamificationState] Update error:', updateError)
          return { success: false, error: 'Không thể cập nhật dữ liệu gamification' }
        }
      }
    } else {
      const insertPayload: StudentGamificationInsert = {
        student_id: studentId,
        streak_state: (streakState ?? getInitialStreakState()) as unknown as Json,
        inventory: (inventory ?? getInitialInventory()) as unknown as Json,
        quests: (quests ?? []) as unknown as Json,
      }

      const { error: insertError } = await supabase
        .from('student_gamification')
        .insert(insertPayload)

      if (insertError) {
        console.error('[syncStudentGamificationState] Insert error:', insertError)
        return { success: false, error: 'Không thể khởi tạo dữ liệu gamification' }
      }
    }

    return { success: true }
  } catch (err) {
    console.error('[syncStudentGamificationState] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}

/**
 * 3. Purchase shop item on cloud.
 */
export async function purchaseShopItemAction(
  inputOrClassCode: PurchaseShopItemInput | string,
  maybeStudentName?: string,
  maybeItemId?: string
): Promise<PurchaseShopItemOutput> {
  try {
    let classCode: string
    let studentName: string
    let itemId: string

    if (typeof inputOrClassCode === 'object' && inputOrClassCode !== null) {
      classCode = inputOrClassCode.classCode
      studentName = inputOrClassCode.studentName
      itemId = inputOrClassCode.itemId
    } else {
      classCode = inputOrClassCode
      studentName = maybeStudentName || ''
      itemId = maybeItemId || ''
    }

    if (!itemId || typeof itemId !== 'string' || !itemId.trim()) {
      return { success: false, error: 'Vật phẩm không hợp lệ' }
    }
    const cleanItemId = itemId.trim()

    const catalogItem = getShopItemById(cleanItemId)
    if (!catalogItem) {
      return { success: false, error: 'Vật phẩm không tồn tại' }
    }

    const supabase = createAdminClient()
    const verification = await verifyAndGetStudent(classCode, studentName, supabase)
    if (verification.error || !verification.studentId) {
      return { success: false, error: verification.error }
    }

    const { studentId } = verification
    const [totalStars, gamification] = await Promise.all([
      calculateStudentTotalStars(supabase, studentId),
      getOrCreateGamificationRow(supabase, studentId),
    ])

    const { inventory, streakState } = gamification
    const spentStars = inventory.spentStars || 0
    const bonusStars = inventory.bonusStars || 0
    const effectiveStars = Math.max(0, totalStars - spentStars + bonusStars)

    const purchaseResult = purchaseShopItem(inventory, effectiveStars, cleanItemId)
    if (!purchaseResult.success) {
      return {
        success: false,
        error: purchaseResult.error || 'Không thể mua vật phẩm',
      }
    }

    const updatePayload: StudentGamificationUpdate = {
      inventory: purchaseResult.newInventory as unknown as Json,
    }

    let updatedStreakState = streakState
    if (cleanItemId === 'streak_freeze') {
      updatedStreakState = {
        ...streakState,
        freezeCount: (streakState.freezeCount || 0) + 1,
      }
      updatePayload.streak_state = updatedStreakState as unknown as Json
    }

    const { error: updateError } = await supabase
      .from('student_gamification')
      .update(updatePayload)
      .eq('student_id', studentId)

    if (updateError) {
      console.error('[purchaseShopItemAction] Error updating DB:', updateError)
      return { success: false, error: 'Lỗi lưu thông tin mua hàng' }
    }

    return {
      success: true,
      inventory: purchaseResult.newInventory,
      streakState: updatedStreakState,
      remainingStars: purchaseResult.remainingStars,
    }
  } catch (err) {
    console.error('[purchaseShopItemAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}

/**
 * 4. Equip or unequip cosmetic item on cloud.
 */
export async function equipShopItemAction(
  inputOrClassCode: EquipShopItemInput | string,
  maybeStudentName?: string,
  maybeItemId?: string,
  maybeCategory?: 'frame' | 'title'
): Promise<EquipShopItemOutput> {
  try {
    let classCode: string
    let studentName: string
    let itemId: string
    let category: 'frame' | 'title'

    if (typeof inputOrClassCode === 'object' && inputOrClassCode !== null) {
      classCode = inputOrClassCode.classCode
      studentName = inputOrClassCode.studentName
      itemId = inputOrClassCode.itemId
      category = inputOrClassCode.category
    } else {
      classCode = inputOrClassCode
      studentName = maybeStudentName || ''
      itemId = maybeItemId || ''
      category = maybeCategory as 'frame' | 'title'
    }

    if (!itemId || typeof itemId !== 'string' || !itemId.trim()) {
      return { success: false, error: 'Vật phẩm không hợp lệ' }
    }
    if (category !== 'frame' && category !== 'title') {
      return { success: false, error: 'Loại vật phẩm không hợp lệ' }
    }

    const cleanItemId = itemId.trim()
    const catalogItem = getShopItemById(cleanItemId)
    if (!catalogItem) {
      return { success: false, error: 'Vật phẩm không tồn tại' }
    }
    if (catalogItem.category !== category) {
      return { success: false, error: 'Loại vật phẩm không khớp danh mục' }
    }

    const supabase = createAdminClient()
    const verification = await verifyAndGetStudent(classCode, studentName, supabase)
    if (verification.error || !verification.studentId) {
      return { success: false, error: verification.error }
    }

    const { studentId } = verification
    const gamification = await getOrCreateGamificationRow(supabase, studentId)
    const { inventory } = gamification

    if (!inventory.ownedItemIds.includes(cleanItemId)) {
      return { success: false, error: 'Bạn chưa sở hữu vật phẩm này' }
    }

    let updatedInventory: StudentInventory
    if (category === 'frame') {
      if (inventory.equippedFrameId === cleanItemId) {
        // Toggle unequip
        updatedInventory = unequipShopItem(inventory, 'frame')
      } else {
        updatedInventory = equipShopItem(inventory, cleanItemId)
      }
    } else {
      if (inventory.equippedTitleId === cleanItemId) {
        // Toggle unequip
        updatedInventory = unequipShopItem(inventory, 'title')
      } else {
        updatedInventory = equipShopItem(inventory, cleanItemId)
      }
    }

    const { error: updateError } = await supabase
      .from('student_gamification')
      .update({ inventory: updatedInventory as unknown as Json })
      .eq('student_id', studentId)

    if (updateError) {
      console.error('[equipShopItemAction] Error updating DB:', updateError)
      return { success: false, error: 'Lỗi lưu thông tin trang bị' }
    }

    return {
      success: true,
      inventory: updatedInventory,
    }
  } catch (err) {
    console.error('[equipShopItemAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}

/**
 * 5. Claim quest reward on cloud.
 */
export async function claimQuestRewardAction(
  inputOrClassCode: ClaimQuestRewardInput | string,
  maybeStudentName?: string,
  maybeQuestId?: string
): Promise<ClaimQuestRewardOutput> {
  try {
    let classCode: string
    let studentName: string
    let questId: string

    if (typeof inputOrClassCode === 'object' && inputOrClassCode !== null) {
      classCode = inputOrClassCode.classCode
      studentName = inputOrClassCode.studentName
      questId = inputOrClassCode.questId
    } else {
      classCode = inputOrClassCode
      studentName = maybeStudentName || ''
      questId = maybeQuestId || ''
    }

    if (!questId || typeof questId !== 'string' || !questId.trim()) {
      return { success: false, error: 'Nhiệm vụ không hợp lệ' }
    }
    const cleanQuestId = questId.trim()

    const supabase = createAdminClient()
    const verification = await verifyAndGetStudent(classCode, studentName, supabase)
    if (verification.error || !verification.studentId) {
      return { success: false, error: verification.error }
    }

    const { studentId } = verification
    const gamification = await getOrCreateGamificationRow(supabase, studentId)
    const { quests, inventory, streakState } = gamification

    const claimResult = claimQuestReward(quests, cleanQuestId)
    if (!claimResult.claimedReward) {
      return {
        success: false,
        error: claimResult.error || 'Không thể nhận phần thưởng',
      }
    }

    const updatedInventory: StudentInventory = {
      ...inventory,
      bonusStars: (inventory.bonusStars || 0) + claimResult.claimedReward.stars,
    }

    const updatePayload: StudentGamificationUpdate = {
      quests: claimResult.updatedQuests as unknown as Json,
      inventory: updatedInventory as unknown as Json,
    }

    let updatedStreakState = streakState
    if (claimResult.claimedReward.freeze > 0) {
      updatedStreakState = {
        ...streakState,
        freezeCount: (streakState.freezeCount || 0) + claimResult.claimedReward.freeze,
      }
      updatePayload.streak_state = updatedStreakState as unknown as Json
    }

    const { error: updateError } = await supabase
      .from('student_gamification')
      .update(updatePayload)
      .eq('student_id', studentId)

    if (updateError) {
      console.error('[claimQuestRewardAction] Error updating DB:', updateError)
      return { success: false, error: 'Lỗi lưu thông tin nhận thưởng' }
    }

    return {
      success: true,
      quests: claimResult.updatedQuests,
      bonusStars: updatedInventory.bonusStars,
      inventory: updatedInventory,
      streakState: updatedStreakState,
    }
  } catch (err) {
    console.error('[claimQuestRewardAction] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống',
    }
  }
}
