// src/components/config/WordSearchConfigForm.tsx
'use client'

import React from 'react'
import type { WordSearchSettings } from '@/types/config'
import topicsData from '@/data/topics.json'
import { Label } from '@/components/ui/label'

interface Props {
  settings: WordSearchSettings
  onChange: (newSettings: WordSearchSettings) => void
  disabled?: boolean
}

const WORD_COUNT_OPTIONS: Array<{ value: 4 | 5 | 6; label: string; desc: string }> = [
  { value: 4, label: '4 từ', desc: 'Dễ (4 từ) - Phù hợp học sinh lớp 1' },
  { value: 5, label: '5 từ', desc: 'Vừa (5 từ) - Tiêu chuẩn' },
  { value: 6, label: '6 từ', desc: 'Thử thách (6 từ) - Rèn luyện tìm kiếm' },
]

export function WordSearchConfigForm({ settings, onChange, disabled }: Props) {
  const allTopics = topicsData

  function toggleTopic(topicId: string) {
    const current = settings.topics || []
    const updated = current.includes(topicId)
      ? current.filter((t) => t !== topicId)
      : [...current, topicId]
    onChange({ ...settings, topics: updated })
  }

  function handleWordCountChange(count: 4 | 5 | 6) {
    onChange({ ...settings, wordCount: count })
  }

  function handleEnableHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, enableHints: e.target.checked })
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
                  aria-label={topic.nameVi}
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

      {/* Word Count (4, 5, 6) */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Số lượng từ vựng trong mỗi ván chơi
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORD_COUNT_OPTIONS.map((opt) => {
            const isSelected = (settings.wordCount ?? 5) === opt.value
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
                    name="wordCount"
                    value={opt.value}
                    checked={isSelected}
                    onChange={() => handleWordCountChange(opt.value)}
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

      {/* Additional Settings Toggles */}
      <div className="space-y-4 pt-2 border-t border-slate-200">
        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-800 block">
              Bật tính năng gợi ý (💡)
            </span>
            <span className="text-xs text-slate-500">
              Cho phép học sinh bấm nút Gợi ý để làm chớp sáng chữ cái đầu tiên của từ
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.enableHints ?? true}
            onChange={handleEnableHintsChange}
            disabled={disabled}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-800 block">
              Tự động phát âm khi tìm thấy từ
            </span>
            <span className="text-xs text-slate-500">
              Tự động đọc phát âm từ tiếng Anh qua giọng đọc khi học sinh chọn đúng từ
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.autoSpeak ?? true}
            onChange={handleAutoSpeakChange}
            disabled={disabled}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-slate-800 block">
              Hiển thị đồng hồ thời gian
            </span>
            <span className="text-xs text-slate-500">
              Đo thời gian học sinh hoàn thành ván tìm kiếm (stopwatch)
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.showTimer ?? true}
            onChange={handleShowTimerChange}
            disabled={disabled}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
          />
        </label>
      </div>
    </div>
  )
}
