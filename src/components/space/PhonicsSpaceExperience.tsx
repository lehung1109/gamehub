// src/components/space/PhonicsSpaceExperience.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  getAllSectors,
  getSectorById,
  getMissionsBySector,
  getMissionById,
  getDefaultSpaceProgress,
  completeMission,
} from '@/lib/phonics-space-engine'
import type { SpaceSectorType, SpaceProgress } from '@/types/phonics-space'
import { SpaceHeaderBar } from './SpaceHeaderBar'
import { SpaceSectorSelector } from './SpaceSectorSelector'
import { CosmicRoverModal } from './CosmicRoverModal'
import { SpaceCompendiumModal } from './SpaceCompendiumModal'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { saveSpaceProgressAction } from '@/app/actions/phonics-space'
import { Rocket, Volume2, Sparkles, Orbit } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

const STORAGE_KEY = 'gamehub_phonics_space_v1'

interface PhonicsSpaceExperienceProps {
  initialProgress?: SpaceProgress
}

export function PhonicsSpaceExperience({ initialProgress }: PhonicsSpaceExperienceProps) {
  const { speak } = useSpeech()
  const sectors = getAllSectors()
  const [selectedSector, setSelectedSector] = useState<SpaceSectorType>('mars')
  const [progress, setProgress] = useState<SpaceProgress>(
    initialProgress || getDefaultSpaceProgress()
  )
  const [activeRoverMissionId, setActiveRoverMissionId] = useState<string | null>(null)
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    // Hydrate from localStorage asynchronously
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as SpaceProgress
        if (parsed && Array.isArray(parsed.completedMissionIds)) {
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

  const persistProgress = (newProg: SpaceProgress) => {
    setProgress(newProg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg))
    } catch {
      // ignore storage error
    }
    void saveSpaceProgressAction(newProg)
  }

  const handleSelectSector = (sectorId: SpaceSectorType) => {
    setSelectedSector(sectorId)
    synthRef.current?.playWoodblock()
  }

  const handleMissionComplete = (optionIndex: number) => {
    if (!activeRoverMissionId) return
    const result = completeMission(progress, activeRoverMissionId, optionIndex)
    if (result.success) {
      persistProgress(result.updatedProgress)
    }
    setActiveRoverMissionId(null)
  }

  const handleResetProgress = () => {
    const cleanProgress = getDefaultSpaceProgress()
    persistProgress(cleanProgress)
  }

  const activeSectorDef = getSectorById(selectedSector) || sectors[0]
  const currentMissions = getMissionsBySector(selectedSector)
  const activeMissionForRover = activeRoverMissionId
    ? getMissionById(activeRoverMissionId)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <SpaceHeaderBar
        astronautRank={progress.astronautRank}
        totalCompleted={progress.completedMissionIds.length}
        totalAvailable={12}
        cosmicCrystals={progress.cosmicCrystals}
        onOpenCompendium={() => setIsCompendiumOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
            <span>Thám Hiểm Vũ Trụ Phonics 🚀</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium pt-1">
            Điều khiển phi thuyền qua các phân khu thiên hà, giải mã tín hiệu vô tuyến và chinh phục 12 nhiệm vụ tinh tú!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-100 border border-cyan-300 text-cyan-950 font-black text-base shrink-0">
          <Orbit className="size-5 text-cyan-600" />
          <span>Phân khu: {activeSectorDef.nameVi}</span>
        </div>
      </div>

      {/* Sector Selector Tabs */}
      <SpaceSectorSelector
        sectors={sectors}
        selectedSector={selectedSector}
        completedSectors={progress.completedSectors}
        onSelectSector={handleSelectSector}
      />

      {/* Active Sector Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-linear-to-r ${activeSectorDef.backgroundGradient} border-2 border-slate-200/80 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4`}
      >
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs text-slate-900 font-black text-base border border-slate-200">
            <Sparkles className="size-4 text-cyan-500" />
            <span>Không Gian Khám Phá</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {activeSectorDef.nameVi} ({activeSectorDef.nameEn})
          </h2>
          <p className="text-base sm:text-lg text-slate-700 font-medium max-w-2xl">
            {activeSectorDef.descriptionVi}
          </p>
        </div>

        <div className="text-center md:text-right">
          <span className="text-base font-bold text-slate-600 block">Nhiệm vụ hoàn thành:</span>
          <span className="text-2xl font-black text-cyan-800">
            {
              currentMissions.filter((m) => progress.completedMissionIds.includes(m.id))
                .length
            }
            /3 nhiệm vụ
          </span>
        </div>
      </div>

      {/* 3 Missions Cards in Current Sector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentMissions.map((mission) => {
          const isCompleted = progress.completedMissionIds.includes(mission.id)

          return (
            <article
              key={mission.id}
              data-testid={`space-mission-card-${mission.id}`}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border-4 border-slate-200 hover:border-cyan-400 shadow-lg hover:shadow-xl transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header Status & Pronounce */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full font-black text-base border ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-amber-100 text-amber-950 border-amber-300'
                    }`}
                  >
                    {isCompleted ? '⭐ Đã Khám Phá' : '🚀 Chưa Khám Phá'}
                  </span>

                  <button
                    type="button"
                    onClick={() => speak(mission.nameEn)}
                    aria-label={`Nghe phát âm ${mission.nameEn}`}
                    className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Mission Emoji & Info */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="size-24 rounded-3xl bg-cyan-50 border-2 border-cyan-200 flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform">
                    {mission.emoji}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-3 group-hover:text-cyan-600 transition-colors">
                    {mission.nameVi}
                  </h3>
                  <p className="text-base font-bold text-cyan-700">
                    {mission.nameEn}
                  </p>
                </div>

                {/* Phonics Target */}
                <p className="text-base text-slate-600 font-medium text-center">
                  🎯 {mission.targetPhonics}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setActiveRoverMissionId(mission.id)}
                aria-label={`Thực hiện nhiệm vụ ${mission.nameVi}`}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                  isCompleted
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 ring-2 ring-cyan-300 hover:scale-102 active:scale-98'
                }`}
              >
                <Rocket className="size-5" />
                <span>{isCompleted ? 'Khám Phá Lại' : 'Bắt Đầu Nhiệm Vụ'}</span>
              </button>
            </article>
          )
        })}
      </div>

      {/* Cosmic Rover Landing Modal */}
      {activeMissionForRover && (
        <CosmicRoverModal
          mission={activeMissionForRover}
          isAlreadyCompleted={progress.completedMissionIds.includes(activeMissionForRover.id)}
          onMissionComplete={handleMissionComplete}
          onClose={() => setActiveRoverMissionId(null)}
          playChimeSound={() => synthRef.current?.playChime()}
          playKickSound={() => synthRef.current?.playKick()}
        />
      )}

      {/* Space Compendium Modal */}
      {isCompendiumOpen && (
        <SpaceCompendiumModal
          completedMissionIds={progress.completedMissionIds}
          onClose={() => setIsCompendiumOpen(false)}
        />
      )}
    </div>
  )
}
