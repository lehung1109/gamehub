'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { verifyParentAccessAction } from '@/app/actions/parent'
import { ShieldCheck, KeyRound, School, User, AlertCircle, ArrowRight, Loader2, Link2 } from 'lucide-react'

export function ParentAuthForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pin' | 'token'>('pin')
  const [classCode, setClassCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [accessPin, setAccessPin] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsLoading(true)

    try {
      if (activeTab === 'pin') {
        if (!classCode.trim() || !studentName.trim() || !accessPin.trim()) {
          setErrorMessage('Vui lòng nhập đầy đủ Mã lớp, Tên học sinh và Mã PIN phụ huynh.')
          setIsLoading(false)
          return
        }

        const res = await verifyParentAccessAction({
          classCode: classCode.trim(),
          studentName: studentName.trim(),
          accessPin: accessPin.trim(),
        })

        if (!res.success || !res.token) {
          setErrorMessage(res.error || 'Xác thực thất bại. Vui lòng kiểm tra lại thông tin.')
          setIsLoading(false)
          return
        }

        router.push(`/parent/${res.token}`)
      } else {
        if (!tokenInput.trim()) {
          setErrorMessage('Vui lòng nhập Mã liên kết hoặc dán toàn bộ đường link phụ huynh.')
          setIsLoading(false)
          return
        }

        // Clean token if parent pasted a full URL
        let cleanToken = tokenInput.trim()
        if (cleanToken.includes('/parent/')) {
          const parts = cleanToken.split('/parent/')
          cleanToken = parts[parts.length - 1].split('?')[0].split('#')[0]
        }

        const res = await verifyParentAccessAction({
          token: cleanToken,
        })

        if (!res.success || !res.token) {
          setErrorMessage(res.error || 'Mã liên kết không hợp lệ hoặc đã hết hạn.')
          setIsLoading(false)
          return
        }

        router.push(`/parent/${res.token}`)
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-card border-2 border-border shadow-xl rounded-3xl p-6 sm:p-8">
      {/* Tab Switcher */}
      <div className="flex bg-muted/60 p-1.5 rounded-2xl mb-6 border border-border">
        <button
          type="button"
          onClick={() => {
            setActiveTab('pin')
            setErrorMessage(null)
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pin'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <KeyRound className="size-5" />
          <span>Mã PIN Phụ Huynh</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('token')
            setErrorMessage(null)
          }}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
            activeTab === 'token'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Link2 className="size-5" />
          <span>Mã Liên Kết Trực Tiếp</span>
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-destructive/10 border-2 border-destructive/30 text-destructive flex items-start gap-3"
        >
          <AlertCircle className="size-6 shrink-0 mt-0.5" />
          <span className="text-base font-semibold leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {activeTab === 'pin' ? (
          <>
            <div>
              <label
                htmlFor="classCode"
                className="block text-base font-bold text-foreground mb-2 flex items-center gap-2"
              >
                <School className="size-5 text-primary" />
                Mã Lớp Học
              </label>
              <input
                id="classCode"
                name="classCode"
                type="text"
                placeholder="VD: 3A1, ENG101..."
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-input bg-background text-foreground text-lg font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="studentName"
                className="block text-base font-bold text-foreground mb-2 flex items-center gap-2"
              >
                <User className="size-5 text-primary" />
                Tên Của Bé
              </label>
              <input
                id="studentName"
                name="studentName"
                type="text"
                placeholder="VD: Nguyễn Văn An, Bé Linh Đan..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-input bg-background text-foreground text-lg font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
                autoComplete="off"
              />
            </div>

            <div>
              <label
                htmlFor="accessPin"
                className="block text-base font-bold text-foreground mb-2 flex items-center gap-2"
              >
                <ShieldCheck className="size-5 text-primary" />
                Mã Bảo Mật Phụ Huynh (PIN)
              </label>
              <input
                id="accessPin"
                name="accessPin"
                type="text"
                placeholder="VD: P-8K2M4N hoặc 8K2M4N"
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value.toUpperCase())}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-input bg-background text-foreground text-lg font-mono tracking-wider placeholder:tracking-normal placeholder:font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
                autoComplete="off"
              />
              <p className="mt-2 text-base text-muted-foreground">
                Mã PIN gồm tiền tố P- và 6 ký tự do giáo viên phụ trách lớp của bé cung cấp.
              </p>
            </div>
          </>
        ) : (
          <div>
            <label
              htmlFor="tokenInput"
              className="block text-base font-bold text-foreground mb-2 flex items-center gap-2"
            >
              <Link2 className="size-5 text-primary" />
              Mã Liên Kết Hoặc Đường Link Nhận Từ Giáo Viên
            </label>
            <input
              id="tokenInput"
              name="tokenInput"
              type="text"
              placeholder="Dán mã bảo mật hoặc liên kết https://.../parent/..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-input bg-background text-foreground text-lg font-medium placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
              autoComplete="off"
            />
            <p className="mt-2 text-base text-muted-foreground">
              Nếu bạn nhận được tin nhắn Zalo/SMS có chứa đường link truy cập nhanh, hãy dán vào đây.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              <span>Đang kiểm tra thông tin...</span>
            </>
          ) : (
            <>
              <span>Xem Báo Cáo Học Tập Của Con</span>
              <ArrowRight className="size-6" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
