'use client'

import React from 'react'
import type { CrosswordSettings } from '@/types/config'
import topicsData from '@/data/topics.json'
import { Label } from '@/components/ui/label'

interface Props {
  settings: CrosswordSettings
  onChange: (newSettings: CrosswordSettings) => void
  disabled?: boolean
}

const GRID_SIZE_OPTIONS: Array<{
  value: 'small' | 'medium' | 'large'
  label: string
  desc: string
}> = [
  {
    value: 'small',
    label: 'Nhỏ (Small)',
    desc: 'Lưới 9x9, khoảng 5-7 từ vựng, thời gian giải nhanh',
  },
  {
    value: 'medium',
    label: 'Vừa (Medium)',
    desc: 'Lưới 12x12, khoảng 8-12 từ vựng tiêu chuẩn',
  },
  {
    value: 'large',
    label: 'Lớn (Large)',
    desc: 'Lưới 15x15, từ vựng phong phú, thử thách ô chữ phức tạp',
  },
]

export function CrosswordConfigForm({ settings, onChange, disabled }: Props) {
  const allTopics = topicsData

  function toggleTopic(topicId: string) {
    const current = settings.topics || []
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId]
    onChange({ ...settings, topics: updated })
  }

  function handleGridSizeChange(size: 'small' | 'medium' | 'large') {
    onChange({ ...settings, gridSize: size })
  }

  function handleAllowHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, allowHints: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Topics */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề ô chữ (Để trống để chọn tất cả chủ đề)
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {allTopics.map((topic) => {
            const isChecked = (settings.topics || []).includes(topic.id)
            return (
              <label
                key={topic.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleTopic(topic.id)}
                  disabled={disabled}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <span className="text-base select-none">{topic.emoji}</span>
                <span className="truncate">{topic.nameVi}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Grid Size Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Kích thước bảng ô chữ
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GRID_SIZE_OPTIONS.map((opt) => {
            const isSelected = (settings.gridSize ?? 'medium') === opt.value
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
                    name="crosswordGridSize"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => handleGridSizeChange(opt.value)}
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

      {/* Allow Hints */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="crosswordAllowHints"
          type="checkbox"
          checked={settings.allowHints ?? true}
          onChange={handleAllowHintsChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="crosswordAllowHints"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Cho phép gợi ý chữ cái trong ô chữ
        </Label>
      </div>
    </div>
  )
}
