import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface SessionDetailPayload {
  prompt: string
  selectedAnswer?: string
  correctAnswer?: string
  isCorrect: boolean
  timeTakenMs: number
  attempts?: number
}

export interface TrackGamePayload {
  classCode: string
  studentName: string
  gameType: string
  topic: string
  score?: number
  totalQuestions: number
  startedAt: string
  completedAt: string
  configId?: string
  details: SessionDetailPayload[]
}

function isValidIsoDate(dateStr: unknown): boolean {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return false
  const time = Date.parse(dateStr)
  return !isNaN(time)
}

function validatePayload(body: unknown): {
  valid: boolean
  errors: string[]
  data?: TrackGamePayload
} {
  const errors: string[] = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be a valid JSON object'] }
  }

  const record = body as Record<string, unknown>

  // classCode validation
  if (typeof record.classCode !== 'string' || !record.classCode.trim()) {
    errors.push('classCode is required')
  }

  // studentName validation
  if (typeof record.studentName !== 'string' || !record.studentName.trim()) {
    errors.push('studentName is required')
  } else if (record.studentName.trim().length > 100) {
    errors.push('studentName cannot exceed 100 characters')
  }

  // gameType validation
  if (typeof record.gameType !== 'string' || !record.gameType.trim()) {
    errors.push('gameType is required')
  }

  // topic validation
  if (typeof record.topic !== 'string' || !record.topic.trim()) {
    errors.push('topic is required')
  }

  // totalQuestions validation
  if (
    typeof record.totalQuestions !== 'number' ||
    !Number.isInteger(record.totalQuestions) ||
    record.totalQuestions < 0
  ) {
    errors.push('totalQuestions must be a non-negative integer')
  }

  // score validation (optional)
  if (record.score !== undefined && record.score !== null) {
    if (
      typeof record.score !== 'number' ||
      !Number.isInteger(record.score) ||
      record.score < 0
    ) {
      errors.push('score must be a non-negative integer if provided')
    }
  }

  // startedAt validation
  if (!isValidIsoDate(record.startedAt)) {
    errors.push('startedAt must be a valid ISO 8601 date string')
  }

  // completedAt validation
  if (!isValidIsoDate(record.completedAt)) {
    errors.push('completedAt must be a valid ISO 8601 date string')
  }

  // details validation
  if (!Array.isArray(record.details)) {
    errors.push('details must be an array of question results')
  } else if (record.details.length > 200) {
    errors.push('details array cannot contain more than 200 items')
  } else {
    record.details.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`details[${index}] must be an object`)
        return
      }
      const d = item as Record<string, unknown>
      if (typeof d.prompt !== 'string' || !d.prompt.trim()) {
        errors.push(`details[${index}].prompt is required`)
      } else if (d.prompt.length > 500) {
        errors.push(`details[${index}].prompt cannot exceed 500 characters`)
      }
      if (typeof d.isCorrect !== 'boolean') {
        errors.push(`details[${index}].isCorrect must be a boolean`)
      }
      if (
        typeof d.timeTakenMs !== 'number' ||
        !Number.isFinite(d.timeTakenMs) ||
        d.timeTakenMs < 0
      ) {
        errors.push(`details[${index}].timeTakenMs must be a non-negative finite number`)
      }
      if (
        d.attempts !== undefined &&
        d.attempts !== null &&
        (typeof d.attempts !== 'number' || !Number.isInteger(d.attempts) || d.attempts < 1)
      ) {
        errors.push(`details[${index}].attempts must be a positive integer if provided`)
      }
      if (typeof d.selectedAnswer === 'string' && d.selectedAnswer.length > 500) {
        errors.push(`details[${index}].selectedAnswer cannot exceed 500 characters`)
      }
      if (typeof d.correctAnswer === 'string' && d.correctAnswer.length > 500) {
        errors.push(`details[${index}].correctAnswer cannot exceed 500 characters`)
      }
    })
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    data: {
      classCode: (record.classCode as string).trim().toUpperCase(),
      studentName: (record.studentName as string).trim(),
      gameType: (record.gameType as string).trim(),
      topic: (record.topic as string).trim(),
      score: typeof record.score === 'number' ? record.score : undefined,
      totalQuestions: record.totalQuestions as number,
      startedAt: record.startedAt as string,
      completedAt: record.completedAt as string,
      configId: typeof record.configId === 'string' && record.configId.trim() ? record.configId.trim() : undefined,
      details: record.details as SessionDetailPayload[],
    },
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: 'Invalid request payload',
          details: ['Malformed JSON in request body'],
        },
        { status: 400 }
      )
    }

    const validation = validatePayload(body)
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          error: 'Invalid request payload',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    const payload = validation.data
    const supabase = createAdminClient()

    // 1. Verify classroom exists and is active
    const { data: classroom, error: classError } = await supabase
      .from('classrooms')
      .select('id, code, is_active, name')
      .eq('code', payload.classCode)
      .single()

    if (classError || !classroom || !classroom.is_active) {
      return NextResponse.json(
        {
          error: 'Mã lớp không đúng rồi, bé hãy kiểm tra lại nhé! 🔍',
        },
        { status: 404 }
      )
    }

    // 2. Find or create student in the classroom
    let studentId: string | null = null

    const { data: existingStudents } = await supabase
      .from('students')
      .select('id, classroom_id, name')
      .eq('classroom_id', classroom.id)
      .eq('name', payload.studentName)
      .limit(1)

    const existingStudent = existingStudents?.[0]

    if (existingStudent?.id) {
      studentId = existingStudent.id
    } else {
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert({
          classroom_id: classroom.id,
          name: payload.studentName,
        })
        .select()
        .single()

      if (studentError || !newStudent) {
        console.error('[Tracking API] Failed to create student:', studentError)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }

      studentId = newStudent.id
    }

    // 3. Insert game_sessions record
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        student_id: studentId,
        game_type: payload.gameType,
        topic: payload.topic,
        score: payload.score !== undefined ? payload.score : null,
        total_questions: payload.totalQuestions,
        started_at: payload.startedAt,
        completed_at: payload.completedAt,
        config_id: payload.configId || null,
      })
      .select()
      .single()

    if (sessionError || !session) {
      console.error('[Tracking API] Failed to create game_session:', sessionError)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    // 4. Insert session_details records
    if (payload.details && payload.details.length > 0) {
      const detailsToInsert = payload.details.map((item) => ({
        session_id: session.id,
        prompt: item.prompt,
        selected_answer: item.selectedAnswer !== undefined ? item.selectedAnswer : null,
        correct_answer: item.correctAnswer !== undefined ? item.correctAnswer : null,
        is_correct: item.isCorrect,
        time_taken_ms: item.timeTakenMs,
        attempts: typeof item.attempts === 'number' && item.attempts > 0 ? item.attempts : 1,
      }))

      const { error: detailsError } = await supabase
        .from('session_details')
        .insert(detailsToInsert)

      if (detailsError) {
        console.error('[Tracking API] Failed to insert session_details:', detailsError)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[Tracking API] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
