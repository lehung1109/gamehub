'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ConfigBannerProps {
  configName?: string | null
}

export function ConfigBanner({ configName }: ConfigBannerProps) {
  if (!configName) return null

  return (
    <div
      role="status"
      aria-label={`Đang áp dụng cấu hình: ${configName}`}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-xs"
    >
      <Sparkles className="size-3.5 text-indigo-600 shrink-0" />
      <span>Bài học tùy chỉnh:</span>
      <Badge variant="secondary" className="bg-indigo-100 text-indigo-900 text-xs px-2 py-0 font-bold">
        {configName}
      </Badge>
    </div>
  )
}
