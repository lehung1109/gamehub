// src/app/actions/push.ts

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type {
  PushSubscriptionData,
  PushPreferences,
  PushSubscriptionRecord,
  PushSendResult,
} from '@/types/push'
import { DEFAULT_PUSH_PREFERENCES } from '@/types/push'
import {
  generateTestPushMessage,
  generateTeacherAnnouncementReminder,
  generateStreakReminder,
  generateSrsReviewReminder,
} from '@/lib/push/reminder-generator'
import { sendWebPush, sendBatchWebPush } from '@/lib/push/push-service'
import type { Json } from '@/types/database'

export interface SaveSubscriptionMetadata {
  studentId?: string | null
  parentToken?: string | null
  userId?: string | null
}

export interface PushActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Registers or updates a Web Push subscription in the database.
 */
export async function savePushSubscriptionAction(
  subscription: PushSubscriptionData,
  metadata?: SaveSubscriptionMetadata,
  preferences?: Partial<PushPreferences>
): Promise<PushActionResult<PushSubscriptionRecord>> {
  try {
    if (!subscription || !subscription.endpoint || typeof subscription.endpoint !== 'string') {
      return { success: false, error: 'Thiếu endpoint của đăng ký thông báo' }
    }

    if (
      !subscription.keys ||
      !subscription.keys.p256dh ||
      !subscription.keys.auth ||
      typeof subscription.keys.p256dh !== 'string' ||
      typeof subscription.keys.auth !== 'string'
    ) {
      return { success: false, error: 'Thiếu khóa mã hóa VAPID (p256dh hoặc auth)' }
    }

    const mergedPreferences: PushPreferences = {
      ...DEFAULT_PUSH_PREFERENCES,
      ...(preferences || {}),
    }

    const supabase = createAdminClient()

    // Determine user ID if not explicitly supplied
    let effectiveUserId = metadata?.userId || null
    if (!effectiveUserId) {
      try {
        const authClient = await createClient()
        const {
          data: { user },
        } = await authClient.auth.getUser()
        if (user) {
          effectiveUserId = user.id
        }
      } catch {
        // Ignored in non-auth or background contexts
      }
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          preferences: mergedPreferences as unknown as Json,
          student_id: metadata?.studentId || null,
          parent_token: metadata?.parentToken || null,
          user_id: effectiveUserId,
          updated_at: now,
        },
        { onConflict: 'endpoint' }
      )
      .select()
      .single()

    if (error || !data) {
      console.error('[savePushSubscriptionAction] Upsert error:', error)
      return { success: false, error: 'Không thể lưu đăng ký thông báo vào cơ sở dữ liệu' }
    }

    const record: PushSubscriptionRecord = {
      id: data.id,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      user_id: data.user_id,
      student_id: data.student_id,
      parent_token: data.parent_token,
      preferences: (data.preferences as unknown as PushPreferences) || DEFAULT_PUSH_PREFERENCES,
      created_at: data.created_at,
      updated_at: data.updated_at,
      last_notified_at: data.last_notified_at,
    }

    return { success: true, data: record }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu đăng ký Push'
    return { success: false, error: message }
  }
}

/**
 * Removes a Web Push subscription by its unique endpoint.
 */
