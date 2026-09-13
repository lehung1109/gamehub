// src/lib/push/push-service.ts
import webpush from 'web-push';
import type {
  PushSubscriptionData,
  PushMessagePayload,
  PushSendResult,
} from '@/types/push';

// Built-in RFC 8292 fallback key pair for development & test environments
const FALLBACK_VAPID_PUBLIC_KEY =
  'BLfQXBci6Vy_X4l_EC2ZzxvgtofbeTDgUgEl85v2BDaD8-OceIDb7hsBM_QR2oyFNr2Gpm00-HP0jU3R_izaoms';
const FALLBACK_VAPID_PRIVATE_KEY =
  'RDndqisfKRZvQEZ__nOKmDGQZFDj1fyzJehFTpdstgQ';
const FALLBACK_VAPID_SUBJECT = 'mailto:support@gamehub.edu.vn';

export function getVapidConfig() {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    process.env.VAPID_PUBLIC_KEY ||
    FALLBACK_VAPID_PUBLIC_KEY;

  const privateKey =
    process.env.VAPID_PRIVATE_KEY ||
    FALLBACK_VAPID_PRIVATE_KEY;

  const subject =
    process.env.VAPID_SUBJECT ||
    FALLBACK_VAPID_SUBJECT;

  return { publicKey, privateKey, subject };
}

let isVapidConfigured = false;
function ensureVapidConfigured() {
  if (!isVapidConfigured) {
    const { publicKey, privateKey, subject } = getVapidConfig();
    webpush.setVapidDetails(subject, publicKey, privateKey);
    isVapidConfigured = true;
  }
}

export async function sendWebPush(
  subscription: PushSubscriptionData,
  payload: PushMessagePayload
): Promise<PushSendResult> {
  ensureVapidConfigured();

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  };

  const payloadString = JSON.stringify(payload);

  try {
    const res = await webpush.sendNotification(pushSubscription, payloadString, {
      TTL: 86400, // 24 hours
    });

    return {
      success: true,
      endpoint: subscription.endpoint,
      statusCode: res.statusCode,
    };
  } catch (err: unknown) {
    const errorObj = err as { statusCode?: number; message?: string };
    const statusCode = errorObj.statusCode;
    const isExpired = statusCode === 404 || statusCode === 410;

    return {
      success: false,
      endpoint: subscription.endpoint,
      statusCode,
      isExpired,
      error: errorObj.message || 'Unknown Web Push error',
    };
  }
}

export async function sendBatchWebPush(
  subscriptions: PushSubscriptionData[],
  payload: PushMessagePayload
): Promise<PushSendResult[]> {
  return Promise.all(subscriptions.map((sub) => sendWebPush(sub, payload)));
}
