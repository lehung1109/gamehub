// src/app/admin/games/[gameId]/page.tsx
import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import gamesData from '@/data/games.json'
import type { Game } from '@/types'
import type { GameConfig } from '@/types/config'
import { isValidGameId } from '@/lib/game-config-schema'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ArrowLeft, Layers, Calendar, AlertCircle } from 'lucide-react'

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch configs for this game
  const { data: configs, error: queryError } = (await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: boolean) => {
              order: (col: string, opts: { ascending: boolean }) => Promise<{
                data: GameConfig[] | null
                error: { message: string } | null
              }>
            }
          }
        }
      }
    }
  })
    .from('game_configs')
    .select('*')
    .eq('user_id', user?.id || '')
    .eq('game_id', gameId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })) || { data: null, error: null }

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
            <p className="text-xs text-red-600 mt-0.5">{queryError.message}</p>
          </div>
        </div>
      )}

      {/* Configs List */}
      {!queryError && configList.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 text-center py-12">
          <CardContent className="space-y-4 max-w-sm mx-auto">
            <div className="size-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <Layers className="size-7" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-slate-800">
                Chưa có cấu hình nào
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Hãy tạo bộ cấu hình đầu tiên để cá nhân hóa nội dung và thời lượng bài học cho học sinh.
              </CardDescription>
            </div>
            <Link
              href={`/admin/configs/new?gameId=${game.id}`}
              className={buttonVariants({
                size: 'sm',
                className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
              })}
            >
              <Plus className="size-4 mr-1" />
              Tạo cấu hình đầu tiên
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {configList.map((config) => {
            const formattedDate = new Date(config.created_at).toLocaleDateString('vi-VN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <Card
                key={config.id}
                className="flex flex-col justify-between border-slate-200 bg-white hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                      {config.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs shrink-0">
                      {game.titleVi}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Calendar className="size-3" />
                    <span>{formattedDate}</span>
                  </div>
                </CardHeader>

                <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">
                    ID: {config.id.slice(0, 8)}...
                  </span>
                  <Link
                    href={`/admin/configs/${config.id}`}
                    className={buttonVariants({
                      variant: 'outline',
                      size: 'xs',
                      className: 'text-indigo-600 hover:bg-indigo-50 border-indigo-200',
                    })}
                  >
                    Chi tiết
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
