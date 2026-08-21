// src/app/admin/dashboard/page.tsx
import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import gamesData from '@/data/games.json'
import type { Game } from '@/types'
import type { GameConfig } from '@/types/config'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Settings, Gamepad2, Sparkles, Layers } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const games: Game[] = gamesData as Game[]

  // Fetch configs for counting per game
  // Cast safely so typecheck succeeds even before remote gen:types is populated
  const { data: configs } = (await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: boolean) => Promise<{ data: Pick<GameConfig, 'game_id'>[] | null }>
        }
      }
    }
  })
    .from('game_configs')
    .select('game_id')
    .eq('user_id', user?.id || '')
    .eq('is_active', true)) || { data: null }

  const configCountMap: Record<string, number> = {}
  if (configs) {
    for (const item of configs) {
      configCountMap[item.game_id] = (configCountMap[item.game_id] || 0) + 1
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-linear-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="size-3.5" />
              <span>Bảng điều khiển Giáo viên</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Xin chào, {user?.email?.split('@')[0] || 'Thầy/Cô'}!
            </h1>
            <p className="text-indigo-100 text-sm md:text-base max-w-2xl">
              Chọn một game bên dưới để quản lý các bộ cấu hình bài học hoặc tạo link chia sẻ cho học sinh.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="rounded-xl bg-white/10 p-3 text-center border border-white/20">
              <span className="block text-2xl font-black">
                {configs?.length || 0}
              </span>
              <span className="text-xs text-indigo-100 font-medium">
                Cấu hình đã tạo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Games Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="size-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Danh sách Game ({games.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const count = configCountMap[game.id] || 0
            return (
              <Card
                key={game.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200 bg-white"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl select-none" role="img" aria-label={game.titleVi}>
                        {game.emoji}
                      </span>
                      <div>
                        <CardTitle className="text-lg font-bold text-slate-900">
                          {game.titleVi}
                        </CardTitle>
                        <span className="text-xs text-slate-500 font-medium">
                          {game.titleEn}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={count > 0 ? 'default' : 'secondary'}
                      className={
                        count > 0
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
                      }
                    >
                      <Layers className="size-3 mr-1" />
                      {count} cấu hình
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-600 line-clamp-2 mt-2">
                    {game.description}
                  </CardDescription>
                </CardHeader>

                <CardFooter className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/admin/games/${game.id}`}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'sm',
                      className: 'flex-1 text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200',
                    })}
                  >
                    <Settings className="size-3.5 mr-1" />
                    Quản lý ({count})
                  </Link>

                  <Link
                    href={`/admin/configs/new?gameId=${game.id}`}
                    className={buttonVariants({
                      size: 'sm',
                      className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                    })}
                  >
                    <Plus className="size-3.5 mr-1" />
                    Tạo mới
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
