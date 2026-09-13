'use client'

import React, { use } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { SpeakingArena } from '@/components/speaking/SpeakingArena'
import rawScenarios from '@/data/speaking/scenarios.json'
import type { SpeakingScenario } from '@/types/speaking'
import { ArrowLeft, AlertCircle } from 'lucide-react'

const scenariosData = rawScenarios as SpeakingScenario[]

export interface SpeakingScenarioPageProps {
  params: Promise<{ scenarioId: string }>
}

export default function SpeakingScenarioPage({ params }: SpeakingScenarioPageProps) {
  const { scenarioId } = use(params)
  const searchParams = useSearchParams()
  const personaId = searchParams.get('persona')

  const scenario = scenariosData.find((s) => s.id === scenarioId)

  if (!scenario) {
    return (
      <Container>
        <div className="py-12 max-w-xl mx-auto text-center space-y-6">
          <div className="size-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertCircle className="size-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Không tìm thấy kịch bản hội thoại
            </h1>
            <p className="text-base font-medium text-muted-foreground">
              Tình huống luyện nói này không tồn tại hoặc đã bị gỡ bỏ.
            </p>
          </div>

          <div>
            <Link
              href="/speaking"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-base font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowLeft className="size-5" />
              <span>Quay lại danh sách kịch bản</span>
            </Link>
          </div>
        </div>
      </Container>
    )
  }

  // Find persona if selected from query param
  const customPersona = personaId
    ? scenariosData.find((s) => s.persona.id === personaId)?.persona
    : undefined

  return (
    <Container>
      <div className="py-6 space-y-6">
        <SpeakingArena
          scenario={scenario}
          initialPersona={customPersona}
        />
      </div>
    </Container>
  )
}
