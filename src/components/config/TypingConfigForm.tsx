'use client'

import React from 'react'
import type { TypingSettings } from '@/types/config'
import topicsData from '@/data/topics.json'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: TypingSettings
  onChange: (newSettings: TypingSettings) => void
  disabled?: boolean
}

export function TypingConfigForm({ settings, onChange, disabled }: Props) {
  const allTopics = topicsData

  function toggleTopic(topicId: string) {
    const current = settings.topics || []
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId]
    onChange({ ...settings, topics: updated })
  }

  function handleTimeLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, timeLimitSeconds: 0 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      timeLimitSeconds: isNaN(val) || val < 0 ? 0 : Math.min(val, 600),
    })
  }

  function handleShowVirtualKeyboardChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, showVirtualKeyboard: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Topics */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề luyện gõ (Để trống để chọn tất cả chủ đề)
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {allTopics.map((topic) => {
            const isChecked = settings.topics?.includes(topic.id)
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

      {/* Time Limit */}
      <div className="space-y-2">
        <Label htmlFor="typingTimeLimit" className="text-sm font-semibold text-slate-800">
          Thời gian giới hạn (giây, 0 = Không giới hạn)
        </Label>
        <Input
          id="typingTimeLimit"
          type="number"
          min="0"
          max="600"
          value={settings.timeLimitSeconds === 0 ? '' : (settings.timeLimitSeconds ?? 60)}
          placeholder="60"
          onChange={handleTimeLimitChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Thời gian đếm ngược trong mỗi lượt luyện gõ phím.
        </p>
      </div>

      {/* Virtual Keyboard */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="showVirtualKeyboard"
          type="checkbox"
          checked={settings.showVirtualKeyboard ?? true}
          onChange={handleShowVirtualKeyboardChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="showVirtualKeyboard"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Hiển thị bàn phím ảo trên màn hình
        </Label>
      </div>
    </div>
  )
}
