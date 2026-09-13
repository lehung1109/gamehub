'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getOfflineQueue,
  getOfflineSyncStatus,
  syncOfflineQueue,
  OFFLINE_QUEUE_EVENT,
} from '@/lib/offline/offline-manager'
import type { SyncProcessorInput } from '@/lib/offline/offline-manager'

export const REQUEST_OFFLINE_SYNC_EVENT = 'gamehub_request_offline_sync'

export interface NetworkStatus {
  isOnline: boolean
  pendingSyncCount: number
  isSyncing: boolean
  triggerSync: (
    processorInput?: SyncProcessorInput
  ) => Promise<{ total: number; succeeded: number; failed: number }>
}

export function useNetworkStatus(): NetworkStatus {
  const isMountedRef = useRef(true)

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true
    return typeof navigator.onLine === 'boolean' ? navigator.onLine : true
  })

  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => {
    return getOfflineQueue().length
  })

  const [isSyncing, setIsSyncing] = useState<boolean>(() => {
    return getOfflineSyncStatus().isSyncing
  })

  const refreshStatus = useCallback(() => {
    if (!isMountedRef.current) return
    const status = getOfflineSyncStatus()
    setPendingSyncCount(status.pendingCount)
    setIsSyncing(status.isSyncing)
  }, [])

  const triggerSync = useCallback(
    async (processorInput?: SyncProcessorInput) => {
      const currentOnline =
        typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
          ? navigator.onLine
          : true

      if (!currentOnline) {
        return { total: 0, succeeded: 0, failed: 0 }
      }

      refreshStatus()

      // Notify registered application handlers to perform real background synchronization
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        try {
          window.dispatchEvent(new CustomEvent(REQUEST_OFFLINE_SYNC_EVENT))
        } catch {
          // Ignore
        }
      }

      let result = { total: 0, succeeded: 0, failed: 0 }
      if (processorInput) {
        result = await syncOfflineQueue(processorInput)
      }

      refreshStatus()
      return result
    },
    [refreshStatus]
  )

  useEffect(() => {
    isMountedRef.current = true

    const handleOnline = () => {
      if (isMountedRef.current) {
        setIsOnline(true)
        refreshStatus()
        triggerSync()
      }
    }

    const handleOffline = () => {
      if (isMountedRef.current) {
        setIsOnline(false)
        refreshStatus()
      }
    }

    const handleQueueUpdated = () => {
      if (isMountedRef.current) {
        refreshStatus()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      window.addEventListener(OFFLINE_QUEUE_EVENT, handleQueueUpdated)
    }

    return () => {
      isMountedRef.current = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        window.removeEventListener(OFFLINE_QUEUE_EVENT, handleQueueUpdated)
      }
    }
  }, [refreshStatus, triggerSync])

  return {
    isOnline,
    pendingSyncCount,
    isSyncing,
    triggerSync,
  }
}
