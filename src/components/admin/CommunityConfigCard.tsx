'use client'

import React, { useState, useTransition } from 'react'
import {
  Heart,
  Copy,
  Trash2,
  Calendar,
  User,
  Check,
  Loader2,
  Tag,
} from 'lucide-react'

import type { CommunitySharedConfig } from '@/types/community'
import {
  toggleLikeCommunityConfigAction,
  cloneCommunityConfigAction,
  deleteCommunityConfigAction,
} from '@/app/actions/community'

export interface CommunityConfigCardProps {
  config: CommunitySharedConfig
  currentUserId?: string
  onLikeToggle?: (id: string, isLiked: boolean, newCount: number) => void
  onCloned?: (newConfigId: string) => void
  onDeleted?: (id: string) => void
}

const GAME_NAMES: Record<string, { nameVi: string; emoji: string }> = {
  flashcard: { nameVi: 'Thẻ từ vựng', emoji: '🎴' },
  alphabet: { nameVi: 'Bảng chữ cái', emoji: '🔤' },
  listening: { nameVi: 'Luyện nghe', emoji: '🎧' },
  spelling: { nameVi: 'Chính tả', emoji: '✍️' },
  'numbers-colors': { nameVi: 'Số & Màu sắc', emoji: '🎨' },
  sentences: { nameVi: 'Ghép câu', emoji: '🧩' },
  reading: { nameVi: 'Đọc hiểu', emoji: '📖' },
  typing: { nameVi: 'Gõ phím', emoji: '⌨️' },
  roleplay: { nameVi: 'Hội thoại', emoji: '🎭' },
  'memory-match': { nameVi: 'Trí nhớ', emoji: '🧠' },
  'word-search': { nameVi: 'Tìm từ', emoji: '🔍' },
  wordle: { nameVi: 'Đoán từ', emoji: '🟩' },
  'word-connect': { nameVi: 'Nối từ', emoji: '🔗' },
  'odd-one-out': { nameVi: 'Từ khác biệt', emoji: '🧐' },
  'grammar-detective': { nameVi: 'Ngữ pháp', emoji: '🕵️' },
  'vocab-defense': { nameVi: 'Thủ thành', emoji: '🛡️' },
  crossword: { nameVi: 'Ô chữ', emoji: '📝' },
  'falling-words': { nameVi: 'Mưa từ', emoji: '🌧️' },
  hangman: { nameVi: 'Treo cổ', emoji: '🎯' },
  pronunciation: { nameVi: 'Phát âm', emoji: '🎙️' },
}

export function CommunityConfigCard({
  config,
  currentUserId,
  onLikeToggle,
  onCloned,
  onDeleted,
}: CommunityConfigCardProps) {
  const [likesCount, setLikesCount] = useState(config.likesCount)
  const [isLiked, setIsLiked] = useState(Boolean(config.isLikedByMe))
  const [cloneCount, setCloneCount] = useState(config.cloneCount)
  const [clonedSuccess, setClonedSuccess] = useState(false)
  const [isLiking, startLikeTransition] = useTransition()
  const [isCloning, startCloneTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const isAuthor = Boolean(currentUserId && currentUserId === config.authorId)
  const gameInfo = GAME_NAMES[config.gameId] || { nameVi: config.gameId, emoji: '🎮' }

  function handleLike() {
    startLikeTransition(async () => {
      // Optimistic update
      const nextLiked = !isLiked
      const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1)
      setIsLiked(nextLiked)
      setLikesCount(nextCount)

      const res = await toggleLikeCommunityConfigAction(config.id, isLiked)
      if (res.success && res.data) {
        setLikesCount(res.data.likesCount)
        setIsLiked(res.data.isLiked)
        onLikeToggle?.(config.id, res.data.isLiked, res.data.likesCount)
      } else {
        // Rollback
        setIsLiked(isLiked)
        setLikesCount(likesCount)
      }
    })
  }

  function handleClone() {
    startCloneTransition(async () => {
      const res = await cloneCommunityConfigAction(config.id)
      if (res.success && res.data) {
        setCloneCount((prev) => prev + 1)
        setClonedSuccess(true)
        onCloned?.(res.data.newConfigId)
        setTimeout(() => setClonedSuccess(false), 3000)
      } else {
        alert(res.error || 'Không thể sao chép cấu hình này')
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài chia sẻ "${config.title}" khỏi thư viện cộng đồng?`)) {
      return
    }

    startDeleteTransition(async () => {
      const res = await deleteCommunityConfigAction(config.id)
      if (res.success) {
        onDeleted?.(config.id)
      } else {
        alert(res.error || 'Không thể xóa bài chia sẻ')
      }
    })
  }

  // Format date readable
  const formattedDate = new Date(config.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Badges */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900">
            <span className="text-xl">{gameInfo.emoji}</span>
            <span className="text-base font-bold">{gameInfo.nameVi}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-base font-black">
              {config.cefrLevel}
            </span>
            <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-base font-bold">
              {config.topic}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {config.title}
          </h3>
          {config.description && (
            <p className="text-base text-slate-600 line-clamp-2 font-medium">
              {config.description}
            </p>
          )}
        </div>

        {/* Tags */}
        {config.tags && config.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {config.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-base font-medium flex items-center gap-1"
              >
                <Tag className="size-4 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author & Date metadata */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <User className="size-4 text-slate-400" />
            <span className="text-slate-800 font-bold">{config.authorName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
        {/* Left: Like & Clone count */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Thích"
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-base transition-colors ${
              isLiked
                ? 'bg-rose-50 text-rose-600'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart
              className={`size-5 ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-base" title="Lượt sao chép">
            <Copy className="size-4 text-slate-400" />
            <span>{cloneCount}</span>
          </div>
        </div>

        {/* Right: Clone & Delete buttons */}
        <div className="flex items-center gap-2">
          {isAuthor && (
            <button
              type="button"
              aria-label="Xóa bài chia sẻ"
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Xóa bài chia sẻ"
            >
              {isDeleting ? (
                <Loader2 className="size-5 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="size-5" />
              )}
            </button>
          )}

          <button
            type="button"
            aria-label="Sao chép"
            onClick={handleClone}
            disabled={isCloning || clonedSuccess}
            className={`px-4 py-2 rounded-xl font-black text-base shadow-xs transition-all flex items-center gap-2 ${
              clonedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isCloning ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Đang chép...</span>
              </>
            ) : clonedSuccess ? (
              <>
                <Check className="size-5" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="size-5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
