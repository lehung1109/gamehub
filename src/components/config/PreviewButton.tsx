'use client'

import React from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GameId, AnyGameSettings } from '@/types/config'
import { validateGameSettings } from '@/lib/game-config-schema'
import { buildPreviewUrl } from '@/lib/preview'
import { cn } from '@/lib/utils'

export interface PreviewButtonProps {
  gameId: GameId
  settings: AnyGameSettings
  disabled?: boolean
  onError?: (error: string) => void
  className?: string
  size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
}

export function PreviewButton({
  gameId,
  settings,
  disabled = false,
  onError,
  className,
  size = 'default',
}: PreviewButtonProps) {
  function handlePreview() {
    if (disabled) return

    const validation = validateGameSettings(gameId, settings)
    if (!validation.valid || !validation.data) {
      const errorMsg = validation.error || 'Cài đặt không hợp lệ, không thể xem trước.'
      if (onError) {
        onError(errorMsg)
      } else {
        console.error('[PreviewButton] Validation failed:', errorMsg)
      }
      return
    }

    const previewUrl = buildPreviewUrl(gameId, validation.data)
    window.open(previewUrl, '_blank')
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={disabled}
      onClick={handlePreview}
      className={cn(
        'border-amber-400 text-amber-900 bg-amber-50/80 hover:bg-amber-100 hover:text-amber-950 font-semibold shadow-xs transition-colors cursor-pointer dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60',
        className
      )}
    >
      <Play className="size-4 mr-1.5 fill-amber-500 text-amber-600 dark:fill-amber-400 dark:text-amber-400 shrink-0" />
      Chơi thử
    </Button>
  )
}
