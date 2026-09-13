'use client'

import React, { useState } from 'react'
import type { ParentDashboardData } from '@/types/parent'
import { WeeklyDigestCard } from '@/components/parent/WeeklyDigestCard'
import { ParentNoticeBoard } from '@/components/parent/ParentNoticeBoard'
import { acknowledgeAnnouncementAction } from '@/app/actions/parent'
import {
  Award,
  BookOpen,
  BrainCircuit,
  Calendar,
  Flame,
  GraduationCap,
  Sparkles,
  Star,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { PushPreferencesCard } from '@/components/push/PushPreferencesCard'

interface ParentDashboardViewProps {
  initialData: ParentDashboardData
}

export function ParentDashboardView({ initialData }: ParentDashboardViewProps) {
  const [data, setData] = useState<ParentDashboardData>(initialData)

  const handleAcknowledge = async (announcementId: string) => {
    try {
      const res = await acknowledgeAnnouncementAction(announcementId, data.student.id)
      if (res.success) {
        setData((prev) => ({
          ...prev,
          announcements: prev.announcements.map((ann) =>
            ann.id === announcementId ? { ...ann, acknowledged: true } : ann
          ),
        }))
      }
    } catch (err) {
      console.error('Failed to acknowledge announcement:', err)
    }
  }

  const unacknowledgedCount = data.announcements.filter((a) => !a.acknowledged).length

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Student Profile & Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-20 sm:size-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-4xl sm:text-5xl shadow-inner shrink-0">
              {data.student.avatar || '🎓'}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-base font-semibold border border-white/30">
                <GraduationCap className="size-5" />
                <span>{data.student.classroomName}</span>
                {data.student.classCode && (
                  <span className="opacity-80">({data.student.classCode})</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {data.student.name}
              </h1>
              {data.student.teacherName && (
                <p className="text-base text-blue-100 font-medium">
                  Giáo viên phụ trách: <span className="font-bold text-white">{data.student.teacherName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Gamification Highlights */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-3">
              <Star className="size-7 text-amber-300 fill-amber-300" />
              <div>
                <div className="text-base text-blue-100 font-medium">Tổng sao</div>
                <div className="text-2xl font-black">{data.student.totalStars} ⭐</div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-3">
              <Flame className="size-7 text-orange-300 fill-orange-300" />
              <div>
                <div className="text-base text-blue-100 font-medium">Chuỗi ngày</div>
                <div className="text-2xl font-black">{data.student.currentStreak} ngày</div>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-3">
              <Sparkles className="size-7 text-emerald-300" />
              <div>
                <div className="text-base text-blue-100 font-medium">Cấp độ</div>
                <div className="text-2xl font-black">Cấp {data.student.level}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Jump Bar */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 bg-muted/60 p-2 rounded-2xl border border-border">
        <a
          href="#section-digest"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base text-foreground hover:bg-card transition-all whitespace-nowrap"
        >
          <Calendar className="size-5 text-emerald-500" />
          <span>Tổng quan tuần</span>
        </a>

        <a
          href="#section-notices"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base text-foreground hover:bg-card transition-all whitespace-nowrap"
        >
          <BookOpen className="size-5 text-blue-500" />
          <span>Bảng tin lớp</span>
          {unacknowledgedCount > 0 && (
            <span className="bg-rose-500 text-white text-base font-black px-2 py-0.5 rounded-full">
              {unacknowledgedCount}
            </span>
          )}
        </a>

        <a
          href="#section-skills"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base text-foreground hover:bg-card transition-all whitespace-nowrap"
        >
          <BrainCircuit className="size-5 text-purple-500" />
          <span>Kỹ năng & Trí nhớ</span>
        </a>

        <a
          href="#section-certificates"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base text-foreground hover:bg-card transition-all whitespace-nowrap"
        >
          <Award className="size-5 text-amber-500" />
          <span>Chứng chỉ ({data.recentCertificates.length})</span>
        </a>
      </div>

      {/* Section 1: Weekly Digest */}
      <section id="section-digest" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xl font-bold">
              1
            </span>
            <h2 className="text-2xl font-bold text-foreground">Báo Cáo Tiến Độ Tuần Này</h2>
          </div>
          <span className="text-base text-muted-foreground hidden sm:inline">Cập nhật tự động</span>
        </div>

        <WeeklyDigestCard digest={data.digest} />
      </section>

      {/* Section 2: Notice Board */}
      <section id="section-notices" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="size-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xl font-bold">
              2
            </span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Bảng Tin Lớp Học & Nhắn Nhủ Giáo Viên</h2>
              <p className="text-base text-muted-foreground">
                Nhận bài tập về nhà, thông báo hoạt động và những lời khen tặng từ thầy cô.
              </p>
            </div>
          </div>
        </div>

        <ParentNoticeBoard
          announcements={data.announcements}
          studentId={data.student.id}
          onAcknowledge={handleAcknowledge}
        />
      </section>

      {/* Section 3: Skills & Spaced Repetition */}
      <section id="section-skills" className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-xl font-bold">
            3
          </span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Độ Thuần Thục Kỹ Năng & Trí Nhớ Dài Hạn</h2>
            <p className="text-base text-muted-foreground">
              Phân tích khoa học dựa trên phương pháp lặp lại ngắt quãng (Spaced Repetition - SRS).
            </p>
          </div>
        </div>

        {/* SRS Retention Section */}
        <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl" aria-hidden="true">🧠</span>
            <div>
              <h3 className="text-xl font-bold text-foreground">Trí nhớ dài hạn (Spaced Repetition)</h3>
              <p className="text-base text-muted-foreground">
                Số lượng từ vựng và cấu trúc đã khắc sâu vào trí nhớ dài hạn của bé
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
              <span className="text-base text-muted-foreground font-medium block">Tổng thẻ đã học</span>
              <span className="text-3xl font-black text-foreground mt-1 block">
                {data.srsMetrics.totalCards}
              </span>
            </div>

            <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
              <span className="text-base text-muted-foreground font-medium block">Đã ghi nhớ sâu</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {data.srsMetrics.masteredCount}
              </span>
            </div>

            <div className="bg-muted/40 rounded-xl p-4 text-center border border-border">
              <span className="text-base text-muted-foreground font-medium block">Tỷ lệ thành thạo</span>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                {data.srsMetrics.masteryRatePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Individual Skills Grid */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground">Chi tiết từng kỹ năng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.skills.map((skill) => (
              <div
                key={skill.skillKey}
                className="bg-card border-2 border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-foreground">{skill.label}</h4>
                    <p className="text-base text-muted-foreground mt-0.5">
                      Tổng {skill.totalQuestions} câu hỏi đã thực hiện
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-base font-bold border ${
                      skill.strengthRating === 'mastered'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                        : skill.strengthRating === 'developing'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300'
                    }`}
                  >
                    {skill.strengthRating === 'mastered'
                      ? 'Thành thạo'
                      : skill.strengthRating === 'developing'
                      ? 'Đang phát triển'
                      : 'Cần hỗ trợ'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-muted-foreground">Độ chính xác</span>
                    <span className="text-foreground">{skill.accuracyPercent}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        skill.accuracyPercent >= 80
                          ? 'bg-emerald-500'
                          : skill.accuracyPercent >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(5, skill.accuracyPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Certificates */}
      <section id="section-certificates" className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xl font-bold">
            4
          </span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Bảng Vàng Danh Dự & Chứng Chỉ</h2>
            <p className="text-base text-muted-foreground">
              Những cột mốc xuất sắc được GameHub và thầy cô cấp chứng nhận chính thức.
            </p>
          </div>
        </div>

        {data.recentCertificates.length === 0 ? (
          <div className="bg-card border-2 border-border rounded-2xl p-8 text-center">
            <span className="text-4xl mb-2 block" aria-hidden="true">🎖️</span>
            <h3 className="text-xl font-bold text-foreground mb-1">Chưa có chứng chỉ mới</h3>
            <p className="text-base text-muted-foreground">
              Hãy khuyến khích bé hoàn thành bài học và đạt các mốc điểm cao để nhận chứng chỉ nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentCertificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-card border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-6 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 flex items-center justify-center text-3xl shrink-0">
                    🏆
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xl font-bold text-foreground">{cert.title}</h4>
                    <div className="flex items-center gap-2 text-base text-muted-foreground">
                      <span>Mã xác thực:</span>
                      <span className="font-mono font-bold text-foreground">{cert.verificationCode}</span>
                    </div>
                    <p className="text-base text-muted-foreground">
                      Ngày cấp: {new Date(cert.issuedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                    <CheckCircle2 className="size-5" />
                    <span>Chứng chỉ hợp lệ</span>
                  </div>

                  <Link
                    href={`/verify/${cert.verificationCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline font-bold text-base"
                  >
                    <span>Tra cứu trực tuyến</span>
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 5: Push Notifications & Daily Reminders */}
      <section id="section-push-preferences" className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-xl font-bold">
            5
          </span>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cài Đặt Nhắc Nhở & Thông Báo Đẩy</h2>
            <p className="text-base text-muted-foreground">
              Nhận lời nhắc giữ chuỗi ngọn lửa hàng ngày và thông báo bài học mới từ thầy cô.
            </p>
          </div>
        </div>

        <PushPreferencesCard
          studentId={data.student.id}
          parentToken={data.parentToken || undefined}
        />
      </section>
    </div>
  )
}
