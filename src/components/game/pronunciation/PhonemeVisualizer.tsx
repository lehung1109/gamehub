// src/components/game/pronunciation/PhonemeVisualizer.tsx

'use client'

import React, { useState } from 'react'
import {
  Volume2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react'
import type { PhonemeAssessmentResult, PhonemeBreakdown } from '@/types/ai-copilot'

export interface PhonemeVisualizerProps {
  result: PhonemeAssessmentResult
  onPlayPhoneme?: (phoneme: string) => void
}

export function PhonemeVisualizer({ result, onPlayPhoneme }: PhonemeVisualizerProps) {
  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeBreakdown | null>(null)

  function handlePhonemeClick(p: PhonemeBreakdown) {
    setSelectedPhoneme(p)
    if (onPlayPhoneme) {
      onPlayPhoneme(p.phoneme)
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(p.phoneme)
        utterance.lang = 'en-US'
        window.speechSynthesis.speak(utterance)
      } catch {
        // Fallback
      }
    }
  }

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6 text-slate-800">
      {/* Header: Target Word, Score & Stars */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-base uppercase tracking-wider font-bold text-slate-500">
            Từ mẫu luyện đọc:
          </span>
          <h3 className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
            {result.targetWord}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-5 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
            <span className="text-base text-indigo-700 font-bold block">Độ chuẩn xác</span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-950">
              {result.accuracy}%
            </span>
          </div>

          <div className="flex items-center gap-1 text-2xl">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={star <= result.stars ? 'opacity-100 scale-105' : 'opacity-25 grayscale'}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Dropped Final Sound Warning Alert */}
      {result.hasDroppedFinalSound && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="size-7 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="text-lg font-black text-amber-900">
              Phát hiện lỗi nuốt âm đuôi (Dropped Final Sound)!
            </h4>
            <p className="text-base font-semibold text-amber-800">
              Học sinh Việt Nam thường quên phát âm phụ âm cuối. Hãy bật hơi rõ ràng ở cuối từ.
            </p>
          </div>
        </div>
      )}

      {/* Phoneme Chip Interactive Segment Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-slate-700">
            Chi tiết từng âm tiết (Chạm vào để nghe phát âm mẫu):
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          {result.phonemes.map((p, idx) => {
            const isSelected = selectedPhoneme?.phoneme === p.phoneme && selectedPhoneme?.ipa === p.ipa

            let colorClasses = 'bg-emerald-50 text-emerald-900 border-emerald-300'
            if (p.status === 'omitted') {
              colorClasses = 'bg-purple-50 text-purple-900 border-dashed border-2 border-purple-300'
            } else if (p.status === 'near') {
              colorClasses = 'bg-amber-50 text-amber-900 border-amber-300'
            } else if (p.status === 'incorrect') {
              colorClasses = 'bg-rose-50 text-rose-900 border-rose-300'
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePhonemeClick(p)}
                aria-label={`Phát âm ${p.ipa}`}
                className={`min-w-[76px] px-4 py-3 rounded-2xl border-2 font-black transition-all cursor-pointer flex flex-col items-center gap-1 shadow-sm hover:scale-105 active:scale-95 ${colorClasses} ${
                  isSelected ? 'ring-4 ring-indigo-500 ring-offset-2 scale-105' : ''
                }`}
              >
                <span className="text-xl font-bold">{p.phoneme}</span>
                <span className="text-base font-mono font-medium opacity-90">{p.ipa}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Phoneme Remediation Tip */}
      {selectedPhoneme?.tipVi && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 flex items-center gap-3">
          <Lightbulb className="size-6 text-indigo-600 shrink-0" />
          <p className="text-base font-bold flex-1">{selectedPhoneme.tipVi}</p>
        </div>
      )}

      {/* Overall Assessment Feedback & Remediation Box */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center gap-2">
          {result.isPassed ? (
            <CheckCircle2 className="size-6 text-emerald-600 shrink-0" />
          ) : (
            <HelpCircle className="size-6 text-indigo-600 shrink-0" />
          )}
          <h4 className="text-lg font-black text-slate-900">Nhận xét từ Trợ Lý AI:</h4>
        </div>
        <p className="text-base font-medium text-slate-700">{result.overallFeedbackVi}</p>
        <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-base text-indigo-800 font-bold">
          <Volume2 className="size-5 text-indigo-600 shrink-0" />
          <span>{result.remediationAdviceVi}</span>
        </div>
      </div>
    </div>
  )
}
