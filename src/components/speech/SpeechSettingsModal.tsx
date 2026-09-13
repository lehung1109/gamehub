'use client'

import React, { useEffect } from 'react'
import { X, Check, Sparkles, Globe2, Gauge } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'
import { VoicePreviewButton } from '@/components/speech/VoicePreviewButton'
import type { AccentRegion, VoiceStyle } from '@/types/speech'
import { cn } from '@/lib/utils'

export interface SpeechSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface AccentOption {
  region: AccentRegion
  flag: string
  title: string
  subtitle: string
}

const ACCENT_OPTIONS: AccentOption[] = [
  {
    region: 'US',
    flag: '🇺🇸',
    title: 'American English (US)',
    subtitle: 'Standard clear American pronunciation',
  },
  {
    region: 'UK',
    flag: '🇬🇧',
    title: 'British English (UK)',
    subtitle: 'Classic British RP accent for children',
  },
  {
    region: 'AU',
    flag: '🇦🇺',
    title: 'Australian English (AU)',
    subtitle: 'Friendly Australian accent with clear tones',
  },
]

interface StyleOption {
  style: VoiceStyle
  label: string
  description: string
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    style: 'kid',
    label: 'Friendly Kid',
    description: 'Higher pitch, cheerful and expressive tone',
  },
  {
    style: 'natural',
    label: 'Natural English',
    description: 'Balanced classroom tone for daily practice',
  },
  {
    style: 'slow',
    label: 'Slow & Clear',
    description: 'Deliberate pacing for beginners and phonics',
  },
]

const SPEED_PRESETS = [
  { label: 'Slow (0.7x)', value: 0.7 },
  { label: 'Normal (0.85x)', value: 0.85 },
  { label: 'Brisk (1.0x)', value: 1.0 },
]

export function SpeechSettingsModal({
  isOpen,
  onClose,
  className,
}: SpeechSettingsModalProps) {
  const {
    config,
    updateConfig,
    setAccent,
    setVoiceStyle,
    speak,
    isSpeaking,
    activeVoice,
  } = useSpeech()

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handlePreview = () => {
    speak('Hello! Welcome to GameHub English.')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="speech-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className={cn(
          'relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-indigo-100 flex flex-col max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Globe2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="speech-settings-title"
                className="text-2xl font-black text-slate-800 tracking-tight"
              >
                Speech &amp; Accent Settings
              </h2>
              <p className="text-base font-medium text-slate-500">
                Choose pronunciation accent, tone, and pacing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Accent Selection */}
        <div className="mt-6">
          <label className="block text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-indigo-600" />
            <span>Voice Accent Region</span>
          </label>

          <div className="grid grid-cols-1 gap-3">
            {ACCENT_OPTIONS.map((opt) => {
              const isSelected = config.accent === opt.region
              return (
                <button
                  key={opt.region}
                  type="button"
                  onClick={() => setAccent(opt.region)}
                  className={cn(
                    'w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer',
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={opt.region}>
                      {opt.flag}
                    </span>
                    <div>
                      <div className="text-lg font-bold text-slate-800">{opt.title}</div>
                      <div className="text-base text-slate-500 font-medium">
                        {opt.subtitle}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Voice Style Selection */}
        <div className="mt-6">
          <label className="block text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Tone &amp; Style</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STYLE_OPTIONS.map((opt) => {
              const isSelected = config.voiceStyle === opt.style
              return (
                <button
                  key={opt.style}
                  type="button"
                  onClick={() => setVoiceStyle(opt.style)}
                  className={cn(
                    'p-4 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center cursor-pointer',
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 shadow-sm text-slate-800'
                      : 'border-slate-200 hover:border-amber-200 hover:bg-slate-50 text-slate-600'
                  )}
                >
                  <span className="text-lg font-bold">{opt.label}</span>
                  <span className="text-base text-slate-500 mt-1 font-medium leading-tight">
                    {opt.description}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Speed Controls */}
        <div className="mt-6">
          <label className="block text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-600" />
            <span>Speech Speed</span>
          </label>

          <div className="grid grid-cols-3 gap-3">
            {SPEED_PRESETS.map((preset) => {
              const isSelected = Math.abs(config.speedRate - preset.value) < 0.05
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => updateConfig({ speedRate: preset.value })}
                  className={cn(
                    'py-3 px-4 rounded-2xl border-2 font-bold text-base transition-all cursor-pointer text-center',
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 hover:border-emerald-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Voice Diagnostics & Preview Action */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-base font-bold text-slate-700">Active Synthesizer Voice</div>
            <div className="text-base text-slate-500 font-medium truncate max-w-xs">
              {activeVoice ? activeVoice.name : 'System default voice'}
            </div>
          </div>

          <VoicePreviewButton
            onPreview={handlePreview}
            isSpeaking={isSpeaking}
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
