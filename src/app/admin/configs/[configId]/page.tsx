// src/app/admin/configs/[configId]/page.tsx
import React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import gamesData from '@/data/games.json'
import type { Game } from '@/types'
import type { GameConfig } from '@/types/config'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Share2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ configId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { configId } = await params
  return {
    title: `Chi tiết cấu hình #${configId.slice(0, 8)} | GameHub Admin`,
  }
}

export default async function ConfigDetailPage({ params }: PageProps) {
  const { configId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: config } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            single: () => Promise<{ data: GameConfig | null }>
          }
        }
      }
    }
  })
    .from('game_configs')
    .select('*')
    .eq('id', configId)
    .eq('user_id', user.id)
    .single()

  if (!config) {
    notFound()
  }

  const games = gamesData as Game[]
  const game = games.find((g) => g.id === config.game_id)

  const formattedDate = new Date(config.created_at).toLocaleDateString('vi-VN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={game ? `/admin/games/${game.id}` : '/admin/dashboard'}
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className: 'border-slate-200 text-slate-600',
          })}
        >
          <ArrowLeft className="size-4 mr-1" />
          Quay lại {game ? game.titleVi : 'Dashboard'}
        </Link>

        {config.share_slug && (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Share2 className="size-3 mr-1" />
            Đã bật chia sẻ
          </Badge>
        )}
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              {game?.emoji} {game?.titleVi || config.game_id}
            </Badge>
            <span className="text-xs text-slate-400">ID: {config.id}</span>
          </div>

          <CardTitle className="text-2xl font-extrabold text-slate-900">
            {config.name}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Tạo lúc: {formattedDate}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-800">Thông số cài đặt bài học:</h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs text-slate-700 overflow-x-auto">
            <pre>{JSON.stringify(config.settings, null, 2)}</pre>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 pt-4">
          <span className="text-xs text-slate-400">
            Trạng thái: {config.is_active ? 'Đang hoạt động' : 'Tạm khóa'}
          </span>
          <Link
            href={game ? `/admin/games/${game.id}` : '/admin/dashboard'}
            className={buttonVariants({
              variant: 'default',
              size: 'sm',
              className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
            })}
          >
            Quay lại danh sách
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
