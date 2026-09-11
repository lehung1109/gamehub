'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStudentAssignments } from '@/app/actions/assignments'
import type { StudentAssignmentItem } from '@/types/assignments'
import games from '@/data/games.json'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'

export interface StudentAssignmentsTabProps {
  classCode: string
  studentName: string
  onCloseModal?: () => void
}

function formatDateVi(dateStr?: string | null): string {
  if (!dateStr) return 'Không có hạn'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return 'Không có hạn'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes} - ${day}/${month}/${year}`
  } catch {
    return 'Không có hạn'
  }
}

export function StudentAssignmentsTab({
  classCode,
  studentName,
  onCloseModal,
}: StudentAssignmentsTabProps) {
  const router = useRouter()
  const [assignments, setAssignments] = useState<StudentAssignmentItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState<number>(0)

  const handleRetry = () => {
    setIsLoading(true)
    setErrorMsg(null)
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let ignore = false

    getStudentAssignments(classCode, studentName)
      .then((res) => {
        if (!ignore) {
          if (res.success && res.data) {
            setAssignments(res.data)
          } else {
            setErrorMsg(res.error || 'Không thể tải danh sách bài tập')
          }
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error fetching student assignments:', err)
          setErrorMsg('Đã xảy ra lỗi khi kết nối máy chủ')
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [classCode, studentName, reloadKey])

  const handlePlay = (assignment: StudentAssignmentItem) => {
    if (onCloseModal) {
      onCloseModal()
    }

    const gameType = assignment.game_type || (assignment as unknown as { gameType?: string }).gameType
    const gameInfo = games.find((g) => g.id === gameType)
    const baseRoute = gameInfo?.route || `/games/${gameType}`

    const params = new URLSearchParams()
    const configId = assignment.config_id || (assignment as unknown as { configId?: string }).configId
    const topic = assignment.topic

    if (configId) {
      params.set('configId', configId)
    }
    if (topic) {
      params.set('topic', topic)
    }

    const qs = params.toString()
    const targetUrl = qs ? `${baseRoute}?${qs}` : baseRoute
    router.push(targetUrl)
  }

  // 1. Loading State
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Đang tải dữ liệu..."
        className="flex flex-col items-center justify-center py-12 text-muted-foreground"
      >
        <Loader2 className="size-8 animate-spin text-amber-500 mb-2" />
        <p className="text-sm font-medium">Đang tải danh sách bài tập...</p>
      </div>
    )
  }

  // 2. Error State
  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <AlertCircle className="size-10 text-red-500 mb-2" />
        <p className="text-sm font-bold text-foreground mb-1">{errorMsg}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          className="mt-3 rounded-xl"
        >
          Thử lại
        </Button>
      </div>
    )
  }

  // 3. Empty State
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <BookOpen className="size-12 text-amber-500/40 mb-3" />
        <p className="font-bold text-base text-foreground mb-1">
          Chưa có bài tập nào được giao cho bạn.
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
          Khi thầy cô giao bài tập mới, bài tập sẽ xuất hiện ở đây!
        </p>
      </div>
    )
  }

  // 4. Assignments List
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
        Danh sách bài tập ({assignments.length})
      </div>

      <div className="space-y-3">
        {assignments.map((assignment) => {
          const gameType = assignment.game_type || (assignment as unknown as { gameType?: string }).gameType
          const gameInfo = games.find((g) => g.id === gameType)
          const emoji = gameInfo?.emoji || '🎮'
          const titleVi = gameInfo?.titleVi || gameType
          const isCompleted = assignment.status === 'completed'
          const isPending = assignment.status === 'pending'

          return (
            <div
              key={assignment.id}
              className="p-4 rounded-2xl border border-border bg-card hover:border-amber-400/50 transition-all shadow-xs flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-11 rounded-2xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                        {assignment.title}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                        {titleVi}
                      </span>
                    </div>

                    {assignment.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="size-3.5" />
                      Đã hoàn thành
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      <Clock className="size-3.5" />
                      Chưa nộp
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                      <AlertCircle className="size-3.5" />
                      Quá hạn
                    </span>
                  )}
                </div>
              </div>

              {/* Assignment details & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-border">
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1">
                    <Target className="size-3.5 text-amber-500 shrink-0" />
                    <span>Mục tiêu: {assignment.target_score} điểm</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-slate-400 shrink-0" />
                    <span>Hạn chót: {formatDateVi(assignment.due_date)}</span>
                  </div>
                </div>

                <div className="self-end sm:self-auto">
                  <Button
                    size="sm"
                    variant={isCompleted ? 'outline' : 'default'}
                    onClick={() => handlePlay(assignment)}
                    className={
                      isCompleted
                        ? 'rounded-xl text-xs font-bold border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                        : 'rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs'
                    }
                  >
                    {isCompleted ? (
                      <>
                        <RotateCcw className="size-3.5 mr-1" />
                        Luyện tập lại
                      </>
                    ) : (
                      <>
                        <span>Làm bài ngay</span>
                        <ArrowRight className="size-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
