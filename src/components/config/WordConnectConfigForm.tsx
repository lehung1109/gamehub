'use client'

import React from 'react'
import type { WordConnectSettings } from '@/types/config'
import { Label } from '@/components/ui/label'

interface Props {
  settings: WordConnectSettings
  onChange: (newSettings: WordConnectSettings) => void
  disabled?: boolean
}

const DIFFICULTY_OPTIONS: Array<{
  value: 'easy' | 'medium' | 'hard'
  label: string
  desc: string
}> = [
  { value: 'easy', label: 'Dễ', desc: '3 - 4 chữ cái, từ vựng quen thuộc' },
  { value: 'medium', label: 'Trung bình', desc: '4 - 5 chữ cái, nhiều tổ hợp từ nối' },
  { value: 'hard', label: 'Thử thách', desc: '5 - 6 chữ cái, bảng nối ô chữ đa dạng' },
]

export function WordConnectConfigForm({ settings, onChange, disabled }: Props) {
  function toggleDifficulty(diff: 'easy' | 'medium' | 'hard') {
    const current = settings.difficultyRange || ['easy', 'medium', 'hard']
    const updated = current.includes(diff)
      ? current.filter((d) => d !== diff)
      : [...current, diff]
    onChange({
      ...settings,
      difficultyRange: updated as ('easy' | 'medium' | 'hard')[],
    })
  }

  function handleAllowHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, allowHints: e.target.checked })
  }

  function handleAllowShuffleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, allowShuffle: e.target.checked })
  }

  function handleEnableBonusWordsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, enableBonusWords: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Difficulty Range */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Mức độ khó xuất hiện trong các màn chơi
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const isChecked = settings.difficultyRange?.includes(opt.value)
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
                    onChange={() => toggleDifficulty(opt.value)}
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

      {/* Feature Toggles */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <input
            id="wordConnectAllowHints"
            type="checkbox"
            checked={settings.allowHints ?? true}
            onChange={handleAllowHintsChange}
            disabled={disabled}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
          />
          <Label
            htmlFor="wordConnectAllowHints"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Cho phép gợi ý mở chữ cái trên bảng
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="wordConnectAllowShuffle"
            type="checkbox"
            checked={settings.allowShuffle ?? true}
            onChange={handleAllowShuffleChange}
            disabled={disabled}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
          />
          <Label
            htmlFor="wordConnectAllowShuffle"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Cho phép xáo trộn chữ cái trên vòng quay
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="wordConnectEnableBonusWords"
            type="checkbox"
            checked={settings.enableBonusWords ?? true}
            onChange={handleEnableBonusWordsChange}
            disabled={disabled}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
          />
          <Label
            htmlFor="wordConnectEnableBonusWords"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Kích hoạt từ vựng thưởng để nhận thêm điểm
          </Label>
        </div>
      </div>
    </div>
  )
}
