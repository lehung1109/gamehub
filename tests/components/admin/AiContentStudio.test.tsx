// tests/components/admin/AiContentStudio.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AiContentStudio } from '@/components/admin/AiContentStudio'

const mockGenerateVocab = vi.fn()
const mockGenerateReading = vi.fn()
const mockGenerateGrammar = vi.fn()
const mockPublishAction = vi.fn()
const mockRouterPush = vi.fn()

vi.mock('@/app/actions/ai-generator', () => ({
  generateAiVocabularyAction: (...args: unknown[]) => mockGenerateVocab(...args),
  generateAiReadingAction: (...args: unknown[]) => mockGenerateReading(...args),
  generateAiGrammarAction: (...args: unknown[]) => mockGenerateGrammar(...args),
  publishAiContentToGameConfigAction: (...args: unknown[]) => mockPublishAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    refresh: vi.fn(),
  }),
}))

describe('AiContentStudio Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGenerateVocab.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'v-1',
          english: 'Galaxy',
          vietnamese: 'Thiên hà',
          phonetic: '/ˈɡæləksi/',
          partOfSpeech: 'noun',
          cefrLevel: 'B1',
          topic: 'space',
          emoji: '🌌',
          exampleSentence: 'Our galaxy is huge.',
          exampleTranslation: 'Thiên hà rất lớn.',
          distractors: ['Hành tinh', 'Ngôi sao'],
        },
      ],
    })

    mockGenerateReading.mockResolvedValue({
      success: true,
      data: {
        title: 'Exploring Space',
        passage: 'Astronauts travel to the Moon.',
        vietnameseTranslation: 'Các phi hành gia bay tới Mặt Trăng.',
        cefrLevel: 'A2',
        topic: 'space',
        questions: [
          {
            id: 'q1',
            question: 'Where do astronauts travel?',
            options: ['To the Moon', 'To Mars', 'To the Sun'],
            correctAnswer: 'To the Moon',
            explanation: 'The passage says they travel to the Moon.',
          },
        ],
      },
    })

    mockGenerateGrammar.mockResolvedValue({
      success: true,
      data: [
        {
          id: 'g1',
          incorrectSentence: 'He don’t know the answer.',
          correctSentence: 'He doesn’t know the answer.',
          errorPart: 'don’t',
          ruleExplanation: 'Third person singular takes doesn’t.',
          hint: 'Subject is He',
        },
      ],
    })

    mockPublishAction.mockResolvedValue({
      success: true,
      configId: 'cfg-new-999',
      gameId: 'flashcard',
    })
  })

  it('renders studio header and default vocabulary generator tab', () => {
    render(<AiContentStudio />)

    expect(screen.getByText(/AI Content Studio/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sinh từ vựng/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sinh bài đọc/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ngữ pháp/i })).toBeInTheDocument()
  })

  it('generates vocabulary and displays editable results', async () => {
    render(<AiContentStudio />)

    const topicInput = screen.getByPlaceholderText(/nhập chủ đề/i)
    fireEvent.change(topicInput, { target: { value: 'space' } })

    const generateBtn = screen.getByRole('button', { name: /tạo từ vựng bằng ai/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(mockGenerateVocab).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'space' })
      )
    })

    expect(screen.getByDisplayValue('Galaxy')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Thiên hà')).toBeInTheDocument()
  })

  it('switches to reading tab and generates reading passage', async () => {
    render(<AiContentStudio />)

    const readingTab = screen.getByRole('button', { name: /sinh bài đọc/i })
    fireEvent.click(readingTab)

    const generateBtn = screen.getByRole('button', { name: /tạo bài đọc bằng ai/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(mockGenerateReading).toHaveBeenCalled()
    })

    expect(screen.getByText('Exploring Space')).toBeInTheDocument()
    expect(screen.getByText('Astronauts travel to the Moon.')).toBeInTheDocument()
  })

  it('switches to grammar tab and generates detective questions', async () => {
    render(<AiContentStudio />)

    const grammarTab = screen.getByRole('button', { name: /ngữ pháp/i })
    fireEvent.click(grammarTab)

    const generateBtn = screen.getByRole('button', { name: /tạo câu hỏi ngữ pháp/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(mockGenerateGrammar).toHaveBeenCalled()
    })

    expect(screen.getByText('He don’t know the answer.')).toBeInTheDocument()
    expect(screen.getByText('He doesn’t know the answer.')).toBeInTheDocument()
  })

  it('opens publish modal and publishes game config', async () => {
    render(<AiContentStudio />)

    // Generate vocab first
    fireEvent.click(screen.getByRole('button', { name: /tạo từ vựng bằng ai/i }))
    await waitFor(() => {
      expect(screen.getByDisplayValue('Galaxy')).toBeInTheDocument()
    })

    // Click publish button
    const openPublishBtn = screen.getByRole('button', { name: /xuất sang game/i })
    fireEvent.click(openPublishBtn)

    // Modal is open
    expect(screen.getByText(/xuất nội dung sang game/i)).toBeInTheDocument()

    // Enter name and submit
    const nameInput = screen.getByPlaceholderText(/tên cấu hình/i)
    fireEvent.change(nameInput, { target: { value: 'Bộ Thẻ Thiên Hà' } })

    const confirmBtn = screen.getByRole('button', { name: /xác nhận tạo game/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(mockPublishAction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bộ Thẻ Thiên Hà',
          gameId: 'flashcard',
        })
      )
    })
  })
})
