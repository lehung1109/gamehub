// src/components/time/PhonicsTimeExperience.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  getAllEras,
  getEraById,
  getAllRelics,
  getRelicsByEra,
  getRelicById,
  getDefaultTimeProgress,
  completeTimeRelic,
} from '@/lib/phonics-time-engine'
import type { TimeTravelEraId, TimeProgress } from '@/types/phonics-time'
import { TimeHeaderBar } from './TimeHeaderBar'
import { ChronoEraSelector } from './ChronoEraSelector'
import { ChronoCapsuleModal } from './ChronoCapsuleModal'
import { TimeMuseumModal } from './TimeMuseumModal'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { saveTimeProgressAction } from '@/app/actions/phonics-time'
import { Hourglass, Volume2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

const STORAGE_KEY = 'gamehub_phonics_time_v1'

interface PhonicsTimeExperienceProps {
  initialProgress?: TimeProgress
}

export function PhonicsTimeExperience({ initialProgress }: PhonicsTimeExperienceProps) {
  const { speak } = useSpeech()
  const eras = getAllEras()
  const [selectedEra, setSelectedEra] = useState<TimeTravelEraId>('ancient_egypt')
  const [progress, setProgress] = useState<TimeProgress>(
    initialProgress || getDefaultTimeProgress()
  )
  const [activeRelicModalId, setActiveRelicModalId] = useState<string | null>(null)
  const [isMuseumOpen, setIsMuseumOpen] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as TimeProgress
        if (parsed && Array.isArray(parsed.completedRelicIds)) {
          setTimeout(() => {
            setProgress(parsed)
          }, 0)
        }
      }
    } catch {
      // fallback safe
    }
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const persistProgress = (newProg: TimeProgress) => {
    setProgress(newProg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg))
    } catch {
      // ignore
    }
    void saveTimeProgressAction(newProg)
  }

  const handleSelectEra = (eraId: TimeTravelEraId) => {
    setSelectedEra(eraId)
    synthRef.current?.playWoodblock()
  }

  const handleRelicComplete = (relicId: string) => {
    const updated = completeTimeRelic(progress, relicId)
    persistProgress(updated)
    setActiveRelicModalId(null)
  }

  const handleResetProgress = () => {
    const cleanProgress = getDefaultTimeProgress()
    persistProgress(cleanProgress)
  }

  const activeEraDef = getEraById(selectedEra) || eras[0]
  const currentRelics = getRelicsByEra(selectedEra)
  const activeRelicForCapsule = activeRelicModalId
    ? getRelicById(activeRelicModalId)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <TimeHeaderBar
        travelerRank={progress.travelerRank}
        totalCompleted={progress.completedRelicIds.length}
        totalAvailable={getAllRelics().length}
        chronoOrbs={progress.chronoOrbs}
        onOpenMuseum={() => setIsMuseumOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-purple-950 to-stone-900 border-2 border-purple-500/30 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/20 border border-purple-400 text-purple-300 text-base font-bold">
            <Hourglass className="size-5" />
            <span>Phi Thuyền Thời Gian Chrono-Pod</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Cỗ Máy Thời Gian & Cuộc Du Hành Lịch Sử
          </h1>

          <p className="text-base sm:text-lg text-stone-300 font-medium leading-relaxed">
            Đồng hành cùng <strong>Giáo Sư Chronos 🕰️</strong> và hoa tiêu <strong>Mèo Pip 🐱</strong>! Du hành xuyên qua 4 thời kỳ lịch sử, ghép nối các mảnh rune ngữ âm và khôi phục 12 bảo vật cổ đại.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => speak('Welcome aboard the Chrono-Pod! Let us travel through time and repair history!', 'en-US')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-base font-bold transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <Volume2 className="size-5" />
              <span>Lời Chào Của Giáo Sư Chronos</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMuseumOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-base font-bold transition-all border border-stone-600 shadow-md cursor-pointer"
            >
              <Sparkles className="size-5 text-amber-400" />
              <span>Xem Viện Bảo Tàng ({progress.completedRelicIds.length}/12)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Era Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <span>{activeEraDef.eraEmoji}</span>
            <span>{activeEraDef.nameVi}</span>
          </h2>
          <span className="text-base font-bold text-stone-500 dark:text-stone-400">
            {activeEraDef.nameEn}
          </span>
        </div>

        <ChronoEraSelector
          eras={eras}
          selectedEra={selectedEra}
          completedRelicIds={progress.completedRelicIds}
          onSelectEra={handleSelectEra}
        />
      </div>

      {/* Era Description & Relic Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 space-y-6 shadow-md">
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
            Các Cổ Vật Cần Phục Chế
          </h3>
          <p className="text-base text-stone-600 dark:text-stone-300 font-medium">
            {activeEraDef.descriptionVi}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {currentRelics.map((relic) => {
            const isCompleted = progress.completedRelicIds.includes(relic.id)

            return (
              <div
                key={relic.id}
                data-testid={`time-relic-card-${relic.id}`}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                  isCompleted
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-purple-400 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-5xl p-2 rounded-2xl bg-white dark:bg-stone-800 shadow-xs">
                    {relic.relicEmoji}
                  </div>
                  {isCompleted ? (
                    <span className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-base font-black inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-5 text-purple-600 dark:text-purple-400" />
                      <span>Đã Khôi Phục</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-base font-bold">
                      Chưa Phục Chế
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-black text-stone-900 dark:text-white">
                    {relic.nameVi}
                  </h4>
                  <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                    {relic.nameEn}
                  </p>
                  <p className="text-base text-stone-600 dark:text-stone-300 font-medium">
                    {relic.descriptionVi}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Hourglass className="size-4" />
                    <span>Mục tiêu: {relic.challenge.targetWord}</span>
                  </div>
                  <div className="text-base text-stone-500 dark:text-stone-400">
                    {relic.challenge.phonicsFocus}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveRelicModalId(relic.id)}
                  aria-label={`Khôi phục cổ vật ${relic.id}`}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-base transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isCompleted
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-stone-900 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white'
                  }`}
                >
                  <Hourglass className="size-5" />
                  <span>{isCompleted ? 'Khôi Phục Lại' : 'Khai Phá Cổ Vật'}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chrono Capsule Modal */}
      {activeRelicForCapsule && (
        <ChronoCapsuleModal
          relic={activeRelicForCapsule}
          isOpen={true}
          isAlreadyCompleted={progress.completedRelicIds.includes(activeRelicForCapsule.id)}
          onClose={() => setActiveRelicModalId(null)}
          onComplete={handleRelicComplete}
          playChimeSound={() => synthRef.current?.playChime()}
          playKickSound={() => synthRef.current?.playKick()}
        />
      )}

      {/* Time Museum Modal */}
      <TimeMuseumModal
        isOpen={isMuseumOpen}
        onClose={() => setIsMuseumOpen(false)}
        relics={currentRelics.length > 0 ? eras.flatMap((e) => getRelicsByEra(e.id)) : []}
        completedRelicIds={progress.completedRelicIds}
      />
    </div>
  )
}
