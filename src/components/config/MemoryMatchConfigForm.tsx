'use client'

import React from 'react'
import type { MemoryMatchSettings } from '@/types/config'
import topicsData from '@/data/topics.json'
import { Label } from '@/components/ui/label'

interface Props {
  settings: MemoryMatchSettings
  onChange: (newSettings: MemoryMatchSettings) => void
  disabled?: boolean
}

const PAIR_OPTIONS: Array<{ value: 4 | 6 | 8; label: string; desc: string }> = [
  { value: 4, label: '4 cặp', desc: 'Dễ (8 thẻ) - Phù hợp mới bắt đầu' },
  { value: 6, label: '6 cặp', desc: 'Vừa (12 thẻ) - Tiêu chuẩn' },
  { value: 8, label: '8 cặp', desc: 'Thử thách (16 thẻ) - Rèn luyện trí nhớ' },
]

export function MemoryMatchConfigForm({ settings, onChange, disabled }: Props) {
  const allTopics = topicsData

  function toggleTopic(topicId: string) {
    const current = settings.topics || []
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId]
    onChange({ ...settings, topics: updated })
  }

  function handlePairCountChange(count: 4 | 6 | 8) {
    onChange({ ...settings, pairCount: count })
  }

  function handleAutoSpeakChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, autoSpeak: e.target.checked })
  }

  function handleShowTimerChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, showTimer: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Topics Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề từ vựng (Để trống để chọn tất cả)
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

      {/* Pair Count (4, 6, 8) */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Số cặp thẻ trong mỗi ván chơi
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAIR_OPTIONS.map((opt) => {
            const isSelected = (settings.pairCount ?? 6) === opt.value
            return (
              <label
                key={opt.value}
                className={`flex flex-col p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 text-indigo-950 font-semibold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pairCount"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => handlePairCountChange(opt.value)}
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

      {/* Auto Speak Toggle */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="autoSpeak"
          type="checkbox"
          checked={settings.autoSpeak ?? true}
          onChange={handleAutoSpeakChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
        />
        <Label htmlFor="autoSpeak" className="text-sm font-medium text-slate-700 cursor-pointer">
          Tự động phát âm tiếng Anh khi lật thẻ
        </Label>
      </div>

      {/* Show Timer Toggle */}
      <div className="flex items-center gap-3">
        <input
          id="showTimer"
          type="checkbox"
          checked={settings.showTimer ?? true}
          onChange={handleShowTimerChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
        />
        <Label htmlFor="showTimer" className="text-sm font-medium text-slate-700 cursor-pointer">
          Hiển thị đồng hồ đếm thời gian
        </Label>
      </div>
    </div>
  )
}
