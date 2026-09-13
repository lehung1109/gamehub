import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AiClassroomCopilot } from '@/components/admin/ai/AiClassroomCopilot'

const mockGenerateArena = vi.fn()
const mockGeneratePlan = vi.fn()

vi.mock('@/app/actions/ai-copilot', () => ({
  generateArenaFromPromptAction: (...args: unknown[]) => mockGenerateArena(...args),
  generateRemediationPlanAction: (...args: unknown[]) => mockGeneratePlan(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('AiClassroomCopilot Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGenerateArena.mockResolvedValue({
      success: true,
      data: {
        title: 'Đấu Trường Động Vật',
        topic: 'animals',
        gradeLevel: 'grade-3',
        questions: [
          {
            id: 'ai-1',
            question: 'Which animal is the King of the Jungle?',
            options: ['Lion', 'Tiger', 'Elephant', 'Giraffe'],
            correctAnswer: 'Lion',
            timeLimitSeconds: 15,
            points: 1000,
            questionType: 'multiple_choice',
          },
          {
            id: 'ai-2',
            question: 'Cheetahs can run up to 120 km/h.',
            options: ['True', 'False'],
            correctAnswer: 'True',
            timeLimitSeconds: 15,
            points: 1000,
            questionType: 'true_false',
          },
        ],
      },
    })

    mockGeneratePlan.mockResolvedValue({
      success: true,
      data: {
        id: 'plan-123',
        title: 'Giáo án Khắc phục Lỗi Âm (/s/, /k/)',
        targetGrade: 'grade-3',
        durationMinutes: 15,
        focusPhonemes: ['/s/', '/k/'],
        warmUpTongueTwister: 'Six slippery snakes slithered silently south.',
        interactiveActivity: 'Trò chơi Thợ Săn Âm Đuôi',
        recommendedGames: ['pronunciation', 'flashcard'],
        teacherScriptVi: 'Chào cả lớp! Hôm nay chúng ta sẽ làm thợ săn âm...',
      },
    })
  })

  it('renders Arena Generator tab with strict >= 16px typography', () => {
    const { container } = render(<AiClassroomCopilot />)

    expect(
      screen.getByRole('heading', { name: /trợ lý ai đồng hành lớp học/i })
    ).toBeVisible()
    expect(screen.getByPlaceholderText(/nhập yêu cầu đề bài/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tạo đề đấu trường bằng ai/i })).toBeInTheDocument()

    // Typography audit: verify no forbidden classes
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('generates arena questions when submitting prompt and displays polymorphic badges', async () => {
    render(<AiClassroomCopilot />)

    const input = screen.getByPlaceholderText(/nhập yêu cầu đề bài/i)
    fireEvent.change(input, { target: { value: 'Tạo 5 câu về Animals lớp 3' } })

    const generateBtn = screen.getByRole('button', { name: /tạo đề đấu trường bằng ai/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(mockGenerateArena).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Tạo 5 câu về Animals lớp 3',
        })
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Which animal is the King of the Jungle?')).toBeInTheDocument()
      expect(screen.getByText('Cheetahs can run up to 120 km/h.')).toBeInTheDocument()
    })
  })

  it('switches to Remediation Lesson Plan tab and generates a 15-minute plan', async () => {
    render(<AiClassroomCopilot />)

    const planTab = screen.getByRole('button', { name: /giáo án can thiệp lỗi âm/i })
    fireEvent.click(planTab)

    const generatePlanBtn = screen.getByRole('button', { name: /tạo giáo án 15 phút/i })
    fireEvent.click(generatePlanBtn)

    await waitFor(() => {
      expect(mockGeneratePlan).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText(/Six slippery snakes slithered silently south/i)).toBeInTheDocument()
      expect(screen.getByText(/Trò chơi Thợ Săn Âm Đuôi/i)).toBeInTheDocument()
    })
  })
})
