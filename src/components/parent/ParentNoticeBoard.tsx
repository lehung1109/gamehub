'use client'

import React, { useState } from 'react'
import type { ClassroomAnnouncement, AnnouncementCategory } from '@/types/parent'

interface ParentNoticeBoardProps {
  announcements: ClassroomAnnouncement[]
  studentId: string
  onAcknowledge?: (announcementId: string) => void
}

const CATEGORY_MAP: Record<AnnouncementCategory, { label: string; badgeClass: string; emoji: string }> = {
  homework: {
    label: 'Bài tập về nhà',
    badgeClass: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300',
    emoji: '📝',
  },
  reminder: {
    label: 'Nhắc nhở',
    badgeClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300',
    emoji: '⏰',
  },
  kudos: {
    label: 'Khen thưởng',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300',
    emoji: '🌟',
  },
  announcement: {
    label: 'Thông báo chung',
    badgeClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300',
    emoji: '📢',
  },
}

export function ParentNoticeBoard({
  announcements,
  onAcknowledge,
}: ParentNoticeBoardProps) {
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null)

  const handleAcknowledge = async (id: string) => {
    setAcknowledgingId(id)
    try {
      if (onAcknowledge) {
        await onAcknowledge(id)
      }
    } finally {
      setAcknowledgingId(null)
    }
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-card border-2 border-border rounded-2xl p-8 text-center">
        <span className="text-4xl mb-2 block" aria-hidden="true">📬</span>
        <h3 className="text-xl font-bold text-foreground mb-1">Chưa có thông báo mới</h3>
        <p className="text-base text-muted-foreground">
          Khi giáo viên gửi thông báo hoặc bài tập, nội dung sẽ hiển thị ngay tại đây.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map((ann) => {
        const cat = CATEGORY_MAP[ann.category] || CATEGORY_MAP.announcement
        const isUrgent = ann.priority === 'urgent'
        const isImportant = ann.priority === 'important'

        const dateStr = ann.createdAt
          ? new Date(ann.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : ''

        return (
          <div
            key={ann.id}
            className={`bg-card border-2 rounded-2xl p-5 shadow-xs transition-all ${
              ann.acknowledged
                ? 'border-border'
                : 'border-blue-400 dark:border-blue-700 bg-blue-50/20 dark:bg-blue-950/10'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-base font-semibold ${cat.badgeClass}`}
                >
                  <span aria-hidden="true">{cat.emoji}</span>
                  {cat.label}
                </span>

                {isUrgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-300 text-base font-bold">
                    🚨 Khẩn
                  </span>
                )}

                {isImportant && !isUrgent && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 text-base font-bold">
                    ⚡ Quan trọng
                  </span>
                )}
              </div>

              {dateStr && (
                <span className="text-base text-muted-foreground font-medium">
                  {dateStr}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-2">{ann.title}</h3>
            <p className="text-base text-foreground/90 whitespace-pre-line leading-relaxed mb-4">
              {ann.content}
            </p>

            {/* Acknowledgment Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              {ann.acknowledged ? (
                <span className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-base bg-emerald-100 dark:bg-emerald-950/60 px-4 py-1.5 rounded-full">
                  ✓ Đã xác nhận
                </span>
              ) : (
                <button
                  type="button"
                  disabled={acknowledgingId === ann.id}
                  onClick={() => handleAcknowledge(ann.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {acknowledgingId === ann.id ? 'Đang xác nhận...' : 'Xác nhận đã đọc'}
                </button>
              )}

              {ann.studentId && (
                <span className="text-base text-muted-foreground italic">
                  (Tin nhắn riêng cho học sinh)
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
