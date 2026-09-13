import { describe, it, expect } from 'vitest'
import type {
  AccentRegion,
  VoiceStyle,
  SpeechVoiceInfo,
  SpeechConfig,
  SpeechState,
  OfflineActionType,
  QueuedOfflineAction,
  OfflineSyncStatus,
  PWAInstallState,
} from '@/types/speech'
import {
  DEFAULT_SPEECH_CONFIG,
  ACCENT_LABELS,
  VOICE_STYLE_PRESETS,
} from '@/types/speech'

describe('Speech & Offline Domain Types & Defaults', () => {
  it('defines valid default speech config tailored for kids', () => {
    const config: SpeechConfig = DEFAULT_SPEECH_CONFIG

    expect(config.accent).toBe('US')
    expect(config.style).toBe('kid')
    expect(config.rate).toBeGreaterThanOrEqual(0.7)
    expect(config.rate).toBeLessThanOrEqual(0.85)
    expect(config.pitch).toBeGreaterThanOrEqual(1.0)
    expect(config.autoPronounceNewWords).toBe(true)
  })

  it('provides readable human labels for all 3 supported English accents', () => {
    const accents: AccentRegion[] = ['US', 'UK', 'AU']
    accents.forEach((accent) => {
      expect(ACCENT_LABELS[accent]).toBeDefined()
      expect(typeof ACCENT_LABELS[accent].name).toBe('string')
      expect(typeof ACCENT_LABELS[accent].flag).toBe('string')
      expect(typeof ACCENT_LABELS[accent].code).toBe('string')
    })

    expect(ACCENT_LABELS.US.code).toBe('en-US')
    expect(ACCENT_LABELS.UK.code).toBe('en-GB')
    expect(ACCENT_LABELS.AU.code).toBe('en-AU')
  })

  it('defines style presets with appropriate pitch and rate adjustments', () => {
    const styles: VoiceStyle[] = ['kid', 'natural', 'slow']
    styles.forEach((style) => {
      const preset = VOICE_STYLE_PRESETS[style]
      expect(preset).toBeDefined()
      expect(preset.pitch).toBeGreaterThan(0)
      expect(preset.rate).toBeGreaterThan(0)
      expect(typeof preset.description).toBe('string')
    })

    // Kid style should have playful elevated pitch
    expect(VOICE_STYLE_PRESETS.kid.pitch).toBeGreaterThan(1.0)
    // Slow style should have lowest speech rate
    expect(VOICE_STYLE_PRESETS.slow.rate).toBeLessThan(VOICE_STYLE_PRESETS.natural.rate)
  })

  it('supports instantiating valid QueuedOfflineAction and SpeechVoiceInfo', () => {
    const sampleVoice: SpeechVoiceInfo = {
      name: 'Google US English',
      lang: 'en-US',
      accent: 'US',
      isNeural: true,
      isDefault: true,
      voiceURI: 'Google US English',
    }

    const sampleAction: QueuedOfflineAction = {
      id: 'offline-act-1',
      type: 'RECORD_SESSION',
      payload: { gameId: 'flashcard', score: 100 },
      timestamp: '2026-09-13T12:00:00.000Z',
      retryCount: 0,
      maxRetries: 3,
    }

    const sampleSync: OfflineSyncStatus = {
      isOnline: true,
      pendingCount: 1,
      lastSyncTimestamp: null,
      isSyncing: false,
    }

    const sampleInstall: PWAInstallState = {
      canInstall: true,
      isInstalled: false,
      isIOS: false,
      dismissedUntil: null,
    }

    expect(sampleVoice.isNeural).toBe(true)
    expect(sampleAction.type).toBe('RECORD_SESSION')
    expect(sampleSync.isOnline).toBe(true)
    expect(sampleInstall.canInstall).toBe(true)
  })
})
