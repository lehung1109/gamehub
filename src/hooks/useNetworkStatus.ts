'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getOfflineQueue,
  getOfflineSyncStatus,
  syncOfflineQueue,
  OFFLINE_QUEUE_EVENT,
} from '@/lib/offline/offline-manager'
import type { QueuedOfflineAction } from '@/types/speech'

export interface NetworkStatus {
  isOnline: boolean
  pendingSyncCount: number
  isSyncing: boolean
  triggerSync: () => Promise<{ total: number; succeeded: number; failed: number }>
}

export function useNetworkStatus(): NetworkStatus {
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
    const status = getOfflineSyncStatus()
    setPendingSyncCount(status.pendingCount)
    setIsSyncing(status.isSyncing)
  }, [])

  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      return { total: 0, succeeded: 0, failed: 0 }
    }

    refreshStatus()

    // Generic processor placeholder: in layout/app level, actual action handlers can be registered
    const result = await syncOfflineQueue(async (action: QueuedOfflineAction) => {
      console.log(`[useNetworkStatus] Auto-processing queued action: ${action.type}`, action.id)
      return { success: true }
    })

    refreshStatus()
    return result
  }, [isOnline, refreshStatus])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      refreshStatus()
      // Auto sync when reconnected
      triggerSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
      refreshStatus()
    }

    const handleQueueUpdated = () => {
      refreshStatus()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
      window.addEventListener(OFFLINE_QUEUE_EVENT, handleQueueUpdated)
    }

    return () => {
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
