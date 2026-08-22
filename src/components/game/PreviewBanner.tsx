'use client'

import React from 'react'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface PreviewBannerProps {
  className?: string
}

export function PreviewBanner({ className }: PreviewBannerProps) {
  return (
    <div
      role="status"
      aria-label="Chế độ xem trước: Cấu hình chưa được lưu"
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-xs dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200',
        className
      )}
    >
      <Eye className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span className="font-bold">Chế độ xem trước:</span>
      <Badge
        variant="secondary"
        className="bg-amber-100/90 text-amber-950 border-amber-200 dark:bg-amber-900/60 dark:text-amber-100 text-xs px-2 py-0 font-bold"
      >
        Cấu hình chưa được lưu
      </Badge>
    </div>
  )
}
