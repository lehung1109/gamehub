// tests/components/config/ConfigForms.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FlashcardConfigForm } from '@/components/config/FlashcardConfigForm'
import { AlphabetConfigForm } from '@/components/config/AlphabetConfigForm'
import { ListeningConfigForm } from '@/components/config/ListeningConfigForm'
import { SpellingConfigForm } from '@/components/config/SpellingConfigForm'
import { NumbersColorsConfigForm } from '@/components/config/NumbersColorsConfigForm'
import { SentencesConfigForm } from '@/components/config/SentencesConfigForm'
import { ConfigCreateForm } from '@/components/config/ConfigCreateForm'
import type { Game } from '@/types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/app/actions/configs', () => ({
  createConfig: vi.fn(),
}))

const mockGame: Game = {
  id: 'flashcard',
  titleVi: 'Thẻ Từ Vựng',
  titleEn: 'Flashcards',
  slug: 'flashcards',
  route: '/games/flashcard',
  emoji: '🎴',
  description: 'Học từ vựng tiếng Anh qua hình ảnh sinh động và phát âm chuẩn.',
  priority: 1,
}

describe('Game Config Forms', () => {
  it('renders FlashcardConfigForm and handles input changes', () => {
    const onChange = vi.fn()
    render(
      <FlashcardConfigForm
        settings={{ topics: ['animals'], wordLimit: 10, autoSpeak: true }}
        onChange={onChange}
      />
    )

    expect(screen.getByText(/chủ đề từ vựng/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/số lượng từ tối đa/i)).toHaveValue(10)
    expect(screen.getByLabelText(/tự động phát âm/i)).toBeChecked()

    fireEvent.change(screen.getByLabelText(/số lượng từ tối đa/i), {
      target: { value: '15' },
    })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ wordLimit: 15 })
    )
  })

  it('renders AlphabetConfigForm with accessibility attributes and switches modes', () => {
    const onChange = vi.fn()
    render(
      <AlphabetConfigForm
        settings={{ letterRange: [], mode: 'learn', autoSpeak: false }}
        onChange={onChange}
      />
    )

    expect(screen.getByText(/chế độ chơi/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/học chữ cái/i)).toBeChecked()

    // Letter buttons should have aria-pressed
    const letterA = screen.getByRole('button', { name: /chữ cái a/i })
    expect(letterA).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByLabelText(/trắc nghiệm/i))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'quiz' })
    )
  })

  it('renders ListeningConfigForm and handles question count change', () => {
    const onChange = vi.fn()
    render(
      <ListeningConfigForm
        settings={{ topics: [], questionCount: 5, showHint: true }}
        onChange={onChange}
      />
    )

    expect(screen.getByLabelText(/số lượng câu hỏi/i)).toHaveValue(5)
    expect(screen.getByLabelText(/hiển thị gợi ý/i)).toBeChecked()
  })

  it('renders SpellingConfigForm', () => {
    const onChange = vi.fn()
    render(
      <SpellingConfigForm
        settings={{ topics: [], wordLimit: 8, showEmoji: true }}
        onChange={onChange}
      />
    )

    expect(screen.getByLabelText(/số lượng từ/i)).toHaveValue(8)
    expect(screen.getByLabelText(/hiển thị hình ảnh minh họa/i)).toBeChecked()
  })

  it('renders NumbersColorsConfigForm and adjusts range', () => {
    const onChange = vi.fn()
    render(
      <NumbersColorsConfigForm
        settings={{ numberRange: [1, 20], includeColors: true, mode: 'learn' }}
        onChange={onChange}
      />
    )

    expect(screen.getByText(/phạm vi số đếm/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bao gồm phần học màu sắc/i)).toBeChecked()
    expect(screen.getByLabelText(/từ số/i)).toHaveValue(1)
    expect(screen.getByLabelText(/đến số/i)).toHaveValue(20)
  })

  it('renders SentencesConfigForm including school category', () => {
    const onChange = vi.fn()
    render(
      <SentencesConfigForm
        settings={{ categories: [], sentenceCount: 10, showVietnamese: true }}
        onChange={onChange}
      />
    )

    expect(screen.getByText(/chủ đề mẫu câu/i)).toBeInTheDocument()
    expect(screen.getByText(/trường học & đồ dùng/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/số lượng câu/i)).toHaveValue(10)
    expect(screen.getByLabelText(/hiển thị gợi ý nghĩa tiếng việt/i)).toBeChecked()
  })

  it('renders ConfigCreateForm with name input, submit button, and preview button', () => {
    const mockWindowOpen = vi.fn()
    vi.stubGlobal('open', mockWindowOpen)

    render(<ConfigCreateForm game={mockGame} />)

    expect(
      screen.getByText(/tạo cấu hình mới: thẻ từ vựng/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/tên cấu hình bài học/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /lưu cấu hình/i })
    ).toBeInTheDocument()

    const previewBtn = screen.getByRole('button', { name: /chơi thử/i })
    expect(previewBtn).toBeInTheDocument()

    fireEvent.click(previewBtn)
    expect(mockWindowOpen).toHaveBeenCalledTimes(1)
    expect(mockWindowOpen.mock.calls[0][0]).toMatch(/^\/games\/flashcard\?preview=/)

    vi.unstubAllGlobals()
  })
})
