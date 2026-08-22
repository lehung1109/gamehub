'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { GameConfig } from '@/types/config'
import { getConfigByIdPublic } from '@/app/actions/configs'

interface UseGameConfigResult<T> {
  config: GameConfig<T> | null
  settings: T | null
  configName: string | null
  configId: string | null
  isLoading: boolean
}

export function useGameConfig<T = Record<string, unknown>>(
  expectedGameId: string
): UseGameConfigResult<T> {
  const searchParams = useSearchParams()
  let configId = searchParams?.get('config') || null

  if (!configId && typeof window !== 'undefined' && window.location?.search) {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      configId = urlParams.get('config') || null
    } catch {
      // ignore
    }
  }

  const [state, setState] = useState<{
    id: string | null
    config: GameConfig<T> | null
  }>({
    id: null,
    config: null,
  })

  useEffect(() => {
    if (!configId) {
      return
    }

    let isMounted = true

    getConfigByIdPublic(configId)
      .then((res) => {
        if (!isMounted) return
        if (res.data && res.data.game_id === expectedGameId) {
          setState({ id: configId, config: res.data as unknown as GameConfig<T> })
        } else {
          setState({ id: configId, config: null })
        }
      })
      .catch((err) => {
        console.error('[useGameConfig] Error fetching config:', err)
        if (isMounted) setState({ id: configId, config: null })
      })

    return () => {
      isMounted = false
    }
  }, [configId, expectedGameId])

  const isLoadedForCurrentId = state.id === configId
  const config = configId && isLoadedForCurrentId ? state.config : null
  const isLoading = Boolean(configId) && !isLoadedForCurrentId

  return {
    config,
    settings: (config?.settings as T) || null,
    configName: config?.name || null,
    configId,
    isLoading,
  }
}
