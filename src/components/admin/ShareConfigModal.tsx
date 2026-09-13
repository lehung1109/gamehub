'use client'

import React, { useState, useTransition } from 'react'
import {
  Share2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

import type { CefrLevel } from '@/types/word-bank'
import { shareConfigToCommunityAction } from '@/app/actions/community'

export interface ShareConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  myConfigs: Array<{ id: string; name: string; game_id: string; created_at: string }>
}

const CEFR_OPTIONS: CefrLevel[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2']

export function ShareConfigModal({
  isOpen,
  onClose,
  onSuccess,
  myConfigs,
}: ShareConfigModalProps) {
  const [selectedConfigId, setSelectedConfigId] = useState(
    myConfigs.length > 0 ? myConfigs[0].id : ''
  )
  const [title, setTitle] = useState(myConfigs.length > 0 ? myConfigs[0].name : '')
  const [description, setDescription] = useState('')
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>('A1')
  const [topic, setTopic] = useState('general')
  const [tagsString, setTagsString] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, startTransition] = useTransition()

  if (!isOpen) return null

  function handleConfigChange(configId: string) {
    setSelectedConfigId(configId)
    const found = myConfigs.find((c) => c.id === configId)
    if (found) {
      setTitle(found.name)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!selectedConfigId) {
      setErrorMessage('Vui lòng chọn một cấu hình bài học của bạn')
      return
    }

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề bài học chia sẻ')
      return
    }

    const tags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    startTransition(async () => {
      const res = await shareConfigToCommunityAction({
        configId: selectedConfigId,
        title: title.trim(),
        description: description.trim() || undefined,
        cefrLevel,
        topic: topic.trim() || 'general',
        tags,
      })

      if (res.success) {
        setSuccessMessage('Đã chia sẻ cấu hình thành công lên Thư viện cộng đồng!')
        onSuccess?.()
        setTimeout(() => {
          onClose()
        }, 1200)
      } else {
        setErrorMessage(res.error || 'Lỗi khi chia sẻ cấu hình lên cộng đồng')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-linear-to-r from-purple-50 to-indigo-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Share2 className="size-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Chia sẻ cấu hình lên Cộng đồng
              </h2>
              <p className="text-base text-slate-600 font-medium">
                Lan tỏa bài giảng hay và bộ từ vựng hữu ích đến đồng nghiệp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-base font-semibold">
              <AlertCircle className="size-6 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-base font-semibold">
              <CheckCircle2 className="size-6 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Select personal config */}
          <div className="space-y-2">
            <label
              htmlFor="share-select-config"
              className="block text-base font-bold text-slate-800"
            >
              Chọn bài học cần chia sẻ:
            </label>
            {myConfigs.length === 0 ? (
              <p className="text-base text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200 font-medium">
                Bạn chưa có cấu hình bài học nào trong kho riêng. Hãy tạo bài giảng tại trang quản trị trước khi chia sẻ.
              </p>
            ) : (
              <select
                id="share-select-config"
                value={selectedConfigId}
                onChange={(e) => handleConfigChange(e.target.value)}
                className="w-full text-base font-semibold p-4 border border-slate-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {myConfigs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.game_id})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="share-title-input"
              className="block text-base font-bold text-slate-800"
            >
              Tiêu đề bài chia sẻ:
            </label>
            <input
              id="share-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Động vật rừng rậm Rainforest Animals A1..."
              className="w-full text-base font-semibold p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="share-description-input"
              className="block text-base font-bold text-slate-800"
            >
              Mô tả bài học (tùy chọn):
            </label>
            <textarea
              id="share-description-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu nội dung bài giảng, độ tuổi thích hợp hoặc lưu ý khi giảng dạy..."
              className="w-full text-base font-medium p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          {/* CEFR & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="share-cefr-input"
                className="block text-base font-bold text-slate-800"
              >
                Trình độ CEFR:
              </label>
              <select
                id="share-cefr-input"
                value={cefrLevel}
                onChange={(e) => setCefrLevel(e.target.value as CefrLevel)}
                className="w-full text-base font-semibold p-4 border border-slate-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CEFR_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="share-topic-input"
                className="block text-base font-bold text-slate-800"
              >
                Chủ đề:
              </label>
              <input
                id="share-topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: animals, travel, weather..."
                className="w-full text-base font-semibold p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label
              htmlFor="share-tags-input"
              className="block text-base font-bold text-slate-800"
            >
              Thẻ từ khóa (phân cách bằng dấu phẩy):
            </label>
            <input
              id="share-tags-input"
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="kids, starter, vocab, listening..."
              className="w-full text-base font-medium p-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-base transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || myConfigs.length === 0}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-base shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Đang chia sẻ...
                </>
              ) : (
                'Chia sẻ ngay'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
