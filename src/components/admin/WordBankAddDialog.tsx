// src/components/admin/WordBankAddDialog.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react'
import { createWordBankWordAction } from '@/app/actions/word-bank'
import type { WordBankItem, CefrLevel, PartOfSpeech } from '@/types/word-bank'
import { CEFR_LEVELS, PARTS_OF_SPEECH } from '@/types/word-bank'

interface WordBankAddDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newWord: WordBankItem) => void
}

export function WordBankAddDialog({ isOpen, onClose, onSuccess }: WordBankAddDialogProps) {
  const [english, setEnglish] = useState('')
  const [vietnamese, setVietnamese] = useState('')
  const [phonetic, setPhonetic] = useState('')
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun')
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>('A1')
  const [topic, setTopic] = useState('general')
  const [emoji, setEmoji] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')
  const [exampleTranslation, setExampleTranslation] = useState('')
  const [distractorsStr, setDistractorsStr] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!english.trim()) {
      setErrorMessage('Vui lòng nhập từ tiếng Anh')
      return
    }
    if (!vietnamese.trim()) {
      setErrorMessage('Vui lòng nhập nghĩa tiếng Việt')
      return
    }

    const distractors = distractorsStr
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0)

    startTransition(async () => {
      const res = await createWordBankWordAction({
        english: english.trim(),
        vietnamese: vietnamese.trim(),
        phonetic: phonetic.trim() || undefined,
        partOfSpeech,
        cefrLevel,
        topic: topic.trim() || 'general',
        emoji: emoji.trim() || undefined,
        exampleSentence: exampleSentence.trim() || undefined,
        exampleTranslation: exampleTranslation.trim() || undefined,
        distractors,
      })

      if (!res.success || !res.data) {
        setErrorMessage(res.error || 'Không thể tạo từ vựng')
        return
      }

      onSuccess(res.data)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Plus className="size-5 text-indigo-600" /> Thêm từ mới vào Ngân hàng từ
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Từ tiếng Anh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                placeholder="e.g. Telescope"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nghĩa tiếng Việt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={vietnamese}
                onChange={(e) => setVietnamese(e.target.value)}
                placeholder="e.g. Kính thiên văn"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phiên âm IPA</label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="/ˈtel.ɪ.skəʊp/"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Từ loại</label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {PARTS_OF_SPEECH.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cấp độ CEFR</label>
              <select
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value as CefrLevel)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. space, science"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Emoji minh họa</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🔭"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Câu ví dụ tiếng Anh</label>
            <input
              type="text"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="We looked at the stars through a telescope."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dịch nghĩa câu ví dụ</label>
            <input
              type="text"
              value={exampleTranslation}
              onChange={(e) => setExampleTranslation(e.target.value)}
              placeholder="Chúng tôi đã ngắm các ngôi sao qua kính thiên văn."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Các lựa chọn gây nhiễu (Distractors, phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={distractorsStr}
              onChange={(e) => setDistractorsStr(e.target.value)}
              placeholder="Kính lúp, Ống nhòm, Máy ảnh"
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Lưu từ vựng
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
