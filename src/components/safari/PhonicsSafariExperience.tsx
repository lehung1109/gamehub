// src/components/safari/PhonicsSafariExperience.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  getAllBiomes,
  getBiomeById,
  getAnimalsByBiome,
  getAnimalById,
  getDefaultSafariProgress,
  recordSnapshot,
} from '@/lib/phonics-safari-engine'
import type { SafariBiomeType, SafariProgress } from '@/types/phonics-safari'
import { SafariHeaderBar } from './SafariHeaderBar'
import { SafariBiomeSelector } from './SafariBiomeSelector'
import { SafariCameraModal } from './SafariCameraModal'
import { SafariFieldGuideModal } from './SafariFieldGuideModal'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { saveSafariProgressAction } from '@/app/actions/phonics-safari'
import { Camera, Volume2, CheckCircle2, Sparkles, Compass } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

const STORAGE_KEY = 'gamehub_phonics_safari_v1'

interface PhonicsSafariExperienceProps {
  initialProgress?: SafariProgress
}

export function PhonicsSafariExperience({ initialProgress }: PhonicsSafariExperienceProps) {
  const { speak } = useSpeech()
  const biomes = getAllBiomes()
  const [selectedBiome, setSelectedBiome] = useState<SafariBiomeType>('savanna')
  const [progress, setProgress] = useState<SafariProgress>(
    initialProgress || getDefaultSafariProgress()
  )
  const [activeCameraAnimalId, setActiveCameraAnimalId] = useState<string | null>(null)
  const [isFieldGuideOpen, setIsFieldGuideOpen] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    // Hydrate from localStorage asynchronously
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as SafariProgress
        if (parsed && Array.isArray(parsed.photographedAnimalIds)) {
          setTimeout(() => {
            setProgress(parsed)
          }, 0)
        }
      }
    } catch {
      // fallback
    }
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const persistProgress = (newProg: SafariProgress) => {
    setProgress(newProg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg))
    } catch {
      // ignore storage error
    }
    void saveSafariProgressAction(newProg)
  }

  const handleSelectBiome = (biomeId: SafariBiomeType) => {
    setSelectedBiome(biomeId)
    synthRef.current?.playWoodblock()
  }

  const handleCaptureAnimal = (optionIndex: number) => {
    if (!activeCameraAnimalId) return
    const result = recordSnapshot(progress, activeCameraAnimalId, optionIndex)
    if (result.success) {
      persistProgress(result.updatedProgress)
    }
    setActiveCameraAnimalId(null)
  }

  const handleResetProgress = () => {
    const cleanProgress = getDefaultSafariProgress()
    persistProgress(cleanProgress)
  }

  const activeBiomeDef = getBiomeById(selectedBiome) || biomes[0]
  const currentAnimals = getAnimalsByBiome(selectedBiome)
  const activeAnimalForCamera = activeCameraAnimalId ? getAnimalById(activeCameraAnimalId) : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <SafariHeaderBar
        explorerRank={progress.explorerRank}
        totalPhotos={progress.totalPhotosCaptured}
        totalAvailable={16}
        onOpenFieldGuide={() => setIsFieldGuideOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
            <span>Thám Hiểm Safari Ngữ Âm 🦁</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium pt-1">
            Khám phá thế giới hoang dã, ngắm qua ống nhòm và giải mã âm vị để chụp lại những bức ảnh động vật tuyệt đẹp!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-base shrink-0">
          <Compass className="size-5 text-emerald-600" />
          <span>Sinh cảnh: {activeBiomeDef.nameVi}</span>
        </div>
      </div>

      {/* Biome Tabs */}
      <SafariBiomeSelector
        biomes={biomes}
        selectedBiome={selectedBiome}
        completedBiomes={progress.completedBiomes}
        onSelectBiome={handleSelectBiome}
      />

      {/* Active Habitat Landscape Panorama Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-linear-to-r ${activeBiomeDef.backgroundGradient} border-2 border-slate-200/80 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4`}
      >
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs text-slate-900 font-black text-base border border-slate-200">
            <Sparkles className="size-4 text-amber-500" />
            <span>Môi Trường Sống Hoang Dã</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeBiomeDef.nameVi} ({activeBiomeDef.nameEn})
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-medium max-w-2xl">
            {activeBiomeDef.descriptionVi}
          </p>
        </div>

        <div className="text-center md:text-right">
          <span className="text-base font-bold text-slate-600 block">Tiến độ sinh cảnh:</span>
          <span className="text-2xl font-black text-emerald-700">
            {
              currentAnimals.filter((a) => progress.photographedAnimalIds.includes(a.id))
                .length
            }
            /4 loài đã chụp
          </span>
        </div>
      </div>

      {/* 4 Animals Cards in Active Biome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentAnimals.map((animal) => {
          const isCaptured = progress.photographedAnimalIds.includes(animal.id)

          return (
            <article
              key={animal.id}
              data-testid={`safari-animal-card-${animal.id}`}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border-4 border-slate-200 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Photo status badge & Pronounce trigger */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full font-black text-base border ${
                      isCaptured
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                    }`}
                  >
                    {isCaptured ? '📸 Đã Chụp' : '🔍 Chưa Chụp'}
                  </span>

                  <button
                    type="button"
                    onClick={() => speak(animal.nameEn, { rate: 0.85 })}
                    aria-label={`Nghe phát âm ${animal.nameEn}`}
                    className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Animal Emoji & Name */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="size-24 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform">
                    {animal.emoji}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-3 group-hover:text-amber-600 transition-colors">
                    {animal.nameVi}
                  </h3>
                  <p className="text-base font-bold text-amber-700">
                    {animal.nameEn} ({animal.syllables.join(' - ')})
                  </p>
                </div>

                {/* Phonics Rule Note */}
                <p className="text-base text-slate-600 font-medium text-center">
                  🎯 {animal.phonicsFocus}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setActiveCameraAnimalId(animal.id)}
                aria-label={`Chụp ảnh ${animal.nameVi}`}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                  isCaptured
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300 hover:scale-102 active:scale-98'
                }`}
              >
                <Camera className="size-5" />
                <span>{isCaptured ? 'Chụp Lại Thử Thách' : 'Chụp Ảnh Ngay'}</span>
              </button>
            </article>
          )
        })}
      </div>

      {/* Camera Viewfinder Modal */}
      {activeAnimalForCamera && (
        <SafariCameraModal
          animal={activeAnimalForCamera}
          isAlreadyCaptured={progress.photographedAnimalIds.includes(activeAnimalForCamera.id)}
          onCapture={handleCaptureAnimal}
          onClose={() => setActiveCameraAnimalId(null)}
          playChimeSound={() => synthRef.current?.playChime()}
          playKickSound={() => synthRef.current?.playKick()}
        />
      )}

      {/* Field Guide Modal */}
      {isFieldGuideOpen && (
        <SafariFieldGuideModal
          photographedAnimalIds={progress.photographedAnimalIds}
          onClose={() => setIsFieldGuideOpen(false)}
        />
      )}
    </div>
  )
}
