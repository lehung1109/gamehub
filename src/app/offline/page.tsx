'use client'

import React from 'react'
import Link from 'next/link'
import { WifiOff, RotateCcw, Home } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border-4 border-indigo-100 flex flex-col items-center">
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
          <WifiOff className="w-12 h-12" aria-hidden="true" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
          You are Offline!
        </h1>

        <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
          No internet connection right now. Don&apos;t worry! Your games, scores, and flashcards are
          saved safely on your device.
        </p>

        <div className="w-full flex flex-col gap-4">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <RotateCcw className="w-6 h-6" />
            <span>Try Reconnecting</span>
          </button>

          <Link
            href="/"
            className="w-full py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3"
          >
            <Home className="w-6 h-6" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
