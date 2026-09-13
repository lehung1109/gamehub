'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Swords, Sparkles } from 'lucide-react'
import { useStudentSession } from '@/contexts/StudentSessionContext'
import { createDuelRoomAction } from '@/app/actions/duels'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CreateDuelModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (code: string) => void
}

const AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐰', '🐸', '🦄', '🚀']

const TOPICS = [
  { id: 'mixed', label: 'Tổng hợp' },
  { id: 'animals', label: 'Động vật' },
  { id: 'fruits', label: 'Hoa quả' },
  { id: 'school', label: 'Trường học' },
  { id: 'body-parts', label: 'Cơ thể' },
  { id: 'family', label: 'Gia đình' },
]

const QUESTION_COUNTS = [5, 7, 10]

export function CreateDuelModal(props: CreateDuelModalProps) {
  if (!props.isOpen) {
    return null
  }

  return <CreateDuelModalContent {...props} />
}

function CreateDuelModalContent({ onClose, onCreated }: CreateDuelModalProps) {
  const router = useRouter()
  const { session } = useStudentSession()
  const defaultPlayerName =
    session?.studentName || (session as { name?: string } | null)?.name || ''

  const [playerName, setPlayerName] = useState(defaultPlayerName)
  const [avatar, setAvatar] = useState('🦊')
  const [topic, setTopic] = useState('mixed')
  const [questionCount, setQuestionCount] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = playerName.trim()
    if (!trimmedName) {
      setError('Vui lòng nhập tên người chơi')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await createDuelRoomAction({
        playerName: trimmedName,
        avatar,
        topic,
        questionCount,
      })

      if (res.success && res.data?.code) {
        onCreated?.(res.data.code)
        router.push(`/duel/${res.data.code}`)
        onClose()
      } else {
        setError(res.error || 'Không thể tạo phòng thách đấu')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo phòng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-duel-title"
      data-testid="create-duel-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-7 overflow-hidden text-card-foreground">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 size-36 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <Swords className="size-6" />
          </div>
          <div>
            <h2 id="create-duel-title" className="text-xl sm:text-2xl font-black tracking-tight">
              Tạo phòng thách đấu
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Mời bạn bè so tài tiếng Anh trực tiếp thời gian thực!
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Player Name */}
          <div>
            <label
              htmlFor="create-player-name"
              className="block text-xs sm:text-sm font-bold text-foreground mb-1.5"
            >
              Tên đấu thủ của bạn
            </label>
            <input
              id="create-player-name"
              type="text"
              data-testid="player-name-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              maxLength={20}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/40 border border-border focus:border-rose-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm sm:text-base font-semibold transition-all"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-foreground mb-1.5">
              Chọn Avatar đại diện
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={cn(
                    'size-11 sm:size-12 rounded-2xl text-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border',
                    avatar === emoji
                      ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30 scale-105'
                      : 'bg-muted/40 border-border hover:bg-muted'
                  )}
                  aria-label={`Chọn avatar ${emoji}`}
                >
                  <span>{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-foreground mb-1.5">
              Chủ đề từ vựng
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOPICS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTopic(item.id)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border text-center transition-all',
                    topic === item.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-foreground mb-1.5">
              Số lượng câu hỏi
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center',
                    questionCount === count
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {count} câu
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              data-testid="create-duel-submit"
              disabled={isLoading || !playerName.trim()}
              className="w-full py-3 sm:py-3.5 rounded-2xl bg-linear-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-600/30 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 animate-spin" /> Đang tạo phòng...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Swords className="size-5" /> Tạo phòng &amp; Lấy mã
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
