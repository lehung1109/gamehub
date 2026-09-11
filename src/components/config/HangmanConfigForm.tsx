'use client'

import React from 'react'
import type { HangmanSettings } from '@/types/config'
import topicsData from '@/data/topics.json'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: HangmanSettings
  onChange: (newSettings: HangmanSettings) => void
  disabled?: boolean
}

export function HangmanConfigForm({ settings, onChange, disabled }: Props) {
  const allTopics = topicsData

  function toggleTopic(topicId: string) {
    const current = settings.topics || []
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId]
    onChange({ ...settings, topics: updated })
  }

  function handleMaxBalloonsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, maxBalloons: 3 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      maxBalloons: isNaN(val) ? 6 : Math.max(3, Math.min(8, val)),
    })
  }

  function handleAllowHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, allowHints: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Topics */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề từ vựng (Để trống để chọn tất cả chủ đề)
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

      {/* Max Balloons */}
      <div className="space-y-2">
        <Label htmlFor="hangmanMaxBalloons" className="text-sm font-semibold text-slate-800">
          Số bóng bay tối đa (3 - 8 bóng)
        </Label>
        <Input
          id="hangmanMaxBalloons"
          type="number"
          min="3"
          max="8"
          value={settings.maxBalloons ?? 6}
          onChange={handleMaxBalloonsChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Số lượt đoán sai tối đa tương ứng với số bóng bay giữ nhân vật an toàn.
        </p>
      </div>

      {/* Allow Hints */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="hangmanAllowHints"
          type="checkbox"
          checked={settings.allowHints ?? true}
          onChange={handleAllowHintsChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="hangmanAllowHints"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Cho phép gợi ý nghĩa từ vựng hoặc ngữ cảnh
        </Label>
      </div>
    </div>
  )
}
