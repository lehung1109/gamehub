import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateArenaFromPromptAction,
  generateRemediationPlanAction,
  assessPhonemePronunciationAction,
} from '@/app/actions/ai-copilot'
import * as serverSupabase from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('AI Co-Pilot Server Actions', () => {
  let mockSupabase: {
    auth: {
      getUser: ReturnType<typeof vi.fn>
    }
  }

  const mockTeacher = { id: 'teacher-copilot-1', email: 'teacher@test.com' }

  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockTeacher }, error: null }),
      },
    }

    vi.mocked(serverSupabase.createClient).mockResolvedValue(
      mockSupabase as unknown as Awaited<ReturnType<typeof serverSupabase.createClient>>
    )
  })

  describe('generateArenaFromPromptAction', () => {
    it('returns error if user is unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const res = await generateArenaFromPromptAction({
        prompt: 'Tạo 5 câu về Animals',
      })

      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('generates arena payload with valid questions for authenticated teacher', async () => {
      const res = await generateArenaFromPromptAction({
        prompt: 'Tạo 6 câu Animals cho lớp 3',
        gradeLevel: 'grade-3',
        questionCount: 6,
      })

      expect(res.success).toBe(true)
      expect(res.data?.questions).toHaveLength(6)
      expect(res.data?.gradeLevel).toBe('grade-3')
    })
  })

  describe('generateRemediationPlanAction', () => {
    it('returns error if unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const res = await generateRemediationPlanAction('pronunciation', 'grade-4')
      expect(res.success).toBe(false)
      expect(res.error).toMatch(/đăng nhập/i)
    })

    it('generates structured 15-minute lesson plan for teacher', async () => {
      const res = await generateRemediationPlanAction('pronunciation', 'grade-4', ['/s/', '/k/'])

      expect(res.success).toBe(true)
      expect(res.data?.durationMinutes).toBe(15)
      expect(res.data?.focusPhonemes).toContain('/s/')
    })
  })

  describe('assessPhonemePronunciationAction', () => {
    it('evaluates student pronunciation and identifies dropped final sound', async () => {
      const res = await assessPhonemePronunciationAction('like', 'lai')

      expect(res.success).toBe(true)
      expect(res.data?.targetWord).toBe('like')
      expect(res.data?.hasDroppedFinalSound).toBe(true)
      expect(res.data?.phonemes.find((p) => p.status === 'omitted')).toBeDefined()
    })
  })
})
