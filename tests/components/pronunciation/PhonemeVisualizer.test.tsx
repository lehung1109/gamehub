import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhonemeVisualizer } from '@/components/game/pronunciation/PhonemeVisualizer'
import type { PhonemeAssessmentResult } from '@/types/ai-copilot'

const mockResultWithDroppedEnding: PhonemeAssessmentResult = {
  targetWord: 'like',
  transcribedText: 'lai',
  accuracy: 65,
  stars: 1,
  isPassed: false,
  hasDroppedFinalSound: true,
  phonemes: [
    { phoneme: 'l', ipa: '/l/', type: 'consonant', status: 'perfect', score: 100, tipVi: 'Âm /l/ chuẩn!' },
    { phoneme: 'i_e', ipa: '/aɪ/', type: 'vowel', status: 'perfect', score: 95, tipVi: 'Nguyên âm đôi /aɪ/ rất tốt.' },
    { phoneme: 'k', ipa: '/k/', type: 'consonant', status: 'omitted', score: 0, tipVi: 'Lỗi nuốt âm đuôi: Hãy nhớ bật âm đuôi /k/ ở cuối từ.' },
  ],
  overallFeedbackVi: 'Em phát âm tốt phần đầu nhưng bị thiếu âm đuôi /k/.',
  remediationAdviceVi: 'Hãy nhấn rõ âm đuôi /k/ ở cuối từ "like".',
}

const mockPerfectResult: PhonemeAssessmentResult = {
  targetWord: 'cat',
  transcribedText: 'cat',
  accuracy: 100,
  stars: 3,
  isPassed: true,
  hasDroppedFinalSound: false,
  phonemes: [
    { phoneme: 'c', ipa: '/k/', type: 'consonant', status: 'perfect', score: 100 },
    { phoneme: 'a', ipa: '/æ/', type: 'vowel', status: 'perfect', score: 100 },
    { phoneme: 't', ipa: '/t/', type: 'consonant', status: 'perfect', score: 100 },
  ],
  overallFeedbackVi: 'Phát âm rất tốt và rõ ràng!',
  remediationAdviceVi: 'Duy trì phát âm chuẩn xác này nhé!',
}

describe('PhonemeVisualizer Component', () => {
  it('renders granular phoneme chips with IPA notation and dropped ending warning', () => {
    const { container } = render(
      <PhonemeVisualizer result={mockResultWithDroppedEnding} />
    )

    // Check accuracy and dropped sound banner
    expect(screen.getByText(/65%/i)).toBeInTheDocument()
    expect(screen.getByText(/lỗi nuốt âm đuôi/i)).toBeInTheDocument()

    // Check IPA chips
    expect(screen.getByText('/l/')).toBeInTheDocument()
    expect(screen.getByText('/aɪ/')).toBeInTheDocument()
    expect(screen.getByText('/k/')).toBeInTheDocument()

    // Typography audit: ensure strictly >= 16px font sizes
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('triggers onPlayPhoneme callback when clicking a phoneme chip', () => {
    const onPlayPhoneme = vi.fn()
    render(
      <PhonemeVisualizer
        result={mockResultWithDroppedEnding}
        onPlayPhoneme={onPlayPhoneme}
      />
    )

    const kChip = screen.getByRole('button', { name: /phát âm \/k\//i })
    fireEvent.click(kChip)

    expect(onPlayPhoneme).toHaveBeenCalledWith('k')
  })

  it('renders 3 stars for perfect pronunciation with all green chips', () => {
    render(<PhonemeVisualizer result={mockPerfectResult} />)

    expect(screen.getByText(/100%/i)).toBeInTheDocument()
    expect(screen.getByText(/phát âm rất tốt và rõ ràng!/i)).toBeInTheDocument()
    expect(screen.queryByText(/lỗi nuốt âm đuôi/i)).not.toBeInTheDocument()
  })
})
