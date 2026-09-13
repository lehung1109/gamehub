'use client'

import React from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { cn } from '@/lib/utils'

export interface OfflineIndicatorProps {
  forceOffline?: boolean
  forceSyncing?: boolean
  pendingCount?: number
  className?: string
}

export function OfflineIndicator({
  forceOffline,
  forceSyncing,
  pendingCount: propPendingCount,
  className,
}: OfflineIndicatorProps) {
  const network = useNetworkStatus()

  const isOffline = forceOffline !== undefined ? forceOffline : !network.isOnline
  const isSyncing = forceSyncing !== undefined ? forceSyncing : network.isSyncing
  const pendingCount =
    propPendingCount !== undefined ? propPendingCount : network.pendingSyncCount

  if (!isOffline && !isSyncing) {
    return null
  }

  if (isSyncing) {
    return (
      <aside
        aria-live="polite"
        role="status"
        aria-label="Offline Syncing Status"
        className={cn(
          'fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-indigo-400 animate-in fade-in slide-in-from-bottom-2',
          className
        )}
      >
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-200" aria-hidden="true" />
        <span className="text-base font-bold">
          Syncing offline progress ({pendingCount} pending)...
        </span>
      </aside>
    )
  }

  return (
    <aside
      aria-live="polite"
      role="status"
      aria-label="Offline Network Status"
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none',
        className
      )}
    >
      <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-amber-300 pointer-events-auto animate-in fade-in slide-in-from-top-2">
        <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center shrink-0">
          <WifiOff className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-black tracking-tight">You are currently offline</div>
          <div className="text-base font-medium text-amber-100 leading-tight">
            Learning games are available offline. Your progress is saved safely.
          </div>
        </div>
      </div>
    </aside>
  )
}
