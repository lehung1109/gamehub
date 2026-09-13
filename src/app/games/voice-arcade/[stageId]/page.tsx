// src/app/games/voice-arcade/[stageId]/page.tsx

import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllArcadeStages, getStageById } from '@/lib/voice-arcade-engine'
import { VoiceArcadeGame } from '@/components/arcade/VoiceArcadeGame'

interface ArcadeStagePageProps {
  params: Promise<{ stageId: string }>
}

export async function generateStaticParams() {
  const stages = getAllArcadeStages()
  return stages.map((stage) => ({
    stageId: stage.id,
  }))
}

export async function generateMetadata({
  params,
}: ArcadeStagePageProps): Promise<Metadata> {
  const { stageId } = await params
  const stage = getStageById(stageId)

  if (!stage) {
    return {
      title: 'Không tìm thấy màn chơi | GameHub',
    }
  }

  return {
    title: `${stage.titleVi} - ${stage.titleEn} | Phonics Voice Arcade GameHub`,
    description: stage.descriptionVi,
  }
}

export default async function ArcadeStageDetailPage({
  params,
}: ArcadeStagePageProps) {
  const { stageId } = await params
  const stage = getStageById(stageId)

  if (!stage) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-900/5">
      <VoiceArcadeGame stage={stage} />
    </main>
  )
}
