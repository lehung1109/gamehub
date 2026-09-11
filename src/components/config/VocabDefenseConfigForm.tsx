'use client'

import React from 'react'
import type { VocabDefenseSettings } from '@/types/config'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: VocabDefenseSettings
  onChange: (newSettings: VocabDefenseSettings) => void
  disabled?: boolean
}

const DIFFICULTY_OPTIONS: Array<{
  value: 'easy' | 'medium' | 'hard'
  label: string
  desc: string
}> = [
  {
    value: 'easy',
    label: 'Dễ',
    desc: 'Quái vật di chuyển chậm, thời gian gõ từ dài',
  },
  {
    value: 'medium',
    label: 'Trung bình',
    desc: 'Tốc độ vừa phải, chủng loại quái vật đa dạng',
  },
  {
    value: 'hard',
    label: 'Khó',
    desc: 'Quái vật tấn công dồn dập, tốc độ di chuyển cao',
  },
]

export function VocabDefenseConfigForm({ settings, onChange, disabled }: Props) {
  function handleDifficultyChange(diff: 'easy' | 'medium' | 'hard') {
    onChange({ ...settings, difficulty: diff })
  }

  function handleHeartsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, initialHearts: 1 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      initialHearts: isNaN(val) ? 3 : Math.max(1, Math.min(5, val)),
    })
  }

  function handleShowHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, showHints: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Difficulty Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Mức độ thử thách
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const isSelected = (settings.difficulty ?? 'medium') === opt.value
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
                    name="vocabDefenseDifficulty"
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

      {/* Initial Hearts */}
      <div className="space-y-2">
        <Label htmlFor="vocabDefenseInitialHearts" className="text-sm font-semibold text-slate-800">
          Số tim ban đầu (1 - 5 tim)
        </Label>
        <Input
          id="vocabDefenseInitialHearts"
          type="number"
          min="1"
          max="5"
          value={settings.initialHearts ?? 3}
          onChange={handleHeartsChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Số mạng sống của người chơi trước khi thành trì bị quái vật hạ gục.
        </p>
      </div>

      {/* Show Hints */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="vocabDefenseShowHints"
          type="checkbox"
          checked={settings.showHints ?? true}
          onChange={handleShowHintsChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="vocabDefenseShowHints"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Hiển thị gợi ý từ vựng khi quái vật đến gần
        </Label>
      </div>
    </div>
  )
}
