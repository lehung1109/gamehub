'use client'

import React, { useState } from 'react'
import type {
  ParentAccessInfo,
  ClassroomAnnouncement,
  AnnouncementCategory,
  AnnouncementPriority,
  CreateAnnouncementInput,
} from '@/types/parent'
import {
  Users,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Bell,
  AlertCircle,
  X,
} from 'lucide-react'

interface ParentAccessManagerProps {
  classroomId: string
  classroomName: string
  classCode: string
  parents: ParentAccessInfo[]
  announcements: (ClassroomAnnouncement & { acknowledgedCount: number })[]
  onPublishAnnouncement?: (
    input: CreateAnnouncementInput
  ) => Promise<{ success: boolean; announcement?: ClassroomAnnouncement; error?: string }>
  onDeleteAnnouncement?: (announcementId: string) => Promise<{ success: boolean; error?: string }>
  onRegeneratePin?: (studentId: string) => Promise<{ success: boolean; newPin?: string; error?: string }>
}

const CATEGORY_OPTIONS: { value: AnnouncementCategory; label: string }[] = [
  { value: 'homework', label: '📝 Bài tập về nhà' },
  { value: 'reminder', label: '⏰ Nhắc nhở học tập' },
  { value: 'kudos', label: '🌟 Khen thưởng / Biểu dương' },
  { value: 'announcement', label: '📢 Thông báo chung' },
]

