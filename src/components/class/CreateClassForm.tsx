'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClassAction, type Classroom } from '@/app/actions/classes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Copy, Plus } from 'lucide-react'

interface CreateClassFormProps {
  onSuccess?: (newClass: Classroom) => void
}

export function CreateClassForm({ onSuccess }: CreateClassFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [createdClass, setCreatedClass] = useState<Classroom | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreatedClass(null)
    setCopied(false)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Vui lòng nhập tên lớp')
      return
    }

    if (trimmedName.length > 200) {
      setError('Tên lớp không được vượt quá 200 ký tự')
      return
    }

    startTransition(async () => {
      try {
        const res = await createClassAction({ name: trimmedName })
        if (res.error) {
          setError(res.error)
        } else if (res.data) {
          setCreatedClass(res.data)
          setName('')
          router.refresh()
          if (onSuccess) {
            onSuccess(res.data)
          }
        }
      } catch (err) {
        setError('Đã xảy ra lỗi không xác định')
      }
    })
  }

  const handleCopy = () => {
    if (createdClass?.code) {
      navigator.clipboard.writeText(createdClass.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (createdClass) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="size-5" />
          <h3 className="font-semibold">Tạo lớp thành công!</h3>
        </div>
        <p className="text-sm text-emerald-600">
          Lớp <strong>{createdClass.name}</strong> đã được tạo. Hãy chia sẻ mã lớp này cho học sinh:
        </p>
        <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-emerald-100 shadow-sm">
          <span className="text-2xl font-mono font-bold tracking-widest text-slate-800 px-4 py-2 bg-slate-100 rounded">
            {createdClass.code}
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Đã chép
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" />
                Sao chép mã lớp
              </>
            )}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCreatedClass(null)}
          className="w-full text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 mt-2"
        >
          Tạo thêm lớp khác
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="className">Tên lớp học</Label>
        <Input
          id="className"
          placeholder="VD: Lớp 1A - 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          maxLength={200}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm border border-red-100">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang tạo...
          </span>
        ) : (
          <>
            <Plus className="mr-2 size-4" />
            Tạo lớp
          </>
        )}
      </Button>
    </form>
  )
}
