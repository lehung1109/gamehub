// src/components/admin/AiGrammarGeneratorTab.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { Sparkles, Loader2, Gamepad2, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import type { AiGeneratedGrammarItem } from '@/types/ai-generator'
import { generateAiGrammarAction } from '@/app/actions/ai-generator'
import { AiPublishModal } from './AiPublishModal'

const GRAMMAR_RULES = [
  { id: 'subject-verb-agreement', label: 'Hòa hợp Chủ - Vị (Subject-Verb)' },
  { id: 'tenses', label: 'Thì động từ (Verb Tenses)' },
  { id: 'articles', label: 'Mạo từ (a / an / the)' },
  { id: 'prepositions', label: 'Giới từ (in / on / at)' },
]

export function AiGrammarGeneratorTab() {
  const [focusRule, setFocusRule] = useState('subject-verb-agreement')
  const [count, setCount] = useState(4)
  const [customPrompt, setCustomPrompt] = useState('')
  const [grammarItems, setGrammarItems] = useState<AiGeneratedGrammarItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [isGenerating, startTransition] = useTransition()

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    startTransition(async () => {
      const res = await generateAiGrammarAction({
        focusRule,
        count,
        customPrompt: customPrompt.trim() || undefined,
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Không thể tạo bài tập ngữ pháp')
        return
      }

      setGrammarItems(res.data)
    })
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quy tắc ngữ pháp trọng tâm
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GRAMMAR_RULES.map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setFocusRule(rule.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                    focusRule === rule.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {rule.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số lượng câu hỏi: <span className="text-indigo-600 font-bold">{count}</span>
            </label>
            <input
              type="range"
              min={2}
              max={10}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-3"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Yêu cầu bổ sung cho AI (Tùy chọn)
          </label>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Sử dụng từ vựng đời sống thường nhật cho học sinh tiểu học"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Tạo các câu chứa lỗi ngữ pháp điển hình, câu sửa đúng và manh mối gợi ý điều tra
          </p>
          <button
            type="submit"
            disabled={isGenerating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Tạo câu hỏi ngữ pháp bằng AI
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {grammarItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Các thử thách Thám tử Ngữ pháp ({grammarItems.length} câu)
            </h3>
            <button
              type="button"
              onClick={() => setIsPublishOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <Gamepad2 className="size-4" />
              Xuất sang Game Grammar Detective
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grammarItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-400">Thử thách</span>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <ShieldAlert className="size-3.5" /> Câu có lỗi:
                  </div>
                  <p className="text-slate-800 font-medium">{item.incorrectSentence}</p>
                  <p className="text-rose-600">
                    Lỗi tại: <span className="font-bold underline">{item.errorPart}</span>
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                    <CheckCircle2 className="size-3.5" /> Câu sửa chuẩn:
                  </div>
                  <p className="text-slate-800 font-medium">{item.correctSentence}</p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600 border border-slate-100">
                  <p>
                    <strong className="text-slate-700">Quy tắc: </strong>
                    {item.ruleExplanation}
                  </p>
                  <p>
                    <strong className="text-indigo-600">Gợi ý cho học sinh: </strong>
                    {item.hint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AiPublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        grammarItems={grammarItems}
      />
    </div>
  )
}
