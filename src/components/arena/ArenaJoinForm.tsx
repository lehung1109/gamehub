// src/components/arena/ArenaJoinForm.tsx

'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Swords, ArrowRight, AlertCircle, Loader2 } from 'lucide-react'
import { joinLiveArenaAction } from '@/app/actions/arena'

interface ArenaJoinFormProps {
  initialPin?: string
}

const AVATARS = ['🦊', '🐼', '🐰', '🐯', '🦁', '🐸', '🦄', '🐶']

export function ArenaJoinForm({ initialPin = '' }: ArenaJoinFormProps) {
  const router = useRouter()
  const [pinCode, setPinCode] = useState(initialPin)
  const [studentName, setStudentName] = useState('')
  const [avatar, setAvatar] = useState('🦊')
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!pinCode.trim()) {
      setErrorMessage('Vui lòng nhập mã PIN phòng đấu')
      return
    }

    if (!studentName.trim()) {
      setErrorMessage('Vui lòng nhập tên của bạn')
      return
    }

    startTransition(async () => {
      const res = await joinLiveArenaAction({
        pinCode: pinCode.trim(),
        studentName: studentName.trim(),
        avatar,
      })

      if (!res.success || !res.participant) {
        setErrorMessage(res.error || 'Không thể tham gia phòng đấu')
        return
      }

      router.push(
        `/arena/${pinCode.trim()}?studentName=${encodeURIComponent(
          studentName.trim()
        )}&avatar=${encodeURIComponent(avatar)}`
      )
    })
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
      <div className="text-center space-y-2 mb-6">
        <div className="size-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/20">
          <Swords className="size-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Đấu Trường Trực Tiếp
        </h1>
        <p className="text-xs text-slate-500">
          Nhập mã PIN từ màn hình máy chiếu của thầy cô để tham gia tranh tài!
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Mã PIN phòng (Game PIN)
          </label>
          <input
            type="text"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="123456"
            maxLength={10}
            className="w-full text-center tracking-widest font-mono text-2xl font-black px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-hidden transition-all text-slate-900"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tên hiển thị (Nickname)
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Nhập tên của em (e.g. Bé An)"
            maxLength={30}
            className="w-full px-4 py-3 text-base font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-hidden transition-all text-slate-900"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Chọn linh vật đại diện
          </label>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`py-2 text-2xl rounded-xl border-2 transition-all flex items-center justify-center ${
                  avatar === av
                    ? 'border-indigo-600 bg-indigo-50 shadow-xs scale-105'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <span>Vào Đấu Trường</span>
              <ArrowRight className="size-5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
