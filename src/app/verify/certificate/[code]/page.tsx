// src/app/verify/certificate/[code]/page.tsx

import React from 'react'
import Link from 'next/link'
import { verifyCertificateAction } from '@/app/actions/reports'
import { CertificatePreview } from '@/components/admin/reports/CertificatePreview'
import { ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react'

interface VerifyCertificatePageProps {
  params: Promise<{
    code: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function VerifyCertificatePage({
  params,
}: VerifyCertificatePageProps) {
  const { code } = await params
  const res = await verifyCertificateAction(code)

  if (!res.success || !res.certificate) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
          <div className="size-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="size-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Không Tìm Thấy Chứng Chỉ
          </h1>
          <p className="text-sm text-slate-600">
            Mã xác thực <strong className="font-mono text-slate-800">{code}</strong> không tồn tại hoặc đã bị thu hồi trong hệ thống GameHub.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Trở về trang chủ GameHub</span>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Verification Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 shadow-xs print:hidden">
          <div className="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">
              Chứng chỉ hợp lệ & Chính chủ
            </h3>
            <p className="text-xs text-emerald-700">
              Chứng nhận này được xác thực bởi GameHub cho học sinh{' '}
              <strong>{res.certificate.recipientName}</strong> thuộc{' '}
              <strong>{res.classroomName || 'Lớp học GameHub'}</strong>.
            </p>
          </div>
        </div>

        {/* Certificate Display */}
        <CertificatePreview
          certificate={res.certificate}
          classroomName={res.classroomName}
          isPublicView={true}
        />
      </div>
    </main>
  )
}
