// src/lib/preview.ts
import type { GameId, AnyGameSettings, PreviewPayload } from '@/types/config'

/**
 * Encodes a game's settings into a URL-safe base64 string for use as a query parameter.
 */
export function encodePreviewSettings(gameId: GameId, settings: AnyGameSettings): string {
  try {
    const payload: PreviewPayload = { gameId, settings }
    const json = JSON.stringify(payload)
    const utf8Bytes = new TextEncoder().encode(json)
    let binary = ''
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i])
    }
    const base64 = btoa(binary)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch (error) {
    console.error('[preview] Error encoding preview settings:', error)
    return ''
  }
}

/**
 * Decodes a URL-safe base64 string back into a PreviewPayload.
 * Never throws — returns null if decoding or parsing fails.
 */
export function decodePreviewSettings(encoded: string): PreviewPayload | null {
  if (!encoded || typeof encoded !== 'string') {
    return null
  }

  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4 !== 0) {
      base64 += '='
    }
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      typeof parsed.gameId === 'string' &&
      parsed.settings &&
      typeof parsed.settings === 'object' &&
      !Array.isArray(parsed.settings)
    ) {
      return {
        gameId: parsed.gameId as GameId,
        settings: parsed.settings as AnyGameSettings,
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Constructs the relative preview URL for a game with encoded preview settings query param.
 */
export function buildPreviewUrl(gameId: GameId, settings: AnyGameSettings): string {
  const encoded = encodePreviewSettings(gameId, settings)
  return `/games/${gameId}?preview=${encoded}`
}