export function ParentAccessManager({
  classroomId,
  classroomName,
  classCode,
  parents: initialParents,
  announcements: initialAnnouncements,
  onPublishAnnouncement,
  onDeleteAnnouncement,
  onRegeneratePin,
}: ParentAccessManagerProps) {
  const [parents, setParents] = useState<ParentAccessInfo[]>(initialParents)
  const [announcements, setAnnouncements] = useState<(ClassroomAnnouncement & { acknowledgedCount: number })[]>(initialAnnouncements)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [regeneratingStudentId, setRegeneratingStudentId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<AnnouncementCategory>('announcement')
  const [priority, setPriority] = useState<AnnouncementPriority>('normal')
  const [targetStudentId, setTargetStudentId] = useState<string>('')

  const handleCopyLink = async (parent: ParentAccessInfo) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const url = `${origin}/parent/${parent.accessToken}`
    await navigator.clipboard.writeText(url)
    setCopiedId(parent.studentId)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleRegenerate = async (studentId: string) => {
    if (!onRegeneratePin) return
    setRegeneratingStudentId(studentId)
    try {
      const res = await onRegeneratePin(studentId)
      if (res.success && res.newPin) {
        setParents((prev) =>
          prev.map((p) => (p.studentId === studentId ? { ...p, accessPin: res.newPin! } : p))
        )
      }
    } finally {
      setRegeneratingStudentId(null)
    }
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setFormError('Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.')
      return
    }

    if (!onPublishAnnouncement) return

    setIsSubmitting(true)
    setFormError(null)

    try {
      const input: CreateAnnouncementInput = {
        classroomId,
        title: title.trim(),
        content: content.trim(),
        category,
        priority,
        studentId: targetStudentId ? targetStudentId : undefined,
      }

      const res = await onPublishAnnouncement(input)
      if (res.success) {
        // Add to list with real UUID if available
        const newAnnouncement: ClassroomAnnouncement & { acknowledgedCount: number } = {
          id: res.announcement?.id || `ann-${Date.now()}`,
          classroomId,
          teacherId: '',
          studentId: targetStudentId ? targetStudentId : null,
          title: title.trim(),
          content: content.trim(),
          category,
          priority,
          createdAt: new Date().toISOString(),
          acknowledged: false,
          acknowledgedCount: 0,
        }
        setAnnouncements([newAnnouncement, ...announcements])
        setTitle('')
        setContent('')
        setCategory('announcement')
        setPriority('normal')
        setTargetStudentId('')
        setIsModalOpen(false)
      } else {
        setFormError(res.error || 'Đã xảy ra lỗi khi tạo thông báo.')
      }
    } catch {
      setFormError('Lỗi kết nối khi gửi thông báo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (announcementId: string) => {
    if (!onDeleteAnnouncement) return
    const confirmed = window.confirm('Thầy/Cô có chắc chắn muốn xóa thông báo này không?')
    if (!confirmed) return

    const res = await onDeleteAnnouncement(announcementId)
    if (res.success) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId))
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-base border border-primary/20">
            <Users className="size-5" />
            <span>{classroomName}</span>
            <span>({classCode})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Quản Lý Phụ Huynh & Bảng Thông Báo
          </h1>
          <p className="text-base text-muted-foreground">
            Cung cấp mã PIN, link truy cập cho phụ huynh và đăng tải các thông báo gửi đến gia đình.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="size-5" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* Announcements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="size-6 text-indigo-600" />
            <span>Thông Báo Đã Gửi Trong Lớp ({announcements.length})</span>
          </h2>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-card border-2 border-border rounded-2xl p-8 text-center space-y-2">
            <span className="text-4xl block" aria-hidden="true">📬</span>
            <h3 className="text-xl font-bold text-foreground">Chưa có thông báo nào</h3>
            <p className="text-base text-muted-foreground">
              Bấm nút &quot;Tạo thông báo mới&quot; để gửi bài tập hoặc lời khen đến phụ huynh.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((ann) => {
              const targetStudent = ann.studentId
                ? parents.find((p) => p.studentId === ann.studentId)?.studentName
                : null

              return (
                <div
                  key={ann.id}
                  className="bg-card border-2 border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-muted font-bold text-base border border-border">
                        {CATEGORY_OPTIONS.find((c) => c.value === ann.category)?.label || 'Thông báo'}
                      </span>
                      {ann.priority === 'urgent' && (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-base border border-rose-300">
                          🚨 Khẩn cấp
                        </span>
                      )}
                      {ann.priority === 'important' && (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-base border border-amber-300">
                          ⚡ Quan trọng
                        </span>
                      )}
                      {targetStudent && (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-base border border-blue-300">
                          Gửi riêng: {targetStudent}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-foreground">{ann.title}</h3>
                    <p className="text-base text-foreground/90 whitespace-pre-line leading-relaxed">
                      {ann.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground pt-1">
                      <span>
                        Ngày đăng:{' '}
                        {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {ann.acknowledgedCount} / {ann.studentId ? 1 : parents.length} phụ huynh đã đọc
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(ann.id)}
                      className="p-3 rounded-xl border-2 border-border text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Parent Roster Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <KeyRound className="size-6 text-amber-600" />
            <span>Danh Sách Mã PIN & Liên Kết Phụ Huynh ({parents.length})</span>
          </h2>
        </div>

        <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-muted/60">
                  <th className="py-4 px-6 text-base font-bold text-foreground">Tên Học Sinh</th>
                  <th className="py-4 px-6 text-base font-bold text-foreground">Mã PIN Bảo Mật</th>
                  <th className="py-4 px-6 text-base font-bold text-foreground">Liên Kết Nhanh</th>
                  <th className="py-4 px-6 text-base font-bold text-foreground">Lần Truy Cập Cuối</th>
                  <th className="py-4 px-6 text-base font-bold text-foreground text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground text-base">
                      Chưa có học sinh nào trong lớp học này.
                    </td>
                  </tr>
                ) : (
                  parents.map((parent) => (
                  <tr key={parent.studentId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-base font-bold text-foreground">
                      {parent.studentName}
                    </td>
                    <td className="py-4 px-6 text-base">
                      <span className="font-mono font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-xl border border-amber-300">
                        {parent.accessPin}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-base">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(parent)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-base transition-all cursor-pointer ${
                          copiedId === parent.studentId
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-background hover:bg-muted text-foreground border-border'
                        }`}
                      >
                        {copiedId === parent.studentId ? (
                          <>
                            <Check className="size-4" />
                            <span>Đã chép link!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-4" />
                            <span>Sao chép link</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-base text-muted-foreground">
                      {parent.lastAccessedAt
                        ? new Date(parent.lastAccessedAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Chưa truy cập'}
                    </td>
                    <td className="py-4 px-6 text-base text-right">
                      <button
                        type="button"
                        disabled={regeneratingStudentId === parent.studentId}
                        onClick={() => handleRegenerate(parent.studentId)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                        title="Tạo lại mã PIN mới cho phụ huynh"
                      >
                        <RefreshCw
                          className={`size-4 ${
                            regeneratingStudentId === parent.studentId ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Tạo lại PIN</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Compose Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  📢
                </span>
                <h3 className="text-2xl font-bold text-foreground">Tạo Thông Báo Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-6" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3"
              >
                <AlertCircle className="size-5 shrink-0" />
                <span className="text-base font-semibold">{formError}</span>
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label
                  htmlFor="announcementTitle"
                  className="block text-base font-bold text-foreground mb-2"
                >
                  Tiêu đề thông báo
                </label>
                <input
                  id="announcementTitle"
                  type="text"
                  placeholder="VD: Ôn tập chuẩn bị kiểm tra giữa kỳ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="announcementContent"
                  className="block text-base font-bold text-foreground mb-2"
                >
                  Nội dung thông báo
                </label>
                <textarea
                  id="announcementContent"
                  rows={4}
                  placeholder="Nhập nội dung chi tiết bài học, lưu ý dặn dò..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="announcementCategory"
                    className="block text-base font-bold text-foreground mb-2"
                  >
                    Phân loại
                  </label>
                  <select
                    id="announcementCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="announcementPriority"
                    className="block text-base font-bold text-foreground mb-2"
                  >
                    Mức độ ưu tiên
                  </label>
                  <select
                    id="announcementPriority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="normal">Bình thường</option>
                    <option value="important">Quan trọng</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="targetStudent"
                  className="block text-base font-bold text-foreground mb-2"
                >
                  Đối tượng nhận
                </label>
                <select
                  id="targetStudent"
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-input bg-background text-foreground text-base font-medium focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Tất cả học sinh trong lớp ({parents.length})</option>
                  {parents.map((p) => (
                    <option key={p.studentId} value={p.studentId}>
                      Chỉ gửi cho: {p.studentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border-2 border-border font-bold text-base hover:bg-muted transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
