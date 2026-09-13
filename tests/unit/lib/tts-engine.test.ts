import { describe, it, expect } from 'vitest'
import {
  filterAndRankVoices,
  getBestVoiceForAccent,
  calculateEffectiveSpeechParams,
  generateSpeechUtteranceConfig,
  isAudioContextSupported,
} from '@/lib/speech/tts-engine'
import type { SpeechConfig, SpeechVoiceInfo } from '@/types/speech'

// Mock SpeechSynthesisVoice objects
function createMockVoice(
  name: string,
  lang: string,
  isDefault = false,
  localService = true
): SpeechSynthesisVoice {
  return {
    name,
    lang,
    default: isDefault,
    localService,
    voiceURI: name,
  } as SpeechSynthesisVoice
}

describe('Multi-Accent Neural TTS Engine', () => {
  const mockVoicesList: SpeechSynthesisVoice[] = [
    createMockVoice('Microsoft David Desktop - English (United States)', 'en-US', true),
    createMockVoice('Google US English', 'en-US', false, false), // Neural/Online
    createMockVoice('Microsoft Zira Desktop - English (United States)', 'en-US', false),
    createMockVoice('Google UK English Female', 'en-GB', false, false), // Neural/Online
    createMockVoice('Microsoft George - English (United Kingdom)', 'en-GB', false),
    createMockVoice('Google Australian English', 'en-AU', false, false), // Neural/Online
    createMockVoice('Microsoft Catherine - English (Australia)', 'en-AU', false),
    createMockVoice('Microsoft Heami - Korean', 'ko-KR', false), // Non-English, should be filtered out
    createMockVoice('Microsoft Haruka - Japanese', 'ja-JP', false), // Non-English, should be filtered out
  ]

  describe('filterAndRankVoices', () => {
    it('filters non-English voices and detects correct accent regions', () => {
      const ranked = filterAndRankVoices(mockVoicesList)

      // Only English voices should remain (7 out of 9)
      expect(ranked.length).toBe(7)

      // Checks accent mappings
      const usVoices = ranked.filter((v) => v.accent === 'US')
      const ukVoices = ranked.filter((v) => v.accent === 'UK')
      const auVoices = ranked.filter((v) => v.accent === 'AU')

      expect(usVoices.length).toBe(3)
      expect(ukVoices.length).toBe(2)
      expect(auVoices.length).toBe(2)
    })

    it('ranks Neural/Online voices higher than local synthetic voices', () => {
      const ranked = filterAndRankVoices(mockVoicesList)
      const usVoices = ranked.filter((v) => v.accent === 'US')

      // Google US English (neural) should be first
      expect(usVoices[0].name).toBe('Google US English')
      expect(usVoices[0].isNeural).toBe(true)
    })
  })

  describe('getBestVoiceForAccent', () => {
    it('selects the top neural voice for the requested accent', () => {
      const ranked = filterAndRankVoices(mockVoicesList)

      const bestUS = getBestVoiceForAccent(ranked, 'US')
      expect(bestUS?.name).toBe('Google US English')
      expect(bestUS?.accent).toBe('US')

      const bestUK = getBestVoiceForAccent(ranked, 'UK')
      expect(bestUK?.name).toBe('Google UK English Female')
      expect(bestUK?.accent).toBe('UK')

      const bestAU = getBestVoiceForAccent(ranked, 'AU')
      expect(bestAU?.name).toBe('Google Australian English')
      expect(bestAU?.accent).toBe('AU')
    })

    it('honors preferred voice name if available in the selected accent', () => {
      const ranked = filterAndRankVoices(mockVoicesList)

      const preferred = getBestVoiceForAccent(
        ranked,
        'US',
        'Microsoft Zira Desktop - English (United States)'
      )
      expect(preferred?.name).toBe('Microsoft Zira Desktop - English (United States)')
    })

    it('gracefully falls back to any available English voice if the accent has no matches', () => {
      const onlyUSVoices = filterAndRankVoices([
        createMockVoice('Microsoft David', 'en-US', true),
      ])

      // Requesting AU accent when only US voices are installed
      const fallback = getBestVoiceForAccent(onlyUSVoices, 'AU')
      expect(fallback).not.toBeNull()
      expect(fallback?.name).toBe('Microsoft David')
    })

    it('returns null if no voices are provided', () => {
      const result = getBestVoiceForAccent([], 'US')
      expect(result).toBeNull()
    })
  })

  describe('calculateEffectiveSpeechParams', () => {
    it('applies kid style pitch boost and safe speech rates', () => {
      const kidConfig: SpeechConfig = {
        accent: 'US',
        style: 'kid',
        rate: 0.8,
        pitch: 1.15,
        autoPronounceNewWords: true,
      }

      const params = calculateEffectiveSpeechParams(kidConfig)
      expect(params.pitch).toBe(1.15)
      expect(params.rate).toBe(0.8)
    })

    it('clamps extreme rates and pitches to comfortable pedagogical boundaries', () => {
      const extremeConfig: SpeechConfig = {
        accent: 'US',
        style: 'natural',
        rate: 3.5, // Too fast
        pitch: 0.1, // Too low
        autoPronounceNewWords: true,
      }

      const params = calculateEffectiveSpeechParams(extremeConfig)
      expect(params.rate).toBeLessThanOrEqual(1.5)
      expect(params.pitch).toBeGreaterThanOrEqual(0.8)
    })
  })

  describe('generateSpeechUtteranceConfig', () => {
    it('builds complete utterance parameters including lang code and voice info', () => {
      const voice: SpeechVoiceInfo = {
        name: 'Google UK English Female',
        lang: 'en-GB',
        accent: 'UK',
        isNeural: true,
        isDefault: false,
        voiceURI: 'Google UK English Female',
      }

      const config: SpeechConfig = {
        accent: 'UK',
        style: 'natural',
        rate: 0.85,
        pitch: 1.0,
        autoPronounceNewWords: true,
      }

      const utteranceParams = generateSpeechUtteranceConfig('Elephant', voice, config)

      expect(utteranceParams.text).toBe('Elephant')
      expect(utteranceParams.lang).toBe('en-GB')
      expect(utteranceParams.rate).toBe(0.85)
      expect(utteranceParams.pitch).toBe(1.0)
      expect(utteranceParams.voiceName).toBe('Google UK English Female')
    })
  })

  describe('Audio Context Fallback', () => {
    it('reports AudioContext availability safely without throwing', () => {
      const supported = isAudioContextSupported()
      expect(typeof supported).toBe('boolean')
    })
  })
})
