import React from 'react'
import type { SpeakingScenario, CEFRLevel } from '@/types/speaking'
import { Sparkles, MessageCircle, ChevronRight } from 'lucide-react'

export interface ScenarioCardProps {
  scenario: SpeakingScenario
  onSelect: (scenario: SpeakingScenario) => void
}

const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
  A2: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700',
  B1: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
  B2: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700',
}

export function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  const badgeColor = CEFR_COLORS[scenario.level] || CEFR_COLORS.A1

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(scenario)
    }
  }

  return (
    <div
      data-testid={`scenario-card-${scenario.id}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(scenario)}
      onKeyDown={handleKeyDown}
      className="group relative flex flex-col justify-between rounded-3xl bg-card border-2 border-border/80 p-6 shadow-xs hover:shadow-xl hover:border-amber-400/80 dark:hover:border-amber-500/80 hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/50"
    >
      <div>
        {/* Top bar: Scenario Icon & Badges */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform">
            <span role="img" aria-label={scenario.titleVi}>
              {scenario.icon}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Target turns pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <MessageCircle className="size-3.5" />
              <span>{scenario.targetTurns} lượt nói</span>
            </span>

            {/* CEFR Badge */}
            <span
              data-testid="cefr-badge"
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black border tracking-wide uppercase ${badgeColor}`}
            >
              {scenario.level}
            </span>
          </div>
        </div>

        {/* Titles */}
        <div className="space-y-1 mb-3">
          <h3 className="text-lg sm:text-xl font-black text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
            {scenario.titleVi}
          </h3>
          <p className="text-sm font-semibold text-muted-foreground italic line-clamp-1">
            {scenario.titleEn}
          </p>
        </div>

        {/* Vietnamese Description */}
        <p className="text-sm text-muted-foreground/90 leading-relaxed mb-4 line-clamp-2">
          {scenario.descriptionVi}
        </p>
      </div>

      <div className="pt-4 border-t border-border/60">
        {/* Tutor Persona Mini Info */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-linear-to-tr from-amber-200 to-amber-400 dark:from-amber-600 dark:to-amber-400 flex items-center justify-center text-base shrink-0 border border-amber-300 dark:border-amber-500 shadow-2xs">
              <span>{scenario.persona.avatar}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-foreground truncate">
                {scenario.persona.name}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {scenario.persona.role}
              </span>
            </div>
          </div>

          {/* Start button */}
          <button
            type="button"
            data-testid={`start-scenario-${scenario.id}`}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(scenario)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-600 font-bold text-sm shadow-sm hover:shadow transition-all group-hover:scale-105 active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Sparkles className="size-4" />
            <span>Luyện nói</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
