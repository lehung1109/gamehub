// src/components/push/PushNotificationPrompt.tsx

'use client'

import React, { useState } from 'react'
import { usePushNotification } from '@/hooks/usePushNotification'

export interface PushNotificationPromptProps {
  studentId?: string | null
  parentToken?: string | null
  userId?: string | null
  forceVisible?: boolean
  className?: string
  onSubscribed?: () => void
  onDismissed?: () => void
}

const DISMISS_STORAGE_KEY = 'gamehub_push_prompt_dismissed'

export function PushNotificationPrompt({
  studentId,
  parentToken,
  userId,
  forceVisible = false,
  className = '',
  onSubscribed,
  onDismissed,
}: PushNotificationPromptProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    error: pushError,
  } = usePushNotification({
    studentId,
    parentToken,
    userId,
  })

  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(DISMISS_STORAGE_KEY) === 'true'
    }
    return false
  })
  const [actionSuccess, setActionSuccess] = useState(false)

  // If already subscribed, not supported, permission denied, or dismissed (and not forced), render nothing
  if (!forceVisible) {
    if (isDismissed || isSubscribed || !isSupported || permission === 'denied' || isLoading) {
      return null
    }
  }

  const handleSubscribe = async () => {
    const success = await subscribe()
    if (success) {
      setActionSuccess(true)
      if (onSubscribed) onSubscribed()
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true')
    }
    if (onDismissed) onDismissed()
  }

  if (actionSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 text-emerald-900 shadow-md ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            🎉
          </span>
          <div className="flex-1">
            <h4 className="text-lg font-bold">Đã bật thông báo thành công!</h4>
            <p className="text-base text-emerald-800">
              GameHub sẽ nhắc bạn khi đến giờ ôn tập hoặc cần bảo vệ chuỗi ngày nhé.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-semibold transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    )
  }

  return (
    <aside
      aria-label="Thông báo đẩy học tập"
      className={`relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-lg ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl" aria-hidden="true">
              🔥
            </span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-amber-950 flex items-center gap-2">
              Đừng để ngọn lửa học tập bị tắt!
            </h3>
            <p className="text-base text-amber-900 mt-1 max-w-xl leading-relaxed">
              Bật thông báo ngay để GameHub nhắc bạn ôn 5 phút từ vựng khó mỗi ngày và duy trì chuỗi
              thành tích siêu đỉnh.
            </p>
            {pushError && (
              <p className="text-base text-red-600 font-semibold mt-2">{pushError}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-base font-bold transition border border-amber-200 cursor-pointer"
          >
            Để sau
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubscribe}
            className="flex-1 md:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-base font-extrabold shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Đang kích hoạt...' : 'Bật thông báo ngay 🔔'}
          </button>
        </div>
      </div>
    </aside>
  )
}
