import { describe, it, expect, vi, beforeEach } from 'vitest';
import webpush from 'web-push';
import {
  getVapidConfig,
  sendWebPush,
  sendBatchWebPush,
} from '@/lib/push/push-service';
import type { PushSubscriptionData, PushMessagePayload } from '@/types/push';

vi.mock('web-push', () => {
  return {
    default: {
      setVapidDetails: vi.fn(),
      sendNotification: vi.fn(),
    },
  };
});

describe('Push Service (web-push integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSub: PushSubscriptionData = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
    keys: {
      p256dh: 'BNcRdreALRF8M-v5wSBY22tbdFh4729KSndjG2ZNhS_example',
      auth: 'tBHItDaA6pExampleAuthKey',
    },
  };

  const samplePayload: PushMessagePayload = {
    title: 'GameHub Test',
    body: 'Notification body',
  };

  it('provides valid VAPID configuration with development fallback', () => {
    const config = getVapidConfig();
    expect(config.publicKey).toBeDefined();
    expect(config.privateKey).toBeDefined();
    expect(config.subject).toContain('mailto:');
  });

  it('sends notification successfully and returns PushSendResult with statusCode 201', async () => {
    vi.mocked(webpush.sendNotification).mockResolvedValueOnce({
      statusCode: 201,
      body: '',
      headers: {},
    });

    const result = await sendWebPush(mockSub, samplePayload);

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.endpoint).toBe(mockSub.endpoint);
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    expect(webpush.sendNotification).toHaveBeenCalledWith(
      {
        endpoint: mockSub.endpoint,
        keys: mockSub.keys,
      },
      JSON.stringify(samplePayload),
      expect.any(Object)
    );
  });

  it('detects 410 Gone / 404 Not Found as an expired subscription', async () => {
    const error410 = {
      statusCode: 410,
      message: 'Subscription has expired or unsubscribed',
    };
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(error410);

    const result = await sendWebPush(mockSub, samplePayload);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(410);
    expect(result.isExpired).toBe(true);
    expect(result.error).toContain('Subscription has expired');
  });

  it('handles general network errors gracefully without crashing', async () => {
    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(new Error('Network timeout'));

    const result = await sendWebPush(mockSub, samplePayload);

    expect(result.success).toBe(false);
    expect(result.isExpired).toBe(false);
    expect(result.error).toBe('Network timeout');
  });

  it('sends batch notifications to multiple subscriptions in parallel', async () => {
    vi.mocked(webpush.sendNotification).mockResolvedValue({
      statusCode: 201,
      body: '',
      headers: {},
    });

    const subs: PushSubscriptionData[] = [
      mockSub,
      {
        endpoint: 'https://push.mozilla.com/test-endpoint-2',
        keys: { p256dh: 'k2', auth: 'a2' },
      },
    ];

    const results = await sendBatchWebPush(subs, samplePayload);

    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(true);
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
  });
});
