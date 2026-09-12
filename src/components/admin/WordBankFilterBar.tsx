// src/components/admin/WordBankFilterBar.tsx

'use client'

import React from 'react'
import { Search, Sparkles } from 'lucide-react'
import type { CefrLevel } from '@/types/word-bank'
import { CEFR_LEVELS } from '@/types/word-bank'

interface WordBankFilterBarProps {
  search: string
  onSearchChange: (val: string) => void
  topic: string
  onTopicChange: (val: string) => void
  cefrLevel: CefrLevel | 'all'
  onCefrChange: (val: CefrLevel | 'all') => void
  availableTopics: string[]
}

export function WordBankFilterBar({
  search,
  onSearchChange,
  topic,
  onTopicChange,
  cefrLevel,
  onCefrChange,
  availableTopics,
}: WordBankFilterBarProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm từ vựng tiếng Anh hoặc nghĩa tiếng Việt..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Topic dropdown */}
        <div className="w-full md:w-56">
          <select
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            aria-label="Lọc theo chủ đề"
          >
            <option value="all">Tất cả chủ đề</option>
            {availableTopics.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CEFR Level Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
          <Sparkles className="size-3.5 text-indigo-500" /> Khung CEFR:
        </span>
        <button
          type="button"
          onClick={() => onCefrChange('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            cefrLevel === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          Tất cả
        </button>
        {CEFR_LEVELS.map((level) => {
          const isSelected = cefrLevel === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onCefrChange(level)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {level}
            </button>
          )
        })}
      </div>
    </div>
  )
}
