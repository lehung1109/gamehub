// src/components/guild/JoinGuildModal.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, X, ArrowRight, AlertCircle } from 'lucide-react'
import { joinGuildByCodeAction } from '@/app/actions/guilds'

interface JoinGuildModalProps {
  isOpen: boolean
  onClose: () => void
  currentStudentId?: string
  currentStudentName?: string
}

export function JoinGuildModal({
  isOpen,
  onClose,
  currentStudentId = 'std-guest',
  currentStudentName = 'Bé Bạn Nhỏ',
}: JoinGuildModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  async function handleJoin() {
    if (!code.trim()) {
      setError('Vui lòng nhập mã bang hội.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await joinGuildByCodeAction(currentStudentId, currentStudentName, code.trim())
      if (res.success && res.data) {
        onClose()
        router.push(`/guilds/${res.data.id}`)
      } else {
        setError(res.error || 'Không tìm thấy bang hội với mã này.')
      }
    } catch {
      setError('Đã có lỗi xảy ra. Em hãy thử lại nhé!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Gia nhập bang hội bằng mã"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
    >
      <div className="bg-white rounded-3xl border-4 border-indigo-400 p-8 w-full max-w-lg shadow-2xl space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ"
          className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-base cursor-pointer transition-all"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-4">
          <div className="size-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-indigo-200">
            <Shield className="size-8 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-950">
              Nhập Mã Bang Hội
            </h3>
            <p className="text-base text-slate-600 font-semibold">
              Nhập mã chia sẻ từ bạn bè hoặc thầy cô (VD: DRAGON-99)
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="guild-code-input" className="block text-base font-bold text-slate-700">
            Mã Bang Hội (Clan Code):
          </label>
          <input
            id="guild-code-input"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            placeholder="VD: DRAGON-99"
            className="w-full px-5 py-4 rounded-2xl border-3 border-slate-300 text-xl font-mono font-black text-slate-900 tracking-wider text-center focus:outline-none focus:border-indigo-600"
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-base font-bold">
              <AlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-base cursor-pointer transition-all"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleJoin}
            disabled={isLoading}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>{isLoading ? 'Đang vào...' : 'Gia Nhập Ngay'}</span>
            <ArrowRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
