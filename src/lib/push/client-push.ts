// src/lib/push/client-push.ts

import type { PushSubscriptionData } from '@/types/push'

export const DEFAULT_VAPID_PUBLIC_KEY =
  'BLfQXBci6Vy_X4l_EC2ZzxvgtofbeTDgUgEl85v2BDaD8-OceIDb7hsBM_QR2oyFNr2Gpm00-HP0jU3R_izaoms'

/**
 * Returns the client-safe public VAPID key.
 */
export function getClientVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY
}

/**
 * Converts a URL-safe Base64 string to a Uint8Array buffer for applicationServerKey.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  if (typeof window === 'undefined') {
    return new Uint8Array(new ArrayBuffer(0))
  }

  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Normalizes a browser PushSubscription into PushSubscriptionData.
 */
export function formatPushSubscription(sub: PushSubscription): PushSubscriptionData {
  const json = typeof sub.toJSON === 'function' ? sub.toJSON() : null

  if (json && json.keys && json.keys.p256dh && json.keys.auth) {
    return {
      endpoint: sub.endpoint,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
    }
  }

  // Fallback via getKey
  const rawKey = typeof sub.getKey === 'function' ? sub.getKey('p256dh') : null
  const rawAuth = typeof sub.getKey === 'function' ? sub.getKey('auth') : null

  const p256dh = rawKey
    ? btoa(String.fromCharCode(...new Uint8Array(rawKey)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    : ''

  const auth = rawAuth
    ? btoa(String.fromCharCode(...new Uint8Array(rawAuth)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
    : ''

  return {
    endpoint: sub.endpoint,
    keys: {
      p256dh,
      auth,
    },
  }
}
