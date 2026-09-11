'use client'

import React, { useState, useEffect } from 'react'
import {
  getClassAssignments,
  createAssignment,
  deleteAssignment,
} from '@/app/actions/assignments'
import type { AssignmentWithProgress } from '@/types/assignments'
import games from '@/data/games.json'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'

export interface AssignmentManagerProps {
  classroomId: string
  classroomName: string
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

export function AssignmentManager({ classroomId }: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<AssignmentWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [gameType, setGameType] = useState('flashcard')
  const [topic, setTopic] = useState('')
  const [targetScore, setTargetScore] = useState(5)
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let ignore = false

    getClassAssignments(classroomId)
      .then((res) => {
        if (!ignore) {
          if (res.success && res.data) {
            setAssignments(res.data)
          }
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error fetching assignments:', err)
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [classroomId])

  const refreshAssignments = async () => {
    try {
      const res = await getClassAssignments(classroomId)
      if (res.success && res.data) {
        setAssignments(res.data)
      }
    } catch (err) {
      console.error('Error refreshing assignments:', err)
    }
  }

  const resetForm = () => {
    setTitle('')
    setGameType('flashcard')
    setTopic('')
    setTargetScore(5)
    setDueDate('')
    setDescription('')
    setErrorMsg('')
  }

  const handleOpenCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const handleCloseCreate = () => {
    if (!isSubmitting) {
      resetForm()
      setIsCreateOpen(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg('Tiêu đề bài tập không được để trống')
      return
    }
    if (!dueDate) {
      setErrorMsg('Vui lòng chọn hạn nộp')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg('')

      const res = await createAssignment({
        classroomId,
        title: title.trim(),
        gameType,
        topic: topic.trim() || undefined,
        targetScore,
        dueDate,
        description: description.trim() || undefined,
      })

      if (!res.success) {
        setErrorMsg(res.error || 'Không thể tạo bài tập')
        return
      }

      await refreshAssignments()
      handleCloseCreate()
    } catch (err) {
      setErrorMsg((err as Error).message || 'Đã xảy ra lỗi khi tạo bài tập')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (assignmentId: string) => {
    const confirmed =
      typeof window === 'undefined' ||
      !window.confirm ||
      window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')

    if (!confirmed) return

    try {
      const res = await deleteAssignment(assignmentId)
      if (res.success) {
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
      } else {
        setErrorMsg(res.error || 'Không thể xóa bài tập')
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Đã xảy ra lỗi khi xóa bài tập')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Nhiệm vụ & Bài tập về nhà
              </h2>
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-bold text-xs">
                {assignments.length} bài tập
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Giao bài tập và theo dõi tiến độ nộp bài của học sinh
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 h-9"
        >
          <Plus className="size-4" />
          + Giao bài tập
        </Button>
      </div>

      {/* Error alert outside modal if any */}
      {errorMsg && !isCreateOpen && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
        >
          <AlertCircle className="size-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          <Clock className="size-6 animate-spin mx-auto mb-2 text-indigo-500" />
          Đang tải bài tập...
        </div>
      ) : assignments.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-10">
          <CardContent className="max-w-md mx-auto text-center space-y-4">
            <div className="size-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <BookOpen className="size-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-bold text-slate-800">
                Chưa có bài tập nào được giao cho lớp này.
              </CardTitle>
              <p className="text-xs text-slate-500">
                Giao bài tập để học sinh có mục tiêu ôn tập rõ ràng với trò chơi tương ứng.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleOpenCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              Tạo bài tập đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Assignment List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => {
            const gameInfo = games.find(
              (g) => g.id === assignment.game_type || g.slug === assignment.game_type
            )
            const completionPercent =
              assignment.totalStudentsCount > 0
                ? Math.min(
                    100,
                    Math.round(
                      (assignment.completedCount / assignment.totalStudentsCount) * 100
                    )
                  )
                : 0

            return (
              <Card
                key={assignment.id}
                className="flex flex-col justify-between border-slate-200 bg-white hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{gameInfo?.emoji || '🎮'}</span>
                        <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                          {assignment.title}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs">
                        {gameInfo?.titleVi || assignment.game_type}
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(assignment.id)}
                      className="h-8 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      aria-label={`Xóa bài tập ${assignment.title}`}
                    >
                      <Trash2 className="size-4" />
                      <span className="text-xs ml-1">Xóa</span>
                    </Button>
                  </div>

                  {assignment.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2">
                      {assignment.description}
                    </p>
                  )}

                  {assignment.topic && (
                    <div className="text-xs text-slate-500 mt-1">
                      Chủ đề: <span className="font-medium text-slate-700">{assignment.topic}</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Due date & Target score */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>{formatDateVi(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      <Target className="size-3.5" />
                      <span>{assignment.target_score} điểm</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                  {/* Student completion progress */}
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Users className="size-3 text-slate-400" />
                      Đã nộp: {assignment.completedCount} / {assignment.totalStudentsCount} học sinh
                      {completionPercent === 100 && (
                        <CheckCircle2 className="size-3.5 text-emerald-600 inline ml-0.5" />
                      )}
                    </span>
                    <span className="font-bold text-indigo-700">
                      {completionPercent}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        completionPercent === 100
                          ? 'bg-emerald-500'
                          : completionPercent >= 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Modal Dialog */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-assignment-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3
                id="create-assignment-title"
                className="text-lg font-bold text-slate-900 flex items-center gap-2"
              >
                <Plus className="size-5 text-indigo-600" />
                Giao bài tập mới
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseCreate}
                disabled={isSubmitting}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                aria-label="Đóng"
              >
                <X className="size-4" />
              </Button>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700"
              >
                <AlertCircle className="size-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="assignment-title" className="text-xs font-semibold text-slate-700">
                  Tiêu đề bài tập <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="assignment-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn tập từ vựng Unit 1"
                  required
                  maxLength={200}
                  className="text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="assignment-gametype"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Trò chơi <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="assignment-gametype"
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.emoji} {game.titleVi} ({game.titleEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assignment-topic" className="text-xs font-semibold text-slate-700">
                    Chủ đề (không bắt buộc)
                  </Label>
                  <Input
                    id="assignment-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ví dụ: animals, food..."
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="assignment-targetscore"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Điểm mục tiêu
                  </Label>
                  <Input
                    id="assignment-targetscore"
                    type="number"
                    min={0}
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="assignment-duedate"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Hạn nộp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="assignment-duedate"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="assignment-description"
                  className="text-xs font-semibold text-slate-700"
                >
                  Mô tả / Hướng dẫn
                </Label>
                <textarea
                  id="assignment-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Ghi chú thêm cho học sinh (ví dụ: Chơi đạt từ 8 điểm trở lên để hoàn thành)..."
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm shadow-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseCreate}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  {isSubmitting ? 'Đang giao bài...' : 'Giao bài tập'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
