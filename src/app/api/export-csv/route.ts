// src/app/api/export-csv/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGameLabel } from '@/lib/analytics'
import { generateClassSessionsCsv, type CsvSessionRecord } from '@/lib/export-csv'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')?.trim()
    const timeframe = searchParams.get('timeframe')?.trim() || 'all'

    if (!classId) {
      return NextResponse.json(
        { error: 'Mã ID lớp học (classId) là bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      )
    }

    // 1. Verify classroom exists and belongs to the authenticated teacher (FR-014)
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id, name, code, teacher_id')
      .eq('id', classId)
      .eq('teacher_id', user.id)
      .single()

    if (classError || !classroom) {
      return NextResponse.json(
        { error: 'Không tìm thấy lớp học hoặc bạn không có quyền truy cập' },
        { status: 404 }
      )
    }

    // 2. Fetch game sessions for students in this class
    let query = supabase
      .from('game_sessions')
      .select(
        'id, student_id, game_type, topic, score, total_questions, completed_at, started_at, students!inner(id, name, classroom_id)'
      )
      .eq('students.classroom_id', classroom.id)

    if (timeframe === '7d') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('completed_at', sevenDaysAgo)
    } else if (timeframe === '30d') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('completed_at', thirtyDaysAgo)
    }

    const { data: sessions, error: sessionsError } = await query
      .order('completed_at', { ascending: false })
      .limit(10000)

    if (sessionsError) {
      console.error('[Export CSV] Error querying sessions:', sessionsError)
      return NextResponse.json(
        { error: 'Đã xảy ra lỗi khi lấy dữ liệu phiên chơi' },
        { status: 500 }
      )
    }

    // 3. Map database records to CSV format
    interface RawSessionRow {
      student_id?: string
      game_type?: string | null
      topic?: string | null
      score?: number | null
      total_questions?: number | null
      completed_at?: string | null
      started_at?: string | null
      students?: { name?: string } | null
    }

    const records: CsvSessionRecord[] = ((sessions as unknown as RawSessionRow[]) || []).map((sess) => {
      const studentName = sess.students?.name || 'Học sinh'
      const gameName = getGameLabel(sess.game_type || '')
      const topic = sess.topic || 'Mặc định'
      const score = sess.score
      const totalQuestions = sess.total_questions
      const completedAt = sess.completed_at || sess.started_at

      return {
        studentName,
        gameName,
        topic,
        score,
        totalQuestions,
        completedAt,
      }
    })

    const csvContent = generateClassSessionsCsv(records)
    
    // Sanitize filename to prevent HTTP Header Injection
    const safeCode = (classroom.code || classroom.id).replace(/[^a-zA-Z0-9_-]/g, '')
    const filename = `report-${safeCode || 'class'}.csv`

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (err) {
    console.error('[Export CSV Route] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi máy chủ trong quá trình xuất báo cáo' },
      { status: 500 }
    )
  }
}
