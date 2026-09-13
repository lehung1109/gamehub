'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CefrLevel } from '@/types/word-bank'
import type {
  CommunitySharedConfig,
  GetCommunityConfigsFilter,
  ShareConfigInput,
  CommunityConfigResponse,
} from '@/types/community'
import type { Database } from '@/types/database'

function mapRowToCommunityConfig(row: Record<string, unknown>): CommunitySharedConfig {
  return {
    id: row.id as string,
    configId: (row.config_id as string) || null,
    authorId: row.author_id as string,
    authorName: (row.author_name as string) || 'Giáo viên GameHub',
    title: row.title as string,
    description: (row.description as string) || null,
    gameId: row.game_id as string,
    cefrLevel: (row.cefr_level as CefrLevel) || 'A1',
    topic: (row.topic as string) || 'general',
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    settings: (row.settings as Record<string, unknown>) || {},
    likesCount: Number(row.likes_count) || 0,
    cloneCount: Number(row.clone_count) || 0,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
    isLikedByMe: false,
  }
}

/**
 * Fetch shared game configurations from the community marketplace catalog
 */
export async function getCommunityConfigsAction(
  filter: GetCommunityConfigsFilter = {}
): Promise<CommunityConfigResponse<CommunitySharedConfig[]>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('community_shared_configs')
      .select('*', { count: 'exact' })

    if (filter.gameId && filter.gameId !== 'all') {
      query = query.eq('game_id', filter.gameId)
    }

    if (filter.cefrLevel && filter.cefrLevel !== 'all') {
      query = query.eq('cefr_level', filter.cefrLevel)
    }

    if (filter.topic && filter.topic !== 'all') {
      query = query.eq('topic', filter.topic)
    }

    if (filter.search && filter.search.trim()) {
      const s = filter.search.trim()
      query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%,topic.ilike.%${s}%`)
    }

    // Sorting
    if (filter.sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false })
    } else if (filter.sortBy === 'clones') {
      query = query.order('clone_count', { ascending: false }).order('created_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Pagination
    const page = Math.max(1, filter.page || 1)
    const pageSize = Math.max(1, Math.min(50, filter.pageSize || 12))
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, count, error } = await query.range(from, to)

    if (error) {
      return { success: false, error: error.message }
    }

    const items = (data || []).map((row) => mapRowToCommunityConfig(row as Record<string, unknown>))

    return {
      success: true,
      data: items,
      total: count || 0,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi tải thư viện cộng đồng'
    return { success: false, error: message }
  }
}

/**
 * Share a teacher's personal game config into the public Community Marketplace
 */
export async function shareConfigToCommunityAction(
  input: ShareConfigInput
): Promise<CommunityConfigResponse<CommunitySharedConfig>> {
  try {
    if (!input || !input.configId || !input.configId.trim()) {
      return { success: false, error: 'Mã cấu hình (configId) là bắt buộc' }
    }

    const trimmedTitle = input.title ? input.title.trim() : ''
    if (!trimmedTitle) {
      return { success: false, error: 'Tiêu đề chia sẻ là bắt buộc' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để chia sẻ cấu hình lên cộng đồng' }
    }

    // Verify source game config exists and belongs to user
    const { data: sourceConfig, error: configError } = await supabase
      .from('game_configs')
      .select('*')
      .eq('id', input.configId)
      .eq('user_id', user.id)
      .single()

    if (configError || !sourceConfig) {
      return { success: false, error: 'Không tìm thấy cấu hình trò chơi của bạn' }
    }

    const authorName =
      (user.user_metadata?.full_name as string) ||
      (user.email ? user.email.split('@')[0] : 'Giáo viên GameHub')

    const newSharedRow: Database['public']['Tables']['community_shared_configs']['Insert'] = {
      config_id: sourceConfig.id,
      author_id: user.id,
      author_name: authorName,
      title: trimmedTitle,
      description: input.description?.trim() || null,
      game_id: sourceConfig.game_id,
      cefr_level: input.cefrLevel || 'A1',
      topic: input.topic?.trim() || 'general',
      tags: input.tags || [],
      settings: sourceConfig.settings,
      likes_count: 0,
      clone_count: 0,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('community_shared_configs')
      .insert(newSharedRow)
      .select()
      .single()

    if (insertError || !inserted) {
      return { success: false, error: insertError?.message || 'Không thể chia sẻ cấu hình' }
    }

    revalidatePath('/admin/community')

    return {
      success: true,
      data: mapRowToCommunityConfig(inserted as Record<string, unknown>),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi chia sẻ cấu hình'
    return { success: false, error: message }
  }
}

/**
 * Clone a community shared config into the teacher's own game configurations
 */
export async function cloneCommunityConfigAction(
  communityConfigId: string
): Promise<CommunityConfigResponse<{ newConfigId: string }>> {
  try {
    if (!communityConfigId || !communityConfigId.trim()) {
      return { success: false, error: 'Mã cấu hình cộng đồng là bắt buộc' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để sao chép cấu hình' }
    }

    // Fetch shared config
    const { data: sharedConfig, error: fetchError } = await supabase
      .from('community_shared_configs')
      .select('*')
      .eq('id', communityConfigId)
      .single()

    if (fetchError || !sharedConfig) {
      return { success: false, error: 'Không tìm thấy cấu hình cộng đồng cần sao chép' }
    }

    // Insert into user's game_configs
    const clonedName = `${sharedConfig.title} (Bản sao)`
    const newConfigInsert: Database['public']['Tables']['game_configs']['Insert'] = {
      user_id: user.id,
      game_id: sharedConfig.game_id,
      name: clonedName,
      settings: sharedConfig.settings,
      is_active: true,
    }

    const { data: newConfig, error: insertError } = await supabase
      .from('game_configs')
      .insert(newConfigInsert)
      .select()
      .single()

    if (insertError || !newConfig) {
      return { success: false, error: insertError?.message || 'Không thể sao chép cấu hình' }
    }

    // Increment clone_count
    await supabase
      .from('community_shared_configs')
      .update({ clone_count: (sharedConfig.clone_count || 0) + 1 })
      .eq('id', communityConfigId)

    revalidatePath('/admin/community')
    revalidatePath(`/admin/games/${sharedConfig.game_id}`)

    return {
      success: true,
      data: { newConfigId: newConfig.id },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định khi sao chép cấu hình'
    return { success: false, error: message }
  }
}

/**
 * Toggle like for a community configuration
 */
export async function toggleLikeCommunityConfigAction(
  communityConfigId: string,
  currentLiked?: boolean
): Promise<CommunityConfigResponse<{ likesCount: number; isLiked: boolean }>> {
  try {
    if (!communityConfigId || !communityConfigId.trim()) {
      return { success: false, error: 'Mã cấu hình cộng đồng là bắt buộc' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để thích cấu hình' }
    }

    const { data: shared, error: fetchError } = await supabase
      .from('community_shared_configs')
      .select('likes_count')
      .eq('id', communityConfigId)
      .single()

    if (fetchError || !shared) {
      return { success: false, error: 'Không tìm thấy cấu hình cộng đồng' }
    }

    const newLiked = currentLiked === undefined ? true : !currentLiked
    const currentLikes = shared.likes_count || 0
    const newLikesCount = newLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1)

    const { error: updateError } = await supabase
      .from('community_shared_configs')
      .update({ likes_count: newLikesCount })
      .eq('id', communityConfigId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    return {
      success: true,
      data: {
        likesCount: newLikesCount,
        isLiked: newLiked,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi thả tim cấu hình'
    return { success: false, error: message }
  }
}

/**
 * Delete a community configuration authored by the current teacher
 */
export async function deleteCommunityConfigAction(
  communityConfigId: string
): Promise<CommunityConfigResponse<null>> {
  try {
    if (!communityConfigId || !communityConfigId.trim()) {
      return { success: false, error: 'Mã cấu hình là bắt buộc' }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'Bạn cần đăng nhập để xóa cấu hình' }
    }

    const { data: shared, error: fetchError } = await supabase
      .from('community_shared_configs')
      .select('author_id')
      .eq('id', communityConfigId)
      .single()

    if (fetchError || !shared) {
      return { success: false, error: 'Không tìm thấy cấu hình cộng đồng' }
    }

    if (shared.author_id !== user.id) {
      return { success: false, error: 'Bạn không có quyền xóa cấu hình của giáo viên khác' }
    }

    const { error: deleteError } = await supabase
      .from('community_shared_configs')
      .delete()
      .eq('id', communityConfigId)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    revalidatePath('/admin/community')

    return { success: true, data: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi xóa cấu hình'
    return { success: false, error: message }
  }
}
