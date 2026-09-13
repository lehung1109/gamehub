// src/components/dino/PhonicsDinoExperience.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  getAllEras,
  getEraById,
  getFossilsByEra,
  getFossilById,
  getDefaultDinoProgress,
  completeDinoFossil,
} from '@/lib/phonics-dino-engine'
import type { GeologicalEraId, DinoProgress } from '@/types/phonics-dino'
import { DinoHeaderBar } from './DinoHeaderBar'
import { DinoSiteSelector } from './DinoSiteSelector'
import { FossilDigModal } from './FossilDigModal'
import { DinoMuseumModal } from './DinoMuseumModal'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { saveDinoProgressAction } from '@/app/actions/phonics-dino'
import { Pickaxe, Volume2, Sparkles, CheckCircle2, Bone } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

const STORAGE_KEY = 'gamehub_phonics_dino_v1'

interface PhonicsDinoExperienceProps {
  initialProgress?: DinoProgress
}

export function PhonicsDinoExperience({ initialProgress }: PhonicsDinoExperienceProps) {
  const { speak } = useSpeech()
  const eras = getAllEras()
  const [selectedEra, setSelectedEra] = useState<GeologicalEraId>('triassic')
  const [progress, setProgress] = useState<DinoProgress>(
    initialProgress || getDefaultDinoProgress()
  )
  const [activeFossilModalId, setActiveFossilModalId] = useState<string | null>(null)
  const [isMuseumOpen, setIsMuseumOpen] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as DinoProgress
        if (parsed && Array.isArray(parsed.completedFossilIds)) {
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

  const persistProgress = (newProg: DinoProgress) => {
    setProgress(newProg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg))
    } catch {
      // ignore
    }
    void saveDinoProgressAction(newProg)
  }

  const handleSelectEra = (eraId: GeologicalEraId) => {
    setSelectedEra(eraId)
    synthRef.current?.playWoodblock()
  }

  const handleFossilComplete = (fossilId: string) => {
    const updated = completeDinoFossil(progress, fossilId)
    persistProgress(updated)
    setActiveFossilModalId(null)
  }

  const handleResetProgress = () => {
    const cleanProgress = getDefaultDinoProgress()
    persistProgress(cleanProgress)
  }

  const activeEraDef = getEraById(selectedEra) || eras[0]
  const currentFossils = getFossilsByEra(selectedEra)
  const activeFossilForDig = activeFossilModalId
    ? getFossilById(activeFossilModalId)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <DinoHeaderBar
        paleontologistRank={progress.paleontologistRank}
        totalCompleted={progress.completedFossilIds.length}
        totalAvailable={12}
        amberGems={progress.amberGems}
        onOpenMuseum={() => setIsMuseumOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 border-2 border-emerald-500/30 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-base font-bold">
            <Pickaxe className="size-5" />
            <span>Khu Di Tích Khảo Cổ Tiền Sử</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Vương Quốc Khủng Long & Khảo Cổ Tiền Sử
          </h1>

          <p className="text-base sm:text-lg text-stone-300 font-medium leading-relaxed">
            Đồng hành cùng <strong>Tiến Sĩ Rex 🦖</strong> và robot trợ lý <strong>Chippy 🤖</strong>! Khai quật xương hóa thạch, ghép các mảnh vỡ ngữ âm và phục sinh 12 loài khủng long huyền thoại.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => speak('Welcome to the Dino Kingdom! Let us dig for ancient fossils!', 'en-US')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-base font-bold transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <Volume2 className="size-5" />
              <span>Lời Chào Của Dr. Rex</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMuseumOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-base font-bold transition-all border border-stone-600 shadow-md cursor-pointer"
            >
              <Sparkles className="size-5 text-amber-400" />
              <span>Xem Viện Bảo Tàng ({progress.completedFossilIds.length}/12)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geological Era Site Selector */}
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

        <DinoSiteSelector
          eras={eras}
          selectedEra={selectedEra}
          completedFossilIds={progress.completedFossilIds}
          onSelectEra={handleSelectEra}
        />
      </div>

      {/* Era Description & Fossil Grid */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 space-y-6 shadow-md">
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">
            Các Mẫu Hóa Thạch Đang Chờ Khai Quật
          </h3>
          <p className="text-base text-stone-600 dark:text-stone-300 font-medium">
            {activeEraDef.descriptionVi}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {currentFossils.map((fossil) => {
            const isCompleted = progress.completedFossilIds.includes(fossil.id)

            return (
              <div
                key={fossil.id}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                  isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-emerald-400 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-5xl p-2 rounded-2xl bg-white dark:bg-stone-800 shadow-xs">
                    {fossil.dinoEmoji}
                  </div>
                  {isCompleted ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-base font-black inline-flex items-center gap-1.5">
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Đã Hồi Sinh</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-base font-bold">
                      Chờ Đào
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-black text-stone-900 dark:text-white">
                    {fossil.nameVi}
                  </h4>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {fossil.nameEn}
                  </p>
                  <p className="text-base text-stone-600 dark:text-stone-300 font-medium">
                    {fossil.descriptionVi}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Bone className="size-4" />
                    <span>Mục tiêu: {fossil.challenge.targetWord}</span>
                  </div>
                  <div className="text-base text-stone-500 dark:text-stone-400">
                    {fossil.challenge.phonicsFocus}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFossilModalId(fossil.id)}
                  aria-label={`Khai quật hóa thạch ${fossil.id}`}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-base transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-stone-900 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Pickaxe className="size-5" />
                  <span>{isCompleted ? 'Khai Quật Lại' : 'Khai Quật Mẫu Vật'}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fossil Dig Modal */}
      {activeFossilForDig && (
        <FossilDigModal
          fossil={activeFossilForDig}
          isOpen={true}
          isAlreadyCompleted={progress.completedFossilIds.includes(activeFossilForDig.id)}
          onClose={() => setActiveFossilModalId(null)}
          onComplete={handleFossilComplete}
          playChimeSound={() => synthRef.current?.playChime()}
          playKickSound={() => synthRef.current?.playKick()}
        />
      )}

      {/* Prehistoric Museum Modal */}
      <DinoMuseumModal
        isOpen={isMuseumOpen}
        onClose={() => setIsMuseumOpen(false)}
        fossils={currentFossils.length > 0 ? eras.flatMap((e) => getFossilsByEra(e.id)) : []}
        completedFossilIds={progress.completedFossilIds}
      />
    </div>
  )
}
