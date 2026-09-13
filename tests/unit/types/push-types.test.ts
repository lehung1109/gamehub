import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PUSH_PREFERENCES,
  type PushSubscriptionData,
  type PushMessagePayload,
  type PushSendResult,
  type PushSubscriptionRecord,
} from '@/types/push';

describe('Push Domain Models & Contracts', () => {
  it('provides sensible default push preferences', () => {
    expect(DEFAULT_PUSH_PREFERENCES).toEqual({
      daily_streak: true,
      srs_review: true,
      teacher_announcement: true,
      preferred_hour: 19,
    });
  });

  it('validates shape of PushSubscriptionData', () => {
    const sub: PushSubscriptionData = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/sample-endpoint-123',
      keys: {
        p256dh: 'sample-p256dh-key-abc',
        auth: 'sample-auth-key-xyz',
      },
    };

    expect(sub.endpoint).toContain('googleapis.com');
    expect(sub.keys.p256dh).toBe('sample-p256dh-key-abc');
    expect(sub.keys.auth).toBe('sample-auth-key-xyz');
  });

  it('constructs a rich PushMessagePayload with kid-friendly defaults', () => {
    const payload: PushMessagePayload = {
      title: '🔥 Giữ vững chuỗi ngày học tập!',
      body: 'Bạn chỉ còn 4 tiếng để hoàn thành 1 bài học và duy trì chuỗi 5 ngày!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'streak-reminder',
      data: {
        url: '/roadmap',
        topic: 'daily_streak',
      },
      actions: [
        { action: 'open_roadmap', title: 'Khám phá ngay' },
        { action: 'dismiss', title: 'Để sau' },
      ],
    };

    expect(payload.title).toContain('chuỗi');
    expect(payload.data?.url).toBe('/roadmap');
    expect(payload.actions).toHaveLength(2);
  });

  it('formats PushSendResult accurately for successful and expired subscriptions', () => {
    const successResult: PushSendResult = {
      success: true,
      endpoint: 'https://push.example.com/sub-1',
      statusCode: 201,
    };
    expect(successResult.success).toBe(true);
    expect(successResult.isExpired).toBeUndefined();

    const expiredResult: PushSendResult = {
      success: false,
      endpoint: 'https://push.example.com/sub-2',
      statusCode: 410,
      isExpired: true,
      error: 'Subscription expired or unsubscribed',
    };
    expect(expiredResult.success).toBe(false);
    expect(expiredResult.isExpired).toBe(true);
  });

  it('maps PushSubscriptionRecord for student and parent contexts', () => {
    const record: PushSubscriptionRecord = {
      id: 'sub-uuid-1',
      endpoint: 'https://push.example.com/device-1',
      p256dh: 'p256',
      auth: 'auth',
      student_id: 'student-123',
      parent_token: 'ptok-456',
      preferences: DEFAULT_PUSH_PREFERENCES,
      created_at: new Date().toISOString(),
    };

    expect(record.student_id).toBe('student-123');
    expect(record.parent_token).toBe('ptok-456');
    expect(record.preferences.daily_streak).toBe(true);
  });
});
