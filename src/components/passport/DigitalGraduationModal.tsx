// src/components/passport/DigitalGraduationModal.tsx
'use client'

import React from 'react'
import { GraduationCap, Star, X, CheckCircle, Printer } from 'lucide-react'
import type { GraduationCertificate } from '@/types/passport'

interface DigitalGraduationModalProps {
  isOpen: boolean
  certificate: GraduationCertificate
  onClose: () => void
}

export function DigitalGraduationModal({
  isOpen,
  certificate,
  onClose,
}: DigitalGraduationModalProps) {
  if (!isOpen) return null

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Lễ tốt nghiệp trực tuyến và chứng chỉ"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in-50 duration-200"
    >
      <div className="bg-white rounded-3xl border-4 border-amber-400 p-8 w-full max-w-2xl shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chứng chỉ"
          className="absolute top-6 right-6 p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-base cursor-pointer transition-all"
        >
          <X className="size-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="size-20 sm:size-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-5xl border-4 border-amber-300 shadow-inner">
            <GraduationCap className="size-12 sm:size-14 text-amber-600 animate-bounce" />
          </div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-base uppercase tracking-wider">
            🎓 Chúc Mừng Lễ Tốt Nghiệp Khóa Học!
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950">
            Chứng Nhận Hoàn Thành GameHub
          </h2>
        </div>

        {/* Certificate Frame */}
        <div className="p-6 sm:p-8 bg-linear-to-b from-amber-50/60 via-white to-amber-50/60 rounded-3xl border-4 border-double border-amber-400 shadow-inner space-y-5 text-center">
          <div className="flex justify-between items-center text-base font-bold text-slate-500">
            <span>Mã chứng chỉ: {certificate.certificateId}</span>
            <span>Ngày cấp: {certificate.issueDate}</span>
          </div>

          <div className="space-y-1">
            <span className="block text-base font-semibold text-slate-600">Trân trọng trao tặng:</span>
            <h3 className="text-3xl sm:text-4xl font-black text-indigo-900 tracking-wide">
              {certificate.studentName}
            </h3>
          </div>

          <p className="text-lg text-slate-700 font-medium max-w-lg mx-auto leading-relaxed">
            Đã hoàn thành xuất sắc chương trình tiếng Anh tương tác dành cho học sinh lớp 1-2, đạt chuẩn năng lực ngôn ngữ:
          </p>

          <div className="inline-block px-6 py-2 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-md">
            Trình Độ CEFR: {certificate.cefrLevelAchieved}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t-2 border-amber-200">
            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <span className="block text-base font-bold text-slate-500">Ngôi Sao</span>
              <span className="block text-2xl font-black text-amber-500 inline-flex items-center justify-center gap-1">
                <Star className="size-5 fill-amber-500" />
                <span>{certificate.totalStars}</span>
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <span className="block text-base font-bold text-slate-500">Kinh Nghiệm</span>
              <span className="block text-2xl font-black text-emerald-600">
                +{certificate.totalExp} XP
              </span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-amber-200">
              <span className="block text-base font-bold text-slate-500">Nhiệm Vụ</span>
              <span className="block text-2xl font-black text-purple-600">
                {certificate.completedQuestsCount} bài
              </span>
            </div>
          </div>

          {/* Commendation */}
          <div className="p-4 bg-white/80 rounded-2xl border border-amber-300 text-base font-bold text-slate-800 italic">
            Lời khen từ giáo viên: &ldquo;{certificate.teacherCommendation}&rdquo;
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            aria-label="In chứng nhận tốt nghiệp"
            className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="size-5" />
            <span>In Chứng Nhận</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Hoàn tất lễ tốt nghiệp"
            className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg inline-flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
          >
            <CheckCircle className="size-5" />
            <span>Hoàn Tất & Tiếp Tục Học</span>
          </button>
        </div>
      </div>
    </div>
  )
}
