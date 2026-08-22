'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { StudentDashboardData, StudentSessionItem } from '@/app/actions/classes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Gamepad2,
  Award,
  Flame,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Sparkles,
  School,
  Loader2,
} from 'lucide-react'

function formatDateVi(dateStr?: string | null): string {
  if (!dateStr) return 'Chưa có'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Chưa có'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes} - ${day}/${month}/${year}`
  } catch {
    return 'Chưa có'
  }
}

interface StudentDetailProps {
  data: StudentDashboardData
}

export function StudentDetail({ data }: StudentDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set())

  const {
    classroom,
    student,
    totalSessions,
    avgScorePercent,
    mostPlayedGame,
    lastActiveAt,
    sessions,
    difficultWords,
    timeframe,
  } = data

  const handleTimeframeChange = (newTf: 'all' | '7d' | '30d') => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (newTf === 'all') {
      params.delete('timeframe')
    } else {
      params.set('timeframe', newTf)
    }
    const queryString = params.toString() ? `?${params.toString()}` : ''
    startTransition(() => {
      router.push(`/admin/dashboard/classes/${classroom.id}/students/${student.id}${queryString}`)
    })
  }

  const toggleSessionExpand = (sessionId: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  return (
    <div
      className={`space-y-8 transition-opacity duration-200 ${
        isPending ? 'opacity-70 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/admin/dashboard/classes/${classroom.id}`}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-1"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Quay lại lớp {classroom.name}
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="size-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-base shadow-2xs">
              <User className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                {student.name}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2 pt-0.5">
                <span>
                  Lớp: <strong className="text-slate-700">{classroom.name}</strong>
                </span>
                <span>•</span>
                <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-2xs font-bold">
                  {classroom.code}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1" suppressHydrationWarning>
                  <Calendar className="size-3" />
                  Tham gia: {formatDateVi(student.created_at)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Thời gian:
          </span>
          <div className="inline-flex bg-slate-100 p-1 rounded-lg">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTimeframeChange('all')}
              disabled={isPending}
              className={`h-7 px-3 text-xs font-medium rounded-md transition-all ${
                timeframe === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTimeframeChange('7d')}
              disabled={isPending}
              className={`h-7 px-3 text-xs font-medium rounded-md transition-all ${
                timeframe === '7d'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 ngày
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleTimeframeChange('30d')}
              disabled={isPending}
              className={`h-7 px-3 text-xs font-medium rounded-md transition-all ${
                timeframe === '30d'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 ngày
            </Button>
          </div>
          {isPending && <Loader2 className="size-4 animate-spin text-indigo-600 ml-2" />}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sessions */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng lượt chơi
            </CardTitle>
            <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Gamepad2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{totalSessions}</div>
            <p className="text-xs text-slate-500 mt-1">Phiên game đã hoàn thành</p>
          </CardContent>
        </Card>

        {/* Card 2: Average Score */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Điểm trung bình
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{avgScorePercent}%</div>
            <p className="text-xs text-slate-500 mt-1">Tỷ lệ trả lời chính xác</p>
          </CardContent>
        </Card>

        {/* Card 3: Most Played Game */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Game chơi nhiều nhất
            </CardTitle>
            <div className="size-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-900 line-clamp-1">
              {mostPlayedGame?.gameLabel || 'Chưa có'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {mostPlayedGame ? `${mostPlayedGame.sessionCount} lượt chơi` : 'Chưa có dữ liệu'}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Last Active */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lần chơi gần nhất
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="text-sm font-bold text-slate-900 line-clamp-1"
              suppressHydrationWarning
            >
              {formatDateVi(lastActiveAt)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Thời gian ghi nhận cuối</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Sections */}
      {totalSessions === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-12">
          <CardContent className="max-w-md mx-auto text-center space-y-4">
            <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <School className="size-7" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-slate-800">
                Học sinh chưa có phiên chơi nào
              </CardTitle>
              <p className="text-xs text-slate-500">
                Bé {student.name} chưa hoàn thành bài tập hay trò chơi nào trong khoảng thời gian
                này.
              </p>
            </div>
            <Link
              href={`/admin/dashboard/classes/${classroom.id}`}
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'mt-2 text-xs',
              })}
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Quay lại lớp học
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Top Missed / Difficult Words */}
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" />
                Top từ hay sai nhất
              </CardTitle>
              <CardDescription>
                Các câu hỏi hoặc từ vựng bé gặp khó khăn cần được ôn luyện thêm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {difficultWords.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">
                      Không có từ nào làm sai! Bé làm rất tốt ⭐
                    </p>
                    <p className="text-2xs text-emerald-600">
                      Bé đã hoàn thành xuất sắc tất cả các câu hỏi trong những phiên vừa qua.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-2xs">
                        <th className="py-2.5 px-3">Từ vựng / Câu hỏi</th>
                        <th className="py-2.5 px-3">Trò chơi</th>
                        <th className="py-2.5 px-3">Chủ đề</th>
                        <th className="py-2.5 px-3 text-center">Số lần sai</th>
                        <th className="py-2.5 px-3 text-right">Tỷ lệ đúng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {difficultWords.map((item, idx) => (
                        <tr key={`${item.gameType}-${item.prompt}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">{item.prompt}</td>
                          <td className="py-3 px-3 text-slate-600">{item.gameLabel}</td>
                          <td className="py-3 px-3 text-slate-500">{item.topic || '-'}</td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-2xs font-bold">
                              {item.incorrectCount} lần sai
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-extrabold text-slate-700">
                              {item.accuracyPercent}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Session History */}
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Gamepad2 className="size-5 text-indigo-600" />
                Lịch sử các phiên chơi ({sessions.length})
              </CardTitle>
              <CardDescription>
                Chi tiết từng lượt chơi của học sinh sắp xếp theo thời gian mới nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((sess: StudentSessionItem) => {
                const isExpanded = expandedSessionIds.has(sess.id)
                const hasDetails = sess.details && sess.details.length > 0

                return (
                  <div
                    key={sess.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{sess.gameLabel}</span>
                          {sess.topic && (
                            <Badge variant="outline" className="text-2xs font-normal text-slate-600 bg-white">
                              {sess.topic}
                            </Badge>
                          )}
                          {sess.score !== null && sess.totalQuestions !== null ? (
                            <Badge
                              variant="secondary"
                              className={`text-2xs font-bold ${
                                sess.scorePercent >= 80
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : sess.scorePercent >= 60
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {sess.score}/{sess.totalQuestions} câu ({sess.scorePercent}%)
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-2xs font-bold">
                              Đã hoàn thành
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xs text-slate-500 flex items-center gap-1.5" suppressHydrationWarning>
                          <Clock className="size-3" />
                          Hoàn thành: {formatDateVi(sess.completedAt || sess.startedAt)}
                        </p>
                      </div>

                      {hasDetails && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSessionExpand(sess.id)}
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? `Ẩn chi tiết câu hỏi phiên ${sess.gameLabel}` : `Xem chi tiết câu hỏi phiên ${sess.gameLabel}`}
                          className="h-8 px-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 self-start sm:self-auto"
                        >
                          {isExpanded ? (
                            <>
                              Ẩn chi tiết câu hỏi
                              <ChevronUp className="size-3.5 ml-1" />
                            </>
                          ) : (
                            <>
                              Xem chi tiết câu hỏi
                              <ChevronDown className="size-3.5 ml-1" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Question details table when expanded */}
                    {isExpanded && hasDetails && (
                      <div className="border-t border-slate-200 p-4 bg-white space-y-3">
                        <h4 className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                          Chi tiết từng câu ({sess.details.length} câu)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-medium text-2xs">
                                <th scope="col" className="py-1.5 px-2.5">#</th>
                                <th scope="col" className="py-1.5 px-2.5">Câu hỏi / Từ</th>
                                <th scope="col" className="py-1.5 px-2.5">Đáp án của bé</th>
                                <th scope="col" className="py-1.5 px-2.5">Đáp án đúng</th>
                                <th scope="col" className="py-1.5 px-2.5 text-center">Kết quả</th>
                                <th scope="col" className="py-1.5 px-2.5 text-right">Thời gian</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sess.details.map((d, index) => (
                                <tr key={d.id || index} className="hover:bg-slate-50/50">
                                  <td className="py-2 px-2.5 text-slate-400 font-mono text-2xs">
                                    {index + 1}
                                  </td>
                                  <td className="py-2 px-2.5 font-bold text-slate-800">
                                    {d.prompt}
                                  </td>
                                  <td className="py-2 px-2.5 text-slate-600">
                                    {d.selectedAnswer ? (
                                      <span>Đáp án của bé: {d.selectedAnswer}</span>
                                    ) : (
                                      <span className="text-slate-400 italic">Không chọn</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2.5 text-slate-600">
                                    {d.correctAnswer ? (
                                      <span>Đáp án đúng: {d.correctAnswer}</span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2.5 text-center">
                                    {d.isCorrect ? (
                                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-2xs bg-emerald-50 px-2 py-0.5 rounded">
                                        <CheckCircle2 className="size-3" /> Đúng
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-2xs bg-rose-50 px-2 py-0.5 rounded">
                                        <XCircle className="size-3" /> Sai
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2.5 text-right text-slate-400 text-2xs font-mono">
                                    {d.timeTakenMs > 0 ? `${(d.timeTakenMs / 1000).toFixed(1)}s` : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
