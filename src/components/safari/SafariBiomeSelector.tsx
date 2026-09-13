// src/components/safari/SafariBiomeSelector.tsx
'use client'

import React from 'react'
import type { SafariBiomeType, SafariBiomeDefinition } from '@/types/phonics-safari'
import { CheckCircle2 } from 'lucide-react'

interface SafariBiomeSelectorProps {
  biomes: SafariBiomeDefinition[]
  selectedBiome: SafariBiomeType
  completedBiomes: SafariBiomeType[]
  onSelectBiome: (biome: SafariBiomeType) => void
}

const BIOME_EMOJIS: Record<SafariBiomeType, string> = {
  savanna: '🦁',
  rainforest: '🦜',
  arctic: '🐻‍❄️',
  ocean: '🐬',
}

export function SafariBiomeSelector({
  biomes,
  selectedBiome,
  completedBiomes,
  onSelectBiome,
}: SafariBiomeSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Chọn môi trường thám hiểm Safari"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {biomes.map((biome) => {
        const isSelected = selectedBiome === biome.id
        const isCompleted = completedBiomes.includes(biome.id)
        const emoji = BIOME_EMOJIS[biome.id] || '🧭'

        return (
          <button
            key={biome.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectBiome(biome.id)}
            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isSelected
                ? 'bg-slate-900 border-amber-400 text-white shadow-lg scale-102 ring-2 ring-amber-400/40'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl">{emoji}</span>
              {isCompleted && (
                <CheckCircle2
                  className="size-5 text-emerald-400 shrink-0"
                  aria-label="Đã hoàn thành sinh cảnh này"
                />
              )}
            </div>
            <span className="text-base sm:text-lg font-black text-center">
              {biome.nameVi}
            </span>
            <span
              className={`text-base font-medium ${
                isSelected ? 'text-amber-300' : 'text-slate-500'
              }`}
            >
              {biome.nameEn}
            </span>
          </button>
        )
      })}
    </div>
  )
}
