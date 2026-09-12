// tests/components/admin/WordBankList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WordBankList } from '@/components/admin/WordBankList'
import type { WordBankItem } from '@/types/word-bank'

const mockDeleteAction = vi.fn()
const mockCreateAction = vi.fn()

vi.mock('@/app/actions/word-bank', () => ({
  deleteWordBankWordAction: (...args: unknown[]) => mockDeleteAction(...args),
  createWordBankWordAction: (...args: unknown[]) => mockCreateAction(...args),
  getWordBankWordsAction: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockWords: WordBankItem[] = [
  {
    id: 'wb-1',
    english: 'Elephant',
    vietnamese: 'Con voi',
    phonetic: '/ˈel.ɪ.fənt/',
    partOfSpeech: 'noun',
    cefrLevel: 'A1',
    topic: 'animals',
    emoji: '🐘',
    exampleSentence: 'An elephant is big.',
    exampleTranslation: 'Con voi rất to lớn.',
    distractors: ['Con mèo', 'Con chuột'],
    createdBy: 'teacher-123',
    isSystem: false,
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'wb-sys',
    english: 'Cat',
    vietnamese: 'Con mèo',
    phonetic: '/kæt/',
    partOfSpeech: 'noun',
    cefrLevel: 'Pre-A1',
    topic: 'animals',
    emoji: '🐱',
    exampleSentence: 'The cat purrs.',
    exampleTranslation: 'Con mèo rừ rừ.',
    distractors: ['Con chó'],
    createdBy: null,
    isSystem: true,
    createdAt: '2026-09-12T09:00:00Z',
    updatedAt: '2026-09-12T09:00:00Z',
  },
]

describe('WordBankList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteAction.mockResolvedValue({ success: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('renders word list with English, Vietnamese, CEFR level, and phonetic', () => {
    render(<WordBankList initialWords={mockWords} totalCount={2} currentUserId="teacher-123" />)

    expect(screen.getByText('Elephant')).toBeInTheDocument()
    expect(screen.getByText('Con voi')).toBeInTheDocument()
    expect(screen.getByText('/ˈel.ɪ.fənt/')).toBeInTheDocument()
    expect(screen.getByText('Cat')).toBeInTheDocument()
    expect(screen.getByText('Con mèo')).toBeInTheDocument()
    expect(screen.getAllByText('A1').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Pre-A1').length).toBeGreaterThanOrEqual(1)
  })

  it('filters words based on search term', async () => {
    render(<WordBankList initialWords={mockWords} totalCount={2} currentUserId="teacher-123" />)

    const searchInput = screen.getByPlaceholderText(/tìm kiếm từ vựng/i)
    fireEvent.change(searchInput, { target: { value: 'Eleph' } })

    expect(screen.getByText('Elephant')).toBeInTheDocument()
    expect(screen.queryByText('Cat')).not.toBeInTheDocument()
  })

  it('shows empty state when no words match filter', () => {
    render(<WordBankList initialWords={[]} totalCount={0} currentUserId="teacher-123" />)

    expect(screen.getByText(/chưa có từ vựng nào/i)).toBeInTheDocument()
  })

  it('allows teacher to delete their own custom word', async () => {
    render(<WordBankList initialWords={mockWords} totalCount={2} currentUserId="teacher-123" />)

    // Elephant is createdBy teacher-123, so delete button exists
    const deleteButtons = screen.getAllByRole('button', { name: /xoá/i })
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1)

    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteAction).toHaveBeenCalledWith('wb-1')
    })
  })
})
