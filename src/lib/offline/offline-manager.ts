// src/lib/offline/offline-manager.ts

import type { OfflineActionType, QueuedOfflineAction } from '@/types/speech'

export const OFFLINE_QUEUE_STORAGE_KEY = 'gamehub_offline_queue'

/**
 * Dispatches a client event notifying components of queue changes
 */
function notifyQueueUpdated() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('gamehub_offline_queue_updated'))
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
export function incrementActionRetry(id: string): boolean {
  const queue = getOfflineQueue()
  const index = queue.findIndex((item) => item.id === id)
  if (index === -1) return false

  const action = queue[index]
  const nextCount = action.retryCount + 1

  if (nextCount >= action.maxRetries) {
    // Drop action
    console.warn(`[incrementActionRetry] Action ${id} exceeded max retries (${action.maxRetries}), dropping.`)
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

export type ActionHandlerMap = Record<
  OfflineActionType,
  (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
>

/**
 * Processes all pending queued actions sequentially with the given handlers.
 */
export async function syncOfflineQueue(
  handlers: ActionHandlerMap
): Promise<{ total: number; succeeded: number; failed: number }> {
  const queue = getOfflineQueue()
  if (queue.length === 0) {
    return { total: 0, succeeded: 0, failed: 0 }
  }

  let succeeded = 0
  let failed = 0

  // Process sequentially to preserve order of events
  for (const action of queue) {
    const handler = handlers[action.type]
    if (!handler) {
      console.warn(`[syncOfflineQueue] No handler registered for action type: ${action.type}`)
      failed++
      incrementActionRetry(action.id)
      continue
    }

    try {
      const res = await handler(action.payload)
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

  return {
    total: queue.length,
    succeeded,
    failed,
  }
}
