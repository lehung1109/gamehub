'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { GameConfig, UseGameConfigResult } from '@/types/config'
import { getConfigByIdPublic } from '@/app/actions/configs'
import { decodePreviewSettings } from '@/lib/preview'

export function useGameConfig<T = Record<string, unknown>>(
  expectedGameId: string
): UseGameConfigResult<T> {
  const searchParams = useSearchParams()
  let previewParam = searchParams?.get('preview') || null
  let configId = searchParams?.get('config') || null

  if (!previewParam && !configId && typeof window !== 'undefined' && window.location?.search) {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      previewParam = urlParams.get('preview') || null
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
    // If preview param is present, preview mode takes precedence and skips database fetch
    if (previewParam || !configId) {
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
  }, [previewParam, configId, expectedGameId])

  // Handle preview mode
  if (previewParam) {
    const decoded = decodePreviewSettings(previewParam)
    if (decoded && decoded.gameId === expectedGameId) {
      return {
        config: null,
        settings: decoded.settings as unknown as T,
        configName: null,
        configId: null,
        isLoading: false,
        isPreview: true,
      }
    }
    return {
      config: null,
      settings: null,
      configName: null,
      configId: null,
      isLoading: false,
      isPreview: false,
    }
  }

  const isLoadedForCurrentId = state.id === configId
  const config = configId && isLoadedForCurrentId ? state.config : null
  const isLoading = Boolean(configId) && !isLoadedForCurrentId

  return {
    config,
    settings: (config?.settings as T) || null,
    configName: config?.name || null,
    configId,
    isLoading,
    isPreview: false,
  }
}
