// src/components/ocean/PhonicsOceanExperience.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  getAllZones,
  getZoneById,
  getMissionsByZone,
  getMissionById,
  getDefaultOceanProgress,
  completeOceanMission,
} from '@/lib/phonics-ocean-engine'
import type { OceanDepthZone, OceanProgress } from '@/types/phonics-ocean'
import { OceanHeaderBar } from './OceanHeaderBar'
import { OceanZoneSelector } from './OceanZoneSelector'
import { SubmarineSonarModal } from './SubmarineSonarModal'
import { OceanCompendiumModal } from './OceanCompendiumModal'
import { createRhythmSynthesizer, type SoundSynthesizer } from '@/lib/rhythm-beat-synthesizer'
import { saveOceanProgressAction } from '@/app/actions/phonics-ocean'
import { Waves, Volume2, Sparkles, Compass } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'

const STORAGE_KEY = 'gamehub_phonics_ocean_v1'

interface PhonicsOceanExperienceProps {
  initialProgress?: OceanProgress
}

export function PhonicsOceanExperience({ initialProgress }: PhonicsOceanExperienceProps) {
  const { speak } = useSpeech()
  const zones = getAllZones()
  const [selectedZone, setSelectedZone] = useState<OceanDepthZone>('sunlight')
  const [progress, setProgress] = useState<OceanProgress>(
    initialProgress || getDefaultOceanProgress()
  )
  const [activeSonarMissionId, setActiveSonarMissionId] = useState<string | null>(null)
  const [isCompendiumOpen, setIsCompendiumOpen] = useState(false)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    // Hydrate from localStorage asynchronously
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as OceanProgress
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

  const persistProgress = (newProg: OceanProgress) => {
    setProgress(newProg)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProg))
    } catch {
      // ignore storage error
    }
    void saveOceanProgressAction(newProg)
  }

  const handleSelectZone = (zoneId: OceanDepthZone) => {
    setSelectedZone(zoneId)
    synthRef.current?.playWoodblock()
  }

  const handleMissionComplete = () => {
    if (!activeSonarMissionId) return
    const updated = completeOceanMission(progress, activeSonarMissionId)
    persistProgress(updated)
    setActiveSonarMissionId(null)
  }

  const handleResetProgress = () => {
    const cleanProgress = getDefaultOceanProgress()
    persistProgress(cleanProgress)
  }

  const activeZoneDef = getZoneById(selectedZone) || zones[0]
  const currentMissions = getMissionsByZone(selectedZone)
  const activeMissionForSonar = activeSonarMissionId
    ? getMissionById(activeSonarMissionId)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header Bar */}
      <OceanHeaderBar
        diverRank={progress.diverRank}
        totalCompleted={progress.completedMissionIds.length}
        totalAvailable={12}
        pearls={progress.pearls}
        onOpenCompendium={() => setIsCompendiumOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
            <span>Thám Hiểm Đại Dương & Tàu Ngầm Ngữ Âm 🐬</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium pt-1">
            Đồng hành cùng Thuyền trưởng Coral và Tàu ngầm Nautilus lặn sâu qua 4 tầng biển, giải mã sóng sonar và thu thập ngọc trai quý!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-100 border border-cyan-300 text-cyan-950 font-black text-base shrink-0">
          <Compass className="size-5 text-cyan-600" />
          <span>Tầng Biển: {activeZoneDef.nameVi}</span>
        </div>
      </div>

      {/* Depth Zone Selector */}
      <OceanZoneSelector
        zones={zones}
        selectedZone={selectedZone}
        completedMissionIds={progress.completedMissionIds}
        onSelectZone={handleSelectZone}
      />

      {/* Active Zone Depth Info Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-linear-to-r ${activeZoneDef.bgGradient} border-2 border-slate-200/80 shadow-inner flex flex-col md:flex-row md:items-center justify-between gap-4 text-white`}
      >
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white font-black text-base border border-white/30">
            <Sparkles className="size-4 text-cyan-300" />
            <span>Độ Sâu: {activeZoneDef.depthRange}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-cyan-200">
            {activeZoneDef.nameVi} ({activeZoneDef.nameEn})
          </h2>
          <p className="text-base sm:text-lg text-slate-200 font-medium max-w-2xl">
            {activeZoneDef.descriptionVi}
          </p>
        </div>

        <div className="text-left md:text-right">
          <span className="text-base font-bold text-slate-300 block">Nhiệm vụ hoàn thành:</span>
          <span className="text-2xl font-black text-cyan-300">
            {
              currentMissions.filter((m) => progress.completedMissionIds.includes(m.id))
                .length
            }
            /3 nhiệm vụ
          </span>
        </div>
      </div>

      {/* 3 Missions Cards for Current Depth Zone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentMissions.map((mission) => {
          const isCompleted = progress.completedMissionIds.includes(mission.id)

          return (
            <article
              key={mission.id}
              data-testid={`ocean-mission-card-${mission.id}`}
              className="flex flex-col justify-between p-6 rounded-3xl bg-white border-4 border-slate-200 hover:border-cyan-400 shadow-lg hover:shadow-xl transition-all space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header Status & Pronounce */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full font-black text-base border ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-cyan-100 text-cyan-950 border-cyan-300'
                    }`}
                  >
                    {isCompleted ? '⭐ Đã Khám Phá' : '🫧 Chưa Khám Phá'}
                  </span>

                  <button
                    type="button"
                    onClick={() => speak(mission.challenge.targetWord)}
                    aria-label={`Nghe phát âm ${mission.nameEn}`}
                    className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Creature Emoji & Info */}
                <div className="flex flex-col items-center text-center pt-2">
                  <div className="size-24 rounded-3xl bg-cyan-50 border-2 border-cyan-200 flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform">
                    {mission.creatureEmoji}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-3 group-hover:text-cyan-600 transition-colors">
                    {mission.nameVi}
                  </h3>
                  <p className="text-base font-bold text-cyan-700">
                    {mission.creatureName} ({mission.challenge.targetWord})
                  </p>
                </div>

                {/* Phonics Target */}
                <p className="text-base text-slate-600 font-medium text-center">
                  🎯 {mission.challenge.phonicsFocus}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setActiveSonarMissionId(mission.id)}
                aria-label={`Thực hiện nhiệm vụ ${mission.nameVi}`}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                  isCompleted
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 ring-2 ring-cyan-300 hover:scale-102 active:scale-98'
                }`}
              >
                <Waves className="size-5" />
                <span>{isCompleted ? 'Lặn Lại Khám Phá' : 'Bắt Đầu Lặn Sâu'}</span>
              </button>
            </article>
          )
        })}
      </div>

      {/* Submarine Sonar Modal */}
      {activeMissionForSonar && (
        <SubmarineSonarModal
          mission={activeMissionForSonar}
          isAlreadyCompleted={progress.completedMissionIds.includes(activeMissionForSonar.id)}
          onMissionComplete={handleMissionComplete}
          onClose={() => setActiveSonarMissionId(null)}
          playChimeSound={() => synthRef.current?.playChime()}
          playKickSound={() => synthRef.current?.playKick()}
        />
      )}

      {/* Ocean Compendium Modal */}
      {isCompendiumOpen && (
        <OceanCompendiumModal
          completedMissionIds={progress.completedMissionIds}
          onClose={() => setIsCompendiumOpen(false)}
        />
      )}
    </div>
  )
}
