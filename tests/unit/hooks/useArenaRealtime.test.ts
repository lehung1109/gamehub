import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useArenaRealtime } from '@/hooks/useArenaRealtime'
import type { ArenaRealtimeEvent } from '@/types/arena'

// Mock createClient from @/lib/supabase/client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  send: vi.fn(),
}

const mockSupabase = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

describe('useArenaRealtime Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('subscribes to channel arena:{pinCode} and reports connected state', async () => {
    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      callback('SUBSCRIBED')
      return mockChannel
    })

    const onEvent = vi.fn()
    const { result } = renderHook(() =>
      useArenaRealtime({
        pinCode: '123456',
        onEvent,
      })
    )

    expect(mockSupabase.channel).toHaveBeenCalledWith('arena:123456')
    expect(result.current.isConnected).toBe(true)
    expect(result.current.isFallback).toBe(false)
  })

  it('dispatches incoming broadcast events to onEvent callback', () => {
    let broadcastHandler: ((payload: { payload: ArenaRealtimeEvent }) => void) | null = null

    mockChannel.on.mockImplementation(
      (type: string, filter: { event: string }, handler: (data: { payload: ArenaRealtimeEvent }) => void) => {
        if (filter.event === 'arena-event') {
          broadcastHandler = handler
        }
        return mockChannel
      }
    )

    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      callback('SUBSCRIBED')
      return mockChannel
    })

    const onEvent = vi.fn()
    renderHook(() =>
      useArenaRealtime({
        pinCode: '654321',
        onEvent,
      })
    )

    expect(broadcastHandler).not.toBeNull()

    const sampleEvent: ArenaRealtimeEvent = {
      type: 'ROUND_START',
      questionIndex: 1,
      question: {
        id: 'q2',
        question: 'What is water?',
        options: ['Liquid', 'Solid'],
        correctAnswer: 'Liquid',
        timeLimitSeconds: 15,
        points: 1000,
      },
      timeLimitSeconds: 15,
    }

    act(() => {
      broadcastHandler?.({ payload: sampleEvent })
    })

    expect(onEvent).toHaveBeenCalledWith(sampleEvent)
  })

  it('broadcasts event using channel.send', async () => {
    mockChannel.send.mockResolvedValue({ status: 'ok' })
    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      callback('SUBSCRIBED')
      return mockChannel
    })

    const { result } = renderHook(() =>
      useArenaRealtime({
        pinCode: '111222',
      })
    )

    const eventToBroadcast: ArenaRealtimeEvent = {
      type: 'ANSWER_SUBMITTED',
      questionIndex: 0,
      studentName: 'Alice',
      optionIndex: 2,
    }

    let success = false
    await act(async () => {
      success = await result.current.broadcastEvent(eventToBroadcast)
    })

    expect(success).toBe(true)
    expect(mockChannel.send).toHaveBeenCalledWith({
      type: 'broadcast',
      event: 'arena-event',
      payload: eventToBroadcast,
    })
  })

  it('activates fallback polling when channel encounters an error', async () => {
    mockChannel.subscribe.mockImplementation((callback: (status: string) => void) => {
      callback('CHANNEL_ERROR')
      return mockChannel
    })

    const onFallbackPoll = vi.fn()
    const { result } = renderHook(() =>
      useArenaRealtime({
        pinCode: '999000',
        onFallbackPoll,
        pollingIntervalMs: 2000,
      })
    )

    expect(result.current.isConnected).toBe(false)
    expect(result.current.isFallback).toBe(true)

    // Verify polling interval triggers
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onFallbackPoll).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onFallbackPoll).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes and cleans up channel on unmount', () => {
    const { unmount } = renderHook(() =>
      useArenaRealtime({
        pinCode: '333444',
      })
    )

    unmount()
    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel)
  })
})
