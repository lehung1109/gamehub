'use client'

import React, { useState, useEffect } from 'react'
import { Download, X, Smartphone, Share } from 'lucide-react'
import { cn } from '@/lib/utils'

export const PWA_DISMISS_KEY = 'gamehub_pwa_install_dismissed'
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface InstallPromptBannerProps {
  forceShow?: boolean
  className?: string
}

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    (typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
  )
}

function isDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false
  const dismissed = localStorage.getItem(PWA_DISMISS_KEY)
  if (!dismissed) return false
  const lastDismissed = parseInt(dismissed, 10)
  return !isNaN(lastDismissed) && Date.now() - lastDismissed < DISMISS_COOLDOWN_MS
}

function isAppleMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
}

export function InstallPromptBanner({
  forceShow = false,
  className,
}: InstallPromptBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (forceShow) return false
    return isDismissedRecently()
  })
  const [isStandalone] = useState<boolean>(() => {
    if (forceShow) return false
    return isRunningStandalone()
  })
  const [isIOS] = useState<boolean>(isAppleMobileDevice)
  const [promptAvailable, setPromptAvailable] = useState<boolean>(false)

  useEffect(() => {
    if (forceShow || isStandalone || isDismissed) {
      return
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setPromptAvailable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [forceShow, isStandalone, isDismissed])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setIsDismissed(true)
        setDeferredPrompt(null)
      }
    } catch (e) {
      console.error('[InstallPromptBanner] Error invoking install prompt:', e)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(PWA_DISMISS_KEY, Date.now().toString())
    }
  }

  const isVisible =
    !isDismissed && (forceShow || (!isStandalone && (promptAvailable || isIOS)))

  if (!isVisible) {
    return null
  }

  return (
    <aside
      role="region"
      aria-label="Install App"
      className={cn(
        'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:max-w-md bg-white rounded-3xl p-5 shadow-2xl border-4 border-indigo-200 animate-in fade-in slide-in-from-bottom-4',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <Smartphone className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              Install GameHub App
            </h3>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-base font-medium text-slate-600 mt-1 leading-snug">
            Play English learning games offline with crystal clear voice pronunciation anytime!
          </p>

          {isIOS ? (
            <div className="mt-3 p-3 bg-indigo-50/80 rounded-xl text-base text-indigo-900 font-medium flex items-center gap-2">
              <Share className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>Tap Share then &quot;Add to Home Screen&quot;</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleInstallClick}
                aria-label="Install now"
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Install Now</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Later"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-base transition-all cursor-pointer"
              >
                Later
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
