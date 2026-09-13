// src/components/ocean/OceanCompendiumModal.tsx
'use client'

import React from 'react'
import { X, BookOpen, Volume2, CheckCircle2, Lock, Waves } from 'lucide-react'
import { getAllMissions } from '@/lib/phonics-ocean-engine'
import { useSpeech } from '@/hooks/useSpeech'

interface OceanCompendiumModalProps {
  completedMissionIds: string[]
  onClose: () => void
}

export function OceanCompendiumModal({
  completedMissionIds,
  onClose,
}: OceanCompendiumModalProps) {
  const { speak } = useSpeech()
  const allMissions = getAllMissions()
  const completedCount = completedMissionIds.length

  const handlePronounce = (nameEn: string) => {
    speak(nameEn)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bách khoa sinh vật đại dương"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900 border-4 border-cyan-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400">
              <BookOpen className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-cyan-400">
                Bách Khoa Sinh Vật Đại Dương
              </h2>
              <p className="text-base text-slate-300 font-medium">
                Bộ sưu tập sinh vật biển & quy tắc phát âm ({completedCount}/12 nhiệm vụ)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bách khoa đại dương"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allMissions.map((mission) => {
            const isCompleted = completedMissionIds.includes(mission.id)

            if (!isCompleted) {
              return (
                <div
                  key={mission.id}
                  className="p-5 rounded-3xl bg-slate-800/40 border-2 border-dashed border-slate-700 flex items-center gap-4 opacity-75"
                >
                  <div className="size-18 rounded-2xl bg-slate-800 flex items-center justify-center text-4xl grayscale">
                    <Lock className="size-8 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-400">
                      Sinh Vật Chưa Khám Phá ({mission.zoneId.toUpperCase()})
                    </h3>
                    <p className="text-base text-slate-500">
                      Hãy lặn xuống vùng biển tương ứng và giải mã sóng sonar để mở khóa!
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={mission.id}
                className="p-5 rounded-3xl bg-slate-800/90 border-2 border-cyan-400/60 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <span className="text-5xl">{mission.creatureEmoji}</span>
                    <div>
                      <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{mission.nameVi}</span>
                        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                      </h3>
                      <p className="text-base font-bold text-cyan-300">
                        {mission.creatureName} ({mission.challenge.targetWord})
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePronounce(mission.challenge.targetWord)}
                    aria-label={`Nghe phát âm ${mission.challenge.targetWord}`}
                    className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-transform active:scale-95 cursor-pointer shrink-0"
                  >
                    <Volume2 className="size-5" />
                  </button>
                </div>

                {/* Phonics Focus & Syllable Breakdown */}
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-base text-slate-200">
                  <span className="text-amber-400 font-bold">🎯 Trọng tâm âm: </span>
                  {mission.challenge.phonicsFocus}
                  <div className="mt-1 text-cyan-300 font-bold">
                    Cấu trúc âm: {mission.challenge.phoneticBreakdown.join(' • ')}
                  </div>
                </div>

                {/* Marine Biology Fact */}
                <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-900/50 text-base text-cyan-200 flex items-start gap-2">
                  <Waves className="size-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{mission.challenge.marineFact}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
