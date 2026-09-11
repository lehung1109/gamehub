export interface Assignment {
  id: string
  classroom_id: string
  title: string
  description?: string | null
  game_type: string
  topic?: string | null
  config_id?: string | null
  target_score: number
  due_date: string
  is_active: boolean
  created_at: string
}

export interface CreateAssignmentInput {
  classroomId: string
  title: string
  description?: string
  gameType: string
  topic?: string
  configId?: string
  targetScore?: number
  dueDate: string
}

export interface AssignmentWithProgress extends Assignment {
  completedCount: number
  totalStudentsCount: number
}

export interface StudentAssignmentItem extends Assignment {
  status: 'completed' | 'pending' | 'overdue'
  studentScore?: number
  completedAt?: string
}
