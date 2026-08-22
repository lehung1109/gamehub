'use client'

import React, { useState, useEffect, useTransition } from 'react'
import type { GameConfig } from '@/types/config'
import { generateShareSlug } from '@/app/actions/configs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check, Share2, Loader2, AlertCircle, ExternalLink } from 'lucide-react'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  config: GameConfig | null
}

export function ShareDialog({ isOpen, onClose, config }: ShareDialogProps) {
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const slug = config?.share_slug || generatedSlug

  useEffect(() => {
    if (!isOpen || !config) {
      setGeneratedSlug(null)
      setErrorMessage('')
      setCopied(false)
      return
    }

    if (!config.share_slug && !generatedSlug) {
      // Auto-generate slug if not existing
      startTransition(async () => {
        setErrorMessage('')
        const res = await generateShareSlug(config.id)
        if (res.error) {
          setErrorMessage(res.error)
        } else if (res.slug) {
          setGeneratedSlug(res.slug)
        }
      })
    }
  }, [isOpen, config, generatedSlug])

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = slug ? `${origin}/play/${slug}` : ''

  async function handleCopy() {
    if (!shareUrl) return
    setErrorMessage('')

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } else {
        // Fallback for non-secure contexts or browsers without clipboard API
        const input = document.getElementById('share-url') as HTMLInputElement | null
        if (input) {
          input.select()
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
        } else {
          setErrorMessage('Vui lòng chọn và sao chép đường link thủ công.')
        }
      }
    } catch {
      // Try fallback if writeText threw
      try {
        const input = document.getElementById('share-url') as HTMLInputElement | null
        if (input) {
          input.select()
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2500)
          return
        }
      } catch {
        // ignore
      }
      setErrorMessage('Không thể sao chép tự động. Vui lòng chọn và sao chép thủ công.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white">
        <DialogHeader className="space-y-2">
          <div className="size-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
            <Share2 className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Chia sẻ cấu hình
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Học sinh có thể mở đường link này để chơi game với bộ cài đặt{' '}
            <strong className="text-slate-800 font-semibold">&ldquo;{config?.name}&rdquo;</strong> mà không cần đăng nhập tài khoản.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-medium"
            >
              <AlertCircle className="size-4 text-red-600 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isPending ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-2 text-slate-500">
              <Loader2 className="size-6 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Đang tạo đường link chia sẻ...</span>
            </div>
          ) : slug ? (
            <div className="space-y-2">
              <Label htmlFor="share-url" className="text-xs font-bold text-slate-700">
                Đường link chia sẻ
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="share-url"
                  aria-label="Đường link chia sẻ"
                  readOnly
                  value={shareUrl}
                  className="font-mono text-xs text-slate-700 bg-slate-50 border-slate-200 select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopy}
                  aria-live="polite"
                  aria-atomic="true"
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-9 px-3 gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5" aria-hidden="true" />
                      <span>Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" aria-hidden="true" />
                      <span>Sao chép</span>
                    </>
                  )}
                </Button>
              </div>

              {shareUrl && (
                <div className="pt-2">
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                  >
                    <span>Mở thử liên kết trong tab mới</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex items-center justify-end sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
