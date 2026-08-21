'use client'

import React from 'react'
import type { SentencesSettings } from '@/types/config'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Props {
  settings: SentencesSettings
  onChange: (newSettings: SentencesSettings) => void
  disabled?: boolean
}

const CATEGORIES = [
  { id: 'daily-actions', nameVi: 'Hoạt động hàng ngày', emoji: '🍽️' },
  { id: 'animals', nameVi: 'Động vật & Hành vi', emoji: '🐾' },
  { id: 'descriptions', nameVi: 'Mô tả & Màu sắc', emoji: '🎨' },
  { id: 'feelings-preferences', nameVi: 'Cảm xúc & Sở thích', emoji: '❤️' },
  { id: 'school', nameVi: 'Trường học & Đồ dùng', emoji: '🏫' },
]

export function SentencesConfigForm({ settings, onChange, disabled }: Props) {
  function toggleCategory(catId: string) {
    const current = settings.categories || []
    const updated = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId]
    onChange({ ...settings, categories: updated })
  }

  function handleSentenceCountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') {
      onChange({ ...settings, sentenceCount: 0 })
      return
    }
    const val = parseInt(raw, 10)
    onChange({ ...settings, sentenceCount: isNaN(val) || val < 0 ? 0 : Math.min(val, 50) })
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Chủ đề mẫu câu (Để trống để chọn tất cả chủ đề)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isChecked = settings.categories?.includes(cat.id)
            return (
              <label
                key={cat.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCategory(cat.id)}
                  disabled={disabled}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <span className="text-base select-none">{cat.emoji}</span>
                <span className="truncate">{cat.nameVi}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Sentence Count */}
      <div className="space-y-2">
        <Label htmlFor="sentenceCount" className="text-sm font-semibold text-slate-800">
          Số lượng câu (0 = Tất cả câu)
        </Label>
        <Input
          id="sentenceCount"
          type="number"
          min="0"
          max="30"
          value={settings.sentenceCount === 0 ? '' : settings.sentenceCount}
          placeholder="0"
          onChange={handleSentenceCountChange}
          disabled={disabled}
          className="max-w-[200px]"
        />
        <p className="text-xs text-slate-500">
          Số lượng câu cần ghép trong mỗi bài học (để 0 để không giới hạn).
        </p>
      </div>

      {/* Show Vietnamese */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="showVietnamese"
          type="checkbox"
          checked={settings.showVietnamese ?? true}
          onChange={(e) => onChange({ ...settings, showVietnamese: e.target.checked })}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4"
        />
        <Label
          htmlFor="showVietnamese"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Hiển thị gợi ý nghĩa tiếng Việt của câu
        </Label>
      </div>
    </div>
  )
}
