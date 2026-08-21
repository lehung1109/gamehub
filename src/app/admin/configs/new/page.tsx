// src/app/admin/configs/new/page.tsx
import React from 'react'
import Link from 'next/link'
import gamesData from '@/data/games.json'
import type { Game } from '@/types'
import { isValidGameId } from '@/lib/game-config-schema'
import { ConfigCreateForm } from '@/components/config/ConfigCreateForm'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'

export const metadata = {
  title: 'Tạo cấu hình Game mới | GameHub Admin',
}

interface PageProps {
  searchParams: Promise<{ gameId?: string }>
}

export default async function NewConfigPage({ searchParams }: PageProps) {
  const { gameId } = await searchParams
  const games = gamesData as Game[]

  const selectedGame = gameId && isValidGameId(gameId)
    ? games.find((g) => g.id === gameId)
    : null

  if (selectedGame) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <ConfigCreateForm game={selectedGame} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chọn Game để tạo cấu hình</h1>
          <p className="text-slate-500 text-sm mt-1">
            Vui lòng chọn một trò chơi bên dưới để bắt đầu tạo bộ cấu hình bài học mới
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className: 'border-slate-200 text-slate-600',
          })}
        >
          <ArrowLeft className="size-4 mr-1" />
          Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/admin/configs/new?gameId=${game.id}`}
            className="group block"
          >
            <Card className="h-full border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-4xl select-none" role="img" aria-label={game.titleVi}>
                    {game.emoji}
                  </span>
                  <span className="size-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Plus className="size-4" />
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-2">
                  {game.titleVi}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 line-clamp-2">
                  {game.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
