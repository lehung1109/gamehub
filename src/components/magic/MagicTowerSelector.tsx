// src/components/magic/MagicTowerSelector.tsx
'use client'

import React from 'react'
import type { ElementalTowerId, ElementalTowerDefinition } from '@/types/phonics-magic'
import { Lock } from 'lucide-react'

interface MagicTowerSelectorProps {
  towers: ElementalTowerDefinition[]
  selectedTower: ElementalTowerId
  completedSpellIds: string[]
  onSelectTower: (towerId: ElementalTowerId) => void
}

export function MagicTowerSelector({
  towers,
  selectedTower,
  completedSpellIds,
  onSelectTower,
}: MagicTowerSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Chọn tháp nguyên tố ma thuật"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {towers.map((tower) => {
        const isSelected = selectedTower === tower.id
        const isLocked = completedSpellIds.length < tower.requiredSpells

        return (
          <button
            key={tower.id}
            role="tab"
            aria-selected={isSelected}
            disabled={isLocked}
            onClick={() => onSelectTower(tower.id)}
            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
              isLocked
                ? 'opacity-60 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                : isSelected
                ? 'bg-slate-900 border-purple-400 text-white shadow-lg scale-102 ring-2 ring-purple-400/40 cursor-pointer'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-3xl">{tower.elementEmoji}</span>
              {isLocked ? (
                <Lock className="size-5 text-slate-400" aria-label="Tháp ma thuật chưa mở khóa" />
              ) : null}
            </div>
            <span className="text-base sm:text-lg font-black text-center">
              {tower.nameVi}
            </span>
            <span
              className={`text-base font-medium ${
                isSelected ? 'text-purple-300' : 'text-slate-500'
              }`}
            >
              {tower.nameEn}
            </span>
            {isLocked && (
              <span className="text-base font-bold text-amber-600">
                Cần {tower.requiredSpells} thần chú
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
