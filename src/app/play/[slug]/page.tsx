import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { AlertTriangle, Home } from 'lucide-react'
import { isValidSlug } from '@/lib/slug'

export const metadata = {
  title: 'Chơi game | English Games for Kids',
  description: 'Tham gia trò chơi tiếng Anh với cấu hình được chia sẻ',
}

interface PlaySlugPageProps {
  params: Promise<{ slug: string }>
}

export default async function PlaySlugPage({ params }: PlaySlugPageProps) {
  const { slug } = await params
  const cleanSlug = (slug || '').trim()

  if (cleanSlug && isValidSlug(cleanSlug)) {
    const supabase = await createClient()
    const { data: config } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: boolean) => {
              single: () => Promise<{
                data: { id: string; game_id: string; is_active: boolean } | null
                error: { message: string } | null
              }>
            }
          }
        }
      }
    })
      .from('game_configs')
      .select('id, game_id, is_active')
      .eq('share_slug', cleanSlug)
      .eq('is_active', true)
      .single()

    if (config?.game_id && config?.id) {
      redirect(`/games/${config.game_id}?config=${config.id}`)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl border-2 border-slate-200 bg-white shadow-xl text-center p-6 sm:p-8">
        <CardHeader className="pb-4 space-y-3">
          <div className="size-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Không tìm thấy cấu hình game
          </h1>
          <CardDescription className="text-sm text-slate-500 font-medium leading-relaxed">
            Liên kết chia sẻ này không tồn tại hoặc đã bị xóa. Hãy quay lại trang chủ để khám phá các trò chơi thú vị nhé!
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className={buttonVariants({
              size: 'lg',
              className: 'w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl gap-2 h-12 px-6 shadow-md',
            })}
          >
            <Home className="size-5" />
            <span>Về trang chủ</span>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
