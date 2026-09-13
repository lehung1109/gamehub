'use client'

import React, { useEffect } from 'react'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'
import { InstallPromptBanner } from '@/components/pwa/InstallPromptBanner'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      // Only register in browser environments; allow in dev & prod
      process.env.NODE_ENV !== 'test'
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope)

          registration.onupdatefound = () => {
            const installingWorker = registration.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log('[PWA] New content available; please refresh.')
                }
              }
            }
          }
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <>
      <OfflineIndicator />
      <InstallPromptBanner />
    </>
  )
}
