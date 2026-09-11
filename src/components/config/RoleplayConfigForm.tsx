'use client'

import React from 'react'
import type { RoleplaySettings } from '@/types/config'
import { Label } from '@/components/ui/label'

interface Props {
  settings: RoleplaySettings
  onChange: (newSettings: RoleplaySettings) => void
  disabled?: boolean
}

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Cấp độ 1 (Dễ)', desc: 'Hội thoại cơ bản, câu ngắn, tình huống quen thuộc' },
  { value: 2, label: 'Cấp độ 2 (Trung bình)', desc: 'Tình huống giao tiếp thực tế hàng ngày' },
  { value: 3, label: 'Cấp độ 3 (Nâng cao)', desc: 'Hội thoại mở rộng, phản xạ từ vựng linh hoạt' },
]

export function RoleplayConfigForm({ settings, onChange, disabled }: Props) {
  function handleDifficultyChange(diff: number) {
    onChange({ ...settings, difficulty: diff })
  }

  function handleAutoSpeakChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, autoSpeak: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Difficulty selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Độ khó hội thoại
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const isSelected = (settings.difficulty ?? 1) === opt.value
            return (
              <label
                key={opt.value}
                className={`flex flex-col p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 text-indigo-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="roleplayDifficulty"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => handleDifficultyChange(opt.value)}
                    disabled={disabled}
                    className="border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
                  />
                  <span>{opt.label}</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 font-normal pl-6">
                  {opt.desc}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Auto Speak */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="autoSpeak"
          type="checkbox"
          checked={settings.autoSpeak ?? true}
          onChange={handleAutoSpeakChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="autoSpeak"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Tự động phát âm giọng đọc khi nhân vật nói
        </Label>
      </div>
    </div>
  )
}
