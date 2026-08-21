'use client'

import React from 'react'
import type { SpellingSettings } from '@/types/config'
import topicsData from '@/data/topics.json'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: SpellingSettings
  onChange: (newSettings: SpellingSettings) => void
  disabled?: boolean
}

export function SpellingConfigForm({ settings, onChange, disabled }: Props) {
  const allTopics = topicsData

  function toggleTopic(topicId: string) {
    const current = settings.topics || []
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId]
    onChange({ ...settings, topics: updated })
  }

  function handleWordLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, wordLimit: 0 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({ ...settings, wordLimit: isNaN(val) || val < 0 ? 0 : Math.min(val, 50) })
  }

  return (
    <div className="space-y-6">
      {/* Topics */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề ghép chữ (Để trống để chọn tất cả chủ đề)
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
                }`}
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

      {/* Word Limit */}
      <div className="space-y-2">
        <Label htmlFor="spellingWordLimit" className="text-sm font-semibold text-slate-800">
          Số lượng từ (0 = Không giới hạn)
        </Label>
        <Input
          id="spellingWordLimit"
          type="number"
          min="0"
          max="50"
          value={settings.wordLimit === 0 ? '' : settings.wordLimit}
          placeholder="0"
          onChange={handleWordLimitChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Số lượng từ xuất hiện trong mỗi phiên chơi ghép chữ.
        </p>
      </div>

      {/* Show Emoji */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="showEmoji"
          type="checkbox"
          checked={settings.showEmoji ?? true}
          onChange={(e) => onChange({ ...settings, showEmoji: e.target.checked })}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
        />
        <Label htmlFor="showEmoji" className="text-sm font-medium text-slate-700 cursor-pointer">
          Hiển thị hình ảnh minh họa (Emoji) khi ghép chữ
        </Label>
      </div>
    </div>
  )
}
