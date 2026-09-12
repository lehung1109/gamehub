'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, LogIn, Sparkles } from 'lucide-react'
import { useStudentSession } from '@/contexts/StudentSessionContext'
import { joinDuelRoomAction } from '@/app/actions/duels'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface JoinDuelModalProps {
  isOpen: boolean
  onClose: () => void
  onJoined?: (code: string) => void
}

const AVATARS = ['🐼', '🐯', '🦁', '🐰', '🦊', '🐸', '🦄', '🚀']

export function JoinDuelModal(props: JoinDuelModalProps) {
  if (!props.isOpen) {
    return null
  }

  return <JoinDuelModalContent {...props} />
}

function JoinDuelModalContent({ onClose, onJoined }: JoinDuelModalProps) {
  const router = useRouter()
  const { session } = useStudentSession()
  const defaultPlayerName =
    session?.studentName || (session as { name?: string } | null)?.name || ''

  const [code, setCode] = useState('')
  const [playerName, setPlayerName] = useState(defaultPlayerName)
  const [avatar, setAvatar] = useState('🐼')
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCode(raw.slice(0, 8))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    const cleanName = playerName.trim()

    if (!cleanCode) {
      setError('Vui lòng nhập mã phòng')
      return
    }

    if (!cleanName) {
      setError('Vui lòng nhập tên người chơi')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await joinDuelRoomAction({
        code: cleanCode,
        playerName: cleanName,
        avatar,
      })

      if (res.success && res.data?.code) {
        onJoined?.(res.data.code)
        router.push(`/duel/${res.data.code}`)
        onClose()
      } else {
        setError(res.error || 'Phòng không tồn tại hoặc đã đủ người')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tham gia phòng')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-duel-title"
      data-testid="join-duel-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-7 overflow-hidden text-card-foreground">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 size-36 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
            <LogIn className="size-6" />
          </div>
          <div>
            <h2 id="join-duel-title" className="text-xl sm:text-2xl font-black tracking-tight">
              Tham gia bằng mã
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Nhập mã gồm 6 ký tự do bạn bè chia sẻ để bắt đầu!
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
          {/* Room Code */}
          <div>
            <label
              htmlFor="join-room-code"
              className="block text-xs sm:text-sm font-bold text-foreground mb-1.5"
            >
              Mã phòng (Room Code)
            </label>
            <input
              id="join-room-code"
              type="text"
              data-testid="room-code-input"
              value={code}
              onChange={handleCodeChange}
              placeholder="DUEL12"
              maxLength={8}
              autoFocus
              required
              className="w-full px-4 py-3 rounded-2xl bg-muted/40 border border-border focus:border-indigo-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-center font-mono font-black text-xl sm:text-2xl tracking-widest uppercase transition-all"
            />
          </div>

          {/* Player Name */}
          <div>
            <label
              htmlFor="join-player-name"
              className="block text-xs sm:text-sm font-bold text-foreground mb-1.5"
            >
              Tên đấu thủ của bạn
            </label>
            <input
              id="join-player-name"
              type="text"
              data-testid="join-player-name-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              maxLength={20}
              required
              className="w-full px-4 py-2.5 rounded-2xl bg-muted/40 border border-border focus:border-indigo-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm sm:text-base font-semibold transition-all"
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
                      ? 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                      : 'bg-muted/40 border-border hover:bg-muted'
                  )}
                  aria-label={`Chọn avatar ${emoji}`}
                >
                  <span>{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              data-testid="join-duel-submit"
              disabled={isLoading || !code.trim() || !playerName.trim()}
              className="w-full py-3 sm:py-3.5 rounded-2xl bg-linear-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-600/30 hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="size-4 animate-spin" /> Đang kiểm tra mã...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="size-5" /> Tham gia ngay
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
