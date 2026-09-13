// src/components/arena/TeamPickerModal.tsx

'use client'

import React, { useState } from 'react'
import { CheckCircle2, Shield, Users } from 'lucide-react'
import type { TeamId, TeamMascotConfig } from '@/types/team-battle'
import { TEAM_CONFIGS } from '@/lib/team-battle-engine'

interface TeamPickerModalProps {
  availableTeamIds?: TeamId[]
  teamCounts?: Partial<Record<TeamId, number>>
  currentTeamId?: TeamId
  onSelectTeam: (teamId: TeamId) => void
}

export function TeamPickerModal({
  availableTeamIds = ['dragons', 'eagles'],
  teamCounts = {},
  currentTeamId,
  onSelectTeam,
}: TeamPickerModalProps) {
  const [selected, setSelected] = useState<TeamId>(currentTeamId || availableTeamIds[0])

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-2xl max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-base font-bold border border-indigo-200">
          <Shield className="size-5 text-indigo-600" />
          <span>Gia Nhập Liên Minh Đội</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Chọn Đội Trưởng & Linh Vật Của Em
        </h2>
        <p className="text-base text-slate-600 font-medium">
          Mỗi câu trả lời đúng của em sẽ đóng góp trực tiếp vào thanh điểm chung của cả đội!
        </p>
      </div>

      {/* Mascot Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableTeamIds.map((tId) => {
          const config: TeamMascotConfig = TEAM_CONFIGS[tId]
          const isSelected = selected === tId
          const count = teamCounts[tId] || 0

          return (
            <button
              key={tId}
              type="button"
              onClick={() => setSelected(tId)}
              className={`p-5 rounded-2xl border-3 text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                isSelected
                  ? `${config.borderClass} bg-slate-50 shadow-lg scale-102 ring-4 ring-indigo-500/20`
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isSelected && (
                <CheckCircle2 className="size-6 text-indigo-600 absolute top-4 right-4" />
              )}

              <div className="space-y-1">
                <span className="text-4xl">{config.mascotEmoji}</span>
                <h3 className={`text-xl font-black ${config.textClass}`}>
                  {config.nameVi}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-base font-bold text-slate-500">
                <Users className="size-4" />
                <span>{count} thành viên</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={() => onSelectTeam(selected)}
        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
      >
        Vào Đội {TEAM_CONFIGS[selected].nameVi} 🚀
      </button>
    </div>
  )
}
