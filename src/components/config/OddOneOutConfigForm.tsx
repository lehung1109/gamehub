'use client'

import React from 'react'
import type { OddOneOutSettings } from '@/types/config'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: OddOneOutSettings
  onChange: (newSettings: OddOneOutSettings) => void
  disabled?: boolean
}

const DIFFICULTY_OPTIONS: Array<{
  value: 'easy' | 'medium' | 'hard'
  label: string
  desc: string
}> = [
  { value: 'easy', label: 'Dễ', desc: 'Từ vựng trực quan, khác biệt rõ ràng về chủ đề' },
  { value: 'medium', label: 'Trung bình', desc: 'Phân loại theo ngữ nghĩa và ngữ cảnh sử dụng' },
  { value: 'hard', label: 'Khó', desc: 'Phân loại ngữ pháp, từ loại hoặc sắc thái nghĩa' },
]

export function OddOneOutConfigForm({ settings, onChange, disabled }: Props) {
  function toggleDifficulty(diff: 'easy' | 'medium' | 'hard') {
    const current = settings.difficulty || ['easy', 'medium', 'hard']
    const updated = current.includes(diff)
      ? current.filter((d) => d !== diff)
      : [...current, diff]
    onChange({
      ...settings,
      difficulty: updated as ('easy' | 'medium' | 'hard')[],
    })
  }

  function handleQuestionCountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, questionCount: 5 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({
      ...settings,
      questionCount: isNaN(val) ? 10 : Math.max(5, Math.min(20, val)),
    })
  }

  function handleAllowHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, allowHints: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Difficulty checkboxes */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Mức độ câu hỏi
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DIFFICULTY_OPTIONS.map((opt) => {
            const isChecked = settings.difficulty?.includes(opt.value)
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

      {/* Question Count */}
      <div className="space-y-2">
        <Label htmlFor="oddOneOutQuestionCount" className="text-sm font-semibold text-slate-800">
          Số lượng câu hỏi (5 - 20 câu)
        </Label>
        <Input
          id="oddOneOutQuestionCount"
          type="number"
          min="5"
          max="20"
          value={settings.questionCount ?? 10}
          onChange={handleQuestionCountChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Số lượng câu hỏi tìm từ khác biệt trong mỗi lượt làm bài.
        </p>
      </div>

      {/* Allow Hints */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="oddOneOutAllowHints"
          type="checkbox"
          checked={settings.allowHints ?? true}
          onChange={handleAllowHintsChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="oddOneOutAllowHints"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Cho phép gợi ý giải thích loại trừ
        </Label>
      </div>
    </div>
  )
}
