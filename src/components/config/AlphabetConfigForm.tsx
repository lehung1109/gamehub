'use client'

import React from 'react'
import type { AlphabetSettings } from '@/types/config'
import lettersData from '@/data/letters.json'
import { Label } from '@/components/ui/label'

interface Props {
  settings: AlphabetSettings
  onChange: (newSettings: AlphabetSettings) => void
  disabled?: boolean
}

export function AlphabetConfigForm({ settings, onChange, disabled }: Props) {
  const letters = lettersData.map((l) => l.letter)

  function toggleLetter(letter: string) {
    const current = settings.letterRange || []
    const updated = current.includes(letter)
      ? current.filter((l) => l !== letter)
      : [...current, letter]
    onChange({ ...settings, letterRange: updated })
  }

  function selectAllLetters() {
    onChange({ ...settings, letterRange: [] })
  }

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">Chế độ chơi</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="radio"
              name="mode"
              value="learn"
              checked={settings.mode !== 'quiz'}
              onChange={() => onChange({ ...settings, mode: 'learn' })}
              disabled={disabled}
              className="text-indigo-600 focus:ring-indigo-500 size-4"
            />
            <span>Học chữ cái (Khám phá)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="radio"
              name="mode"
              value="quiz"
              checked={settings.mode === 'quiz'}
              onChange={() => onChange({ ...settings, mode: 'quiz' })}
              disabled={disabled}
              className="text-indigo-600 focus:ring-indigo-500 size-4"
            />
            <span>Trắc nghiệm (Quiz đố vui)</span>
          </label>
        </div>
      </div>

      {/* Letters Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-slate-800">
            Chọn chữ cái (Để trống để học tất cả 26 chữ cái)
          </Label>
          <button
            type="button"
            onClick={selectAllLetters}
            disabled={disabled}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
          >
            Chọn tất cả
          </button>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-1.5">
          {letters.map((letter) => {
            const isSelected = settings.letterRange?.includes(letter)
            return (
              <button
                key={letter}
                type="button"
                aria-pressed={Boolean(isSelected)}
                aria-label={`Chữ cái ${letter}${isSelected ? ', đã chọn' : ''}`}
                onClick={() => toggleLetter(letter)}
                disabled={disabled}
                className={`h-9 rounded-lg border font-bold text-sm transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </div>

      {/* Auto Speak */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="alphabetAutoSpeak"
          type="checkbox"
          checked={settings.autoSpeak ?? false}
          onChange={(e) => onChange({ ...settings, autoSpeak: e.target.checked })}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
        />
        <Label
          htmlFor="alphabetAutoSpeak"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Tự động phát âm khi chọn chữ cái
        </Label>
      </div>
    </div>
  )
}
