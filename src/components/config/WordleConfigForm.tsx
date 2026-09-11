'use client'

import React from 'react'
import type { WordleSettings } from '@/types/config'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: WordleSettings
  onChange: (newSettings: WordleSettings) => void
  disabled?: boolean
}

const LENGTH_OPTIONS: Array<{ value: 4 | 5 | 6; label: string; desc: string }> = [
  { value: 4, label: '4 chữ cái', desc: 'Từ ngắn, dễ đoán, phù hợp học sinh tiểu học' },
  { value: 5, label: '5 chữ cái', desc: 'Độ dài chuẩn Wordle cổ điển' },
  { value: 6, label: '6 chữ cái', desc: 'Từ dài hơn, tăng độ thử thách vốn từ' },
]

export function WordleConfigForm({ settings, onChange, disabled }: Props) {
  function toggleLength(len: 4 | 5 | 6) {
    const current = settings.allowedLengths || [4, 5, 6]
    const updated = current.includes(len)
      ? current.filter((l) => l !== len)
      : [...current, len]
    onChange({ ...settings, allowedLengths: updated as (4 | 5 | 6)[] })
  }

  function handleMaxAttemptsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, maxAttempts: 4 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      maxAttempts: isNaN(val) ? 6 : Math.max(4, Math.min(8, val)),
    })
  }

  function handleAllowHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, allowHints: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Allowed Word Lengths */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Độ dài từ cho phép
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LENGTH_OPTIONS.map((opt) => {
            const isChecked = settings.allowedLengths?.includes(opt.value)
            return (
              <label
                key={opt.value}
                className={`flex flex-col p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 text-indigo-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleLength(opt.value)}
                    disabled={disabled}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
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

      {/* Max Attempts */}
      <div className="space-y-2">
        <Label htmlFor="wordleMaxAttempts" className="text-sm font-semibold text-slate-800">
          Số lần đoán tối đa (4 - 8 lượt)
        </Label>
        <Input
          id="wordleMaxAttempts"
          type="number"
          min="4"
          max="8"
          value={settings.maxAttempts ?? 6}
          onChange={handleMaxAttemptsChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Số lượt thử được cho phép trước khi kết thúc ván đoán từ.
        </p>
      </div>

      {/* Allow Hints */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="wordleAllowHints"
          type="checkbox"
          checked={settings.allowHints ?? true}
          onChange={handleAllowHintsChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="wordleAllowHints"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Cho phép gợi ý nghĩa tiếng Việt hoặc chữ cái đầu
        </Label>
      </div>
    </div>
  )
}
