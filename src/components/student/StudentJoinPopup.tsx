'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStudentSession } from '@/hooks/use-student-session'
import { validateClassCodeAction } from '@/app/actions/classes'
import { GraduationCap, Loader2, Sparkles, User, KeyRound, AlertCircle } from 'lucide-react'

export function StudentJoinPopup() {
  const { session, isOpen, setOpen, joinClass, skip, isLoaded } = useStudentSession()

  const [classCode, setClassCode] = useState('')
  const [studentName, setStudentName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Sync state when popup opens or session changes
  useEffect(() => {
    if (isOpen) {
      if (session) {
        setClassCode(session.classCode || '')
        setStudentName(session.studentName || '')
      }
      setErrorMessage(null)
    }
  }, [isOpen, session])

  if (!isLoaded) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmedCode = classCode.trim().toUpperCase()
    const trimmedName = studentName.trim()

    if (!trimmedCode) {
      setErrorMessage('Bé vui lòng nhập mã lớp nhé!')
      return
    }

    if (!trimmedName) {
      setErrorMessage('Bé vui lòng nhập tên của mình nhé!')
      return
    }

    setIsValidating(true)
    try {
      const result = await validateClassCodeAction(trimmedCode)

      if (result.valid) {
        joinClass({
          classCode: result.classCode || trimmedCode,
          studentName: trimmedName,
          className: result.className,
          classId: result.classId,
        })
      } else {
        setErrorMessage(result.error || 'Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍')
      }
    } catch (err) {
      console.error('[StudentJoinPopup] Error validating class code:', err)
      setErrorMessage('Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSkip = () => {
    setErrorMessage(null)
    skip()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!session) {
        skip()
      } else {
        setOpen(false)
      }
    } else {
      setOpen(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-white/95 backdrop-blur-md border-2 border-amber-200/80 shadow-2xl rounded-3xl p-6 sm:p-8"
      >
        <DialogHeader className="text-center sm:text-center items-center gap-3">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 transform -rotate-3 hover:rotate-0 transition-transform">
            <GraduationCap className="size-9 stroke-[2.5]" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-black text-slate-800 flex items-center justify-center gap-2">
              Tham gia lớp học
              <Sparkles className="size-5 text-amber-500 animate-pulse" />
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-600 mt-1">
              Nhập mã lớp của thầy cô và tên của bé để lưu kết quả học tập nhé!
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-start gap-2 animate-in fade-in-50 duration-200">
              <AlertCircle className="size-5 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="classCode"
              className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
            >
              <KeyRound className="size-4 text-amber-600" />
              Mã lớp
            </Label>
            <Input
              id="classCode"
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              placeholder="VD: ABC123"
              maxLength={12}
              className="font-mono text-center tracking-widest text-lg font-bold uppercase rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-amber-400/20 h-12"
              autoComplete="off"
              disabled={isValidating}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="studentName"
              className="text-sm font-bold text-slate-700 flex items-center gap-1.5"
            >
              <User className="size-4 text-amber-600" />
              Tên của bé
            </Label>
            <Input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="VD: Bé Minh, Bé An..."
              maxLength={100}
              className="text-base font-semibold rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-amber-400/20 h-12"
              autoComplete="off"
              disabled={isValidating}
            />
          </div>

          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2 pt-2 border-t-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={isValidating}
              className="w-full sm:w-auto flex-1 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-800 h-12 text-sm"
            >
              Bỏ qua
            </Button>
            <Button
              type="submit"
              disabled={isValidating}
              className="w-full sm:w-auto flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md shadow-orange-500/20 h-12 text-sm gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                'Vào lớp'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
