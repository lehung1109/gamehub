// src/components/space/SpaceSectorSelector.tsx
'use client'

import React from 'react'
import type { SpaceSectorType, SpaceSectorDefinition } from '@/types/phonics-space'
import { CheckCircle2 } from 'lucide-react'

interface SpaceSectorSelectorProps {
  sectors: SpaceSectorDefinition[]
  selectedSector: SpaceSectorType
  completedSectors: SpaceSectorType[]
  onSelectSector: (sector: SpaceSectorType) => void
}

const SECTOR_EMOJIS: Record<SpaceSectorType, string> = {
  mars: '🚀',
  saturn: '🪐',
  neptune: '❄️',
  galaxy: '🌌',
}

export function SpaceSectorSelector({
  sectors,
  selectedSector,
  completedSectors,
  onSelectSector,
}: SpaceSectorSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Chọn phân khu thiên hà vũ trụ"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {sectors.map((sector) => {
        const isSelected = selectedSector === sector.id
        const isCompleted = completedSectors.includes(sector.id)
        const emoji = SECTOR_EMOJIS[sector.id] || '🛰️'

        return (
          <button
            key={sector.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectSector(sector.id)}
            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isSelected
                ? 'bg-slate-900 border-cyan-400 text-white shadow-lg scale-102 ring-2 ring-cyan-400/40'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl">{emoji}</span>
              {isCompleted && (
                <CheckCircle2
                  className="size-5 text-emerald-400 shrink-0"
                  aria-label="Đã hoàn thành phân khu này"
                />
              )}
            </div>
            <span className="text-base sm:text-lg font-black text-center">
              {sector.nameVi}
            </span>
            <span
              className={`text-base font-medium ${
                isSelected ? 'text-cyan-300' : 'text-slate-500'
              }`}
            >
              {sector.nameEn}
            </span>
          </button>
        )
      })}
    </div>
  )
}
