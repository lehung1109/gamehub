// src/components/admin/reports/StudentReportCard.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Flame,
  Star,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  Printer,
  ChevronRight,
  X,
} from 'lucide-react'
import type { StudentDetailedReport } from '@/types/reports'
import type { StudentCertificate } from '@/types/certificates'
import { IssueCertificateModal } from './IssueCertificateModal'
import { CertificatePreview } from './CertificatePreview'
import { Button } from '@/components/ui/button'

interface StudentReportCardProps {
  initialReport: StudentDetailedReport
  classroomId: string
  teacherName?: string
}

export function StudentReportCard({
  initialReport,
  classroomId,
  teacherName = 'Giáo viên',
}: StudentReportCardProps) {
  const [report, setReport] = useState<StudentDetailedReport>(initialReport)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedPreviewCert, setSelectedPreviewCert] = useState<StudentCertificate | null>(null)

  function handleCertificateIssued(newCert: StudentCertificate) {
    setReport((prev) => ({
      ...prev,
      certificates: [newCert, ...prev.certificates],
    }))
    setSelectedPreviewCert(newCert)
  }

  const ratingColorMap = {
    mastered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    proficient: 'bg-blue-100 text-blue-800 border-blue-200',
    developing: 'bg-amber-100 text-amber-800 border-amber-200',
    needs_practice: 'bg-rose-100 text-rose-800 border-rose-200',
  }

  const ratingLabelMap = {
    mastered: 'Thành thạo',
    proficient: 'Khá tốt',
    developing: 'Đang phát triển',
    needs_practice: 'Cần luyện thêm',
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 px-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/admin/dashboard/classes/${classroomId}/students/${report.studentId}`}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="size-3.5 mr-1" />
          Quay lại trang học sinh {report.studentName}
        </Link>

        <Button
          onClick={() => setIsIssueModalOpen(true)}
          size="sm"
          className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1.5 shadow-xs"
        >
          <Award className="size-4" />
          <span>Cấp Giấy Khen Cho Học Sinh</span>
        </Button>
      </div>

      {/* Student Profile Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-950">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
            🎓
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
                Level {report.level}
              </span>
              <span className="text-xs text-indigo-200 font-medium">
                {report.classroomName} ({report.classCode})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {report.studentName}
            </h1>
            <p className="text-xs text-indigo-200">
              Báo cáo tiến trình học tập & thành tích rèn luyện toàn diện
            </p>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/15">
            <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
              <Star className="size-4 fill-amber-300" />
            </div>
            <span className="text-lg font-black block">{report.totalStars}</span>
            <span className="text-xs text-indigo-200">Tổng Sao</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/15">
            <div className="flex items-center justify-center gap-1 text-rose-300 mb-1">
              <Flame className="size-4 fill-rose-400 text-rose-400" />
            </div>
            <span className="text-lg font-black block">{report.currentStreak}</span>
            <span className="text-xs text-indigo-200">Chuỗi Ngày</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 text-center border border-white/15">
            <div className="flex items-center justify-center gap-1 text-emerald-300 mb-1">
              <Trophy className="size-4" />
            </div>
            <span className="text-lg font-black block">{report.overallAccuracyPercent}%</span>
            <span className="text-xs text-indigo-200">Độ Chính Xác</span>
          </div>
        </div>
      </div>

      {/* Grid: Skill Breakdown & Leitner SRS Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Educational Skill Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-indigo-600" />
              <h2 className="font-bold text-base text-slate-900">
                Đánh Giá Kỹ Năng Tiếng Anh ({report.skills.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {report.totalSessions} lượt chơi
            </span>
          </div>

          {report.skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Học sinh chưa hoàn thành lượt bài tập nào.
            </p>
          ) : (
            <div className="space-y-3">
              {report.skills.map((skill) => (
                <div
                  key={skill.skillKey}
                  className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">
                      {skill.label}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        ratingColorMap[skill.strengthRating]
                      }`}
                    >
                      {ratingLabelMap[skill.strengthRating]} ({skill.accuracyPercent}%)
                    </span>
                  </div>

                  {/* Accuracy Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        skill.accuracyPercent >= 85
                          ? 'bg-emerald-500'
                          : skill.accuracyPercent >= 70
                          ? 'bg-blue-500'
                          : skill.accuracyPercent >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, skill.accuracyPercent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{skill.sessionCount} bài hoàn thành</span>
                    <span>
                      {skill.totalCorrect}/{skill.totalQuestions} câu đúng
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leitner SRS Box Mastery */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="size-5 text-indigo-600" />
              <h2 className="font-bold text-base text-slate-900">
                Ghi Nhớ Dài Hạn (SRS Leitner)
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              {report.srsMetrics.masteryRatePercent}% Làm chủ
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center space-y-2">
            <span className="text-xs text-indigo-900 font-bold uppercase tracking-wider block">
              Tổng số từ vựng trong sổ tay: {report.srsMetrics.totalCards} từ
            </span>
            <div className="grid grid-cols-5 gap-1.5 pt-2">
              {[
                { box: 1, count: report.srsMetrics.box1, label: 'Hộp 1 (Mới)' },
                { box: 2, count: report.srsMetrics.box2, label: 'Hộp 2' },
                { box: 3, count: report.srsMetrics.box3, label: 'Hộp 3' },
                { box: 4, count: report.srsMetrics.box4, label: 'Hộp 4' },
                { box: 5, count: report.srsMetrics.box5, label: 'Hộp 5 (Thuộc)' },
              ].map((item) => (
                <div
                  key={item.box}
                  className={`p-2 rounded-xl text-center border ${
                    item.box >= 4
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="text-sm font-black block">{item.count}</span>
                  <span className="text-xs font-medium block truncate">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Frequent Mistakes */}
          <div className="space-y-2 pt-2">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Từ Vựng Cần Chú Ý Ôn Lại
            </h3>
            {report.frequentMistakes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Chưa có từ vựng nào bị sai nhiều lần. Học sinh tiếp thu rất tốt!
              </p>
            ) : (
              <div className="space-y-1.5">
                {report.frequentMistakes.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div>
                      <strong className="text-slate-800">{item.prompt}</strong>
                      <span className="text-slate-500 mx-1.5">➔</span>
                      <span className="text-emerald-700 font-medium">{item.correctAnswer}</span>
                    </div>
                    <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                      Sai {item.mistakeCount} lần
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pedagogical Commentary / Teacher Remarks */}
      <div className="bg-amber-50/70 rounded-3xl p-6 border border-amber-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <Sparkles className="size-4 text-amber-600" />
          <span>Nhận Xét Sư Phạm Của Giáo Viên</span>
        </div>
        <p className="text-sm text-amber-950/90 leading-relaxed italic bg-white/70 p-4 rounded-2xl border border-amber-200/60 shadow-2xs">
          &ldquo;{report.automatedTeacherRemark}&rdquo;
        </p>
      </div>

      {/* Issued Certificates Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-amber-500" />
            <h2 className="font-bold text-base text-slate-900">
              Giấy Khen & Chứng Nhận Đã Cấp ({report.certificates.length})
            </h2>
          </div>

          <Button
            onClick={() => setIsIssueModalOpen(true)}
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            + Cấp Thêm Giấy Khen
          </Button>
        </div>

        {report.certificates.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-xs text-slate-400">
              Học sinh chưa có giấy khen nào được cấp.
            </p>
            <Button
              onClick={() => setIsIssueModalOpen(true)}
              size="sm"
              className="rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              Cấp Giấy Khen Đầu Tiên
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 flex items-center justify-between gap-4 hover:bg-amber-50 transition-colors"
              >
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-black inline-block">
                    {cert.title}
                  </span>
                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    &ldquo;{cert.achievementText}&rdquo;
                  </p>
                  <span className="text-xs text-slate-400 font-mono block">
                    Mã: {cert.verificationCode}
                  </span>
                </div>

                <Button
                  onClick={() => setSelectedPreviewCert(cert)}
                  size="sm"
                  className="rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold shrink-0 gap-1 shadow-2xs"
                >
                  <Printer className="size-3.5" />
                  <span>Xem & In</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Issue Certificate */}
      <IssueCertificateModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        studentId={report.studentId}
        studentName={report.studentName}
        classroomId={classroomId}
        defaultTeacherName={teacherName}
        onCertificateIssued={handleCertificateIssued}
      />

      {/* Modal: View & Print Certificate */}
      {selectedPreviewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-slate-100 rounded-3xl p-4 sm:p-6 shadow-2xl relative space-y-4 my-8 max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPreviewCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-colors z-20 print:hidden"
            >
              <X className="size-6" />
            </button>

            <CertificatePreview
              certificate={selectedPreviewCert}
              classroomName={report.classroomName}
            />
          </div>
        </div>
      )}
    </div>
  )
}
