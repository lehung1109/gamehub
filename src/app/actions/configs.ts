'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidGameId, validateGameSettings } from '@/lib/game-config-schema'
import type { CreateConfigInput, GameConfig } from '@/types/config'

export async function createConfig(
  input: CreateConfigInput
): Promise<{ data?: GameConfig; error?: string }> {
  try {
    if (!input || typeof input !== 'object') {
      return { error: 'Dữ liệu đầu vào không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    if (typeof input.name !== 'string') {
      return { error: 'Tên cấu hình là bắt buộc' }
    }

    const trimmedName = input.name.trim()
    if (!trimmedName) {
      return { error: 'Tên cấu hình là bắt buộc' }
    }

    if (trimmedName.length > 200) {
      return { error: 'Tên cấu hình không được vượt quá 200 ký tự' }
    }

    if (typeof input.gameId !== 'string' || !isValidGameId(input.gameId)) {
      return { error: 'Game không hợp lệ' }
    }

    const validation = validateGameSettings(input.gameId, input.settings)
    if (!validation.valid) {
      return { error: validation.error || 'Cài đặt không hợp lệ' }
    }

    const { data, error } = await (supabase as unknown as {
      from: (table: string) => {
        insert: (record: unknown) => {
          select: () => {
            single: () => Promise<{ data: GameConfig | null; error: { message: string } | null }>
          }
        }
      }
    })
      .from('game_configs')
      .insert({
        user_id: user.id,
        game_id: input.gameId,
        name: trimmedName,
        settings: validation.data,
        is_active: true,
      })
      .select()
      .single()

    if (error || !data) {
      return { error: error?.message || 'Không thể tạo cấu hình' }
    }

    // Revalidate server components cache
    revalidatePath(`/admin/games/${input.gameId}`)
    revalidatePath('/admin/dashboard')

    return { data }
  } catch (err) {
    console.error('[createConfig] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.' }
  }
}

export async function getConfigsByGame(
  gameId: string
): Promise<{ data?: GameConfig[]; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    if (typeof gameId !== 'string' || !isValidGameId(gameId)) {
      return { error: 'Game không hợp lệ' }
    }

    const { data, error } = await (supabase as unknown as {
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
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { data: data || [] }
  } catch (err) {
    console.error('[getConfigsByGame] Error:', err)
    return { error: 'Đã xảy ra lỗi khi tải danh sách cấu hình.' }
  }
}
