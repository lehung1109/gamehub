// src/app/admin/configs/[configId]/page.tsx
import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import gamesData from '@/data/games.json'
import type { Game } from '@/types'
import type { GameConfig } from '@/types/config'
import { ConfigEditForm } from '@/components/config/ConfigEditForm'

interface PageProps {
  params: Promise<{ configId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { configId } = await params
  if (!configId) {
    return { title: 'Chỉnh sửa cấu hình | GameHub Admin' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { title: 'Chỉnh sửa cấu hình | GameHub Admin' }
  }

  const { data: config } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            single: () => Promise<{ data: { name: string; game_id: string } | null; error: unknown }>
          }
        }
      }
    }
  })
    .from('game_configs')
    .select('name, game_id')
    .eq('id', configId)
    .eq('user_id', user.id)
    .single()

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const { data: config, error } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            single: () => Promise<{ data: GameConfig | null; error: unknown }>
          }
        }
      }
    }
  })
    .from('game_configs')
    .select('*')
    .eq('id', configId.trim())
    .eq('user_id', user.id)
    .single()

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
