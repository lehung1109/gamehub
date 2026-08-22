'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidGameId, validateGameSettings } from '@/lib/game-config-schema'
import { generateSlug, isValidSlug } from '@/lib/slug'
import type { CreateConfigInput, GameConfig, UpdateConfigInput } from '@/types/config'

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

export async function getConfigById(
  configId: string
): Promise<{ data?: GameConfig; error?: string }> {
  try {
    if (!configId || typeof configId !== 'string' || !configId.trim()) {
      return { error: 'ID cấu hình không hợp lệ' }
    }
    const cleanConfigId = configId.trim()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    const { data, error } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: GameConfig | null; error: { message: string } | null }>
            }
          }
        }
      }
    })
      .from('game_configs')
      .select('*')
      .eq('id', cleanConfigId)
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      return { error: 'Không tìm thấy cấu hình' }
    }

    return { data }
  } catch (err) {
    console.error('[getConfigById] Error:', err)
    return { error: 'Đã xảy ra lỗi khi tải cấu hình.' }
  }
}

export async function updateConfig(
  configId: string,
  input: UpdateConfigInput
): Promise<{ data?: GameConfig; error?: string }> {
  try {
    if (!configId || typeof configId !== 'string' || !configId.trim()) {
      return { error: 'ID cấu hình không hợp lệ' }
    }
    const cleanConfigId = configId.trim()

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

    // Fetch existing config to verify existence and get game_id for validation
    const { data: existing, error: fetchError } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: GameConfig | null; error: { message: string } | null }>
            }
          }
        }
      }
    })
      .from('game_configs')
      .select('*')
      .eq('id', cleanConfigId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return { error: 'Không tìm thấy cấu hình hoặc bạn không có quyền chỉnh sửa' }
    }

    if (input.name === undefined && input.settings === undefined) {
      return { data: existing }
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (input.name !== undefined) {
      if (typeof input.name !== 'string') {
        return { error: 'Tên cấu hình không hợp lệ' }
      }
      const trimmedName = input.name.trim()
      if (!trimmedName) {
        return { error: 'Tên cấu hình không được để trống' }
      }
      if (trimmedName.length > 200) {
        return { error: 'Tên cấu hình không được vượt quá 200 ký tự' }
      }
      updatePayload.name = trimmedName
    }

    if (input.settings !== undefined) {
      const validation = validateGameSettings(existing.game_id, input.settings)
      if (!validation.valid) {
        return { error: validation.error || 'Cài đặt không hợp lệ' }
      }
      updatePayload.settings = validation.data
    }

    const { data, error } = await (supabase as unknown as {
      from: (table: string) => {
        update: (values: Record<string, unknown>) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              select: () => {
                single: () => Promise<{ data: GameConfig | null; error: { message: string } | null }>
              }
            }
          }
        }
      }
    })
      .from('game_configs')
      .update(updatePayload)
      .eq('id', cleanConfigId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) {
      return { error: error?.message || 'Không thể cập nhật cấu hình' }
    }

    revalidatePath(`/admin/games/${existing.game_id}`)
    revalidatePath('/admin/dashboard')
    revalidatePath(`/admin/configs/${cleanConfigId}`)

    return { data }
  } catch (err) {
    console.error('[updateConfig] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.' }
  }
}

export async function deleteConfig(
  configId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!configId || typeof configId !== 'string' || !configId.trim()) {
      return { error: 'ID cấu hình không hợp lệ' }
    }
    const cleanConfigId = configId.trim()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    // Fetch existing config first to get game_id for revalidation
    const { data: existing, error: fetchError } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: { id: string; game_id: string } | null; error: { message: string } | null }>
            }
          }
        }
      }
    })
      .from('game_configs')
      .select('id, game_id')
      .eq('id', cleanConfigId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return { error: 'Không tìm thấy cấu hình hoặc bạn không có quyền xóa' }
    }

    const { error: deleteError } = await (supabase as unknown as {
      from: (table: string) => {
        delete: () => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => Promise<{ error: { message: string } | null }>
          }
        }
      }
    })
      .from('game_configs')
      .delete()
      .eq('id', cleanConfigId)
      .eq('user_id', user.id)

    if (deleteError) {
      return { error: deleteError.message || 'Không thể xóa cấu hình' }
    }

    revalidatePath(`/admin/games/${existing.game_id}`)
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (err) {
    console.error('[deleteConfig] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ khi xóa cấu hình.' }
  }
}

