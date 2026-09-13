// src/lib/offline/offline-manager.ts

import type {
  OfflineActionType,
  QueuedOfflineAction,
  OfflineSyncStatus,
} from '@/types/speech'

export const OFFLINE_QUEUE_STORAGE_KEY = 'gamehub_offline_queue'
export const OFFLINE_QUEUE_EVENT = 'gamehub_offline_queue_updated'

let isSyncInProgress = false
let lastSyncTimestamp: string | null = null

/**
 * Dispatches a client event notifying components of queue changes
 */
function notifyQueueUpdated() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_EVENT))
    } catch {
      // Ignore if CustomEvent is unsupported
    }
  }
}

/**
 * Retrieves all currently queued offline actions from storage
 */
export function getOfflineQueue(): QueuedOfflineAction[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed as QueuedOfflineAction[]
    }
    return []
  } catch (e) {
    console.debug('[getOfflineQueue] Error parsing stored queue:', e)
    return []
  }
}

/**
 * Saves the given queue array to storage
 */
function persistOfflineQueue(queue: QueuedOfflineAction[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue))
    notifyQueueUpdated()
  } catch (e) {
    console.error('[persistOfflineQueue] Failed to persist queue:', e)
  }
}

/**
 * Returns current sync status including pending queue count, online status, and syncing flag
 */
export function getOfflineSyncStatus(): OfflineSyncStatus {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const pendingCount = getOfflineQueue().length

  return {
    isOnline,
    pendingCount,
    lastSyncTimestamp,
    isSyncing: isSyncInProgress,
  }
}

/**
 * Enqueues a new offline action for eventual background sync
 */
export function enqueueOfflineAction(
  type: OfflineActionType,
  payload: Record<string, unknown>,
  maxRetries = 3
): QueuedOfflineAction {
  const queue = getOfflineQueue()

  const newAction: QueuedOfflineAction = {
    id: `offline-act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    maxRetries,
  }

  queue.push(newAction)
  persistOfflineQueue(queue)
  return newAction
}

/**
 * Removes a successfully processed action from the queue by ID
 */
export function removeOfflineAction(id: string): void {
  const queue = getOfflineQueue()
  const filtered = queue.filter((item) => item.id !== id)
  if (filtered.length !== queue.length) {
    persistOfflineQueue(filtered)
  }
}

/**
 * Increments the retry count for an action.
 * If retry count reaches maxRetries, drops the action to avoid infinite loops.
 * Returns true if the action is retained, false if dropped.
 */
export function incrementActionRetry(id: string, maxRetries?: number): boolean {
  const queue = getOfflineQueue()
  const index = queue.findIndex((item) => item.id === id)
  if (index === -1) return false

  const action = queue[index]
  const effectiveMaxRetries = maxRetries ?? action.maxRetries ?? 3
  const nextCount = action.retryCount + 1

  if (nextCount >= effectiveMaxRetries) {
    // Drop action
    console.warn(
      `[incrementActionRetry] Action ${id} exceeded max retries (${effectiveMaxRetries}), dropping.`
    )
    queue.splice(index, 1)
    persistOfflineQueue(queue)
    return false
  }

  queue[index] = { ...action, retryCount: nextCount }
  persistOfflineQueue(queue)
  return true
}

/**
 * Clears all queued offline actions
 */
export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(OFFLINE_QUEUE_STORAGE_KEY)
    notifyQueueUpdated()
  } catch (e) {
    console.error('[clearOfflineQueue] Error clearing queue:', e)
  }
}

export type ActionProcessor = (
  action: QueuedOfflineAction
) => Promise<{ success: boolean; error?: string }>

export type ActionHandlerMap = Partial<
  Record<
    OfflineActionType,
    (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
  >
>

export type SyncProcessorInput = ActionProcessor | ActionHandlerMap

/**
 * Processes all pending queued actions sequentially with the given handlers or callback.
 * Includes concurrency locking to prevent parallel duplicate executions.
 */
export async function syncOfflineQueue(
  processorInput: SyncProcessorInput
): Promise<{ total: number; succeeded: number; failed: number }> {
  if (isSyncInProgress) {
    console.warn('[syncOfflineQueue] Sync already in progress, skipping concurrent run.')
    return { total: 0, succeeded: 0, failed: 0 }
  }

  const queue = getOfflineQueue()
  if (queue.length === 0) {
    return { total: 0, succeeded: 0, failed: 0 }
  }

  isSyncInProgress = true
  let succeeded = 0
  let failed = 0

  try {
    for (const action of queue) {
      try {
        let res: { success: boolean; error?: string }

        if (typeof processorInput === 'function') {
          res = await processorInput(action)
        } else {
          const handler = processorInput[action.type]
          if (!handler) {
            console.warn(`[syncOfflineQueue] No handler registered for action type: ${action.type}`)
            failed++
            incrementActionRetry(action.id)
            continue
          }
          res = await handler(action.payload)
        }

        if (res.success) {
          succeeded++
          removeOfflineAction(action.id)
        } else {
          failed++
          incrementActionRetry(action.id)
        }
      } catch (err) {
        console.error(`[syncOfflineQueue] Exception processing action ${action.id}:`, err)
        failed++
        incrementActionRetry(action.id)
      }
    }
  } finally {
    isSyncInProgress = false
    lastSyncTimestamp = new Date().toISOString()
    notifyQueueUpdated()
  }

  return {
    total: queue.length,
    succeeded,
    failed,
  }
}
