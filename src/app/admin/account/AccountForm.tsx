'use client'

import React, { useState, useTransition } from 'react'
import { updatePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export function AccountForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatusMessage(null)

    if (newPassword.length < 8) {
      setStatusMessage({
        type: 'error',
        text: 'Mật khẩu mới phải có ít nhất 8 ký tự',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Xác nhận mật khẩu không khớp',
      })
      return
    }

    startTransition(async () => {
      const res = await updatePassword(newPassword)
      if (res?.error) {
        setStatusMessage({ type: 'error', text: res.error })
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Đổi mật khẩu thành công!',
        })
        setNewPassword('')
        setConfirmPassword('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {statusMessage && (
        <div
          role="alert"
          className={`flex items-start gap-2.5 rounded-lg p-3 text-sm font-medium border animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-password">Mật khẩu mới</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            id="new-password"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <Input
            id="confirm-password"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            className="pl-9"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || !newPassword || !confirmPassword}
        className="bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang cập nhật...
          </>
        ) : (
          'Lưu mật khẩu mới'
        )}
      </Button>
    </form>
  )
}
