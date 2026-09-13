// src/hooks/useArenaRealtime.ts

'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ArenaRealtimeEvent } from '@/types/arena'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface UseArenaRealtimeOptions {
  pinCode: string
  arenaId?: string
  onEvent?: (event: ArenaRealtimeEvent) => void
  onFallbackPoll?: () => Promise<void> | void
  pollingIntervalMs?: number
  enabled?: boolean
}

export interface UseArenaRealtimeResult {
  isConnected: boolean
  isFallback: boolean
  channelStatus: string
  broadcastEvent: (event: ArenaRealtimeEvent) => Promise<boolean>
}

export function useArenaRealtime({
  pinCode,
  onEvent,
  onFallbackPoll,
  pollingIntervalMs = 2500,
  enabled = true,
}: UseArenaRealtimeOptions): UseArenaRealtimeResult {
  const [isConnected, setIsConnected] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const [channelStatus, setChannelStatus] = useState<string>('DISCONNECTED')

  const channelRef = useRef<RealtimeChannel | null>(null)
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  const onFallbackPollRef = useRef(onFallbackPoll)
  onFallbackPollRef.current = onFallbackPoll

  // Broadcast event helper
  const broadcastEvent = useCallback(async (event: ArenaRealtimeEvent): Promise<boolean> => {
    if (!channelRef.current) return false

    try {
      const res = await channelRef.current.send({
        type: 'broadcast',
        event: 'arena-event',
        payload: event,
      })
      return res === 'ok' || (typeof res === 'object' && res !== null && 'status' in res && (res as { status: string }).status === 'ok')
    } catch (err) {
      console.error('[useArenaRealtime] Broadcast failed:', err)
      return false
    }
  }, [])

  // 1. Supabase Realtime Channel Subscription
  useEffect(() => {
    if (!enabled || !pinCode || !pinCode.trim()) {
      return
    }

    const supabase = createClient()
    const channelName = `arena:${pinCode.trim()}`
    const channel = supabase.channel(channelName)
    channelRef.current = channel

    channel
      .on(
        'broadcast',
        { event: 'arena-event' },
        (response: { payload: ArenaRealtimeEvent }) => {
          if (response?.payload) {
            onEventRef.current?.(response.payload)
          }
        }
      )
      .subscribe((status) => {
        setChannelStatus(status)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setIsFallback(false)
        } else if (
          status === 'CHANNEL_ERROR' ||
          status === 'TIMED_OUT' ||
          status === 'CLOSED'
        ) {
          setIsConnected(false)
          setIsFallback(true)
        }
      })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [enabled, pinCode])

  // 2. Resilient Polling Fallback (runs when fallback is active or always as sync guarantee)
  useEffect(() => {
    if (!enabled) return

    // Run fallback polling when isFallback is active or if fallback callback is provided
    let timer: ReturnType<typeof setInterval> | null = null

    if (isFallback && onFallbackPollRef.current) {
      timer = setInterval(() => {
        onFallbackPollRef.current?.()
      }, pollingIntervalMs)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [enabled, isFallback, pollingIntervalMs])

  return {
    isConnected,
    isFallback,
    channelStatus,
    broadcastEvent,
  }
}
