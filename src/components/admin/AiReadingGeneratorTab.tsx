// src/components/admin/AiReadingGeneratorTab.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { BookOpen, Sparkles, Loader2, Gamepad2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { AiGeneratedReadingPassage } from '@/types/ai-generator'
import type { CefrLevel } from '@/types/word-bank'
import { CEFR_LEVELS } from '@/types/word-bank'
import { generateAiReadingAction } from '@/app/actions/ai-generator'
import { AiPublishModal } from './AiPublishModal'

export function AiReadingGeneratorTab() {
  const [topic, setTopic] = useState('nature')
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>('A2')
  const [questionCount, setQuestionCount] = useState(3)
  const [customPrompt, setCustomPrompt] = useState('')
  const [readingPassage, setReadingPassage] = useState<AiGeneratedReadingPassage | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPublishOpen, setIsPublishOpen] = useState(false)
  const [isGenerating, startTransition] = useTransition()

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!topic.trim()) {
      setErrorMessage('Vui lòng nhập chủ đề bài đọc')
      return
    }

    startTransition(async () => {
      const res = await generateAiReadingAction({
        topic: topic.trim(),
        cefrLevel,
        questionCount,
        customPrompt: customPrompt.trim() || undefined,
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Không thể tạo bài đọc bằng AI')
        return
      }

      setReadingPassage(res.data)
    })
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chủ đề bài đọc <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập chủ đề (e.g. nature, daily life)"
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
              Số câu hỏi: <span className="text-indigo-600 font-bold">{questionCount}</span>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
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
            placeholder="e.g. Ngữ cảnh lớp học, câu chuyện phiêu lưu vui nhộn"
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Tự động sinh bài đọc trọn vẹn, bản dịch đối chiếu và các câu hỏi trắc nghiệm kèm giải thích
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
            Tạo bài đọc bằng AI
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {readingPassage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              Bài đọc được tạo — Cấp độ {readingPassage.cefrLevel}
            </h3>
            <button
              type="button"
              onClick={() => setIsPublishOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <Gamepad2 className="size-4" />
              Xuất sang Game Reading
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <BookOpen className="size-5 text-indigo-600" />
              <h2 className="text-lg font-black text-slate-900">{readingPassage.title}</h2>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">Đoạn văn tiếng Anh</h4>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-serif">
                {readingPassage.passage}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">Bản dịch tiếng Việt</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
                {readingPassage.vietnameseTranslation}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">
                Câu hỏi Đọc hiểu ({readingPassage.questions.length})
              </h4>
              <div className="space-y-3">
                {readingPassage.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, i) => {
                        const isCorrect = opt === q.correctAnswer
                        return (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <span className="size-3.5 rounded-full border border-slate-300 shrink-0" />
                            )}
                            <span>{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-slate-500 italic pt-1">
                        Giải thích: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AiPublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        readingPassage={readingPassage || undefined}
      />
    </div>
  )
}
