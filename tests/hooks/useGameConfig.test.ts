import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGameConfig } from '@/hooks/useGameConfig'
import { encodePreviewSettings } from '@/lib/preview'
import * as configActions from '@/app/actions/configs'
import type { FlashcardSettings } from '@/types/config'

let mockSearchParams: URLSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

describe('useGameConfig hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
  })

  describe('Preview Mode', () => {
    it('detects preview param, decodes settings, sets isPreview=true, and skips database fetch', async () => {
      const flashcardSettings: FlashcardSettings = {
        topics: ['animals', 'fruits'],
        wordLimit: 8,
        autoSpeak: true,
      }
      const encoded = encodePreviewSettings('flashcard', flashcardSettings)
      mockSearchParams.set('preview', encoded)

      const spyGetConfig = vi.spyOn(configActions, 'getConfigByIdPublic')

      const { result } = renderHook(() => useGameConfig<FlashcardSettings>('flashcard'))

      expect(result.current.isPreview).toBe(true)
      expect(result.current.settings).toEqual(flashcardSettings)
      expect(result.current.config).toBeNull()
      expect(result.current.configName).toBeNull()
      expect(result.current.configId).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(spyGetConfig).not.toHaveBeenCalled()
    })

    it('rejects preview when decoded gameId does not match expectedGameId', () => {
      const flashcardSettings: FlashcardSettings = {
        topics: ['animals'],
        wordLimit: 5,
        autoSpeak: false,
      }
      // Encoded for flashcard, but hook rendered for alphabet
      const encoded = encodePreviewSettings('flashcard', flashcardSettings)
      mockSearchParams.set('preview', encoded)

      const spyGetConfig = vi.spyOn(configActions, 'getConfigByIdPublic')

      const { result } = renderHook(() => useGameConfig('alphabet'))

      expect(result.current.isPreview).toBe(false)
      expect(result.current.settings).toBeNull()
      expect(result.current.config).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(spyGetConfig).not.toHaveBeenCalled()
    })

    it('rejects invalid/corrupt preview query param', () => {
      mockSearchParams.set('preview', 'invalid-corrupt-data')

      const spyGetConfig = vi.spyOn(configActions, 'getConfigByIdPublic')

      const { result } = renderHook(() => useGameConfig('flashcard'))

      expect(result.current.isPreview).toBe(false)
      expect(result.current.settings).toBeNull()
      expect(result.current.config).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(spyGetConfig).not.toHaveBeenCalled()
    })

    it('prioritizes preview over config param when both are present', () => {
      const flashcardSettings: FlashcardSettings = {
        topics: ['fruits'],
        wordLimit: 4,
        autoSpeak: false,
      }
      const encoded = encodePreviewSettings('flashcard', flashcardSettings)
      mockSearchParams.set('preview', encoded)
      mockSearchParams.set('config', 'existing-config-id')

      const spyGetConfig = vi.spyOn(configActions, 'getConfigByIdPublic')

      const { result } = renderHook(() => useGameConfig<FlashcardSettings>('flashcard'))

      expect(result.current.isPreview).toBe(true)
      expect(result.current.settings).toEqual(flashcardSettings)
      expect(spyGetConfig).not.toHaveBeenCalled()
    })
  })

  describe('Standard Config Mode', () => {
    it('fetches config from database when only config param is present', async () => {
      mockSearchParams.set('config', 'cfg-123')

      const mockDbConfig = {
        id: 'cfg-123',
        user_id: 'user-1',
        game_id: 'flashcard',
        name: 'Flashcard Lớp 1',
        settings: { topics: ['animals'], wordLimit: 5, autoSpeak: true },
        share_slug: 'fc-slug',
        is_active: true,
        created_at: '2026-08-22T00:00:00Z',
        updated_at: '2026-08-22T00:00:00Z',
      }

      vi.spyOn(configActions, 'getConfigByIdPublic').mockResolvedValueOnce({
        data: mockDbConfig,
      })

      const { result } = renderHook(() => useGameConfig<FlashcardSettings>('flashcard'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isPreview).toBe(false)
        expect(result.current.configId).toBe('cfg-123')
        expect(result.current.configName).toBe('Flashcard Lớp 1')
        expect(result.current.settings).toEqual({ topics: ['animals'], wordLimit: 5, autoSpeak: true })
        expect(result.current.config).toEqual(mockDbConfig)
      })
    })

    it('returns nulls and isPreview=false when no params are provided', () => {
      const { result } = renderHook(() => useGameConfig('flashcard'))

      expect(result.current.isPreview).toBe(false)
      expect(result.current.config).toBeNull()
      expect(result.current.settings).toBeNull()
      expect(result.current.configName).toBeNull()
      expect(result.current.configId).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })
  })
})
