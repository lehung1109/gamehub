// tests/unit/components/PushNotificationPrompt.test.tsx

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { PushNotificationPrompt } from '@/components/push/PushNotificationPrompt'
import { PushPreferencesCard } from '@/components/push/PushPreferencesCard'
import * as usePushHook from '@/hooks/usePushNotification'

vi.mock('@/hooks/usePushNotification', () => ({
  usePushNotification: vi.fn(),
}))

describe('Push Notification UI Components & Typography Compliance', () => {
  const mockSubscribe = vi.fn()
  const mockUnsubscribe = vi.fn()
  const mockUpdatePreferences = vi.fn()
  const mockSendTestPush = vi.fn()
  const mockRefresh = vi.fn()

  const defaultHookState: usePushHook.UsePushNotificationReturn = {
    isSupported: true,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
    subscription: null,
    preferences: {
      daily_streak: true,
      srs_review: true,
      teacher_announcement: true,
      preferred_hour: 19,
    },
    error: null,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    updatePreferences: mockUpdatePreferences,
    sendTestPush: mockSendTestPush,
    refresh: mockRefresh,
  }

  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    vi.mocked(usePushHook.usePushNotification).mockReturnValue({ ...defaultHookState })
  })

  describe('PushNotificationPrompt', () => {
    it('renders kid-friendly prompt banner when user is not subscribed', () => {
      render(<PushNotificationPrompt />)

      expect(
        screen.getByText('Đừng để ngọn lửa học tập bị tắt!')
      ).toBeInTheDocument()
      expect(screen.getByText('Bật thông báo ngay 🔔')).toBeInTheDocument()
      expect(screen.getByText('Để sau')).toBeInTheDocument()
    })

    it('does not render if user dismissed prompt in sessionStorage', () => {
      sessionStorage.setItem('gamehub_push_prompt_dismissed', 'true')
      const { container } = render(<PushNotificationPrompt />)

      expect(container.firstChild).toBeNull()
    })

    it('does not render if already subscribed and not forced', () => {
      vi.mocked(usePushHook.usePushNotification).mockReturnValue({
        ...defaultHookState,
        isSubscribed: true,
      })

      const { container } = render(<PushNotificationPrompt />)
      expect(container.firstChild).toBeNull()
    })

    it('does not render if browser does not support push', () => {
      vi.mocked(usePushHook.usePushNotification).mockReturnValue({
        ...defaultHookState,
        isSupported: false,
      })

      const { container } = render(<PushNotificationPrompt />)
      expect(container.firstChild).toBeNull()
    })

    it('calls subscribe on click and shows celebration feedback', async () => {
      mockSubscribe.mockResolvedValueOnce(true)
      render(<PushNotificationPrompt />)

      const btn = screen.getByText('Bật thông báo ngay 🔔')
      await act(async () => {
        fireEvent.click(btn)
      })

      expect(mockSubscribe).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Đã bật thông báo thành công!')).toBeInTheDocument()
    })

    it('hides prompt and sets sessionStorage on click "Để sau"', () => {
      const { container } = render(<PushNotificationPrompt />)

      const dismissBtn = screen.getByText('Để sau')
      fireEvent.click(dismissBtn)

      expect(sessionStorage.getItem('gamehub_push_prompt_dismissed')).toBe('true')
      expect(container.firstChild).toBeNull()
    })

    it('strictly complies with >= 16px kid-friendly typography rule (no text-xs or text-sm)', () => {
      const { container } = render(<PushNotificationPrompt forceVisible />)
      const html = container.innerHTML

      expect(html).not.toMatch(/text-xs/)
      expect(html).not.toMatch(/text-sm/)
      expect(html).not.toMatch(/text-\[10px\]/)
      expect(html).not.toMatch(/text-\[12px\]/)
      expect(html).not.toMatch(/text-\[14px\]/)
    })
  })

  describe('PushPreferencesCard', () => {
    it('renders preferences toggles and status correctly when unsubscribed', () => {
      render(<PushPreferencesCard />)

      expect(screen.getByText('Cài đặt Thông báo & Lời nhắc')).toBeInTheDocument()
      expect(screen.getByText('Chưa kích hoạt')).toBeInTheDocument()
      expect(screen.getByText('Kích hoạt ngay 🔔')).toBeInTheDocument()
    })

    it('renders active status, unsubscribe button, and test push button when subscribed', () => {
      vi.mocked(usePushHook.usePushNotification).mockReturnValue({
        ...defaultHookState,
        isSubscribed: true,
        subscription: {
          endpoint: 'https://push.com/sub1',
          keys: { p256dh: 'k1', auth: 'a1' },
        },
      })

      render(<PushPreferencesCard />)

      expect(screen.getByText('Đang nhận thông báo')).toBeInTheDocument()
      expect(screen.getByText('Tắt thông báo trên máy này')).toBeInTheDocument()
      expect(screen.getByText('Gửi thông báo thử 🚀')).toBeInTheDocument()
    })

    it('handles preference toggle updates on checkbox click', async () => {
      mockUpdatePreferences.mockResolvedValueOnce(true)
      render(<PushPreferencesCard />)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBe(3)

      await act(async () => {
        fireEvent.click(checkboxes[0]) // Daily streak toggle
      })

      expect(mockUpdatePreferences).toHaveBeenCalledWith({ daily_streak: false })
      expect(screen.getByText('Đã lưu thay đổi tùy chọn thông báo!')).toBeInTheDocument()
    })

    it('handles test push click successfully', async () => {
      vi.mocked(usePushHook.usePushNotification).mockReturnValue({
        ...defaultHookState,
        isSubscribed: true,
        subscription: {
          endpoint: 'https://push.com/sub1',
          keys: { p256dh: 'k1', auth: 'a1' },
        },
      })
      mockSendTestPush.mockResolvedValueOnce(true)

      render(<PushPreferencesCard />)

      const testBtn = screen.getByText('Gửi thông báo thử 🚀')
      await act(async () => {
        fireEvent.click(testBtn)
      })

      expect(mockSendTestPush).toHaveBeenCalledTimes(1)
      expect(
        screen.getByText('Đã gửi thông báo thử! Hãy kiểm tra thanh thông báo hệ thống.')
      ).toBeInTheDocument()
    })

    it('strictly complies with >= 16px kid-friendly typography rule (no text-xs or text-sm)', () => {
      vi.mocked(usePushHook.usePushNotification).mockReturnValue({
        ...defaultHookState,
        isSubscribed: true,
      })

      const { container } = render(<PushPreferencesCard />)
      const html = container.innerHTML

      expect(html).not.toMatch(/text-xs/)
      expect(html).not.toMatch(/text-sm/)
      expect(html).not.toMatch(/text-\[10px\]/)
      expect(html).not.toMatch(/text-\[12px\]/)
      expect(html).not.toMatch(/text-\[14px\]/)
    })
  })
})
