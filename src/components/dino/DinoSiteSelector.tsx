// src/components/dino/DinoSiteSelector.tsx
'use client'

import React from 'react'
import type { GeologicalEraId, GeologicalEraDefinition } from '@/types/phonics-dino'
import { Lock } from 'lucide-react'

interface DinoSiteSelectorProps {
  eras: GeologicalEraDefinition[]
  selectedEra: GeologicalEraId
  completedFossilIds: string[]
  onSelectEra: (eraId: GeologicalEraId) => void
}

export function DinoSiteSelector({
  eras,
  selectedEra,
  completedFossilIds,
  onSelectEra,
}: DinoSiteSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Chọn kỷ nguyên khảo cổ khủng long"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {eras.map((era) => {
        const isSelected = selectedEra === era.id
        const isLocked = completedFossilIds.length < era.requiredFossils

        return (
          <button
            key={era.id}
            role="tab"
            aria-selected={isSelected}
            disabled={isLocked}
            onClick={() => onSelectEra(era.id)}
            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
              isLocked
                ? 'opacity-60 bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                : isSelected
                ? 'bg-stone-900 border-emerald-400 text-white shadow-lg scale-102 ring-2 ring-emerald-400/40 cursor-pointer'
                : 'bg-white border-stone-200 hover:border-stone-300 text-stone-800 hover:bg-stone-50 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl">{era.eraEmoji}</span>
              {isLocked ? (
                <Lock className="size-5 text-stone-400" aria-label="Kỷ nguyên chưa mở khóa" />
              ) : null}
            </div>
            <span className="text-base sm:text-lg font-black text-center">
              {era.nameVi}
            </span>
            <span
              className={`text-base font-medium ${
                isSelected ? 'text-emerald-300' : 'text-stone-500'
              }`}
            >
              {era.nameEn}
            </span>
            {isLocked && (
              <span className="text-base font-bold text-amber-600">
                Cần {era.requiredFossils} hóa thạch
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
