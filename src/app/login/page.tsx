'use client'

import React, { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, ArrowLeft, Loader2, Sparkles } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect') || ''
  const [errorMessage, setErrorMessage] = useState<string>(searchParams.get('error') || '')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email?.trim()) {
      setErrorMessage('Email là bắt buộc')
      return
    }

    if (!password) {
      setErrorMessage('Mật khẩu là bắt buộc')
      return
    }

    startTransition(async () => {
      const res = await login(formData)
      if (res?.error) {
        setErrorMessage(res.error)
      }
    })
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-indigo-100 bg-white">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
          <Sparkles className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập Quản trị</h1>
        </CardTitle>
        <CardDescription className="text-slate-500">
          Dành cho giáo viên quản lý nội dung và cấu hình game
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium animate-in fade-in duration-200"
            >
              {errorMessage}
            </div>
          )}

          <input type="hidden" name="redirect" value={redirectParam} />

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="teacher@school.edu.vn"
                autoComplete="email"
                className="pl-9"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">
              Mật khẩu
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="pl-9"
                disabled={isPending}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 font-semibold text-base shadow-sm"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Quay lại Trang chủ
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-sky-50 to-indigo-50 p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-8 animate-spin text-indigo-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
