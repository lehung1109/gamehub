import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  enqueueOfflineAction,
  getOfflineQueue,
  clearOfflineQueue,
  removeOfflineAction,
  incrementActionRetry,
  syncOfflineQueue,
  getOfflineSyncStatus,
  OFFLINE_QUEUE_STORAGE_KEY,
  OFFLINE_QUEUE_EVENT,
} from '@/lib/offline/offline-manager'
import type { ActionHandlerMap } from '@/lib/offline/offline-manager'

describe('Offline Action Queue & Sync Manager', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('enqueues actions into localStorage and retrieves them properly', () => {
    const action = enqueueOfflineAction('RECORD_SESSION', {
      gameId: 'flashcard',
      score: 95,
    })

    expect(action.id).toBeDefined()
    expect(action.type).toBe('RECORD_SESSION')
    expect(action.payload).toEqual({ gameId: 'flashcard', score: 95 })
    expect(action.retryCount).toBe(0)
    expect(action.maxRetries).toBe(3)

    const queue = getOfflineQueue()
    expect(queue.length).toBe(1)
    expect(queue[0].id).toBe(action.id)
  })

  it('handles multiple queued actions in chronological FIFO order', () => {
    const act1 = enqueueOfflineAction('RECORD_SESSION', { score: 80 })
    const act2 = enqueueOfflineAction('ACKNOWLEDGE_ANNOUNCEMENT', { announcementId: 'ann-1' })
    const act3 = enqueueOfflineAction('SYNC_STREAK', { streak: 5 })

    const queue = getOfflineQueue()
    expect(queue.length).toBe(3)
    expect(queue[0].id).toBe(act1.id)
    expect(queue[1].id).toBe(act2.id)
    expect(queue[2].id).toBe(act3.id)
  })

  it('removes an action by id once processed', () => {
    const act1 = enqueueOfflineAction('RECORD_SESSION', { score: 80 })
    const act2 = enqueueOfflineAction('SYNC_STREAK', { streak: 5 })

    removeOfflineAction(act1.id)

    const queue = getOfflineQueue()
    expect(queue.length).toBe(1)
    expect(queue[0].id).toBe(act2.id)
  })

  it('increments retry count and removes action when default or custom max retries exceeded', () => {
    const act = enqueueOfflineAction('RECORD_SESSION', { score: 80 }, 5)

    // Retry with custom limit override of 2
    const retained1 = incrementActionRetry(act.id, 2)
    expect(retained1).toBe(true)
    let queue = getOfflineQueue()
    expect(queue[0].retryCount).toBe(1)

    // Second retry hits custom limit of 2, drops action
    const retained2 = incrementActionRetry(act.id, 2)
    expect(retained2).toBe(false)
    queue = getOfflineQueue()
    expect(queue.length).toBe(0)

    // Non-existent id returns false
    expect(incrementActionRetry('non-existent-id')).toBe(false)
  })

  it('clears all queued actions cleanly', () => {
    enqueueOfflineAction('RECORD_SESSION', { score: 80 })
    enqueueOfflineAction('SYNC_STREAK', { streak: 5 })
    expect(getOfflineQueue().length).toBe(2)

    clearOfflineQueue()
    expect(getOfflineQueue().length).toBe(0)
  })

  it('safely handles corrupted localStorage data', () => {
    localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, '{ invalid json corrupted string ...')
    const queue = getOfflineQueue()
    expect(queue).toEqual([])
  })

  it('dispatches OFFLINE_QUEUE_EVENT on queue mutations', () => {
    const listener = vi.fn()
    window.addEventListener(OFFLINE_QUEUE_EVENT, listener)

    enqueueOfflineAction('RECORD_SESSION', { score: 90 })
    expect(listener).toHaveBeenCalledTimes(1)

    clearOfflineQueue()
    expect(listener).toHaveBeenCalledTimes(2)

    window.removeEventListener(OFFLINE_QUEUE_EVENT, listener)
  })

  it('reports offline sync status accurately', () => {
    const statusBefore = getOfflineSyncStatus()
    expect(statusBefore.pendingCount).toBe(0)
    expect(statusBefore.isSyncing).toBe(false)

    enqueueOfflineAction('SYNC_STREAK', { streak: 3 })
    const statusAfter = getOfflineSyncStatus()
    expect(statusAfter.pendingCount).toBe(1)
    expect(typeof statusAfter.isOnline).toBe('boolean')
  })

  it('syncs offline queue using partial action handlers map', async () => {
    enqueueOfflineAction('RECORD_SESSION', { sessionId: 'sess-1' })
    enqueueOfflineAction('SYNC_STREAK', { streak: 7 })

    const recordHandler = vi.fn().mockResolvedValue({ success: true })
    const streakHandler = vi.fn().mockResolvedValue({ success: false, error: 'Network error' })

    const handlers: ActionHandlerMap = {
      RECORD_SESSION: recordHandler,
      SYNC_STREAK: streakHandler,
    }

    const result = await syncOfflineQueue(handlers)

    expect(result.total).toBe(2)
    expect(result.succeeded).toBe(1)
    expect(result.failed).toBe(1)

    expect(recordHandler).toHaveBeenCalledWith({ sessionId: 'sess-1' })
    expect(streakHandler).toHaveBeenCalledWith({ streak: 7 })

    const remainingQueue = getOfflineQueue()
    expect(remainingQueue.length).toBe(1)
    expect(remainingQueue[0].type).toBe('SYNC_STREAK')
    expect(remainingQueue[0].retryCount).toBe(1)
  })

  it('syncs offline queue using a single processor function and guards against concurrent runs', async () => {
    enqueueOfflineAction('RECORD_SESSION', { sessionId: 'sess-async' })

    let resolveFn: (val: { success: boolean }) => void
    const syncPromise = new Promise<{ success: boolean }>((resolve) => {
      resolveFn = resolve
    })

    const processor = vi.fn().mockImplementation(async () => {
      return await syncPromise
    })

    // Start first sync
    const firstSync = syncOfflineQueue(processor)

    // Immediate second sync should be blocked by concurrency lock
    const secondSync = await syncOfflineQueue(processor)
    expect(secondSync).toEqual({ total: 0, succeeded: 0, failed: 0 })

    // Resolve first sync
    resolveFn!({ success: true })
    const firstResult = await firstSync

    expect(firstResult.succeeded).toBe(1)
    expect(getOfflineQueue().length).toBe(0)

    const status = getOfflineSyncStatus()
    expect(status.isSyncing).toBe(false)
    expect(status.lastSyncTimestamp).toBeDefined()
  })
})
