// src/app/actions/adaptive-learning.ts

'use server'

import type {
  AdaptiveDailyPlan,
  ClassDiagnosticSummary,
} from '@/types/adaptive-learning'
import {
  evaluateStudentSkillProfile,
  generateAdaptiveDailyPlan,
  generateClassDiagnosticSummary,
} from '@/lib/adaptive-learning-engine'

export interface ActionResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Retrieves or generates the personalized Daily 3-Step Power Pack for a student
 */
export async function getStudentAdaptivePlanAction(
  studentId: string,
  studentName: string = 'Học sinh'
): Promise<ActionResponse<AdaptiveDailyPlan>> {
  try {
    if (!studentId) {
      return { success: false, error: 'Thiếu mã định danh học sinh.' }
    }

    // Evaluate diagnostic profile with default or mock baseline attempts
    const profile = evaluateStudentSkillProfile(studentId, studentName, [
      { skillId: 'ph-ending-sounds', isCorrect: false },
      { skillId: 'voc-everyday-basics', isCorrect: true },
      { skillId: 'grm-word-order', isCorrect: true },
    ])

    const plan = generateAdaptiveDailyPlan(profile)
    return { success: true, data: plan }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể tạo gói bài tập thích ứng.'
    return { success: false, error: message }
  }
}

/**
 * Marks an adaptive daily step as completed and computes rewarded EXP
 */
export async function completeAdaptiveStepAction(
  studentId: string,
  planId: string,
  stepNumber: number
): Promise<ActionResponse<{ stepNumber: number; expGained: number; isFullyCompleted: boolean }>> {
  try {
    if (!studentId || !planId || stepNumber < 1 || stepNumber > 3) {
      return { success: false, error: 'Thông tin bước hoàn thành không hợp lệ.' }
    }

    const expMap: Record<number, number> = { 1: 10, 2: 20, 3: 30 }
    const expGained = expMap[stepNumber] || 10
    const isFullyCompleted = stepNumber === 3

    return {
      success: true,
      data: {
        stepNumber,
        expGained,
        isFullyCompleted,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi khi ghi nhận tiến độ bài tập.'
    return { success: false, error: message }
  }
}

/**
 * Computes class-wide diagnostic heatmap with tiered student cohorts
 */
export async function getClassDiagnosticHeatmapAction(
  classId: string,
  className: string = 'Lớp Tiếng Anh'
): Promise<ActionResponse<ClassDiagnosticSummary>> {
  try {
    if (!classId) {
      return { success: false, error: 'Thiếu mã lớp học.' }
    }

    // Sample class student profiles for pedagogical demonstration
    const mockStudentData = [
      {
        id: 'stu-1',
        name: 'Trần Minh Khang',
        attempts: [
          { skillId: 'ph-ending-sounds', isCorrect: true },
          { skillId: 'voc-everyday-basics', isCorrect: true },
          { skillId: 'grm-word-order', isCorrect: true },
        ],
      },
      {
        id: 'stu-2',
        name: 'Lê Hoàng Yến',
        attempts: [
          { skillId: 'ph-ending-sounds', isCorrect: false },
          { skillId: 'ph-fricatives-clusters', isCorrect: false },
          { skillId: 'voc-everyday-basics', isCorrect: true },
        ],
      },
      {
        id: 'stu-3',
        name: 'Phạm Đức Anh',
        attempts: [
          { skillId: 'grm-word-order', isCorrect: false },
          { skillId: 'grm-present-simple', isCorrect: false },
          { skillId: 'lis-sentence-comprehension', isCorrect: false },
        ],
      },
      {
        id: 'stu-4',
        name: 'Nguyễn Thùy Dương',
        attempts: [
          { skillId: 'voc-animals-nature', isCorrect: true },
          { skillId: 'voc-actions-jobs', isCorrect: true },
          { skillId: 'lis-sound-discrim', isCorrect: true },
        ],
      },
    ]

    const profiles = mockStudentData.map((s) =>
      evaluateStudentSkillProfile(s.id, s.name, s.attempts)
    )

    const summary = generateClassDiagnosticSummary(profiles, classId, className)
    return { success: true, data: summary }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể tải bản đồ năng lực lớp học.'
    return { success: false, error: message }
  }
}