export async function removePushSubscriptionAction(
  endpoint: string
): Promise<PushActionResult<{ endpoint: string }>> {
  try {
    if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim()) {
      return { success: false, error: 'Endpoint không hợp lệ' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint.trim())

    if (error) {
      console.error('[removePushSubscriptionAction] Delete error:', error)
      return { success: false, error: 'Không thể xóa đăng ký thông báo' }
    }

    return { success: true, data: { endpoint } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi hủy đăng ký Push'
    return { success: false, error: message }
  }
}

/**
 * Fetches the user notification preferences for an endpoint.
 */
export async function getPushSubscriptionPreferencesAction(
  endpoint: string
): Promise<PushActionResult<PushPreferences>> {
  try {
    if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim()) {
      return { success: false, data: DEFAULT_PUSH_PREFERENCES, error: 'Endpoint không hợp lệ' }
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('preferences')
      .eq('endpoint', endpoint.trim())
      .maybeSingle()

    if (error || !data) {
      return { success: true, data: DEFAULT_PUSH_PREFERENCES }
    }

    const preferences = (data.preferences as unknown as PushPreferences) || DEFAULT_PUSH_PREFERENCES
    return { success: true, data: preferences }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi lấy cài đặt thông báo'
    return { success: false, data: DEFAULT_PUSH_PREFERENCES, error: message }
  }
}

/**
 * Updates notification preferences for an existing endpoint.
 */
export async function updatePushSubscriptionPreferencesAction(
  endpoint: string,
  preferences: Partial<PushPreferences>
): Promise<PushActionResult<PushPreferences>> {
  try {
    if (!endpoint || typeof endpoint !== 'string' || !endpoint.trim()) {
      return { success: false, error: 'Endpoint không hợp lệ' }
    }

    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('preferences')
      .eq('endpoint', endpoint.trim())
      .maybeSingle()

    const currentPrefs = (existing?.preferences as unknown as PushPreferences) || DEFAULT_PUSH_PREFERENCES
    const mergedPreferences: PushPreferences = {
      ...currentPrefs,
      ...preferences,
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        preferences: mergedPreferences as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('endpoint', endpoint.trim())

    if (error) {
      console.error('[updatePushSubscriptionPreferencesAction] Update error:', error)
      return { success: false, error: 'Không thể cập nhật tùy chọn thông báo' }
    }

    return { success: true, data: mergedPreferences }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi cập nhật tùy chọn thông báo'
    return { success: false, error: message }
  }
}

/**
 * Sends a test push notification to verify service worker receipt.
 */
export async function sendTestPushAction(
  subscription: PushSubscriptionData
): Promise<PushActionResult<PushSendResult>> {
  try {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return { success: false, error: 'Thông tin subscription không hợp lệ' }
    }

    const payload = generateTestPushMessage()
    const result = await sendWebPush(subscription, payload)

    if (!result.success) {
      return { success: false, data: result, error: result.error || 'Gửi thông báo thử thất bại' }
    }

    return { success: true, data: result }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi gửi thông báo thử'
    return { success: false, error: message }
  }
}

/**
 * Broadcasts a classroom announcement push notification to all subscribed parents and students.
 */
export async function sendClassAnnouncementPushAction(
  classroomId: string,
  announcementId: string
): Promise<{ success: boolean; sentCount: number; failedCount: number; error?: string }> {
  try {
    if (!classroomId || !announcementId) {
      return { success: false, sentCount: 0, failedCount: 0, error: 'Thiếu classroomId hoặc announcementId' }
    }

    const supabase = createAdminClient()

    // 1. Fetch announcement
    const { data: announcement, error: annErr } = await supabase
      .from('classroom_announcements')
      .select('id, title, content, student_id')
      .eq('id', announcementId)
      .maybeSingle()

    if (annErr || !announcement) {
      return { success: false, sentCount: 0, failedCount: 0, error: 'Không tìm thấy thông báo' }
    }

    // 2. Fetch classroom name
    const { data: classroom } = await supabase
      .from('classrooms')
      .select('name')
      .eq('id', classroomId)
      .maybeSingle()

    const classroomName = classroom?.name || 'Lớp học'

    // 3. Find target student IDs
    let targetStudentIds: string[] = []
    if (announcement.student_id) {
      targetStudentIds = [announcement.student_id]
    } else {
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('classroom_id', classroomId)

      if (students && students.length > 0) {
        targetStudentIds = students.map((s) => s.id)
      }
    }

    if (targetStudentIds.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 }
    }

    // 4. Find parent tokens for these students
    const { data: parentAccessList } = await supabase
      .from('student_parent_access')
      .select('access_token')
      .in('student_id', targetStudentIds)

    const parentTokens = (parentAccessList || []).map((p) => p.access_token)

    // 5. Query matching subscriptions (by student_id or parent_token)
    const [subByStudentRes, subByParentRes] = await Promise.all([
      supabase.from('push_subscriptions').select('*').in('student_id', targetStudentIds),
      parentTokens.length > 0
        ? supabase.from('push_subscriptions').select('*').in('parent_token', parentTokens)
        : Promise.resolve({ data: [] }),
    ])

    const combined = [...(subByStudentRes.data || []), ...(subByParentRes.data || [])]
    const subMap = new Map<string, (typeof combined)[number]>()
    for (const sub of combined) {
      subMap.set(sub.endpoint, sub)
    }

    // Filter by preference 'teacher_announcement'
    const eligibleSubs: PushSubscriptionData[] = []
    for (const sub of subMap.values()) {
      const prefs = (sub.preferences as unknown as PushPreferences) || DEFAULT_PUSH_PREFERENCES
      if (prefs.teacher_announcement !== false) {
        eligibleSubs.push({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        })
      }
    }

    if (eligibleSubs.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 }
    }

    // 6. Generate payload and dispatch
    const payload = generateTeacherAnnouncementReminder({
      classroomName,
      title: announcement.title,
      excerpt: announcement.content.slice(0, 120),
      announcementId: announcement.id,
    })

    const results = await sendBatchWebPush(eligibleSubs, payload)

    // 7. Cleanup expired subscriptions & record last_notified_at
    const expiredEndpoints = results.filter((r) => r.isExpired).map((r) => r.endpoint)
    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
    }

    const successfulEndpoints = results.filter((r) => r.success).map((r) => r.endpoint)
    if (successfulEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ last_notified_at: new Date().toISOString() })
        .in('endpoint', successfulEndpoints)
    }

    const sentCount = successfulEndpoints.length
    const failedCount = results.length - sentCount

    return { success: true, sentCount, failedCount }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi phát thông báo lớp học'
    return { success: false, sentCount: 0, failedCount: 0, error: message }
  }
}

