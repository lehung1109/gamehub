// src/components/admin/AiPublishModal.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Gamepad2, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import type { GameId } from '@/types/config'
import type {
  AiGeneratedVocabItem,
  AiGeneratedReadingPassage,
  AiGeneratedGrammarItem,
} from '@/types/ai-generator'
import { publishAiContentToGameConfigAction } from '@/app/actions/ai-generator'

interface AiPublishModalProps {
  isOpen: boolean
  onClose: () => void
  vocabItems?: AiGeneratedVocabItem[]
  readingPassage?: AiGeneratedReadingPassage
  grammarItems?: AiGeneratedGrammarItem[]
  onSuccess?: (configId: string, gameId: string) => void
}

interface GameOption {
  id: GameId
  nameVi: string
  emoji: string
  description: string
}

const VOCAB_GAME_OPTIONS: GameOption[] = [
  { id: 'flashcard', nameVi: 'Thẻ Từ vựng (Flashcard)', emoji: '🎴', description: 'Luyện tập qua thẻ lật với phát âm chuẩn' },
  { id: 'word-search', nameVi: 'Tìm từ Ô chữ (Word Search)', emoji: '🔍', description: 'Lưới tìm từ rèn luyện nhận diện từ vựng' },
  { id: 'falling-words', nameVi: 'Mưa từ (Falling Words)', emoji: '🌧️', description: 'Bắt từ rơi kiểm tra phản xạ nhanh' },
  { id: 'crossword', nameVi: 'Giải ô chữ (Crossword)', emoji: '🧩', description: 'Ghép từ theo gợi ý định nghĩa' },
  { id: 'wordle', nameVi: 'Đoán từ (Wordle)', emoji: '🟩', description: 'Thử thách đoán từ vựng theo chữ cái' },
]

export function AiPublishModal({
  isOpen,
  onClose,
  vocabItems,
  readingPassage,
  grammarItems,
  onSuccess,
}: AiPublishModalProps) {
  const router = useRouter()
  const [selectedGameId, setSelectedGameId] = useState<GameId>(() => {
    if (readingPassage) return 'reading'
    if (grammarItems && grammarItems.length > 0) return 'grammar-detective'
    return 'flashcard'
  })
  const [configName, setConfigName] = useState(() => {
    if (readingPassage) return `Bài đọc: ${readingPassage.title}`
    if (vocabItems && vocabItems.length > 0) return `Bộ từ: ${vocabItems[0].topic}`
    if (grammarItems && grammarItems.length > 0) return 'Bài tập Thám tử Ngữ pháp'
    return 'Cấu hình mới từ AI'
  })
  const [saveToWordBank, setSaveToWordBank] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [createdConfigId, setCreatedConfigId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const gameOptions = readingPassage
    ? [{ id: 'reading' as GameId, nameVi: 'Bài Đọc hiểu (Reading Comprehension)', emoji: '📖', description: 'Luyện kỹ năng đọc và trả lời câu hỏi trắc nghiệm' }]
    : grammarItems && grammarItems.length > 0
    ? [{ id: 'grammar-detective' as GameId, nameVi: 'Thám tử Ngữ pháp (Grammar Detective)', emoji: '🕵️', description: 'Tìm lỗi sai ngữ pháp trong câu' }]
    : VOCAB_GAME_OPTIONS

  function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!configName.trim()) {
      setErrorMessage('Vui lòng nhập tên cấu hình game')
      return
    }

    startTransition(async () => {
      const res = await publishAiContentToGameConfigAction({
        gameId: selectedGameId,
        name: configName.trim(),
        vocabItems,
        readingPassage,
        grammarItems,
        saveToWordBank: Boolean(saveToWordBank && vocabItems && vocabItems.length > 0),
      })

      if (!res.success || !res.configId) {
        setErrorMessage(res.error || 'Không thể xuất cấu hình game')
        return
      }

      setCreatedConfigId(res.configId)
      if (onSuccess) {
        onSuccess(res.configId, selectedGameId)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Gamepad2 className="size-5" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Xuất nội dung sang Game (1-Click Publish)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {createdConfigId ? (
          <div className="py-6 text-center space-y-4">
            <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Tạo cấu hình game thành công!</h3>
              <p className="text-xs text-slate-500">
                Cấu hình đã sẵn sàng cho học sinh chơi hoặc tạo mã lớp học.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  router.push(`/admin/games/${selectedGameId}`)
                  onClose()
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Đến trang quản lý game
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="mt-4 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên bộ cấu hình <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Nhập tên cấu hình (e.g. Flashcards Hành Tinh Lớp 3A)"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Chọn Game đích
              </label>
              <div className="space-y-2">
                {gameOptions.map((opt) => {
                  const isSelected = selectedGameId === opt.id
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetGame"
                        checked={isSelected}
                        onChange={() => setSelectedGameId(opt.id)}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-800">
                          <span>{opt.emoji}</span>
                          <span>{opt.nameVi}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {vocabItems && vocabItems.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={saveToWordBank}
                    onChange={(e) => setSaveToWordBank(e.target.checked)}
                    className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Đồng thời lưu các từ vựng này vào Ngân hàng từ tập trung</span>
                </label>
              </div>
            )}

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
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Xác nhận tạo Game
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
