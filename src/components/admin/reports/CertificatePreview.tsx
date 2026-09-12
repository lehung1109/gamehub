// src/components/admin/reports/CertificatePreview.tsx

'use client'

import React, { useState } from 'react'
import {
  Printer,
  Award,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type { StudentCertificate } from '@/types/certificates'
import { Button } from '@/components/ui/button'

interface CertificatePreviewProps {
  certificate: StudentCertificate
  classroomName?: string
  isPublicView?: boolean
}

export function CertificatePreview({
  certificate,
  classroomName = 'GameHub Academy',
  isPublicView = false,
}: CertificatePreviewProps) {
  const [copied, setCopied] = useState(false)

  const issueDateFormatted = new Date(certificate.issuedAt).toLocaleDateString(
    'vi-VN',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  )

  const verifyUrl = `/verify/certificate/${certificate.verificationCode}`

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(certificate.verificationCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Giấy Khen Điện Tử & Bản In A4
            </h3>
            <p className="text-xs text-slate-500">
              Mã chứng chỉ: <strong className="font-mono text-slate-700">{certificate.verificationCode}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCode}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Chép mã xác thực</span>
              </>
            )}
          </Button>

          <Button
            onClick={handlePrint}
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            <Printer className="size-3.5" />
            <span>In Giấy Khen (A4)</span>
          </Button>
        </div>
      </div>

      {/* Printable Certificate Sheet */}
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl p-3 sm:p-6 shadow-xl border-4 border-amber-300 print:border-amber-400 print:shadow-none print:m-0 print:p-4 print:rounded-none">
        <div className="relative border-2 border-amber-400/80 rounded-2xl p-6 sm:p-12 text-center overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20">
          {/* Subtle watermark background */}
          <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
            <Award className="w-96 h-96 text-amber-900" />
          </div>

          {/* Header */}
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-widest border border-amber-300">
              <Sparkles className="size-3.5 text-amber-600" />
              <span>GameHub Academic Excellence</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-amber-950 uppercase tracking-widest pt-2">
              Giấy Chứng Nhận Danh Dự
            </h2>
            <p className="text-xs uppercase font-bold text-amber-700/80 tracking-widest">
              Certificate of Achievement
            </p>
          </div>

          {/* Recipient */}
          <div className="relative z-10 my-8 space-y-2">
            <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">
              Trân trọng trao tặng cho học sinh
            </p>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif text-indigo-950">
              {certificate.recipientName}
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-2" />
          </div>

          {/* Title & Citation */}
          <div className="relative z-10 max-w-2xl mx-auto space-y-3 my-6">
            <div className="inline-block px-4 py-1.5 rounded-xl bg-amber-500 text-white font-black text-sm sm:text-base shadow-sm">
              {certificate.title}
            </div>

            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed italic px-4">
              &ldquo;{certificate.achievementText}&rdquo;
            </p>

            {certificate.teacherNote && (
              <p className="text-xs text-slate-500 italic max-w-lg mx-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                Nhận xét: {certificate.teacherNote}
              </p>
            )}
          </div>

          {/* Footer & Signatures */}
          <div className="relative z-10 mt-12 pt-6 border-t border-amber-200 grid grid-cols-2 sm:grid-cols-3 items-end gap-4 text-center">
            {/* Class & Date */}
            <div className="space-y-1 text-left sm:text-center">
              <span className="text-xs text-slate-400 block font-medium">Lớp học / Ngày cấp</span>
              <strong className="text-xs sm:text-sm text-slate-800 block font-bold">
                {classroomName}
              </strong>
              <span className="text-xs text-slate-500 block">
                {issueDateFormatted}
              </span>
            </div>

            {/* Official Seal Badge */}
            <div className="hidden sm:flex flex-col items-center justify-center">
              <div className="size-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-amber-600 shadow-md flex items-center justify-center text-amber-950 font-black text-xs uppercase tracking-tighter">
                <div className="size-12 rounded-full border border-dashed border-amber-950 flex items-center justify-center text-center">
                  <ShieldCheck className="size-6 text-amber-950" />
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 mt-1 block">GameHub Verified</span>
            </div>

            {/* Teacher Signature */}
            <div className="space-y-1 text-right sm:text-center">
              <span className="text-xs text-slate-400 block font-medium">Giáo viên chủ nhiệm</span>
              <div className="h-8 flex items-center justify-center font-serif text-indigo-700 italic font-bold text-base sm:text-lg">
                {certificate.teacherName}
              </div>
              <strong className="text-xs sm:text-sm text-slate-800 block border-t border-slate-300 pt-1 font-bold">
                {certificate.teacherName}
              </strong>
            </div>
          </div>

          {/* Verification Code Footer */}
          <div className="relative z-10 mt-8 pt-3 border-t border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-mono">
            <span>
              Mã tra cứu: <strong className="text-slate-700 font-bold">{certificate.verificationCode}</strong>
            </span>
            <span className="text-slate-400">
              Xác thực trực tuyến tại: gamehub.edu.vn{verifyUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
