// src/components/passport/PassportHub.tsx
'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Share2,
  CheckCircle2,
} from 'lucide-react'
import type { StudentPassport, GraduationCertificate } from '@/types/passport'
import { calculatePassportCompletion } from '@/lib/passport-engine'
import { triggerGraduationAction } from '@/app/actions/passport'
import { PassportStampBook } from './PassportStampBook'
import { VoicePortfolioPlayer } from './VoicePortfolioPlayer'
import { DigitalGraduationModal } from './DigitalGraduationModal'

interface PassportHubProps {
  initialPassport: StudentPassport
  isPublicView?: boolean
}

export function PassportHub({
  initialPassport,
  isPublicView = false,
}: PassportHubProps) {
  const [passport, setPassport] = useState<StudentPassport>(initialPassport)
  const [isGraduationOpen, setIsGraduationOpen] = useState(false)
  const [isGraduating, setIsGraduating] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const completion = calculatePassportCompletion(passport.stamps)

  const handleOpenGraduation = useCallback(async () => {
    if (passport.certificate) {
      setIsGraduationOpen(true)
      return
    }

    setIsGraduating(true)
    try {
      const res = await triggerGraduationAction(passport.studentId, passport.studentName)
      if (res.success && res.data) {
        setPassport((prev) => ({
          ...prev,
          certificate: res.data,
        }))
        setIsGraduationOpen(true)
      }
    } finally {
      setIsGraduating(false)
    }
  }, [passport.certificate, passport.studentId, passport.studentName])

  const handleCopyShareLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/passport/${passport.shareToken}`
      void navigator.clipboard?.writeText(shareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }, [passport.shareToken])

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all"
        >
          <ArrowLeft className="size-5" />
          <span>Trang Chủ</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyShareLink}
            aria-label="Chia sẻ hồ sơ học tập cho phụ huynh"
            className="px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-base inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            <Share2 className="size-5" />
            <span>{copiedLink ? 'Đã Sao Chép Link!' : 'Chia Sẻ Hồ Sơ'}</span>
          </button>

          {completion.isEligibleForGraduation && !isPublicView && (
            <button
              type="button"
              onClick={handleOpenGraduation}
              disabled={isGraduating}
              aria-label="Tổ chức lễ tốt nghiệp và nhận chứng chỉ"
              className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-black text-base inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30 transition-all"
            >
              <GraduationCap className="size-6" />
              <span>{isGraduating ? 'Đang cấp bằng...' : '🎓 Lễ Tốt Nghiệp'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Student Passport Cover Banner */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl border-4 border-indigo-400/40 relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <span className="text-6xl sm:text-7xl p-4 bg-white/10 rounded-3xl backdrop-blur-xs border-2 border-white/20">
              {passport.avatar}
            </span>
            <div className="space-y-1">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-base uppercase inline-flex items-center gap-1.5">
                <Sparkles className="size-4 text-slate-950" />
                <span>Hộ Chiếu Năng Lực Tiếng Anh</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {passport.studentName}
              </h1>
              <p className="text-lg text-slate-300 font-semibold">
                {passport.gradeLevel}
              </p>
            </div>
          </div>

          <div className="bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-xs border border-white/20 text-center sm:text-right space-y-1">
            <span className="block text-base font-bold text-slate-300">
              Tiến Độ Hoàn Thành
            </span>
            <span className="block text-3xl font-black text-amber-400">
              {completion.completionPercent}%
            </span>
            <span className="block text-base font-semibold text-emerald-300 inline-flex items-center gap-1">
              <CheckCircle2 className="size-4" />
              <span>{completion.unlockedCount}/{completion.totalCount} dấu ấn</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stamp Booklet Section */}
      <PassportStampBook stamps={passport.stamps} />

      {/* Audio Voice Portfolio Section */}
      <VoicePortfolioPlayer items={passport.voiceRecordings} />

      {/* Graduation Modal Popup */}
      {passport.certificate && (
        <DigitalGraduationModal
          isOpen={isGraduationOpen}
          certificate={passport.certificate}
          onClose={() => setIsGraduationOpen(false)}
        />
      )}
    </div>
  )
}
