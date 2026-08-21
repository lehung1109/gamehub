// src/app/admin/configs/[configId]/page.tsx
import React from 'react'
import { notFound } from 'next/navigation'
import gamesData from '@/data/games.json'
import type { Game } from '@/types'
import { getConfigById } from '@/app/actions/configs'
import { ConfigEditForm } from '@/components/config/ConfigEditForm'

interface PageProps {
  params: Promise<{ configId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { configId } = await params
  if (!configId) {
    return { title: 'Chỉnh sửa cấu hình | GameHub Admin' }
  }

  const { data: config } = await getConfigById(configId)

  return {
    title: config?.name
      ? `Chỉnh sửa: ${config.name} | GameHub Admin`
      : 'Chỉnh sửa cấu hình | GameHub Admin',
  }
}

export default async function EditConfigPage({ params }: PageProps) {
  const { configId } = await params

  if (!configId || !configId.trim()) {
    notFound()
  }

  const { data: config, error } = await getConfigById(configId)

  if (error || !config) {
    notFound()
  }

  const games = gamesData as Game[]
  const game = games.find((g) => g.id === config.game_id)

  if (!game) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ConfigEditForm game={game} config={config} />
    </div>
  )
}
