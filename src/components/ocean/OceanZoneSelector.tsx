// src/components/ocean/OceanZoneSelector.tsx
'use client'

import React from 'react'
import type { OceanDepthZone, OceanZoneDefinition } from '@/types/phonics-ocean'
import { Lock } from 'lucide-react'

interface OceanZoneSelectorProps {
  zones: OceanZoneDefinition[]
  selectedZone: OceanDepthZone
  completedMissionIds: string[]
  onSelectZone: (zoneId: OceanDepthZone) => void
}

const ZONE_EMOJIS: Record<OceanDepthZone, string> = {
  sunlight: '🐠',
  twilight: '🦑',
  midnight: '🐋',
  abyss: '🪼',
}

export function OceanZoneSelector({
  zones,
  selectedZone,
  completedMissionIds,
  onSelectZone,
}: OceanZoneSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Chọn độ sâu đại dương"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {zones.map((zone) => {
        const isSelected = selectedZone === zone.id
        const isLocked = completedMissionIds.length < zone.requiredMissions
        const emoji = ZONE_EMOJIS[zone.id] || '🫧'

        return (
          <button
            key={zone.id}
            role="tab"
            aria-selected={isSelected}
            disabled={isLocked}
            onClick={() => onSelectZone(zone.id)}
            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
              isLocked
                ? 'opacity-60 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : isSelected
                ? 'bg-slate-900 border-cyan-400 text-white shadow-lg scale-102 ring-2 ring-cyan-400/40 cursor-pointer'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl">{emoji}</span>
              {isLocked ? (
                <Lock className="size-5 text-slate-400" aria-label="Khu vực chưa mở khóa" />
              ) : null}
            </div>
            <span className="text-base sm:text-lg font-black text-center">
              {zone.nameVi}
            </span>
            <span
              className={`text-base font-medium ${
                isSelected ? 'text-cyan-300' : 'text-slate-500'
              }`}
            >
              {zone.depthRange}
            </span>
            {isLocked && (
              <span className="text-base font-bold text-amber-600">
                Cần {zone.requiredMissions} nhiệm vụ
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
