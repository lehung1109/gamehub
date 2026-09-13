'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { isSpeechSupported } from '@/lib/speech-check'
import type {
  AccentRegion,
  VoiceStyle,
  SpeechConfig,
  SpeechVoiceInfo,
} from '@/types/speech'
import {
  DEFAULT_SPEECH_CONFIG,
  SPEECH_CONFIG_STORAGE_KEY,
} from '@/types/speech'
import {
  filterAndRankVoices,
  getBestVoiceForAccent,
  calculateEffectiveSpeechParams,
  playAudioToneFallback,
} from '@/lib/speech/tts-engine'

export interface UseSpeechOptions {
  rate?: number
  pitch?: number
  lang?: string
}

function loadStoredSpeechConfig(): SpeechConfig {
  if (typeof window === 'undefined') return DEFAULT_SPEECH_CONFIG
  try {
    const raw = localStorage.getItem(SPEECH_CONFIG_STORAGE_KEY)
    if (!raw) return DEFAULT_SPEECH_CONFIG
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SPEECH_CONFIG,
      ...parsed,
      // Handle alias migration if style / voiceStyle was stored
      style: parsed.style || parsed.voiceStyle || DEFAULT_SPEECH_CONFIG.style,
      rate: parsed.rate ?? parsed.speedRate ?? DEFAULT_SPEECH_CONFIG.rate,
    }
  } catch {
    return DEFAULT_SPEECH_CONFIG
  }
}

function persistSpeechConfig(config: SpeechConfig): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SPEECH_CONFIG_STORAGE_KEY, JSON.stringify(config))
    window.dispatchEvent(
      new CustomEvent('gamehub_speech_config_updated', { detail: config })
    )
  } catch (e) {
    console.error('[useSpeech] Failed to persist speech config:', e)
  }
}

const emptySubscribe = () => () => {}

export function useSpeech(options: UseSpeechOptions = {}) {
  const { rate: overrideRate, pitch: overridePitch, lang: overrideLang } = options

  const [config, setConfig] = useState<SpeechConfig>(loadStoredSpeechConfig)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechVoiceInfo[]>([])
  const nativeVoicesRef = useRef<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isMountedRef = useRef(true)

  // Subscribe to client browser support safely without cascading setState
  const isSupported = useSyncExternalStore(
    emptySubscribe,
    () => isSpeechSupported(),
    () => false
  )

  // Discover and rank browser synthesis voices
  const populateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    const rawVoices = window.speechSynthesis.getVoices()
    if (rawVoices && rawVoices.length > 0) {
      nativeVoicesRef.current = rawVoices
      const ranked = filterAndRankVoices(rawVoices)
      setAvailableVoices(ranked)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    populateVoices()

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices
    }

    const handleConfigEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SpeechConfig>
      if (customEvent.detail) {
        setConfig(customEvent.detail)
      }
    }

    window.addEventListener('gamehub_speech_config_updated', handleConfigEvent)

    return () => {
      isMountedRef.current = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('gamehub_speech_config_updated', handleConfigEvent)
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null
          window.speechSynthesis.cancel()
        }
      }
      if (utteranceRef.current) {
        utteranceRef.current.onstart = null
        utteranceRef.current.onend = null
        utteranceRef.current.onerror = null
      }
    }
  }, [populateVoices])

  const updateConfig = useCallback(
    (patch: Partial<SpeechConfig> & { voiceStyle?: VoiceStyle; speedRate?: number }) => {
      setConfig((prev) => {
        const next: SpeechConfig = {
          ...prev,
          ...patch,
          style: patch.style || patch.voiceStyle || prev.style,
          rate: patch.rate ?? patch.speedRate ?? prev.rate,
        }
        persistSpeechConfig(next)
        return next
      })
    },
    []
  )

  const setAccent = useCallback(
    (accent: AccentRegion) => {
      updateConfig({ accent })
    },
    [updateConfig]
  )

  const setVoiceStyle = useCallback(
    (voiceStyle: VoiceStyle) => {
      updateConfig({ style: voiceStyle })
    },
    [updateConfig]
  )

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (isMountedRef.current) {
      setIsSpeaking(false)
    }
  }, [])

  // Find best voice according to current accent selection
  const activeVoice = getBestVoiceForAccent(availableVoices, config.accent)

  const speak = useCallback(
    (text: string, customLang?: string) => {
      if (!isSpeechSupported() || typeof window === 'undefined' || !window.speechSynthesis) {
        // Fallback tone for accessibility when TTS engine is unavailable
        playAudioToneFallback(440, 200)
        return
      }

      // Cancel ongoing speech to avoid overlapping audio
      window.speechSynthesis.cancel()

      const effectiveParams = calculateEffectiveSpeechParams({
        ...config,
        rate: overrideRate ?? config.rate,
      })

      const utterance = new SpeechSynthesisUtterance(text)

      // Bind native SpeechSynthesisVoice if available
      if (activeVoice && nativeVoicesRef.current.length > 0) {
        const matched = nativeVoicesRef.current.find((v) => v.voiceURI === activeVoice.voiceURI)
        if (matched) {
          utterance.voice = matched
        }
      }

      utterance.lang = customLang || (activeVoice?.lang ?? overrideLang ?? 'en-US')
      utterance.rate = effectiveParams.rate
      utterance.pitch = overridePitch ?? effectiveParams.pitch

      utterance.onstart = () => {
        if (isMountedRef.current && utteranceRef.current === utterance) {
          setIsSpeaking(true)
        }
      }

      utterance.onend = () => {
        if (isMountedRef.current && utteranceRef.current === utterance) {
          setIsSpeaking(false)
        }
      }

      utterance.onerror = () => {
        if (isMountedRef.current && utteranceRef.current === utterance) {
          setIsSpeaking(false)
        }
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [config, activeVoice, overrideRate, overridePitch, overrideLang]
  )

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
    config: {
      ...config,
      // Alias getters for backward and forward compatibility
      voiceStyle: config.style,
      speedRate: config.rate,
    },
    updateConfig,
    availableVoices,
    activeVoice,
    accent: config.accent,
    setAccent,
    voiceStyle: config.style,
    setVoiceStyle,
  }
}
