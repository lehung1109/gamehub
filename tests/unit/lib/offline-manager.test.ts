import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  enqueueOfflineAction,
  getOfflineQueue,
  clearOfflineQueue,
  removeOfflineAction,
  incrementActionRetry,
  syncOfflineQueue,
  OFFLINE_QUEUE_STORAGE_KEY,
} from '@/lib/offline/offline-manager'
import type { OfflineActionType, QueuedOfflineAction } from '@/types/speech'

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

  it('increments retry count and removes action when max retries exceeded', () => {
    const act = enqueueOfflineAction('RECORD_SESSION', { score: 80 }, 2)

    // Retry 1: still retained
    const retained1 = incrementActionRetry(act.id)
    expect(retained1).toBe(true)
    let queue = getOfflineQueue()
    expect(queue[0].retryCount).toBe(1)

    // Retry 2: max reached, should be dropped to prevent poison pill loops
    const retained2 = incrementActionRetry(act.id)
    expect(retained2).toBe(false)
    queue = getOfflineQueue()
    expect(queue.length).toBe(0)
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

  it('syncs offline queue using provided action handlers and removes successful actions', async () => {
    enqueueOfflineAction('RECORD_SESSION', { sessionId: 'sess-1' })
    enqueueOfflineAction('SYNC_STREAK', { streak: 7 })

    const recordHandler = vi.fn().mockResolvedValue({ success: true })
    const streakHandler = vi.fn().mockResolvedValue({ success: false, error: 'Network error' })

    const handlers: Record<
      OfflineActionType,
      (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>
    > = {
      RECORD_SESSION: recordHandler,
      SYNC_STREAK: streakHandler,
      ACKNOWLEDGE_ANNOUNCEMENT: vi.fn().mockResolvedValue({ success: true }),
      ADD_MISTAKE: vi.fn().mockResolvedValue({ success: true }),
    }

    const result = await syncOfflineQueue(handlers)

    expect(result.total).toBe(2)
    expect(result.succeeded).toBe(1)
    expect(result.failed).toBe(1)

    expect(recordHandler).toHaveBeenCalledWith({ sessionId: 'sess-1' })
    expect(streakHandler).toHaveBeenCalledWith({ streak: 7 })

    // Successfully processed item should be removed, failing item retained with incremented retry
    const remainingQueue = getOfflineQueue()
    expect(remainingQueue.length).toBe(1)
    expect(remainingQueue[0].type).toBe('SYNC_STREAK')
    expect(remainingQueue[0].retryCount).toBe(1)
  })
})
