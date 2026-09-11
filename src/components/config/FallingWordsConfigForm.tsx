'use client'

import React from 'react'
import type { FallingWordsSettings } from '@/types/config'
import topicsData from '@/data/topics.json'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: FallingWordsSettings
  onChange: (newSettings: FallingWordsSettings) => void
  disabled?: boolean
}

const SPEED_OPTIONS: Array<{
  value: 'slow' | 'medium' | 'fast'
  label: string
  desc: string
}> = [
  {
    value: 'slow',
    label: 'Chậm (Slow)',
    desc: 'Tốc độ rơi chậm rãi, phù hợp luyện tập làm quen',
  },
  {
    value: 'medium',
    label: 'Vừa (Medium)',
    desc: 'Tốc độ tiêu chuẩn, cân bằng giữa tốc độ và độ chính xác',
  },
  {
    value: 'fast',
    label: 'Nhanh (Fast)',
    desc: 'Từ rơi dồn dập, thử thách kỹ năng gõ và phản xạ tức thì',
  },
]

export function FallingWordsConfigForm({ settings, onChange, disabled }: Props) {
  const allTopics = topicsData

  function handleSpeedChange(speed: 'slow' | 'medium' | 'fast') {
    onChange({ ...settings, speed })
  }

  function toggleTopic(topicId: string) {
    const current = settings.wordTopics || []
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId]
    onChange({ ...settings, wordTopics: updated })
  }

  function handleLivesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, lives: 1 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      lives: isNaN(val) ? 3 : Math.max(1, Math.min(5, val)),
    })
  }

  return (
    <div className="space-y-6">
      {/* Speed Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Tốc độ rơi của từ
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SPEED_OPTIONS.map((opt) => {
            const isSelected = (settings.speed ?? 'medium') === opt.value
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
                    name="fallingWordsSpeed"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => handleSpeedChange(opt.value)}
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

      {/* Topics */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề từ vựng (Để trống để chọn tất cả chủ đề)
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {allTopics.map((topic) => {
            const isChecked = (settings.wordTopics || []).includes(topic.id)
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

      {/* Lives */}
      <div className="space-y-2">
        <Label htmlFor="fallingWordsLives" className="text-sm font-semibold text-slate-800">
          Số mạng sống (1 - 5 mạng)
        </Label>
        <Input
          id="fallingWordsLives"
          type="number"
          min="1"
          max="5"
          value={settings.lives ?? 3}
          onChange={handleLivesChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Số lần được phép để từ rơi chạm đáy trước khi trò chơi kết thúc.
        </p>
      </div>
    </div>
  )
}
