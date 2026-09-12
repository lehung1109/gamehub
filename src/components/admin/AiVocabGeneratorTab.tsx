// src/components/admin/AiVocabGeneratorTab.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { Sparkles, Loader2, Trash2, Gamepad2, AlertCircle } from 'lucide-react'
import type { AiGeneratedVocabItem } from '@/types/ai-generator'
import type { CefrLevel } from '@/types/word-bank'
import { CEFR_LEVELS } from '@/types/word-bank'
import { generateAiVocabularyAction } from '@/app/actions/ai-generator'
import { AiPublishModal } from './AiPublishModal'

export function AiVocabGeneratorTab() {
  const [topic, setTopic] = useState('space')
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>('A1')
  const [count, setCount] = useState(5)
  const [customPrompt, setCustomPrompt] = useState('')
  const [vocabItems, setVocabItems] = useState<AiGeneratedVocabItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [isGenerating, startTransition] = useTransition()

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!topic.trim()) {
      setErrorMessage('Vui lòng nhập chủ đề từ vựng')
      return
    }

    startTransition(async () => {
      const res = await generateAiVocabularyAction({
        topic: topic.trim(),
        cefrLevel,
        count,
        customPrompt: customPrompt.trim() || undefined,
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Không thể tạo từ vựng bằng AI')
        return
      }

      setVocabItems(res.data)
    })
  }

  function handleItemChange(id: string, field: keyof AiGeneratedVocabItem, value: unknown) {
    setVocabItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  function handleRemoveItem(id: string) {
    setVocabItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Input Control Box */}
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chủ đề từ vựng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập chủ đề (e.g. Solar System, Animals)"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cấp độ chuẩn CEFR
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CEFR_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCefrLevel(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    cefrLevel === level
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số lượng từ: <span className="text-indigo-600 font-bold">{count}</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
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
            placeholder="e.g. Tập trung vào các danh từ khoa học đời sống"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Tự động sinh từ vựng, phiên âm IPA, giải nghĩa tiếng Việt, câu ví dụ và distractors
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
            Tạo từ vựng bằng AI
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Generated Cards */}
      {vocabItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Kết quả sinh ({vocabItems.length} từ) — Có thể chỉnh sửa trực tiếp trước khi xuất
            </h3>
            <button
              type="button"
              onClick={() => setIsPublishOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <Gamepad2 className="size-4" />
              Xuất sang Game
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vocabItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="size-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                    aria-label="Xoá thẻ"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-0.5">Tiếng Anh</label>
                    <input
                      type="text"
                      value={item.english}
                      onChange={(e) => handleItemChange(item.id, 'english', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-0.5">Tiếng Việt</label>
                    <input
                      type="text"
                      value={item.vietnamese}
                      onChange={(e) => handleItemChange(item.id, 'vietnamese', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-0.5">Phiên âm IPA</label>
                    <input
                      type="text"
                      value={item.phonetic}
                      onChange={(e) => handleItemChange(item.id, 'phonetic', e.target.value)}
                      className="w-full px-2 py-1 text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-0.5">Emoji</label>
                    <input
                      type="text"
                      value={item.emoji}
                      onChange={(e) => handleItemChange(item.id, 'emoji', e.target.value)}
                      className="w-full px-2 py-1 text-xs text-center bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium mb-0.5">Cấp độ</label>
                    <span className="block px-2 py-1 text-xs font-bold text-center bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      {item.cefrLevel}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-0.5">Ví dụ</label>
                  <input
                    type="text"
                    value={item.exampleSentence}
                    onChange={(e) => handleItemChange(item.id, 'exampleSentence', e.target.value)}
                    className="w-full px-2.5 py-1 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Modal */}
      <AiPublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        vocabItems={vocabItems}
      />
    </div>
  )
}
