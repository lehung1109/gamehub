// src/components/admin/arena/TeacherArenaCreate.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Swords, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import type { CefrLevel } from '@/types/word-bank'
import { CEFR_LEVELS } from '@/types/word-bank'
import type { ArenaQuestion } from '@/types/arena'
import { generateOfflineVocabulary } from '@/lib/ai-generator'
import { createLiveArenaAction } from '@/app/actions/arena'

const TOPICS = [
  { id: 'animals', label: 'Động vật (Animals)' },
  { id: 'school', label: 'Trường học (School)' },
  { id: 'nature', label: 'Thiên nhiên (Nature)' },
  { id: 'technology', label: 'Công nghệ (Technology)' },
]

export function TeacherArenaCreate() {
  const router = useRouter()
  const [title, setTitle] = useState('Vòng đấu Từ vựng Lớp học')
  const [topic, setTopic] = useState('animals')
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>('A1')
  const [count, setCount] = useState(5)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề phòng đấu')
      return
    }

    startTransition(async () => {
      // 1. Generate questions from curriculum lexicon
      const vocabItems = generateOfflineVocabulary({
        topic,
        cefrLevel,
        count,
      })

      const questions: ArenaQuestion[] = vocabItems.map((v) => {
        const distractors = v.distractors.slice(0, 3)
        const options = [v.vietnamese, ...distractors].sort(() => Math.random() - 0.5)

        return {
          id: v.id,
          question: `Nghĩa tiếng Việt của "${v.english}" là gì?`,
          options,
          correctAnswer: v.vietnamese,
          explanation: v.exampleSentence
            ? `Ví dụ: "${v.exampleSentence}" (${v.exampleTranslation})`
            : undefined,
          timeLimitSeconds: 15,
          points: 1000,
        }
      })

      // 2. Call server action
      const res = await createLiveArenaAction({
        title: title.trim(),
        gameId: 'flashcard',
        questions,
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Không thể tạo phòng đấu')
        return
      }

      router.push(`/admin/arena/${res.data.id}`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Swords className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tạo Phòng Đấu Trường Trực Tiếp</h1>
          <p className="text-xs text-slate-500">
            Khởi tạo trận đấu thời gian thực kiểu Kahoot cho cả lớp cùng tham gia
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tiêu đề phòng đấu <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Vòng đấu Từ vựng Động vật Lớp 3A"
            className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề từ vựng</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Cấp độ CEFR</label>
            <select
              value={cefrLevel}
              onChange={(e) => setCefrLevel(e.target.value as CefrLevel)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            >
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số lượng câu hỏi trong vòng đấu: <strong className="text-indigo-600">{count}</strong>
          </label>
          <input
            type="range"
            min={3}
            max={15}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            <span>Tạo phòng & Mở sảnh chờ</span>
          </button>
        </div>
      </form>
    </div>
  )
}
