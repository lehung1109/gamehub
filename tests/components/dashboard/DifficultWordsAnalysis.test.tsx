// tests/components/dashboard/DifficultWordsAnalysis.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DifficultWordsAnalysis } from '@/components/dashboard/DifficultWordsAnalysis'
import type { ClassDifficultWordItem } from '@/app/actions/classes'

const mockDifficultWords: ClassDifficultWordItem[] = [
  {
    prompt: 'giraffe',
    gameType: 'listening',
    gameLabel: 'Luyện nghe',
    topic: 'animals',
    incorrectCount: 7,
    totalAttempts: 10,
    incorrectStudentCount: 7,
    totalStudentsAttempted: 10,
    errorRatePercent: 70,
    accuracyPercent: 30,
  },
  {
    prompt: 'banana',
    gameType: 'spelling',
    gameLabel: 'Đánh vần',
    topic: 'fruits',
    incorrectCount: 9,
    totalAttempts: 10,
    incorrectStudentCount: 9,
    totalStudentsAttempted: 10,
    errorRatePercent: 90,
    accuracyPercent: 10,
  },
  {
    prompt: 'watermelon',
    gameType: 'spelling',
    gameLabel: 'Đánh vần',
    topic: 'fruits',
    incorrectCount: 3,
    totalAttempts: 10,
    incorrectStudentCount: 3,
    totalStudentsAttempted: 10,
    errorRatePercent: 30,
    accuracyPercent: 70,
  },
]

describe('DifficultWordsAnalysis Component', () => {
  it('renders empty state when there are no difficult words in the class', () => {
    render(<DifficultWordsAnalysis items={[]} />)

    expect(screen.getByText(/Phân tích từ khó toàn lớp/i)).toBeInTheDocument()
    expect(screen.getByText(/Không có từ nào làm sai! Cả lớp làm rất tốt/i)).toBeInTheDocument()
  })

  it('renders list of difficult words with correct statistics and badges', () => {
    render(<DifficultWordsAnalysis items={mockDifficultWords} />)

    expect(screen.getByText(/Phân tích từ khó toàn lớp/i)).toBeInTheDocument()
    expect(screen.getByText('giraffe')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.getByText('watermelon')).toBeInTheDocument()

    // Check error rate badges
    expect(screen.getByText('70% sai')).toBeInTheDocument()
    expect(screen.getByText('90% sai')).toBeInTheDocument()
    expect(screen.getByText('30% sai')).toBeInTheDocument()

    // Check student count display
    expect(screen.getByText('7/10 học sinh')).toBeInTheDocument()
    expect(screen.getByText('9/10 học sinh')).toBeInTheDocument()
  })

  it('filters difficult words by game type (Acceptance Scenario 2)', () => {
    render(<DifficultWordsAnalysis items={mockDifficultWords} />)

    // Initially all 3 words are visible
    expect(screen.getByText('giraffe')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.getByText('watermelon')).toBeInTheDocument()

    // Filter by "Đánh vần" (spelling)
    const spellingButton = screen.getByRole('button', { name: /Đánh vần/i })
    fireEvent.click(spellingButton)

    expect(screen.queryByText('giraffe')).not.toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.getByText('watermelon')).toBeInTheDocument()

    // Filter by "Luyện nghe" (listening)
    const listeningButton = screen.getByRole('button', { name: /Luyện nghe/i })
    fireEvent.click(listeningButton)

    expect(screen.getByText('giraffe')).toBeInTheDocument()
    expect(screen.queryByText('banana')).not.toBeInTheDocument()
    expect(screen.queryByText('watermelon')).not.toBeInTheDocument()

    // Filter back to "Tất cả"
    const allButton = screen.getByRole('button', { name: /Tất cả/i })
    fireEvent.click(allButton)

    expect(screen.getByText('giraffe')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.getByText('watermelon')).toBeInTheDocument()
  })

  it('searches difficult words by text keyword', () => {
    render(<DifficultWordsAnalysis items={mockDifficultWords} />)

    const searchInput = screen.getByPlaceholderText(/Tìm từ hoặc câu hỏi/i)
    fireEvent.change(searchInput, { target: { value: 'gir' } })

    expect(screen.getByText('giraffe')).toBeInTheDocument()
    expect(screen.queryByText('banana')).not.toBeInTheDocument()
    expect(screen.queryByText('watermelon')).not.toBeInTheDocument()

    // Search by topic keyword
    fireEvent.change(searchInput, { target: { value: 'fruits' } })
    expect(screen.queryByText('giraffe')).not.toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
    expect(screen.getByText('watermelon')).toBeInTheDocument()
  })

  it('displays empty filter state when no words match search or game filter', () => {
    render(<DifficultWordsAnalysis items={mockDifficultWords} />)

    const searchInput = screen.getByPlaceholderText(/Tìm từ hoặc câu hỏi/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent-query' } })

    expect(screen.getByText(/Không tìm thấy từ khó nào phù hợp/i)).toBeInTheDocument()
  })

  it('allows sorting by error rate, incorrect count, and student count', () => {
    render(<DifficultWordsAnalysis items={mockDifficultWords} />)

    const sortSelect = screen.getByRole('combobox', { name: /Sắp xếp/i })
    expect(sortSelect).toBeInTheDocument()

    // Change sort to incorrectCount
    fireEvent.change(sortSelect, { target: { value: 'incorrectCount' } })
    expect(screen.getByText('banana')).toBeInTheDocument()
  })
})
