'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ClassDashboardData } from '@/app/actions/classes'
import { copyToClipboard } from '@/lib/clipboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Users,
  Gamepad2,
  Award,
  Flame,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  School,
  History,
  Search,
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

interface ClassOverviewProps {
  data: ClassDashboardData
}

export function ClassOverview({ data }: ClassOverviewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [studentSearch, setStudentSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const {
    classroom,
    totalStudents,
    totalSessions,
    overallAvgScorePercent,
    mostPlayedGame,
    gameStats,
    students,
    recentSessions,
    timeframe,
  } = data

  const handleCopyCode = async () => {
    const ok = await copyToClipboard(classroom.code)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTimeframeChange = (newTf: 'all' | '7d' | '30d') => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    if (newTf === 'all') {
      params.delete('timeframe')
    } else {
      params.set('timeframe', newTf)
    }
    const queryString = params.toString() ? `?${params.toString()}` : ''
    startTransition(() => {
      router.push(`/admin/dashboard/classes/${classroom.id}${queryString}`)
    })
  }

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.trim().toLowerCase())
  )

  return (
    <div className={`space-y-8 transition-opacity duration-200 ${isPending ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/dashboard/classes"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-1"
          >
            <ArrowLeft className="size-3.5 mr-1" />
            Danh sách lớp
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              {classroom.name}
            </h1>
            <Badge
              variant={classroom.is_active ? 'default' : 'secondary'}
              className={
                classroom.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-medium'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-200'
              }
            >
              {classroom.is_active ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5" suppressHydrationWarning>
            <Calendar className="size-3.5" />
            Tạo ngày: {formatDateVi(classroom.created_at)}
          </p>
        </div>

        {/* Action / Code Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg shadow-2xs">
            <span className="text-xs text-indigo-700 font-medium">Mã lớp:</span>
            <span className="font-mono font-black text-indigo-900 tracking-wider text-sm">
              {classroom.code}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="h-7 px-2 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900"
              aria-label="Sao chép mã lớp"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-600 mr-1" />
                  <span className="text-xs font-semibold text-emerald-600">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 mr-1" />
                  <span className="text-xs font-semibold">Sao chép mã</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Switcher */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 flex-wrap">
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
        {/* Card 1: Total Students */}
        <Card className="border-slate-200 shadow-xs bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng số học sinh
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Đã tham gia vào lớp</p>
          </CardContent>
        </Card>

        {/* Card 2: Total Sessions */}
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

        {/* Card 3: Overall Average Score */}
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
            <div className="text-2xl font-black text-slate-900">{overallAvgScorePercent}%</div>
            <p className="text-xs text-slate-500 mt-1">Tỷ lệ câu trả lời đúng</p>
          </CardContent>
        </Card>

        {/* Card 4: Most Played Game */}
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
      </div>

      {/* Main Content Area: Empty State OR Populated Content */}
      {totalSessions === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-12">
          <CardContent className="max-w-md mx-auto text-center space-y-6">
            <div className="size-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <School className="size-8" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-slate-800">
                Chưa có lượt chơi nào
              </CardTitle>
              <p className="text-sm text-slate-500">
                Lớp học chưa có dữ liệu chơi game nào trong khoảng thời gian này.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 text-left">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Hướng dẫn học sinh tham gia
              </h4>
              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  1. Gửi mã lớp <strong className="text-indigo-600 font-mono font-bold">{classroom.code}</strong> cho học sinh.
                </p>
                <p>2. Học sinh mở bất kỳ game nào trên GameHub và nhập mã lớp + tên mình.</p>
                <p>3. Kết quả các bài tập và trò chơi sẽ tự động hiển thị tại đây.</p>
              </div>
            </div>

            <Button
              onClick={handleCopyCode}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs"
            >
              {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Đã sao chép mã lớp' : 'Sao chép mã lớp cho học sinh'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Game Breakdown & Students List */}
          <div className="lg:col-span-2 space-y-8">
            {/* Game Performance Breakdown */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="size-5 text-indigo-600" />
                  Điểm trung bình theo từng game
                </CardTitle>
                <CardDescription>
                  Thống kê kết quả và số lượt hoàn thành theo từng trò chơi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameStats.map((stat) => (
                  <div key={stat.gameType} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{stat.gameLabel}</span>
                        <Badge variant="outline" className="text-2xs font-normal text-slate-500">
                          {stat.sessionCount} lượt chơi
                        </Badge>
                      </div>
                      <span className="font-extrabold text-indigo-700 text-sm">
                        {stat.avgScorePercent}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stat.avgScorePercent >= 80
                            ? 'bg-emerald-500'
                            : stat.avgScorePercent >= 60
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(4, stat.avgScorePercent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Students List in this Class */}
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="size-5 text-indigo-600" />
                      Danh sách học sinh ({students.length})
                    </CardTitle>
                    <CardDescription>
                      Theo dõi tiến độ và kết quả từng em trong lớp
                    </CardDescription>
                  </div>

                  {students.length > 3 && (
                    <div className="relative w-full sm:w-48">
                      <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Tìm học sinh..."
                        className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-2xs">
                        <th className="py-2.5 px-3">Học sinh</th>
                        <th className="py-2.5 px-3 text-center">Lượt chơi</th>
                        <th className="py-2.5 px-3 text-center">Điểm TB</th>
                        <th className="py-2.5 px-3 text-right">Lần chơi gần nhất</th>
                        <th className="py-2.5 px-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            Không tìm thấy học sinh nào phù hợp
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-800">{student.name}</td>
                            <td className="py-3 px-3 text-center text-slate-600 font-medium">
                              {student.sessionCount}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <Badge
                                variant="secondary"
                                className={`text-2xs font-bold ${
                                  student.sessionCount === 0
                                    ? 'bg-slate-100 text-slate-600'
                                    : student.avgScorePercent >= 80
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : student.avgScorePercent >= 60
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {student.sessionCount > 0 ? `${student.avgScorePercent}%` : '-'}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-right text-slate-500" suppressHydrationWarning>
                              {formatDateVi(student.lastActiveAt)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Link
                                href={`/admin/dashboard/classes/${classroom.id}/students/${student.id}`}
                                aria-label={`Xem chi tiết học sinh ${student.name}`}
                                className={buttonVariants({
                                  variant: 'ghost',
                                  size: 'sm',
                                  className:
                                    'h-7 px-2.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-2xs font-bold',
                                })}
                              >
                                Xem chi tiết
                                <ChevronRight className="size-3 ml-0.5" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1 Col): Recent Activity */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-xs bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="size-5 text-indigo-600" />
                  Hoạt động gần đây
                </CardTitle>
                <CardDescription>Các phiên chơi vừa được gửi về</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentSessions.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    Chưa có hoạt động nào trong khoảng thời gian này
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentSessions.map((sess) => (
                      <div key={sess.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800 text-xs line-clamp-1">
                            {sess.studentName}
                          </span>
                          {sess.score !== null && sess.totalQuestions !== null ? (
                            <span className="text-2xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              {sess.score}/{sess.totalQuestions} câu ({sess.scorePercent}%)
                            </span>
                          ) : (
                            <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Đã hoàn thành
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-2xs text-slate-500" suppressHydrationWarning>
                          <span>
                            {sess.gameLabel} {sess.topic ? `• ${sess.topic}` : ''}
                          </span>
                          <span>{formatDateVi(sess.completedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
