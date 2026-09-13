import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCommunityConfigsAction } from '@/app/actions/community'
import { CommunityHubView } from '@/components/admin/CommunityHubView'
import type { GameConfig } from '@/types/config'

export const dynamic = 'force-dynamic'

export default async function AdminCommunityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [communityResult, myConfigsResult] = await Promise.all([
    getCommunityConfigsAction({ page: 1, pageSize: 30, sortBy: 'newest' }),
    user
      ? (supabase as unknown as {
          from: (table: string) => {
            select: (cols: string) => {
              eq: (col: string, val: string) => {
                eq: (col: string, val: boolean) => {
                  order: (col: string, opts: { ascending: boolean }) => Promise<{
                    data: Pick<GameConfig, 'id' | 'name' | 'game_id' | 'created_at'>[] | null
                  }>
                }
              }
            }
          }
        })
          .from('game_configs')
          .select('id, name, game_id, created_at')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: null }),
  ])

  const initialConfigs = communityResult.success && communityResult.data ? communityResult.data : []
  const totalCount = communityResult.total || initialConfigs.length
  const myConfigs = myConfigsResult.data || []

  return (
    <CommunityHubView
      initialConfigs={initialConfigs}
      totalCount={totalCount}
      currentUserId={user?.id}
      myConfigs={myConfigs}
    />
  )
}