export async function generateShareSlug(
  configId: string
): Promise<{ slug?: string; error?: string }> {
  try {
    if (!configId || typeof configId !== 'string' || !configId.trim()) {
      return { error: 'ID cấu hình không hợp lệ' }
    }
    const cleanConfigId = configId.trim()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    // Fetch existing config to check if slug already exists
    const { data: existing, error: fetchError } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: { id: string; game_id: string; share_slug: string | null } | null; error: { message: string } | null }>
            }
          }
        }
      }
    })
      .from('game_configs')
      .select('id, game_id, share_slug')
      .eq('id', cleanConfigId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return { error: 'Không tìm thấy cấu hình hoặc bạn không có quyền chia sẻ' }
    }

    if (existing.share_slug) {
      return { slug: existing.share_slug }
    }

    // Generate new unique slug with retry loop for collision safety
    let attempts = 0
    let updated: { id: string; share_slug: string } | null = null
    let updateError: { message: string } | null = null

    while (attempts < 3) {
      attempts++
      const newSlug = generateSlug()

      const res = await (supabase as unknown as {
        from: (table: string) => {
          update: (values: Record<string, unknown>) => {
            eq: (col: string, val: string) => {
              eq: (col: string, val: string) => {
                select: () => {
                  single: () => Promise<{ data: { id: string; share_slug: string } | null; error: { message: string } | null }>
                }
              }
            }
          }
        }
      })
        .from('game_configs')
        .update({
          share_slug: newSlug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cleanConfigId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (!res.error && res.data) {
        updated = res.data
        updateError = null
        break
      }
      updateError = res.error
    }

    if (updateError || !updated) {
      return { error: updateError?.message || 'Không thể tạo mã chia sẻ' }
    }

    revalidatePath(`/admin/games/${existing.game_id}`)
    revalidatePath(`/admin/configs/${cleanConfigId}`)

    return { slug: updated.share_slug }
  } catch (err) {
    console.error('[generateShareSlug] Error:', err)
    return { error: 'Đã xảy ra lỗi khi tạo liên kết chia sẻ.' }
  }
}

export async function getConfigByIdPublic(
  configId: string
): Promise<{ data?: GameConfig; error?: string }> {
  try {
    if (!configId || typeof configId !== 'string' || !configId.trim()) {
      return { error: 'ID cấu hình không hợp lệ' }
    }
    const cleanConfigId = configId.trim()

    const supabase = await createClient()
    const { data, error } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: boolean) => {
              single: () => Promise<{ data: GameConfig | null; error: { message: string } | null }>
            }
          }
        }
      }
    })
      .from('game_configs')
      .select('id, game_id, name, settings, share_slug, is_active')
      .eq('id', cleanConfigId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { error: 'Không tìm thấy cấu hình' }
    }

    return { data }
  } catch (err) {
    console.error('[getConfigByIdPublic] Error:', err)
    return { error: 'Đã xảy ra lỗi khi tải cấu hình.' }
  }
}

export async function getConfigBySlug(
  slug: string
): Promise<{ data?: GameConfig; error?: string }> {
  try {
    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return { error: 'Mã chia sẻ không hợp lệ' }
    }
    const cleanSlug = slug.trim()
    if (!isValidSlug(cleanSlug)) {
      return { error: 'Mã chia sẻ không đúng định dạng' }
    }

    const supabase = await createClient()
    const { data, error } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: boolean) => {
              single: () => Promise<{ data: GameConfig | null; error: { message: string } | null }>
            }
          }
        }
      }
    })
      .from('game_configs')
      .select('id, game_id, name, settings, share_slug, is_active')
      .eq('share_slug', cleanSlug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { error: 'Không tìm thấy cấu hình tương ứng với liên kết này' }
    }

    return { data }
  } catch (err) {
    console.error('[getConfigBySlug] Error:', err)
    return { error: 'Đã xảy ra lỗi khi tìm cấu hình.' }
  }
}

