// src/app/admin/games/[gameId]/page.tsx
import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import gamesData from '@/data/games.json'
import type { Game } from '@/types'
import type { GameConfig } from '@/types/config'
import { isValidGameId } from '@/lib/game-config-schema'
import { getConfigsByGame } from '@/app/actions/configs'
import { ConfigList } from '@/components/admin/ConfigList'
import { buttonVariants } from '@/components/ui/button'
import { Plus, ArrowLeft, AlertCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{ gameId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { gameId } = await params
  const games = gamesData as Game[]
  const game = games.find((g) => g.id === gameId)
  return {
    title: game ? `Quản lý cấu hình: ${game.titleVi} | GameHub Admin` : 'GameHub Admin',
  }
}

export default async function GameConfigsPage({ params }: PageProps) {
  const { gameId } = await params

  if (!isValidGameId(gameId)) {
    notFound()
  }

  const games = gamesData as Game[]
  const game = games.find((g) => g.id === gameId)!

  const { data: configs, error: queryError } = await getConfigsByGame(gameId)
  const configList: GameConfig[] = configs || []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'size-9 p-0 border-slate-200 text-slate-600',
            })}
            title="Quay lại Dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="text-3xl select-none" role="img" aria-label={game.titleVi}>
            {game.emoji}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{game.titleVi}</h1>
            <p className="text-xs text-slate-500">{game.description}</p>
          </div>
        </div>

        <Link
          href={`/admin/configs/new?gameId=${game.id}`}
          className={buttonVariants({
            size: 'sm',
            className: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
          })}
        >
          <Plus className="size-4 mr-1" />
          Tạo cấu hình mới
        </Link>
      </div>

      {queryError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 font-medium"
        >
          <AlertCircle className="size-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Không thể tải danh sách cấu hình</p>
            <p className="text-xs text-red-600 mt-0.5">{queryError}</p>
          </div>
        </div>
      )}

      {/* Configs List Component */}
      {!queryError && <ConfigList game={game} configs={configList} />}
    </div>
  )
}
