// src/components/town/PhonicsTownGrid.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Plus,
  ArrowUpCircle,
  MessageCircle,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react'
import type { TownState, BuildingType } from '@/types/phonics-town'
import {
  getDefaultTownState,
  getBuildingDefinition,
  constructOrUpgradeBuilding,
  completeResidentQuest,
  getBuildingCost,
  canAffordBuilding,
} from '@/lib/phonics-town-engine'
import { saveTownStateAction } from '@/app/actions/phonics-town'
import {
  createRhythmSynthesizer,
  SoundSynthesizer,
} from '@/lib/rhythm-beat-synthesizer'
import { TownHeaderBar } from './TownHeaderBar'
import { TownBuildMenuModal } from './TownBuildMenuModal'
import { TownResidentQuestModal } from './TownResidentQuestModal'

const STORAGE_KEY = 'gamehub_phonics_town_state'

interface PhonicsTownGridProps {
  initialState?: TownState
}

export function PhonicsTownGrid({ initialState }: PhonicsTownGridProps) {
  const [townState, setTownState] = useState<TownState>(
    initialState || getDefaultTownState()
  )
  const [activeBuildSlot, setActiveBuildSlot] = useState<number | null>(null)
  const [activeQuestSlot, setActiveQuestSlot] = useState<number | null>(null)

  const synthRef = useRef<SoundSynthesizer | null>(null)

  useEffect(() => {
    synthRef.current = createRhythmSynthesizer()
    // Load from localStorage if available
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as TownState
        if (parsed && Array.isArray(parsed.buildings)) {
          setTimeout(() => {
            setTownState(parsed)
          }, 0)
        }
      }
    } catch {
      // fallback to default
    }
    return () => {
      void synthRef.current?.close()
    }
  }, [])

  const persistState = (newState: TownState) => {
    setTownState(newState)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch {
      // ignore
    }
    saveTownStateAction(newState).catch((err) => {
      console.error('Failed to sync town state:', err)
    })
  }

  const handleBuild = (type: BuildingType) => {
    if (activeBuildSlot === null) return

    const nextState = constructOrUpgradeBuilding(townState, activeBuildSlot, type)
    synthRef.current?.playChime()
    persistState(nextState)
    setActiveBuildSlot(null)
  }

  const handleUpgrade = (slotIndex: number, type: BuildingType) => {
    const nextState = constructOrUpgradeBuilding(townState, slotIndex, type)
    synthRef.current?.playChime()
    persistState(nextState)
  }

  const handleCompleteQuest = (slotIndex: number) => {
    const nextState = completeResidentQuest(townState, slotIndex)
    persistState(nextState)
    setActiveQuestSlot(null)
  }

  const handleResetTown = () => {
    const cleanState = getDefaultTownState()
    persistState(cleanState)
  }

  const alreadyBuiltTypes = new Set(townState.buildings.map((b) => b.type))
  const activeQuestBuilding =
    activeQuestSlot !== null
      ? townState.buildings.find((b) => b.slotIndex === activeQuestSlot)
      : null
  const activeQuestDef = activeQuestBuilding
    ? getBuildingDefinition(activeQuestBuilding.type)
    : null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Header Stats */}
      <TownHeaderBar
        bricks={townState.bricks}
        prosperityStars={townState.prosperityStars}
        mayorRank={townState.mayorRank}
        onResetTown={handleResetTown}
      />

      {/* Town Overview Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 flex items-center gap-2">
            <span>Thành Phố Ngữ Âm Phonics 🏙️</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium pt-1">
            Xây dựng các công trình, gặp gỡ cư dân và hoàn thành nhiệm vụ từ vựng mỗi ngày!
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 border border-amber-300 text-amber-950 font-black text-base">
          <Sparkles className="size-5 text-amber-600" />
          <span>Nhiệm vụ đã làm: {townState.totalQuestsCompleted}</span>
        </div>
      </div>

      {/* 6-Slot Construction Site Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, slotIndex) => {
          const placed = townState.buildings.find((b) => b.slotIndex === slotIndex)

          if (!placed) {
            return (
              <div
                key={slotIndex}
                data-testid={`town-slot-${slotIndex}`}
                className="flex flex-col items-center justify-center p-8 rounded-3xl border-4 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/70 hover:bg-amber-50/50 transition-all min-h-[280px] group"
              >
                <div className="p-4 rounded-2xl bg-white shadow-inner text-slate-400 group-hover:text-amber-500 group-hover:scale-110 transition-all">
                  <Building2 className="size-10" />
                </div>
                <span className="text-lg font-black text-slate-700 group-hover:text-amber-900 pt-3">
                  Ô Đất Trống #{slotIndex + 1}
                </span>
                <p className="text-base text-slate-500 font-medium text-center pb-4">
                  Sẵn sàng quy hoạch công trình mới
                </p>

                <button
                  type="button"
                  onClick={() => setActiveBuildSlot(slotIndex)}
                  aria-label={`Xây dựng công trình tại ô ${slotIndex + 1}`}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base inline-flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all"
                >
                  <Plus className="size-5" />
                  <span>Xây Công Trình</span>
                </button>
              </div>
            )
          }

          const def = getBuildingDefinition(placed.type)
          if (!def) return null

          const stage = def.stages[placed.level]
          const isMaxLevel = placed.level >= 3
          const nextLevel = (placed.level + 1) as 1 | 2 | 3
          const nextCost = !isMaxLevel ? getBuildingCost(placed.type, nextLevel) : 0
          const canUpgrade = !isMaxLevel && canAffordBuilding(townState.bricks, placed.type, nextLevel)

          return (
            <article
              key={slotIndex}
              data-testid={`town-building-card-${placed.type}`}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border-4 border-slate-200 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all space-y-5 group"
            >
              <div className="space-y-3">
                {/* Header: Level Badge & Resident Trigger */}
                <div className="flex items-center justify-between">
                  <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-base border border-amber-300">
                    Cấp {placed.level}: {stage.nameVi}
                  </span>

                  {/* Resident NPC Quest Button */}
                  <button
                    type="button"
                    onClick={() => setActiveQuestSlot(slotIndex)}
                    aria-label={`Gặp cư dân ${def.residentNpc}`}
                    className={`p-2.5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all shadow-sm ${
                      placed.isQuestCompletedToday
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 ring-2 ring-amber-300 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span className="text-2xl">{def.quest.npcAvatar}</span>
                    <span className="text-base font-black">
                      {placed.isQuestCompletedToday ? 'Đã Gặp' : 'Nhiệm Vụ'}
                    </span>
                    {placed.isQuestCompletedToday ? (
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    ) : (
                      <MessageCircle className="size-4 text-slate-950" />
                    )}
                  </button>
                </div>

                {/* Building Visual & Info */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="size-20 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-5xl shadow-inner group-hover:scale-110 transition-transform">
                    {stage.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      {def.categoryNameVi}
                    </h2>
                    <p className="text-base font-bold text-slate-500">
                      {def.categoryNameEn}
                    </p>
                    <span className="inline-block text-base font-bold text-amber-700">
                      +{stage.prosperityReward} 🌟 Thịnh vượng
                    </span>
                  </div>
                </div>

                <p className="text-base text-slate-700 font-medium">
                  🎯 {def.targetPhonics}
                </p>
              </div>

              {/* Upgrade Action Bar */}
              <div className="pt-2 border-t border-slate-100">
                {isMaxLevel ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-black text-base text-center">
                    👑 Đạt Cấp Tối Đa (Hoàng Gia)
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpgrade(slotIndex, placed.type)}
                    disabled={!canUpgrade}
                    aria-label={`Nâng cấp lên cấp ${nextLevel}`}
                    className={`w-full py-3 px-4 rounded-xl font-black text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                      canUpgrade
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:scale-102 shadow-amber-500/25'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpCircle className="size-5" />
                    <span>
                      {canUpgrade
                        ? `Nâng Cấp Lv${nextLevel} (${nextCost} 🧱)`
                        : `Cần ${nextCost} 🧱 để nâng cấp`}
                    </span>
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Build Menu Modal */}
      {activeBuildSlot !== null && (
        <TownBuildMenuModal
          slotIndex={activeBuildSlot}
          availableBricks={townState.bricks}
          alreadyBuiltTypes={alreadyBuiltTypes}
          onSelectBuilding={handleBuild}
          onClose={() => setActiveBuildSlot(null)}
        />
      )}

      {/* Resident Quest Modal */}
      {activeQuestSlot !== null && activeQuestDef && activeQuestBuilding && (
        <TownResidentQuestModal
          buildingDef={activeQuestDef}
          isCompleted={Boolean(activeQuestBuilding.isQuestCompletedToday)}
          onComplete={() => handleCompleteQuest(activeQuestSlot)}
          onClose={() => setActiveQuestSlot(null)}
        />
      )}
    </div>
  )
}
