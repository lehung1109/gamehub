import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MistakeNotebookTab } from '@/components/student/MistakeNotebookTab'
import * as srsActions from '@/app/actions/srs'
import { saveStoredSrsDeck, getStoredSrsDeck } from '@/lib/srs-storage'
import type { SrsCard } from '@/types/srs'

vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: vi.fn(),
    isSpeaking: false,
    isSupported: true,
    cancel: vi.fn(),
  }),
}))

vi.mock('@/app/actions/srs', () => ({
  getStudentSrsDeckAction: vi.fn(),
  submitSrsReviewBatchAction: vi.fn(),
  syncSrsDeckAction: vi.fn(),
}))

describe('MistakeNotebookTab Component', () => {
  const classCode = 'CLASS1'
  const studentName = 'Bé An'

  const mockCards: SrsCard[] = [
    {
      id: 'wordle_apple',
      prompt: 'apple',
      correctAnswer: 'quả táo',
      selectedAnswer: 'quả cam',
      gameType: 'wordle',
      topic: 'fruits',
      box: 1,
      lastReviewedAt: '2026-09-10T10:00:00Z',
      nextReviewAt: '2026-09-11T10:00:00Z', // due
      mistakeCount: 2,
      successCount: 0,
      isMastered: false,
    },
    {
      id: 'flashcards_banana',
      prompt: 'banana',
      correctAnswer: 'quả chuối',
      selectedAnswer: null,
      gameType: 'flashcards',
      topic: 'fruits',
      box: 2,
      lastReviewedAt: '2026-09-12T10:00:00Z',
      nextReviewAt: '2026-09-15T10:00:00Z', // not due
      mistakeCount: 1,
      successCount: 1,
      isMastered: false,
    },
    {
      id: 'spelling_cat',
      prompt: 'cat',
      correctAnswer: 'con mèo',
      selectedAnswer: 'con chó',
      gameType: 'spelling',
      topic: 'animals',
      box: 5,
      lastReviewedAt: '2026-09-01T10:00:00Z',
      nextReviewAt: '2026-10-01T10:00:00Z',
      mistakeCount: 3,
      successCount: 5,
      isMastered: true,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders empty state when no mistake cards exist', async () => {
    vi.mocked(srsActions.getStudentSrsDeckAction).mockResolvedValue({
      success: true,
      deck: [],
      summary: {
        totalCards: 0,
        dueCount: 0,
        masteredCount: 0,
        learningCount: 0,
        reviewingCount: 0,
      },
    })

    render(<MistakeNotebookTab classCode={classCode} studentName={studentName} />)

    expect(await screen.findByText(/Chưa có từ sai nào/i)).toBeInTheDocument()
    expect(screen.getByText(/Tổng số lỗi/i)).toBeInTheDocument()
    expect(screen.getByText(/Cần ôn hôm nay/i)).toBeInTheDocument()
    expect(screen.getByText(/Đã thành thạo/i)).toBeInTheDocument()
  })

  it('renders list of mistake cards with correct answers, box badges, and SpeakButton', async () => {
    vi.mocked(srsActions.getStudentSrsDeckAction).mockResolvedValue({
      success: true,
      deck: mockCards,
      summary: {
        totalCards: 3,
        dueCount: 1,
        masteredCount: 1,
        learningCount: 2,
        reviewingCount: 0,
      },
    })

    render(<MistakeNotebookTab classCode={classCode} studentName={studentName} />)

    // Prompt and Correct answer
    expect(await screen.findByText('apple')).toBeInTheDocument()
    expect(screen.getByText(/quả táo/i)).toBeInTheDocument()
    expect(screen.getByText(/quả cam/i)).toBeInTheDocument() // selected mistake

    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.getByText(/quả chuối/i)).toBeInTheDocument()

    expect(screen.getByText('cat')).toBeInTheDocument()
    expect(screen.getByText(/con mèo/i)).toBeInTheDocument()

    // Box badges
    expect(screen.getByText(/Hộp 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Hộp 2/i)).toBeInTheDocument()
    expect(screen.getByText(/Hộp 5/i)).toBeInTheDocument()

    // Speak buttons present
    const speakButtons = screen.getAllByRole('button', { name: /phát âm|speak/i })
    expect(speakButtons.length).toBeGreaterThanOrEqual(3)

    // KPI count check
    expect(screen.getByText('3')).toBeInTheDocument() // total
    expect(screen.getAllByText('1').length).toBe(2) // due and mastered
  })

  it('filters cards by status (All, Due, Mastered) and search text', async () => {
    vi.mocked(srsActions.getStudentSrsDeckAction).mockResolvedValue({
      success: true,
      deck: mockCards,
      summary: {
        totalCards: 3,
        dueCount: 1,
        masteredCount: 1,
        learningCount: 2,
        reviewingCount: 0,
      },
    })

    render(<MistakeNotebookTab classCode={classCode} studentName={studentName} />)
    expect(await screen.findByText('apple')).toBeInTheDocument()

    // Filter by Due ("Cần ôn")
    const dueFilterBtn = screen.getByRole('button', { name: /Cần ôn/i })
    fireEvent.click(dueFilterBtn)

    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.queryByText('banana')).not.toBeInTheDocument()
    expect(screen.queryByText('cat')).not.toBeInTheDocument()

    // Filter by Mastered ("Thành thạo")
    const masteredFilterBtn = screen.getByRole('button', { name: /Thành thạo/i })
    fireEvent.click(masteredFilterBtn)

    expect(screen.queryByText('apple')).not.toBeInTheDocument()
    expect(screen.queryByText('banana')).not.toBeInTheDocument()
    expect(screen.getByText('cat')).toBeInTheDocument()

    // Switch back to All
    const allFilterBtn = screen.getByRole('button', { name: /Tất cả/i })
    fireEvent.click(allFilterBtn)

    // Search input
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm/i)
    fireEvent.change(searchInput, { target: { value: 'banana' } })

    expect(screen.queryByText('apple')).not.toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.queryByText('cat')).not.toBeInTheDocument()
  })

  it('clicking "Luyện tập ngay" launches SrsPracticeArena', async () => {
    vi.mocked(srsActions.getStudentSrsDeckAction).mockResolvedValue({
      success: true,
      deck: mockCards,
      summary: {
        totalCards: 3,
        dueCount: 1,
        masteredCount: 1,
        learningCount: 2,
        reviewingCount: 0,
      },
    })

    render(<MistakeNotebookTab classCode={classCode} studentName={studentName} />)

    const practiceBtn = await screen.findByRole('button', { name: /Luyện tập ngay/i })
    expect(practiceBtn).toBeInTheDocument()

    fireEvent.click(practiceBtn)

    // Practice Arena should appear with card prompt and flip option
    expect(screen.getByText(/Thẻ 1 \/ 1/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Xem đáp án|Lật thẻ/i })).toBeInTheDocument()
  })

  it('in SrsPracticeArena: flips card, rates difficulty, submits review batch, shows completion screen and calls onStarsEarned', async () => {
    const dueCard: SrsCard = {
      id: 'wordle_hello',
      prompt: 'hello',
      correctAnswer: 'xin chào',
      selectedAnswer: 'chào buổi tối',
      gameType: 'wordle',
      box: 4,
      lastReviewedAt: '2026-09-01T00:00:00Z',
      nextReviewAt: '2026-09-10T00:00:00Z',
      mistakeCount: 2,
      successCount: 4,
      isMastered: false,
    }

    vi.mocked(srsActions.getStudentSrsDeckAction).mockResolvedValue({
      success: true,
      deck: [dueCard],
      summary: {
        totalCards: 1,
        dueCount: 1,
        masteredCount: 0,
        learningCount: 0,
        reviewingCount: 1,
      },
    })

    vi.mocked(srsActions.submitSrsReviewBatchAction).mockResolvedValue({
      success: true,
      earnedStars: 3,
      updatedCards: [
        {
          ...dueCard,
          box: 5,
          isMastered: true,
        },
      ],
      summary: {
        totalCards: 1,
        dueCount: 0,
        masteredCount: 1,
        learningCount: 0,
        reviewingCount: 0,
      },
    })

    const mockOnStarsEarned = vi.fn()

    render(
      <MistakeNotebookTab
        classCode={classCode}
        studentName={studentName}
        onStarsEarned={mockOnStarsEarned}
      />
    )

    // Start practice
    const practiceBtn = await screen.findByRole('button', { name: /Luyện tập ngay/i })
    fireEvent.click(practiceBtn)

    // Verify Front of card
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(screen.queryByText('xin chào')).not.toBeInTheDocument()

    // Flip card
    const flipBtn = screen.getByRole('button', { name: /Xem đáp án|Lật thẻ/i })
    fireEvent.click(flipBtn)

    // Verify Back of card shows correct answer & evaluation buttons
    expect(screen.getByText('xin chào')).toBeInTheDocument()
    const easyBtn = screen.getByRole('button', { name: /Rất dễ/i })
    expect(easyBtn).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Khó/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Nhớ tốt/i })).toBeInTheDocument()

    // Rate card as "Rất dễ 🟢"
    fireEvent.click(easyBtn)

    // Submit batch action should be called
    await waitFor(() => {
      expect(srsActions.submitSrsReviewBatchAction).toHaveBeenCalledWith({
        classCode,
        studentName,
        reviews: [{ cardId: 'wordle_hello', rating: 'easy' }],
      })
    })

    // Completion screen shows stats and bonus stars (+3 ⭐)
    expect(await screen.findByText(/Hoàn thành ôn tập/i)).toBeInTheDocument()
    expect(screen.getByText(/\+3 ⭐/i)).toBeInTheDocument()

    // Click "Hoàn tất"
    const completeBtn = screen.getByRole('button', { name: /Hoàn tất/i })
    await act(async () => {
      fireEvent.click(completeBtn)
    })

    expect(mockOnStarsEarned).toHaveBeenCalledWith(3)
    expect(await screen.findByText(/Tổng số lỗi/i)).toBeInTheDocument()
  })

  it('supports anonymous / guest mode using localStorage without server actions', async () => {
    const anonCard: SrsCard = {
      id: 'wordle_car',
      prompt: 'car',
      correctAnswer: 'xe hơi',
      gameType: 'wordle',
      box: 1,
      lastReviewedAt: null,
      nextReviewAt: '2026-09-10T00:00:00Z', // due
      mistakeCount: 1,
      successCount: 0,
      isMastered: false,
    }

    // Save to anon storage
    saveStoredSrsDeck(undefined, undefined, [anonCard])

    const mockOnStarsEarned = vi.fn()

    render(
      <MistakeNotebookTab
        isAnonymous={true}
        onStarsEarned={mockOnStarsEarned}
      />
    )

    // Server action should NOT be called in anon mode
    expect(srsActions.getStudentSrsDeckAction).not.toHaveBeenCalled()

    expect(await screen.findByText('car')).toBeInTheDocument()
    expect(screen.getByText(/xe hơi/i)).toBeInTheDocument()

    // Launch practice in anon mode
    const practiceBtn = screen.getByRole('button', { name: /Luyện tập ngay/i })
    fireEvent.click(practiceBtn)

    // Flip and rate
    fireEvent.click(screen.getByRole('button', { name: /Xem đáp án|Lật thẻ/i }))
    fireEvent.click(screen.getByRole('button', { name: /Nhớ tốt/i }))

    // submitSrsReviewBatchAction should NOT be called
    expect(srsActions.submitSrsReviewBatchAction).not.toHaveBeenCalled()

    // Card should be updated in local storage
    const updatedDeck = getStoredSrsDeck()
    expect(updatedDeck[0].box).toBe(2)

    // Complete session
    const completeBtn = await screen.findByRole('button', { name: /Hoàn tất/i })
    fireEvent.click(completeBtn)

    expect(mockOnStarsEarned).toHaveBeenCalledWith(0)
  })
})
