// src/components/push/PushPreferencesCard.tsx

'use client'

import React, { useState } from 'react'
import { usePushNotification } from '@/hooks/usePushNotification'

export interface PushPreferencesCardProps {
  studentId?: string | null
  parentToken?: string | null
  userId?: string | null
  className?: string
}

export function PushPreferencesCard({
  studentId,
  parentToken,
  userId,
  className = '',
}: PushPreferencesCardProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestPush,
    error: pushError,
  } = usePushNotification({
    studentId,
    parentToken,
    userId,
  })

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )
  const [isTesting, setIsTesting] = useState(false)

  const handleTogglePreference = async (
    key: 'daily_streak' | 'srs_review' | 'teacher_announcement'
  ) => {
    setFeedback(null)
    const nextVal = !preferences[key]
    const ok = await updatePreferences({ [key]: nextVal })
    if (ok) {
      setFeedback({ type: 'success', message: 'Đã lưu thay đổi tùy chọn thông báo!' })
    } else {
      setFeedback({ type: 'error', message: 'Không thể cập nhật tùy chọn thông báo.' })
    }
  }

  const handleToggleSubscription = async () => {
    setFeedback(null)
    if (isSubscribed) {
      const ok = await unsubscribe()
      if (ok) {
        setFeedback({ type: 'success', message: 'Đã hủy nhận thông báo trên thiết bị này.' })
      }
    } else {
      const ok = await subscribe()
      if (ok) {
        setFeedback({ type: 'success', message: 'Đã đăng ký nhận thông báo thành công!' })
      }
    }
  }

  const handleTestPush = async () => {
    setIsTesting(true)
    setFeedback(null)
    const ok = await sendTestPush()
    setIsTesting(false)
    if (ok) {
      setFeedback({
        type: 'success',
        message: 'Đã gửi thông báo thử! Hãy kiểm tra thanh thông báo hệ thống.',
      })
    } else {
      setFeedback({
        type: 'error',
        message: 'Không thể gửi thông báo thử. Vui lòng kiểm tra quyền hệ thống.',
      })
    }
  }

  return (
    <section
      aria-label="Cài đặt thông báo học tập"
      className={`bg-white rounded-3xl border-2 border-indigo-100 p-6 md:p-8 shadow-md ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              🔔
            </span>
            <h3 className="text-2xl font-black text-gray-900">Cài đặt Thông báo & Lời nhắc</h3>
          </div>
          <p className="text-base text-gray-600 mt-2">
            Quản lý thông báo học tập, lời nhắc duy trì ngọn lửa và tin nhắn từ giáo viên trên thiết
            bị này.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isSupported ? (
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-base font-bold bg-gray-100 text-gray-600">
              Trình duyệt không hỗ trợ
            </span>
          ) : permission === 'denied' ? (
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-base font-bold bg-red-100 text-red-700">
              Bị từ chối quyền
            </span>
          ) : isSubscribed ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-base font-bold bg-emerald-100 text-emerald-800">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              Đang nhận thông báo
            </span>
          ) : (
            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-base font-bold bg-amber-100 text-amber-800">
              Chưa kích hoạt
            </span>
          )}
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`mt-4 p-4 rounded-2xl text-base font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {pushError && (
        <div
          role="alert"
          className="mt-4 p-4 rounded-2xl bg-red-50 text-red-800 border border-red-200 text-base font-semibold"
        >
          {pushError}
        </div>
      )}

      {/* Subscription Master Toggle */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
        <div>
          <h4 className="text-lg font-bold text-gray-900">
            {isSubscribed ? 'Thông báo đang bật' : 'Bật thông báo đẩy (Web Push)'}
          </h4>
          <p className="text-base text-gray-600 mt-1">
            {isSubscribed
              ? 'Thiết bị này đang nhận các thông báo nhắc nhở tự động từ GameHub.'
              : 'Nhận thông báo ngay cả khi bạn không mở trình duyệt GameHub.'}
          </p>
        </div>

        <button
          type="button"
          disabled={isLoading || !isSupported}
          onClick={handleToggleSubscription}
          className={`px-6 py-3 rounded-2xl text-base font-bold transition transform active:scale-95 disabled:opacity-50 cursor-pointer ${
            isSubscribed
              ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
          }`}
        >
          {isLoading
            ? 'Đang xử lý...'
            : isSubscribed
            ? 'Tắt thông báo trên máy này'
            : 'Kích hoạt ngay 🔔'}
        </button>
      </div>

      {/* Detail Preferences (only relevant if supported) */}
      <div className="mt-6 space-y-4">
        <h4 className="text-lg font-extrabold text-gray-900">Nội dung muốn nhận nhắc nhở:</h4>

        <label className="flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 bg-gray-50/50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={preferences.daily_streak}
            disabled={isLoading}
            onChange={() => handleTogglePreference('daily_streak')}
            className="w-6 h-6 mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-base font-bold text-gray-900 flex items-center gap-2">
              🔥 Giữ ngọn lửa chuỗi ngày (Streak Reminder)
            </span>
            <p className="text-base text-gray-600 mt-1">
              Nhắc nhở lúc 19:00 hàng ngày nếu bạn nhỏ chưa vào ôn tập để không bị mất chuỗi thành
              tích.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 bg-gray-50/50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={preferences.srs_review}
            disabled={isLoading}
            onChange={() => handleTogglePreference('srs_review')}
            className="w-6 h-6 mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-base font-bold text-gray-900 flex items-center gap-2">
              📚 Ôn từ khó theo chu kỳ Spaced Repetition (SRS)
            </span>
            <p className="text-base text-gray-600 mt-1">
              Báo cho bạn khi có các từ vựng trong Sổ tay từ khó đến thời điểm ôn tập 5 phút củng cố
              trí nhớ.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 bg-gray-50/50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={preferences.teacher_announcement}
            disabled={isLoading}
            onChange={() => handleTogglePreference('teacher_announcement')}
            className="w-6 h-6 mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="flex-1">
            <span className="text-base font-bold text-gray-900 flex items-center gap-2">
              📢 Tin nhắn & Thông báo từ giáo viên
            </span>
            <p className="text-base text-gray-600 mt-1">
              Nhận thông báo tức thì khi giáo viên gửi bài tập về nhà, dặn dò hoặc nhận xét học tập.
            </p>
          </div>
        </label>
      </div>

      {/* Test push button */}
      {isSubscribed && (
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-base text-gray-500">
            Kiểm tra xem hệ thống và trình duyệt của bạn có nhận được thông báo không.
          </p>
          <button
            type="button"
            disabled={isTesting || isLoading}
            onClick={handleTestPush}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-base font-bold transition border border-gray-300 disabled:opacity-50 cursor-pointer"
          >
            {isTesting ? 'Đang gửi...' : 'Gửi thông báo thử 🚀'}
          </button>
        </div>
      )}
    </section>
  )
}
