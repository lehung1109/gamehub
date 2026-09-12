// src/components/admin/WordBankList.tsx

'use client'

import React, { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { WordBankItem, CefrLevel } from '@/types/word-bank'
import { WordBankFilterBar } from './WordBankFilterBar'
import { WordBankAddDialog } from './WordBankAddDialog'
import { SpeakButton } from '@/components/games/SpeakButton'
import { deleteWordBankWordAction } from '@/app/actions/word-bank'

interface WordBankListProps {
  initialWords: WordBankItem[]
  totalCount: number
  currentUserId?: string
}

const CEFR_COLORS: Record<CefrLevel, { bg: string; text: string; border: string }> = {
  'Pre-A1': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  A1: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  A2: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  B1: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  B2: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

export function WordBankList({ initialWords, totalCount, currentUserId }: WordBankListProps) {
  const [words, setWords] = useState<WordBankItem[]>(initialWords)
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('all')
  const [cefrLevel, setCefrLevel] = useState<CefrLevel | 'all'>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  // Extract unique topics from words
  const availableTopics = useMemo(() => {
    const set = new Set<string>()
    words.forEach((w) => {
      if (w.topic) set.add(w.topic.toLowerCase())
    })
    return Array.from(set).sort()
  }, [words])

  // Filter words
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      if (search.trim()) {
        const term = search.toLowerCase().trim()
        const matchesEnglish = word.english.toLowerCase().includes(term)
        const matchesVietnamese = word.vietnamese.toLowerCase().includes(term)
        if (!matchesEnglish && !matchesVietnamese) return false
      }

      if (topic !== 'all' && word.topic.toLowerCase() !== topic) {
        return false
      }

      if (cefrLevel !== 'all' && word.cefrLevel !== cefrLevel) {
        return false
      }

      return true
    })
  }, [words, search, topic, cefrLevel])

  function handleWordAdded(newWord: WordBankItem) {
    setWords((prev) => [newWord, ...prev])
  }

  function handleDeleteWord(wordId: string) {
    if (!confirm('Bạn có chắc muốn xoá từ này khỏi Ngân hàng từ?')) {
      return
    }

    setIsDeletingId(wordId)
    setErrorMessage('')

    startTransition(async () => {
      const res = await deleteWordBankWordAction(wordId)
      setIsDeletingId(null)
      if (!res.success) {
        setErrorMessage(res.error || 'Không thể xoá từ vựng')
        return
      }

      setWords((prev) => prev.filter((w) => w.id !== wordId))
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <BookOpen className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">Kho Từ vựng</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {totalCount} từ
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ngân hàng từ vựng tập trung dùng chung cho tất cả các mini-games
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/ai-generator"
            className="px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors flex items-center gap-2"
          >
            <Sparkles className="size-4 text-indigo-600" />
            AI Content Studio
          </Link>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="size-4" />
            Thêm từ mới
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <WordBankFilterBar
        search={search}
        onSearchChange={setSearch}
        topic={topic}
        onTopicChange={setTopic}
        cefrLevel={cefrLevel}
        onCefrChange={setCefrLevel}
        availableTopics={availableTopics}
      />

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center py-16 px-4">
          <div className="size-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-base font-bold text-slate-700">Chưa có từ vựng nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Không tìm thấy từ vựng phù hợp với bộ lọc hiện tại. Hãy tạo từ mới hoặc sử dụng AI Studio để tự động tạo bộ từ vựng theo chủ đề.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => {
            const cefrStyle = CEFR_COLORS[word.cefrLevel] || CEFR_COLORS.A1
            const canDelete = !word.isSystem && (!currentUserId || word.createdBy === currentUserId)

            return (
              <div
                key={word.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {word.emoji && <span className="text-xl">{word.emoji}</span>}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {word.english}
                        </h3>
                        {word.phonetic && (
                          <span className="text-xs font-mono text-slate-400 block">
                            {word.phonetic}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <SpeakButton text={word.english} size="sm" />
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold border ${cefrStyle.bg} ${cefrStyle.text} ${cefrStyle.border}`}
                      >
                        {word.cefrLevel}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className="text-sm font-semibold text-indigo-950">{word.vietnamese}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600 font-medium capitalize">
                        {word.partOfSpeech}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600 font-medium capitalize">
                        {word.topic}
                      </span>
                      {word.isSystem && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1 border border-emerald-200">
                          <Lock className="size-3" /> Hệ thống
                        </span>
                      )}
                    </div>
                  </div>

                  {word.exampleSentence && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 border border-slate-100">
                      <p className="text-slate-700 font-medium italic">
                        &ldquo;{word.exampleSentence}&rdquo;
                      </p>
                      {word.exampleTranslation && (
                        <p className="text-slate-500">&ldquo;{word.exampleTranslation}&rdquo;</p>
                      )}
                    </div>
                  )}

                  {word.distractors && word.distractors.length > 0 && (
                    <div className="mt-2.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-400">Gây nhiễu: </span>
                      {word.distractors.join(', ')}
                    </div>
                  )}
                </div>

                {/* Footer / Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteWord(word.id)}
                      disabled={isDeletingId === word.id}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 p-1 rounded-md hover:bg-rose-50 transition-colors disabled:opacity-50"
                      aria-label="Xoá từ vựng"
                    >
                      {isDeletingId === word.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                      Xoá
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Dialog */}
      <WordBankAddDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleWordAdded}
      />
    </div>
  )
}
