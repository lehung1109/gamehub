// src/components/admin/reports/IssueCertificateModal.tsx

'use client'

import React, { useState, useTransition } from 'react'
import {
  Award,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import type { CertificateTemplate, CertificateType, StudentCertificate } from '@/types/certificates'
import { getCertificateTemplates } from '@/lib/reports/generator'
import { issueStudentCertificateAction } from '@/app/actions/reports'
import { Button } from '@/components/ui/button'

interface IssueCertificateModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: string
  studentName: string
  classroomId: string
  defaultTeacherName?: string
  onCertificateIssued: (cert: StudentCertificate) => void
}

export function IssueCertificateModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  classroomId,
  defaultTeacherName = 'Giáo viên',
  onCertificateIssued,
}: IssueCertificateModalProps) {
  const templates = getCertificateTemplates()
  const [selectedType, setSelectedType] = useState<CertificateType>('vocab_master')
  const activeTemplate = templates.find((t) => t.type === selectedType) || templates[0]

  const [title, setTitle] = useState(activeTemplate.defaultTitle)
  const [achievementText, setAchievementText] = useState(activeTemplate.defaultAchievementText)
  const [teacherName, setTeacherName] = useState(defaultTeacherName)
  const [teacherNote, setTeacherNote] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  function handleSelectTemplate(tpl: CertificateTemplate) {
    setSelectedType(tpl.type)
    setTitle(tpl.defaultTitle)
    setAchievementText(tpl.defaultAchievementText)
  }

  function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    startTransition(async () => {
      const res = await issueStudentCertificateAction({
        studentId,
        classroomId,
        certificateType: selectedType,
        title,
        recipientName: studentName,
        achievementText,
        teacherName,
        teacherNote: teacherNote.trim() ? teacherNote.trim() : undefined,
      })

      if (res.success && res.certificate) {
        onCertificateIssued(res.certificate)
        onClose()
      } else {
        setErrorMsg(res.error || 'Không thể tạo giấy khen')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Cấp Giấy Khen Cho {studentName}
              </h3>
              <p className="text-xs text-slate-500">
                Chọn mẫu bằng khen và chỉnh sửa thông tin trao tặng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleIssueSubmit} className="space-y-4">
          {/* Template Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Mẫu Giấy Khen
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {templates.map((tpl) => {
                const isSelected = tpl.type === selectedType
                return (
                  <button
                    key={tpl.type}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl block mb-1">{tpl.badgeEmoji}</span>
                    <span className="text-xs font-bold text-slate-800 block line-clamp-1">
                      {tpl.badgeLabel}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Danh Hiệu Trao Tặng
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Achievement Citation */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Lời Khen Ngợi / Thành Tích
            </label>
            <textarea
              rows={2}
              value={achievementText}
              onChange={(e) => setAchievementText(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Teacher Signature Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Tên Giáo Viên Ký Tên
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Ghi Chú Riêng (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="VD: Rất năng nổ phát biểu"
                value={teacherNote}
                onChange={(e) => setTeacherNote(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              size="sm"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Xác Nhận Cấp Giấy Khen</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
