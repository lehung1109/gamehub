// src/components/kitchen/KitchenStationSelector.tsx
'use client'

import React from 'react'
import type { KitchenStationType, KitchenStationDefinition } from '@/types/phonics-kitchen'
import { CheckCircle2 } from 'lucide-react'

interface KitchenStationSelectorProps {
  stations: KitchenStationDefinition[]
  selectedStation: KitchenStationType
  completedStations: KitchenStationType[]
  onSelectStation: (station: KitchenStationType) => void
}

const STATION_EMOJIS: Record<KitchenStationType, string> = {
  pizzeria: '🍕',
  'sushi-bar': '🍣',
  'bakery-dessert': '🥞',
  'taco-cantina': '🌮',
}

export function KitchenStationSelector({
  stations,
  selectedStation,
  completedStations,
  onSelectStation,
}: KitchenStationSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Chọn quầy bếp MasterChef"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
    >
      {stations.map((station) => {
        const isSelected = selectedStation === station.id
        const isCompleted = completedStations.includes(station.id)
        const emoji = STATION_EMOJIS[station.id] || '🍳'

        return (
          <button
            key={station.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectStation(station.id)}
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
                  aria-label="Đã hoàn thành quầy bếp này"
                />
              )}
            </div>
            <span className="text-base sm:text-lg font-black text-center">
              {station.nameVi}
            </span>
            <span
              className={`text-base font-medium ${
                isSelected ? 'text-amber-300' : 'text-slate-500'
              }`}
            >
              {station.nameEn}
            </span>
          </button>
        )
      })}
    </div>
  )
}
