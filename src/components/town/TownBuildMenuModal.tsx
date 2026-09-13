// src/components/town/TownBuildMenuModal.tsx
'use client'

import React from 'react'
import { X, Hammer } from 'lucide-react'
import { getAllBuildingDefinitions } from '@/lib/phonics-town-engine'
import type { BuildingType } from '@/types/phonics-town'

interface TownBuildMenuModalProps {
  slotIndex: number
  availableBricks: number
  alreadyBuiltTypes: Set<BuildingType>
  onSelectBuilding: (type: BuildingType) => void
  onClose: () => void
}

export function TownBuildMenuModal({
  slotIndex,
  availableBricks,
  alreadyBuiltTypes,
  onSelectBuilding,
  onClose,
}: TownBuildMenuModalProps) {
  const allDefinitions = getAllBuildingDefinitions()
  const availableDefs = allDefinitions.filter((b) => !alreadyBuiltTypes.has(b.type))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu xây dựng công trình mới"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
              <Hammer className="size-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400">
                Quy Hoạch Công Trình Mới
              </h2>
              <p className="text-base text-slate-300 font-medium">
                Chọn một công trình để mở rộng thị trấn Phonics tại ô #{slotIndex + 1}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bảng quy hoạch"
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Building List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableDefs.map((def) => {
            const stage1 = def.stages[1]
            const canAfford = availableBricks >= stage1.costBricks

            return (
              <div
                key={def.type}
                className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800 border-2 border-slate-700 hover:border-amber-400 transition-all space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl group-hover:scale-110 transition-transform">
                      {stage1.icon}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-base">
                      {stage1.costBricks} 🧱
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                      {def.categoryNameVi}
                    </h3>
                    <p className="text-base font-bold text-slate-400">
                      {def.categoryNameEn}
                    </p>
                  </div>

                  <p className="text-base text-amber-200 font-medium">
                    🎯 {def.targetPhonics}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectBuilding(def.type)}
                  disabled={!canAfford}
                  className={`w-full py-3 px-4 rounded-xl font-black text-base inline-flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                    canAfford
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:scale-102 shadow-amber-500/30'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Hammer className="size-4" />
                  <span>
                    {canAfford ? 'Xây Dựng Ngay' : 'Không Đủ Gạch 🧱'}
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        {availableDefs.length === 0 && (
          <div className="p-8 text-center text-slate-400 font-bold text-lg">
            🎉 Thị trưởng đã xây dựng toàn bộ tất cả công trình!
          </div>
        )}
      </div>
    </div>
  )
}
