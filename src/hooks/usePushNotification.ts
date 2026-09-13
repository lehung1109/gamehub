// src/hooks/usePushNotification.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PushSubscriptionData, PushPreferences } from '@/types/push'
import { DEFAULT_PUSH_PREFERENCES } from '@/types/push'
import {
  getClientVapidPublicKey,
  urlBase64ToUint8Array,
  formatPushSubscription,
} from '@/lib/push/client-push'
import {
  savePushSubscriptionAction,
  removePushSubscriptionAction,
  getPushSubscriptionPreferencesAction,
  updatePushSubscriptionPreferencesAction,
  sendTestPushAction,
  type SaveSubscriptionMetadata,
} from '@/app/actions/push'

export interface UsePushNotificationOptions {
  studentId?: string | null
  parentToken?: string | null
  userId?: string | null
  autoCheck?: boolean
}

export interface UsePushNotificationReturn {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  subscription: PushSubscriptionData | null
  preferences: PushPreferences
  error: string | null
  subscribe: (prefs?: Partial<PushPreferences>) => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  updatePreferences: (prefs: Partial<PushPreferences>) => Promise<boolean>
  sendTestPush: () => Promise<boolean>
  refresh: () => Promise<void>
}

export function usePushNotification(
  options: UsePushNotificationOptions = {}
): UsePushNotificationReturn {
  const { studentId, parentToken, userId, autoCheck = true } = options

  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(autoCheck)
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null)
  const [preferences, setPreferences] = useState<PushPreferences>(DEFAULT_PUSH_PREFERENCES)
  const [error, setError] = useState<string | null>(null)

  const checkSupportAndSubscription = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        setIsSupported(false)
        setIsLoading(false)
        return
      }

      setIsSupported(true)
      setPermission(Notification.permission)

      const reg = await navigator.serviceWorker.ready
      const existingSub = await reg.pushManager.getSubscription()

      if (existingSub) {
        const formatted = formatPushSubscription(existingSub)
        setSubscription(formatted)
        setIsSubscribed(true)

        // Sync preferences from server
        try {
          const prefRes = await getPushSubscriptionPreferencesAction(formatted.endpoint)
          if (prefRes.success && prefRes.data) {
            setPreferences(prefRes.data)
          }
        } catch {
          // Ignored
        }
      } else {
        setSubscription(null)
        setIsSubscribed(false)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kiểm tra trạng thái thông báo'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!autoCheck) {
      return
    }

    let isMounted = true

    const runCheck = async () => {
      try {
        if (
          typeof window === 'undefined' ||
          !('serviceWorker' in navigator) ||
          !('PushManager' in window) ||
          !('Notification' in window)
        ) {
          if (isMounted) {
            setIsSupported(false)
            setIsLoading(false)
          }
          return
        }

        if (isMounted) {
          setIsSupported(true)
          setPermission(Notification.permission)
        }

        const reg = await navigator.serviceWorker.ready
        const existingSub = await reg.pushManager.getSubscription()

        if (!isMounted) return

        if (existingSub) {
          const formatted = formatPushSubscription(existingSub)
          setSubscription(formatted)
          setIsSubscribed(true)

          try {
            const prefRes = await getPushSubscriptionPreferencesAction(formatted.endpoint)
            if (isMounted && prefRes.success && prefRes.data) {
              setPreferences(prefRes.data)
            }
          } catch {
            // Ignored
          }
        } else {
          setSubscription(null)
          setIsSubscribed(false)
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Lỗi kiểm tra trạng thái thông báo'
          setError(msg)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void runCheck()

    return () => {
      isMounted = false
    }
  }, [autoCheck])

  const subscribe = useCallback(
    async (customPrefs?: Partial<PushPreferences>): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        if (!isSupported && typeof window !== 'undefined') {
          const supported =
            'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
          if (!supported) {
            setError('Trình duyệt của bạn không hỗ trợ tính năng Web Push Notifications')
            setIsLoading(false)
            return false
          }
        }

        const perm = await Notification.requestPermission()
        setPermission(perm)

        if (perm !== 'granted') {
          setError('Quyền nhận thông báo đã bị từ chối trên thiết bị này')
          setIsLoading(false)
          return false
        }

        const reg = await navigator.serviceWorker.ready
        const vapidPublicKey = getClientVapidPublicKey()
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey)

        let browserSub = await reg.pushManager.getSubscription()
        if (!browserSub) {
          browserSub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          })
        }

        const formatted = formatPushSubscription(browserSub)
        const metadata: SaveSubscriptionMetadata = {
          studentId,
          parentToken,
          userId,
        }

        const res = await savePushSubscriptionAction(formatted, metadata, customPrefs)
        if (!res.success) {
          setError(res.error || 'Lưu đăng ký thông báo thất bại')
          setIsLoading(false)
          return false
        }

        setSubscription(formatted)
        setIsSubscribed(true)
        if (res.data?.preferences) {
          setPreferences(res.data.preferences)
        }
        setIsLoading(false)
        return true
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể đăng ký nhận thông báo'
        setError(msg)
        setIsLoading(false)
        return false
      }
    },
    [isSupported, studentId, parentToken, userId]
  )

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        const browserSub = await reg.pushManager.getSubscription()
        if (browserSub) {
          const endpoint = browserSub.endpoint
          await browserSub.unsubscribe()
          await removePushSubscriptionAction(endpoint)
        }
      }

      setSubscription(null)
      setIsSubscribed(false)
      setIsLoading(false)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi hủy đăng ký nhận thông báo'
      setError(msg)
      setIsLoading(false)
      return false
    }
  }, [])

  const updatePreferences = useCallback(
    async (newPrefs: Partial<PushPreferences>): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const merged: PushPreferences = {
          ...preferences,
          ...newPrefs,
        }

        if (subscription?.endpoint) {
          const res = await updatePushSubscriptionPreferencesAction(
            subscription.endpoint,
            newPrefs
          )
          if (!res.success) {
            setError(res.error || 'Cập nhật cài đặt thông báo thất bại')
            setIsLoading(false)
            return false
          }
          if (res.data) {
            setPreferences(res.data)
          }
        } else {
          setPreferences(merged)
        }

        setIsLoading(false)
        return true
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi cập nhật cài đặt thông báo'
        setError(msg)
        setIsLoading(false)
        return false
      }
    },
    [preferences, subscription]
  )

  const sendTestPush = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      setError('Thiết bị chưa đăng ký nhận thông báo')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await sendTestPushAction(subscription)
      if (!res.success) {
        setError(res.error || 'Không gửi được thông báo thử')
        setIsLoading(false)
        return false
      }

      setIsLoading(false)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gửi thông báo thử'
      setError(msg)
      setIsLoading(false)
      return false
    }
  }, [subscription])

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscription,
    preferences,
    error,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestPush,
    refresh: checkSupportAndSubscription,
  }
}
