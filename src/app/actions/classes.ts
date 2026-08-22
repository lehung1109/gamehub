'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateClassCode } from '@/lib/class-code'
import type { Database } from '@/types/database'

export type Classroom = Database['public']['Tables']['classrooms']['Row']
export type ClassroomWithCount = Classroom & {
  student_count: number
}

export async function createClassAction(input: {
  name: string
}): Promise<{ data?: Classroom; error?: string }> {
  try {
    if (!input || typeof input !== 'object') {
      return { error: 'Dữ liệu đầu vào không hợp lệ' }
    }

    if (typeof input.name !== 'string') {
      return { error: 'Tên lớp là bắt buộc' }
    }

    const trimmedName = input.name.trim()
    if (!trimmedName) {
      return { error: 'Tên lớp là bắt buộc' }
    }

    if (trimmedName.length > 200) {
      return { error: 'Tên lớp không được vượt quá 200 ký tự' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    // Generate unique class code (with collision retry)
    let created: Classroom | null = null
    let insertError: { message: string } | null = null
    let attempts = 0

    while (attempts < 5) {
      attempts++
      const code = generateClassCode(6)

      const { data, error } = await supabase
        .from('classrooms')
        .insert({
          teacher_id: user.id,
          name: trimmedName,
          code,
          is_active: true,
        })
        .select()
        .single()

      if (!error && data) {
        created = data
        insertError = null
        break
      }

      // If duplicate code constraint, retry
      if (error && (error.code === '23505' || error.message.includes('unique'))) {
        insertError = error
        continue
      }

      insertError = error
      break
    }

    if (insertError || !created) {
      return { error: insertError?.message || 'Không thể tạo lớp học' }
    }

    revalidatePath('/admin/dashboard/classes')
    revalidatePath('/admin/classes')
    revalidatePath('/admin/dashboard')

    return { data: created }
  } catch (err) {
    console.error('[createClassAction] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.' }
  }
}

export async function getClassesAction(): Promise<{
  data?: ClassroomWithCount[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    const { data, error } = await supabase
      .from('classrooms')
      .select('*, students(count)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[getClassesAction] Error:', error)
      return { error: error.message }
    }

    const classroomsWithCount: ClassroomWithCount[] = (data || []).map((row) => {
      const studentCount = (row.students as unknown as { count: number }[])?.[0]?.count || 0

      const { students, ...classroomData } = row
      return {
        ...(classroomData as Classroom),
        student_count: studentCount,
      }
    })

    return { data: classroomsWithCount }
  } catch (err) {
    console.error('[getClassesAction] Error:', err)
    return { error: 'Đã xảy ra lỗi khi tải danh sách lớp học.' }
  }
}

export async function updateClassAction(
  id: string,
  updates: { name?: string; is_active?: boolean }
): Promise<{ data?: Classroom; error?: string }> {
  try {
    if (!id || typeof id !== 'string' || !id.trim()) {
      return { error: 'ID lớp học không hợp lệ' }
    }
    const cleanId = id.trim()

    if (!updates || typeof updates !== 'object') {
      return { error: 'Dữ liệu cập nhật không hợp lệ' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Bạn cần đăng nhập để thực hiện thao tác này' }
    }

    const updatePayload: Record<string, unknown> = {}

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string') {
        return { error: 'Tên lớp không hợp lệ' }
      }
      const trimmedName = updates.name.trim()
      if (!trimmedName) {
        return { error: 'Tên lớp là bắt buộc' }
      }
      if (trimmedName.length > 200) {
        return { error: 'Tên lớp không được vượt quá 200 ký tự' }
      }
      updatePayload.name = trimmedName
    }

    if (updates.is_active !== undefined) {
      updatePayload.is_active = Boolean(updates.is_active)
    }

    if (Object.keys(updatePayload).length === 0) {
      return { error: 'Không có dữ liệu thay đổi' }
    }

    const { data, error } = await supabase
      .from('classrooms')
      .update(updatePayload)
      .eq('id', cleanId)
      .eq('teacher_id', user.id)
      .select()
      .single()

    if (error || !data) {
      return { error: error?.message || 'Không thể cập nhật lớp học' }
    }

    revalidatePath('/admin/dashboard/classes')
    revalidatePath('/admin/classes')
    revalidatePath(`/admin/dashboard/classes/${cleanId}`)
    revalidatePath('/admin/dashboard')

    return { data }
  } catch (err) {
    console.error('[updateClassAction] Error:', err)
    return { error: 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.' }
  }
}

export async function deactivateClassAction(
  id: string
): Promise<{ data?: Classroom; error?: string }> {
  return updateClassAction(id, { is_active: false })
}

export async function activateClassAction(
  id: string
): Promise<{ data?: Classroom; error?: string }> {
  return updateClassAction(id, { is_active: true })
}
