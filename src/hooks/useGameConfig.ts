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

  const [config, setConfig] = useState<GameConfig<T> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(configId))

  useEffect(() => {
    if (!configId) {
      setConfig(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    getConfigByIdPublic(configId)
      .then((res) => {
        if (!isMounted) return
        if (res.data && res.data.game_id === expectedGameId) {
          setConfig(res.data as unknown as GameConfig<T>)
        } else {
          setConfig(null)
        }
      })
      .catch((err) => {
        console.error('[useGameConfig] Error fetching config:', err)
        if (isMounted) setConfig(null)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [configId, expectedGameId])

  return {
    config,
    settings: (config?.settings as T) || null,
    configName: config?.name || null,
    configId,
    isLoading,
  }
}
