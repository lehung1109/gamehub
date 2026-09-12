// src/components/student/StudentCertificatesTab.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { getMyCertificatesAction } from '@/app/actions/reports'
import type { StudentCertificate } from '@/types/certificates'
import { CertificatePreview } from '@/components/admin/reports/CertificatePreview'
import { Award, Printer, X, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface StudentCertificatesTabProps {
  classCode?: string
  studentName?: string
}

export function StudentCertificatesTab({
  classCode,
  studentName,
}: StudentCertificatesTabProps) {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([])
  const [classroomName, setClassroomName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCert, setSelectedCert] = useState<StudentCertificate | null>(null)
  const [reloadKey, setReloadKey] = useState<number>(0)

  const handleRetry = () => {
    setIsLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    if (!classCode || !studentName) {
      return
    }

    let ignore = false

    getMyCertificatesAction({ classCode, studentName })
      .then((res) => {
        if (!ignore) {
          if (res.success) {
            setCertificates(res.certificates || [])
            if (res.classroomName) {
              setClassroomName(res.classroomName)
            }
          } else {
            setError(res.error || 'Không thể tải danh sách giấy khen')
          }
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!ignore) {
          setError('Đã xảy ra lỗi khi kết nối máy chủ')
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [classCode, studentName, reloadKey])

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Đang tải dữ liệu..."
        className="flex flex-col items-center justify-center py-12 text-muted-foreground"
      >
        <Loader2 className="size-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm font-medium">Đang tải giấy khen...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <AlertCircle className="size-10 text-red-500 mb-2" />
        <p className="text-sm font-bold text-foreground mb-1">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="mt-3 rounded-xl cursor-pointer"
        >
          Thử lại
        </Button>
      </div>
    )
  }

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
        <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
          <Award className="size-8" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="font-bold text-base text-foreground">
            Chưa có bằng khen nào
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hãy chăm chỉ hoàn thành bài tập, giữ chuỗi ngày và tham gia Đấu trường trực tiếp để nhận bằng khen từ thầy cô nhé! 🌟
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800/40 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs sm:text-sm font-bold text-foreground">
            Bộ sưu tập bằng khen danh dự ({certificates.length})
          </span>
        </div>
        <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
          Chính chủ GameHub
        </span>
      </div>

      {/* Grid of Certificates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-4 rounded-2xl border-2 border-amber-200 dark:border-amber-800/60 bg-card flex flex-col justify-between gap-3 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-black border border-amber-200 dark:border-amber-700/60">
                  {cert.title}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
                &ldquo;{cert.achievementText}&rdquo;
              </p>

              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>
                  Giáo viên cấp:{' '}
                  <strong className="text-foreground">{cert.teacherName}</strong>
                </div>
                <div>
                  Mã xác thực:{' '}
                  <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                    {cert.verificationCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-end">
              <Button
                size="sm"
                onClick={() => setSelectedCert(cert)}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold gap-1 shadow-xs cursor-pointer"
              >
                <Printer className="size-3.5" />
                <span>Xem & In</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-slate-100 dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl relative space-y-4 my-8 max-h-[95vh] overflow-y-auto border border-border">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors z-20 print:hidden cursor-pointer"
            >
              <X className="size-6" />
            </button>

            <CertificatePreview
              certificate={selectedCert}
              classroomName={classroomName || 'Lớp học GameHub'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
