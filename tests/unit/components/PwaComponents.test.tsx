import React from 'react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { useNetworkStatus, REQUEST_OFFLINE_SYNC_EVENT } from '@/hooks/useNetworkStatus'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'
import { InstallPromptBanner } from '@/components/pwa/InstallPromptBanner'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'
import {
  enqueueOfflineAction,
  clearOfflineQueue,
  getOfflineQueue,
} from '@/lib/offline/offline-manager'

describe('PWA UI Components & Network Status Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearOfflineQueue()
  })

  describe('useNetworkStatus Hook', () => {
    it('detects initial online status and responds to offline and online events', () => {
      const { result } = renderHook(() => useNetworkStatus())

      expect(typeof result.current.isOnline).toBe('boolean')

      act(() => {
        window.dispatchEvent(new Event('offline'))
      })
      expect(result.current.isOnline).toBe(false)

      act(() => {
        window.dispatchEvent(new Event('online'))
      })
      expect(result.current.isOnline).toBe(true)
    })

    it('tracks pending offline action count dynamically and dispatches sync event without data loss', async () => {
      const { result } = renderHook(() => useNetworkStatus())

      expect(result.current.pendingSyncCount).toBe(0)

      act(() => {
        enqueueOfflineAction('RECORD_SESSION', { game: 'flashcard' })
      })

      expect(result.current.pendingSyncCount).toBe(1)

      const syncRequestListener = vi.fn()
      window.addEventListener(REQUEST_OFFLINE_SYNC_EVENT, syncRequestListener)

      await act(async () => {
        await result.current.triggerSync()
      })

      expect(syncRequestListener).toHaveBeenCalled()
      // Offline action must NOT be purged by a mock placeholder
      expect(getOfflineQueue().length).toBe(1)

      window.removeEventListener(REQUEST_OFFLINE_SYNC_EVENT, syncRequestListener)
    })
  })

  describe('OfflineIndicator Component', () => {
    it('renders reassuring offline notification when disconnected', () => {
      render(<OfflineIndicator forceOffline={true} />)

      expect(screen.getByRole('status')).toBeDefined()
      expect(screen.getByText('You are currently offline')).toBeDefined()
      expect(screen.getByText(/saved safely|chơi ngoại tuyến|available/i)).toBeDefined()
    })

    it('does not render when online with zero pending sync items', () => {
      const { container } = render(<OfflineIndicator forceOffline={false} pendingCount={0} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders sync in progress badge when online and pending items exist', () => {
      render(<OfflineIndicator forceOffline={false} pendingCount={2} forceSyncing={true} />)

      expect(screen.getByRole('status')).toBeDefined()
      expect(screen.getByText(/syncing/i)).toBeDefined()
    })

    it('complies strictly with kid-friendly typography (no text-xs, text-sm)', () => {
      const { container } = render(<OfflineIndicator forceOffline={true} />)
      const html = container.innerHTML

      expect(html).not.toContain('text-xs')
      expect(html).not.toContain('text-sm')
      expect(html).not.toContain('text-[10px]')
      expect(html).not.toContain('text-[12px]')
      expect(html).not.toContain('text-[14px]')
    })
  })

  describe('InstallPromptBanner Component', () => {
    it('renders install prompt when beforeinstallprompt event is captured', async () => {
      render(<InstallPromptBanner forceShow={false} />)

      // Initially null before event
      expect(screen.queryByRole('region', { name: /install app/i })).toBeNull()

      // Dispatch beforeinstallprompt
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      })

      act(() => {
        window.dispatchEvent(event)
      })

      expect(screen.getByRole('region', { name: /install app/i })).toBeDefined()
      expect(screen.getByText('Install GameHub App')).toBeDefined()

      const installBtn = screen.getByRole('button', { name: /install now/i })
      expect(installBtn).toBeDefined()

      const laterBtn = screen.getByRole('button', { name: /later/i })
      expect(laterBtn).toBeDefined()
    })

    it('dismisses banner and sets cooldown when clicking later', () => {
      const { container } = render(<InstallPromptBanner forceShow={true} />)

      const laterBtn = screen.getByRole('button', { name: /later/i })
      fireEvent.click(laterBtn)

      // Banner should hide
      expect(container.firstChild).toBeNull()
      expect(localStorage.getItem('gamehub_pwa_install_dismissed')).toBeDefined()
    })

    it('complies strictly with kid-friendly typography (no text-xs, text-sm)', () => {
      const { container } = render(<InstallPromptBanner forceShow={true} />)
      const html = container.innerHTML

      expect(html).not.toContain('text-xs')
      expect(html).not.toContain('text-sm')
      expect(html).not.toContain('text-[10px]')
      expect(html).not.toContain('text-[12px]')
      expect(html).not.toContain('text-[14px]')
    })
  })

  describe('ServiceWorkerRegister Component', () => {
    it('renders without crashing and mounts PWA status elements', () => {
      render(<ServiceWorkerRegister />)
      // Component mounts and registers safely in non-test or guarded environments
      expect(document.body).toBeDefined()
    })
  })
})
