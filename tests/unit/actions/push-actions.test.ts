// tests/unit/actions/push-actions.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  savePushSubscriptionAction,
  removePushSubscriptionAction,
  getPushSubscriptionPreferencesAction,
  updatePushSubscriptionPreferencesAction,
  sendTestPushAction,
  sendClassAnnouncementPushAction,
  sendStreakReminderPushAction,
  sendSrsReviewPushAction,
} from '@/app/actions/push'
import * as adminSupabase from '@/lib/supabase/admin'
import * as serverSupabase from '@/lib/supabase/server'
import * as pushService from '@/lib/push/push-service'
import type { PushSubscriptionData } from '@/types/push'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/push/push-service', () => ({
  sendWebPush: vi.fn(),
  sendBatchWebPush: vi.fn(),
}))

describe('Push Notifications Server Actions', () => {
  let mockAdmin: {
    from: ReturnType<typeof vi.fn>
  }
  let mockServer: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
  }

  const sampleSubData: PushSubscriptionData = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/sample-token',
    keys: {
      p256dh: 'BNcRdreALRF8FsII/182AEvsXBo182G8Fj4pLd2vVd==',
      auth: 'A1B2C3D4E5F6==',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()

    mockAdmin = {
      from: vi.fn(),
    }
    mockServer = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
    }

    vi.mocked(adminSupabase.createAdminClient).mockReturnValue(
      mockAdmin as unknown as ReturnType<typeof adminSupabase.createAdminClient>
    )
    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockServer as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
  })

  describe('savePushSubscriptionAction', () => {
    it('returns error if endpoint is missing', async () => {
      const result = await savePushSubscriptionAction({
        endpoint: '',
        keys: { p256dh: 'k1', auth: 'k2' },
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('Thiếu endpoint')
    })

    it('returns error if keys are incomplete', async () => {
      const result = await savePushSubscriptionAction({
        endpoint: 'https://push.example.com',
        keys: { p256dh: '', auth: 'k2' },
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('Thiếu khóa mã hóa VAPID')
    })

    it('saves subscription successfully with default preferences', async () => {
      const mockRecord = {
        id: 'sub-1',
        endpoint: sampleSubData.endpoint,
        p256dh: sampleSubData.keys.p256dh,
        auth: sampleSubData.keys.auth,
        user_id: 'user-123',
        student_id: 'student-99',
        parent_token: 'parent-token-abc',
        preferences: {
          daily_streak: true,
          srs_review: true,
          teacher_announcement: true,
          preferred_hour: 19,
        },
        created_at: '2026-09-13T14:00:00Z',
        updated_at: '2026-09-13T14:00:00Z',
        last_notified_at: null,
      }

      const singleMock = vi.fn().mockResolvedValue({ data: mockRecord, error: null })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const upsertMock = vi.fn().mockReturnValue({ select: selectMock })

      mockAdmin.from.mockReturnValue({
        upsert: upsertMock,
      })

      const result = await savePushSubscriptionAction(
        sampleSubData,
        { studentId: 'student-99', parentToken: 'parent-token-abc' },
        { daily_streak: false }
      )

      expect(result.success).toBe(true)
      expect(result.data?.endpoint).toBe(sampleSubData.endpoint)
      expect(result.data?.student_id).toBe('student-99')
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: sampleSubData.endpoint,
          student_id: 'student-99',
          parent_token: 'parent-token-abc',
          preferences: expect.objectContaining({
            daily_streak: false,
            srs_review: true,
          }),
        }),
        { onConflict: 'endpoint' }
      )
    })

    it('handles database error gracefully', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database failure' },
      })
      const selectMock = vi.fn().mockReturnValue({ single: singleMock })
      const upsertMock = vi.fn().mockReturnValue({ select: selectMock })

      mockAdmin.from.mockReturnValue({
        upsert: upsertMock,
      })

      const result = await savePushSubscriptionAction(sampleSubData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Không thể lưu đăng ký thông báo')
    })
  })

  describe('removePushSubscriptionAction', () => {
    it('returns error if endpoint is empty', async () => {
      const result = await removePushSubscriptionAction('  ')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Endpoint không hợp lệ')
    })

    it('deletes subscription successfully', async () => {
      const eqMock = vi.fn().mockResolvedValue({ error: null })
      const deleteMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockAdmin.from.mockReturnValue({ delete: deleteMock })

      const result = await removePushSubscriptionAction(sampleSubData.endpoint)
      expect(result.success).toBe(true)
      expect(eqMock).toHaveBeenCalledWith('endpoint', sampleSubData.endpoint)
    })
  })

  describe('getPushSubscriptionPreferencesAction', () => {
    it('returns default preferences if not found in db', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockAdmin.from.mockReturnValue({ select: selectMock })

      const result = await getPushSubscriptionPreferencesAction(sampleSubData.endpoint)
      expect(result.success).toBe(true)
      expect(result.data?.daily_streak).toBe(true)
    })

    it('returns stored preferences if found', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: {
          preferences: {
            daily_streak: false,
            srs_review: true,
            teacher_announcement: false,
          },
        },
        error: null,
      })
      const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockAdmin.from.mockReturnValue({ select: selectMock })

      const result = await getPushSubscriptionPreferencesAction(sampleSubData.endpoint)
      expect(result.success).toBe(true)
      expect(result.data?.daily_streak).toBe(false)
      expect(result.data?.teacher_announcement).toBe(false)
    })
  })

  describe('updatePushSubscriptionPreferencesAction', () => {
    it('updates preferences successfully', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({
        data: {
          preferences: {
            daily_streak: true,
            srs_review: true,
            teacher_announcement: true,
          },
        },
      })
      const eqSelectMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqSelectMock })

      const eqUpdateMock = vi.fn().mockResolvedValue({ error: null })
      const updateMock = vi.fn().mockReturnValue({ eq: eqUpdateMock })

      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'push_subscriptions') {
          return {
            select: selectMock,
            update: updateMock,
          }
        }
        return {}
      })

      const result = await updatePushSubscriptionPreferencesAction(sampleSubData.endpoint, {
        daily_streak: false,
      })

      expect(result.success).toBe(true)
      expect(result.data?.daily_streak).toBe(false)
      expect(result.data?.srs_review).toBe(true)
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          preferences: expect.objectContaining({
            daily_streak: false,
            srs_review: true,
          }),
        })
      )
    })
  })

  describe('sendTestPushAction', () => {
    it('sends test push via push-service', async () => {
      vi.mocked(pushService.sendWebPush).mockResolvedValue({
        success: true,
        endpoint: sampleSubData.endpoint,
        statusCode: 201,
      })

      const result = await sendTestPushAction(sampleSubData)
      expect(result.success).toBe(true)
      expect(result.data?.statusCode).toBe(201)
      expect(pushService.sendWebPush).toHaveBeenCalledWith(
        sampleSubData,
        expect.objectContaining({
          tag: 'test-notification',
        })
      )
    })

    it('handles push service failure gracefully', async () => {
      vi.mocked(pushService.sendWebPush).mockResolvedValue({
        success: false,
        endpoint: sampleSubData.endpoint,
        statusCode: 400,
        error: 'Bad request',
      })

      const result = await sendTestPushAction(sampleSubData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Bad request')
    })
  })

  describe('sendClassAnnouncementPushAction', () => {
    it('returns error if classroom or announcement is missing', async () => {
      const result = await sendClassAnnouncementPushAction('', '')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Thiếu classroomId hoặc announcementId')
    })

    it('returns error if announcement record is not found', async () => {
      const maybeSingleMock = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
      mockAdmin.from.mockReturnValue({ select: selectMock })

      const result = await sendClassAnnouncementPushAction('cls-1', 'ann-none')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Không tìm thấy thông báo')
    })

    it('broadcasts announcement to students and parent subscriptions', async () => {
      const deleteInMock = vi.fn().mockResolvedValue({ error: null })
      const deleteMock = vi.fn().mockReturnValue({ in: deleteInMock })
      const updateInMock = vi.fn().mockResolvedValue({ error: null })
      const updateMock = vi.fn().mockReturnValue({ in: updateInMock })

      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'classroom_announcements') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: 'ann-1',
                    title: 'Họp phụ huynh cuối kỳ',
                    content: 'Kính mời quý phụ huynh tham gia buổi họp lúc 8h sáng thứ 7.',
                    student_id: null,
                  },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'classrooms') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { name: 'Lớp 3A' },
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'students') {
          return {
            select: () => ({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: 'stu-1' }, { id: 'stu-2' }],
                error: null,
              }),
            }),
          }
        }
        if (table === 'student_parent_access') {
          return {
            select: () => ({
              in: vi.fn().mockResolvedValue({
                data: [{ access_token: 'parent-tok-1' }],
                error: null,
              }),
            }),
          }
        }
        if (table === 'push_subscriptions') {
          return {
            select: () => ({
              in: vi.fn().mockImplementation((col: string) => {
                if (col === 'student_id') {
                  return Promise.resolve({
                    data: [
                      {
                        endpoint: 'https://push.com/stu1',
                        p256dh: 'k1',
                        auth: 'a1',
                        preferences: { teacher_announcement: true },
                      },
                    ],
                  })
                }
                if (col === 'parent_token') {
                  return Promise.resolve({
                    data: [
                      {
                        endpoint: 'https://push.com/parent1',
                        p256dh: 'k2',
                        auth: 'a2',
                        preferences: { teacher_announcement: true },
                      },
                      {
                        endpoint: 'https://push.com/expired',
                        p256dh: 'k3',
                        auth: 'a3',
                        preferences: { teacher_announcement: true },
                      },
                    ],
                  })
                }
                return Promise.resolve({ data: [] })
              }),
            }),
            delete: deleteMock,
            update: updateMock,
          }
        }
        return {}
      })

      vi.mocked(pushService.sendBatchWebPush).mockResolvedValue([
        { success: true, endpoint: 'https://push.com/stu1', statusCode: 201 },
        { success: true, endpoint: 'https://push.com/parent1', statusCode: 201 },
        {
          success: false,
          endpoint: 'https://push.com/expired',
          statusCode: 410,
          isExpired: true,
          error: 'Subscription expired',
        },
      ])

      const result = await sendClassAnnouncementPushAction('cls-1', 'ann-1')

      expect(result.success).toBe(true)
      expect(result.sentCount).toBe(2)
      expect(result.failedCount).toBe(1)
      expect(pushService.sendBatchWebPush).toHaveBeenCalledTimes(1)
      // Dead endpoint cleanup
      expect(deleteInMock).toHaveBeenCalledWith('endpoint', ['https://push.com/expired'])
      // Successful timestamp update
      expect(updateInMock).toHaveBeenCalledWith('endpoint', [
        'https://push.com/stu1',
        'https://push.com/parent1',
      ])
    })
  })

  describe('sendStreakReminderPushAction', () => {
    it('returns early if no eligible subscriptions exist', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'students') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: { name: 'Bé Na' } }),
              }),
            }),
          }
        }
        if (table === 'push_subscriptions') {
          return {
            select: () => ({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    endpoint: 'https://push.com/na',
                    p256dh: 'k',
                    auth: 'a',
                    preferences: { daily_streak: false }, // Disabled!
                  },
                ],
              }),
            }),
          }
        }
        return {}
      })

      const result = await sendStreakReminderPushAction('stu-na', 5, 2)
      expect(result.success).toBe(true)
      expect(result.sentCount).toBe(0)
      expect(pushService.sendBatchWebPush).not.toHaveBeenCalled()
    })

    it('sends streak reminder if daily_streak is enabled', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'students') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: { name: 'Bé Na' } }),
              }),
            }),
          }
        }
        if (table === 'push_subscriptions') {
          return {
            select: () => ({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    endpoint: 'https://push.com/na',
                    p256dh: 'k',
                    auth: 'a',
                    preferences: { daily_streak: true },
                  },
                ],
              }),
            }),
            update: () => ({ in: vi.fn().mockResolvedValue({ error: null }) }),
            delete: () => ({ in: vi.fn().mockResolvedValue({ error: null }) }),
          }
        }
        return {}
      })

      vi.mocked(pushService.sendBatchWebPush).mockResolvedValue([
        { success: true, endpoint: 'https://push.com/na', statusCode: 201 },
      ])

      const result = await sendStreakReminderPushAction('stu-na', 5, 2)
      expect(result.success).toBe(true)
      expect(result.sentCount).toBe(1)
      expect(pushService.sendBatchWebPush).toHaveBeenCalledWith(
        [
          {
            endpoint: 'https://push.com/na',
            keys: { p256dh: 'k', auth: 'a' },
          },
        ],
        expect.objectContaining({
          tag: 'streak-reminder',
        })
      )
    })
  })

  describe('sendSrsReviewPushAction', () => {
    it('returns error on invalid parameters', async () => {
      const result = await sendSrsReviewPushAction('', 0)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Tham số không hợp lệ')
    })

    it('sends srs review reminder to student subscriptions', async () => {
      mockAdmin.from.mockImplementation((table: string) => {
        if (table === 'students') {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: { name: 'Minh' } }),
              }),
            }),
          }
        }
        if (table === 'push_subscriptions') {
          return {
            select: () => ({
              eq: vi.fn().mockResolvedValue({
                data: [
                  {
                    endpoint: 'https://push.com/minh',
                    p256dh: 'k',
                    auth: 'a',
                    preferences: { srs_review: true },
                  },
                ],
              }),
            }),
            update: () => ({ in: vi.fn().mockResolvedValue({ error: null }) }),
            delete: () => ({ in: vi.fn().mockResolvedValue({ error: null }) }),
          }
        }
        return {}
      })

      vi.mocked(pushService.sendBatchWebPush).mockResolvedValue([
        { success: true, endpoint: 'https://push.com/minh', statusCode: 201 },
      ])

      const result = await sendSrsReviewPushAction('stu-minh', 7, ['apple', 'banana'])
      expect(result.success).toBe(true)
      expect(result.sentCount).toBe(1)
      expect(pushService.sendBatchWebPush).toHaveBeenCalledWith(
        [
          {
            endpoint: 'https://push.com/minh',
            keys: { p256dh: 'k', auth: 'a' },
          },
        ],
        expect.objectContaining({
          tag: 'srs-review-reminder',
        })
      )
    })
  })
})
