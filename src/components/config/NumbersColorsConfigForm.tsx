'use client'

import React from 'react'
import type { NumbersColorsSettings } from '@/types/config'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: NumbersColorsSettings
  onChange: (newSettings: NumbersColorsSettings) => void
  disabled?: boolean
}

export function NumbersColorsConfigForm({ settings, onChange, disabled }: Props) {
  const minNum = settings.numberRange?.[0] ?? 1
  const maxNum = settings.numberRange?.[1] ?? 20

  function handleMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, numberRange: [1, maxNum] })
      return
    }
    const val = parseInt(raw, 10)
    if (isNaN(val)) return
    const newMin = Math.max(1, Math.min(20, val))
    onChange({
      ...settings,
      numberRange: [newMin, Math.max(newMin, maxNum)],
    })
  }

  function handleMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, numberRange: [minNum, 20] })
      return
    }
    const val = parseInt(raw, 10)
    if (isNaN(val)) return
    const newMax = Math.max(1, Math.min(20, val))
    onChange({
      ...settings,
      numberRange: [Math.min(minNum, newMax), newMax],
    })
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
              name="numMode"
              value="learn"
              checked={settings.mode !== 'quiz'}
              onChange={() => onChange({ ...settings, mode: 'learn' })}
              disabled={disabled}
              className="text-indigo-600 focus:ring-indigo-500 size-4"
            />
            <span>Học tập (Khám phá số & màu)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="radio"
              name="numMode"
              value="quiz"
              checked={settings.mode === 'quiz'}
              onChange={() => onChange({ ...settings, mode: 'quiz' })}
              disabled={disabled}
              className="text-indigo-600 focus:ring-indigo-500 size-4"
            />
            <span>Luyện tập (Trắc nghiệm)</span>
          </label>
        </div>
      </div>

      {/* Number Range */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-800">
          Phạm vi số đếm (Từ 1 đến 20)
        </Label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="rangeMin" className="text-xs text-slate-500 font-normal">
              Từ:
            </Label>
            <Input
              id="rangeMin"
              type="number"
              min="1"
              max="20"
              value={minNum}
              onChange={handleMinChange}
              disabled={disabled}
              className="w-20 text-center"
              aria-label="Từ số"
            />
          </div>
          <span className="text-slate-400 font-bold">—</span>
          <div className="flex items-center gap-2">
            <Label htmlFor="rangeMax" className="text-xs text-slate-500 font-normal">
              Đến:
            </Label>
            <Input
              id="rangeMax"
              type="number"
              min="1"
              max="20"
              value={maxNum}
              onChange={handleMaxChange}
              disabled={disabled}
              className="w-20 text-center"
              aria-label="Đến số"
            />
          </div>
        </div>
      </div>

      {/* Include Colors */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="includeColors"
          type="checkbox"
          checked={settings.includeColors ?? true}
          onChange={(e) => onChange({ ...settings, includeColors: e.target.checked })}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
        />
        <Label
          htmlFor="includeColors"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Bao gồm phần học Màu sắc (Colors)
        </Label>
      </div>
    </div>
  )
}
