'use client'

import React from 'react'
import type { PronunciationSettings } from '@/types/config'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: PronunciationSettings
  onChange: (newSettings: PronunciationSettings) => void
  disabled?: boolean
}

const TOPIC_OPTIONS: Array<{
  value: 'minimal-pairs' | 'workplace-words' | 'standup-phrases'
  label: string
  desc: string
}> = [
  { value: 'minimal-pairs', label: 'Cặp âm dễ nhầm lẫn', desc: 'Phân biệt nguyên âm ngắn/dài (/iː/ vs /ɪ/) và phụ âm khó' },
  { value: 'workplace-words', label: 'Từ vựng công sở & Trọng âm', desc: 'Luyện chuẩn trọng âm các từ vựng công nghệ và văn phòng' },
  { value: 'standup-phrases', label: 'Câu giao tiếp Standup', desc: 'Mẫu câu họp agile và cập nhật tiến độ công việc hàng ngày' },
]

export function PronunciationConfigForm({ settings, onChange, disabled }: Props) {
  function toggleTopic(topic: 'minimal-pairs' | 'workplace-words' | 'standup-phrases') {
    const current = settings.topics || ['minimal-pairs', 'workplace-words', 'standup-phrases']
    const updated = current.includes(topic)
      ? current.filter((t) => t !== topic)
      : [...current, topic]
    onChange({
      ...settings,
      topics: updated.length > 0 ? updated : [topic],
    })
  }

  function handleThresholdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, passThreshold: 70 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      passThreshold: isNaN(val) ? 70 : Math.max(50, Math.min(95, val)),
    })
  }

  function handleWordLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, wordLimit: 10 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      wordLimit: isNaN(val) ? 10 : Math.max(5, Math.min(20, val)),
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề luyện nói
        </Label>
        <div className="grid grid-cols-1 gap-3">
          {TOPIC_OPTIONS.map((opt) => {
            const isChecked = (settings.topics || []).includes(opt.value)
            return (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                  isChecked
                    ? 'border-indigo-500 bg-indigo-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleTopic(opt.value)}
                  disabled={disabled}
                  aria-label={opt.label}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="passThreshold" className="text-sm font-semibold text-slate-800">
            Điểm đạt tối thiểu (%)
          </Label>
          <Input
            id="passThreshold"
            type="number"
            min={50}
            max={95}
            value={settings.passThreshold ?? 70}
            onChange={handleThresholdChange}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-slate-500">Mức độ chính xác cần đạt để qua bài (50% - 95%)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wordLimit" className="text-sm font-semibold text-slate-800">
            Số lượng câu hỏi / từ
          </Label>
          <Input
            id="wordLimit"
            type="number"
            min={5}
            max={20}
            value={settings.wordLimit ?? 10}
            onChange={handleWordLimitChange}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-slate-500">Số lượng mục luyện phát âm trong một lượt (5 - 20)</p>
        </div>
      </div>
    </div>
  )
}