/**
 * Sends a streak preservation reminder to a student.
 */
export async function sendStreakReminderPushAction(
  studentId: string,
  currentStreak = 1,
  hoursRemaining = 4
): Promise<{ success: boolean; sentCount: number; failedCount: number; error?: string }> {
  try {
    if (!studentId) {
      return { success: false, sentCount: 0, failedCount: 0, error: 'Thiếu studentId' }
    }

    const supabase = createAdminClient()

    // 1. Fetch student info
    const { data: student } = await supabase
      .from('students')
      .select('name')
      .eq('id', studentId)
      .maybeSingle()

    // 2. Query subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('student_id', studentId)

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 }
    }

    const eligibleSubs: PushSubscriptionData[] = []
    for (const sub of subscriptions) {
      const prefs = (sub.preferences as unknown as PushPreferences) || DEFAULT_PUSH_PREFERENCES
      if (prefs.daily_streak !== false) {
        eligibleSubs.push({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        })
      }
    }

    if (eligibleSubs.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 }
    }

    const payload = generateStreakReminder({
      studentName: student?.name,
      currentStreak,
      hoursRemaining,
    })

    const results = await sendBatchWebPush(eligibleSubs, payload)

    // Cleanup expired
    const expiredEndpoints = results.filter((r) => r.isExpired).map((r) => r.endpoint)
    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
    }

    const successfulEndpoints = results.filter((r) => r.success).map((r) => r.endpoint)
    if (successfulEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ last_notified_at: new Date().toISOString() })
        .in('endpoint', successfulEndpoints)
    }

    const sentCount = successfulEndpoints.length
    const failedCount = results.length - sentCount

    return { success: true, sentCount, failedCount }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi gửi lời nhắc chuỗi ngày'
    return { success: false, sentCount: 0, failedCount: 0, error: message }
  }
}

/**
 * Sends a spaced repetition (SRS) memory review alert.
 */
export async function sendSrsReviewPushAction(
  studentId: string,
  pendingCardsCount: number,
  words?: string[]
): Promise<{ success: boolean; sentCount: number; failedCount: number; error?: string }> {
  try {
    if (!studentId || pendingCardsCount <= 0) {
      return { success: false, sentCount: 0, failedCount: 0, error: 'Tham số không hợp lệ' }
    }

    const supabase = createAdminClient()

    // 1. Fetch student info
    const { data: student } = await supabase
      .from('students')
      .select('name')
      .eq('id', studentId)
      .maybeSingle()

    // 2. Query subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('student_id', studentId)

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 }
    }

    const eligibleSubs: PushSubscriptionData[] = []
    for (const sub of subscriptions) {
      const prefs = (sub.preferences as unknown as PushPreferences) || DEFAULT_PUSH_PREFERENCES
      if (prefs.srs_review !== false) {
        eligibleSubs.push({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        })
      }
    }

    if (eligibleSubs.length === 0) {
      return { success: true, sentCount: 0, failedCount: 0 }
    }

    const payload = generateSrsReviewReminder({
      studentName: student?.name,
      pendingCardsCount,
      words,
    })

    const results = await sendBatchWebPush(eligibleSubs, payload)

    const expiredEndpoints = results.filter((r) => r.isExpired).map((r) => r.endpoint)
    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
    }

    const successfulEndpoints = results.filter((r) => r.success).map((r) => r.endpoint)
    if (successfulEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ last_notified_at: new Date().toISOString() })
        .in('endpoint', successfulEndpoints)
    }

    const sentCount = successfulEndpoints.length
    const failedCount = results.length - sentCount

    return { success: true, sentCount, failedCount }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi gửi lời nhắc ôn tập SRS'
    return { success: false, sentCount: 0, failedCount: 0, error: message }
  }
}
