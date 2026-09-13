// src/types/speech.ts

export type AccentRegion = 'US' | 'UK' | 'AU'

export type VoiceStyle = 'kid' | 'natural' | 'slow'

export interface AccentInfo {
  code: string
  name: string
  flag: string
  description: string
}

export const ACCENT_LABELS: Record<AccentRegion, AccentInfo> = {
  US: {
    code: 'en-US',
    name: 'Anh - Mỹ (US English)',
    flag: '🇺🇸',
    description: 'Giọng chuẩn phổ biến, ngữ điệu rõ ràng, tự nhiên',
  },
  UK: {
    code: 'en-GB',
    name: 'Anh - Anh (UK English)',
    flag: '🇬🇧',
    description: 'Giọng chuẩn phát âm hoàng gia (RP), âm điệu trang trọng',
  },
  AU: {
    code: 'en-AU',
    name: 'Anh - Úc (Australian English)',
    flag: '🇦🇺',
    description: 'Giọng thân thiện, âm vang đặc trưng châu Đại Dương',
  },
}

export interface VoiceStylePreset {
  pitch: number
  rate: number
  label: string
  description: string
}

export const VOICE_STYLE_PRESETS: Record<VoiceStyle, VoiceStylePreset> = {
  kid: {
    pitch: 1.15,
    rate: 0.8,
    label: 'Giọng Thiếu Nhi (Kid-Friendly)',
    description: 'Cao độ trong trẻo, vui tươi, tốc độ vừa phải cho bé',
  },
  natural: {
    pitch: 1.0,
    rate: 0.85,
    label: 'Tự Nhiên (Natural Native)',
    description: 'Ngữ điệu chuẩn bản xứ, phát âm tròn vành rõ chữ',
  },
  slow: {
    pitch: 1.0,
    rate: 0.65,
    label: 'Chậm Rãi (Slow Paced)',
    description: 'Phát âm chậm, ngắt nhịp rõ cho người mới bắt đầu',
  },
}

export interface SpeechVoiceInfo {
  name: string
  lang: string
  accent: AccentRegion
  isNeural: boolean
  isDefault: boolean
  voiceURI: string
}

export interface SpeechConfig {
  accent: AccentRegion
  style: VoiceStyle
  rate: number
  pitch: number
  preferredVoiceName?: string
  autoPronounceNewWords: boolean
}

export const DEFAULT_SPEECH_CONFIG: SpeechConfig = {
  accent: 'US',
  style: 'kid',
  rate: 0.8,
  pitch: 1.15,
  autoPronounceNewWords: true,
}

export interface SpeechState {
  isSpeaking: boolean
  isSupported: boolean
  availableVoices: SpeechVoiceInfo[]
  currentConfig: SpeechConfig
  selectedVoice: SpeechVoiceInfo | null
}

/* -------------------------------------------------------------------------- */
/*                         Offline Queue & PWA Contracts                      */
/* -------------------------------------------------------------------------- */

export type OfflineActionType =
  | 'RECORD_SESSION'
  | 'SYNC_STREAK'
  | 'ACKNOWLEDGE_ANNOUNCEMENT'
  | 'ADD_MISTAKE'

export interface QueuedOfflineAction {
  id: string
  type: OfflineActionType
  payload: Record<string, unknown>
  timestamp: string
  retryCount: number
  maxRetries: number
}

export interface OfflineSyncStatus {
  isOnline: boolean
  pendingCount: number
  lastSyncTimestamp?: string | null
  isSyncing: boolean
}

export interface PWAInstallState {
  canInstall: boolean
  isInstalled: boolean
  isIOS: boolean
  dismissedUntil?: number | null
}
