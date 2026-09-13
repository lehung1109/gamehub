// src/lib/speech/tts-engine.ts

import type { AccentRegion, SpeechConfig, SpeechVoiceInfo } from '@/types/speech'
import { ACCENT_LABELS, VOICE_STYLE_PRESETS } from '@/types/speech'

const NEURAL_VOICE_REGEX =
  /(natural|neural|google|online|samantha|daniel|karen|oliver|aria|guy|jenny|serena|steffi)/i

/**
 * Detects whether a SpeechSynthesisVoice is likely a high-quality neural / online voice
 */
export function isNeuralVoice(voice: SpeechSynthesisVoice): boolean {
  if (voice.localService === false) return true
  return NEURAL_VOICE_REGEX.test(voice.name)
}

/**
 * Maps a language tag (e.g. 'en-US', 'en-GB', 'en-AU') to an AccentRegion
 */
export function detectAccentRegion(lang: string): AccentRegion | null {
  const normalized = lang.replace('_', '-').toLowerCase()
  if (normalized.startsWith('en-gb') || normalized === 'en-uk') {
    return 'UK'
  }
  if (normalized.startsWith('en-au')) {
    return 'AU'
  }
  if (normalized.startsWith('en')) {
    return 'US'
  }
  return null
}

/**
 * Filters raw browser SpeechSynthesisVoices to English dialects and ranks them
 * by neural quality and default status.
 */
export function filterAndRankVoices(rawVoices: SpeechSynthesisVoice[]): SpeechVoiceInfo[] {
  const englishVoices: SpeechVoiceInfo[] = []

  for (const voice of rawVoices) {
    const accent = detectAccentRegion(voice.lang)
    if (!accent) continue

    englishVoices.push({
      name: voice.name,
      lang: voice.lang,
      accent,
      isNeural: isNeuralVoice(voice),
      isDefault: Boolean(voice.default),
      voiceURI: voice.voiceURI || voice.name,
    })
  }

  // Rank voices: Neural first, then default, then alphabetical by name
  return englishVoices.sort((a, b) => {
    if (a.isNeural !== b.isNeural) {
      return a.isNeural ? -1 : 1
    }
    if (a.isDefault !== b.isDefault) {
      return a.isDefault ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

/**
 * Finds the optimal voice matching the target accent region and optional user preference.
 */
export function getBestVoiceForAccent(
  voices: SpeechVoiceInfo[],
  accent: AccentRegion,
  preferredVoiceName?: string
): SpeechVoiceInfo | null {
  if (!voices || voices.length === 0) return null

  // 1. Exact match with preferredVoiceName in the requested accent
  if (preferredVoiceName) {
    const preferredMatch = voices.find(
      (v) => v.accent === accent && v.name === preferredVoiceName
    )
    if (preferredMatch) return preferredMatch
  }

  // 2. Best ranked voice in the requested accent
  const accentMatches = voices.filter((v) => v.accent === accent)
  if (accentMatches.length > 0) {
    return accentMatches[0]
  }

  // 3. Fallback: Any available English voice
  return voices[0]
}

/**
 * Calculates effective speech rate and pitch combining user preferences and style presets.
 */
export function calculateEffectiveSpeechParams(config: SpeechConfig): {
  rate: number
  pitch: number
} {
  const preset = VOICE_STYLE_PRESETS[config.style] || VOICE_STYLE_PRESETS.kid

  const rawRate = typeof config.rate === 'number' ? config.rate : preset.rate
  const rawPitch = typeof config.pitch === 'number' ? config.pitch : preset.pitch

  // Clamp within safe pedagogical boundaries
  const rate = Math.min(1.5, Math.max(0.5, rawRate))
  const pitch = Math.min(1.4, Math.max(0.8, rawPitch))

  return { rate, pitch }
}

/**
 * Builds the complete configuration payload for SpeechSynthesisUtterance.
 */
export function generateSpeechUtteranceConfig(
  text: string,
  voice: SpeechVoiceInfo | null,
  config: SpeechConfig
): {
  text: string
  lang: string
  rate: number
  pitch: number
  voiceName?: string
} {
  const { rate, pitch } = calculateEffectiveSpeechParams(config)
  const defaultLang = ACCENT_LABELS[config.accent]?.code || 'en-US'
  const lang = voice?.lang || defaultLang

  return {
    text,
    lang,
    rate,
    pitch,
    voiceName: voice?.name,
  }
}

/**
 * Safe feature detection for Web Audio API
 */
export function isAudioContextSupported(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
}

/**
 * Plays a pleasant synthetic acoustic chime fallback when speech synthesis is unavailable.
 */
export async function playAudioToneFallback(
  frequency = 440,
  durationMs = 200
): Promise<void> {
  if (!isAudioContextSupported()) return

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)

    // Smooth envelope attack and release
    gain.gain.setValueAtTime(0.01, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + durationMs / 1000)

    setTimeout(() => {
      ctx.close().catch(() => {})
    }, durationMs + 100)
  } catch (e) {
    // Non-fatal fallback
    console.debug('[playAudioToneFallback] Ignored error:', e)
  }
}
