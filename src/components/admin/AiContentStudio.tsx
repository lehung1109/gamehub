// src/components/admin/AiContentStudio.tsx

'use client'

import React, { useState } from 'react'
import { Sparkles, BookOpen, SearchCheck, Layers } from 'lucide-react'
import { AiVocabGeneratorTab } from './AiVocabGeneratorTab'
import { AiReadingGeneratorTab } from './AiReadingGeneratorTab'
import { AiGrammarGeneratorTab } from './AiGrammarGeneratorTab'

type StudioTab = 'vocab' | 'reading' | 'grammar'

export function AiContentStudio() {
  const [activeTab, setActiveTab] = useState<StudioTab>('vocab')

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/20">
            <Sparkles className="size-3.5 text-amber-300" />
            <span>AI Curriculum Engine & Dual Fallback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            AI Content Studio
          </h1>
          <p className="text-sm text-indigo-100 leading-relaxed">
            Tự động khởi tạo học liệu chuẩn CEFR chất lượng cao cho giáo viên: từ vựng, bài đọc hiểu và bài tập trinh thám ngữ pháp — xuất trực tiếp sang mini-games chỉ với 1 cú click!
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 size-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-2 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('vocab')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'vocab'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Layers className="size-4" />
          <span>Sinh Từ vựng (Vocabulary)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reading')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'reading'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <BookOpen className="size-4" />
          <span>Sinh Bài đọc (Reading)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grammar')}
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'grammar'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <SearchCheck className="size-4" />
          <span>Ngữ pháp (Grammar Detective)</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'vocab' && <AiVocabGeneratorTab />}
      {activeTab === 'reading' && <AiReadingGeneratorTab />}
      {activeTab === 'grammar' && <AiGrammarGeneratorTab />}
    </div>
  )
}
