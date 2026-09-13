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

    const trimmedPin = pinCode.trim()
    if (!trimmedPin) {
      setErrorMessage('Vui lòng nhập mã PIN phòng đấu')
      return
    }

    if (trimmedPin.length !== 6) {
      setErrorMessage('Mã PIN phải gồm đúng 6 chữ số')
      return
    }

    const trimmedName = studentName.trim()
    if (!trimmedName) {
      setErrorMessage('Vui lòng nhập tên của bạn')
      return
    }

    startTransition(async () => {
      const res = await joinLiveArenaAction({
        pinCode: trimmedPin,
        studentName: trimmedName,
        avatar,
      })

      if (!res.success || !res.participant) {
        setErrorMessage(res.error || 'Không thể tham gia phòng đấu')
        return
      }

      router.push(
        `/arena/${trimmedPin}?studentName=${encodeURIComponent(
          trimmedName
        )}&avatar=${encodeURIComponent(avatar)}`
      )
    })
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
      <div className="text-center space-y-3 mb-6">
        <div className="size-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/20">
          <Swords className="size-9" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Tham Gia Đấu Trường Trực Tiếp
        </h1>
        <p className="text-base text-slate-600">
          Nhập mã PIN từ màn hình máy chiếu của thầy cô để tham gia tranh tài!
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-base rounded-2xl flex items-center gap-3 font-semibold">
          <AlertCircle className="size-6 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleJoin} className="space-y-5">
        <div>
          <label className="block text-base font-bold text-slate-800 uppercase tracking-wider mb-2">
            Mã PIN phòng (Game PIN)
          </label>
          <input
            type="text"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="123456"
            maxLength={10}
            className="w-full text-center tracking-widest font-mono text-3xl font-black px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-hidden transition-all text-slate-900"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-slate-800 uppercase tracking-wider mb-2">
            Tên hiển thị (Nickname)
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Nhập tên hoặc biệt danh của em"
            maxLength={30}
            className="w-full px-4 py-3.5 text-lg font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-hidden transition-all text-slate-900"
          />
        </div>

        <div>
          <label className="block text-base font-bold text-slate-800 uppercase tracking-wider mb-2">
            Chọn linh vật đại diện
          </label>
          <div className="grid grid-cols-4 gap-2.5 pt-1">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setAvatar(av)}
                className={`py-3 text-3xl rounded-2xl border-2 transition-all flex items-center justify-center cursor-pointer ${
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
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-lg shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-6 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <>
              <span>Vào Phòng Đấu</span>
              <ArrowRight className="size-6" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
