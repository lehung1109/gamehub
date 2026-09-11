'use client'

import React from 'react'
import type { GrammarDetectiveSettings } from '@/types/config'
import { Label } from '@/components/ui/label'

interface Props {
  settings: GrammarDetectiveSettings
  onChange: (newSettings: GrammarDetectiveSettings) => void
  disabled?: boolean
}

const RANK_OPTIONS: Array<{
  value: 'intern' | 'junior' | 'senior' | 'chief'
  label: string
  desc: string
}> = [
  {
    value: 'intern',
    label: 'Thực tập sinh (Intern)',
    desc: 'Nhận biết lỗi ngữ pháp cơ bản trong câu đơn giản',
  },
  {
    value: 'junior',
    label: 'Thám tử tập sự (Junior)',
    desc: 'Tìm lỗi thì động từ, giới từ và sự hòa hợp chủ vị',
  },
  {
    value: 'senior',
    label: 'Thám tử chính thức (Senior)',
    desc: 'Cấu trúc câu phức tạp, mệnh đề quan hệ và câu bị động',
  },
  {
    value: 'chief',
    label: 'Đội trưởng thám tử (Chief)',
    desc: 'Câu đảo ngữ, thành ngữ, cấu trúc nâng cao và văn phong',
  },
]

export function GrammarDetectiveConfigForm({ settings, onChange, disabled }: Props) {
  function toggleTier(tier: 'intern' | 'junior' | 'senior' | 'chief') {
    const current = settings.rankTiers || ['intern', 'junior', 'senior', 'chief']
    const updated = current.includes(tier)
      ? current.filter((t) => t !== tier)
      : [...current, tier]
    onChange({ ...settings, rankTiers: updated as ('intern' | 'junior' | 'senior' | 'chief')[] })
  }

  function handleAllowHintsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, allowHints: e.target.checked })
  }

  function handleShowExplanationsChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...settings, showExplanations: e.target.checked })
  }

  return (
    <div className="space-y-6">
      {/* Rank Tiers */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-slate-800">
          Cấp bậc điều tra ngữ pháp
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RANK_OPTIONS.map((opt) => {
            const isChecked = (settings.rankTiers || []).includes(opt.value)
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
                    onChange={() => toggleTier(opt.value)}
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

      {/* Allow Hints */}
      <div className="flex items-center gap-3 pt-2">
        <input
          id="grammarDetectiveAllowHints"
          type="checkbox"
          checked={settings.allowHints ?? true}
          onChange={handleAllowHintsChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="grammarDetectiveAllowHints"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Cho phép gợi ý manh mối khi điều tra
        </Label>
      </div>

      {/* Show Explanations */}
      <div className="flex items-center gap-3">
        <input
          id="grammarDetectiveShowExplanations"
          type="checkbox"
          checked={settings.showExplanations ?? true}
          onChange={handleShowExplanationsChange}
          disabled={disabled}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 disabled:opacity-50"
        />
        <Label
          htmlFor="grammarDetectiveShowExplanations"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Hiển thị giải thích ngữ pháp chi tiết sau mỗi câu hỏi
        </Label>
      </div>
    </div>
  )
}
